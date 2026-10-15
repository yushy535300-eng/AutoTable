import type { DgBet } from './dg-bet-ledger';
import { formatDuration } from './dg-session-timer';

type Entry = { state: DgBet['state']; pnl: number | null };
export interface DgUsageRun {
  id: string;
  createdAt: number;
  endedAt: number | null;
  updatedAt: number;
  elapsedMs: number;
  minutes: number;
  state: 'active' | 'stopped' | 'interrupted';
  bets: Record<string, Entry>;
}
const states = new Set(['reserved', 'submitted', 'accepted', 'settled', 'uncertain', 'rejected', 'aborted']);

export function usageHistoryInPeriod<T extends { createdAt: number }>(rows: T[], period: 'today' | 'yesterday' | 'week', now = Date.now()): T[] {
  const day = 86400000, offset = 28800000, start = Math.floor((now + offset) / day) * day - offset;
  const from = period === 'yesterday' ? start - day : period === 'week' ? start - 6 * day : start;
  const until = period === 'yesterday' ? start : start + day;
  return rows.filter(row => row.createdAt >= from && row.createdAt < until);
}

/** Usage accounting only. Never changes a bet, stake level, or platform balance. */
export function createDgUsageHistory(now = () => Date.now()) {
  let runs: DgUsageRun[] = [];
  let activeId: string | null = null;
  function active() { return runs.find(run => run.id === activeId); }
  return {
    load(value: unknown) {
      runs = []; activeId = null;
      const saved = value as { version?: number; runs?: unknown[] } | null;
      if (saved?.version !== 1 || !Array.isArray(saved.runs)) return;
      const owners = new Set<string>();
      const ids = new Set<string>();
      for (const value of saved.runs) {
        const r = value as DgUsageRun;
        if (!r || typeof r.id !== 'string' || ids.has(r.id) || !Number.isFinite(r.createdAt) ||
            !Number.isFinite(r.elapsedMs) || r.elapsedMs < 0 || !Number.isFinite(r.updatedAt) ||
            !Number.isSafeInteger(r.minutes) || r.minutes < 0 || !['active', 'stopped', 'interrupted'].includes(r.state)) continue;
        const bets: Record<string, Entry> = Object.create(null);
        if (r.bets && typeof r.bets === 'object') for (const [key, b] of Object.entries(r.bets)) {
          if (owners.has(key) || !b || !states.has(b.state)) continue;
          bets[key] = { state: b.state, pnl: b.state === 'settled' && Number.isFinite(b.pnl) ? b.pnl : null };
          owners.add(key);
        }
        ids.add(r.id);
        runs.push({ id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt,
          endedAt: r.state === 'active' ? r.updatedAt : Number.isFinite(r.endedAt) ? r.endedAt : r.updatedAt,
          elapsedMs: r.elapsedMs, minutes: r.minutes, state: r.state === 'active' ? 'interrupted' : r.state, bets });
      }
    },
    begin(minutes: number) {
      if (active()) throw new Error('前次使用尚未停止，不重設使用紀錄');
      const at = now();
      const id = globalThis.crypto?.randomUUID?.() ?? `${at}-${Math.random().toString(36).slice(2)}`;
      const run: DgUsageRun = { id, createdAt: at, endedAt: null, updatedAt: at, elapsedMs: 0, minutes, state: 'active', bets: Object.create(null) };
      runs.push(run); activeId = id;
      // Never discard a run with unresolved orders merely to enforce a history limit.
      if (runs.length > 100) {
        const disposable = runs.findIndex(r => r.id !== activeId && Object.values(r.bets).every(b => ['settled', 'rejected', 'aborted'].includes(b.state)));
        if (disposable >= 0) runs.splice(disposable, 1);
      }
      return id;
    },
    addBet(bet: DgBet) {
      if (runs.some(run => Object.prototype.hasOwnProperty.call(run.bets, bet.key))) return;
      const run = active();
      if (run) run.bets[bet.key] = { state: bet.state, pnl: null };
    },
    sync(bets: DgBet[]) {
      const byKey = new Map(bets.map(b => [b.key, b]));
      for (const run of runs) for (const [key, entry] of Object.entries(run.bets)) {
        const bet = byKey.get(key);
        if (!bet) continue; // Keep verified past results when the current ledger lacks the old order.
        entry.state = bet.state;
        entry.pnl = bet.state === 'settled' && Number.isFinite(bet.pnl) ? bet.pnl! : null;
      }
    },
    updateElapsed(elapsedMs: number) {
      const run = active();
      if (!run || !Number.isFinite(elapsedMs)) return false;
      const used = Math.max(run.elapsedMs, elapsedMs);
      if (Math.floor(used / 1000) === Math.floor(run.elapsedMs / 1000)) return false;
      run.elapsedMs = used; run.updatedAt = now(); return true;
    },
    finish(elapsedMs: number) {
      const run = active();
      if (!run) return;
      run.elapsedMs = Math.max(run.elapsedMs, Number.isFinite(elapsedMs) ? elapsedMs : 0);
      run.endedAt = now(); run.updatedAt = run.endedAt; run.state = 'stopped'; activeId = null;
    },
    view() {
      return [...runs].reverse().map(run => {
        const entries = Object.values(run.bets);
        const settled = entries.filter(b => b.state === 'settled' && b.pnl !== null);
        return { ...run, bets: Object.fromEntries(Object.entries(run.bets).map(([key,entry])=>[key,{...entry}])), elapsedText: formatDuration(run.elapsedMs),
          pnl: settled.reduce((sum, b) => sum + b.pnl!, 0), settledCount: settled.length,
          wins: settled.filter(b => b.pnl! > 0).length, losses: settled.filter(b => b.pnl! < 0).length,
          pendingCount: entries.filter(b => ['reserved', 'submitted', 'accepted'].includes(b.state)).length,
          uncertainCount: entries.filter(b => b.state === 'uncertain' || (b.state === 'settled' && b.pnl === null)).length };
      });
    },
    snapshot() { return JSON.parse(JSON.stringify({ version: 1, runs })); },
  };
}
