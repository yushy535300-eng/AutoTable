import { readDgSceneNodes, dgSceneNodeVisible } from './dg-scene';
export type DgMobileNativeReadiness = 'waiting-stage' | 'waiting-multi-table' | 'unverified-packet-builder' | 'compatible';
export type DgMobileNativeProbe = { readiness: DgMobileNativeReadiness; portrait: boolean; cardCount: number; rejectedCardCount: number };
type NodeLike = Record<string, any>;

function isRecord(value: unknown): value is NodeLike { return !!value && typeof value === 'object'; }
function safeProperty(value: unknown, key: string): any { try { return isRecord(value) ? value[key] : undefined; } catch { return undefined; } }
function control(value: any) { return typeof value === 'function' || (isRecord(value) && typeof safeProperty(value, 'event') === 'function'); }
export function getDgBetControls(card: any) {
  if (control(card?.betMan?.confirm) && control(card?.betMan?.cancel)) return { profile: 'desktop' as const, manager: card.betMan, confirm: card.betMan.confirm, cancel: card.betMan.cancel };
  if (control(card?.betBtnMan?.confirmBtn) && control(card?.betBtnMan?.cancelBtn)) return { profile: 'mobile-v329' as const, manager: card.betBtnMan, confirm: card.betBtnMan.confirmBtn, cancel: card.betBtnMan.cancelBtn };
  return null;
}

/** Only native multi-table cards. Single-room betBtnMan without Banker/Player betBtn is not sufficient. */
export function isDgMultiLobbyCard(value: unknown): value is NodeLike {
  if (!isRecord(value)) return false;
  const gameInfo = safeProperty(value, 'gameInfo'), betBtn = safeProperty(value, 'betBtn');
  const socketMan = safeProperty(safeProperty(value, 'playerInfo'), 'socketMan');
  return value.tableId !== undefined && isRecord(gameInfo) && isRecord(betBtn) &&
    betBtn.Banker !== undefined && betBtn.Player !== undefined && getDgBetControls(value) !== null &&
    isRecord(safeProperty(value, 'betMoneyTmp')) && isRecord(safeProperty(value, 'betMoneyTrue')) &&
    typeof safeProperty(value, 'confirmBet') === 'function' && isRecord(socketMan) && typeof socketMan.sendData === 'function';
}

/** Whitespace-insensitive source identity, not a credential or packet-signing hash. */
export function dgBuilderSourceFingerprint(fn: unknown): string {
  let source: string;
  try { source = Function.prototype.toString.call(fn).replace(/^function\s+/, '').replace(/\s+/g, ''); } catch { return ''; }
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  return `${source.length}:${(hash >>> 0).toString(16)}`;
}

/** Exact public mobile V3.2.9 ei/Ki methods from the user's actual loaded bundle.
 * Source URL: https://new-dd-cn.dingdangmail.com/ddnewwap/V3.2.9/js/bundle.js
 * Bundle SHA256: ae44c1caa7bc1d3af11c9bcaafe86487648b9de361c29d0e196e017c56df8f32
 * Unknown versions remain blocked. Signing/encryption is performed only by the live native method.
 */
export function hasDgVerifiedMobilePacketBuilder(card: unknown): boolean {
  if (!isDgMultiLobbyCard(card) || getDgBetControls(card)?.profile !== 'mobile-v329') return false;
  return ['1517:2faa00b2', '1443:b3416a14'].includes(dgBuilderSourceFingerprint(card.confirmBet));
}

export function hasDgVerifiedDirectPacketBuilder(card: unknown): boolean {
  if (!isDgMultiLobbyCard(card)) return false;
  if (getDgBetControls(card)?.profile === 'mobile-v329') return hasDgVerifiedMobilePacketBuilder(card);
  let source = '';
  try { source = Function.prototype.toString.call(card.confirmBet); } catch { return false; }
  return ['betMoneyTmp', 'betMoneyTrue', 'gameNo', 'BET_CHIP', 'encrypt', 'demo'].every(marker => source.includes(marker));
}

/** The mobile manager owns betFlag; the mobile card itself has no such property. */
export function dgNativeBetEnabled(card: any): boolean {
  const controls = getDgBetControls(card);
  return controls?.profile === 'mobile-v329' ? hasDgVerifiedMobilePacketBuilder(card) && controls.manager.betFlag === true : card?.betFlag === true;
}

/** Read-only probe; it never calls confirmBet or sends a request. */
export function inspectDgMobileNativeSurface(W: unknown): DgMobileNativeProbe {
  const win = W as any, width = Number(win?.innerWidth), height = Number(win?.innerHeight);
  const portrait = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > width;
  const stage = win?.Laya?.stage;
  if (!isRecord(stage) || typeof safeProperty(stage, 'getChildAt') !== 'function') return { readiness: 'waiting-stage', portrait, cardCount: 0, rejectedCardCount: 0 };
  const cards = readDgSceneNodes(stage).filter(node => isDgMultiLobbyCard(node) && dgSceneNodeVisible(node));
  if (!cards.length) return { readiness: 'waiting-multi-table', portrait, cardCount: 0, rejectedCardCount: 0 };
  const rejectedCardCount = cards.filter(card => !hasDgVerifiedDirectPacketBuilder(card)).length;
  return { readiness: rejectedCardCount ? 'unverified-packet-builder' : 'compatible', portrait, cardCount: cards.length, rejectedCardCount };
}
