export type DgManualState = 'sent' | 'accepted' | 'rejected' | 'unknown' | 'settled';
export type DgManualSide = '莊' | '閒' | '其他';
export type DgManualBet = {
  key: string;
  tableId: string;
  gameNo: string;
  amount: number | null;
  side: DgManualSide;
  state: DgManualState;
  createdAt: number;
  acceptedAt?: number;
  settledAt?: number;
  pnl?: number;
  /** A local run marker. Pending records are carried into a new marker, never discarded. */
  roundId: string;
  /** Only a whitelist-derived wager shape; never retain native request bodies. */
  sendSignature: string;
  attributionUncertain?: boolean;
};
export type DgManualLedgerState = { version: 1; roundId: string; bets: DgManualBet[] };

type Stake = { amount: number; side: DgManualSide; signature: string };
const betKeys = ['banker', 'banker6', 'player', 'tie', 'bPair', 'pPair'] as const;
const states = new Set<DgManualState>(['sent', 'accepted', 'rejected', 'unknown', 'settled']);
const identifiers = (value: unknown) => {
  const text = String(value ?? '');
  return /^[A-Za-z0-9_.:-]{1,96}$/.test(text) ? text : null;
};
const amount = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? value : null;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
};
const roundId = (now = Date.now()) => `manual-${now}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Read just explicit bet amount fields from a native cmd 6 bean or receipt list.
 * Encryption, account/session fields and unrecognised message bodies are never read or stored.
 */
export function dgManualStake(bean: any): Stake | null {
  const candidates: any[] = [];
  if (bean?.bet && typeof bean.bet === 'object' && !Array.isArray(bean.bet)) candidates.push(bean.bet);
  if (Array.isArray(bean?.list)) for (const value of bean.list.slice(0, 4)) {
    if (typeof value !== 'string' || value.length > 4096) continue;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) candidates.push(parsed);
    } catch { /* An encrypted/opaque member is intentionally not interpreted. */ }
  }
  for (const candidate of candidates) {
    const values = betKeys.map(key => amount(candidate[key]));
    const present = betKeys.map(key => Object.prototype.hasOwnProperty.call(candidate, key));
    if (!present.some(Boolean) || present.some((has, index) => has && values[index] === null)) continue;
    const entries = betKeys.map((key, index) => [key, values[index] ?? 0] as const);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if (!Number.isSafeInteger(total) || total <= 0) continue;
    const banker = (values[0] ?? 0) + (values[1] ?? 0), player = values[2] ?? 0;
    const others = (values[3] ?? 0) + (values[4] ?? 0) + (values[5] ?? 0);
    const side: DgManualSide = banker > 0 && player === 0 && others === 0 ? '莊' : player > 0 && banker === 0 && others === 0 ? '閒' : '其他';
    return { amount: total, side, signature: entries.map(([key, value]) => `${key}=${value}`).join('|') };
  }
  return null;
}

/**
 * Independent, observational ledger for human-operated native cmd 6 wagers.
 * It cannot submit packets, change automatic stake levels, infer P/L from balance,
 * or make records eligible for tool-usage reporting.
 */
export class DgManualLedger {
  state: DgManualLedgerState;
  // A valid 1007 can precede its cmd 6 acknowledgement on the event queue. This
  // transient evidence is never persisted: after reload it must be observed again
  // rather than being treated as a locally manufactured settlement.
  private stagedSettlements = new Map<string, { pnl: number; receivedAt: number }>();
  constructor(saved?: DgManualLedgerState) {
    const fallback: DgManualLedgerState = { version: 1, roundId: roundId(), bets: [] };
    if (!saved || saved.version !== 1 || typeof saved.roundId !== 'string' || !saved.roundId || !Array.isArray(saved.bets)) {
      this.state = fallback;
      return;
    }
    const bets: DgManualBet[] = [];
    const keys = new Set<string>();
    for (const value of saved.bets) {
      const bet = value as DgManualBet;
      const tableId = identifiers(bet?.tableId), gameNo = identifiers(bet?.gameNo);
      if (!tableId || !gameNo) continue;
      const key = `${tableId}:${gameNo}`;
      if (key !== bet?.key || keys.has(key) || !states.has(bet?.state) ||
          !Number.isFinite(bet?.createdAt) || typeof bet?.roundId !== 'string' || !bet.roundId ||
          !['莊', '閒', '其他'].includes(bet?.side) || typeof bet?.sendSignature !== 'string') continue;
      if (bet.amount !== null && (!Number.isSafeInteger(bet.amount) || bet.amount <= 0)) continue;
      if (bet.pnl !== undefined && !Number.isFinite(bet.pnl)) continue;
      const copy: DgManualBet = {
        key, tableId, gameNo, amount: bet.amount, side: bet.side, state: bet.state,
        createdAt: bet.createdAt, roundId: bet.roundId, sendSignature: bet.sendSignature,
      };
      if (Number.isFinite(bet.acceptedAt)) copy.acceptedAt = bet.acceptedAt;
      if (Number.isFinite(bet.settledAt)) copy.settledAt = bet.settledAt;
      if (Number.isFinite(bet.pnl)) copy.pnl = bet.pnl;
      if (bet.attributionUncertain) copy.attributionUncertain = true;
      bets.push(copy); keys.add(key);
    }
    this.state = { version: 1, roundId: saved.roundId, bets };
  }
  snapshot() { return JSON.parse(JSON.stringify(this.state)) as DgManualLedgerState; }
  pending() { return this.state.bets.filter(bet => ['sent', 'accepted', 'unknown'].includes(bet.state)); }
  has(key: string) { return this.state.bets.some(bet => bet.key === key); }
  get(key: string) { return this.state.bets.find(bet => bet.key === key); }
  roundBets() { return this.state.bets.filter(bet => bet.roundId === this.state.roundId && bet.state === 'settled' && Number.isFinite(bet.pnl) && !bet.attributionUncertain); }
  roundPnl() { return this.roundBets().reduce((sum, bet) => sum + (bet.pnl ?? 0), 0); }
  riskExposure() {
    const pending = this.pending();
    const unknown = pending.filter(bet => bet.state === 'unknown' || bet.amount === null || bet.attributionUncertain);
    const known = pending.filter(bet => bet.state !== 'unknown' && bet.amount !== null && !bet.attributionUncertain) as Array<DgManualBet & { amount: number }>;
    return { known: known.map(bet => ({ key: `manual:${bet.key}`, amount: bet.amount })), unknownCount: unknown.length };
  }
  /** A fresh automatic round preserves unresolved manual orders by assigning them to the new round. */
  beginRound(now = Date.now()) {
    this.state.roundId = roundId(now);
    for (const bet of this.pending()) bet.roundId = this.state.roundId;
  }
  /** A reload never discards a sent manual order. It remains an explicit unknown until a matching receipt proves it. */
  markReloadUnresolved() {
    this.stagedSettlements.clear();
    for (const bet of this.state.bets) if (bet.state === 'sent') bet.state = 'unknown';
  }
  markUnresolved(bet: DgManualBet) {
    if (bet.state === 'sent' || bet.state === 'accepted') bet.state = 'unknown';
  }
  observeSent(msg: any) {
    if (Number(msg?.cmd) !== 6) return null;
    const tableId = identifiers(msg?.tableId), gameNo = identifiers(msg?.gameNo);
    if (!tableId || !gameNo) return null;
    const key = `${tableId}:${gameNo}`, stake = dgManualStake(msg);
    const existing = this.state.bets.find(bet => bet.key === key);
    if (existing) {
      // Without a unique native request id, equal amounts cannot prove retransmission.
      // Preserve a blocking unknown instead of understating a possible second wager.
      this.stagedSettlements.delete(key);
      existing.state = 'unknown'; existing.attributionUncertain = true;
      return { bet: existing, created: false, duplicate: true, unknown: true };
    }
    const bet: DgManualBet = {
      key, tableId, gameNo, amount: stake?.amount ?? null, side: stake?.side ?? '其他', state: stake ? 'sent' : 'unknown',
      createdAt: Date.now(), roundId: this.state.roundId, sendSignature: stake?.signature ?? 'opaque',
    };
    this.state.bets.push(bet);
    return { bet, created: true, duplicate: false, unknown: !stake };
  }
  markAttributionUncertain(key: string) {
    const bet = this.state.bets.find(item => item.key === key);
    if (!bet) return null;
    this.stagedSettlements.delete(key);
    bet.state = 'unknown'; bet.attributionUncertain = true;
    return bet;
  }
  receipt(msg: any) {
    if (Number(msg?.cmd) !== 6) return null;
    const tableId = identifiers(msg?.tableId), gameNo = identifiers(msg?.gameNo);
    if (!tableId || !gameNo) return null;
    const bet = this.state.bets.find(item => item.key === `${tableId}:${gameNo}` && ['sent', 'unknown'].includes(item.state));
    if (!bet) return null;
    if (bet.attributionUncertain || msg.codeId == null) { this.stagedSettlements.delete(bet.key); bet.state = 'unknown'; return { bet, accepted: false }; }
    if (Number(msg.codeId) !== 0) { this.stagedSettlements.delete(bet.key); bet.state = 'rejected'; return { bet, accepted: false }; }
    const stake = dgManualStake(msg);
    if (!stake || (bet.amount !== null && (bet.amount !== stake.amount || bet.sendSignature !== stake.signature))) { this.stagedSettlements.delete(bet.key); bet.state = 'unknown'; return { bet, accepted: false }; }
    bet.amount = stake.amount; bet.side = stake.side; bet.sendSignature = stake.signature; bet.state = 'accepted'; bet.acceptedAt = Date.now();
    const staged = this.stagedSettlements.get(bet.key);
    if (staged) {
      this.stagedSettlements.delete(bet.key);
      bet.pnl = staged.pnl; bet.state = 'settled'; bet.settledAt = Date.now();
      return { bet, accepted: true, settled: true, pnl: staged.pnl };
    }
    return { bet, accepted: true };
  }
  settle(msg: any) {
    if (Number(msg?.cmd) !== 1007 || Number(msg.codeId ?? 0) !== 0) return null;
    const tableId = identifiers(msg?.tableId), gameNo = identifiers(msg?.gameNo), pnl = msg?.dList?.[1];
    if (!tableId || !gameNo || typeof pnl !== 'number' || !Number.isFinite(pnl)) return null;
    const key = `${tableId}:${gameNo}`;
    const bet = this.state.bets.find(item => item.key === key && ['sent', 'accepted', 'unknown'].includes(item.state) && !item.attributionUncertain);
    if (!bet) return null;
    if (bet.state === 'accepted') {
      bet.pnl = pnl; bet.state = 'settled'; bet.settledAt = Date.now();
      return { bet, pnl, settled: true };
    }
    // Before acceptance, only a parsed single outgoing command can be held for
    // event reordering. Opaque or mismatched-receipt orders remain unknown and
    // must never acquire P/L from an otherwise matching table-round event.
    if (bet.state !== 'sent' || bet.amount === null) return null;
    const staged = this.stagedSettlements.get(key);
    if (staged && staged.pnl !== pnl) {
      // Conflicting pre-acknowledgement events cannot be attributed safely.
      this.stagedSettlements.delete(key);
      bet.state = 'unknown'; bet.attributionUncertain = true;
      return { bet, uncertain: true };
    }
    if (!staged) this.stagedSettlements.set(key, { pnl, receivedAt: Date.now() });
    return { bet, staged: true };
  }
}
