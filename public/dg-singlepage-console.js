/* DG 單頁多桌自動點擊；僅在 DG 同源頁面執行。初始為停止。 */
"use strict";
(() => {
  // lib/dg-bet-ledger.ts
  function martingaleAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw new Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * (2 ** (level + 1) - 1);
    if (!Number.isSafeInteger(amount)) throw new Error("\u99AC\u4E01\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  var DgBetLedger = class {
    state;
    constructor(saved) {
      this.state = saved?.version === 1 ? JSON.parse(JSON.stringify(saved)) : { version: 1, levels: {}, bets: [] };
    }
    levelKey(tableId, scope) {
      return scope === "global" ? "global" : `table:${tableId}`;
    }
    level(tableId, scope) {
      return this.state.levels[this.levelKey(tableId, scope)] ?? 0;
    }
    pending() {
      return this.state.bets.filter((b) => ["reserved", "submitted", "accepted", "uncertain"].includes(b.state));
    }
    reserve(tableId, gameNo, side, base, scope) {
      const key = `${tableId}:${gameNo}`;
      if (!tableId || !gameNo || this.state.bets.some((b) => b.key === key)) throw new Error("\u5C40\u865F\u7F3A\u5931\u6216\u672C\u5C40\u5DF2\u64CD\u4F5C");
      if (this.pending().some((b) => scope === "global" || b.scope === "global" || b.tableId === tableId)) throw new Error("\u4E0A\u4E00\u7B14\u4ECD\u5F85\u7D50\u7B97");
      const level = this.level(tableId, scope);
      const bet = { key, tableId, gameNo, side, amount: martingaleAmount(base, level), level, scope, state: "reserved", createdAt: Date.now() };
      this.state.bets.push(bet);
      return bet;
    }
    submit(bet) {
      if (bet.state !== "reserved") throw new Error("\u4E0B\u6CE8\u72C0\u614B\u932F\u8AA4");
      bet.state = "submitted";
      bet.submittedAt = Date.now();
    }
    abort(bet) {
      if (bet.state === "reserved") bet.state = "aborted";
    }
    uncertain(bet) {
      if (bet.state === "submitted") bet.state = "uncertain";
    }
    receipt(msg) {
      if (Number(msg?.cmd) !== 6 || !msg.gameNo || msg.tableId == null) return null;
      const bet = this.state.bets.find((b) => b.key === `${msg.tableId}:${msg.gameNo}` && ["submitted", "uncertain"].includes(b.state));
      if (!bet) return null;
      if (Number(msg.codeId ?? 0) !== 0) {
        bet.state = "rejected";
        return { bet, accepted: false };
      }
      let info;
      try {
        info = JSON.parse(msg.list?.[0] ?? "");
      } catch {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      const banker = Number(info.banker ?? 0) + Number(info.banker6 ?? 0), player = Number(info.player ?? 0);
      const total = banker + player + Number(info.tie ?? 0) + Number(info.bPair ?? 0) + Number(info.pPair ?? 0);
      if ((bet.side === "\u838A" ? banker : player) !== bet.amount || total !== bet.amount) {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      bet.state = "accepted";
      bet.acceptedAt = Date.now();
      return { bet, accepted: true };
    }
    settle(msg) {
      if (Number(msg?.cmd) !== 1007 || Number(msg.codeId ?? 0) !== 0 || !msg.gameNo || msg.tableId == null) return null;
      const bet = this.state.bets.find((b) => b.key === `${msg.tableId}:${msg.gameNo}` && b.state === "accepted");
      const pnl = msg.dList?.[1];
      if (!bet || typeof pnl !== "number" || !Number.isFinite(pnl)) return null;
      const k = this.levelKey(bet.tableId, bet.scope);
      this.state.levels[k] = pnl > 0 ? 0 : pnl < 0 ? bet.level + 1 : bet.level;
      bet.pnl = pnl;
      bet.state = "settled";
      return { bet, pnl, nextLevel: this.state.levels[k] };
    }
  };
  function chipPlan(amount, denominations, limit = 120) {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("\u91D1\u984D\u7121\u6548");
    const ds = [...new Set(denominations.filter((d) => Number.isSafeInteger(d) && d > 0))].sort((a, b) => b - a);
    let frontier = /* @__PURE__ */ new Map([[0, []]]);
    const visited = /* @__PURE__ */ new Set([0]);
    for (let n = 0; n < limit; n++) {
      const next = /* @__PURE__ */ new Map();
      for (const [sum, path] of frontier) for (const d of ds) {
        const value = sum + d;
        if (value > amount || visited.has(value)) continue;
        const p = [...path, d];
        if (value === amount) return p;
        visited.add(value);
        next.set(value, p);
        if (visited.size > 5e4) throw new Error("\u7C4C\u78BC\u7D44\u5408\u904E\u591A\uFF0C\u8ACB\u8A2D\u5B9A\u5408\u9069\u7C4C\u78BC");
      }
      frontier = next;
      if (!frontier.size) break;
    }
    throw new Error("\u76EE\u524D\u7C4C\u78BC\u4E0D\u80FD\u7CBE\u78BA\u7D44\u6210\u91D1\u984D\uFF0C\u6216\u9EDE\u64CA\u6B21\u6578\u8D85\u51FA\u9650\u5236");
  }

  // lib/road-render.ts
  var cellKey = (col, row) => `${col}:${row}`;
  function buildBigRoadState(results) {
    const marks = [];
    const columns = [];
    const occupied = /* @__PURE__ */ new Set();
    let previous = null;
    let logicalCol = -1;
    let baseDisplayCol = -1;
    let last = null;
    let turned = false;
    let tailRow = 0;
    let pendingTies = 0;
    for (const raw of results) {
      if (raw === "\u548C") {
        if (last) last.tieCount = (last.tieCount ?? 0) + 1;
        else pendingTies += 1;
        continue;
      }
      const result = raw;
      const newColumn = result !== previous;
      let row = 0;
      let col = 0;
      let logicalRow = 0;
      if (newColumn) {
        logicalCol += 1;
        logicalRow = 0;
        columns[logicalCol] = { result, length: 1 };
        baseDisplayCol += 1;
        while (occupied.has(cellKey(baseDisplayCol, 0))) baseDisplayCol += 1;
        col = baseDisplayCol;
        row = 0;
        turned = false;
        tailRow = 0;
      } else {
        logicalRow = columns[logicalCol]?.length ?? 1;
        columns[logicalCol].length = logicalRow + 1;
        if (!last) {
          col = Math.max(0, baseDisplayCol);
          row = 0;
        } else if (turned) {
          row = tailRow;
          col = last.col + 1;
          while (occupied.has(cellKey(col, row))) col += 1;
        } else {
          const downRow = last.row + 1;
          if (downRow <= 5 && !occupied.has(cellKey(last.col, downRow))) {
            col = last.col;
            row = downRow;
          } else {
            turned = true;
            tailRow = last.row;
            row = tailRow;
            col = last.col + 1;
            while (occupied.has(cellKey(col, row))) col += 1;
          }
        }
      }
      const mark = {
        row,
        col,
        result,
        logicalCol,
        logicalRow,
        isNewColumn: newColumn
      };
      if (pendingTies) {
        mark.tieCount = pendingTies;
        pendingTies = 0;
      }
      marks.push(mark);
      occupied.add(cellKey(col, row));
      last = mark;
      previous = result;
    }
    return { marks, columns };
  }
  function placeDerived(sequence, filled) {
    const marks = [];
    const occupied = /* @__PURE__ */ new Set();
    let previous = null;
    let baseCol = -1;
    let last = null;
    let turned = false;
    let tailRow = 0;
    for (const result of sequence) {
      if (!last || result !== previous) {
        baseCol += 1;
        while (occupied.has(cellKey(baseCol, 0))) baseCol += 1;
        const m2 = { row: 0, col: baseCol, result, filled };
        marks.push(m2);
        occupied.add(cellKey(m2.col, m2.row));
        last = m2;
        previous = result;
        turned = false;
        tailRow = 0;
        continue;
      }
      let row, col;
      if (turned) {
        row = tailRow;
        col = last.col + 1;
        while (occupied.has(cellKey(col, row))) col += 1;
      } else {
        const down = last.row + 1;
        if (down <= 5 && !occupied.has(cellKey(last.col, down))) {
          row = down;
          col = last.col;
        } else {
          turned = true;
          tailRow = last.row;
          row = tailRow;
          col = last.col + 1;
          while (occupied.has(cellKey(col, row))) col += 1;
        }
      }
      const m = { row, col, result, filled };
      marks.push(m);
      occupied.add(cellKey(col, row));
      last = m;
    }
    return marks;
  }
  function buildDerivedRoad(results, offset, filled) {
    const { marks, columns } = buildBigRoadState(results);
    const colors = [];
    for (const mark of marks) {
      const c = mark.logicalCol ?? 0;
      const r = mark.logicalRow ?? 0;
      let color = null;
      if (r === 0) {
        const a = c - 1;
        const b = c - offset - 1;
        if (b >= 0) color = columns[a]?.length === columns[b]?.length ? "\u838A" : "\u9592";
      } else {
        const ref = c - offset;
        if (ref >= 0) {
          const len = columns[ref]?.length ?? 0;
          const sameRowOccupied = len > r;
          const aboveOccupied = len > r - 1;
          color = sameRowOccupied === aboveOccupied ? "\u838A" : "\u9592";
        }
      }
      if (color) colors.push(color);
    }
    return placeDerived(colors, filled);
  }
  function nextDerivedColor(results, outcome, offset, filled) {
    const before = buildDerivedRoad(results, offset, filled);
    const after = buildDerivedRoad([...results, outcome], offset, filled);
    return after.length > before.length ? after.at(-1)?.result ?? null : null;
  }
  function buildAskRoad(results) {
    const predict = (outcome) => ({
      bigEye: nextDerivedColor(results, outcome, 1, false),
      small: nextDerivedColor(results, outcome, 2, true),
      cockroach: nextDerivedColor(results, outcome, 3, false)
    });
    return { banker: predict("\u838A"), player: predict("\u9592") };
  }

  // lib/dg-original-ai.ts
  var AI_PROVIDER_OPTIONS = [
    { key: "chatgpt", label: "ChatGPT" },
    { key: "gemini", label: "Gemini" },
    { key: "grok", label: "Grok" },
    { key: "meta", label: "Meta AI" },
    { key: "combined", label: "AI\u7D9C\u5408" },
    { key: "road", label: "\u724C\u8DEF\u7B56\u7565" }
  ];
  function roadSides(results) {
    return results.filter((r) => r === "\u838A" || r === "\u9592");
  }
  function columnRuns(results) {
    const seq = roadSides(results);
    const runs = [];
    for (const side of seq) {
      const last = runs[runs.length - 1];
      if (last?.side === side) last.length += 1;
      else runs.push({ side, length: 1 });
    }
    return runs;
  }
  function tailAlternating(runs, size, len) {
    if (runs.length < size) return false;
    const x = runs.slice(-size);
    return x.every((r) => r.length === len) && x.every((r, i) => i === 0 || r.side !== x[i - 1].side);
  }
  function getPatternInfo(results) {
    const seq = roadSides(results);
    const runs = columnRuns(results);
    if (seq.length < 3 || !runs.length)
      return { type: "\u8CC7\u6599\u7D2F\u7A4D\u4E2D", label: "\u8CC7\u6599\u7D2F\u7A4D\u4E2D" };
    const lastRun = runs[runs.length - 1];
    if (lastRun.length >= 4)
      return {
        type: "\u9023\u9F8D",
        label: `${lastRun.side}\u9F8D${lastRun.length}\u9846`,
        side: lastRun.side,
        run: lastRun.length
      };
    if (tailAlternating(runs, 4, 1))
      return { type: "\u55AE\u8DF3", label: "\u55AE\u8DF3", side: lastRun.side };
    if (tailAlternating(runs, 3, 2))
      return { type: "\u96D9\u8DF3", label: "\u96D9\u8DF3", side: lastRun.side };
    if (runs.length >= 6) {
      const x = runs.slice(-6);
      const twoPlayerOneBanker = x[0].side === "\u9592" && x[0].length === 2 && x[1].side === "\u838A" && x[1].length === 1 && x[2].side === "\u9592" && x[2].length === 2 && x[3].side === "\u838A" && x[3].length === 1 && x[4].side === "\u9592" && x[4].length === 2 && x[5].side === "\u838A" && x[5].length === 1;
      const twoBankerOnePlayer = x[0].side === "\u838A" && x[0].length === 2 && x[1].side === "\u9592" && x[1].length === 1 && x[2].side === "\u838A" && x[2].length === 2 && x[3].side === "\u9592" && x[3].length === 1 && x[4].side === "\u838A" && x[4].length === 2 && x[5].side === "\u9592" && x[5].length === 1;
      if (twoPlayerOneBanker)
        return { type: "\u4E00\u623F\u5169\u5EF3", label: "\u5169\u9592\u4E00\u838A", side: "\u9592" };
      if (twoBankerOnePlayer)
        return { type: "\u4E00\u623F\u5169\u5EF3", label: "\u5169\u838A\u4E00\u9592", side: "\u838A" };
    }
    if (lastRun.length >= 2)
      return {
        type: "\u4E00\u822C\u9023",
        label: `${lastRun.side}\u9023${lastRun.length}`,
        side: lastRun.side,
        run: lastRun.length
      };
    return { type: "\u6DF7\u5408", label: "\u8F49\u578B\uFF0F\u6DF7\u5408\u8DEF", side: lastRun.side };
  }
  function derivedTailPreference(results, offset) {
    const marks = buildDerivedRoad(results, offset, offset === 2);
    if (!marks.length) return null;
    const seq = marks.map((m) => m.result).filter((r) => r === "\u838A" || r === "\u9592");
    if (!seq.length) return null;
    const last = seq[seq.length - 1];
    let run = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) run++;
    if (run >= 2) return last;
    if (seq.length >= 4) {
      const x = seq.slice(-4);
      if (x[0] !== x[1] && x[1] !== x[2] && x[2] !== x[3])
        return last === "\u838A" ? "\u9592" : "\u838A";
    }
    const tail = seq.slice(-8);
    let same = 0, change = 0;
    for (let i = 1; i < tail.length; i++)
      tail[i] === tail[i - 1] ? same++ : change++;
    return change > same ? last === "\u838A" ? "\u9592" : "\u838A" : last;
  }
  function roadDecision(results) {
    const seq = roadSides(results);
    if (!seq.length)
      return {
        side: "\u838A",
        scoreBanker: 0,
        scorePlayer: 0,
        reason: "\u7B49\u5F85\u724C\u8DEF\u8CC7\u6599"
      };
    const info = getPatternInfo(results);
    const ask = buildAskRoad(results);
    const prefs = [
      derivedTailPreference(results, 1),
      derivedTailPreference(results, 2),
      derivedTailPreference(results, 3)
    ];
    const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
    const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];
    let b = 0, p = 0;
    prefs.forEach((pref, i) => {
      if (!pref) return;
      if (bankerAsk[i] === pref) b += 2;
      if (playerAsk[i] === pref) p += 2;
    });
    const runs = columnRuns(results);
    const last = seq[seq.length - 1];
    if (info.type === "\u9023\u9F8D") {
      if (last === "\u838A") b += 4;
      else p += 4;
    } else if (info.type === "\u55AE\u8DF3") {
      if (last === "\u838A") p += 4;
      else b += 4;
    } else if (info.type === "\u96D9\u8DF3") {
      if (last === "\u838A") b += 4;
      else p += 4;
    } else if (info.type === "\u4E00\u623F\u5169\u5EF3" && info.side) {
      if (info.side === "\u838A") b += 3;
      else p += 3;
    } else if (info.type === "\u4E00\u822C\u9023") {
      if (last === "\u838A") b += 2;
      else p += 2;
    }
    const recentRuns = runs.slice(-10);
    const bankerDepth = recentRuns.filter((r) => r.side === "\u838A").reduce((s, r) => s + r.length, 0);
    const playerDepth = recentRuns.filter((r) => r.side === "\u9592").reduce((s, r) => s + r.length, 0);
    if (bankerDepth > playerDepth) b += 0.5;
    else if (playerDepth > bankerDepth) p += 0.5;
    const side = b === p ? last === "\u838A" ? "\u9592" : "\u838A" : b > p ? "\u838A" : "\u9592";
    const fmt = (x) => x === "\u838A" ? "\u7D05" : x === "\u9592" ? "\u85CD" : "\u2014";
    return {
      side,
      scoreBanker: b,
      scorePlayer: p,
      reason: `${info.label}\uFF5C\u838A\u554F\u8DEF ${bankerAsk.map(fmt).join("\u30FB")}\uFF5C\u9592\u554F\u8DEF ${playerAsk.map(fmt).join("\u30FB")}\uFF5C\u4E09\u8DEF\u7D9C\u5408 ${b.toFixed(1)}:${p.toFixed(1)}`
    };
  }
  function confidencePercent(scoreBanker, scorePlayer) {
    const gap = Math.abs(scoreBanker - scorePlayer);
    return Math.max(0, Math.min(100, Math.round(gap / 6 * 100)));
  }
  function roadBasedConfidence(results, recommendedSide, originalConfidence = 60) {
    const seq = roadSides(results);
    if (seq.length < 3) return 40;
    const recent = seq.slice(-10);
    const recent6 = seq.slice(-6);
    const last = seq[seq.length - 1];
    let streak = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) streak += 1;
    let changes = 0;
    for (let i = 1; i < recent6.length; i++) if (recent6[i] !== recent6[i - 1]) changes += 1;
    const altRate = recent6.length > 1 ? changes / (recent6.length - 1) : 0.5;
    const info = getPatternInfo(results);
    let score = 52;
    if (info.type === "\u9023\u9F8D") score += 15;
    else if (info.type === "\u55AE\u8DF3") score += 14;
    else if (info.type === "\u96D9\u8DF3") score += 13;
    else if (info.type === "\u4E00\u623F\u5169\u5EF3") score += 10;
    else if (info.type === "\u4E00\u822C\u9023") score += 6;
    else score -= 8;
    if (altRate >= 0.82 || altRate <= 0.18) score += 9;
    else if (altRate >= 0.35 && altRate <= 0.65) score -= 7;
    if (streak >= 5) score += 9;
    else if (streak >= 3) score += 5;
    const prefs = [
      derivedTailPreference(results, 1),
      derivedTailPreference(results, 2),
      derivedTailPreference(results, 3)
    ].filter((x) => x === "\u838A" || x === "\u9592");
    if (prefs.length >= 2) {
      const bankerVotes = prefs.filter((x) => x === "\u838A").length;
      const playerVotes = prefs.length - bankerVotes;
      const majority = bankerVotes === playerVotes ? null : bankerVotes > playerVotes ? "\u838A" : "\u9592";
      if (bankerVotes === prefs.length || playerVotes === prefs.length) score += 8;
      else if (majority) score += 3;
      else score -= 4;
      if (majority === recommendedSide) score += 5;
      else if (majority) score -= 4;
    }
    const roadSide = roadDecision(results).side;
    score += roadSide === recommendedSide ? 6 : -5;
    score += Math.round((Math.max(35, Math.min(95, originalConfidence)) - 60) * 0.22);
    const b = recent.filter((x) => x === "\u838A").length;
    const p = recent.length - b;
    if (recent.length >= 8 && Math.abs(b - p) <= 1 && altRate > 0.2 && altRate < 0.8) score -= 5;
    return Math.max(35, Math.min(95, Math.round(score)));
  }
  function providerAnalysisText(provider, table) {
    if (!table) return `\u3010${AI_PROVIDER_OPTIONS.find((x) => x.key === provider)?.label ?? "AI"}\u3011\u7B49\u5F85\u724C\u5C40\u8CC7\u6599\u3002`;
    const seq = roadSides(table.results);
    const label = AI_PROVIDER_OPTIONS.find((x) => x.key === provider)?.label ?? "AI";
    if (seq.length < 3) return `\u3010${label}\u3011\u76EE\u524D\u8CC7\u6599\u7D2F\u7A4D\u4E2D\uFF0C\u7B2C\u4E09\u9846\u958B\u59CB\u5224\u65B7\u724C\u578B\u3002`;
    const info = getPatternInfo(table.results);
    const ask = buildAskRoad(table.results);
    const prefs = [
      derivedTailPreference(table.results, 1),
      derivedTailPreference(table.results, 2),
      derivedTailPreference(table.results, 3)
    ];
    const colorName = (x) => x === "\u838A" ? "\u7D05" : x === "\u9592" ? "\u85CD" : "\u2014";
    const prefName = (x) => x === "\u838A" ? "\u504F\u7D05" : x === "\u9592" ? "\u504F\u85CD" : "\u8CC7\u6599\u4E0D\u8DB3";
    const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
    const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];
    const local = localProviderDecision(provider, table.results ?? []);
    const road = roadSides(table.results);
    const recent = road.slice(-12);
    const recentBanker = recent.filter((x) => x === "\u838A").length;
    const recentPlayer = recent.filter((x) => x === "\u9592").length;
    const last = road.at(-1);
    let streak = 0;
    if (last) for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
    let changes = 0;
    for (let i = Math.max(1, road.length - 8); i < road.length; i += 1) if (road[i] !== road[i - 1]) changes += 1;
    const roadLineByProvider = {
      chatgpt: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u8FD1\u6BB5\u7BC0\u594F${changes >= 5 ? "\u5207\u63DB\u8F03\u5BC6" : streak >= 3 ? "\u9023\u7E8C\u6027\u8F03\u5F37" : "\u504F\u6DF7\u5408"}\u3002`,
      gemini: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u76EE\u524D\u7D50\u69CB\u4EE5${streak >= 3 ? "\u77ED\u9F8D\u5EF6\u7E8C" : changes >= 5 ? "\u55AE\u8DF3\uFF0F\u8F49\u6298" : "\u6DF7\u5408\u6BB5"}\u70BA\u4E3B\u3002`,
      grok: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u77ED\u7DDA\u6700\u8FD1${Math.min(6, road.length)}\u624B${changes >= 4 ? "\u5207\u63DB\u983B\u7E41" : "\u52D5\u80FD\u8F03\u96C6\u4E2D"}\u3002`,
      meta: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u8FD112\u624B\u838A${recentBanker}\uFF0F\u9592${recentPlayer}\uFF0C\u5206\u5E03${Math.abs(recentBanker - recentPlayer) <= 2 ? "\u63A5\u8FD1" : "\u5DF2\u6709\u504F\u5411"}\u3002`,
      combined: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u56DB\u7A2E\u89D2\u5EA6\u7D9C\u5408\u6BD4\u5C0D\u76EE\u524D\u7BC0\u594F\u3001\u7D50\u69CB\u8207\u5206\u5E03\u3002`,
      road: `\u3010\u5927\u8DEF\u3011${info.label}\u3002`
    };
    const finishByProvider = {
      chatgpt: `\u3010\u7D9C\u5408\u3011\u4F9D\u8FD1\u671F\u7BC0\u594F\u3001\u9023\u7E8C\u6027\u8207\u8F49\u6298\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      gemini: `\u3010\u7D50\u69CB\u3011\u4F9D\u5927\u8DEF\u7D50\u69CB\u3001\u55AE\u8DF3\uFF0F\u77ED\u9F8D\u8207\u8F49\u6298\u4F4D\u7F6E\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      grok: `\u3010\u77ED\u7DDA\u3011\u4F9D\u6700\u8FD1\u5E7E\u624B\u52D5\u80FD\u8207\u5207\u63DB\u901F\u5EA6\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      meta: `\u3010\u6BD4\u4F8B\u3011\u4F9D\u8FD1\u671F\u838A\u9592\u5206\u5E03\u3001\u504F\u79FB\u8207\u56DE\u88DC\u689D\u4EF6\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      combined: (() => {
        const parts = ["chatgpt", "gemini", "grok", "meta"].map((x) => ({ key: x, ...localProviderDecision(x, table.results ?? []) }));
        const b = parts.filter((x) => x.side === "\u838A").length;
        const pl = parts.filter((x) => x.side === "\u9592").length;
        return `\u3010\u7D9C\u5408\u3011ChatGPT ${parts[0].side}\uFF0FGemini ${parts[1].side}\uFF0FGrok ${parts[2].side}\uFF0FMeta AI ${parts[3].side}\uFF1B\u838A${b}\uFF1A\u9592${pl}\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`;
      })(),
      road: `\u3010\u7D9C\u5408\u3011\u4F9D\u5927\u8DEF\u3001\u4E0B\u4E09\u8DEF\u8207\u838A\u9592\u554F\u8DEF\u7D9C\u5408\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`
    };
    return [
      `\u3010${label}\u3011`,
      roadLineByProvider[provider],
      `\u3010\u5927\u773C\u4ED4\u3011${prefName(prefs[0])}\uFF1B\u3010\u5C0F\u8DEF\u3011${prefName(prefs[1])}\uFF1B\u3010\u66F1\u7534\u8DEF\u3011${prefName(prefs[2])}\u3002`,
      `\u3010\u838A\u554F\u8DEF\u3011${bankerAsk.map(colorName).join("\u30FB")}\uFF1B\u3010\u9592\u554F\u8DEF\u3011${playerAsk.map(colorName).join("\u30FB")}\u3002`,
      finishByProvider[provider]
    ].join("\n");
  }
  function localProviderDecision(provider, results) {
    const road = roadSides(results);
    const base = roadDecision(results);
    const fallback = base.side;
    const value = (x) => x === "\u838A" ? 1 : x === "\u9592" ? -1 : 0;
    const weighted = (take) => {
      const arr = road.slice(-take);
      return arr.reduce((sum, x, i) => sum + value(x) * (1 + i / Math.max(1, arr.length - 1) * 1.7), 0);
    };
    const distribution = (take) => road.slice(-take).reduce((sum, x) => sum + value(x), 0);
    const alternation = (take) => {
      const arr = road.slice(-take);
      if (arr.length < 2) return 0;
      let changes = 0;
      for (let i = 1; i < arr.length; i += 1) if (arr[i] !== arr[i - 1]) changes += 1;
      return changes / (arr.length - 1);
    };
    const last = road.at(-1);
    const opposite = (x) => x === "\u838A" ? "\u9592" : "\u838A";
    let streak = 0;
    if (last) {
      for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
    }
    const pick = (score, tie) => Math.abs(score) < 0.5 ? tie : score > 0 ? "\u838A" : "\u9592";
    const finalize = (side2, rawConfidence2) => ({
      side: side2,
      confidence: roadBasedConfidence(results, side2, rawConfidence2)
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
      return finalize(pick(score, weighted(4) >= 0 ? "\u838A" : "\u9592"), Math.max(46, Math.min(93, 60 + Math.round(Math.abs(score) * 3))));
    }
    if (provider === "meta") {
      const longDist = distribution(18), shortDist = distribution(8);
      let score = -longDist * 0.2 - shortDist * 0.28;
      if (Math.abs(longDist) <= 2) score += shortDist * 0.12;
      if (streak >= 4) score -= value(last) * 1.25;
      const tie = Math.abs(distribution(12)) >= 2 ? distribution(12) > 0 ? "\u9592" : "\u838A" : opposite(last);
      return finalize(pick(score, tie), Math.max(43, Math.min(88, 55 + Math.round(Math.abs(score) * 4))));
    }
    const parts = ["chatgpt", "gemini", "grok", "meta"].map((x) => localProviderDecision(x, results));
    const banker = parts.filter((x) => x.side === "\u838A");
    const player = parts.filter((x) => x.side === "\u9592");
    const bWeight = banker.reduce((s, x) => s + x.confidence, 0);
    const pWeight = player.reduce((s, x) => s + x.confidence, 0);
    const side = banker.length === player.length ? bWeight >= pWeight ? "\u838A" : "\u9592" : banker.length > player.length ? "\u838A" : "\u9592";
    const winners = parts.filter((x) => x.side === side);
    const rawConfidence = Math.round(winners.reduce((s, x) => s + x.confidence, 0) / Math.max(1, winners.length));
    return finalize(side, rawConfidence);
  }

  // lib/dg-console-entry.ts
  (() => {
    const previous = window.__DG_SINGLEPAGE__;
    if (previous?.dispose) previous.dispose();
    const L = window.Laya;
    if (!L?.stage?.getChildAt) {
      console.error("[DG] \u76EE\u524D\u4E0D\u662F\u8F09\u5165\u5B8C\u6210\u7684 DG Laya \u9801\u9762\u3002\u8ACB\u9078\u64C7 DG \u5206\u9801\uFF0FConsole \u57F7\u884C\u74B0\u5883\u3002");
      return;
    }
    const ledger = new DgBetLedger(window.__DG_LEDGER_STATE__);
    let running = false, busy = false, disposed = false, epoch = 0, once = false;
    let base = 100, scope = "global", provider = "combined", roomCount = "3", maxStake = 1e5, minSeconds = 6;
    let selected = /* @__PURE__ */ new Set(), status = "\u505C\u6B62\uFF1A\u5148\u6383\u63CF DG \u55AE\u9801\u591A\u684C\u6309\u9215";
    let socket = null, account = null;
    const owner = {}, logs = [], contexts = /* @__PURE__ */ new Map();
    let persistKey = "";
    const money = (n) => n.toLocaleString("zh-TW");
    function persist() {
      window.__DG_LEDGER_STATE__ = ledger.state;
      try {
        if (persistKey) sessionStorage.setItem(persistKey, JSON.stringify(ledger.state));
      } catch {
      }
    }
    function log(text) {
      status = text;
      logs.unshift(`${(/* @__PURE__ */ new Date()).toLocaleTimeString()} ${text}`);
      logs.length = Math.min(logs.length, 50);
      console.log("[DG]", text);
      render();
    }
    function stop(reason = "\u5DF2\u505C\u6B62\uFF1B\u5DF2\u9001\u51FA\u7684\u4E0B\u6CE8\u4ECD\u7B49\u5F85\u5E73\u53F0\u7D50\u7B97") {
      running = false;
      once = false;
      epoch++;
      log(reason);
    }
    function visible(n) {
      if (!n || n.destroyed) return false;
      for (let x = n; x; x = x.parent) if (x.visible === false || x.alpha === 0) return false;
      return true;
    }
    function nodes() {
      const result = [], stack = [L.stage], seen = /* @__PURE__ */ new Set();
      while (stack.length && result.length < 12e3) {
        const n = stack.pop();
        if (!n || seen.has(n) || n.destroyed) continue;
        seen.add(n);
        result.push(n);
        const count = Number(n.numChildren ?? 0);
        for (let i = 0; i < count; i++) stack.push(n.getChildAt(i));
      }
      return result;
    }
    function boards(all = nodes()) {
      const unique = /* @__PURE__ */ new Map();
      for (const n of all) {
        if (n.tableId && n.gameInfo && n.betBtn?.Banker && n.betBtn?.Player && n.betMan?.confirm && n.betMan?.cancel && n.betMoneyTmp && n.betMoneyTrue && visible(n)) {
          const k = String(n.tableId);
          if (!unique.has(k)) unique.set(k, n);
        }
      }
      return [...unique.values()];
    }
    function remaining(n) {
      const info = n.gameInfo;
      let result = Number(info.countDown);
      if (info.starTime != null && Number.isFinite(Number(info.starTime))) {
        const now = L.Browser?.now?.() ?? Date.now();
        result -= Math.max(0, (now - Number(info.starTime)) / 1e3);
      }
      const text = String(n.countDownMan?.text ?? "").trim();
      if (/^\d+$/.test(text)) result = Math.min(result, Number(text));
      return Number.isFinite(result) ? Math.max(0, result) : 0;
    }
    function ready(n) {
      return visible(n) && Number(n.gameInfo?.stateId) === 1 && remaining(n) >= minSeconds && n.betFlag === true && visible(n.betBtn?.Banker) && visible(n.betBtn?.Player) && n.betBtn.Banker.mouseEnabled !== false && n.betBtn.Player.mouseEnabled !== false;
    }
    function roads(n) {
      if (!Array.isArray(n.gameInfo.roadArray)) return [];
      return [...n.gameInfo.roadArray].reverse().map((r) => {
        const x = r?.road;
        const v = Number(Array.isArray(x) ? x[0] : typeof x === "string" ? x.split(",")[0] : NaN);
        return v >= 1 && v <= 4 ? "\u838A" : v >= 5 && v <= 8 ? "\u9592" : v >= 9 && v <= 12 ? "\u548C" : null;
      }).filter((x) => x !== null);
    }
    function click(n) {
      if (!visible(n) || n.mouseEnabled === false || typeof n.event !== "function" || n.hasListener?.(L.Event.CLICK) === false) throw new Error("\u539F\u751F\u6309\u9215\u5C1A\u4E0D\u53EF\u9EDE\u64CA");
      const event = new L.Event();
      event.type = L.Event.CLICK;
      event.target = n;
      event.currentTarget = n;
      n.event(L.Event.CLICK, event);
    }
    function sameSession(b) {
      return b.playerInfo === account && b.playerInfo?.socketMan === socket && socket?.socket?.connected !== false;
    }
    function attach(all) {
      const card = boards(all)[0];
      const p = card?.playerInfo;
      if (!p?.socketMan?.on || !p?.socketMan?.off) return;
      if (account && p !== account) {
        stop("DG \u5DE5\u4F5C\u968E\u6BB5\u6539\u8B8A\uFF0C\u8ACB\u91CD\u65B0\u8F09\u5165\u8173\u672C");
        return;
      }
      if (socket === p.socketMan) return;
      socket?.off("RECEIVED_SUCCESS", owner, onMessage);
      socket = p.socketMan;
      account = p;
      const ident = String(p.mid ?? p.playerName ?? "session") + "|" + String(p.currency ?? "");
      let h = 2166136261;
      for (const ch of ident) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
      persistKey = `dg.singlepage.ledger.v1.${h >>> 0}`;
      try {
        const saved = JSON.parse(sessionStorage.getItem(persistKey) ?? "null");
        if (saved?.version === 1 && !ledger.state.bets.length) ledger.state = new DgBetLedger(saved).state;
      } catch {
      }
      for (const bet of ledger.pending()) if (bet.state === "submitted" || bet.state === "reserved") bet.state = "uncertain";
      socket.on("RECEIVED_SUCCESS", owner, onMessage);
      persist();
      log("\u5DF2\u63A5\u4E0A DG \u539F\u751F\u56DE\u8986\uFF0F\u7D50\u7B97\u4E8B\u4EF6\uFF1B\u672A\u57F7\u884C\u4E0B\u6CE8");
    }
    function onMessage(msg) {
      if (disposed) return;
      const receipt = ledger.receipt(msg);
      if (receipt) {
        persist();
        log(`${receipt.bet.tableId}\uFF5C${receipt.bet.gameNo}\uFF5C${receipt.accepted ? "\u5E73\u53F0\u5DF2\u63A5\u53D7\u4E0B\u6CE8" : "\u5E73\u53F0\u62D2\u7D55\u6216\u91D1\u984D\u4E0D\u7B26\uFF0C\u672A\u6A19\u793A\u6210\u529F"}\uFF5C${receipt.bet.side} ${money(receipt.bet.amount)}`);
        if (!receipt.accepted) stop("\u672C\u7B46\u4E0B\u6CE8\u672A\u78BA\u8A8D\u63A5\u53D7\uFF0C\u5DF2\u505C\u6B62\uFF1B\u4E0D\u81EA\u52D5\u91CD\u9001");
        if (once) {
          running = false;
          once = false;
        }
      }
      const settled = ledger.settle(msg);
      if (settled) {
        persist();
        log(`${settled.bet.tableId}\uFF5C${settled.bet.gameNo}\uFF5C\u7D50\u7B97 ${settled.pnl > 0 ? "+" : ""}${money(settled.pnl)}\uFF5C${settled.pnl > 0 ? "\u8D0F\uFF1A\u91CD\u7F6E" : settled.pnl < 0 ? "\u8F38\uFF1A\u5347\u968E" : "\u548C\uFF0F\u9000\u6CE8\uFF1A\u7DAD\u6301"}\uFF5C\u4E0B\u4E00\u6CE8 ${money(martingaleAmount(base, settled.nextLevel))}`);
        window.dispatchEvent(new CustomEvent("dg-singlepage-settlement", { detail: { ...settled.bet, nextLevel: settled.nextLevel } }));
      }
    }
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    async function execute(card, token) {
      const results = roads(card);
      if (results.filter((x) => x !== "\u548C").length < 3) return;
      const gameNo = String(card.gameInfo.gameNo ?? ""), tableId = String(card.tableId);
      if (!gameNo || ledger.state.bets.some((b) => b.key === `${tableId}:${gameNo}`)) return;
      if (!sameSession(card) || !ready(card)) return;
      if (Object.values(card.betMoneyTmp).some((v) => Number(v) !== 0) || Object.values(card.betMoneyTrue).some((v) => Number(v) !== 0)) return;
      const side = localProviderDecision(provider, results).side;
      const amount = martingaleAmount(base, ledger.level(tableId, scope));
      if (amount > maxStake) {
        stop(`\u4E0B\u4E00\u6CE8 ${money(amount)} \u8D85\u904E\u4F60\u8A2D\u5B9A\u7684\u91D1\u984D\u4E0A\u9650 ${money(maxStake)}`);
        return;
      }
      const limits = card.baccaratLimit ?? card.gameLimit;
      if (!limits || amount < Number(limits.bpMin) || amount > Number(limits.bpMax) || amount > Number(account.balance)) {
        log(`${tableId}\uFF5C\u91D1\u984D ${money(amount)} \u4E0D\u7B26\u5E73\u53F0\u9650\u984D\u6216\u9918\u984D\uFF0C\u7565\u904E`);
        return;
      }
      const chips = nodes().filter((n) => Array.isArray(n.chipArray) && n.playerInfo === account && visible(n)).flatMap((n) => n.chipArray).filter(visible);
      const byValue = /* @__PURE__ */ new Map();
      for (const n of chips) if (n.hasListener?.(L.Event.CLICK) !== false) byValue.set(Number(n.chipNum), n);
      const plan = chipPlan(amount, [...byValue.keys()]);
      if (remaining(card) < minSeconds + plan.length * 0.16) {
        log(`${tableId}\uFF5C\u5012\u6578\u4E0D\u8DB3\u4EE5\u7CBE\u78BA\u9EDE\u5B8C\u7C4C\u78BC\uFF0C\u7565\u904E`);
        return;
      }
      const bet = ledger.reserve(tableId, gameNo, side, base, scope);
      persist();
      contexts.set(bet.key, card);
      const internalSide = side === "\u838A" ? "Banker" : "Player";
      let expected = 0;
      function guard() {
        if (!running || disposed || token !== epoch || document.hidden || String(card.gameInfo.gameNo) !== gameNo || !ready(card) || !sameSession(card)) throw new Error("\u5DF2\u505C\u6B62\u3001\u5C40\u865F\u6539\u8B8A\u6216\u505C\u6B62\u63A5\u53D7\u4E0B\u6CE8");
      }
      try {
        for (const denomination of plan) {
          guard();
          click(byValue.get(denomination));
          if (Number(account.selectChip) !== denomination) throw new Error("\u7C4C\u78BC\u9078\u64C7\u672A\u751F\u6548");
          await delay(40);
          guard();
          click(card.betBtn[internalSide]);
          expected += denomination;
          if (Number(card.betMoneyTmp[internalSide]) !== expected || Object.entries(card.betMoneyTmp).some(([k, v]) => k !== internalSide && Number(v) !== 0)) throw new Error("\u5E73\u53F0\u5BE6\u969B\u5F85\u78BA\u8A8D\u91D1\u984D\u4E0D\u7B26\uFF0C\u53D6\u6D88\u672C\u6B21\u672A\u78BA\u8A8D\u7C4C\u78BC");
          await delay(50);
        }
        guard();
        if (!visible(card.betMan.confirm) || Number(card.betMoneyTmp[internalSide]) !== amount) throw new Error("\u78BA\u8A8D\u6309\u9215\u6216\u6700\u7D42\u91D1\u984D\u672A\u5C31\u7DD2");
        const original = socket.sendData;
        let emitted = false;
        const wrapped = function(msg, ...args) {
          if (Number(msg?.cmd) === 6 && String(msg.tableId) === tableId && String(msg.gameNo) === gameNo) {
            emitted = true;
            ledger.submit(bet);
            persist();
          }
          return original.call(this, msg, ...args);
        };
        socket.sendData = wrapped;
        try {
          click(card.betMan.confirm);
        } finally {
          if (socket.sendData === wrapped) socket.sendData = original;
        }
        if (!emitted) throw new Error("\u539F\u751F\u78BA\u8A8D\u6C92\u6709\u9001\u51FA\u672C\u5C40\u4E0B\u6CE8\uFF0C\u672A\u6A19\u793A\u6210\u529F");
        log(`${tableId}\uFF5C${gameNo}\uFF5C\u5DF2\u81EA\u52D5\u9EDE\u64CA\u78BA\u8A8D ${side} ${money(amount)}\uFF1B\u7B49\u5F85\u5E73\u53F0\u63A5\u53D7\u56DE\u8986`);
      } catch (error) {
        if (bet.state === "reserved") {
          ledger.abort(bet);
          if (String(card.gameInfo.gameNo) === gameNo && Object.values(card.betMoneyTmp).some((v) => Number(v) > 0)) {
            try {
              if (visible(card.betMan.cancel)) click(card.betMan.cancel);
            } catch {
            }
          }
        } else ledger.uncertain(bet);
        persist();
        stop(String(error.message));
      }
    }
    async function tick() {
      if (disposed || busy) return;
      const all = nodes();
      attach(all);
      render();
      for (const b of ledger.pending()) {
        if (b.state === "submitted" && Date.now() - (b.submittedAt ?? b.createdAt) > 12e3) {
          ledger.uncertain(b);
          persist();
          stop("\u4E0B\u6CE8\u56DE\u8986\u903E\u6642\uFF1B\u4FDD\u7559\u672C\u5C40\u9396\u5B9A\uFF0C\u4E0D\u91CD\u9001");
        }
        if (b.state === "accepted" && Date.now() - (b.acceptedAt ?? b.createdAt) > 18e4) stop("\u5E73\u53F0\u7D50\u7B97\u903E\u6642\uFF1B\u5DF2\u505C\u6B62\uFF0C\u4FDD\u7559\u5F85\u7D50\u7B97\u5E33\u672C");
      }
      if (!running || !socket || document.hidden) return;
      const cards = boards(all).filter((c) => selected.has(String(c.tableId)));
      const current = epoch;
      busy = true;
      try {
        for (const card of cards) {
          if (!running || epoch !== current) break;
          if (ledger.pending().some((b) => scope === "global" || b.scope === "global" || b.tableId === String(card.tableId))) continue;
          if (ready(card)) await execute(card, current);
          if (once && ledger.pending().length) break;
        }
      } catch (e) {
        stop(String(e.message));
      } finally {
        busy = false;
      }
    }
    const host = document.createElement("div");
    host.id = "__dg_singlepage_panel__";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
  :host{position:fixed;right:10px;top:12%;z-index:2147483647;font:13px system-ui;color:#eee}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer;border:1px solid #777;background:#202020;color:white;border-radius:5px;padding:7px}#orb{width:44px;height:44px;border-radius:50%;background:white;color:#111;margin-left:auto;display:block;font-weight:bold}#panel{width:310px;max-width:calc(100vw - 20px);max-height:78vh;overflow:auto;background:#111e;border:1px solid #777;border-radius:9px;padding:12px;margin-top:7px;box-shadow:0 5px 24px #0008}header{display:flex;justify-content:space-between;align-items:center;font-weight:700}label{display:block;margin:9px 0 4px}select,input{width:100%;background:#272727;color:#fff;padding:6px;border:1px solid #666;border-radius:4px}.row{display:flex;gap:6px;margin:8px 0}.row>*{flex:1}#rooms{display:flex;gap:5px;flex-wrap:wrap}.room{width:auto;padding:4px}.room.active{border-color:#c3a365;background:#40371e}#status{color:#e6c978;white-space:pre-wrap;margin:10px 0}#tables,#events{white-space:pre-wrap;font-size:11px;line-height:1.55;max-height:160px;overflow:auto}small{display:block;color:#bbb;font-size:11px}.stop{background:#8a2929}.start{background:#315938}
  </style><button id="orb" aria-label="DG \u81EA\u52D5\u9EDE\u64CA">AI</button><section id="panel"><header>DG \u55AE\u9801\u81EA\u52D5\u9EDE\u64CA<button id="hide">\u6536\u5408</button></header><small>\u539F\u751F Laya \u6309\u9215\u4E8B\u4EF6\uFF1B\u4E0D\u9032\u623F\u3001\u4E0D\u63DB\u9801\u3002\u63A8\u85A6\u6CBF\u7528\u539F\u7A0B\u5F0F\u672C\u5730\u7B56\u7565\uFF0C\u672A\u547C\u53EB AI API\u3002</small><label>\u63A8\u85A6\u4F86\u6E90</label><select id="provider"></select><div class="row"><div><label>\u57FA\u672C\u5355\u6CE8</label><input id="base" type="number" min="1" value="100"></div><div><label>\u55AE\u7B46\u4E0A\u9650</label><input id="cap" type="number" min="1" value="100000"></div></div><label>\u99AC\u4E01\u5E33\u672C</label><select id="scope"><option value="global">\u5171\u7528\u968E\u7D1A\uFF1A\u7B49\u4E0A\u4E00\u7B46\u7D50\u7B97\u5F8C\u518D\u4E0B</option><option value="table">\u6BCF\u684C\u7368\u7ACB\u968E\u7D1A\uFF1A\u53EF\u6709\u591A\u684C\u5F85\u7D50\u7B97</option></select><div class="row"><select id="count"><option value="1">\u55AE\u4E00\u684C</option><option value="3" selected>\u4E09\u684C</option><option value="5">\u4E94\u684C</option><option value="all">\u5168\u90E8\u53EF\u898B\u684C</option></select><button id="scan">\u6383\u63CF\uFF0F\u5957\u7528</button></div><div id="rooms"></div><label><input id="ack" type="checkbox" style="width:auto"> \u6211\u78BA\u8A8D\u9019\u662F\u6E2C\u8A66\u74B0\u5883\uFF0C\u4E86\u89E3\u6703\u81EA\u52D5\u9EDE\u64CA\u78BA\u8A8D\uFF1B\u4E0D\u4FDD\u8B49\u7372\u5229\uFF0C\u64CD\u4F5C\u98A8\u96AA\u81EA\u884C\u627F\u64D4\u3002</label><div class="row"><button id="start" class="start">\u958B\u59CB\u6301\u7E8C</button><button id="once">\u5B8C\u6574\u6E2C\u8A66\u4E00\u7B46</button><button id="stop" class="stop">\u505C\u6B62</button></div><div id="status"></div><div id="tables"></div><label>\u4E8B\u4EF6\uFF0F\u5BE6\u969B\u7D50\u7B97</label><div id="events"></div><small>\u99AC\u4E01\uFF1A1 \u2192 3 \u2192 7 \u2192 15 \u500D\uFF1B\u53EA\u770B\u672C\u7B46\u5E73\u53F0\u7D50\u7B97\u3002\u505C\u6B62\u4E0D\u6703\u64A4\u92B7\u5DF2\u63A5\u53D7\u4E0B\u6CE8\u3002</small></section>`;
    const q = (id) => shadow.getElementById(id);
    for (const option of AI_PROVIDER_OPTIONS) {
      const el = document.createElement("option");
      el.value = option.key;
      el.textContent = option.label;
      q("provider").appendChild(el);
    }
    q("provider").value = provider;
    function scan() {
      if (running || ledger.pending().length) {
        log("\u5148\u505C\u6B62\u4E26\u7B49\u5DF2\u9001\u51FA\u4E0B\u6CE8\u7D50\u7B97\uFF0C\u624D\u80FD\u8B8A\u66F4\u684C\u53F0\u6216\u7B56\u7565");
        return;
      }
      const cards = boards(), limit = roomCount === "all" ? cards.length : Number(roomCount);
      selected = new Set(cards.slice(0, limit).map((c) => String(c.tableId)));
      log(cards.length ? `\u627E\u5230 ${cards.length} \u500B\u55AE\u9801\u53EF\u4E0B\u6CE8\u5143\u4EF6\uFF1B\u9078\u4E2D ${selected.size} \u684C` : "\u5C1A\u672A\u627E\u5230 DG \u55AE\u9801\u591A\u684C\u6309\u9215\uFF1B\u8ACB\u958B\u555F DG \u591A\u53F0\u6216\u53F3\u5074\u597D\u8DEF\u4E0B\u6CE8\u9762\u677F");
      renderRooms();
    }
    function renderRooms() {
      q("rooms").replaceChildren();
      for (const c of boards()) {
        const button = document.createElement("button"), id = String(c.tableId);
        button.className = "room" + (selected.has(id) ? " active" : "");
        button.textContent = c.gameInfo.tableName || id;
        button.onclick = () => {
          if (running || ledger.pending().length) return;
          selected.has(id) ? selected.delete(id) : selected.add(id);
          renderRooms();
          render();
        };
        q("rooms").appendChild(button);
      }
    }
    function start(testOnce = false) {
      if (busy) {
        log("\u4E0A\u4E00\u6D41\u7A0B\u5C1A\u672A\u9000\u51FA\uFF0C\u8ACB\u7A0D\u5019\u518D\u958B\u59CB");
        return;
      }
      if (!q("ack").checked) {
        log("\u8ACB\u5148\u52FE\u9078\u6E2C\u8A66\u74B0\u5883\u8207\u98A8\u96AA\u8072\u660E");
        return;
      }
      if (ledger.pending().some((b) => b.state === "uncertain")) {
        log("\u6709\u672A\u80FD\u6838\u5C0D\u7684\u4E0B\u6CE8\uFF0C\u4FDD\u6301\u505C\u6B62\uFF1B\u8ACB\u5148\u67E5\u770B DG \u6B63\u5F0F\u4E0B\u6CE8\u7D00\u9304");
        return;
      }
      const nextBase = Number(q("base").value), nextScope = q("scope").value, nextProvider = q("provider").value;
      if (ledger.pending().length && (nextBase !== base || nextScope !== scope || nextProvider !== provider)) {
        log("\u5F85\u7D50\u7B97\u671F\u9593\u4E0D\u80FD\u6539\u57FA\u672C\u91D1\u984D\u3001\u7B56\u7565\u6216\u5E33\u672C");
        return;
      }
      if (!Number.isSafeInteger(nextBase) || nextBase <= 0) {
        log("\u57FA\u672C\u55AE\u6CE8\u5FC5\u9808\u662F\u6B63\u6574\u6578");
        return;
      }
      maxStake = Number(q("cap").value);
      if (!Number.isSafeInteger(maxStake) || maxStake < nextBase) {
        log("\u55AE\u7B46\u4E0A\u9650\u5FC5\u9808\u4E0D\u5C0F\u65BC\u57FA\u672C\u55AE\u6CE8");
        return;
      }
      base = nextBase;
      scope = nextScope;
      provider = nextProvider;
      if (!selected.size) scan();
      if (!selected.size) return;
      running = true;
      once = testOnce;
      epoch++;
      log(testOnce ? "\u57F7\u884C\u4E00\u7B46\u5B8C\u6574\u6D41\u7A0B\uFF08\u5305\u542B\u81EA\u52D5\u78BA\u8A8D\uFF09" : "\u6301\u7E8C\u57F7\u884C\uFF1A\u7B49\u5F85\u53EF\u4E0B\u6CE8\u684C\u8207\u7D50\u7B97\u4E8B\u4EF6");
      void tick();
    }
    function render() {
      if (disposed) return;
      q("status").textContent = `${running ? "\u57F7\u884C\u4E2D" : "\u5DF2\u505C\u6B62"}\uFF5C${status}`;
      q("events").textContent = logs.join("\n");
      const cards = boards();
      q("tables").textContent = cards.filter((c) => selected.has(String(c.tableId))).map((c) => {
        const results = roads(c), rec = results.length >= 3 ? localProviderDecision(provider, results) : null;
        return `${c.gameInfo.tableName || c.tableId}\uFF5C\u9774 ${c.gameInfo.shoeId ?? c.gameInfo.gameNo?.slice(0, -3) ?? "\u2014"}\uFF5C\u5C40 ${c.gameInfo.playId ?? "\u2014"}\uFF5C\u5012\u6578 ${Math.floor(remaining(c))}
${rec ? `\u63A8\u85A6 ${rec.side}\uFF5C${getPatternInfo(results).label}\uFF5C\u6307\u6A19 ${rec.confidence}%` : "\u7B49\u5F85\u724C\u8DEF"}\uFF5C\u4E0B\u4E00\u6CE8 ${money(martingaleAmount(base, ledger.level(String(c.tableId), scope)))}`;
      }).join("\n\n") + `
\u5F85\u7D50\u7B97\uFF0F\u672A\u78BA\u5B9A\uFF1A${ledger.pending().length} \u7B46`;
    }
    q("scan").onclick = scan;
    q("count").onchange = () => {
      roomCount = q("count").value;
      scan();
    };
    q("start").onclick = () => start();
    q("once").onclick = () => start(true);
    q("stop").onclick = () => stop();
    q("hide").onclick = () => q("panel").hidden = true;
    q("orb").onclick = () => q("panel").hidden = !q("panel").hidden;
    function visibility() {
      if (document.hidden) stop("\u9801\u9762\u9032\u5165\u80CC\u666F\uFF0C\u5DF2\u505C\u6B62\u65B0\u589E\u64CD\u4F5C\uFF1B\u8FD4\u56DE\u5F8C\u9700\u624B\u52D5\u958B\u59CB");
    }
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(() => void tick(), 500);
    window.__DG_SINGLEPAGE__ = {
      version: "1.0.0",
      start: () => start(),
      stop,
      scan,
      status: () => ({ running, status, pending: ledger.pending().map((b) => ({ ...b })), selected: [...selected] }),
      exportLedger: () => JSON.parse(JSON.stringify(ledger.state)),
      analysis: (tableId) => {
        const c = boards().find((n) => String(n.tableId) === String(tableId));
        return c ? providerAnalysisText(provider, { results: roads(c) }) : "\u672A\u627E\u5230\u684C\u53F0";
      },
      dispose: () => {
        running = false;
        disposed = true;
        epoch++;
        clearInterval(timer);
        socket?.off("RECEIVED_SUCCESS", owner, onMessage);
        document.removeEventListener("visibilitychange", visibility);
        persist();
        host.remove();
      }
    };
    attach(nodes());
    scan();
    render();
  })();
})();
