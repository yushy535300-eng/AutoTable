// 自原始 legacy-platform-screen.tsx 抽取；本地策略，未呼叫任何 AI API。
import { buildDerivedRoad, buildAskRoad } from './road-render';
type Result = '莊' | '閒' | '和';
type AiProvider = 'chatgpt' | 'gemini' | 'grok' | 'meta' | 'combined' | 'road';
type TableData = {results:Result[]};
const AI_PROVIDER_OPTIONS: Array<{
  key: AiProvider | 'counting' | 'parity';
  label: string;
}> = [
  { key: "chatgpt", label: "ChatGPT" },
  { key: "gemini", label: "Gemini" },
  { key: "grok", label: "Grok" },
  { key: "meta", label: "Meta AI" },
  { key: "combined", label: "AI綜合" },
  { key: "road", label: "牌路策略" },
];


AI_PROVIDER_OPTIONS.push({key:'counting',label:'V38 四式算牌'},{key:'parity',label:'奇偶策略'});
type PatternInfo = {
  type:
    "資料累積中" | "一房兩廳" | "單跳" | "雙跳" | "連龍" | "一般連" | "混合";
  label: string;
  side?: "莊" | "閒";
  run?: number;
};

function roadSides(results: Result[]): ("莊" | "閒")[] {
  return results.filter((r): r is "莊" | "閒" => r === "莊" || r === "閒");
}

function columnRuns(results: Result[]) {
  const seq = roadSides(results);
  const runs: { side: "莊" | "閒"; length: number }[] = [];
  for (const side of seq) {
    const last = runs[runs.length - 1];
    if (last?.side === side) last.length += 1;
    else runs.push({ side, length: 1 });
  }
  return runs;
}

function tailAlternating(
  runs: { side: "莊" | "閒"; length: number }[],
  size: number,
  len: number,
) {
  if (runs.length < size) return false;
  const x = runs.slice(-size);
  return (
    x.every((r) => r.length === len) &&
    x.every((r, i) => i === 0 || r.side !== x[i - 1].side)
  );
}

function getPatternInfo(results: Result[]): PatternInfo {
  const seq = roadSides(results);
  const runs = columnRuns(results);
  if (seq.length < 3 || !runs.length)
    return { type: "資料累積中", label: "資料累積中" };
  const lastRun = runs[runs.length - 1];

  // 使用實際大路「柱」判斷，不再只抓 raw results 最後三顆。
  // 使用者規則：連 4 起才叫龍；連 2/3 只叫連。
  if (lastRun.length >= 4)
    return {
      type: "連龍",
      label: `${lastRun.side}龍${lastRun.length}顆`,
      side: lastRun.side,
      run: lastRun.length,
    };

  // 單跳：至少最近四柱都是 1 格。
  if (tailAlternating(runs, 4, 1))
    return { type: "單跳", label: "單跳", side: lastRun.side };

  // 雙跳：至少最近三柱都是 2 格。
  if (tailAlternating(runs, 3, 2))
    return { type: "雙跳", label: "雙跳", side: lastRun.side };

  // 兩閒一莊 / 兩莊一閒：
  // 禁止只看最後 3 柱的 2-1-2 就命名。至少要看到兩次完整重複節奏，
  // 才能確認這是一個持續牌型；否則視為轉型/混合路，再交由下三路與問路確認。
  if (runs.length >= 6) {
    const x = runs.slice(-6);
    const twoPlayerOneBanker =
      x[0].side === "閒" &&
      x[0].length === 2 &&
      x[1].side === "莊" &&
      x[1].length === 1 &&
      x[2].side === "閒" &&
      x[2].length === 2 &&
      x[3].side === "莊" &&
      x[3].length === 1 &&
      x[4].side === "閒" &&
      x[4].length === 2 &&
      x[5].side === "莊" &&
      x[5].length === 1;
    const twoBankerOnePlayer =
      x[0].side === "莊" &&
      x[0].length === 2 &&
      x[1].side === "閒" &&
      x[1].length === 1 &&
      x[2].side === "莊" &&
      x[2].length === 2 &&
      x[3].side === "閒" &&
      x[3].length === 1 &&
      x[4].side === "莊" &&
      x[4].length === 2 &&
      x[5].side === "閒" &&
      x[5].length === 1;
    if (twoPlayerOneBanker)
      return { type: "一房兩廳", label: "兩閒一莊", side: "閒" };
    if (twoBankerOnePlayer)
      return { type: "一房兩廳", label: "兩莊一閒", side: "莊" };
  }

  if (lastRun.length >= 2)
    return {
      type: "一般連",
      label: `${lastRun.side}連${lastRun.length}`,
      side: lastRun.side,
      run: lastRun.length,
    };
  return { type: "混合", label: "轉型／混合路", side: lastRun.side };
}

function derivedTailPreference(
  results: Result[],
  offset: 1 | 2 | 3,
): "莊" | "閒" | null {
  const marks = buildDerivedRoad(results, offset, offset === 2);
  if (!marks.length) return null;
  const seq = marks
    .map((m) => m.result)
    .filter((r): r is "莊" | "閒" => r === "莊" || r === "閒");
  if (!seq.length) return null;

  // 先看尾段自己的節奏：連則續色；明顯交替則續跳。
  const last = seq[seq.length - 1];
  let run = 1;
  for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) run++;
  if (run >= 2) return last;
  if (seq.length >= 4) {
    const x = seq.slice(-4);
    if (x[0] !== x[1] && x[1] !== x[2] && x[2] !== x[3])
      return last === "莊" ? "閒" : "莊";
  }

  // 無明顯尾型時參考整段較近期的結構，但不把紅藍直接當莊閒。
  const tail = seq.slice(-8);
  let same = 0,
    change = 0;
  for (let i = 1; i < tail.length; i++)
    tail[i] === tail[i - 1] ? same++ : change++;
  return change > same ? (last === "莊" ? "閒" : "莊") : last;
}

function roadDecision(results: Result[]) {
  const seq = roadSides(results);
  if (!seq.length)
    return {
      side: "莊" as const,
      scoreBanker: 0,
      scorePlayer: 0,
      reason: "等待牌路資料",
    };

  const info = getPatternInfo(results);
  const ask = buildAskRoad(results);
  const prefs = [
    derivedTailPreference(results, 1),
    derivedTailPreference(results, 2),
    derivedTailPreference(results, 3),
  ];
  const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
  const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];

  let b = 0,
    p = 0;
  // 三條下三路等權重：問路新增色若符合該路目前節奏就加分。
  prefs.forEach((pref, i) => {
    if (!pref) return;
    if (bankerAsk[i] === pref) b += 2;
    if (playerAsk[i] === pref) p += 2;
  });

  const runs = columnRuns(results);
  const last = seq[seq.length - 1];
  // 大路整體牌型作主判斷；下三路與問路作二次確認。
  if (info.type === "連龍") {
    if (last === "莊") b += 4;
    else p += 4;
  } else if (info.type === "單跳") {
    if (last === "莊") p += 4;
    else b += 4;
  } else if (info.type === "雙跳") {
    if (last === "莊") b += 4;
    else p += 4;
  } else if (info.type === "一房兩廳" && info.side) {
    if (info.side === "莊") b += 3;
    else p += 3;
  } else if (info.type === "一般連") {
    if (last === "莊") b += 2;
    else p += 2;
  }

  // 全路段柱型微量參考，避免只看尾端。
  const recentRuns = runs.slice(-10);
  const bankerDepth = recentRuns
    .filter((r) => r.side === "莊")
    .reduce((s, r) => s + r.length, 0);
  const playerDepth = recentRuns
    .filter((r) => r.side === "閒")
    .reduce((s, r) => s + r.length, 0);
  if (bankerDepth > playerDepth) b += 0.5;
  else if (playerDepth > bankerDepth) p += 0.5;

  // 強制二選一；完全同分時以問路吻合數，再以目前大路轉向決勝。
  const side: "莊" | "閒" =
    b === p ? (last === "莊" ? "閒" : "莊") : b > p ? "莊" : "閒";
  const fmt = (x: Result | null) =>
    x === "莊" ? "紅" : x === "閒" ? "藍" : "—";
  return {
    side,
    scoreBanker: b,
    scorePlayer: p,
    reason: `${info.label}｜莊問路 ${bankerAsk.map(fmt).join("・")}｜閒問路 ${playerAsk.map(fmt).join("・")}｜三路綜合 ${b.toFixed(1)}:${p.toFixed(1)}`,
  };
}

function detectPattern(results: Result[]) {
  return getPatternInfo(results).label;
}

// Confidence is deliberately independent from the banker/player recommendation.
// Recommendation direction stays untouched; this layer only measures how clear and
// stable the CURRENT REAL ROAD is for the already-selected side.
function confidencePercent(scoreBanker: number, scorePlayer: number) {
  const gap = Math.abs(scoreBanker - scorePlayer);
  return Math.max(0, Math.min(100, Math.round((gap / 6) * 100)));
}

function roadBasedConfidence(
  results: Result[],
  recommendedSide: "莊" | "閒",
  originalConfidence = 60,
) {
  const seq = roadSides(results);
  if (seq.length < 3) return 40;

  const recent = seq.slice(-10);
  const recent6 = seq.slice(-6);
  const last = seq[seq.length - 1] as "莊" | "閒";
  let streak = 1;
  for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) streak += 1;

  let changes = 0;
  for (let i = 1; i < recent6.length; i++) if (recent6[i] !== recent6[i - 1]) changes += 1;
  const altRate = recent6.length > 1 ? changes / (recent6.length - 1) : 0.5;
  const info = getPatternInfo(results);

  // Start neutral. Only road clarity/stability can push it high or low.
  let score = 52;

  if (info.type === "連龍") score += 15;
  else if (info.type === "單跳") score += 14;
  else if (info.type === "雙跳") score += 13;
  else if (info.type === "一房兩廳") score += 10;
  else if (info.type === "一般連") score += 6;
  else score -= 8;

  // Clear continuation OR clear alternating rhythm is more trustworthy than a mixed tail.
  if (altRate >= 0.82 || altRate <= 0.18) score += 9;
  else if (altRate >= 0.35 && altRate <= 0.65) score -= 7;

  if (streak >= 5) score += 9;
  else if (streak >= 3) score += 5;

  // Check whether the three derived roads are mutually coherent. This never changes side.
  const prefs = [
    derivedTailPreference(results, 1),
    derivedTailPreference(results, 2),
    derivedTailPreference(results, 3),
  ].filter((x): x is "莊" | "閒" => x === "莊" || x === "閒");
  if (prefs.length >= 2) {
    const bankerVotes = prefs.filter((x) => x === "莊").length;
    const playerVotes = prefs.length - bankerVotes;
    const majority = bankerVotes === playerVotes ? null : bankerVotes > playerVotes ? "莊" : "閒";
    if (bankerVotes === prefs.length || playerVotes === prefs.length) score += 8;
    else if (majority) score += 3;
    else score -= 4;
    if (majority === recommendedSide) score += 5;
    else if (majority) score -= 4;
  }

  // Compare with the existing road decision only as SUPPORT for confidence; never overwrite recommendation.
  const roadSide = roadDecision(results).side;
  score += roadSide === recommendedSide ? 6 : -5;

  // Preserve a small amount of each AI's original conviction without letting it dominate road structure.
  score += Math.round((Math.max(35, Math.min(95, originalConfidence)) - 60) * 0.22);

  // Very short / mixed recent history should not accidentally become high confidence.
  const b = recent.filter((x) => x === "莊").length;
  const p = recent.length - b;
  if (recent.length >= 8 && Math.abs(b - p) <= 1 && altRate > 0.2 && altRate < 0.8) score -= 5;

  return Math.max(35, Math.min(95, Math.round(score)));
}

function confidenceState(percent: number) {
  if (percent >= 75) return { label: "高可信", color: "#43E07A" };
  if (percent >= 55) return { label: "中可信", color: "#FFD447" };
  return { label: "低可信", color: "#FF5B63" };
}

function recommendSide(results: Result[]): "莊" | "閒" {
  return roadDecision(results).side;
}

function analysisText(table?: TableData) {
  if (!table) return "等待牌局資料。";
  const seq = roadSides(table.results);
  if (seq.length < 3) return "目前資料累積中，第三顆開始判斷牌型。";

  const info = getPatternInfo(table.results);
  const d = roadDecision(table.results);
  const ask = buildAskRoad(table.results);
  const prefs = [
    derivedTailPreference(table.results, 1),
    derivedTailPreference(table.results, 2),
    derivedTailPreference(table.results, 3),
  ];

  const colorName = (x: Result | null) =>
    x === "莊" ? "紅" : x === "閒" ? "藍" : "—";
  const prefName = (x: "莊" | "閒" | null) =>
    x === "莊" ? "偏紅" : x === "閒" ? "偏藍" : "資料不足";

  const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
  const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];

  return [
    `【大路】${info.label}。`,
    `【大眼仔】${prefName(prefs[0])}；【小路】${prefName(prefs[1])}；【曱甴路】${prefName(prefs[2])}。`,
    `【莊問路】${bankerAsk.map(colorName).join("・")}；【閒問路】${playerAsk.map(colorName).join("・")}。`,
    `【綜合】莊 ${d.scoreBanker.toFixed(1)}／閒 ${d.scorePlayer.toFixed(1)}，整段牌路與三路問路綜合後，我會選${d.side}。`,
  ].join("\n");
}


function providerAnalysisText(provider: AiProvider, table?: TableData) {
  if (!table) return `【${AI_PROVIDER_OPTIONS.find((x) => x.key === provider)?.label ?? "AI"}】等待牌局資料。`;
  const seq = roadSides(table.results);
  const label = AI_PROVIDER_OPTIONS.find((x) => x.key === provider)?.label ?? "AI";
  if (seq.length < 3) return `【${label}】目前資料累積中，第三顆開始判斷牌型。`;

  const info = getPatternInfo(table.results);
  const ask = buildAskRoad(table.results);
  const prefs = [
    derivedTailPreference(table.results, 1),
    derivedTailPreference(table.results, 2),
    derivedTailPreference(table.results, 3),
  ];
  const colorName = (x: Result | null) => x === "莊" ? "紅" : x === "閒" ? "藍" : "—";
  const prefName = (x: "莊" | "閒" | null) => x === "莊" ? "偏紅" : x === "閒" ? "偏藍" : "資料不足";
  const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
  const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];
  const local = localProviderDecision(provider, table.results ?? []);

  const road = roadSides(table.results);
  const recent = road.slice(-12);
  const recentBanker = recent.filter((x) => x === "莊").length;
  const recentPlayer = recent.filter((x) => x === "閒").length;
  const last = road.at(-1);
  let streak = 0;
  if (last) for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
  let changes = 0;
  for (let i = Math.max(1, road.length - 8); i < road.length; i += 1) if (road[i] !== road[i - 1]) changes += 1;

  const roadLineByProvider: Record<AiProvider, string> = {
    chatgpt: `【大路】${info.label}，近段節奏${changes >= 5 ? "切換較密" : streak >= 3 ? "連續性較強" : "偏混合"}。`,
    gemini: `【大路】${info.label}，目前結構以${streak >= 3 ? "短龍延續" : changes >= 5 ? "單跳／轉折" : "混合段"}為主。`,
    grok: `【大路】${info.label}，短線最近${Math.min(6, road.length)}手${changes >= 4 ? "切換頻繁" : "動能較集中"}。`,
    meta: `【大路】${info.label}，近12手莊${recentBanker}／閒${recentPlayer}，分布${Math.abs(recentBanker-recentPlayer) <= 2 ? "接近" : "已有偏向"}。`,
    combined: `【大路】${info.label}，四種角度綜合比對目前節奏、結構與分布。`,
    road: `【大路】${info.label}。`,
  };
  const finishByProvider: Record<AiProvider, string> = {
    chatgpt: `【綜合】依近期節奏、連續性與轉折判斷，本局推薦${local.side}。`,
    gemini: `【結構】依大路結構、單跳／短龍與轉折位置判斷，本局推薦${local.side}。`,
    grok: `【短線】依最近幾手動能與切換速度判斷，本局推薦${local.side}。`,
    meta: `【比例】依近期莊閒分布、偏移與回補條件判斷，本局推薦${local.side}。`,
    combined: (() => {
      const parts = (["chatgpt","gemini","grok","meta"] as AiProvider[]).map((x) => ({ key:x, ...localProviderDecision(x, table.results ?? []) }));
      const b = parts.filter((x) => x.side === "莊").length;
      const pl = parts.filter((x) => x.side === "閒").length;
      return `【綜合】ChatGPT ${parts[0].side}／Gemini ${parts[1].side}／Grok ${parts[2].side}／Meta AI ${parts[3].side}；莊${b}：閒${pl}，本局推薦${local.side}。`;
    })(),
    road: `【綜合】依大路、下三路與莊閒問路綜合判斷，本局推薦${local.side}。`,
  };

  return [
    `【${label}】`,
    roadLineByProvider[provider],
    `【大眼仔】${prefName(prefs[0])}；【小路】${prefName(prefs[1])}；【曱甴路】${prefName(prefs[2])}。`,
    `【莊問路】${bankerAsk.map(colorName).join("・")}；【閒問路】${playerAsk.map(colorName).join("・")}。`,
    finishByProvider[provider],
  ].join("\n");
}

function localProviderDecision(provider: AiProvider, results: Result[]): {side: "莊" | "閒"; confidence: number} {
  const road = roadSides(results);
  const base = roadDecision(results);
  const fallback = base.side;
  const value = (x?: Result | string | null) => x === "莊" ? 1 : x === "閒" ? -1 : 0;
  const weighted = (take: number) => {
    const arr = road.slice(-take);
    return arr.reduce((sum, x, i) => sum + value(x) * (1 + (i / Math.max(1, arr.length - 1)) * 1.7), 0);
  };
  const distribution = (take: number) => road.slice(-take).reduce((sum, x) => sum + value(x), 0);
  const alternation = (take: number) => {
    const arr = road.slice(-take);
    if (arr.length < 2) return 0;
    let changes = 0;
    for (let i = 1; i < arr.length; i += 1) if (arr[i] !== arr[i - 1]) changes += 1;
    return changes / (arr.length - 1);
  };
  const last = road.at(-1) as "莊" | "閒" | undefined;
  const opposite = (x?: "莊" | "閒") => x === "莊" ? "閒" as const : "莊" as const;
  let streak = 0;
  if (last) {
    for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
  }
  const pick = (score: number, tie: "莊" | "閒") => Math.abs(score) < 0.5 ? tie : score > 0 ? "莊" as const : "閒" as const;
  const finalize = (side: "莊" | "閒", rawConfidence: number) => ({
    side,
    confidence: roadBasedConfidence(results, side, rawConfidence),
  });
  if (provider === "road") {
    return finalize(base.side, confidencePercent(base.scoreBanker, base.scorePlayer));
  }
  if (provider === "chatgpt") {
    const score = weighted(12) * 0.34 + (streak >= 2 ? value(last) * Math.min(2, streak * 0.5) : 0) + (alternation(10) >= 0.78 ? -value(last) * 0.75 : 0);
    return finalize(pick(score, fallback), Math.max(45, Math.min(92, 58 + Math.round(Math.abs(score) * 4))));
  }
  if (provider === "gemini") {
    let score = (1 - alternation(6)) * distribution(14) * 0.2;
    if (last && alternation(6) >= 0.72) score += -value(last) * 1.55;
    if (streak === 2 || streak === 3) score += value(last) * 0.9;
    if (streak >= 5) score -= value(last) * 0.55;
    const tie = last && alternation(6) >= 0.67 ? opposite(last) : fallback;
    return finalize(pick(score, tie), Math.max(44, Math.min(90, 56 + Math.round(Math.abs(score) * 5))));
  }
  if (provider === "grok") {
    let score = weighted(5) * 0.7 + weighted(3) * 0.38;
    if (streak >= 2) score += value(last) * Math.min(1.45, streak * 0.42);
    if (last && alternation(5) >= 0.8) score -= value(last) * 0.55;
    return finalize(pick(score, weighted(4) >= 0 ? "莊" : "閒"), Math.max(46, Math.min(93, 60 + Math.round(Math.abs(score) * 3))));
  }
  if (provider === "meta") {
    const longDist = distribution(18), shortDist = distribution(8);
    let score = -longDist * 0.2 - shortDist * 0.28;
    if (Math.abs(longDist) <= 2) score += shortDist * 0.12;
    if (streak >= 4) score -= value(last) * 1.25;
    const tie = Math.abs(distribution(12)) >= 2 ? (distribution(12) > 0 ? "閒" : "莊") : opposite(last);
    return finalize(pick(score, tie), Math.max(43, Math.min(88, 55 + Math.round(Math.abs(score) * 4))));
  }
  const parts = (["chatgpt", "gemini", "grok", "meta"] as AiProvider[]).map((x) => localProviderDecision(x, results));
  const banker = parts.filter((x) => x.side === "莊");
  const player = parts.filter((x) => x.side === "閒");
  const bWeight = banker.reduce((s, x) => s + x.confidence, 0);
  const pWeight = player.reduce((s, x) => s + x.confidence, 0);
  const side = banker.length === player.length ? (bWeight >= pWeight ? "莊" : "閒") : (banker.length > player.length ? "莊" : "閒");
  const winners = parts.filter((x) => x.side === side);
  const rawConfidence = Math.round(winners.reduce((s, x) => s + x.confidence, 0) / Math.max(1, winners.length));
  return finalize(side, rawConfidence);
}


export {localProviderDecision, providerAnalysisText, getPatternInfo, AI_PROVIDER_OPTIONS};
