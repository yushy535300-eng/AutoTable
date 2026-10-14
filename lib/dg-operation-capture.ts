import { readDgSceneNodes, findDgScenePlayer, dgSceneWallet, describeDgScene } from './dg-scene';
import { exportDgMobileLoadedPublicScripts } from './dg-mobile-public-source';
import { getDgBetControls } from './dg-mobile-native';

type CaptureEvent = { at: string; kind: string; data: unknown };
const identifier = (value: unknown) => /^[A-Za-z0-9_.:-]{1,64}$/.test(String(value ?? '')) ? String(value) : null;
const finite = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) { const number = Number(value); return Number.isFinite(number) ? number : null; }
  return null;
};
const BET_KEYS = ['banker', 'banker6', 'player', 'tie', 'bPair', 'pPair'];

/** Extract only an explicit metadata whitelist; never retain raw beans or encrypted bodies. */
export function summarizeDgCaptureBean(bean: any) {
  const data: Record<string, unknown> = {};
  for (const key of ['cmd', 'codeId', 'stateId', 'countDown', 'gameId']) {
    const value = finite(bean?.[key]); if (value !== null) data[key] = value;
  }
  for (const key of ['tableId', 'gameNo', 'shoeId', 'playId']) {
    const value = identifier(bean?.[key]); if (value !== null) data[key] = value;
  }
  const cmd = data.cmd;
  if (cmd === 6) {
    let bets: any = null;
    try { if (typeof bean?.list?.[0] === 'string' && bean.list[0].length < 4096) bets = JSON.parse(bean.list[0]); } catch { /* encrypted or unknown content is omitted */ }
    if (bets && typeof bets === 'object' && !Array.isArray(bets)) {
      const amounts: Record<string, number> = {};
      for (const key of BET_KEYS) { const amount = finite(bets[key]); if (amount !== null && amount >= 0) amounts[key] = amount; }
      if (Object.keys(amounts).length) data.betAmounts = amounts;
    }
  }
  if (cmd === 1007 && finite(bean?.dList?.[1]) !== null) data.pnl = finite(bean.dList[1]);
  return data;
}

export function captureDgViewport(W: any) {
  try {
  const viewport = W?.visualViewport;
  // Mobile also creates a small auxiliary canvas before the actual Laya stage.
  // Never report the first 300×150 helper canvas as the game's render surface.
  const canvases: any[] = Array.from(W?.document?.querySelectorAll?.('canvas') || []);
  const canvasNode = canvases.find(node=>node.id==='layaCanvas') || canvases.sort((a,b)=>{
    const ar=a.getBoundingClientRect?.(),br=b.getBoundingClientRect?.();return (br?.width||0)*(br?.height||0)-(ar?.width||0)*(ar?.height||0);
  })[0] || W?.document?.querySelector?.('canvas');
  const canvas = canvasNode?.getBoundingClientRect?.();
  const stage = W?.Laya?.stage;
  return {
    units: { layout: 'CSS px', visual: 'CSS px', stage: 'Laya logical units', canvas: 'CSS px', canvasBitmap: 'bitmap px' },
    layoutWidth: finite(W?.innerWidth), layoutHeight: finite(W?.innerHeight),
    visualWidth: finite(viewport?.width), visualHeight: finite(viewport?.height),
    visualScale: finite(viewport?.scale), devicePixelRatio: finite(W?.devicePixelRatio),
    stageWidth: finite(stage?.width), stageHeight: finite(stage?.height),
    stageScaleMode: typeof stage?.scaleMode === 'string' ? stage.scaleMode.slice(0, 30) : null,
    canvas: canvas ? { width: canvas.width, height: canvas.height, left: canvas.left, top: canvas.top } : null,
    canvasBitmap: canvasNode ? { width: finite(canvasNode.width), height: finite(canvasNode.height) } : null,
  };
  } catch { return { unavailable: true }; }
}

/** User-operated, bounded diagnostic session. It never sends a request or clicks a control. */
export function createDgOperationCapture(W: any, outerWindow: any) {
  if (W.__DG_MANUAL_CAPTURE_ACTIVE__) throw new Error('已在記錄流程，請先結束記錄。');
  W.__DG_MANUAL_CAPTURE_ACTIVE__ = true;
  try { W.__DG_SINGLEPAGE__?.stop?.('手動流程記錄中，工具已停止'); } catch (error) { W.__DG_MANUAL_CAPTURE_ACTIVE__ = false; throw error; }
  const startedAt = Date.now(), owner = {};
  const events: CaptureEvent[] = [];
  let active = true, stage: any = null, socket: any = null;
  let originalSend: any = null, observedSend: any = null, timer: any = null, previousSurface = '';
  let scripts: ReturnType<typeof exportDgMobileLoadedPublicScripts>['scripts'] = [];
  let lastGameViewport = captureDgViewport(W);
  let currentSurface = describeDgScene([]);
  let wallet: number | null = null, selectedChip: number | null = null, lastSocketDetected=false;
  const sentRounds = new Set<string>(), acceptedRounds = new Set<string>(), settledRounds = new Set<string>();
  const seenControls = new Set<string>();
  try { scripts = exportDgMobileLoadedPublicScripts(W.document).scripts; } catch { /* optional script metadata */ }
  const add = (kind: string, data: unknown) => {
    if (!active) return;
    events.push({ at: new Date().toISOString(), kind, data });
    if (events.length > 1200) events.shift();
  };
  const receive = (bean: any) => {
    const summary = summarizeDgCaptureBean(bean);
    const key = summary.tableId && summary.gameNo ? `${summary.tableId}:${summary.gameNo}` : '';
    const amount = summary.betAmounts as Record<string, number> | undefined;
    if (key && sentRounds.has(key) && summary.cmd === 6 && summary.codeId === 0 && amount && Object.values(amount).some(value => value > 0)) acceptedRounds.add(key);
    if (key && acceptedRounds.has(key) && summary.cmd === 1007 && summary.codeId === 0 && typeof summary.pnl === 'number') settledRounds.add(key);
    if (Object.keys(summary).length) add('native-receive', summary);
  };
  function click(event: any) {
    let target = event?.target, label: string | null = null;
    const all = readDgSceneNodes(W?.Laya?.stage);
    for (let depth = 0; target && depth < 8; depth++, target = target.parent) {
      for (const card of all) {
        const controls=getDgBetControls(card);
        if (target === controls?.confirm) label = 'confirm';
        if (target === controls?.cancel) label = 'cancel';
        if (target === card?.betBtn?.Banker) label = 'Banker';
        if (target === card?.betBtn?.Player) label = 'Player';
      }
      const name = String(target.buttonName ?? '');
      if (/^(MultiLobby|MultiGames|GameLobby|Multi|Banker|Player|Chip(?:\d+)?|\d{1,7})$/.test(name)) label = name;
      if (label) break;
    }
    const player = findDgScenePlayer(all);
    if (label) seenControls.add(label);
    add('native-click', { control: label || 'unclassified', selectedChip: finite(player?.selectChip) });
  }
  function detachSocket() {
    try { socket?.off?.('RECEIVED_SUCCESS', owner, receive); } catch { /* best effort */ }
    try { if (socket?.sendData === observedSend) socket.sendData = originalSend; } catch { /* inactive wrapper remains pass-through */ }
    socket = null; originalSend = null; observedSend = null;
  }
  function poll() {
    if (!active) return;
    if (Date.now() - startedAt >= 300000) { add('recording-time-limit', {}); stop(); return; }
    const currentStage = W?.Laya?.stage;
    if (currentStage !== stage) {
      try { stage?.off?.(W?.Laya?.Event?.CLICK || 'click', owner, click); } catch { /* scene changed */ }
      stage = currentStage;
      stage?.on?.(W?.Laya?.Event?.CLICK || 'click', owner, click);
    }
    const nodes = readDgSceneNodes(stage), player = findDgScenePlayer(nodes);
    const next = player?.socketMan;
    lastSocketDetected=!!next&&next.socket?.connected!==false;
    if (next && next !== socket && typeof next.on === 'function' && typeof next.off === 'function' && typeof next.sendData === 'function') {
      detachSocket(); socket = next; socket.on('RECEIVED_SUCCESS', owner, receive);
      const currentSocket = socket, send = socket.sendData;
      originalSend = send;
      observedSend = function(this: any, bean: any, ...args: any[]) {
        // Observational pass-through exactly once. Errors in recording cannot block gameplay.
        let summary: ReturnType<typeof summarizeDgCaptureBean> | null = null;
        try {
          if (active) {
            summary = summarizeDgCaptureBean(bean);
            if (summary.cmd === 6 && summary.tableId && summary.gameNo) sentRounds.add(`${summary.tableId}:${summary.gameNo}`);
          }
        } catch { /* recording only */ }
        let result: unknown;
        try {
          result = send.call(this, bean, ...args);
        } catch (error) {
          if (summary?.cmd === 6 && summary.tableId && summary.gameNo) {
            const key = `${summary.tableId}:${summary.gameNo}`;
            sentRounds.delete(key); acceptedRounds.delete(key); settledRounds.delete(key);
          }
          try { add('native-send-threw', {}); } catch { /* never alter the original exception */ }
          throw error;
        }
        try { if (active && summary) add('native-send', summary); } catch { /* diagnostics cannot change a successful native return */ }
        return result;
      };
      currentSocket.sendData = observedSend;
      add('native-socket-attached', { connected: currentSocket.socket?.connected !== false });
    }
    const surface = describeDgScene(nodes);
    currentSurface = surface; wallet = dgSceneWallet(player); selectedChip = finite(player?.selectChip);
    const views = nodes.map(node => identifier(node?.currentView?.viewName ?? node?.viewName)).filter(Boolean).slice(0, 20);
    const data = { surface, views, selectedChip: finite(player?.selectChip), walletSynced: dgSceneWallet(player) !== null,
      viewport: captureDgViewport(W) };
    const signature = JSON.stringify(data);
    if (signature !== previousSurface) { previousSurface = signature; add('native-scene', data); }
  }
  function stop() {
    if (!active) return;
    add('recording-stopped', {}); active = false;
    try { if (timer !== null) outerWindow.clearInterval(timer); } catch { /* parent may be unloading */ }
    try { stage?.off?.(W?.Laya?.Event?.CLICK || 'click', owner, click); } catch { /* cleanup */ }
    detachSocket();
    try { W.__DG_MANUAL_CAPTURE_ACTIVE__ = false; } catch { /* frame origin changed; old actions are no longer accessible */ }
  }
  function report() {
    let upstreamOrigin: string | null = null;
    try { const origin = new URL(W.__MT_DG_UPSTREAM_ORIGIN__); if (origin.protocol === 'https:' && !origin.username && !origin.password) upstreamOrigin = origin.origin; } catch { /* optional public origin only */ }
    const viewport = captureDgViewport(W); if (!('unavailable' in viewport)) lastGameViewport = viewport;
    try { const current = exportDgMobileLoadedPublicScripts(W.document).scripts; if (current.length) scripts = current; } catch { /* retain initial metadata after frame navigation */ }
    return { version: 'DG-manual-flow-2', automaticActions: 0, recording: active,
      startedAt: new Date(startedAt).toISOString(),
      upstreamOrigin,
      outerViewport: captureDgViewport(outerWindow), gameViewport: lastGameViewport,
      scripts,
      summary: status(),
      events: events.map(event => ({ ...event })),
    };
  }
  function status() {
    const missing = [...new Set(currentSurface.candidates.flatMap(card => card.missing))];
    return { recording: active, elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000),
      socketDetected: active?!!socket:lastSocketDetected, wallet, selectedChip,
      cardCandidates: currentSurface.candidateCount,
      completeCards: currentSurface.candidates.filter(card => !card.missing.length).length,
      missing, directionClick: seenControls.has('Banker') || seenControls.has('Player'),
      confirmClick: seenControls.has('confirm'),
      sent: sentRounds.size, accepted: acceptedRounds.size, settled: settledRounds.size,
      eventCount: events.length,
    };
  }
  try { poll(); timer = outerWindow.setInterval(() => { try { poll(); } catch { add('recording-read-unavailable', {}); stop(); } }, 500); } catch (error) { stop(); throw error; }
  return { stop, report, status, active: () => active };
}
