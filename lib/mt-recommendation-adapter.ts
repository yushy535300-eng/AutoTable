import { pokerDecision, mtPreviousPoker } from './poker-strategies';
import { localProviderDecision, getPatternInfo } from "./dg-original-ai";

/** A completed baccarat-road result as emitted by the MT diagnostic. */
export type Result = "莊" | "閒" | "和";

export type MtRecommendationProvider =
  | "chatgpt"
  | "gemini"
  | "grok"
  | "meta"
  | "combined"
  | "road"
  | "counting"
  | "parity";

export type MtRecommendationFailure = {
  ok: false;
  reason: string;
  tableName: string;
};

export type MtRecommendationSuccess = {
  ok: true;
  tableName: string;
  provider: MtRecommendationProvider;
  side: "莊" | "閒";
  confidence: number;
  shoe: string;
  round: number;
  roundKey: string;
  count: number | null;
  canBet: boolean;
  reason: string | null;
  candidateIds: string[];
  gameSnById: Record<string, string>;
  results: Result[];
  dataSource: "exact-native-id" | "candidate-consensus";
  pattern: { label: string };
  strategyReason?: string;
};

export type MtRecommendation =
  | MtRecommendationFailure
  | MtRecommendationSuccess;

type UnknownRecord = Record<string, unknown>;

type CachedRoad = {
  shoe: string;
  round: number;
  results: Result[];
  lastResultKey?: string;
  lastResultAt?: number;
};

type ResolvedRoad = {
  state: CachedRoad;
  clock: UnknownRecord;
  clockShoe: string;
  clockRound: number;
  clockInSync: boolean;
  gameSn: string;
  gameSnMismatch: boolean;
  tableId: string;
};

type SourceRoad =
  | { kind: "absent" }
  | { kind: "invalid"; reason: string }
  | { kind: "road"; state: CachedRoad };

const PROVIDERS: readonly MtRecommendationProvider[] = [
  "chatgpt",
  "gemini",
  "grok",
  "meta",
  "combined",
  "road", "counting", "parity",
];

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function usableText(value: unknown): string {
  const valueText = text(value);
  return valueText && !/^(?:-|—|null|undefined)$/i.test(valueText)
    ? valueText
    : "";
}

function wholeNumber(value: unknown): number | null {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(numberValue) && numberValue >= 1
    ? numberValue
    : null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function timestamp(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isResult(value: unknown): value is Result {
  return value === "莊" || value === "閒" || value === "和";
}

function resultsFrom(value: unknown): Result[] | null {
  if (!Array.isArray(value) || !value.every(isResult)) return null;
  return value.slice();
}

function sameResults(left: readonly Result[], right: readonly Result[]) {
  return (
    left.length === right.length &&
    left.every((result, index) => result === right[index])
  );
}

function startsWithResults(
  value: readonly Result[],
  prefix: readonly Result[],
) {
  return (
    value.length >= prefix.length &&
    prefix.every((result, index) => result === value[index])
  );
}

/**
 * `rawRoad` is the diagnostic's evidence that this snapshot actually carried a
 * native bead plate.  A diagnostic update that merely copied old `results`
 * while advancing `snapshot.round` deliberately does not pass this check.
 */
function hasNativeRoad(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function winnerToResult(value: unknown): Result | null {
  if (isResult(value)) return value;
  const normalized =
    typeof value === "string" ? value.trim().toUpperCase() : value;
  if (normalized === 1 || normalized === "1" || normalized === "PLAYER")
    return "閒";
  if (normalized === 2 || normalized === "2" || normalized === "BANKER")
    return "莊";
  if (normalized === 3 || normalized === "3" || normalized === "TIE")
    return "和";
  return null;
}

function sourceRoad(table: UnknownRecord): SourceRoad {
  const snapshot = asRecord(table.snapshot);
  if (!snapshot || !hasNativeRoad(snapshot.rawRoad)) return { kind: "absent" };

  if (snapshot.roadVerifiedAgainstTotals !== true) {
    return { kind: "invalid", reason: "原生 bead 牌路未通過 totals 驗證" };
  }

  const shoe = usableText(snapshot.shoe);
  const round = wholeNumber(snapshot.round);
  const results = resultsFrom(snapshot.results);
  if (!shoe || !round || !results) {
    return { kind: "invalid", reason: "原生 bead 快照欄位不完整" };
  }
  if (results.length !== round - 1) {
    return {
      kind: "invalid",
      reason: "原生 bead 牌路與 snapshot.round 不一致",
    };
  }
  return { kind: "road", state: { shoe, round, results } };
}

function validClock(
  table: UnknownRecord,
):
  | { ok: true; clock: UnknownRecord; shoe: string; round: number }
  | { ok: false; reason: string } {
  const clock = asRecord(table.clock);
  const shoe = usableText(clock?.shoe);
  const round = wholeNumber(clock?.round);
  if (!clock || !shoe || !round)
    return { ok: false, reason: "目前 clock 缺少有效 shoe/round" };
  return { ok: true, clock, shoe, round };
}

function gameSnFor(table: UnknownRecord) {
  const snapshot = asRecord(table.snapshot);
  const clock = asRecord(table.clock);
  const snapshotGameSn = usableText(snapshot?.gameSn);
  const clockGameSn = usableText(clock?.gameSn);
  const sameRound = snapshot?.shoe === clock?.shoe && snapshot?.round === clock?.round;
  return {
    gameSn: clockGameSn || (sameRound ? snapshotGameSn : ""),
    mismatch: Boolean(
      sameRound && snapshotGameSn && clockGameSn && snapshotGameSn !== clockGameSn,
    ),
  };
}

function incrementFromLastResult(
  previous: CachedRoad,
  table: UnknownRecord,
  clockShoe: string,
  clockRound: number,
): CachedRoad | null {
  // A show_win is usable only for exactly the next completed round of the
  // current shoe.  It can never change shoe, fill a gap, or replay a round.
  if (previous.shoe !== clockShoe || clockRound !== previous.round + 1)
    return null;

  const last = asRecord(table.lastTableResult);
  if (!last) return null;
  const shoe = usableText(last.shoe);
  const round = wholeNumber(last.round);
  const result = winnerToResult(last.result) ?? winnerToResult(last.winner);
  const at = timestamp(last.at);
  const key = shoe && round ? `${shoe}|${round}` : "";
  if (
    !shoe ||
    shoe !== previous.shoe ||
    !round ||
    round !== previous.round ||
    !result ||
    at === null ||
    !key ||
    previous.lastResultKey === key ||
    (previous.lastResultAt !== undefined && at < previous.lastResultAt)
  ) {
    return null;
  }

  return {
    shoe: previous.shoe,
    round: clockRound,
    results: [...previous.results, result],
    lastResultKey: key,
    lastResultAt: at,
  };
}

function roadMatchesClock(
  state: CachedRoad,
  clockShoe: string,
  clockRound: number,
) {
  return state.shoe === clockShoe && state.round === clockRound;
}

function roadError(reason: string): { ok: false; reason: string } {
  return { ok: false, reason };
}

/**
 * Makes a pure, stateful validator around the existing local recommendation
 * formula.  It never maps a DOM name to a native ID; unknown-ID tables need a
 * consensus across every diagnostic candidate and the eventual native UI order
 * flow remains responsible for resolving that candidate set.
 */
export function createMtRecommendationAdapter() {
  const roads = new Map<string, CachedRoad>();

  function resolveRoad(
    table: UnknownRecord,
  ): { ok: true; value: ResolvedRoad } | { ok: false; reason: string } {
    const tableId = usableText(table.tableId);
    if (!tableId) return roadError("liveTables 缺少原生 tableId");

    const currentClock = validClock(table);
    if (!currentClock.ok) return roadError(currentClock.reason);

    const source = sourceRoad(table);
    const cached = roads.get(tableId);
    if (source.kind === "invalid" && (!cached || source.reason !== "原生 bead 牌路與 snapshot.round 不一致")) {
      return roadError(source.reason);
    }
    let state = cached;
    if (source.kind === "road") {
      const native = source.state;
      if (!cached) {
        state = native;
      } else if (native.shoe === cached.shoe) {
        if (native.round < cached.round) {
          // A delayed, but otherwise valid, native snapshot cannot regress the
          // independently verified road.  It must still be a prefix, however.
          if (!startsWithResults(cached.results, native.results)) {
            return roadError("舊原生 bead 快照與已驗證牌路衝突");
          }
          state = cached;
        } else if (native.round === cached.round) {
          if (!sameResults(native.results, cached.results)) {
            return roadError("同一局原生 bead 牌路衝突");
          }
          state = native;
        } else {
          // Native snapshots may skip observations; accept one only when it is
          // a complete continuation of this ID's previous verified road.
          if (!startsWithResults(native.results, cached.results)) {
            return roadError("原生 bead 牌路不是連續延伸");
          }
          state = native;
        }
      } else {
        // A shoe may reset only through a complete verified native snapshot,
        // never through lastTableResult or a phase/clock packet.
        state = native;
      }
      roads.set(tableId, state);
    }

    if (!state) return roadError("沒有完整且已驗證的原生 bead 牌路");

    if (!roadMatchesClock(state, currentClock.shoe, currentClock.round)) {
      const incremented = incrementFromLastResult(
        state,
        table,
        currentClock.shoe,
        currentClock.round,
      );
      if (incremented) {
        state = incremented;
        roads.set(tableId, state);
      }
    }

    const clockInSync = roadMatchesClock(
      state,
      currentClock.shoe,
      currentClock.round,
    );
    if (!clockInSync) {
      // A newer clock without one verified result is not an invitation to infer
      // a road.  An older same-shoe clock is allowed for preview only so it
      // cannot roll the cache backward; a shoe mismatch is unsafe altogether.
      if (state.shoe !== currentClock.shoe) {
        return roadError("clock 與已驗證牌路跨靴，不能推算牌路");
      }
      if (currentClock.round > state.round) {
        return roadError("clock 已前進但沒有連續的已驗證結果");
      }
    }

    if (state.results.length === 0)
      return roadError("沒有已完成結果，不能預設推薦莊");

    const gameSn = gameSnFor(table);
    return {
      ok: true,
      value: {
        state,
        clock: currentClock.clock,
        clockShoe: currentClock.shoe,
        clockRound: currentClock.round,
        clockInSync,
        gameSn: gameSn.gameSn,
        gameSnMismatch: gameSn.mismatch,
        tableId,
      },
    };
  }

  function preview(
    report: unknown,
    tableName: string,
    provider: MtRecommendationProvider,
    now = Date.now(),
  ): MtRecommendation {
    if (!PROVIDERS.includes(provider)) {
      return { ok: false, reason: "不支援的推薦 provider", tableName };
    }

    const root = asRecord(report);
    const viewport = asRecord(root?.tableViewport);
    const viewportTables = Array.isArray(viewport?.tables)
      ? (viewport.tables.map(asRecord).filter(Boolean) as UnknownRecord[])
      : [];
    const normalizedName = text(tableName);
    const viewportMatches = viewportTables.filter(
      (entry) => text(entry.name) === normalizedName,
    );
    if (viewportMatches.length !== 1) {
      return {
        ok: false,
        reason:
          viewportMatches.length > 1
            ? "viewport 出現重複 DOM table name"
            : "viewport 找不到指定 DOM table name",
        tableName,
      };
    }

    const liveTables = Array.isArray(root?.liveTables)
      ? (root.liveTables.map(asRecord).filter(Boolean) as UnknownRecord[])
      : [];
    const byId = new Map<string, UnknownRecord>();
    for (const table of liveTables) {
      const id = usableText(table.tableId);
      if (!id) continue;
      const key = id.toUpperCase();
      if (byId.has(key))
        return {
          ok: false,
          reason: "liveTables 有重複原生 tableId",
          tableName,
        };
      byId.set(key, table);
    }

    const viewportTable = viewportMatches[0];
    const confirmedId = usableText(viewportTable.tableId);
    let selected: UnknownRecord[];
    let dataSource: MtRecommendationSuccess["dataSource"];
    if (confirmedId) {
      const exact = byId.get(confirmedId.toUpperCase());
      if (!exact)
        return {
          ok: false,
          reason: "已確認的原生 tableId 沒有 live 資料",
          tableName,
        };
      selected = [exact];
      dataSource = "exact-native-id";
    } else {
      const candidateValues = Array.isArray(viewportTable.candidateIds)
        ? viewportTable.candidateIds
        : [];
      const candidateKeys = candidateValues
        .map(usableText)
        .filter(Boolean)
        .map((id) => id.toUpperCase());
      if (!candidateKeys.length)
        return {
          ok: false,
          reason: "未確認原生 tableId 且沒有候選 ID",
          tableName,
        };
      if (new Set(candidateKeys).size !== candidateKeys.length) {
        return { ok: false, reason: "候選原生 tableId 重複", tableName };
      }
      selected = [];
      for (const key of candidateKeys) {
        const candidate = byId.get(key);
        if (!candidate)
          return {
            ok: false,
            reason: "候選原生 tableId 沒有 live 資料",
            tableName,
          };
        // With no exact ID, every candidate must explicitly claim the same DOM
        // display name.  There is intentionally no BAVxx/LIVE name heuristic.
        if (text(candidate.name) !== normalizedName) {
          return {
            ok: false,
            reason: "候選原生 ID 與 DOM table name 不一致",
            tableName,
          };
        }
        selected.push(candidate);
      }
      dataSource = "candidate-consensus";
    }

    const resolved: ResolvedRoad[] = [];
    for (const table of selected) {
      const result = resolveRoad(table);
      if (!result.ok) return { ok: false, reason: result.reason, tableName };
      resolved.push(result.value);
    }

    const first = resolved[0];
    if (!first) return { ok: false, reason: "沒有可用的原生桌資料", tableName };
    if (dataSource === "candidate-consensus") {
      const consensus = resolved.every(
        (entry) =>
          entry.clockInSync &&
          entry.state.shoe === first.state.shoe &&
          entry.state.round === first.state.round &&
          sameResults(entry.state.results, first.state.results),
      );
      if (!consensus) {
        return {
          ok: false,
          reason: "候選原生 ID 的完整牌路、shoe 或 round 不一致",
          tableName,
        };
      }
    }

    const candidateIds = resolved.map((entry) => entry.tableId);
    const gameSnById = Object.fromEntries(
      resolved.map((entry) => [entry.tableId, entry.gameSn]),
    );
    const counts = resolved.map((entry) => finiteNumber(entry.clock.count));
    const count = counts.every((value): value is number => value !== null)
      ? Math.min(...counts)
      : null;

    const betIssues: string[] = [];
    for (const entry of resolved) {
      if (!entry.clockInSync) betIssues.push("clock 與牌路未同步");
      if (entry.clock.phase !== "wait") betIssues.push("目前不是 wait 階段");
      const at = timestamp(entry.clock.at);
      if (at === null || now < at || now - at > 3500)
        betIssues.push("clock 已過時或時間異常");
      const candidateCount = finiteNumber(entry.clock.count);
      if (candidateCount === null || candidateCount <= 0)
        betIssues.push("倒數 count 不可下注");
      if (!entry.gameSn || entry.gameSnMismatch)
        betIssues.push("gameSn 無效或未同步");
    }

    let decision: {side:'莊'|'閒';confidence:number};
    let strategyReason: string | undefined;
    if (provider === 'counting' || provider === 'parity') {
      const hands = selected.map(table=>mtPreviousPoker(table,first.state.shoe,first.state.round));
      if (hands.some(hand=>!hand)) return {ok:false,tableName,reason:'等待同桌同靴上一局完整 show_poker；不以牌路或點數代替'};
      if (!hands.every(hand=>JSON.stringify(hand)===JSON.stringify(hands[0]))) return {ok:false,tableName,reason:'候選原生桌的實際牌張不一致，不能使用奇偶／算牌'};
      const calculated=pokerDecision(provider,hands[0]);
      if (!calculated.ok) return {ok:false,tableName,reason:calculated.reason};
      decision=calculated;strategyReason=calculated.reason;
    } else decision = localProviderDecision(provider, first.state.results);
    return {
      ok: true,
      tableName,
      provider,
      strategyReason,
      side: decision.side,
      confidence: decision.confidence,
      shoe: first.state.shoe,
      round: first.state.round,
      roundKey: `${first.state.shoe}|${first.state.round}`,
      count,
      canBet: betIssues.length === 0,
      reason: betIssues.length ? [...new Set(betIssues)].join("；") : null,
      candidateIds,
      gameSnById,
      results: first.state.results.slice(),
      dataSource,
      pattern: { label: getPatternInfo(first.state.results).label },
    };
  }

  return { preview };
}
