// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDgOfficialTurnover,
  DG_OFFICIAL_REFRESH_MS,
  DG_OFFICIAL_TIMEOUT_MS,
} from "../lib/dg-official-turnover";

type Bean = Record<string, unknown>;

class FakeSocket {
  sent: Bean[] = [];
  private listener: ((bean: Bean) => void) | null = null;
  sendData = (bean: Bean) => { this.sent.push(bean); };
  on(event: string, _owner: unknown, listener: (bean: Bean) => void) {
    if (event === "RECEIVED_SUCCESS") this.listener = listener;
  }
  off(event: string, _owner: unknown, listener: (bean: Bean) => void) {
    if (event === "RECEIVED_SUCCESS" && this.listener === listener) this.listener = null;
  }
  reply(bean: Bean) { this.listener?.(bean); }
}

class LifecycleSocket extends FakeSocket {
  socket = { connected: true };
  handlers = new Map<string, Set<(bean: Bean) => void>>();
  override on(event: string, owner: unknown, listener: (bean: Bean) => void) {
    super.on(event, owner, listener);
    const listeners = this.handlers.get(event) ?? new Set();
    listeners.add(listener); this.handlers.set(event, listeners);
  }
  override off(event: string, owner: unknown, listener: (bean: Bean) => void) {
    super.off(event, owner, listener);
    this.handlers.get(event)?.delete(listener);
  }
  emit(event: string) {
    for (const listener of [...(this.handlers.get(event) ?? [])]) listener({});
  }
}

function reply(valid: unknown, patch: Bean = {}): Bean {
  return {
    cmd: 13, codeId: 0, type: 1, lobbyId: 0, tableId: 0,
    list: ["", "", "12", "1"], dList: [999, valid, -1],
    object: JSON.stringify({ records: [], pageNow: 1, pageCount: 0, pageSize: 12, rowCount: 0 }),
    ...patch,
  };
}

function host(socket: FakeSocket, token: unknown = "session-token") {
  const playerInfo = { token, socketMan: socket };
  const leaf = { playerInfo };
  return { Laya: { stage: { numChildren: 1, getChildAt: () => leaf } } };
}

afterEach(() => { vi.useRealTimers(); });

describe("DG official turnover", () => {
  it("uses the native all-lobby report shape, reads dList[1], and retains an official zero", () => {
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    expect(socket.sent[0]).toMatchObject({ cmd: 13, type: 1, token: "session-token", object: "1", list: ["", "", "12", "1"] });
    socket.reply(reply(0));
    expect(socket.sent[1]).toMatchObject({ cmd: 13, type: 1, object: "7", list: ["", "", "12", "1"] });
    socket.reply(reply("42.50"));
    const view = reader.view();
    expect(view.platform).toBe("DG");
    expect(view.today.value).toBe(0);
    expect(view.week.value).toBe(42.5);
    expect(view.today.scope).toContain("dList[1]");
    expect(view.week.range).toContain("timeSpan=7");
    reader.dispose();
  });

  it("rejects both overlapping report replies regardless of response order, then allows an isolated refresh", () => {
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    socket.sendData({cmd:13,type:1,object:"2",list:["","","12","1"]});
    expect(socket.sent).toHaveLength(2);
    socket.reply(reply(999));
    expect(reader.view().today.value).toBeNull();
    expect(reader.view().week.value).toBeNull();
    reader.refresh(true);
    expect(socket.sent).toHaveLength(2);
    socket.reply(reply(10));
    reader.refresh(true);
    expect(socket.sent).toHaveLength(3);
    socket.reply(reply(20));
    socket.reply(reply(30));
    expect(reader.view().today.value).toBe(20);
    expect(reader.view().week.value).toBe(30);
    reader.dispose();
  });

  it("does not query a new native player socket under a stale supplied account reference", () => {
    const original=new FakeSocket(),next=new FakeSocket();
    const oldPlayer={token:"old-offline-token",socketMan:original};
    let current=oldPlayer;
    const W={Laya:{stage:{numChildren:1,getChildAt:()=>({playerInfo:current})}}};
    const reader=createDgOfficialTurnover(W,()=>oldPlayer);
    reader.refresh(true);original.reply(reply(10));original.reply(reply(20));
    current={token:"new-offline-token",socketMan:next};
    reader.refresh(true);
    expect(next.sent).toHaveLength(0);
    expect(reader.view().today.value).toBeNull();
    expect(reader.view().week.value).toBeNull();
    expect(reader.view().today.status).toContain("工作階段已變更");
    reader.dispose();
  });

  it("turns errors, missing report fields, and blank official amounts into null rather than zero", () => {
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    socket.reply(reply("", { codeId: 3 }));
    socket.reply(reply("", { object: JSON.stringify({ records: [] }) }));
    const view = reader.view();
    expect(view.today.value).toBeNull();
    expect(view.week.value).toBeNull();
    expect(view.today.updatedAt).toBeNull();
    expect(view.week.updatedAt).toBeNull();
    reader.dispose();
  });

  it("does not send until the live Laya scene has a native SocketMan", () => {
    const socket = new FakeSocket();
    const W: any = { Laya: { stage: { numChildren: 0, getChildAt: () => undefined } } };
    const reader = createDgOfficialTurnover(W, () => "account-a");
    reader.refresh(true);
    expect(reader.view().today.status).toContain("待DG官方報表就緒");
    W.Laya.stage = host(socket).Laya.stage;
    reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    reader.dispose();
  });

  it("clears both values on account or Taipei-day change instead of showing stale totals", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T15:50:00.000Z")); // 23:50 Taipei
    const socket = new FakeSocket();
    let account = "account-a";
    const reader = createDgOfficialTurnover(host(socket), () => account);
    reader.refresh(true);
    socket.reply(reply(11));
    socket.reply(reply(22));
    expect(reader.view().today.value).toBe(11);
    account = "account-b";
    expect(reader.view().today.value).toBeNull();
    expect(reader.view().week.value).toBeNull();
    reader.refresh(true);
    socket.reply(reply(33));
    socket.reply(reply(44));
    expect(reader.view().today.value).toBe(33);
    vi.setSystemTime(new Date("2026-10-14T16:01:00.000Z")); // next Taipei day
    const changedDay = reader.view();
    expect(changedDay.today.value).toBeNull();
    expect(changedDay.week.value).toBeNull();
    expect(changedDay.today.status).toBe("待同步官方報表");
    reader.dispose();
  });

  it("fails closed after timeout, including force refresh, until its late binding has been reconciled", () => {
    vi.useFakeTimers();
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    vi.advanceTimersByTime(DG_OFFICIAL_TIMEOUT_MS);
    expect(reader.view().today.value).toBeNull();
    expect(reader.view().today.status).toContain("逾時");
    vi.advanceTimersByTime(DG_OFFICIAL_REFRESH_MS * 2);
    expect(socket.sent).toHaveLength(1);
    reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    socket.reply(reply(999));
    expect(reader.view().today.value).toBeNull();
    reader.refresh(true);
    expect(socket.sent).toHaveLength(2);
    reader.dispose();
  });

  it("accepts an attributable slower official reply instead of timing out at ten seconds", () => {
    vi.useFakeTimers();
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    vi.advanceTimersByTime(12_000);
    expect(socket.sent).toHaveLength(1);
    expect(reader.view().today.status).toContain("已等待12秒");
    socket.reply(reply(1234));
    expect(socket.sent).toHaveLength(2);
    socket.reply(reply(5678));
    expect(reader.view().today.value).toBe(1234);
    expect(reader.view().week.value).toBe(5678);
    reader.dispose();
  });

  it("starts one fresh cycle immediately after the known timeout reply retires, without displaying its late value", () => {
    vi.useFakeTimers();
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    vi.advanceTimersByTime(DG_OFFICIAL_TIMEOUT_MS);
    for (let i = 0; i < 5; i++) reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    socket.reply(reply(999));
    expect(reader.view().today.value).toBeNull();
    vi.advanceTimersByTime(250);
    expect(socket.sent).toHaveLength(2);
    socket.reply(reply(25));
    socket.reply(reply(35));
    expect(reader.view().today.value).toBe(25);
    expect(reader.view().week.value).toBe(35);
    reader.dispose();
  });

  it("coalesces refreshes received during an in-flight cycle rather than ignoring them or flooding requests", () => {
    vi.useFakeTimers();
    const socket = new FakeSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    for (let i = 0; i < 20; i++) reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    socket.reply(reply(1));
    socket.reply(reply(2));
    vi.advanceTimersByTime(250);
    expect(socket.sent).toHaveLength(3);
    socket.reply(reply(3));
    socket.reply(reply(4));
    vi.advanceTimersByTime(1000);
    expect(socket.sent).toHaveLength(4);
    expect(reader.view().today.value).toBe(3);
    expect(reader.view().week.value).toBe(4);
    reader.dispose();
  });

  it("waits through the wager critical section then sends the queued remaining period promptly", () => {
    vi.useFakeTimers();
    const socket = new FakeSocket();
    let canRefresh = true;
    const reader = createDgOfficialTurnover(host(socket), () => "account-a", () => canRefresh);
    reader.refresh(true);
    canRefresh = false;
    socket.reply(reply(10));
    expect(socket.sent).toHaveLength(1);
    canRefresh = true;
    vi.advanceTimersByTime(1000);
    expect(socket.sent).toHaveLength(2);
    socket.reply(reply(20));
    expect(reader.view().today.value).toBe(10);
    expect(reader.view().week.value).toBe(20);
    reader.dispose();
  });

  it("recovers after a verified close and open on the same manager, without old listeners or outer wrappers duplicating bindings", () => {
    vi.useFakeTimers();
    const socket = new LifecycleSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    const oldListener = [...socket.handlers.get("RECEIVED_SUCCESS")!][0];
    const innerObserver = socket.sendData;
    socket.sendData = (bean: Bean) => innerObserver(bean);
    vi.advanceTimersByTime(DG_OFFICIAL_TIMEOUT_MS);
    socket.socket.connected = false; socket.emit("CONNECT_CLOSED");
    reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    socket.socket.connected = true; socket.emit("CONNECT_SUCCESS");
    vi.advanceTimersByTime(250);
    expect(socket.sent).toHaveLength(2);
    oldListener(reply(999));
    expect(reader.view().today.value).toBeNull();
    socket.reply(reply(17)); socket.reply(reply(29));
    expect(reader.view().today.value).toBe(17);
    expect(reader.view().week.value).toBe(29);
    expect(socket.sent).toHaveLength(3);
    expect(socket.sent.every(bean => !("transportEpoch" in bean))).toBe(true);
    reader.dispose();
    expect([...socket.handlers.values()].every(set => set.size === 0)).toBe(true);
  });

  it("detects a distinct native socket before the old timeout gate and ignores queued old callbacks", () => {
    vi.useFakeTimers();
    const socket = new LifecycleSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    const oldListener = [...socket.handlers.get("RECEIVED_SUCCESS")!][0];
    vi.advanceTimersByTime(DG_OFFICIAL_TIMEOUT_MS);
    socket.socket = { connected: true };
    vi.advanceTimersByTime(1000);
    expect(socket.sent).toHaveLength(2);
    oldListener(reply(999));
    socket.reply(reply(18)); socket.reply(reply(30));
    expect(reader.view().today.value).toBe(18);
    expect(reader.view().week.value).toBe(30);
    reader.dispose();
  });

  it("does not reset an active request merely for duplicate open events or transient errors on a live transport", () => {
    const socket = new LifecycleSocket();
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    socket.emit("CONNECT_SUCCESS"); socket.emit("CONNECT_FAILED");
    reader.refresh(true);
    expect(socket.sent).toHaveLength(1);
    socket.reply(reply(15)); socket.reply(reply(25));
    expect(reader.view().today.value).toBe(15);
    expect(reader.view().week.value).toBe(25);
    reader.dispose();
  });

  it("keeps the attribution lock if a different manager aliases the same native socket", () => {
    vi.useFakeTimers();
    const original = new LifecycleSocket(), alias = new LifecycleSocket();
    alias.socket = original.socket;
    let current = original;
    const W = { Laya: { stage: { numChildren: 1, getChildAt: () => ({ playerInfo: { token: "anonymous", socketMan: current } }) } } };
    const reader = createDgOfficialTurnover(W, () => "account-a");
    reader.refresh(true);
    vi.advanceTimersByTime(DG_OFFICIAL_TIMEOUT_MS);
    current = alias;
    reader.refresh(true);
    expect(original.sent).toHaveLength(1);
    expect(alias.sent).toHaveLength(0);
    alias.reply(reply(999));
    vi.advanceTimersByTime(250);
    expect(alias.sent).toHaveLength(1);
    alias.reply(reply(14)); alias.reply(reply(24));
    expect(reader.view().today.value).toBe(14);
    expect(reader.view().week.value).toBe(24);
    reader.dispose();
  });

  it("restores only its own sendData layer and leaves an outer observer intact", () => {
    const socket = new FakeSocket();
    const first = socket.sendData;
    const preexisting = vi.fn((bean: Bean) => first(bean));
    socket.sendData = preexisting;
    const reader = createDgOfficialTurnover(host(socket), () => "account-a");
    reader.refresh(true);
    expect(preexisting).toHaveBeenCalledTimes(1);
    const moduleHook = socket.sendData;
    const outer = vi.fn((bean: Bean) => moduleHook(bean));
    socket.sendData = outer;
    reader.dispose();
    expect(socket.sendData).toBe(outer);
    socket.sendData({ cmd: 1 });
    expect(preexisting).toHaveBeenCalledTimes(2);
    expect(outer).toHaveBeenCalledTimes(1);
  });
  it("retries first synchronization within one second after a late native scene becomes ready", () => {
    vi.useFakeTimers();
    const socket=new FakeSocket(), W:any={Laya:{stage:{numChildren:0,getChildAt:()=>undefined}}};
    const reader=createDgOfficialTurnover(W,()=>"account-a");
    reader.refresh(true);expect(socket.sent).toHaveLength(0);
    W.Laya.stage=host(socket).Laya.stage;
    vi.advanceTimersByTime(1000);expect(socket.sent).toHaveLength(1);
    socket.reply(reply(3990,{list:[]}));socket.reply(reply(6535,{list:[]}));
    expect(reader.view().today.value).toBe(3990);expect(reader.view().week.value).toBe(6535);
    vi.advanceTimersByTime(5000);expect(socket.sent).toHaveLength(2);
    reader.dispose();
  });

});
