import { describe, expect, it } from 'vitest';
import { DgManualLedger, dgManualStake } from '../lib/dg-manual-ledger';
import { nextStakeRiskCheck } from '../lib/dg-risk-limits';

const sent = (gameNo = 'r1', bet: unknown = { banker6: 100 }) => ({ cmd: 6, tableId: 'T01', gameNo, bet });
const accepted = (gameNo = 'r1', bet: unknown = { banker6: 100 }) => ({ cmd: 6, tableId: 'T01', gameNo, codeId: 0, list: [JSON.stringify(bet)] });
const settled = (gameNo = 'r1', pnl = -100) => ({ cmd: 1007, tableId: 'T01', gameNo, codeId: 0, dList: [0, pnl] });

describe('DG 人工原生下注觀察帳本', () => {
  it('接受前不計損益，僅相符接受與 1007 結算才更新，重複結算不重算', () => {
    const ledger = new DgManualLedger();
    const observed = ledger.observeSent(sent());
    expect(observed).toMatchObject({ created: true, unknown: false });
    expect(ledger.roundPnl()).toBe(0);
    expect(ledger.receipt(accepted())).toMatchObject({ accepted: true });
    expect(ledger.roundPnl()).toBe(0);
    expect(ledger.settle(settled())).toMatchObject({ pnl: -100 });
    expect(ledger.roundPnl()).toBe(-100);
    expect(ledger.settle(settled())).toBeNull();
    expect(ledger.roundPnl()).toBe(-100);
  });

  it('1007 先到只暫存於記憶體；相符 cmd 6 接受後才結算，重載不採用暫存值', () => {
    const ledger = new DgManualLedger();
    ledger.observeSent(sent('out-of-order'));
    expect(ledger.settle(settled('out-of-order', 95))).toMatchObject({ staged: true });
    expect(ledger.roundPnl()).toBe(0);
    expect(ledger.receipt(accepted('out-of-order'))).toMatchObject({ accepted: true, settled: true, pnl: 95 });
    expect(ledger.roundPnl()).toBe(95);

    const reloaded = new DgManualLedger();
    reloaded.observeSent(sent('reload-before-receipt'));
    reloaded.settle(settled('reload-before-receipt', 95));
    const restored = new DgManualLedger(reloaded.snapshot());
    restored.markReloadUnresolved();
    expect(restored.receipt(accepted('reload-before-receipt'))).toMatchObject({ accepted: true });
    expect(restored.state.bets[0]).toMatchObject({ state: 'accepted' });
    expect(restored.roundPnl()).toBe(0);
  });

  it('原生送出重複封包去重；同局不同封包改為未知，絕不拆算損益', () => {
    const ledger = new DgManualLedger();
    ledger.observeSent(sent('same'));
    expect(ledger.observeSent(sent('same'))).toMatchObject({ duplicate: true, unknown: true });
    expect(ledger.state.bets).toHaveLength(1);
    expect(ledger.observeSent(sent('same', { banker6: 200 }))).toMatchObject({ unknown: true });
    expect(ledger.state.bets[0]).toMatchObject({ state: 'unknown', attributionUncertain: true });
    expect(ledger.receipt(accepted('same', { banker6: 200 }))).toMatchObject({ accepted: false });
    expect(ledger.settle(settled('same', -200))).toBeNull();
    expect(ledger.roundPnl()).toBe(0);
  });

  it('不解析的人工封包維持未知並封鎖自動風險前檢，不用餘額或結算猜損益', () => {
    const ledger = new DgManualLedger();
    ledger.observeSent(sent('opaque', { signedBody: 'opaque' }));
    expect(ledger.state.bets[0]).toMatchObject({ amount: null, state: 'unknown' });
    expect(ledger.riskExposure()).toMatchObject({ known: [], unknownCount: 1 });
    expect(ledger.settle(settled('opaque', -999))).toBeNull();
    expect(ledger.roundPnl()).toBe(0);
    expect(() => nextStakeRiskCheck(ledger.roundPnl(), { stopLoss: 2600, takeProfit: null }, ledger.riskExposure().known, 100)).not.toThrow();
  });

  it('已知人工 pending 成為止損曝險；fresh round 不會丟棄未結算人工單', () => {
    const ledger = new DgManualLedger();
    ledger.observeSent(sent('pending'));
    ledger.receipt(accepted('pending'));
    expect(ledger.riskExposure().known).toEqual([{ key: 'manual:T01:pending', amount: 100 }]);
    expect(nextStakeRiskCheck(0, { stopLoss: 150, takeProfit: null }, ledger.riskExposure().known, 100).ok).toBe(false);
    const before = ledger.state.roundId;
    ledger.beginRound(12345);
    expect(ledger.state.roundId).not.toBe(before);
    expect(ledger.state.bets[0].roundId).toBe(ledger.state.roundId);
    const restored = new DgManualLedger(ledger.snapshot());
    restored.markReloadUnresolved();
    expect(restored.pending()).toHaveLength(1);
    expect(restored.settle(settled('pending', -100))).toMatchObject({ pnl: -100 });
    expect(restored.roundPnl()).toBe(-100);
  });

  it('只接受白名單下注欄位，且可由相符的原生接受回覆補足初始 opaque 送出', () => {
    expect(dgManualStake({ bet: { banker6: 100, token: 'must-not-be-read' } })).toMatchObject({ amount: 100, side: '莊' });
    expect(dgManualStake({ bet: { banker6: 100.5 } })).toBeNull();
    const ledger = new DgManualLedger();
    ledger.observeSent(sent('late-receipt', { encrypted: 'x' }));
    expect(ledger.receipt(accepted('late-receipt'))).toMatchObject({ accepted: true });
    expect(ledger.settle(settled('late-receipt', 95))).toMatchObject({ pnl: 95 });
  });
});

 it('same amount on a different side is not a matching acceptance',()=>{const ledger=new DgManualLedger();ledger.observeSent(sent());expect(ledger.receipt(accepted('r1',{player:100}))).toMatchObject({accepted:false});expect(ledger.settle(settled())).toBeNull();});

 it('known amount with an unmatched receipt becomes unknown exposure, not an assumed known reserve',()=>{const ledger=new DgManualLedger();ledger.observeSent(sent());ledger.receipt(accepted('r1',{player:100}));expect(ledger.riskExposure()).toEqual({known:[],unknownCount:1});});

 it('不符接受回覆清除早到結算；後來接受需新的正式結算',()=>{const ledger=new DgManualLedger();ledger.observeSent(sent());ledger.settle(settled('r1',95));expect(ledger.receipt(accepted('r1',{player:100}))).toMatchObject({accepted:false});expect(ledger.receipt(accepted())).toMatchObject({accepted:true});expect(ledger.roundPnl()).toBe(0);expect(ledger.pending()).toHaveLength(1);expect(ledger.settle(settled('r1',95))).toMatchObject({pnl:95});expect(ledger.roundPnl()).toBe(95);});
