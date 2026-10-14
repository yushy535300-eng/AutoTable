/** Read-only breadth-first traversal: inspect controllers/cards before deep road glyphs. */
export function readDgSceneNodes(stage: any, maximum = 12000): any[] {
  const output: any[] = [], queue: any[] = [stage], seen = new Set<any>();
  let cursor = 0;
  while (cursor < queue.length && output.length < maximum) {
    const node = queue[cursor++];
    if (!node || typeof node !== 'object' || seen.has(node) || node.destroyed) continue;
    seen.add(node);
    output.push(node);
    const count = Math.min(1000, Math.max(0, Number(node.numChildren) || 0));
    if (typeof node.getChildAt !== 'function') continue;
    for (let index = 0; index < count && queue.length < maximum * 2; index++) {
      try { const child = node.getChildAt(index); if (child && !seen.has(child)) queue.push(child); } catch { /* scene changed */ }
    }
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
