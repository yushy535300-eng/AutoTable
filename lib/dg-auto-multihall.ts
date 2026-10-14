import { readDgSceneNodes, dgSceneNodeVisible } from './dg-scene';
import { isDgMultiLobbyCard } from './dg-mobile-native';
import type { DgFrame } from './dg-frame-installer';
import { inspectDgMobileNativeSurface } from './dg-mobile-native';

export type DgMultiHallResult = 'waiting' | 'requested' | 'ready' | 'finished' | 'unavailable' | 'cross-origin';
export type DgMultiHallMode = 'desktop' | 'mobile';
type Navigation = { started: number; requested: boolean; requestedAt?: number; completed?: boolean; failed?: boolean };
const states = new WeakMap<object, Navigation>();

function interactive(node: any): boolean {
  if (!node || node.destroyed || node.mouseEnabled === false || node.disabled === true || typeof node.event !== 'function') return false;
  let current = node, hops = 0;
  while (current && hops++ < 40) {
    if (current.destroyed || current.visible === false || current.mouseEnabled === false) return false;
    current = current.parent;
  }
  return true;
}

/** Verified desktop bundle path: left.classicBtnArr MultiLobby / hotBtnArr MultiGames -> CLICK -> changeLobby -> native request. */
export function ensureDgMultiHall(frame: DgFrame | null, mode: DgMultiHallMode = 'desktop'): DgMultiHallResult {
  let win: any, doc: Document | null;
  try {
    if (!frame) return 'waiting';
    win = frame.contentWindow; doc = frame.contentDocument;
    if (!doc) return 'cross-origin';
    if (doc.location.href === 'about:blank') return 'waiting';
    if (doc.location.origin !== window.location.origin) return 'cross-origin';
  } catch { return 'cross-origin'; }
  const stage = win?.Laya?.stage;
  if (!stage?.getChildAt) return 'waiting';
  if (mode === 'mobile') {
    // There is no supplied mobile navigation source that proves a mobile tab's
    // click handler. A Mobile launch therefore never reuses the desktop
    // classicBtnArr/hotBtnArr click. It becomes ready only after the live Laya
    // scene proves it has the same MultiLobby packet-builder card.
    const mobile = inspectDgMobileNativeSurface(win);
    if (mobile.readiness === 'compatible') return 'ready';
    if (mobile.readiness === 'unverified-packet-builder') return 'unavailable';
    return 'waiting';
  }
  let navigation = states.get(doc);
  if (!navigation) { navigation = { started: Date.now(), requested: false }; states.set(doc, navigation); }
  const nodes = readDgSceneNodes(stage);
  // GoodRoad/native cards are also supported. Readiness follows the live
  // betting surface, not only a viewName string or a timed navigation flag.
  if (nodes.some(node => isDgMultiLobbyCard(node) && dgSceneNodeVisible(node))) {
    navigation.completed = true; return 'ready';
  }
  const controller = nodes.find(node => node.gameLeftMan && node.playerInfo && node.currentView);
  if (controller?.currentView?.viewName === 'MultiLobby') { navigation.completed = true; return 'ready'; }
  if (nodes.some(node => node.viewName === 'MultiLobby' && !node.destroyed && node.visible !== false)) { navigation.completed = true; return 'ready'; }
  if (navigation.completed) return 'finished';
  if (navigation.failed || Date.now() - navigation.started > 90000) return 'unavailable';
  if (navigation.requested) {
    if (Date.now() - (navigation.requestedAt || 0) > 25000) { navigation.failed = true; return 'unavailable'; }
    return 'requested';
  }
  if (!controller) return 'waiting';
  // Never automatically leave a single table or disturb a manually selected game.
  if (!['GameLobby','LiveLobby'].includes(String(controller.currentView.viewName))) return 'waiting';
  const layout = Number(controller.playerInfo.layout);
  const buttons: any[] = layout === 0 ? controller.gameLeftMan.classicBtnArr : layout === 1 ? controller.gameLeftMan.hotBtnArr : [];
  if (!Array.isArray(buttons)) return 'waiting';
  const wanted = layout === 0 ? 'MultiLobby' : 'MultiGames';
  const candidates = buttons.filter(button => button.buttonName === wanted && Number(button.gameId) === 0 && interactive(button));
  if (candidates.length !== 1) return 'waiting';
  navigation.requested = true; navigation.requestedAt = Date.now();
  try { candidates[0].event(win.Laya.Event?.CLICK || 'click'); }
  catch { navigation.failed = true; return 'unavailable'; }
  if (controller.currentView?.viewName === 'MultiLobby') { navigation.completed = true; return 'ready'; }
  return 'requested';
}
