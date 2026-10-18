import { describe, expect, it } from 'vitest';
import { dgBetSummary } from '../lib/dg-bet-summary';
import type { DgBet } from '../lib/dg-bet-ledger';
const bet = (tableId: string, state: DgBet['state'], extra: Partial<DgBet> = {}): DgBet => ({ key: `${tableId}:1`, tableId, gameNo: '1', side: '莊', amount: 100, level: 0, scope: 'table', createdAt: 1, state, ...extra });
const names = { '1': 'S03', '2': 'S05', '3': 'RB04' };
describe('DG display-only multiple table summaries', () => {
  it('lists every accepted pending table without claiming submitted success', () => {
    const rows = [bet('1', 'accepted', { acceptedAt: 10 }), bet('2', 'accepted', { acceptedAt: 11 }), bet('3', 'submitted')];
    const saved = JSON.stringify(rows), out = dgBetSummary(rows, names);
    expect(out.waiting).toBe('S03 · S05'); expect(out.confirming).toBe('RB04');
    expect(out.success).toBe('S05｜100'); expect(JSON.stringify(rows)).toBe(saved);
  });
  it('removes settled tables from waiting while retaining their accepted success', () => {
    const out = dgBetSummary([bet('1', 'settled', { acceptedAt: 10, settledAt: 20 }), bet('2', 'accepted', { acceptedAt: 11 })], names);
    expect(out.waiting).toBe('S05'); expect(out.success).toBe('S05｜100');
  });
  it('never labels rejected, uncertain, or mixed manual bets as successful', () => {
    const out = dgBetSummary([bet('1', 'rejected'), bet('2', 'uncertain', { acceptedAt: 10 }), bet('3', 'accepted', { acceptedAt: 11, attributionUncertain: true })], names);
    expect(out.success).toBe(''); expect(out.waiting).toBe(''); expect(out.uncertain).toBe('S05 · RB04');
  });
  it('keeps only the latest accepted table/amount without side or old rows', () => {
    const out = dgBetSummary([bet('1', 'settled', { acceptedAt: 10 }), bet('1', 'accepted', { acceptedAt: 20, gameNo: '2', side: '閒', amount: 300 })], names);
    expect(out.success).toBe('S03｜300'); expect(out.waiting).toBe('S03');
  });
  it('excludes earlier completed runs but keeps accepted pending bets when resuming', () => {
    const out = dgBetSummary([bet('1', 'settled', { acceptedAt: 10 }), bet('2', 'accepted', { acceptedAt: 10 }), bet('3', 'settled', { acceptedAt: 30 })], names, 20);
    expect(out.success).toBe('RB04｜100');
  });
  it('keeps all-table waiting list but only one current success without a new line', () => {
    const rows = Array.from({ length: 25 }, (_, i) => bet(String(i), 'accepted', { acceptedAt: 10 }));
    const out = dgBetSummary(rows, {});
    expect(out.waiting.split(' · ')).toHaveLength(25); expect(out.success).toBe('24｜100'); expect(out.success).not.toMatch(/[\r\n]/);
  });
});
