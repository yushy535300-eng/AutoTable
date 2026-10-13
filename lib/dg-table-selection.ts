/** Sync already-loaded DG betting tables without recommendation ranking.
 * Keep current available choices first; absent tables with pending bets occupy
 * a slot until settled, so a transient UI rebuild never broadens exposure.
 */
export function syncDgTables(
  loadedIds: string[],
  selectedIds: string[],
  pendingIds: string[],
  count: '1' | '3' | '5' | 'all',
): string[] {
  const loaded = [...new Set(loadedIds.filter(Boolean))];
  const available = new Set(loaded);
  const pending = new Set(pendingIds);
  const retained = [...new Set(selectedIds)].filter(id => available.has(id) || pending.has(id));
  const limit = count === 'all' ? Infinity : Number(count);
  const next = retained.slice(0, limit);
  for (const id of loaded) {
    if (next.length >= limit) break;
    if (!next.includes(id)) next.push(id);
  }
  return next;
}

/** Running auto mode: retain pending slots, then fill with eligible open tables.
 * A sealed or already-bet round cannot occupy an idle slot merely because its
 * table id comes first. Manual mode does not call this function.
 */
export function selectOpenDgTables(
  eligibleIds:string[],
  pendingIds:string[],
  count:'1'|'3'|'5'|'all',
):string[] {
  const pending=[...new Set(pendingIds.filter(Boolean))];
  const eligible=[...new Set(eligibleIds.filter(Boolean))];
  const limit=count==='all'?Infinity:Number(count);
  const next=[...pending];
  for(const id of eligible){
    if(next.length>=limit)break;
    if(!next.includes(id))next.push(id);
  }
  return next;
}
