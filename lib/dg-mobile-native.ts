import { readDgSceneNodes, dgSceneNodeVisible } from './dg-scene';
export type DgMobileNativeReadiness =
  | "waiting-stage"
  | "waiting-multi-table"
  | "unverified-packet-builder"
  | "compatible";

export type DgMobileNativeProbe = {
  readiness: DgMobileNativeReadiness;
  /** Visual only. It is never used to infer a packet format or authorize an action. */
  portrait: boolean;
  /** Number of cards that expose the documented PC MultiLobby shape. */
  cardCount: number;
  /** Cards whose native builder did not retain the source fingerprint. */
  rejectedCardCount: number;
};

type NodeLike = {
  destroyed?: unknown;
  numChildren?: unknown;
  getChildAt?: (index: number) => unknown;
  tableId?: unknown;
  gameInfo?: Record<string, unknown>;
  playerInfo?: { socketMan?: unknown };
  betBtn?: Record<string, unknown>;
  betMan?: { confirm?: unknown; cancel?: unknown };
  betMoneyTmp?: unknown;
  betMoneyTrue?: unknown;
  confirmBet?: unknown;
};

type WindowLike = {
  Laya?: { stage?: unknown };
  innerWidth?: unknown;
  innerHeight?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function safeProperty(value: unknown, key: string): unknown {
  try { return isRecord(value) ? value[key] : undefined; } catch { return undefined; }
}

/**
 * The original PC MultiLobby class in dg_selected_bet_source.txt owns these
 * fields.  This deliberately does not recognize a similarly positioned visual
 * control: no screen coordinate, DOM click, or synthetic Laya event is used.
 */
export function isDgMultiLobbyCard(value: unknown): value is NodeLike {
  if (!isRecord(value)) return false;
  const gameInfo = safeProperty(value, "gameInfo");
  const betBtn = safeProperty(value, "betBtn");
  const betMan = safeProperty(value, "betMan");
  const socketMan = safeProperty(safeProperty(value, "playerInfo"), "socketMan");
  return value.tableId !== undefined && isRecord(gameInfo) &&
    isRecord(betBtn) && betBtn.Banker !== undefined && betBtn.Player !== undefined &&
    isRecord(betMan) && [betMan.confirm, betMan.cancel].every(control => typeof control === "function" || (isRecord(control) && typeof safeProperty(control, "event") === "function")) &&
    isRecord(safeProperty(value, "betMoneyTmp")) && isRecord(safeProperty(value, "betMoneyTrue")) &&
    typeof safeProperty(value, "confirmBet") === "function" &&
    isRecord(socketMan) && typeof socketMan.sendData === "function";
}

/**
 * The direct-message path is permitted only when the live card retains the
 * original source's packet-builder markers.  The marker test is read-only; it
 * does not execute confirmBet.  A new/minified mobile engine that fails this
 * check is intentionally left unsupported rather than guessed.
 */
export function hasDgVerifiedDirectPacketBuilder(card: unknown): boolean {
  if (!isDgMultiLobbyCard(card)) return false;
  let source = "";
  try { source = Function.prototype.toString.call(card.confirmBet); } catch { return false; }
  return ["betMoneyTmp", "betMoneyTrue", "gameNo", "BET_CHIP", "encrypt", "demo"].every(marker => source.includes(marker));
}

/** Read-only runtime probe used before installing the existing direct-message console in Mobile mode. */
export function inspectDgMobileNativeSurface(W: unknown): DgMobileNativeProbe {
  const win = W as WindowLike | null;
  const width = Number(win?.innerWidth);
  const height = Number(win?.innerHeight);
  const portrait = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > width;
  const stage = win?.Laya?.stage;
  if (!isRecord(stage) || typeof safeProperty(stage, "getChildAt") !== "function") {
    return { readiness: "waiting-stage", portrait, cardCount: 0, rejectedCardCount: 0 };
  }
  const cards = readDgSceneNodes(stage).filter(node => isDgMultiLobbyCard(node) && dgSceneNodeVisible(node));
  if (!cards.length) return { readiness: "waiting-multi-table", portrait, cardCount: 0, rejectedCardCount: 0 };
  const rejectedCardCount = cards.filter(card => !hasDgVerifiedDirectPacketBuilder(card)).length;
  return {
    readiness: rejectedCardCount ? "unverified-packet-builder" : "compatible",
    portrait,
    cardCount: cards.length,
    rejectedCardCount,
  };
}
