import type { DgBet } from './dg-bet-ledger';

/** Display-only summaries; never changes ledger state or sends a platform request. */
export function dgBetSummary(bets: DgBet[], names: Record<string, string>, since = 0) {
  const name = (bet: DgBet) => names[bet.tableId] || bet.tableId;
  const uniqueNames = (rows: DgBet[]) => [...new Set(rows.map(name))].join(' · ');
  const waiting = bets.filter(b => b.state === 'accepted' && !b.attributionUncertain);
  const confirming = bets.filter(b => b.state === 'reserved' || b.state === 'submitted');
  const uncertain = bets.filter(b => b.state === 'uncertain' || b.attributionUncertain);
  let latest: DgBet | undefined;
  for (const bet of bets) {
    if (bet.attributionUncertain || !['accepted', 'settled'].includes(bet.state) || bet.acceptedAt === undefined) continue;
    if (bet.state !== 'accepted' && bet.acceptedAt < since) continue;
    // Ties use the later ledger entry, so multi-table receipts never concatenate.
    if (!latest || bet.acceptedAt >= latest.acceptedAt!) latest = bet;
  }
  return {
    waiting: uniqueNames(waiting),
    confirming: uniqueNames(confirming),
    uncertain: uniqueNames(uncertain),
    success: latest ? `${name(latest)}｜${latest.amount.toLocaleString('zh-TW')}` : '',
  };
}
