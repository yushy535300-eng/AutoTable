import type { DgBet } from './dg-bet-ledger';
import { formatDuration } from './dg-session-timer';
import { RISK_EVENT_ID } from '../shared/dg-risk-statement';

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
export type DgUsageEventCounts = Record<DgBet['state'], number>;
export type DgUsageRunView = DgUsageRun & {
  elapsedText: string;
  pnl: number;
  settledCount: number;
  wins: number;
  losses: number;
  pendingCount: number;
  uncertainCount: number;
  eventCounts: DgUsageEventCounts;
};
const states = new Set<DgBet['state']>(['reserved', 'submitted', 'accepted', 'settled', 'uncertain', 'rejected', 'aborted']);

/** Generate a RFC 4122 v4-shaped run ID even on older embedded browsers without randomUUID. */
export function createDgUsageRunId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === 'function') return randomUUID.call(globalThis.crypto);
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
  function viewRun(run: DgUsageRun): DgUsageRunView {
    const entries = Object.values(run.bets);
    const settled = entries.filter(entry => entry.state === 'settled' && entry.pnl !== null);
    const eventCounts: DgUsageEventCounts = {
      reserved: 0, submitted: 0, accepted: 0, settled: 0, uncertain: 0, rejected: 0, aborted: 0,
    };
    for (const entry of entries) eventCounts[entry.state]++;
    return {
      ...run,
      bets: Object.fromEntries(Object.entries(run.bets).map(([key, entry]) => [key, { ...entry }])),
      elapsedText: formatDuration(run.elapsedMs),
      pnl: settled.reduce((sum, entry) => sum + entry.pnl!, 0),
      settledCount: settled.length,
      wins: settled.filter(entry => entry.pnl! > 0).length,
      losses: settled.filter(entry => entry.pnl! < 0).length,
      pendingCount: entries.filter(entry => ['reserved', 'submitted', 'accepted'].includes(entry.state)).length,
      uncertainCount: entries.filter(entry => entry.state === 'uncertain' || (entry.state === 'settled' && entry.pnl === null)).length,
      eventCounts,
    };
  }
  return {
    load(value: unknown) {
      runs = []; activeId = null;
      const saved = value as { version?: number; runs?: unknown[] } | null;
      if (saved?.version !== 1 || !Array.isArray(saved.runs)) return;
      const owners = new Set<string>();
      const ids = new Set<string>();
      for (const value of saved.runs) {
        const r = value as DgUsageRun;
        if (!r || typeof r.id !== 'string' || !RISK_EVENT_ID.test(r.id) || ids.has(r.id) || !Number.isFinite(r.createdAt) ||
            !Number.isFinite(r.elapsedMs) || r.elapsedMs < 0 || !Number.isFinite(r.updatedAt) ||
            !Number.isSafeInteger(r.minutes) || r.minutes < 0 || !['active', 'stopped', 'interrupted'].includes(r.state)) continue;
        const bets: Record<string, Entry> = Object.create(null);
        if (r.bets && typeof r.bets === 'object') for (const [key, b] of Object.entries(r.bets)) {
          if (owners.has(key) || !b || !states.has((b as Entry).state)) continue;
          const entry = b as Entry;
          bets[key] = { state: entry.state, pnl: entry.state === 'settled' && Number.isFinite(entry.pnl) ? entry.pnl : null };
          owners.add(key);
        }
        ids.add(r.id);
        runs.push({ id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt,
          // A page rebuild does not prove a user stop. Keep the last observed duration,
          // but do not invent an end time while changing the local view to interrupted.
          endedAt: r.state === 'active' ? null : Number.isFinite(r.endedAt) ? r.endedAt : r.updatedAt,
          elapsedMs: r.elapsedMs, minutes: r.minutes, state: r.state === 'active' ? 'interrupted' : r.state, bets });
      }
    },
    begin(minutes: number, runId = createDgUsageRunId()) {
      if (active()) throw new Error('前次使用尚未停止，不重設使用紀錄');
      if (!Number.isSafeInteger(minutes) || minutes < 0 || !RISK_EVENT_ID.test(runId)) throw new Error('使用紀錄識別碼無效');
      const at = now();
      const run: DgUsageRun = { id: runId, createdAt: at, endedAt: null, updatedAt: at, elapsedMs: 0, minutes, state: 'active', bets: Object.create(null) };
      runs.push(run); activeId = runId;
      // Never discard a run with unresolved orders merely to enforce a history limit.
      if (runs.length > 100) {
        const disposable = runs.findIndex(item => item.id !== activeId && Object.values(item.bets).every(entry => ['settled', 'rejected', 'aborted'].includes(entry.state)));
        if (disposable >= 0) runs.splice(disposable, 1);
      }
      return runId;
    },
    addBet(bet: DgBet) {
      if (runs.some(run => Object.prototype.hasOwnProperty.call(run.bets, bet.key))) return;
      const run = active();
      if (run) run.bets[bet.key] = { state: bet.state, pnl: null };
    },
    sync(bets: DgBet[]) {
      const byKey = new Map(bets.map(bet => [bet.key, bet]));
      for (const run of runs) {
        let changed = false;
        for (const [key, entry] of Object.entries(run.bets)) {
          const bet = byKey.get(key);
          if (!bet) continue; // Keep verified past results when the current ledger lacks the old order.
          const pnl = bet.state === 'settled' && Number.isFinite(bet.pnl) ? bet.pnl! : null;
          if (entry.state !== bet.state || entry.pnl !== pnl) changed = true;
          entry.state = bet.state;
          entry.pnl = pnl;
        }
        // A late official settlement is a new client observation. This preserves the
        // report's monotonic timestamp without adding closed-page elapsed time.
        if (changed) run.updatedAt = Math.max(run.updatedAt, now());
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
      if (!run) return undefined;
      run.elapsedMs = Math.max(run.elapsedMs, Number.isFinite(elapsedMs) ? elapsedMs : 0);
      run.endedAt = now(); run.updatedAt = run.endedAt; run.state = 'stopped'; activeId = null;
      return run.id;
    },
    view(): DgUsageRunView[] { return [...runs].reverse().map(viewRun); },
    snapshot() { return JSON.parse(JSON.stringify({ version: 1, runs })); },
  };
}
