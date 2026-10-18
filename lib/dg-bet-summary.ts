import type { DgBet } from './dg-bet-ledger';

/** Display-only summaries; never changes ledger state or sends a platform request. */
export function dgBetSummary(bets: DgBet[], names: Record<string, string>, since = 0) {
  const name = (bet: DgBet) => names[bet.tableId] || bet.tableId;
  const uniqueNames = (rows: DgBet[]) => [...new Set(rows.map(name))].join(' · ');
  const waiting = bets.filter(b => b.state === 'accepted' && !b.attributionUncertain);
  const confirming = bets.filter(b => b.state === 'reserved' || b.state === 'submitted');
  const uncertain = bets.filter(b => b.state === 'uncertain' || b.attributionUncertain);
  const latest = new Map<string, DgBet>();
  for (const bet of bets) {
    if (bet.attributionUncertain || !['accepted', 'settled'].includes(bet.state) || bet.acceptedAt === undefined) continue;
    if (bet.state !== 'accepted' && bet.acceptedAt < since) continue;
    const previous = latest.get(bet.tableId);
    if (!previous || bet.acceptedAt >= previous.acceptedAt!) latest.set(bet.tableId, bet);
  }
  return {
    waiting: uniqueNames(waiting),
    confirming: uniqueNames(confirming),
    uncertain: uniqueNames(uncertain),
    success: [...latest.values()].map(b => `${name(b)}${b.side}${b.amount.toLocaleString('zh-TW')}`).join(' · '),
  };
}
