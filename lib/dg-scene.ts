/** Read-only breadth-first traversal, including the vendor's backing display list. */
export function readDgSceneNodes(stage: any, maximum = 12000): any[] {
  const output: any[] = [], queue: any[] = [stage], queued = new Set<any>([stage]);
  let cursor = 0;
  const enqueue = (child: any) => {
    if (child && typeof child === 'object' && !queued.has(child) && queue.length < maximum * 2) {
      queued.add(child); queue.push(child);
    }
  };
  while (cursor < queue.length && output.length < maximum) {
    const node = queue[cursor++];
    if (!node || typeof node !== 'object' || node.destroyed) continue;
    output.push(node);
    try {
      const count = Math.min(1000, Math.max(0, Number(node.numChildren) || 0));
      if (typeof node.getChildAt === 'function') {
        for (let index = 0; index < count; index++) { try { enqueue(node.getChildAt(index)); } catch { /* scene changed */ } }
      }
      // DG's report reader already supports this native backing display list.
      // Merge both lists; never traverse arbitrary account properties or invoke UI methods.
      if (Array.isArray(node._children)) for (const child of node._children.slice(0, 1000)) enqueue(child);
    } catch { /* a detached node must not prevent inspection of other branches */ }
  }
  return output;
}

export function dgSceneNodeVisible(node: any): boolean {
  const seen = new Set<any>();
  while (node) {
    if (seen.has(node) || node.destroyed || node.visible === false || node.alpha === 0) return false;
    seen.add(node);
    node = node.parent;
  }
  return seen.size > 0;
}

/** The native player may live on a lobby/controller before any betting card exists. */
export function findDgScenePlayer(nodes: any[]): any | null {
  for (const node of nodes) {
    for (const player of [node?.playerInfo, node]) {
      if (player && typeof player === 'object' && typeof player.socketMan?.sendData === 'function') return player;
    }
  }
  return null;
}

export function dgSceneWallet(player: any): number | null {
  if (!player || player.socketMan?.socket?.connected === false) return null;
  const value = player.balance;
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

/** Sanitized field-presence report; no function source, token, nickname or raw packet. */
export function describeDgScene(nodes: any[]) {
  const candidates = nodes.filter(node => node?.tableId != null && node?.gameInfo && (node?.betBtn || node?.betMoneyTmp));
  return {
    nodeCount: nodes.length,
    candidateCount: candidates.length,
    walletSynced: dgSceneWallet(findDgScenePlayer(nodes)) !== null,
    candidates: candidates.slice(0, 60).map(node => {
      const mobile=!!node.betBtnMan&&!node.betMan;
      const confirm=node.betMan?.confirm??node.betBtnMan?.confirmBtn;
      const cancel=node.betMan?.cancel??node.betBtnMan?.cancelBtn;
      const missing = [
        ['Banker', !!node.betBtn?.Banker], ['Player', !!node.betBtn?.Player],
        ['confirm', !!confirm], ['cancel', !!cancel],
        ['betMoneyTmp', !!node.betMoneyTmp], ['betMoneyTrue', !!node.betMoneyTrue],
        ['confirmBet', typeof node.confirmBet === 'function'],
        ['socket', typeof node.playerInfo?.socketMan?.sendData === 'function'],
        ['visible', dgSceneNodeVisible(node)],
      ].filter(([, exists]) => !exists).map(([name]) => name);
      return { tableId: String(node.tableId), table: String(node.gameInfo.tableName || ''),
        gameState: Number(node.gameInfo.stateId), roadCount: Array.isArray(node.gameInfo.roadArray) ? node.gameInfo.roadArray.length : 0,
        hasGameNo: !!node.gameInfo.gameNo, hasCountdown: node.gameInfo.countDown != null,
        profile:mobile?'mobile-v329-shaped':'desktop-shaped',
        betFlag: (mobile?node.betBtnMan?.betFlag:node.betFlag) === true, missing };
    }),
  };
}
