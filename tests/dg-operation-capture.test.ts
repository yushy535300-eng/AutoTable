import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDgOperationCapture, summarizeDgCaptureBean } from '../lib/dg-operation-capture';
import { describeDgScene, readDgSceneNodes, findDgScenePlayer, dgSceneWallet } from '../lib/dg-scene';

function fixture(cards: any[] = []) {
  const handlers = new Map<string, Array<{ owner: any; fn: (...args: any[]) => any }>>();
  const bus = () => ({
    on(name: string, owner: any, fn: any) { handlers.set(name, [...(handlers.get(name) || []), { owner, fn }]); },
    off(name: string, owner: any, fn: any) { handlers.set(name, (handlers.get(name) || []).filter(value => value.owner !== owner || value.fn !== fn)); },
    emit(name: string, value: any) { for (const handler of handlers.get(name) || []) handler.fn(value); },
  });
  const send = vi.fn(function(this: any, value: any, ...args: any[]) { return { self: this, value, args }; });
  const socket = { ...bus(), socket: { connected: true }, sendData: send };
  const player = { balance: 20811.6, selectChip: 100, token: 'SECRET-TOKEN', playerName: 'PRIVATE-NAME', socketMan: socket };
  const controller = { playerInfo: player, currentView: { viewName: 'GameLobby' }, _children: cards };
  const stage = { ...bus(), _children: [controller], width: 1366, height: 768, scaleMode: 'showall' };
  const W: any = { Laya: { stage, Event: { CLICK: 'click' } }, innerWidth: 390, innerHeight: 760,
    document: { location: { origin: 'https://app.example', href: 'https://app.example/ddnewpc/?token=SECRET-TOKEN' }, scripts: [], querySelector: () => null },
    __DG_SINGLEPAGE__: { stop: vi.fn() } };
  let tick: (() => void) | null = null;
  const outer: any = { innerWidth: 390, innerHeight: 844,
    setInterval: vi.fn((fn: () => void) => { tick = fn; return 1; }), clearInterval: vi.fn() };
  return { W, outer, socket, send, player, stage, poll: () => tick?.() };
}

afterEach(() => vi.useRealTimers());
describe('DG manual mobile diagnostic recorder', () => {
  it('observes user-native sends without creating sends, preserves this/arguments/return and exports no raw credentials', () => {
    const f = fixture(); const recorder = createDgOperationCapture(f.W, f.outer);
    expect(f.send).not.toHaveBeenCalled(); expect(f.W.__DG_MANUAL_CAPTURE_ACTIVE__).toBe(true);
    const bean = { cmd: 6, tableId: 60102, gameNo: 'round-1', token: 'SECRET-TOKEN', list: ['encrypted-secret', 'PRIVATE-NAME'], cookie: 'COOKIE-SECRET' };
    const result = f.socket.sendData(bean, 'extra');
    expect(f.send).toHaveBeenCalledTimes(1); expect(result).toEqual({ self: f.socket, value: bean, args: ['extra'] });
    f.socket.emit('RECEIVED_SUCCESS', { cmd: 6, codeId: 0, tableId: 60102, gameNo: 'round-1', list: ['{"banker":100,"token":"SECRET-TOKEN"}'] });
    f.socket.emit('RECEIVED_SUCCESS', { cmd: 1007, codeId: 0, tableId: 60102, gameNo: 'round-1', dList: [20811.6, 95] });
    expect(recorder.status()).toMatchObject({ socketDetected: true, wallet: 20811.6, sent: 1, accepted: 1, settled: 1 });
    const json = JSON.stringify(recorder.report());
    for (const secret of ['SECRET-TOKEN', 'PRIVATE-NAME', 'encrypted-secret', 'COOKIE-SECRET']) expect(json).not.toContain(secret);
    expect(json).toContain('betAmounts'); expect(json).toContain('"pnl":95');
    recorder.stop(); expect(f.W.__DG_MANUAL_CAPTURE_ACTIVE__).toBe(false); expect(f.socket.sendData).toBe(f.send);
    const count = recorder.report().events.length; f.socket.emit('RECEIVED_SUCCESS', { cmd: 6 }); f.poll();
    expect(recorder.report().events).toHaveLength(count); expect(f.outer.clearInterval).toHaveBeenCalledWith(1);
  });
  it('records native click metadata without executing any wager and handles unknown controls', () => {
    const f = fixture(), recorder = createDgOperationCapture(f.W, f.outer);
    f.stage.emit('click', { target: { buttonName: 'MultiLobby' } });
    f.stage.emit('click', { target: { buttonName: 'SECRET-TOKEN' } });
    expect(recorder.report().events.filter(event => event.kind === 'native-click').map(event => event.data)).toEqual([
      { control: 'MultiLobby', selectedChip: 100 }, { control: 'unclassified', selectedChip: 100 },
    ]); expect(f.send).not.toHaveBeenCalled(); recorder.stop();
  });
  it('stops and detaches after five minutes, without restarting automatic actions', () => {
    vi.useFakeTimers(); vi.setSystemTime(0);
    const f = fixture(), recorder = createDgOperationCapture(f.W, f.outer);
    vi.setSystemTime(300000); f.poll(); expect(recorder.active()).toBe(false);
    expect(f.W.__DG_MANUAL_CAPTURE_ACTIVE__).toBe(false); expect(f.send).not.toHaveBeenCalled();
  });
  it('reads wallet on a native controller with no betting cards and supports backing display children', () => {
    const f = fixture(), nodes = readDgSceneNodes(f.W.Laya.stage);
    expect(findDgScenePlayer(nodes)).toBe(f.player); expect(dgSceneWallet(f.player)).toBe(20811.6);
    expect(describeDgScene(nodes)).toMatchObject({ candidateCount: 0, walletSynced: true });
    f.player.balance = null as any; expect(dgSceneWallet(f.player)).toBeNull();
    f.player.balance = 0; expect(dgSceneWallet(f.player)).toBe(0);
    f.socket.socket.connected = false; expect(dgSceneWallet(f.player)).toBeNull();
  });
  it('exports specific missing card fields rather than guessing a builder from its screen position', () => {
    const report = describeDgScene([{ tableId: 60102, gameInfo: { tableName: 'RB02', stateId: 1, countDown: 15, roadArray: [] }, betBtn: { Banker: {} } }]);
    expect(report.candidates[0].missing).toContain('Player'); expect(report.candidates[0].missing).toContain('confirmBet');
    expect(report.candidates[0].missing).toContain('socket');
  });
  it('can export collected data after game access becomes unavailable and clears its interval', () => {
    const f = fixture(), recorder = createDgOperationCapture(f.W, f.outer);
    Object.defineProperty(f.W, 'document', { get() { throw new Error('frame unavailable'); } });
    f.poll(); recorder.stop();
    expect(() => recorder.report()).not.toThrow();
    expect(recorder.report().recording).toBe(false);
    expect(f.outer.clearInterval).toHaveBeenCalledWith(1);
    expect(f.send).not.toHaveBeenCalled();
  });
  it('cleans a failed initialization without leaving the automatic pause flag stuck', () => {
    const f = fixture(); f.W.Laya.stage.on = () => { throw new Error('detached native stage'); };
    expect(() => createDgOperationCapture(f.W, f.outer)).toThrow();
    expect(f.W.__DG_MANUAL_CAPTURE_ACTIVE__).toBe(false);
    expect(f.send).not.toHaveBeenCalled();
  });
  it('does not report an unbound or amount-less receipt as acceptance and does not equate a click to success', () => {
    const f = fixture(), recorder = createDgOperationCapture(f.W, f.outer);
    f.stage.emit('click', { target: { buttonName: 'Banker' } });
    f.socket.emit('RECEIVED_SUCCESS', { cmd: 6, codeId: 0, tableId: 60102, gameNo: 'not-sent', list: ['{"banker":100}'] });
    f.socket.sendData({ cmd: 6, tableId: 60102, gameNo: 'one' });
    f.socket.emit('RECEIVED_SUCCESS', { cmd: 6, codeId: 0, tableId: 60102, gameNo: 'one', list: ['encrypted'] });
    f.socket.emit('RECEIVED_SUCCESS', { cmd: 1007, codeId: 0, tableId: 60102, gameNo: 'one', dList: [0, 95] });
    expect(recorder.status()).toMatchObject({ directionClick: true, sent: 1, accepted: 0, settled: 0 });
    recorder.stop();
  });
  it('keeps only a finite metadata whitelist and does not turn unknown fields into zero values', () => {
    expect(summarizeDgCaptureBean({ cmd: 6, codeId: NaN, gameNo: '?token=secret', raw: 'private', token: 'secret' })).toEqual({ cmd: 6 });
  });
});
