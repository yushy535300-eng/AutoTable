import { describe, expect, it } from 'vitest';
import { createDgUsageHistory, usageHistoryInPeriod } from '../lib/dg-usage-history';
import type { DgBet } from '../lib/dg-bet-ledger';
const bet = (key: string, state: DgBet['state'], pnl?: number) => ({ key, state, pnl } as DgBet);

describe('DG usage history', () => {
  it('includes stopped usage records in Taipei date ranges', () => {
    const now = Date.parse('2026-10-15T12:00:00Z');
    const rows = [{createdAt:now, state:'stopped'}, {createdAt:now-86400000, state:'interrupted'}];
    expect(usageHistoryInPeriod(rows,'today',now)).toEqual([rows[0]]);
    expect(usageHistoryInPeriod(rows,'yesterday',now)).toEqual([rows[1]]);
    expect(usageHistoryInPeriod(rows,'week',now)).toHaveLength(2);
  });
  it('starts each run at zero and freezes the previous duration', () => {
    let now = 1000; const h = createDgUsageHistory(() => now);
    h.begin(3); now += 65000; h.updateElapsed(65000); h.finish(65000);
    h.begin(5);
    expect(h.view()[0].elapsedText).toBe('00:00:00');
    expect(h.view()[1].elapsedText).toBe('00:01:05');
    expect(h.view()[1].state).toBe('stopped');
  });
  it('late official settlement updates the old run, not the newly active run', () => {
    const h = createDgUsageHistory(); h.begin(1); h.addBet(bet('S03:old', 'accepted')); h.finish(60000);
    h.begin(2); h.addBet(bet('S06:new', 'accepted'));
    h.sync([bet('S03:old', 'settled', 100), bet('S06:new', 'accepted')]);
    const [current, previous] = h.view();
    expect(previous.pnl).toBe(100); expect(previous.pendingCount).toBe(0); expect(previous.wins).toBe(1);
    expect(current.pnl).toBe(0); expect(current.pendingCount).toBe(1);
    h.sync([bet('S03:old', 'settled', 100), bet('S06:new', 'settled', -100)]);
    expect(h.view()[0].pnl).toBe(-100); expect(h.view()[1].pnl).toBe(100);
  });
  it('never considers uncertain or pending wagers settled winnings', () => {
    const h = createDgUsageHistory(); h.begin(0);
    for (const b of [bet('a','uncertain',500),bet('b','accepted',200),bet('c','rejected',100)]) h.addBet(b);
    h.sync([bet('a','uncertain',500),bet('b','accepted',200),bet('c','rejected',100)]);
    expect(h.view()[0]).toMatchObject({pnl:0,uncertainCount:1,pendingCount:1,settledCount:0});
  });
  it('restores browser history without auto-resuming or adding closed-page time', () => {
    const h = createDgUsageHistory(() => 1000); h.begin(10); h.updateElapsed(4000); h.addBet(bet('a','accepted'));
    const restored = createDgUsageHistory(() => 999999); restored.load(h.snapshot());
    expect(restored.view()[0]).toMatchObject({state:'interrupted',elapsedMs:4000,pendingCount:1});
    restored.begin(2); expect(restored.view()[0].elapsedMs).toBe(0);
    restored.sync([bet('a','settled',95)]); expect(restored.view()[1].pnl).toBe(95);
  });
  it('keeps past verified results when the current ledger no longer contains that order', () => {
    const h = createDgUsageHistory(); h.begin(0); h.addBet(bet('a','accepted'));
    h.sync([bet('a','settled',100)]); h.finish(1000);
    const restored = createDgUsageHistory(); restored.load(h.snapshot()); restored.sync([]);
    expect(restored.view()[0].pnl).toBe(100);
  });
  it('does not duplicate a wager or reset an active run on repeated start', () => {
    const h = createDgUsageHistory(); h.begin(0); h.addBet(bet('a','accepted'));
    expect(() => h.begin(0)).toThrow('前次使用尚未停止');
    h.finish(1000); h.begin(0); h.addBet(bet('a','accepted'));
    expect(h.view()[0].pendingCount).toBe(0); expect(h.view()[1].pendingCount).toBe(1);
  });
  it('ignores broken saved data', () => {
    const h = createDgUsageHistory(); h.load({version:1,runs:[null,{id:'bad',createdAt:NaN}]}); expect(h.view()).toEqual([]);
  });
});
