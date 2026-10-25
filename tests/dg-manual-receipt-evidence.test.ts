import { describe, expect, it } from 'vitest';
import { DgManualLedger } from '../lib/dg-manual-ledger';

const opaque = () => ({cmd:6,tableId:799,gameNo:'rb04-single',list:['offline-opaque']});
const accepted = () => ({cmd:6,codeId:0,tableId:799,gameNo:'rb04-single',list:[JSON.stringify({banker6:100})]});
const settled = (pnl=95) => ({cmd:1007,codeId:0,tableId:799,gameNo:'rb04-single',dList:[0,pnl]});

describe('fresh opaque manual pre-receipt evidence is never settled prematurely', () => {
  it('applies a staged real 1007 only after a matching formal receipt', () => {
    const ledger=new DgManualLedger();ledger.observeSent(opaque());
    expect(ledger.settle(settled(),true)).toMatchObject({staged:true});
    expect(ledger.roundPnl()).toBe(0);expect(ledger.pending()[0].state).toBe('unknown');expect(ledger.pending()[0].amount).toBeNull();
    expect(ledger.receipt(accepted())).toMatchObject({accepted:true,settled:true,pnl:95});
    expect(ledger.roundPnl()).toBe(95);expect(ledger.pending()).toHaveLength(0);
    expect(ledger.settle(settled(),true)).toBeNull();expect(ledger.roundPnl()).toBe(95);
  });
  it('keeps the original default unknown protection without explicit console opt-in', () => {
    const ledger=new DgManualLedger();ledger.observeSent(opaque());
    expect(ledger.settle(settled())).toBeNull();expect(ledger.roundPnl()).toBe(0);
    expect(ledger.receipt(accepted())).toMatchObject({accepted:true});expect(ledger.roundPnl()).toBe(0);expect(ledger.pending()[0].state).toBe('accepted');
  });
  it('discards staged evidence after an unverified receipt instead of reviving its result later', () => {
    const ledger=new DgManualLedger();ledger.observeSent(opaque());ledger.settle(settled(),true);
    expect(ledger.receipt({...accepted(),list:['offline-opaque-receipt']})).toMatchObject({accepted:false});
    expect(ledger.receipt(accepted())).toMatchObject({accepted:true});expect(ledger.roundPnl()).toBe(0);expect(ledger.pending()[0].state).toBe('accepted');
  });
  it('refuses conflicting staged results and repeated native sends', () => {
    for (const conflict of ['different-result','duplicate-send'] as const) {
      const ledger=new DgManualLedger();ledger.observeSent(opaque());ledger.settle(settled(),true);
      if(conflict==='different-result')expect(ledger.settle(settled(-100),true)).toMatchObject({uncertain:true});
      else ledger.observeSent(opaque());
      expect(ledger.receipt(accepted())).toMatchObject({accepted:false});expect(ledger.roundPnl()).toBe(0);expect(ledger.pending()[0].attributionUncertain).toBe(true);
    }
  });
  it('does not persist or recover unaccepted staged P/L after reload', () => {
    const ledger=new DgManualLedger();ledger.observeSent(opaque());ledger.settle(settled(),true);
    const restored=new DgManualLedger(ledger.snapshot());restored.markReloadUnresolved();
    expect(restored.receipt(accepted())).toMatchObject({accepted:true});expect(restored.roundPnl()).toBe(0);expect(restored.pending()[0].state).toBe('accepted');
  });
});
