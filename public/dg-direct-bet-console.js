/*
MIT License

Copyright (c) 2023 LobeHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* DG 單頁多桌直接訊息下注；僅在 DG 同源頁面執行。不點擊按鈕；初始為停止。 */
"use strict";
(() => {
  // lib/dg-session-timer.ts
  function parseDurationMinutes(value) {
    const text = String(value ?? "").trim();
    if (text === "") return 0;
    if (!/^\d+$/.test(text)) throw new Error("\u81EA\u52D5\u505C\u6B62\u6642\u9593\u9808\u70BA\u6574\u6578\u5206\u9418\uFF1B0\u6216\u7559\u7A7A\u4EE3\u8868\u4E0D\u9650\u6642");
    const minutes = Number(text);
    if (!Number.isSafeInteger(minutes) || !Number.isSafeInteger(minutes * 6e4)) throw new Error("\u81EA\u52D5\u505C\u6B62\u6642\u9593\u8D85\u51FA\u53EF\u7528\u7BC4\u570D");
    return minutes;
  }
  function formatDuration(ms) {
    const seconds = Math.floor(Math.max(0, ms) / 1e3);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");
  }
  function createDgSessionTimer(wallNow = () => Date.now(), monoNow = () => performance.now()) {
    let running = false, started = false, startWall = 0, startMono = 0, elapsedMs = 0, minutes = 0;
    function elapsed() {
      if (running) elapsedMs = Math.max(elapsedMs, 0, wallNow() - startWall, monoNow() - startMono);
      return elapsedMs;
    }
    return {
      start(value) {
        minutes = parseDurationMinutes(value);
        startWall = wallNow();
        startMono = monoNow();
        elapsedMs = 0;
        started = true;
        running = true;
      },
      stop() {
        elapsed();
        running = false;
      },
      expired() {
        return running && minutes > 0 && elapsed() >= minutes * 6e4;
      },
      view() {
        const usedMs = elapsed();
        return { running, started, minutes, elapsedMs: usedMs, remainingMs: minutes > 0 ? Math.max(0, minutes * 6e4 - usedMs) : null, elapsedText: formatDuration(usedMs) };
      }
    };
  }

  // lib/dg-panel-touch-scroll.ts
  function installDgPanelTouchScroll(root) {
    let state = null;
    const ownerWindow = root.ownerDocument.defaultView;
    function start(event) {
      state = null;
      if (event.touches.length !== 1) return;
      event.stopPropagation();
      const elements = event.composedPath().filter((node) => node instanceof ownerWindow.HTMLElement);
      const target = elements[0];
      if (!target || target.closest('#head,.resize-grip,input,textarea,select,[contenteditable="true"]')) return;
      const vertical = [], horizontal = [];
      for (const element of elements) {
        if (element === root.host) break;
        const style = ownerWindow.getComputedStyle(element);
        if (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) vertical.push(element);
        if (/auto|scroll/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1) horizontal.push(element);
      }
      if (!vertical.length && !horizontal.length) return;
      const touch = event.touches[0];
      state = { x: touch.clientX, y: touch.clientY, lastX: touch.clientX, lastY: touch.clientY, vertical, horizontal, axis: null };
    }
    function move(event) {
      if (event.touches.length !== 1) {
        state = null;
        return;
      }
      event.stopPropagation();
      if (!state) return;
      const touch = event.touches[0];
      const dx = touch.clientX - state.x, dy = touch.clientY - state.y;
      if (!state.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        state.axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
      }
      const candidates = state.axis === "y" ? state.vertical : state.horizontal;
      if (!candidates.length) return;
      if (event.cancelable) event.preventDefault();
      let remaining = state.axis === "y" ? state.lastY - touch.clientY : state.lastX - touch.clientX;
      for (const element of candidates) {
        const scale = element.offsetHeight > 0 ? element.getBoundingClientRect().height / element.offsetHeight : 1;
        const divisor = scale > 0 ? scale : 1;
        const before = state.axis === "y" ? element.scrollTop : element.scrollLeft;
        if (state.axis === "y") element.scrollTop += remaining / divisor;
        else element.scrollLeft += remaining / divisor;
        const after = state.axis === "y" ? element.scrollTop : element.scrollLeft;
        remaining -= (after - before) * divisor;
        if (Math.abs(remaining) < 1) break;
      }
      state.lastX = touch.clientX;
      state.lastY = touch.clientY;
    }
    function end(event) {
      if (event.touches.length > 0) return;
      event.stopPropagation();
      if (state?.axis && event.cancelable) event.preventDefault();
      state = null;
    }
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchmove", move, { passive: false });
    root.addEventListener("touchend", end, { passive: false });
    root.addEventListener("touchcancel", end, { passive: false });
    return () => {
      root.removeEventListener("touchstart", start);
      root.removeEventListener("touchmove", move);
      root.removeEventListener("touchend", end);
      root.removeEventListener("touchcancel", end);
      state = null;
    };
  }

  // lib/dg-scene.ts
  function readDgSceneNodes(stage, maximum = 12e3) {
    const output = [], queue = [stage], queued = /* @__PURE__ */ new Set([stage]);
    let cursor = 0;
    const enqueue = (child) => {
      if (child && typeof child === "object" && !queued.has(child) && queue.length < maximum * 2) {
        queued.add(child);
        queue.push(child);
      }
    };
    while (cursor < queue.length && output.length < maximum) {
      const node = queue[cursor++];
      if (!node || typeof node !== "object" || node.destroyed) continue;
      output.push(node);
      try {
        const count = Math.min(1e3, Math.max(0, Number(node.numChildren) || 0));
        if (typeof node.getChildAt === "function") {
          for (let index = 0; index < count; index++) {
            try {
              enqueue(node.getChildAt(index));
            } catch {
            }
          }
        }
        if (Array.isArray(node._children)) for (const child of node._children.slice(0, 1e3)) enqueue(child);
      } catch {
      }
    }
    return output;
  }
  function dgSceneNodeVisible(node) {
    const seen = /* @__PURE__ */ new Set();
    while (node) {
      if (seen.has(node) || node.destroyed || node.visible === false || node.alpha === 0) return false;
      seen.add(node);
      node = node.parent;
    }
    return seen.size > 0;
  }
  function findDgScenePlayer(nodes) {
    for (const node of nodes) {
      for (const player of [node?.playerInfo, node]) {
        if (player && typeof player === "object" && typeof player.socketMan?.sendData === "function") return player;
      }
    }
    return null;
  }
  function dgSceneWallet(player) {
    if (!player || player.socketMan?.socket?.connected === false) return null;
    const value = player.balance;
    if (value === null || value === void 0 || value === "" || typeof value === "boolean") return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }
  function describeDgScene(nodes) {
    const candidates = nodes.filter((node) => node?.tableId != null && node?.gameInfo && (node?.betBtn || node?.betMoneyTmp));
    return {
      nodeCount: nodes.length,
      candidateCount: candidates.length,
      walletSynced: dgSceneWallet(findDgScenePlayer(nodes)) !== null,
      candidates: candidates.slice(0, 60).map((node) => {
        const mobile = !!node.betBtnMan && !node.betMan;
        const confirm = node.betMan?.confirm ?? node.betBtnMan?.confirmBtn;
        const cancel = node.betMan?.cancel ?? node.betBtnMan?.cancelBtn;
        const missing = [
          ["Banker", !!node.betBtn?.Banker],
          ["Player", !!node.betBtn?.Player],
          ["confirm", !!confirm],
          ["cancel", !!cancel],
          ["betMoneyTmp", !!node.betMoneyTmp],
          ["betMoneyTrue", !!node.betMoneyTrue],
          ["confirmBet", typeof node.confirmBet === "function"],
          ["socket", typeof node.playerInfo?.socketMan?.sendData === "function"],
          ["visible", dgSceneNodeVisible(node)]
        ].filter(([, exists]) => !exists).map(([name]) => name);
        return {
          tableId: String(node.tableId),
          table: String(node.gameInfo.tableName || ""),
          gameState: Number(node.gameInfo.stateId),
          roadCount: Array.isArray(node.gameInfo.roadArray) ? node.gameInfo.roadArray.length : 0,
          hasGameNo: !!node.gameInfo.gameNo,
          hasCountdown: node.gameInfo.countDown != null,
          profile: mobile ? "mobile-v329-shaped" : "desktop-shaped",
          betFlag: (mobile ? node.betBtnMan?.betFlag : node.betFlag) === true,
          missing
        };
      })
    };
  }

  // lib/poker-strategies.ts
  var rankNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  function cardRank(value) {
    if (typeof value === "string" && rankNames.includes(value.toUpperCase().trim())) return value.toUpperCase().trim();
    if (typeof value !== "number" && typeof value !== "string") return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 52 ? rankNames[(n - 1) % 13] : null;
  }
  function baccaratValue(card) {
    const n = rankNames.indexOf(card) + 1;
    return n > 0 && n < 10 ? n : 0;
  }
  function handPoint(cards) {
    return cards.reduce((sum, c) => sum + baccaratValue(c), 0) % 10;
  }
  function completePoker(hand) {
    const { player: p, banker: b } = hand;
    if (p.length < 2 || p.length > 3 || b.length < 2 || b.length > 3 || ![...p, ...b].every((c) => rankNames.includes(c))) return false;
    const pp = handPoint(p.slice(0, 2)), bp = handPoint(b.slice(0, 2));
    if (pp >= 8 || bp >= 8) return p.length === 2 && b.length === 2;
    const pd = pp <= 5;
    if (p.length !== (pd ? 3 : 2)) return false;
    const third = pd ? baccaratValue(p[2]) : -1;
    const bd = !pd ? bp <= 5 : bp <= 2 || bp === 3 && third !== 8 || bp === 4 && third >= 2 && third <= 7 || bp === 5 && third >= 4 && third <= 7 || bp === 6 && (third === 6 || third === 7);
    return b.length === (bd ? 3 : 2);
  }
  function dgPokerHand(raw) {
    let data = raw;
    try {
      if (typeof raw === "string") data = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!data || typeof data.player !== "string" || typeof data.banker !== "string") return null;
    const parse = (s) => {
      const values = s.split("-");
      if (values.length > 3 || values.some((v) => !v.trim())) return null;
      const ranks = values.map(cardRank);
      return ranks.every((r) => r !== null) ? ranks : null;
    };
    const player = parse(data.player), banker = parse(data.banker);
    if (!player || !banker) return null;
    const hand = { player, banker };
    return completePoker(hand) ? hand : null;
  }
  function pokerDecision(strategy, hand) {
    if (!hand || !completePoker(hand)) return { ok: false, reason: "\u7B49\u5F85\u540C\u684C\u540C\u9774\u4E0A\u4E00\u5C40\u5B8C\u6574\u5BE6\u969B\u724C\u5F35\uFF1B\u4E0D\u4EE5\u724C\u8DEF\u6216\u9EDE\u6578\u4EE3\u66FF" };
    const all = [...hand.player, ...hand.banker];
    if (strategy === "parity") {
      const values = all.map((c) => rankNames.indexOf(c) + 1), total = values.reduce((a, b) => a + b, 0);
      const first = Math.floor(total / 10) + total % 10, terminal = first >= 10 ? first % 10 : first;
      const side = terminal % 2 === 0 ? "\u838A" : "\u9592";
      return { ok: true, side, confidence: 0, reason: `\u7D42\u503C\u5947\u5076\uFF1A${all.join("\u3001")}\uFF1B\u724C\u9762\u7E3D\u548C ${total} \u2192 ${first} \u2192 ${terminal}\uFF1B${terminal % 2 === 0 ? "\u5076\u838A" : "\u5947\u9592"}\uFF08\u539F\u516C\u5F0F\uFF0C\u975E\u52DD\u7387\uFF09` };
    }
    const sum = all.reduce((n, c) => n + baccaratValue(c), 0), pb = handPoint(hand.banker), pp = handPoint(hand.player);
    const votes = [sum % 3 === 0 ? "\u838A" : "\u9592", sum % 2 === 0 ? "\u838A" : "\u9592", pb * pp % 2 === 0 ? "\u838A" : "\u9592", (pb + pp) % 2 === 0 ? "\u838A" : "\u9592"];
    const bankers = votes.filter((v) => v === "\u838A").length;
    const reason = `V38\u56DB\u5F0F\uFF1AA ${votes[0]}\uFF0FB ${votes[1]}\uFF0F\u4E58 ${votes[2]}\uFF0F\u52A0 ${votes[3]}\uFF1B\u838A ${bankers}\uFF1A\u9592 ${4 - bankers}\uFF08\u539F\u516C\u5F0F\uFF0C\u975E\u5269\u724C\u6A5F\u7387\uFF09`;
    if (bankers === 2) return { ok: false, reason: reason + "\uFF1B\u540C\u7968\u89C0\u671B\uFF0C\u4E0D\u4E0B\u6CE8" };
    return { ok: true, side: bankers > 2 ? "\u838A" : "\u9592", confidence: Math.max(bankers, 4 - bankers) * 25, reason };
  }
  function createDgPokerTracker() {
    const snapshots = /* @__PURE__ */ new Map();
    function observe(cards) {
      for (const card of cards) {
        const id = String(card.tableId || ""), g = card.gameInfo || {}, shoe = g.shoeId == null ? "" : String(g.shoeId), round = Number(g.playId);
        if (!id || !shoe || !Number.isSafeInteger(round) || round < 1) continue;
        const old = snapshots.get(id);
        if (old && (old.shoe !== shoe || round < old.round)) snapshots.delete(id);
        if (Number(g.stateId) === 1) continue;
        const hand = dgPokerHand(g.poker);
        if (!hand) continue;
        const fingerprint = JSON.stringify(hand), previous = snapshots.get(id);
        if (previous && previous.shoe === shoe && previous.round === round) {
          if (previous.fingerprint !== fingerprint) previous.conflict = true;
          continue;
        }
        snapshots.set(id, { shoe, round, hand, fingerprint, conflict: false });
      }
    }
    function decision(card, strategy) {
      const g = card?.gameInfo || {}, old = snapshots.get(String(card?.tableId || ""));
      if (!old || old.conflict || old.shoe !== String(g.shoeId ?? "") || old.round !== Number(g.playId) - 1) return pokerDecision(strategy, null);
      return pokerDecision(strategy, old.hand);
    }
    return { observe, decision };
  }

  // lib/dg-bet-ledger.ts
  function martingaleAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw new Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * (2 ** (level + 1) - 1);
    if (!Number.isSafeInteger(amount)) throw new Error("\u99AC\u4E01\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  function doublingAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * 2 ** level;
    if (!Number.isSafeInteger(amount)) throw Error("\u500D\u6295\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  function stakingAmount(base, level, staking) {
    return staking === "doubling" ? doublingAmount(base, level) : martingaleAmount(base, staking === "flat" ? 0 : level);
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
    resetLevels() {
      if (this.pending().length) throw new Error("\u4ECD\u6709\u5F85\u63A5\u53D7\uFF0F\u5F85\u7D50\u7B97\u6216\u672A\u78BA\u5B9A\u4E0B\u6CE8\uFF0C\u4E0D\u80FD\u91CD\u8A2D\u914D\u6CE8\u968E\u7D1A");
      this.state.levels = {};
    }
    reserve(tableId, gameNo, side, base, scope, staking = "martingale") {
      const key = `${tableId}:${gameNo}`;
      if (!tableId || !gameNo || this.state.bets.some((b) => b.key === key)) throw new Error("\u5C40\u865F\u7F3A\u5931\u6216\u672C\u5C40\u5DF2\u64CD\u4F5C");
      if (this.pending().some((b) => scope === "global" || b.scope === "global" || b.tableId === tableId)) throw new Error("\u4E0A\u4E00\u7B14\u4ECD\u5F85\u7D50\u7B97");
      const level = this.level(tableId, scope);
      const amount = stakingAmount(base, level, staking);
      const bet = { key, tableId, gameNo, side, amount, level, scope, staking, state: "reserved", createdAt: Date.now() };
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
      if (bet.attributionUncertain) {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      if (msg.codeId == null) {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      if (Number(msg.codeId) !== 0) {
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
      const bet = this.state.bets.find((b) => b.key === `${msg.tableId}:${msg.gameNo}` && b.state === "accepted" && !b.attributionUncertain);
      const pnl = msg.dList?.[1];
      if (!bet || typeof pnl !== "number" || !Number.isFinite(pnl)) return null;
      const k = this.levelKey(bet.tableId, bet.scope);
      if (bet.staking !== "flat") this.state.levels[k] = pnl > 0 ? 0 : pnl < 0 ? bet.level + 1 : bet.level;
      bet.pnl = pnl;
      bet.state = "settled";
      bet.settledAt = Date.now();
      return { bet, pnl, nextLevel: this.state.levels[k] ?? 0 };
    }
  };

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
  AI_PROVIDER_OPTIONS.push({ key: "counting", label: "V38 \u56DB\u5F0F\u7B97\u724C" }, { key: "parity", label: "\u5947\u5076\u7B56\u7565" });
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

  // lib/dg-panel-mobile-layout.ts
  var DG_MOBILE_LAYOUT_CSS = `
.session-time{display:flex;justify-content:space-between;gap:5px;flex:none;padding:5px 0;font-size:9px;color:#b5c4bd;line-height:1.4;flex-wrap:wrap}.session-time strong{font-variant-numeric:tabular-nums;color:#e8dcc1}.session-time>span:last-child{margin-left:auto}
/* Applied last for both platforms. Content must not disappear behind a fixed footer. */
:host{touch-action:pan-x pan-y}
#overview-page,#settings-page,#logs-page,#rooms-page,.report-scroll,#events{touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#table-strip{touch-action:pan-x;-webkit-overflow-scrolling:touch}
#panel.compact:not(.mini) #overview-page{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#panel.compact.mini{width:210px;height:auto;min-height:228px;max-height:none;padding:9px;overflow:visible}
#panel.compact.mini #overview-page{flex:none;height:auto;min-height:0;overflow:visible;gap:5px}
#panel.compact.mini .hero{height:auto;min-height:0;max-height:none;padding:0;flex:none}
#panel.compact.mini #target-box{height:auto;min-height:0;flex:none}
#panel.compact.mini .mini-context{height:auto;min-height:18px;flex-wrap:wrap;gap:3px;font-size:9px}
#panel.compact.mini .mini-context>span:last-child{margin-left:auto;font-variant-numeric:tabular-nums}
#panel.compact.mini .roomline{height:auto;min-height:17px;flex-wrap:wrap;gap:4px}
#panel.compact.mini .bet-main{height:auto;min-height:39px;margin:3px 0}
#panel.compact.mini .meta{display:block;height:auto;min-height:0;white-space:normal;overflow:visible;line-height:1.35;font-size:9px;margin:3px 0}
#panel.compact.mini #hero-status{display:block;height:auto;min-height:0;max-height:none;overflow:visible;line-height:1.35;font-size:9px;margin:3px 0;overflow-wrap:anywhere}
#panel.compact.mini .turnover-source{display:block;font-size:8px;line-height:11px;margin:2px 0}
#panel.compact.mini .stats{height:auto;min-height:34px;padding:5px;flex:none}
#panel.compact.mini .stats small{white-space:normal;line-height:1.25;font-size:8px}
#panel.compact.mini .stats strong{font-size:10px}
#panel.compact.mini .compact-actions{height:31px;margin:5px 0 0;position:static;flex:none}
#panel.compact.mini .compact-actions button{height:31px;min-width:0;font-size:9px}
#panel.compact.mini .steps,#panel.compact.mini .step-labels,#panel.compact.mini .metrics,
#panel.compact.mini #cards-result,#panel.compact.mini #chart-wrap,#panel.compact.mini #table-strip{display:none}
/* iOS focuses sub-16px controls by zooming the whole viewport. This must live
   inside the shared shadow-root CSS as document styles cannot reach it. */
@media(pointer:coarse){
  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),textarea,select{font-size:16px!important}
}
`;

  // lib/dg-panel-density.ts
  var DG_DENSITY_CSS = "/* \u56FA\u5B9A\u5916\u6846\u8CC7\u8A0A\u5BC6\u5EA6\u7248\uFF1B\u4E0D\u5F71\u97FF\u9001\u55AE\u6216\u5E33\u672C\u3002 */\n#panel.compact{padding:9px 10px;gap:0}\n.compact #head{height:25px}\n.compact #overview-page{display:flex;flex-direction:column;overflow:hidden;gap:3px}\n.compact .parallel-control{height:27px;flex:none;margin:0;gap:8px}\n.compact .parallel-control label{font-size:10px}\n.compact .parallel-control select{height:27px;font-size:11px}\n.compact .parallel-summary{height:13px;flex:none;margin:0;font-size:9px;color:#b1aab9;white-space:nowrap}\n.compact .mini-context{display:flex;align-items:center;justify-content:space-between;height:16px;flex:none;font-size:9px;color:#bbb2c5;gap:5px}\n.compact .mini-context strong{color:#e5e2e8;font-size:10px;font-variant-numeric:tabular-nums}\n.compact #mini-running{white-space:nowrap}\n.compact .hero{padding:0;flex:none;height:144px;display:flex;flex-direction:column;min-width:0;gap:0}\n.compact #target-box{height:87px;flex:none;min-width:0}\n.compact .roomline{margin:0;height:17px;gap:6px;font-size:11px}\n.compact .roomline .subtle{font-size:9px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.compact .bet-main{height:40px;margin:1px 0;gap:8px}\n.compact .ring{height:36px;width:36px}\n.compact .ring-inner{font-size:12px}\n.compact .bet-value{min-width:0;gap:5px}\n.compact .amount{font-size:28px;letter-spacing:-.8px;min-width:0;font-variant-numeric:tabular-nums;white-space:nowrap}\n.compact .amount.long-number{font-size:22px}\n.compact .side{font-size:9px;padding:3px 4px}\n.compact .meta{height:13px;font-size:9px;line-height:13px;color:#ada4b5;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.compact .steps{margin:3px 0 0;height:2px}\n.compact .step{height:2px}\n.compact .step-labels{margin:2px 0 0;font-size:8px}\n.compact .metrics{margin:2px 0 0;height:24px;flex:none}\n.compact .metrics small{font-size:8px;margin:0 0 2px;color:#a99ead}\n.compact .metrics strong{font-size:11px}\n.compact .range-view{height:8px;flex:none;margin:1px 0 2px}\n.compact .statusline{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:3px 0 0;font-size:9px;line-height:12px;color:#b8a9ba;min-height:0;height:24px;flex:none;cursor:pointer;overflow-wrap:anywhere}\n.compact .cards-result{height:19px;padding:0;margin:1px 0;flex:none;border-radius:4px;align-items:center;gap:8px}\n.compact:has(#cards-result:not([hidden])) #target-box{height:68px}\n.compact:has(#cards-result:not([hidden])) .steps,.compact:has(#cards-result:not([hidden])) .step-labels{display:none}\n.compact .cards-side{display:flex;align-items:center;gap:4px}\n.compact .cards-side>small{font-size:8px;white-space:nowrap}\n.compact .cards-side>strong{font-size:9px;float:none}\n.compact .cards-line{margin:0;gap:2px}\n.compact .playing-card{width:12px;height:16px;border-radius:2px;font-size:9px}\n.compact .stats{height:40px;flex:none;margin:0;padding:6px 8px;gap:4px}\n.compact .stats small{font-size:8px;margin-bottom:3px;white-space:nowrap}\n.compact .stats strong{font-size:11px;white-space:nowrap}\n.compact .chart-wrap{height:64px;flex:none;padding:5px 7px 3px;margin:0}\n.compact .chart-head{font-size:8px;height:11px}\n.compact .chart-head strong{font-size:9px}\n.compact .chart{height:32px;margin:3px 0 0}\n.compact .chart-empty{font-size:9px;top:30px}\n.compact .chart-foot{font-size:8px;height:10px;margin-top:2px}\n.mini-context,#table-strip{display:none}\n.compact #table-strip{display:flex;height:32px;flex:none;gap:4px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#55495d transparent}\n.table-chip{flex:none;min-width:72px;max-width:105px;padding:3px 5px;text-align:left;border:1px solid #453d4c;border-radius:5px;background:#252129;font-size:9px;line-height:12px;overflow:hidden}\n.table-chip.selected{border-color:#8aab8c;background:#2e3a31}\n.table-chip strong,.table-chip small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.table-chip strong{font-size:9px;font-weight:600}\n.table-chip small{font-size:8px;color:#b8abba}\n.compact .compact-actions{height:31px;flex:none;margin:0;padding:0;position:static;gap:6px}\n.compact .compact-actions button{height:31px;font-size:10px;border:1px solid #ffffff08}\n.compact .search-box{min-height:0;height:87px;padding:2px 0}\n.compact .search-box strong{font-size:17px}\n.compact .search-note{font-size:9px}\n#hero-status:focus-visible{outline:1px solid #93ac93}\n.form-body label{font-size:10px;margin:8px 0 4px}\n.form-body select,.form-body input:not([type=checkbox]){height:29px;font-size:11px}\n#settings-page .page-title,#logs-page .page-title{font-size:16px;margin:8px 0 6px}\n#settings-page .page-caption,#logs-page .page-caption{font-size:10px;margin-bottom:8px}\n#settings-page .settings-added{font-size:9px}\n\n.report-scroll{overflow-x:hidden}.report-card{border:1px solid #4a3b24;background:#211b13;border-radius:6px;padding:8px;margin-bottom:7px}.report-card-head{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11px;margin-bottom:5px}.report-card-head strong{font-size:11px}.report-state{color:#baaa8b;font-size:9px}.report-values{display:flex;justify-content:space-between;gap:5px;font-size:10px;font-variant-numeric:tabular-nums}.report-card-time{font-size:8px;color:#a08f72;margin-top:5px;overflow-wrap:anywhere}.report-footer{display:flex;flex-wrap:wrap;gap:7px}.report-footer>span:first-child{width:100%;font-size:10px;line-height:1.5}.report-scroll .report-empty{padding:16px 8px}.report-note{font-size:9px}\n\n.compact .tools{gap:1px}.compact .tools button{width:21px;height:23px;font-size:13px}.compact .brand{font-size:11px}.compact .parallel-summary{color:#c8bfce}.compact .mini-context{font-size:10px;color:#c9c2d1}.compact .subtle,.compact .meta{font-size:10px;color:#c3bacb}.compact .step-labels{font-size:9px;color:#ada4b5}.compact .metrics small,.compact .stats small{font-size:9px;color:#c0b4c8}.compact .chart-head,.compact .chart-foot{font-size:9px;color:#c3b8cc}.compact .chart-empty{color:#b9adc3}.compact .table-chip small{font-size:9px;color:#cec3d5}.compact .table-chip strong{font-size:10px}.compact .chart-wrap{height:65px}.form-body #zoom{height:20px;padding:0;accent-color:#8ead95}.page-caption,.settings-added,.fineprint{color:#c1b5ca!important;font-size:10px!important}.form-body label{color:#e0d6e7}.ack{font-size:10px!important}.report-note,.report-card-time,.report-state{font-size:10px;color:#c9b794}.report-values{font-size:11px}.report-card-head strong{font-size:12px}\n\n*{scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important;width:0;height:0}#overview-page,#settings-page,#logs-page,.report-scroll,#events,#table-strip{scrollbar-width:none!important;-ms-overflow-style:none}#table-strip{overscroll-behavior-x:contain}\n\n.choose-tables{height:27px;font-size:10px;padding:0 6px;border:1px solid #544c5c;border-radius:6px;background:#28222e;flex:none}.rooms-back{width:100%;height:32px;margin-top:14px;border-radius:7px;background:#34473a;font-size:11px}#rooms-page{flex:1;min-height:0;overflow:auto}#rooms-page .room{font-size:11px;min-height:31px;padding:7px 10px}#rooms-page .page-title{font-size:16px;margin:10px 0}\n\n:host{--gold:#d5b779;--mint:#9bd0af;--muted:#b4bec2;color:#f1f5f3;-webkit-font-smoothing:antialiased}\n#panel,#panel.compact{background:radial-gradient(ellipse at 100% 0,#33423b40,transparent 50%),linear-gradient(165deg,#171e1e,#111718 75%);border:1px solid #84968a38;box-shadow:0 14px 38px #0008,inset 0 1px 0 #ffffff0c}\n.compact .brand{color:#ecdfbe;font-weight:700;letter-spacing:.1px}.dot{background:#a5d4b1;box-shadow:0 0 8px #a5d4b155}\n.tools button{background:#25302f;border:1px solid #90a29320;color:#b8c7c2;display:grid;place-items:center}.tools button svg{width:13px;height:13px;stroke:currentColor;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round}.tools button:hover{background:#34443e;color:#f2e3bb}.tools button.active{color:#e8c890;border-color:#d5b77988;background:#50432e}\nbutton{transition:background .12s,border-color .12s,color .12s}button:disabled{cursor:default;opacity:.6}select,input:not([type=checkbox]){outline:none}.parallel-control select,.form-body select,.form-body input:not([type=checkbox]){background:#232d2d;border-color:#82938b44;color:#f0f5f1;border-radius:7px}.parallel-control select:focus,.form-body select:focus,.form-body input:focus{border-color:#d5b779;box-shadow:0 0 0 2px #d5b77917}\n.choose-tables{background:#38372a;border-color:#b49a6355;color:#ead7ac}.compact .parallel-summary{color:#acbab4}.compact .mini-context{color:#a7b7af}.compact #mini-running{color:#d2c49e}.compact .roomline{color:#edf5ef}.compact .meta,.compact .subtle{color:#becbc4}.compact .amount{color:#f5f8f3;text-shadow:0 2px 12px #b8d1b211}.side{background:#623d354d;color:#f4a38c}.side.player{background:#324b6455;color:#aad4ff}.ring-inner{background:#1b2623;color:#d8e9db}\n.compact .stats{background:linear-gradient(115deg,#28352f,#222c2b);border:1px solid #93aa9726;border-radius:8px}.compact .stats small,.compact .metrics small{color:#bec9c1}.green{color:#a1d8b2!important}.red{color:#eeac9c!important}\n.compact .chart-wrap{background:#14201d;border-color:#92a99924;border-radius:8px}.compact .chart-head{color:#c1ccbf}.compact .chart-head strong{color:#d7bf8e}.compact .chart-foot{color:#b1bdb1}.chart polyline{stroke:#9ac9a7}.chart .chart-dot{fill:#cde2af}.chart .chart-area{fill:#9ac9a722}\n.table-chip{background:#24302e;border-color:#84988a33;border-radius:7px}.table-chip.selected{background:linear-gradient(120deg,#3b4738,#2a3930);border-color:#c2b58288}.compact .table-chip strong{color:#f0ebda}.compact .table-chip small{color:#b8c9bc}\n.compact .compact-actions button{background:#293634;border-color:#90a79835;color:#e3ede5;font-weight:600;border-radius:8px}.compact .compact-actions #compact-stop{background:linear-gradient(120deg,#3c644d,#2d523d);color:#ddf1df;border-color:#8ec09755}.compact .compact-actions #compact-stop.live{background:linear-gradient(120deg,#733f36,#58342e);color:#ffe1d4;border-color:#d68d7655}\n.form-body label{color:#d9e1d8}.settings-added{color:#b8c9bd!important}.ack{color:#c9d4cb!important}.ack input{accent-color:#bba675}.setting-actions #start,.rooms-back{background:#3b614d;color:#e9f4e8}.setting-actions #once{background:#4a4935;color:#e7dcbd}.setting-actions #stop{background:#673b32;color:#f7d5c9}.room{background:#25322d;border-color:#87998c44;color:#d4dfd5}.room.active{background:#494734;border-color:#c5ae73;color:#f4e1b7}\n.page-title{color:#f1e5c7}.log-status{background:#26342e;border:1px solid #8ba78e30;color:#e2e7d5!important}#events{font-size:10px;color:#c5d2c8}.report-shell{background:linear-gradient(155deg,#19201b,#131a17);border-color:#a893654d}.report-card{background:linear-gradient(120deg,#29332a,#222d25);border-color:#b19c6636;border-radius:8px}.report-card-head strong{color:#f3e4c1}.report-state,.report-note,.report-card-time{color:#bfccb7}.report-filter select,.report-filter button{background:#263428;border-color:#97a58355}.report-head button,.report-footer button{background:#3a4434;border-color:#98a68355}.report-head h2{color:#e7d3a2}.report-tabs button.selected{color:#e7c784;border-color:#d0b571}\n\n.compact #head{height:50px;flex:none}.compact .topline{height:48px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px}.compact .brand{font-size:13px;line-height:15px}.compact .tools{width:100%;gap:3px;justify-content:space-between}.compact .tools button{height:28px;width:25px;min-width:25px;border-radius:6px;background:#304039;border-color:#a4bbab66;color:#e2eade;box-shadow:inset 0 1px 0 #ffffff12}.compact .tools #nav-overview,.compact .tools #nav-settings,.compact .tools #nav-logs{width:43px;display:flex;gap:3px;justify-content:center;font-size:10px}.compact .tools button svg{width:15px;height:15px}.compact .tools #nav-overview svg,.compact .tools #nav-settings svg,.compact .tools #nav-logs svg{width:12px;height:12px}.compact .tools button.active{background:#6a5931;border-color:#dbc584;color:#fff0bf;box-shadow:0 0 7px #dcc48220}.compact .tools #hide{color:#e9b6a5;background:#533a33;border-color:#c7947766}.compact .hero{height:119px}.compact .metrics{display:none}.compact .statusline{margin-top:5px}.compact .hero #target-box{height:87px}.compact:has(#cards-result:not([hidden])) .hero #target-box{height:68px}.compact .bet-main{margin-top:2px}.compact #overview-page{gap:3px}\n\n#head{height:50px;flex:none}.topline{height:48px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px}.brand{font-size:13px;line-height:15px}.tools{width:100%;gap:3px;justify-content:space-between}.tools button,.compact .tools button{flex:none;padding:0}.tools #nav-overview,.tools #nav-settings,.tools #nav-logs{width:43px;display:flex;gap:3px;justify-content:center;font-size:10px}.tools #nav-overview svg,.tools #nav-settings svg,.tools #nav-logs svg{display:none}.tools span{white-space:nowrap;line-height:1;flex:none}.tools button{height:28px;width:25px;border-radius:6px}.tools button.active{background:#6a5931;border-color:#dbc584;color:#fff0bf}.brand{color:#ecdfbe;font-weight:700}\n\n.risk-overlay{position:absolute;right:0;top:0;width:276px;height:448px;z-index:10;display:grid;place-items:center;background:#08110ed9;backdrop-filter:blur(4px);border-radius:15px;transform:scale(var(--fit));transform-origin:top right;padding:12px}.risk-card{width:100%;padding:16px 12px 14px;border:1px solid #b7a06888;border-radius:12px;background:linear-gradient(155deg,#2c3123,#19221b);box-shadow:0 10px 25px #0007;text-align:center}.risk-triangle{width:74px;height:67px;margin:0 auto 8px;display:block;filter:drop-shadow(0 0 9px #d7b96b33)}.risk-triangle>path:first-child{fill:#e4c274;stroke:#f4dfa4;stroke-width:2;stroke-linejoin:round}.risk-mark{fill:none;stroke:#3a2a15;stroke-width:6;stroke-linecap:round}.risk-point{fill:#3a2a15}.risk-card h2{font-size:18px;color:#f2dfae;margin:0 0 13px}.risk-copy{font-size:13px;line-height:1.9;text-align:left;color:#eee8d7;margin:0 0 17px;overflow-wrap:anywhere}.risk-ack{display:flex;align-items:center;gap:7px;text-align:left;font-size:11px;line-height:1.6;color:#d3e3d5;margin:0 0 16px}.risk-ack input{margin:0;width:17px;height:17px;accent-color:#c6ad6a;flex:none}.risk-actions{display:flex;gap:8px}.risk-actions button{flex:1;height:35px;border:1px solid #84988555;border-radius:7px;background:#303d34;font-size:12px;font-weight:600;color:#e8eee8}.risk-actions #risk-confirm{background:#546d40;border-color:#b1c38588;color:#f4f3dd}.risk-actions #risk-confirm:disabled{background:#303b2b;opacity:.45;cursor:not-allowed}\n\n#panel.compact.mini{width:210px;height:228px;padding:9px;border-radius:12px}\n.compact.mini #head{height:29px}.compact.mini .topline{height:27px;flex-direction:row;align-items:center;gap:4px}.compact.mini .brand{font-size:12px;white-space:nowrap}.compact.mini .tools{width:auto;gap:0}.compact.mini .tools button{display:none}.compact.mini .tools #zoom-out{display:grid;width:31px;height:27px;color:#f7e7bc;border-color:#c5ae7366}.compact.mini .tools #zoom-out svg{width:17px;height:17px}\n.compact.mini .parallel-control,.compact.mini .parallel-summary,.compact.mini .chart-wrap,.compact.mini #table-strip{display:none}\n.compact.mini #overview-page{gap:5px}.compact.mini .mini-context{height:18px;font-size:10px}.compact.mini .hero{height:86px;padding:0}.compact.mini #target-box,.compact.mini:has(#cards-result:not([hidden])) .hero #target-box{height:60px}.compact.mini .roomline{height:16px;font-size:11px}.compact.mini .bet-main{height:39px;margin:2px 0 0;gap:6px}.compact.mini .amount{font-size:25px}.compact.mini .amount.long-number{font-size:19px}.compact.mini .ring{width:32px;height:32px}.compact.mini .bet-value{gap:4px}.compact.mini .side{font-size:9px;padding:3px}.compact.mini .meta,.compact.mini .steps,.compact.mini .step-labels,.compact.mini .cards-result{display:none}.compact.mini .statusline{font-size:10px;line-height:12px;height:24px;margin-top:2px}.compact.mini .stats{height:34px;padding:4px 6px;border-radius:6px}.compact.mini .stats small{font-size:9px;margin-bottom:2px}.compact.mini .stats strong{font-size:11px}.compact.mini .compact-actions{height:30px;gap:5px}.compact.mini .compact-actions button{height:30px;font-size:10px}.compact.mini .compact-actions #open-report{flex:.75}\n\n.compact.mini #overview-page{gap:4px}.compact.mini .hero{height:80px}.compact.mini .statusline{height:20px;line-height:10px}.compact.mini .stats{height:32px}.compact.mini .stats small{font-size:8px}\n\n.compact.mini .tools #nav-overview,.compact.mini .tools #nav-settings,.compact.mini .tools #nav-logs,.compact.mini .tools #nav-mode,.compact.mini .tools #zoom-in,.compact.mini .tools #hide{display:none}.compact.mini .bet-value{min-width:0}.compact.mini .stats>div{min-width:0}\n\n.compact.mini .topline{width:100%;justify-content:space-between}.compact.mini .tools{flex:none;width:31px}\n";

  // lib/dg-panel-pro.ts
  var DG_PRO_CSS = `
:host {
  --pro-bg: #11171c;
  --pro-surface: #1b242b;
  --pro-line: #34434c;
  --pro-text: #ecf3f5;
  --pro-muted: #a5b6bf;
  --pro-accent: #8ed8bf;
  -webkit-font-smoothing: antialiased;
}
#panel, #panel.compact, #panel.compact.mini {
  background: linear-gradient(150deg, #1a242b 0%, #121a20 65%, #10171c);
  border-color: #6e89994d;
  box-shadow: 0 14px 36px #0009, inset 0 1px 0 #ffffff0b;
}
.brand, .compact .brand {
  color: #f2eee1;
  letter-spacing: .2px;
  font-weight: 750;
}
.dot { background: #8ed8bf; box-shadow: 0 0 0 3px #8ed8bf12; }
.tools button, .compact .tools button {
  background: #233039;
  border-color: #4c636f99;
  color: #dbe8ee;
  box-shadow: inset 0 1px 0 #ffffff0b;
}
.tools button.active, .compact .tools button.active {
  background: #304940;
  border-color: #8ed8bfbb;
  color: #c9f3e7;
  box-shadow: inset 0 -2px 0 #8ed8bf66;
}
.compact .tools #hide, .compact.mini .tools #zoom-out {
  background: #26343e;
  border-color: #7695a5aa;
  color: #e1edf3;
}
.parallel-control label, .compact .parallel-control label { color: #d6e2e7; }
.parallel-control select, .form-body select, .form-body input:not([type=checkbox]) {
  background: #1c2932;
  border-color: #4d64706b;
  color: #f2f6f8;
  border-radius: 6px;
  box-shadow: inset 0 1px 3px #0002;
}
.parallel-control select:focus, .form-body select:focus, .form-body input:focus {
  border-color: #8ed8bf;
  box-shadow: 0 0 0 2px #8ed8bf22;
}
.choose-tables { background: #283a43; border-color: #5b7b8b99; color: #d4e9f3; }
.compact .parallel-summary { color: #a5b8c3; }
.compact .mini-context, .compact .meta, .compact .subtle { color: #b5c5ce; }
.compact #mini-running { color: #b9dacd; }
.compact .amount { color: #f4f8f9; text-shadow: none; }
.side { color: #f8b6a8; background: #7d484047; border: 1px solid #b47c6c33; }
.side.player { color: #b0d9ff; background: #3b5f8b44; border-color: #729ac633; }
.ring-inner { background: #18242b; color: #e1eee8; }
.compact .roomline { color: #f0f6f8; }
.compact .statusline { color: #b5c6d0; }
.compact .stats {
  background: linear-gradient(120deg, #24323a, #1d2a31);
  border-color: #607c8b40;
  border-radius: 7px;
}
.compact .stats small { color: #b8cad4; }
.compact .stats > div + div { padding-left: 5px; border-left: 1px solid #7a929d26; }
.compact .chart-wrap { background: #151f26; border-color: #60778335; }
.compact .chart-head, .compact .chart-foot { color: #b7c8d2; }
.compact .chart-head strong { color: #b7e5d2; }
.green { color: #a0e6c9 !important; }
.red { color: #f5b0a6 !important; }
.table-chip { background: #1e2b34; border-color: #607a873f; border-radius: 6px; }
.table-chip.selected { background: #2b4139; border-color: #8cc7b399; }
.compact .table-chip strong { color: #e7f2ee; }
.compact .table-chip small { color: #b9ccd6; }
.compact .compact-actions button {
  background: #293b46;
  border-color: #7594a477;
  color: #e3eff5;
  font-weight: 650;
  border-radius: 7px;
}
.compact .compact-actions #compact-stop {
  background: linear-gradient(120deg, #367d65, #29644f);
  border-color: #85d1b69c;
  color: #f0fff7;
}
.compact .compact-actions #compact-stop.live {
  background: linear-gradient(120deg, #894b44, #6e3e38);
  border-color: #d59b8ea0;
  color: #fff1ea;
}
.page-title, .report-head h2 { color: #edf4f6; letter-spacing: .2px; }
.form-body label { color: #dce7ed; }
.settings-added, .page-caption { color: #b6c7cf !important; }
.room { background: #24343d; color: #d1e2ea; border-color: #64829180; }
.room.active { background: #304b40; color: #d3f3e2; border-color: #8bc9aa; }
.rooms-back { background: #315d4e; color: #e1f5e8; border: 1px solid #7aad8d; }
.log-status { background: #1d3139; border-color: #6e9dac50; color: #cee4ec !important; }
#events { color: #c2d3dc; }
.report-shell { background: #131e25; border-color: #718d9b80; }
.report-head { border-color: #536e7c55; }
.report-card { background: #22343d; border-color: #64849455; }
.report-card-head strong { color: #e8f3f4; }
.report-state, .report-note, .report-card-time { color: #bfd1da; }
.report-head button, .report-footer button { background: #2d4350; border-color: #86a5b488; color: #e1eff6; }
.report-filter select, .report-filter button { background: #21343e; border-color: #68879677; color: #d9eaf2; }
.report-filter button.selected, .report-tabs button.selected { color: #b4ebd3; border-color: #8ed8bf; }
.report-tabs { border-color: #6a849344; }
.risk-overlay { background: #0a141de6; }
.risk-card { background: linear-gradient(155deg, #263039, #16212a); border-color: #bfa76fbb; }
.risk-copy { color: #e4edf2; }
.risk-ack { color: #d6e6ef; }
.risk-actions button { background: #2c3f4b; border-color: #809dad88; color: #e8f1f6; }
.risk-actions #risk-confirm { background: #3b775f; border-color: #93d3b7; color: #f1fff6; }
.risk-actions #risk-confirm:disabled { background: #2b383d; opacity: .45; }
/* \u6240\u6709\u6309\u9215\uFF1A\u89F8\u63A7\u6309\u58D3\u3001\u6ED1\u9F20\u61F8\u505C\u3001\u9375\u76E4\u7126\u9EDE\u53CA\u9EDE\u64CA\u5F8C\u9AD8\u4EAE\u3002 */
button, [role=button] {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 100ms ease, filter 120ms ease, box-shadow 120ms ease,
    background-color 120ms ease, border-color 120ms ease;
}
button:not(:disabled):active, button[data-pressed=true]:not(:disabled),
[role=button]:active, [role=button][data-pressed=true] {
  transform: translateY(1px) scale(.97);
  filter: brightness(1.24);
  box-shadow: inset 0 0 0 2px #c2efdf88, inset 0 2px 5px #0004 !important;
}
@media (hover:hover) {
  button:not(:disabled):hover, [role=button]:hover {
    filter: brightness(1.16);
    box-shadow: 0 0 0 1px #a3cbbf66;
  }
}
button:focus-visible, [role=button]:focus-visible {
  outline: 2px solid #a8e4ce;
  outline-offset: 2px;
}
button:disabled { filter: saturate(.45); cursor: not-allowed; }
@media (prefers-reduced-motion:reduce) {
  button, [role=button] { transition: none; }
  button:active, button[data-pressed=true], [role=button]:active { transform: none; }
}
`;

  // lib/dg-panel-spacious.ts
  var DG_SPACIOUS_CSS = `
#panel:not(.mini), #panel.compact:not(.mini) {
  width: 336px;
  height: var(--full-height, 710px);
  padding: 18px;
  gap: 14px;
  border-radius: 18px;
  background: #141c22;
  border-color: #53697555;
  box-shadow: 0 22px 56px #0008, inset 0 1px 0 #ffffff08;
}
#panel:not(.mini) #head { height: 82px; }
#panel:not(.mini) .topline {
  width: 100%; height: 82px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 32px 38px;
  gap: 10px 6px;
  align-items: center;
}
#panel:not(.mini) .brand { grid-column: 1 / 5; grid-row: 1; font-size: 16px; line-height: 1.4; }
#panel:not(.mini) .dot { width: 6px; height: 6px; margin-right: 3px; }
#panel:not(.mini) .tools { display: contents; }
#panel:not(.mini) .tools #nav-mode, #panel:not(.mini) .tools #hide { display: none; }
#panel:not(.mini) .tools #zoom-in { grid-column: 5; grid-row: 1; }
#panel:not(.mini) .tools #zoom-out { grid-column: 6; grid-row: 1; }
#panel:not(.mini) .tools #nav-overview { grid-column: 1 / 3; grid-row: 2; }
#panel:not(.mini) .tools #nav-settings { grid-column: 3 / 5; grid-row: 2; }
#panel:not(.mini) .tools #nav-logs { grid-column: 5 / 7; grid-row: 2; }
#panel:not(.mini) .tools button { width: 100%; height: 32px; border-radius: 7px; border-color: #52687355; background: #202d35; }
#panel:not(.mini) .tools #nav-overview, #panel:not(.mini) .tools #nav-settings, #panel:not(.mini) .tools #nav-logs {
  height: 38px; font-size: 12px; font-weight: 500; display: flex;
  border: 0; border-bottom: 2px solid transparent; border-radius: 0;
  background: none; color: #b6c4cb; box-shadow: none;
}
#panel:not(.mini) .tools button.active { color: #b0e6d0 !important; border-bottom-color: #8bd1b2 !important; box-shadow: none; }
#panel:not(.mini) #overview-page {
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; overflow-x: hidden; padding-right: 1px;
  flex: 1; min-height: 0;
}
#panel:not(.mini) .parallel-control { height: 38px; gap: 10px; margin: 0; }
#panel:not(.mini) .parallel-control label { font-size: 11px; }
#panel:not(.mini) .parallel-control select { height: 38px; font-size: 12px; border-radius: 8px; }
#panel:not(.mini) .choose-tables { height: 38px; font-size: 11px; padding: 0 10px; }
#panel:not(.mini) .parallel-summary { display: none; }
#panel:not(.mini) .mini-context { height: 20px; font-size: 11px; color: #a6bac5; flex: none; }
#panel:not(.mini) .mini-context strong { font-size: 13px; color: #e3edf2; }
#panel:not(.mini) .hero {
  height: auto; min-height: 120px; flex: none; padding: 0;
  background: none; display: flex; gap: 10px;
}
#panel:not(.mini) .hero #target-box { height: auto; min-height: 90px; }
#panel:not(.mini) .roomline { height: 22px; font-size: 13px; gap: 9px; margin: 0; }
#panel:not(.mini) .roomline .subtle { font-size: 10px; }
#panel:not(.mini) .bet-main { height: 50px; margin: 7px 0; flex-direction: row; justify-content: space-between; gap: 10px; }
#panel:not(.mini) .bet-value { flex: 1; gap: 10px; }
#panel:not(.mini) .amount { font-size: 38px; line-height: 1; letter-spacing: -1px; }
#panel:not(.mini) .amount.long-number { font-size: 29px; }
#panel:not(.mini) .side { font-size: 10px; padding: 5px 7px; border-radius: 6px; }
#panel:not(.mini) .ring { height: 43px; width: 43px; }
#panel:not(.mini) .ring-inner { font-size: 14px; }
#panel:not(.mini) .meta { height: auto; min-height: 17px; font-size: 10px; line-height: 1.6; white-space: normal; }
#panel:not(.mini) .steps, #panel:not(.mini) .step-labels, #panel:not(.mini) .metrics { display: none; }
#panel:not(.mini) .statusline {
  height: auto; min-height: 17px; max-height: 34px;
  font-size: 11px; line-height: 17px; margin: 0;
  color: #adbec7; -webkit-line-clamp: 2;
}
#panel:not(.mini) .stats {
  height: 64px; padding: 12px 10px; flex: none;
  border-radius: 9px; background: #1c2a32; border-color: #607b8838;
}
#panel:not(.mini) .stats small { font-size: 10px; margin-bottom: 8px; font-weight: 400; color: #a4b7c3; }
#panel:not(.mini) .stats strong { font-size: 16px; font-weight: 600; }
#panel:not(.mini) .stats > div + div { padding-left: 12px; border-color: #637c8733; }
#panel:not(.mini) .chart-wrap { height: 94px; padding: 11px 10px 8px; margin: 0; flex: none; background: #18232b; border-radius: 9px; }
#panel:not(.mini) .chart-head { height: 13px; font-size: 10px; }
#panel:not(.mini) .chart-head strong { font-size: 11px; }
#panel:not(.mini) .chart { height: 43px; margin: 7px 0 4px; }
#panel:not(.mini) .chart-foot { height: 12px; font-size: 9px; margin: 0; color: #9cb3c0; }
#panel:not(.mini) .chart-empty { top: 42px; font-size: 10px; }
#panel:not(.mini) #table-strip { display: flex; height: 48px; min-height: 48px; gap: 7px; overflow-x: auto; flex: none; }
#panel:not(.mini) .table-chip { min-width: 112px; max-width: 138px; padding: 7px 9px; border-radius: 8px; background: #1c2a33; }
#panel:not(.mini) .table-chip strong { font-size: 11px; line-height: 15px; font-weight: 600; }
#panel:not(.mini) .table-chip small { font-size: 10px; line-height: 15px; font-weight: 400; }
#panel:not(.mini) > .compact-actions { height: 44px; min-height: 44px; margin: 0; padding: 0; display: flex; gap: 9px; flex: none; border-top: 1px solid #59717b33; }
#panel:not(.mini) > .compact-actions button { height: 44px; font-size: 12px; font-weight: 600; border-radius: 8px; }
#panel:not(.mini) > .compact-actions #open-report { flex: .75; background: #263841; border-color: #78909c55; }
#panel:not(.mini):has(#overview-page[hidden]) > .compact-actions { display: none; }
#panel.mini { gap: 4px; }
#panel.mini > .compact-actions { height: 30px; min-height: 30px; flex: none; margin: 0; padding: 0; }
#panel.mini #overview-page { overflow-y: auto; }
#panel:not(.mini) .page-title { font-size: 20px; margin: 4px 0 18px; font-weight: 650; }
#panel:not(.mini) .form-body label { font-size: 12px; margin: 18px 0 9px; }
#panel:not(.mini) .form-body select, #panel:not(.mini) .form-body input:not([type=checkbox]) { height: 42px; font-size: 13px; padding: 9px 11px; border-radius: 8px; }
#panel:not(.mini) .form-row { gap: 12px; }
#panel:not(.mini) .settings-added { font-size: 11px; line-height: 1.7; margin: 12px 0; }
#panel:not(.mini) .page-caption { font-size: 11px; line-height: 1.7; margin: 0 0 16px; }
#panel:not(.mini) #events { font-size: 11px; line-height: 1.9; }
#panel:not(.mini) .log-status { padding: 13px; margin: 0 0 16px; line-height: 1.8; }
#panel:not(.mini) #rooms { gap: 8px; }
#panel:not(.mini) #rooms .room { min-height: 38px; font-size: 12px; padding: 8px 12px; }
#panel:not(.mini) .rooms-back { height: 40px; margin-top: 18px; font-size: 12px; }
.risk-overlay, .report-shell { width: 336px; height: var(--full-height, 710px); }
.risk-overlay { padding: 20px; border-radius: 18px; }
.risk-card { padding: 22px 18px 18px; border-radius: 13px; }
.risk-triangle { width: 70px; height: 65px; margin-bottom: 16px; }
.risk-copy { font-size: 13px; line-height: 1.9; margin-bottom: 22px; }
.risk-ack { font-size: 12px; margin-bottom: 20px; }
.risk-actions button { height: 42px; font-size: 13px; }
.report-shell { padding: 18px; border-radius: 18px; }
.report-head h2 { font-size: 18px; }
.report-head button { font-size: 11px; padding: 8px 10px; }
.report-filter { gap: 8px; margin: 16px 0; }
.report-filter label, .report-filter select, .report-filter button { font-size: 10px; }
.report-card { padding: 12px; margin-bottom: 10px; border-radius: 8px; }
.report-card-head strong { font-size: 13px; }
.report-values { font-size: 12px; margin: 9px 0; }
.report-card-time { font-size: 10px; }
.report-footer { gap: 9px; padding-top: 9px; }

/* \u67D4\u548C\u547C\u5438\u6307\u793A\uFF1A\u53EA\u8868\u793A\u5DE5\u5177\u5B58\u5728\uFF0C\u4E0D\u4EE3\u8868\u4E0B\u6CE8\u6210\u529F\u6216\u9023\u7DDA\u6B63\u5E38\u3002 */
.dot { position: relative; flex: none; animation: dg-dot-breathe 2600ms ease-in-out infinite; }
.dot::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1px solid #8dd8b480; animation: dg-dot-halo 2600ms ease-in-out infinite; pointer-events: none; }
@keyframes dg-dot-breathe { 0%,100% { opacity: .65; box-shadow: 0 0 3px #83d6b133; } 50% { opacity: 1; box-shadow: 0 0 10px #83d6b188; } }
@keyframes dg-dot-halo { 0%,100% { transform: scale(.75); opacity: .15; } 50% { transform: scale(1.2); opacity: .65; } }
.risk-overlay { overflow-y: auto; align-items: safe center; }
.risk-card { flex: none; max-width: 100%; }
#panel:not(.mini) .headline, #panel:not(.mini) .hero-head, #panel:not(.mini) .main-action, #panel:not(.mini) .section-head, #panel:not(.mini) #tables, #panel:not(.mini) .footer { display: none; }
@media (prefers-reduced-motion:reduce) { .dot,.dot::after { animation: none; opacity: 1; } }
`;

  // lib/dg-panel-surfaces.ts
  var DG_SURFACES_CSS = `
:host { --ui-border: #47617140; --ui-card: #1b2932; --ui-label: #a9bdc9; --ui-accent: #a0dcc4; }
#panel, .report-shell { font-variant-numeric: tabular-nums; }
.surface-heading { display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 9px; }
#panel:not(.mini) .surface-heading .page-title {margin:0;font-size:21px;line-height:1.4;}
.surface-kicker { font-size:9px;color:#84b19f;letter-spacing:1.1px;margin:0 0 5px; }
.surface-note {font-size:11px;color:var(--ui-label);line-height:1.8;margin:0 0 18px;}
.surface-icon {display:grid;place-items:center;width:36px;height:36px;border:1px solid #82ab9840;background:#243b34;border-radius:10px;color:#b7e6d2;flex:none;}
.surface-icon svg {width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
#panel:not(.mini) .form-section {border:1px solid var(--ui-border);border-radius:11px;background:#1a272f;padding:14px;margin-bottom:14px;}
.form-section-head {font-size:11px;font-weight:600;color:#d3e1e8;display:flex;align-items:center;gap:8px;margin:0 0 11px;}
.form-section-head i {font-style:normal;font-size:9px;color:#a4d6c0;border:1px solid #7baa9538;border-radius:5px;padding:3px 5px;background:#263c33;}
#panel:not(.mini) .form-section label {font-size:11px;margin:12px 0 7px;color:#b4c8d2;}
#panel:not(.mini) .form-section select,#panel:not(.mini) .form-section input:not([type=checkbox]) {height:39px;background:#111e26;border-color:#536e7e55;font-size:12px;border-radius:7px;}
#panel:not(.mini) .form-section .settings-added {font-size:10px;color:#94b0bf!important;margin:10px 0 0;line-height:1.7;}
.form-section .form-row {gap:10px;}
.form-section .field-note {font-size:10px;color:#91a9b7;line-height:1.7;margin:11px 0 0;}
#panel:not(.mini) #rooms-page {display:flex;flex-direction:column;overflow:hidden;}
#panel:not(.mini) #rooms {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;overflow-y:auto;min-height:0;align-content:start;flex:1;}
#panel:not(.mini) #rooms .room {min-height:77px;padding:12px;display:flex;flex-direction:column;gap:9px;align-items:stretch;text-align:left;background:#1b2932;border:1px solid #4e6c7b55;border-radius:10px;}
.room-title {display:flex;justify-content:space-between;align-items:center;gap:8px;}
.room-title strong {font-size:14px;color:#edf6f3;font-weight:650;}
.room-check {width:18px;height:18px;border:1px solid #78909b66;border-radius:50%;display:grid;place-items:center;font-size:10px;color:transparent;}
.room-detail {font-size:10px;font-weight:400;color:#adc1cc;line-height:1.5;}
#panel:not(.mini) #rooms .room.active {background:#243d33;border-color:#90caae88;box-shadow:inset 0 1px 0 #b6e8cc12;}
.room.active .room-check {color:#16271f;border-color:#a3dec4;background:#a3dec4;}
.room:disabled {opacity:.6;}
#panel:not(.mini) .rooms-back {flex:none;margin-top:15px;height:42px;background:#386c56;border-color:#78ac96;}
#panel:not(.mini) #logs-page {display:flex;flex-direction:column;overflow:hidden;}
#panel:not(.mini) .log-status {font-size:11px;background:#223830;border:1px solid #709c8847;border-radius:10px;padding:13px;margin:0 0 16px;color:#cce4d7!important;}
.log-label {display:block;font-size:9px;color:#8ebfa9;margin-bottom:7px;letter-spacing:.4px;}
#panel:not(.mini) #events {flex:1;min-height:0;max-height:none;overflow-y:auto;white-space:normal;padding:0 0 8px;}
.event-card {position:relative;padding:0 0 16px 16px;border-left:1px solid #7893883b;margin-left:4px;}
.event-card::before {content:'';position:absolute;width:6px;height:6px;border-radius:50%;background:#8daaa0;left:-3.5px;top:5px;}
.event-card time {font-size:9px;line-height:1.5;color:#8fa7b5;display:block;margin-bottom:5px;}
.event-card p {font-size:11px;line-height:1.8;color:#d3e1e8;margin:0;overflow-wrap:anywhere;}
.event-card.accepted::before {background:#9edbbd;}
.event-card.warning::before {background:#e1b680;}
#panel:not(.mini) .statusline {border-left:2px solid #719b87;padding-left:8px;}
#panel:not(.mini) .mini-context {color:#aec2cb;}
#panel:not(.mini) .side {border-radius:5px;}
#panel:not(.mini) #table-strip {gap:8px;}
#panel:not(.mini) .table-chip.selected {border-color:#a2d5bd90;background:#293f36;}
.report-shell {background:#141f27;color:#d6e6ee;}
.report-head {padding:0 0 16px;border-bottom:1px solid #5a738144;gap:10px;flex:none;}
.report-head h2 {font-size:21px;line-height:1.4;letter-spacing:.1px;}
.report-head button {border:1px solid #69879755;background:#243841;color:#cde2ec;border-radius:7px;min-height:34px;}
.report-filter {display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px 8px;padding:14px 0;margin:0;flex:none;}
.report-filter label {grid-column:span 3;display:flex;flex-direction:column;gap:7px;font-size:10px;color:#aabfcc;}
.report-filter select {width:100%;height:35px;background:#1b2c37;border-color:#5c7b8c55;border-radius:7px;padding:6px 9px;color:#dcebf2;font-size:11px;}
.report-filter>button {grid-column:span 2;height:34px;border:1px solid #4f6a7a66;border-radius:7px;font-size:11px;color:#b8ccd5;background:#1c2d36;}
.report-filter>button.selected {background:#2c493b;border-color:#92c7ad88;color:#c3e9d4;}
.report-tabs {margin:0;border-color:#5c778044;gap:12px;flex:none;}
.report-tabs button {font-size:11px;padding:8px 0 10px;}
.report-tabs button.selected {color:#b4e3cf;border-bottom-color:#98d6b8;}
.report-note {font-size:10px;color:#96b0c0;margin:10px 0 14px;flex:none;}
.report-card {background:#1c2d37;border:1px solid #526e7d50;border-radius:10px;padding:13px;margin-bottom:12px;}
.report-card-head {margin:0 0 10px;}
.report-card-head strong {font-size:13px;letter-spacing:.1px;}
.report-state {font-size:9px;background:#2e443b;color:#bbd9c8;border-radius:5px;padding:4px 6px;}
.report-values {font-size:11px;color:#b8d0dc;margin:0;padding:9px 0;border-top:1px solid #7c9da02b;}
.report-values strong {font-size:13px;}
.report-card-time {font-size:9px;margin-top:4px;color:#8eabba;line-height:1.6;}
.report-footer {flex-direction:column;align-items:stretch;gap:13px;margin:12px 0 0;padding:13px 0 0;border-top:1px solid #607c8838;color:#b7cdd7;flex:none;}
.report-footer #report-total {font-size:10px;line-height:1.8;width:100%;}
.report-footer>span:last-child {display:flex;align-items:center;justify-content:space-between;gap:10px;}
.report-footer button {height:33px;min-width:73px;font-size:10px;border-color:#6b879855;border-radius:7px;}
.report-empty {font-size:12px;line-height:1.8;padding:38px 16px!important;color:#a7bfcd;}
.risk-overlay {background:#0a141cde;backdrop-filter:blur(7px);}
.risk-card {background:#1c2b34;border:1px solid #a58d5977;border-radius:15px;padding:24px 20px 20px;text-align:left;box-shadow:0 15px 38px #0007;}
.risk-emblem {width:76px;height:76px;background:#ad8d4020;border:1px solid #c8a56038;display:grid;place-items:center;margin:0 auto 20px;border-radius:20px;}
.risk-triangle {width:48px;height:45px;margin:0;filter:none;}
.risk-card h2 {font-size:20px;color:#f0dcac;margin:0 0 16px;text-align:center;font-weight:650;}
.risk-copy {font-size:12px;line-height:2;color:#d5e0e6;margin:0 0 20px;}
.risk-ack {padding:12px 10px;border:1px solid #6281744d;background:#233b30;border-radius:8px;font-size:11px;line-height:1.7;gap:9px;margin:0 0 18px;color:#c6e3d3;}
.risk-ack input {width:18px;height:18px;accent-color:#9fcbb3;}
.risk-actions {gap:10px;}
.risk-actions button {height:42px;border-radius:8px;font-size:12px;font-weight:600;}
.risk-actions #risk-cancel {background:#263842;border-color:#74919e70;color:#d0e2ec;}
.risk-actions #risk-confirm {background:#40785e;border-color:#91cbb0;color:#ebfff3;}
#panel.compact.mini {background:#141f27;border-color:#607c8c70;border-radius:13px;box-shadow:0 14px 30px #0007;}
.compact.mini .brand {color:#e4eee9;font-weight:650;font-size:12px;}
.compact.mini .tools #zoom-out {background:#253c46;border-color:#7b9aaa66;border-radius:7px;color:#dcecf2;}
.compact.mini .mini-context {color:#98b5c5;font-size:10px;}
.compact.mini #mini-running {color:#afd6c3;}
.compact.mini .roomline {color:#ebf2f5;}
.compact.mini .ring-inner {background:#182831;}
.compact.mini .stats {background:#20323c;border-color:#607c8c40;border-radius:7px;}
.compact.mini .stats small {color:#a2becb;}
.compact.mini .stats strong {color:#d6e8ef;}
.compact.mini .compact-actions {background:none;}
.compact.mini .compact-actions #open-report {background:#283e49;border-color:#7c99a955;font-size:10px;}
.compact.mini .compact-actions #compact-stop {background:#3a785e;border-color:#8ec6ab88;font-size:10px;}
.compact.mini .compact-actions #compact-stop.live {background:#804b45;border-color:#c78d8377;}

#panel:not(.mini),#panel.compact:not(.mini),.report-shell,.risk-overlay {width:var(--full-width,336px);}
#panel:not(.mini) .topline {grid-template-columns:repeat(6,minmax(0,1fr));}
#panel:not(.mini) .brand {grid-column:1/5;}
#panel:not(.mini) .tools #zoom-in {display:none;}
#panel:not(.mini) .tools #zoom-out {grid-column:5/7;display:flex;gap:7px;align-items:center;justify-content:center;width:100%;height:34px;font-size:11px;color:#cce8dc;background:#2a4139;border:1px solid #80b79e66;}
#panel:not(.mini) .tools #zoom-out svg {width:14px;height:14px;}
#panel.compact.mini {width:210px;}
.compact.mini .tools {width:45px;}
.compact.mini .tools #zoom-out {display:flex;align-items:center;justify-content:center;width:45px;height:28px;font-size:9px;padding:0;}
.compact.mini .tools #zoom-out svg {display:none;}
.resize-grip {position:absolute;right:1px;bottom:1px;width:25px;height:25px;display:grid;place-items:center;color:#7898a7;cursor:nwse-resize;touch-action:none;z-index:2;border-radius:0 0 15px 0;background:none;}
.resize-grip svg {width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;}
.resize-grip:hover,.resize-grip[data-resizing=true] {color:#c0e5d0;background:#72a48b22;}
#panel.mini .resize-grip {display:none;}
#panel:not(.mini)> .compact-actions {margin-bottom:7px;}
.report-shell {padding-bottom:26px;}
#panel:not(.mini) #settings-page {overflow-y:auto;}
#panel:not(.mini) #settings-page .form-body {padding:0;}
#panel:not(.mini) #logs-page .surface-note,#panel:not(.mini) #rooms-page .surface-note {flex:none;}
#panel:not(.mini) .surface-heading {flex:none;}
#panel:not(.mini) .cards-result {height:auto;min-height:40px;padding:7px 9px;background:#20313b;border:1px solid #54718444;border-radius:8px;}
#panel:not(.mini) .cards-side small {font-size:9px;}
#panel:not(.mini) .playing-card {width:18px;height:26px;font-size:10px;}

.selection-control {display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid #5c7d7040;background:#23372e;border-radius:10px;margin:4px 0 14px;flex:none;}
.selection-control span {font-size:11px;color:#c0decf;line-height:1.7;}
.selection-control button {height:33px;border-radius:7px;background:#293e45;border:1px solid #7da79355;font-size:11px;}
.selection-control button.selected {background:#38674f;color:#daf6e6;}

.strategy-preview {display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#8faebb;margin:0 0 8px;}
.strategy-preview strong {color:#c4e5d5;font-size:10px;font-weight:500;border:1px solid #87b49a40;background:#243b302e;border-radius:5px;padding:3px 7px;}
.compact.mini .strategy-preview {display:none;}
#panel:not(.mini) .hero {min-height:145px;}
#panel:not(.mini) .statusline {margin-top:0;}

.provider-picker {position:relative;}
#provider-trigger {width:100%;display:flex;gap:10px;align-items:center;height:40px;border:1px solid #65889966;border-radius:8px;background:#13212b;padding:0 11px;color:#dfedf4;font-size:12px;}
.provider-logo {display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex:none;color:#e1f4ec;}
.provider-logo svg {height:20px;width:20px;fill:inherit;}
.provider-logo svg[fill="currentColor"] {fill:currentColor;}
.provider-arrow {width:13px;height:13px;margin-left:auto;fill:none;stroke:currentColor;stroke-width:1.8;}
#provider-trigger[aria-expanded=true] {border-color:#9bccb3;}
#provider-trigger[aria-expanded=true] .provider-arrow {transform:rotate(180deg);}
#provider-menu {position:absolute;left:0;right:0;top:46px;z-index:5;background:#1e2f3a;border:1px solid #75998a88;border-radius:11px;padding:5px;box-shadow:0 14px 28px #0007;}
.provider-option {width:100%;min-height:39px;display:flex;align-items:center;gap:10px;border-radius:7px;padding:7px 9px;font-size:12px;color:#d3e4ed;text-align:left;}
.provider-option:hover {background:#304b42;}
.provider-option.selected {background:#355444;color:#e7fff0;}
.provider-check {margin-left:auto;font-size:11px;color:transparent;}
.provider-option.selected .provider-check {color:#b3e3c9;}
.strategy-badge {display:inline-flex;align-items:center;gap:6px;border:1px solid #87b49a40;background:#243b302e;border-radius:6px;padding:3px 7px;}
.strategy-badge .provider-logo {width:14px;height:14px;}
.strategy-badge .provider-logo svg {width:14px;height:14px;}
.strategy-preview .strategy-badge strong {padding:0;border:0;background:none;}

.amount-explainer{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:10px;color:#9eb7c1;margin:8px 0 2px;font-variant-numeric:tabular-nums}.amount-explainer span:last-child{text-align:right}.risk-stake-summary{border:1px solid #7eae9550;background:#28413360;border-radius:8px;padding:10px;color:#bfe6d0;font-size:11px;line-height:1.6;margin:12px 0}.compact.mini .amount-explainer{font-size:9px;margin:2px 0 1px}.compact.mini #amount-rule{display:none}.compact.mini .hero{height:83px}.compact.mini #hero-status{display:none}
`;

  // lib/dg-panel-small.ts
  var DG_SMALL_CSS = `
#panel:not(.mini),#panel.compact:not(.mini){width:var(--full-width,280px);height:var(--full-height,560px);padding:14px;gap:8px;border-radius:15px;}
#panel:not(.mini) #head{height:64px;}
#panel:not(.mini) .topline{height:64px;grid-template-rows:28px 30px;gap:6px;}
#panel:not(.mini) .brand{font-size:14px;}
#panel:not(.mini) .tools #zoom-out{height:28px;font-size:10px;}
#panel:not(.mini) .tools #nav-overview,#panel:not(.mini) .tools #nav-settings,#panel:not(.mini) .tools #nav-logs{height:30px;font-size:11px;}
#panel:not(.mini) #overview-page{gap:7px;}
#panel:not(.mini) .parallel-control{height:30px;gap:8px;}
#panel:not(.mini) .parallel-control label{font-size:10px;}
#panel:not(.mini) .parallel-control select,#panel:not(.mini) .choose-tables{height:30px;font-size:11px;}
#panel:not(.mini) .mini-context{height:18px;font-size:10px;}
#panel:not(.mini) .mini-context strong{font-size:12px;}
#panel:not(.mini) .hero{min-height:0;gap:6px;}
#panel:not(.mini) .strategy-preview{margin-bottom:4px;}
#panel:not(.mini) .roomline{height:19px;font-size:12px;}
#panel:not(.mini) .amount-explainer{margin:5px 0 2px;font-size:9px;}
#panel:not(.mini) .bet-main{height:43px;margin:5px 0;gap:8px;}
#panel:not(.mini) .amount{font-size:32px;}
#panel:not(.mini) .amount.long-number{font-size:25px;}
#panel:not(.mini) .side{font-size:9px;padding:4px 5px;}
#panel:not(.mini) .ring{width:37px;height:37px;}
#panel:not(.mini) .ring-inner{font-size:12px;}
#panel:not(.mini) .meta{font-size:9px;min-height:15px;line-height:1.6;}
#panel:not(.mini) .statusline{font-size:10px;line-height:15px;max-height:30px;min-height:15px;}
#panel:not(.mini) .stats{height:50px;padding:9px 8px;}
#panel:not(.mini) .stats small{font-size:9px;margin-bottom:5px;}
#panel:not(.mini) .stats strong{font-size:14px;}
#panel:not(.mini) .stats>div+div{padding-left:7px;}
#panel:not(.mini) .chart-wrap{height:76px;padding:8px 8px 6px;}
#panel:not(.mini) .chart-head{font-size:9px;height:12px;}
#panel:not(.mini) .chart-head strong{font-size:10px;}
#panel:not(.mini) .chart{height:31px;margin:5px 0 3px;}
#panel:not(.mini) .chart-foot{font-size:8px;height:11px;}
#panel:not(.mini) .chart-empty{top:32px;font-size:9px;}
#panel:not(.mini) #table-strip{height:43px;min-height:43px;gap:6px;}
#panel:not(.mini) .table-chip{padding:6px 8px;min-width:104px;max-width:124px;}
#panel:not(.mini) .table-chip strong{font-size:10px;line-height:14px;}
#panel:not(.mini) .table-chip small{font-size:9px;line-height:14px;}
#panel:not(.mini)>.compact-actions{height:36px;min-height:36px;margin:0 0 5px;gap:8px;}
#panel:not(.mini)>.compact-actions button{height:36px;font-size:11px;}
#panel:not(.mini) .surface-heading .page-title{font-size:18px;}
#panel:not(.mini) .surface-heading{margin-bottom:7px;}
#panel:not(.mini) .surface-note{font-size:10px;margin-bottom:12px;}
#panel:not(.mini) .form-section{padding:11px;margin-bottom:10px;}
#panel:not(.mini) .form-section label{margin:10px 0 6px;font-size:10px;}
#panel:not(.mini) .form-section select,#panel:not(.mini) .form-section input:not([type=checkbox]){height:34px;font-size:11px;}
#panel:not(.mini) #provider-trigger{height:35px;font-size:11px;}
#panel:not(.mini) #rooms{gap:8px;}
#panel:not(.mini) #rooms .room{min-height:65px;padding:10px;gap:7px;}
#panel:not(.mini) .room-title strong{font-size:12px;}
#panel:not(.mini) .room-detail{font-size:9px;}
#panel:not(.mini) .selection-control{padding:10px;gap:7px;margin-bottom:10px;}
#panel:not(.mini) .rooms-back{height:35px;font-size:11px;margin-top:10px;}
.report-shell,.risk-overlay{width:var(--full-width,280px);height:var(--full-height,560px);padding:14px;}
.report-head{padding-bottom:10px;}
.report-head h2{font-size:18px;}
.report-filter{gap:7px;padding:10px 0;}
.report-filter select{height:30px;}
.report-filter>button{height:29px;}
.report-note{margin:7px 0 10px;}
.report-card{padding:10px;margin-bottom:9px;}
.report-footer{gap:8px;padding-top:9px;margin-top:8px;}
.report-footer button{height:30px;min-width:65px;}
.risk-card{padding:18px 14px 14px;}
.risk-emblem{width:62px;height:62px;border-radius:16px;margin-bottom:14px;}
.risk-card h2{font-size:18px;margin-bottom:12px;}
.risk-copy{font-size:11px;line-height:1.9;margin-bottom:14px;}
.risk-stake-summary{padding:8px;font-size:10px;margin:10px 0;}
.risk-ack{padding:10px 8px;font-size:10px;margin-bottom:14px;}
.risk-actions button{height:36px;font-size:11px;}
`;

  // lib/official-turnover-panel.ts
  var OFFICIAL_TURNOVER_HTML = `<section class="official-turnover" aria-label="\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u6D41\u6C34">
  <div class="turnover-values"><div><small>\u4ECA\u65E5\u6D41\u6C34</small><strong id="official-today">\u5F85\u540C\u6B65</strong></div><div><small>\u8FD17\u65E5\u6D41\u6C34</small><strong id="official-week">\u5F85\u540C\u6B65</strong></div></div>
  <div class="turnover-footer"><span class="turnover-source" id="official-source">\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u984D \xB7 \u975E\u672C\u5DE5\u5177\u6CE8\u984D\u4F30\u7B97</span><button id="official-refresh" type="button" aria-label="\u66F4\u65B0\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u6D41\u6C34">\u66F4\u65B0</button></div>
</section>`;
  var OFFICIAL_TURNOVER_REPORT_HTML = `<div class="report-official-turnover"><small>\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u6D41\u6C34</small><div><span>\u4ECA\u65E5 <strong id="report-official-today">\u5F85\u540C\u6B65</strong></span><span>\u8FD17\u65E5 <strong id="report-official-week">\u5F85\u540C\u6B65</strong></span></div><p id="report-official-source">\u8207\u4E0B\u65B9\u672C\u5DE5\u5177\u4E0B\u6CE8\u7D00\u9304\u5206\u958B\u7D71\u8A08</p></div>`;
  var OFFICIAL_TURNOVER_CSS = `
.official-turnover{flex:none;border:1px solid #637f8c38;border-radius:8px;background:#172b34;padding:7px 9px;margin:0;min-width:0;}
.turnover-values{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;}
.turnover-values small{display:block;font-size:9px;color:#aac1cb;margin-bottom:3px;}
.turnover-values strong{display:block;font-size:13px;line-height:17px;color:#d6ece4;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}
.turnover-values>div+div{border-left:1px solid #607f8738;padding-left:12px;}
.turnover-footer{display:flex;align-items:center;gap:5px}.turnover-footer .turnover-source{flex:1;min-width:0}#official-refresh{flex:none;min-width:32px;min-height:26px;font-size:9px;border:1px solid #8cabb344;border-radius:5px;padding:3px 5px;background:#263f44;color:#c9e4df}.turnover-source{display:block;font-size:8px;line-height:12px;color:#98adb8;margin-top:4px;}
#panel.compact:not(.mini) .official-turnover{padding:6px 8px;}
#panel.compact:not(.mini) .chart-wrap{height:66px;}
#panel.compact:not(.mini) .chart{height:25px;margin:3px 0;}
#panel.compact:not(.mini) #table-strip{height:34px;min-height:34px;}
#panel.compact:not(.mini) .table-chip{padding:3px 6px;}
#panel.compact:not(.mini) #overview-page{overflow-y:auto!important;overscroll-behavior:contain;}
#panel.compact:not(.mini) .official-turnover{padding:4px 8px;}
#panel.compact:not(.mini) .turnover-values small{font-size:8px;line-height:9px;margin-bottom:2px;}
#panel.compact:not(.mini) .turnover-values strong{font-size:12px;line-height:15px;}
#panel.compact:not(.mini) .turnover-source{font-size:8px;line-height:9px;margin-top:2px;}
#panel.compact:not(.mini) .chart-summary{padding:5px 8px!important;}
#panel.compact:not(.mini) .chart{height:18px!important;margin:2px 0!important;}
#panel.compact:not(.mini) .hero{height:131px;min-height:131px;}
#panel.compact.mini .official-turnover{padding:3px 5px;border-radius:5px;background:transparent;border-color:#70899630;}
#panel.compact.mini .turnover-values{gap:6px;}
#panel.compact.mini .turnover-values>div+div{padding-left:6px;}
#panel.compact.mini .turnover-values small{font-size:8px;display:inline;margin-right:4px;}
#panel.compact.mini .turnover-values strong{display:inline;font-size:10px;line-height:14px;}
#panel.compact.mini .turnover-source{display:none;}
#panel.compact.mini .hero{height:92px;}
#panel.compact.mini .statusline{max-height:14px;min-height:14px;font-size:9px;line-height:14px;}
#panel.compact.mini #overview-page{gap:3px;}
#panel.compact.mini .mini-context{height:13px;min-height:13px;font-size:9px;}
#panel.compact.mini .hero{height:67px;min-height:67px;max-height:67px;}
#panel.compact.mini .stats{height:25px;min-height:25px;padding:3px 5px;}
#panel.compact.mini .stats small{font-size:7px;line-height:8px;margin-bottom:1px;}
#panel.compact.mini .stats strong{font-size:10px;line-height:11px;}
#panel.compact.mini .official-turnover{padding:2px 5px;min-height:25px;}
#panel.compact.mini .turnover-values small{display:block;font-size:7px;line-height:8px;margin:0;}
#panel.compact.mini .turnover-values strong{display:block;font-size:10px;line-height:11px;}
.report-official-turnover{flex:none;background:#172b34;border:1px solid #637f8c38;border-radius:8px;padding:8px 10px;margin:6px 0;}
.report-official-turnover>small{font-size:10px;color:#adc4cd;}
.report-official-turnover>div{display:flex;gap:14px;margin-top:5px;flex-wrap:wrap;font-size:10px;}
.report-official-turnover strong{font-size:12px;color:#d6ece4;font-variant-numeric:tabular-nums;}
.report-official-turnover p{font-size:9px;line-height:14px;color:#9eb7c3;margin:5px 0 0;}
`;
  function renderOfficialTurnover(shadow, view) {
    const q = (id) => shadow.getElementById(id);
    for (const period of ["today", "week"]) {
      const item = view?.[period];
      const known = item?.value !== null && item?.value !== void 0 && Number.isFinite(item.value);
      const text = known ? item.value.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : "\u5F85\u540C\u6B65";
      const title = item ? `${item.scope}\uFF5C${item.range}\uFF5C${item.status}${item.updatedAt ? `\uFF5C\u66F4\u65B0 ${new Date(item.updatedAt).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}` : ""}` : "\u5F85\u540C\u6B65\u5B98\u65B9\u5831\u8868\uFF0C\u4E0D\u4EE5\u672C\u5DE5\u5177\u672C\u91D1\u63A8\u7B97";
      for (const id of [`official-${period}`, `report-official-${period}`]) {
        const element = q(id);
        if (element) {
          element.textContent = text;
          element.title = title;
        }
      }
    }
    const source = q("official-source");
    const note = q("report-official-source");
    if (source) {
      const pending = view && (view.today.value === null || view.week.value === null);
      source.textContent = pending ? view.today.status === view.week.status ? view.today.status : `\u4ECA\u65E5\uFF1A${view.today.status}\uFF5C\u8FD17\u65E5\uFF1A${view.week.status}` : "\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u984D \xB7 \u975E\u672C\u5DE5\u5177\u6CE8\u984D\u4F30\u7B97";
      source.title = view ? `${view.today.scope}\uFF1B${view.today.status}\uFF1B${view.week.status}` : "\u7B49\u5F85\u5B98\u65B9\u4F86\u6E90";
    }
    if (note) note.textContent = `${view?.today.scope ?? "\u5B98\u65B9\u5831\u8868"}\uFF1B\u8FD17\u65E5\u4F9D\u5E73\u53F0\u671F\u9593\uFF0C\u8207\u672C\u5DE5\u5177\u4E0B\u6CE8\u7D00\u9304\u5206\u958B\u7D71\u8A08\u3002`;
  }

  // lib/dg-panel-view.ts
  var DG_PANEL_HTML = `<style>
:host{--fit:1;position:fixed;right:24px;top:24px;z-index:2147483647;color:#f4f3f5;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;color-scheme:dark}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #9fb68f;outline-offset:2px}button{border:0;background:none;color:inherit}[hidden]{display:none!important}#panel{width:290px;border-radius:22px;background:linear-gradient(155deg,#171619,#19171b 68%,#19191c);padding:13px 13px 16px;box-shadow:0 8px 28px #0005;transform:scale(var(--fit));transform-origin:top right;border:1px solid #ffffff08}#head{touch-action:none;cursor:grab;user-select:none}#head:active{cursor:grabbing}.topline{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#989899;height:20px}.brand{display:flex;align-items:center;gap:5px}.dot{width:5px;height:5px;background:#6ca578;border-radius:50%;box-shadow:0 0 7px #72b78066}.tools{display:flex;gap:2px}.tools button{font-size:14px;width:25px;height:24px;background:#252327;border-radius:50%;color:#9d9296}.tools #hide{color:#b36157}.headline{display:flex;align-items:center;justify-content:space-between;margin:10px 0 14px}.title{font-size:21px;font-weight:760;letter-spacing:-.8px;margin:0}.balance{text-align:right}.balance small{display:block;color:#8a858d;font-size:8px;margin-bottom:3px}.balance strong{font-size:12px;font-variant-numeric:tabular-nums}.hero{padding:12px 12px 9px;background:radial-gradient(ellipse at 80% 8%,#28312a77,transparent 60%),linear-gradient(135deg,#262529,#242225);border-radius:15px}.hero-head{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:11px}.pill{font-size:9px;background:#294e3540;color:#6dac7c;padding:4px 6px;border-radius:15px;white-space:nowrap}.pill.idle{background:#414047;color:#a9a5ae}.method{font-size:8px;color:#aba5ae;text-align:right}.roomline{font-weight:650;font-size:10px;display:flex;gap:7px;align-items:center}.subtle{font-size:8px;color:#8b858e;font-weight:400}.bet-main{display:flex;align-items:center;justify-content:space-between;gap:7px;margin:6px 0 4px}.bet-value{display:flex;align-items:center;gap:7px}.amount{font-size:31px;font-weight:800;line-height:1.2;letter-spacing:-1px;font-variant-numeric:tabular-nums}.side{color:#ee6e56;background:#783d3244;border-radius:7px;font-size:9px;padding:4px 5px;white-space:nowrap}.side.player{color:#84a5e9;background:#354d8244}.ring{--progress:0deg;width:49px;height:49px;flex:none;border-radius:50%;background:conic-gradient(#73997a var(--progress),#52565344 0);padding:2px;display:grid;place-items:center}.ring-inner{width:100%;height:100%;border-radius:50%;background:#292a29;display:grid;place-items:center;color:#afbab1;font-size:12px}.meta{color:#9d929f;font-size:8px;line-height:1.6;min-height:12px}.steps{display:flex;gap:4px;margin-top:12px}.step{flex:1;height:3px;background:#514a52}.step.active{background:#629d6e;box-shadow:0 0 5px #6c996633}.step-labels{display:flex;justify-content:space-between;color:#87828b;font-size:8px;margin:5px 0 16px}.step-labels b{color:#e1dddF;font-weight:600}.metrics{display:flex;justify-content:space-between;gap:5px}.metrics>div{flex:1}.metrics>div:nth-child(2){text-align:center}.metrics>div:last-child{text-align:right}.metrics small{font-size:8px;color:#a9a0aa;display:block;margin-bottom:4px}.metrics strong{font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.meter{height:2px;background:#655a6244;margin:12px 0 11px;position:relative}.meter:after{content:"";position:absolute;left:50%;top:-2px;width:6px;height:6px;border-radius:50%;background:#a6a0a5}.main-action{width:100%;height:32px;border-radius:8px;font-weight:650;font-size:10px;background:#365140;color:#b7d3bd}.main-action.live{background:#5c302c;color:#d46b55}.action-mark{font-size:8px;margin-right:5px}.statusline{font-size:8px;line-height:1.5;color:#9e919f;margin-top:12px;min-height:14px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.section-head{display:flex;align-items:center;justify-content:space-between;margin:19px 0 8px;font-size:11px;font-weight:700}.gold{color:#bfa568;font-size:8px;font-weight:400}.stats{background:#242226;border-radius:11px;padding:12px;display:flex;justify-content:space-between;gap:5px}.stats>div{flex:1}.stats small{font-size:8px;color:#8f8794;display:block;margin-bottom:5px}.stats strong{font-size:12px;font-variant-numeric:tabular-nums}.green{color:#70b486!important}.red{color:#db7569!important}#tables{max-height:126px;overflow:auto;scrollbar-width:none}.table-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #ffffff07}.table-row:last-child{border-bottom:0}.table-badge{width:27px;height:27px;flex:none;border-radius:50%;background:#333138;color:#9fb29f;display:grid;place-items:center;font-size:9px}.table-info{flex:1;min-width:0}.table-info strong{font-size:9px}.table-info small{font-size:8px;color:#8b8391;display:block;margin-top:3px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.table-rec{text-align:right;white-space:nowrap;font-size:9px}.table-rec small{display:block;margin-top:3px;color:#8d8592;font-size:8px}.empty{padding:13px 0;color:#8b8490;font-size:9px}.footer{margin-top:10px;text-align:center;font-size:8px;color:#6f6876}.page-title{font-size:18px;margin:14px 0 5px}.page-caption{font-size:9px;color:#a49aa8;line-height:1.6;margin-bottom:13px}.form-body{max-height:460px;overflow:auto;scrollbar-width:thin;padding-right:2px}.form-body label{display:block;font-size:10px;color:#beb4c3;margin:12px 0 6px}.form-body select,.form-body input:not([type=checkbox]){width:100%;height:32px;background:#2b272e;border:1px solid #48404d;color:#e4dbe9;border-radius:7px;padding:6px 8px}.form-row{display:flex;gap:9px}.form-row>div{flex:1;min-width:0}.form-body .secondary{height:29px;border:1px solid #514657;border-radius:7px;font-size:10px;width:100%;color:#c3b7ce;background:#29232f}.scan-row{display:flex;gap:7px;align-items:center;margin:10px 0}.scan-row select{flex:1}.scan-row button{width:92px!important}#rooms{display:flex;flex-wrap:wrap;gap:5px}.room{border:1px solid #4f4459;border-radius:5px;font-size:9px;padding:5px 7px;background:#29232f}.room.active{border-color:#aa925c;background:#453b27;color:#e8daba}.ack{display:flex!important;align-items:flex-start;gap:5px;font-size:9px!important;line-height:1.6;margin:13px 0!important}.ack input{flex:none;margin:2px 0 0}.setting-actions{display:flex;gap:7px;margin-top:12px}.setting-actions button{flex:1;border-radius:7px;background:#35463a;height:31px;font-size:10px}.setting-actions #stop{background:#54312d;color:#db8277}.fineprint{font-size:8px;color:#8a7e94;line-height:1.6;margin-top:12px}.log-status{font-size:10px;color:#bcb29f;line-height:1.6;background:#252027;border-radius:9px;padding:10px;margin:12px 0}#events{white-space:pre-wrap;font-size:9px;color:#b0a5ba;line-height:1.8;max-height:430px;overflow:auto;overflow-wrap:anywhere;scrollbar-width:thin}#orb{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#f7f7f6;color:#999;box-shadow:0 0 0 4px #ffffff30,0 0 0 9px #ffffff17;font-size:10px;font-weight:700}#orb[hidden]{display:none}.titlebar{display:flex;align-items:center;gap:10px}.drag-mark{font-size:18px;color:#c1b8c5}.metrics .meter-value{font-size:10px}.range-view{width:100%;height:12px;accent-color:#70a87c;margin:6px 0 9px;cursor:default;pointer-events:none}.chart{width:100%;height:43px;display:block;margin-top:8px}.chart polyline{fill:none;stroke:#70b486;stroke-width:1.7;stroke-linejoin:round}.chart.red polyline{stroke:#da7569}.search-box{display:flex;justify-content:space-between;align-items:center;min-height:100px}.search-box strong{font-size:20px;letter-spacing:-.5px}.search-icon{width:48px;height:48px;border:2px solid #787d78;border-radius:50%;display:grid;place-items:center;color:#b4b7b4;font-size:22px}.search-note{font-size:8px;color:#928a98;line-height:1.7}.compact-actions{display:none;gap:8px;margin-top:10px}.compact-actions button{flex:1;background:#2c2930;border-radius:9px;height:33px;font-size:10px}.compact-actions #compact-stop{background:#512c29;color:#d77560}#panel.compact{width:276px;border-radius:15px;padding:10px 12px;background:#151518}.compact .headline,.compact .hero-head,.compact .main-action,.compact .section-head,.compact #tables,.compact .footer{display:none}.compact .hero{background:none;padding:7px 0 0;border-radius:0}.compact .bet-main{flex-direction:row-reverse;justify-content:flex-end;gap:12px}.compact .ring{width:44px;height:44px}.compact .bet-value{flex:1}.compact .amount{font-size:29px}.compact .steps{margin-top:10px}.compact .step-labels{margin-bottom:12px}.compact .meter{margin-top:9px}.compact .metrics{margin-top:11px}.compact .stats{border-radius:7px;margin-top:8px;padding:9px}.compact .stats small{font-size:7px}.compact .stats strong{font-size:11px}.compact .compact-actions{display:flex}.compact .chart{height:27px}.compact #hero-status{margin-top:6px}.compact .topline{height:24px}.compact .brand{color:#eee;font-weight:700;font-size:10px}.cards-result{margin:8px 0;padding:8px 5px;background:#17191b;border-radius:8px;display:flex;gap:8px}.cards-side{flex:1;min-width:0}.cards-side>small{font-size:8px;color:#96b1dc}.cards-side:last-child>small{color:#df8c84}.cards-side>strong{float:right;font-size:11px}.cards-line{display:flex;gap:4px;margin-top:6px}.playing-card{width:26px;height:36px;background:#e9e6e9;border-radius:3px;color:#222;font-size:10px;display:grid;place-items:center;background-position:center;background-size:contain;background-repeat:no-repeat}.cards-hint{font-size:7px;color:#8f8795;margin-top:4px}.report-shell{position:fixed;inset:6vh 5vw;z-index:2147483647;background:#141211;border:1px solid #645133;border-radius:11px;box-shadow:0 8px 40px #000b;color:#e6dcc8;display:flex;flex-direction:column;padding:18px;font-size:12px}.report-head{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #594626;padding-bottom:12px}.report-head h2{font-size:18px;margin:0}.report-head button{background:#403320;border-radius:5px;padding:7px 14px}.report-filter{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:15px 0}.report-filter label{font-size:11px}.report-filter select,.report-filter button{background:#292419;border:1px solid #594b31;border-radius:4px;padding:6px;color:#ddd2b7}.report-filter button.selected,.report-tabs button.selected{color:#e6bd67;border-color:#c89d42}.report-tabs{display:flex;gap:18px;border-bottom:1px solid #5d472c;margin-bottom:9px}.report-tabs button{padding:8px 0;font-size:12px;border-bottom:2px solid transparent;color:#9d9079}.report-note{font-size:10px;color:#9d9485;line-height:1.7;margin:5px 0 10px}.report-scroll{overflow:auto;flex:1;min-height:0}.report-grid{border-collapse:collapse;min-width:1040px;width:100%;font-size:11px}.report-grid th{background:#292013;color:#d9c89f;font-weight:500;white-space:nowrap;padding:10px 12px;text-align:left}.report-grid td{padding:10px 12px;border-bottom:1px solid #332a1d;white-space:nowrap}.report-footer{display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-top:12px;color:#ae9a70}.report-footer button{padding:5px 10px;border:1px solid #655232;border-radius:5px}.report-empty{padding:40px;text-align:center;color:#ad9c86}.settings-added{font-size:9px;color:#a296a9;line-height:1.6;margin:8px 0}#settings-not-in-video{color:#b89c69}.back-report{font-size:10px}.compact #settings-page,.compact #logs-page{font-size:11px}#orb svg{width:20px;height:20px}#status{color:#a9a0b0}#stop-now{width:100%}@media(max-width:500px) and (orientation:portrait){:host{right:12px;top:20px}}
.chart-wrap{margin-top:10px;background:#19171d;border:1px solid #ffffff07;border-radius:8px;padding:8px 8px 5px;position:relative}.chart-head{display:flex;justify-content:space-between;font-size:8px;color:#93889e;gap:8px}.chart-head strong{font-size:9px;color:#b3a8bf}.chart{height:64px;margin-top:7px;overflow:visible}.chart .chart-grid{stroke:#ffffff0c;stroke-width:.6}.chart .chart-zero{stroke:#ffffff20;stroke-dasharray:3 3;stroke-width:.6}.chart .chart-area{fill:#6dba8526}.chart.red .chart-area{fill:#dd727526}.chart polyline{stroke-width:1.7;stroke-linecap:round}.chart .chart-dot{fill:#89c99b}.chart.red .chart-dot{fill:#df8a81}.chart-empty{font-size:9px;color:#8f849a;text-align:center;position:absolute;left:0;right:0;top:48px}.chart-foot{display:flex;justify-content:space-between;color:#756b7f;font-size:7px;margin-top:3px}.compact .chart{height:44px}.compact .chart-wrap{padding-top:6px}.compact .chart-empty{top:38px}
.parallel-control{display:flex;align-items:center;gap:10px;margin:0 0 10px}.parallel-control label{font-size:10px;color:#c5bcca;white-space:nowrap}.parallel-control select{flex:1;min-width:0;height:30px;border:1px solid #514658;border-radius:7px;padding:4px 7px;background:#2b272e;color:#f0e8f5;font-size:10px}.parallel-summary{color:#a69baa;font-size:8px;margin:-4px 0 10px}select:disabled{opacity:.65}.compact .parallel-control{margin-top:8px}.compact .parallel-summary{font-size:8px}
#panel,#panel.compact{width:276px;height:448px;padding:10px 12px;display:flex;flex-direction:column;overflow:hidden;border-radius:15px}#head{flex:none}#overview-page,#settings-page,#logs-page{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#514658 transparent}.form-body{max-height:none;overflow:visible}.compact .parallel-control{margin:3px 0 5px;gap:8px}.compact .parallel-control label{font-size:8px}.compact .parallel-control select{height:24px;font-size:9px}.compact .parallel-summary{margin:0 0 3px;font-size:7px}.compact .roomline{margin-top:2px}.compact .hero{padding:4px 0 0}.compact .bet-main{margin:4px 0 2px}.compact .steps{margin-top:7px}.compact .step-labels{margin:4px 0 9px}.compact .metrics{margin-top:4px}.compact .range-view{margin:3px 0 4px;height:9px}.compact .statusline{margin-top:5px;min-height:12px;font-size:7px}.compact .stats{padding:8px;margin-top:6px}.compact .chart-wrap{padding:6px 7px 4px;margin-top:6px}.compact .chart{height:39px;margin-top:5px}.compact .chart-foot{font-size:6px}.compact .compact-actions{margin-top:6px;position:sticky;bottom:0;background:#151518;padding-top:4px;padding-bottom:1px}.compact .compact-actions button{height:31px}.mini #overview-page{overflow:hidden}.mini .headline,.mini .metrics,.mini #pnl-range,.mini #chart-wrap,.mini .steps,.mini .step-labels,.mini .statusline,.mini #cards-result,.mini .section-head,.mini #tables,.mini #table-strip,.mini .footer,.mini .range-view{display:none}.mini .parallel-control{margin:3px 0 5px}.mini .parallel-summary{margin:0 0 4px}.mini .mini-context{margin:3px 0 5px}.mini .hero{padding:4px 0 0}.mini .bet-main{margin:4px 0 5px}.mini .compact-actions{display:flex;margin-top:5px;position:static}.mini .compact-actions button{height:31px}.report-shell{position:absolute;inset:auto;right:0;top:0;width:276px;height:448px;padding:10px;transform:scale(var(--fit));transform-origin:top right;border-radius:15px}.report-head h2{font-size:15px}.report-head button{padding:5px 8px;font-size:9px}.report-filter{gap:5px;margin:8px 0}.report-filter label{font-size:8px}.report-filter select,.report-filter button{padding:4px;font-size:8px}.report-tabs{gap:12px}.report-tabs button{font-size:10px}.report-note{font-size:8px}.report-footer{font-size:8px;gap:5px}.report-footer button{padding:4px;font-size:8px}.report-empty{padding:20px 8px}.report-grid{font-size:9px}.report-grid th,.report-grid td{padding:7px 8px}
${DG_DENSITY_CSS}
${DG_PRO_CSS}
${DG_SPACIOUS_CSS}
${DG_SURFACES_CSS}
${DG_SMALL_CSS}
${OFFICIAL_TURNOVER_CSS}
${DG_MOBILE_LAYOUT_CSS}
.doubling-reminder{border-left:3px solid #cba86a;border-radius:5px;padding:8px 9px;background:#a4793324;color:#e6c995;font-size:10px;line-height:1.6;margin:8px 0;}
</style>

<section id="panel">
<header id="head"><div class="topline"><span class="brand"><i class="dot"></i><span id="brand-count">\u767E\u5BB6\u5DE5\u7A0B\u5E2B</span></span><div class="tools"><button id="nav-mode" aria-label="\u5207\u63DB\u7E3D\u89BD\u8207\u5C0F\u7A97" title="\u5207\u63DB\u7E3D\u89BD\uFF0F\u767E\u5BB6\u5DE5\u7A0B\u5E2B"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16"/></svg></button><button id="nav-overview" aria-label="\u7E3D\u89BD" title="\u7E3D\u89BD"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z M9 20v-7h6v7"/></svg><span>\u7E3D\u89BD</span></button><button id="nav-settings" aria-label="\u8A2D\u5B9A" title="\u8A2D\u5B9A"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2 3 3-1 2 3-2 3 2 3-2 3-3-1-2 3-2-3-3 1-2-3 2-3-2-3 2-3 3 1z"/><circle cx="12" cy="11" r="3"/></svg><span>\u8A2D\u5B9A</span></button><button id="nav-logs" aria-label="\u7D00\u9304" title="\u7D00\u9304"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14 M5 12h14 M5 18h14"/></svg><span>\u7D00\u9304</span></button><button id="zoom-out" aria-label="\u5207\u63DB\u8FF7\u4F60\u9762\u677F" title="\u5207\u63DB\u8FF7\u4F60\u9762\u677F"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg><span id="mini-label">\u8FF7\u4F60</span></button><button id="zoom-in" aria-label="\u653E\u5927\u9762\u677F" title="\u653E\u5927"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14 M12 5v14"/></svg></button><button id="hide" aria-label="\u6536\u5408" title="\u6536\u5408"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div></div></header>
<div id="overview-page"><div class="headline"><div class="titlebar"><h1 class="title">\u7E3D\u89BD</h1><span class="drag-mark">\u2725</span></div><div class="balance"><small>\u5E73\u53F0\u9918\u984D</small><strong id="balance">\u2014</strong></div></div>
<div class="parallel-control"><label for="parallel-count">\u540C\u6642\u4E0B\u6CE8</label><select id="parallel-count" aria-label="\u540C\u6642\u4E0B\u6CE8\u684C\u6578"><option value="1" selected>1 \u684C</option><option value="3">3 \u684C</option><option value="5">5 \u684C</option><option value="all">\u6240\u6709\u5DF2\u8F09\u5165\u684C</option></select><button id="choose-tables" class="choose-tables">\u9078\u684C</button></div><div id="parallel-summary" class="parallel-summary">\u9010\u684C\u7368\u7ACB \xB7 \u4E0D\u7B49\u5176\u4ED6\u684C\u7D50\u7B97</div><div class="mini-context"><span id="mini-running">\u5DF2\u505C\u6B62</span><span>\u9918\u984D <strong id="mini-balance">\u2014</strong></span></div><div class="session-time" aria-label="\u672C\u6B21\u4F7F\u7528\u6642\u9593"><span>\u4F7F\u7528\u6642\u9593 <strong id="session-elapsed">00:00:00</strong></span><span id="session-remaining">\u4E0D\u9650\u6642</span></div><div class="hero"><div class="hero-head"><span id="run-pill" class="pill idle">\u25CF \u5DF2\u505C\u6B62</span><span id="method" class="method">\u7B56\u7565 \xB7 \u99AC\u4E01</span></div><div id="search-box" class="search-box" hidden><div><strong id="search-title">\u6311\u9078\u4E0B\u6CE8\u684C\u2026</strong><div class="search-note">\u7B49\u5F85\u9078\u5B9A\u684C\u53F0\u958B\u653E\u4E0B\u6CE8</div></div><span class="search-icon">\u2315</span></div><div id="target-box"><div class="strategy-preview"><span>\u7B56\u7565</span><span class="strategy-badge"><i id="main-strategy-logo" class="provider-logo" aria-hidden="true"></i><strong id="current-strategy">AI\u7D9C\u5408</strong></span></div><div class="roomline"><span id="focus-table">\u7B49\u5F85\u684C\u53F0</span><span id="focus-phase" class="subtle">\u6E96\u5099\u4E2D</span></div><div class="amount-explainer"><span id="amount-label">\u4E0B\u4E00\u6CE8\u9810\u89BD</span><span id="amount-rule">\u57FA\u672C 100 \xB7 \u7B2C1\u968E \xD71</span></div><div class="bet-main"><div class="bet-value"><strong id="amount" class="amount">100</strong><span id="side" class="side">\u2014</span></div><div id="ring" class="ring"><span id="countdown" class="ring-inner">\u2014</span></div></div><div id="focus-meta" class="meta">\u7B49\u5019\u771F\u5BE6\u724C\u8DEF\u8207\u5012\u6578</div><div class="steps"><i id="step-1" class="step"></i><i id="step-2" class="step"></i><i id="step-3" class="step"></i><i id="step-4" class="step"></i></div><div class="step-labels"><span>\u8B80\u53D6</span><span>\u7B49\u5F85\u63A5\u53D7</span><b>\u7D50\u7B97</b><span>\u7E8C\u6CE8</span></div></div><div id="cards-result" class="cards-result" hidden><div class="cards-side"><small>\u9592 PLAYER</small><strong id="player-point">\u2014</strong><div id="player-cards" class="cards-line"></div></div><div class="cards-side"><small>\u838A BANKER</small><strong id="banker-point">\u2014</strong><div id="banker-cards" class="cards-line"></div></div></div><div class="metrics"><div><small>\u7D2F\u8A08\u6700\u4F4E</small><strong id="range-low" class="meter-value">\u2014</strong></div><div><small>\u672C\u8F2A\u640D\u76CA</small><strong id="hero-pnl">0</strong></div><div><small>\u7D2F\u8A08\u6700\u9AD8</small><strong id="range-high" class="meter-value">\u2014</strong></div></div><input id="pnl-range" class="range-view" type="range" min="0" max="100" value="50" tabindex="-1" aria-label="\u672C\u8F2A\u7D50\u7B97\u5728\u986F\u793A\u7BC4\u570D\u5167\u7684\u4F4D\u7F6E" aria-readonly="true"><button id="stop-now" class="main-action"><span class="action-mark">\u25B6</span>\u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8</button><div id="hero-status" class="statusline" role="button" tabindex="0" aria-label="\u67E5\u770B\u5B8C\u6574\u72C0\u614B">\u5C1A\u672A\u9001\u51FA\u4E0B\u6CE8</div></div>
<div class="section-head"><span>\u672C\u8F2A</span><button id="open-records" class="gold">\u8A18\u9304</button></div><div class="stats"><div><small>\u672C\u8F2A\u640D\u76CA</small><strong id="round-pnl">0</strong></div><div><small>\u8D0F\uFF0F\u8F38\uFF0F\u548C</small><strong id="round-wlt">0/0/0</strong></div><div><small>\u5BE6\u969B\u547D\u4E2D\u7387</small><strong id="hit-rate">\u2014</strong></div></div>${OFFICIAL_TURNOVER_HTML}<div id="chart-wrap" class="chart-wrap"><div class="chart-head"><span>\u7D2F\u8A08\u640D\u76CA\u8D70\u52E2</span><strong id="chart-last">\u2014</strong></div><svg id="pnl-chart" class="chart" viewBox="0 0 250 43" preserveAspectRatio="none" aria-label="\u672C\u8F2A\u5DF2\u7D50\u7B97\u640D\u76CA\u66F2\u7DDA"><path class="chart-grid" d="M0 4H250 M0 14H250 M0 25H250 M0 39H250 M0 4V39 M62 4V39 M125 4V39 M188 4V39 M250 4V39"/><line id="chart-zero" class="chart-zero" x1="0" x2="250" y1="22" y2="22"/><polygon id="chart-area" class="chart-area" points=""/><polyline id="pnl-line" points="0,22 250,22"/><circle id="chart-dot" class="chart-dot" cx="250" cy="22" r="1.6"/></svg><div id="chart-empty" class="chart-empty">\u7B49\u5F85\u9996\u7B46\u7D50\u7B97</div><div class="chart-foot"><span id="chart-low">\u6700\u4F4E \u2014</span><span id="chart-count">0 \u6CE8</span><span id="chart-high">\u6700\u9AD8 \u2014</span></div></div><div class="section-head"><span>\u5DF2\u9078\u684C\u53F0</span><button id="edit-rooms" class="gold">\u5168\u90E8</button></div><div id="tables"></div><div id="table-strip" aria-label="\u5DF2\u9078\u684C\u53F0"></div><div class="footer">\u63A8\u85A6\u50C5\u4F9B\u53C3\u8003</div></div>
<div id="settings-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u57F7\u884C\u53C3\u6578</div><h2 class="page-title">\u7B56\u7565\u8A2D\u5B9A</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg></span></div><p class="surface-note">\u8A2D\u5B9A\u65B9\u5411\u4F86\u6E90\u3001\u55AE\u6CE8\u91D1\u984D\u8207\u505C\u6B62\u689D\u4EF6\u3002</p><div class="form-body">
<section class="form-section"><h3 class="form-section-head"><i>01</i>\u63A8\u85A6\u8207\u914D\u6CE8</h3><label for="single-staking">\u914D\u6CE8\u65B9\u5F0F</label><select id="single-staking"><option value="flat">\u5E73\u6CE8 \xB7 \u6BCF\u7B46\u56FA\u5B9A\u91D1\u984D</option><option value="martingale" selected>\u99AC\u4E01 \xB7 \u8DE8\u623F\u63A5\u7E8C\uFF0C\u8F38\u5347\u968E\u3001\u8D0F\u91CD\u7F6E</option><option value="doubling">\u500D\u6295\u6CD5 \xB7 1\u21922\u21924\u21928\uFF0C\u8F38\u5F8C\u52A0\u500D\u3001\u8D0F\u91CD\u7F6E</option></select><label for="start-mode">\u958B\u59CB\u65B9\u5F0F</label><select id="start-mode"><option value="fresh" selected>\u65B0\u958B\u59CB \xB7 \u9996\u7B46\u57FA\u672C\u55AE\u6CE8</option><option value="resume">\u7E8C\u63A5 \xB7 \u6CBF\u7528\u914D\u6CE8\u968E\u7D1A</option></select><div id="staking-hint" class="settings-added"></div><p id="doubling-reminder" class="doubling-reminder" hidden>\u4F7F\u7528\u500D\u6295\u6CD5\uFF0C\u8ACB\u8A2D\u5B9A\u6B62\u76C8\u8207\u6B62\u640D\uFF1B\u9023\u7E8C\u8667\u640D\u6703\u4F7F\u4E0B\u4E00\u6CE8\u52A0\u500D\u3002</p><label id="provider-label" for="provider-trigger">\u63A8\u85A6\u4F86\u6E90</label><div class="provider-picker"><select id="provider" hidden></select><button id="provider-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="provider-menu" aria-labelledby="provider-label provider-selected-name"><span id="provider-selected-logo" class="provider-logo" aria-hidden="true"></span><span id="provider-selected-name">AI\u7D9C\u5408</span><svg class="provider-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="provider-menu" role="listbox" aria-label="\u63A8\u85A6\u4F86\u6E90" hidden></div></div></section>
<section class="form-section"><h3 class="form-section-head"><i>02</i>\u6295\u6CE8\u91D1\u984D</h3><div class="form-row"><div><label for="base">\u57FA\u672C\u55AE\u6CE8</label><input id="base" type="number" min="1" value="100"></div><div><label for="cap">\u55AE\u7B46\u4E0A\u9650</label><input id="cap" type="number" min="1" value="100000"></div></div></section>
<section class="settings-added"><label for="duration-minutes">\u81EA\u52D5\u505C\u6B62\u6642\u9593\uFF08\u5206\u9418\uFF09</label><input id="duration-minutes" type="number" min="0" step="1" inputmode="numeric" value="0" placeholder="0\uFF1D\u4E0D\u9650\u6642"><p class="field-note">\u78BA\u8A8D\u958B\u59CB\u5F8C\u8A08\u6642\uFF0C\u5305\u542B\u627E\u684C\u53CA\u7B49\u5F85\u7D50\u7B97\u30020\u6216\u7559\u7A7A\u4E0D\u9650\u6642\uFF1B\u6642\u9593\u5230\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\uFF0C\u5DF2\u63A5\u53D7\u6CE8\u55AE\u7E7C\u7E8C\u7D50\u7B97\u3002\u6BCF\u6B21\u91CD\u65B0\u958B\u59CB\u6703\u91CD\u65B0\u8A08\u6642\u3002</p></section><section class="form-section"><h3 class="form-section-head"><i>03</i>\u6B62\u640D\u8207\u6B62\u76C8</h3><div class="form-row"><div><label for="stop-loss">\u6B62\u640D\u91D1\u984D</label><input id="stop-loss" type="number" min="1" placeholder="\u672A\u8A2D\u5B9A"></div><div><label for="take-profit">\u6B62\u76C8\u91D1\u984D</label><input id="take-profit" type="number" min="1" placeholder="\u672A\u8A2D\u5B9A"></div></div><p class="field-note">\u9054\u5230\u672C\u8F2A\u5DF2\u7D50\u7B97\u640D\u76CA\u9580\u6ABB\u5F8C\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\u3002</p></section>
<span id="zoom-label" hidden>100%</span><input id="zoom" type="range" min="70" max="180" step="10" value="100" hidden><input id="range-min" hidden value=""><input id="range-max" hidden value=""><select id="scope" hidden disabled><option value="table" selected>\u9010\u684C\u7368\u7ACB</option></select><select id="count" hidden><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="all">all</option></select><button id="scan" hidden></button><div hidden><button id="start"></button><button id="once"></button><button id="stop"></button></div></div></div>
<div id="rooms-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u4E0B\u6CE8\u7BC4\u570D</div><h2 class="page-title">\u9078\u64C7\u684C\u53F0</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span></div><div class="selection-control"><span id="selection-mode">\u81EA\u52D5\u627E\u684C \xB7 \u958B\u653E\u4E0B\u6CE8\u5C31\u52A0\u5165</span><button id="auto-tables">\u81EA\u52D5\u627E\u684C\u4E2D</button></div><div id="rooms-hint" class="surface-note page-caption">\u5148\u53D6\u6D88\u4E00\u684C\uFF0C\u518D\u9078\u5176\u4ED6\u684C\u3002</div><div id="rooms"></div><button id="rooms-back" class="rooms-back">\u5B8C\u6210\u9078\u64C7\uFF0C\u56DE\u5230\u7E3D\u89BD</button></div><div id="logs-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u72C0\u614B\u8207\u7D50\u7B97</div><h2 class="page-title">\u57F7\u884C\u7D00\u9304</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7zM10 8h4M10 12h4M10 16h4"/></svg></span></div><p class="surface-note">\u4F9D\u5E8F\u67E5\u770B\u9001\u51FA\u3001\u63A5\u53D7\u53CA\u7D50\u7B97\u4E8B\u4EF6\u3002</p><div class="log-status"><span class="log-label">\u76EE\u524D\u72C0\u614B</span><div id="status"></div></div><div id="events" aria-label="\u64CD\u4F5C\u4E8B\u4EF6\u6642\u9593\u8EF8"></div></div>
<div class="compact-actions"><button id="open-report">\u6253\u958B\u6230\u7E3E</button><button id="compact-stop">\u505C\u6B62</button></div><button id="resize-panel" class="resize-grip" aria-label="\u62D6\u66F3\u8ABF\u6574\u9762\u677F\u5C3A\u5BF8" title="\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F\uFF1B\u65B9\u5411\u9375\u5FAE\u8ABF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button></section><section id="risk-dialog" class="risk-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-title" hidden><div class="risk-card"><div class="risk-emblem"><svg class="risk-triangle" viewBox="0 0 80 72" aria-hidden="true"><path d="M40 5 75 65H5Z"/><path class="risk-mark" d="M40 24v20"/><circle class="risk-point" cx="40" cy="54" r="3"/></svg></div><h2 id="risk-title">\u4F7F\u7528\u98A8\u96AA\u8072\u660E</h2><p class="risk-copy">\u81EA\u884C\u6C7A\u5B9A\u958B\u555F,\u6240\u6709\u98A8\u96AA\u81EA\u884C\u627F\u64D4,\u4E0D\u4FDD\u8B49\u7A69\u5B9A\u7372\u5229,\u7A0B\u5F0F\u4E0D\u8CA0\u76F8\u95DC\u8CAC\u4EFB</p><div id="risk-stake-summary" class="risk-stake-summary" hidden></div><p id="risk-time-summary" class="field-note"></p><p id="risk-doubling-warning" class="doubling-reminder" hidden></p><label class="risk-ack"><input id="ack" type="checkbox"><span>\u6211\u5DF2\u95B1\u8B80\u4E26\u4E86\u89E3\u4E0A\u8FF0\u98A8\u96AA</span></label><div class="risk-actions"><button id="risk-cancel">\u53D6\u6D88</button><button id="risk-confirm" disabled>\u78BA\u8A8D\u958B\u59CB</button></div></div></section><section id="report-shell" class="report-shell" hidden><header class="report-head"><div><div class="surface-kicker">\u672C\u5DE5\u5177\u8A18\u9304</div><h2>\u4E0B\u6CE8\u6230\u7E3E</h2></div><button id="close-report">\u8FD4\u56DE\u7E3D\u89BD</button></header><div class="report-filter"><label>\u904A\u6232\u5927\u5EF3 <select id="report-lobby"><option value="all">\u5168\u90E8</option><option value="DG">DG</option></select></label><label>\u904A\u6232\u985E\u578B <select id="report-game"><option value="all">\u5168\u90E8</option><option value="baccarat">\u767E\u5BB6\u6A02</option></select></label><button id="report-today" class="selected">\u4ECA\u65E5</button><button id="report-yesterday">\u6628\u65E5</button><button id="report-week">\u4E03\u65E5</button></div><div class="report-tabs"><button id="report-bets" class="selected">\u6295\u6CE8\u8A18\u9304</button><button id="report-transactions" hidden>\u4EA4\u6613\u8A18\u9304</button></div><div id="report-note" class="report-note">\u672C\u5DE5\u5177\u8A18\u9304\u7684\u4E0B\u6CE8\u8207\u7D50\u679C</div>${OFFICIAL_TURNOVER_REPORT_HTML}<div class="report-scroll"><div id="report-body" class="report-cards"></div><div id="report-empty" class="report-empty" hidden>\u5C1A\u7121\u8A18\u9304</div></div><footer class="report-footer"><span id="report-total">\u5408\u8A08 \u2014</span><span><button id="report-prev">\u4E0A\u4E00\u9801</button> <span id="report-page">1 / 1</span> <button id="report-next">\u4E0B\u4E00\u9801</button></span></footer><button id="resize-report" class="resize-grip" aria-label="\u62D6\u66F3\u8ABF\u6574\u9762\u677F\u5C3A\u5BF8" title="\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F\uFF1B\u65B9\u5411\u9375\u5FAE\u8ABF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button></section>`;

  // lib/dg-panel-data.ts
  function cumulativePoints(bets, width = 250, height = 43) {
    const ordered = bets.filter((b) => b.state === "settled" && Number.isFinite(b.pnl)).slice().sort((a, b) => (a.settledAt ?? a.acceptedAt ?? a.createdAt) - (b.settledAt ?? b.acceptedAt ?? b.createdAt));
    if (!ordered.length) return `0,${height / 2} ${width},${height / 2}`;
    let sum = 0;
    const values = [0, ...ordered.map((b) => sum += b.pnl ?? 0)];
    const low = Math.min(...values), high = Math.max(...values), span = high - low || 1;
    return values.map((v, i) => `${(i / Math.max(1, values.length - 1) * width).toFixed(1)},${(height - 4 - (v - low) / span * (height - 8)).toFixed(1)}`).join(" ");
  }
  function chartSummary(bets) {
    const ordered = bets.filter((b) => b.state === "settled" && Number.isFinite(b.pnl)).slice().sort((a, b) => (a.settledAt ?? a.acceptedAt ?? a.createdAt) - (b.settledAt ?? b.acceptedAt ?? b.createdAt));
    let total = 0;
    const values = [0, ...ordered.map((b) => total += b.pnl ?? 0)];
    return { count: ordered.length, total, low: Math.min(...values), high: Math.max(...values) };
  }
  function periodBets(bets, period, now = Date.now()) {
    const day = 864e5, offset = 288e5, start = Math.floor((now + offset) / day) * day - offset;
    const from = period === "yesterday" ? start - day : period === "week" ? start - 6 * day : start;
    const until = period === "yesterday" ? start : start + day;
    return bets.filter((b) => b.createdAt >= from && b.createdAt < until && ["submitted", "accepted", "rejected", "uncertain", "settled"].includes(b.state));
  }
  function rangePosition(pnl, lowText, highText) {
    if (!lowText.trim() || !highText.trim()) return null;
    const low = Number(lowText), high = Number(highText);
    if (!Number.isFinite(low) || !Number.isFinite(high) || low >= high) return null;
    return Math.max(0, Math.min(100, (pnl - low) / (high - low) * 100));
  }
  function knownPoker(raw) {
    let obj = raw;
    try {
      if (typeof raw === "string") obj = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!obj || typeof obj.player !== "string" || typeof obj.banker !== "string") return null;
    const parse = (v) => v.split("-").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 52).slice(0, 3);
    const player = parse(obj.player), banker = parse(obj.banker);
    return player.length || banker.length ? { player, banker } : null;
  }
  function pokerRank(id) {
    const n = id % 13 || 13;
    return n === 1 ? "A" : n === 11 ? "J" : n === 12 ? "Q" : n === 13 ? "K" : String(n);
  }
  function pokerPoint(ids) {
    return ids.reduce((s, id) => s + Math.min(id % 13 || 13, 10) % 10, 0) % 10;
  }

  // lib/dg-limit-check.ts
  var numeric = (v) => v == null || v === "" || typeof v === "boolean" || !Number.isFinite(Number(v)) ? null : Number(v);
  var usable = (v) => numeric(v?.bpMin) != null && Number(v.bpMin) >= 0 && numeric(v?.bpMax) != null && Number(v.bpMax) > 0 && Number(v.bpMax) >= Number(v.bpMin);
  function readDgLimits(card) {
    const player = card.playerInfo, limitId = numeric(card.limitId), gameId = numeric(card.gameInfo?.gameId);
    let value = card.baccaratLimit ?? card.gameLimit, source = "\u684C\u53F0\u5FEB\u53D6";
    if (limitId != null && limitId >= 1 && gameId != null && typeof player?.gameLimitMan?.getGameLimit === "function") {
      try {
        const current = player.gameLimitMan.getGameLimit(limitId, gameId);
        if (usable(current)) {
          value = current;
          source = "DG\u539F\u751F\u9650\u984D\u7BA1\u7406\u5668";
        }
      } catch {
      }
    }
    const min = numeric(value?.bpMin), max = numeric(value?.bpMax), balance = numeric(player?.balance);
    return { source, limitId, gameId, min, max, balance, available: usable(value) };
  }
  function checkDgAmount(card, amount) {
    const limits = readDgLimits(card);
    const result = (ok, code, reason) => ({ ok, code, reason, limits });
    if (!Number.isSafeInteger(amount) || amount <= 0) return result(false, "invalid-amount", "\u4E0B\u6CE8\u91D1\u984D\u4E0D\u662F\u6B63\u6574\u6578");
    if (!limits.available) return result(false, "limits-unready", `\u838A\u9592\u9650\u984D\u5C1A\u672A\u540C\u6B65\uFF08\u6700\u4F4E ${limits.min ?? "\u672A\u63D0\u4F9B"}\uFF0F\u6700\u9AD8 ${limits.max ?? "\u672A\u63D0\u4F9B"}\uFF09\uFF1B\u7B49\u5019\uFF0C\u4E0D\u6539\u91D1\u984D`);
    if (amount < limits.min) return result(false, "below-min", `\u91D1\u984D ${amount} \u4F4E\u65BC\u5E73\u53F0\u6700\u4F4E ${limits.min}\uFF08\u6700\u9AD8 ${limits.max}\uFF09\uFF1B\u672A\u9001\u51FA\uFF0C\u4E0D\u81EA\u52D5\u52A0\u6CE8`);
    if (amount > limits.max) return result(false, "above-max", `\u91D1\u984D ${amount} \u9AD8\u65BC\u5E73\u53F0\u6700\u9AD8 ${limits.max}\uFF08\u6700\u4F4E ${limits.min}\uFF09\uFF1B\u672A\u9001\u51FA`);
    if (limits.balance == null) return result(false, "balance-unready", "\u5E73\u53F0\u9918\u984D\u5C1A\u672A\u63D0\u4F9B\uFF1B\u7B49\u5019\uFF0C\u4E0D\u9001\u51FA");
    if (amount > limits.balance) return result(false, "insufficient-balance", `\u91D1\u984D ${amount} \u8D85\u904E\u76EE\u524D\u9918\u984D ${limits.balance}\uFF1B\u672A\u9001\u51FA`);
    return result(true, "ok", `\u91D1\u984D ${amount} \u7B26\u5408\u9650\u984D ${limits.min}\u2013${limits.max}\uFF0F\u9918\u984D ${limits.balance}`);
  }

  // lib/dg-risk-limits.ts
  function parseRiskLimits(lossText, profitText) {
    function parse(text, label) {
      if (!text.trim()) return null;
      const value = Number(text);
      if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label}\u5FC5\u9808\u662F\u6B63\u6574\u6578\u91D1\u984D\uFF0C\u6216\u7559\u7A7A\u505C\u7528`);
      return value;
    }
    return { stopLoss: parse(lossText, "\u6B62\u640D"), takeProfit: parse(profitText, "\u6B62\u76C8") };
  }
  function riskStopReason(pnl, limits) {
    if (!Number.isFinite(pnl)) throw new Error("\u7D2F\u8A08\u640D\u76CA\u8CC7\u6599\u7121\u6548");
    const fmt = (n) => n.toLocaleString("zh-TW");
    if (limits.stopLoss != null && pnl <= -limits.stopLoss) return `\u5DF2\u9054\u6B62\u640D ${fmt(limits.stopLoss)}\uFF1A\u672C\u8F2A\u640D\u76CA ${fmt(pnl)}\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8`;
    if (limits.takeProfit != null && pnl >= limits.takeProfit) return `\u5DF2\u9054\u6B62\u76C8 ${fmt(limits.takeProfit)}\uFF1A\u672C\u8F2A\u640D\u76CA +${fmt(pnl)}\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8`;
    return null;
  }

  // lib/dg-table-selection.ts
  function syncDgTables(loadedIds, selectedIds, pendingIds, count) {
    const loaded = [...new Set(loadedIds.filter(Boolean))];
    const available = new Set(loaded);
    const pending = new Set(pendingIds);
    const retained = [...new Set(selectedIds)].filter((id) => available.has(id) || pending.has(id));
    const limit = count === "all" ? Infinity : Number(count);
    const next = retained.slice(0, limit);
    for (const id of loaded) {
      if (next.length >= limit) break;
      if (!next.includes(id)) next.push(id);
    }
    return next;
  }
  function selectOpenDgTables(eligibleIds, pendingIds, count) {
    const pending = [...new Set(pendingIds.filter(Boolean))];
    const eligible = [...new Set(eligibleIds.filter(Boolean))];
    const limit = count === "all" ? Infinity : Number(count);
    const next = [...pending];
    for (const id of eligible) {
      if (next.length >= limit) break;
      if (!next.includes(id)) next.push(id);
    }
    return next;
  }

  // lib/dg-button-feedback.ts
  function installDgButtonFeedback(root) {
    const timers = /* @__PURE__ */ new Map();
    let held = null;
    function button(event) {
      const node = event.target instanceof Element ? event.target.closest('button,[role="button"]') : null;
      return node && !(node instanceof HTMLButtonElement && node.disabled) ? node : null;
    }
    function clear(node) {
      const timer = timers.get(node);
      if (timer) clearTimeout(timer);
      timers.delete(node);
      node.removeAttribute("data-pressed");
    }
    function release() {
      if (held) clear(held);
      held = null;
    }
    function press(event) {
      release();
      held = button(event);
      if (held) held.dataset.pressed = "true";
    }
    function keydown(event) {
      const e = event;
      if (e.key === "Enter" || e.key === " ") press(e);
    }
    function keyup(event) {
      const e = event;
      if (e.key === "Enter" || e.key === " ") release();
    }
    function click(event) {
      const node = button(event);
      if (!node) return;
      clear(node);
      node.dataset.pressed = "true";
      timers.set(node, setTimeout(() => clear(node), 160));
    }
    root.addEventListener("pointerdown", press, true);
    root.addEventListener("pointerup", release, true);
    root.addEventListener("pointercancel", release, true);
    root.addEventListener("pointerout", release, true);
    root.addEventListener("keydown", keydown, true);
    root.addEventListener("keyup", keyup, true);
    root.addEventListener("click", click, true);
    return () => {
      release();
      for (const node of [...timers.keys()]) clear(node);
      root.removeEventListener("pointerdown", press, true);
      root.removeEventListener("pointerup", release, true);
      root.removeEventListener("pointercancel", release, true);
      root.removeEventListener("pointerout", release, true);
      root.removeEventListener("keydown", keydown, true);
      root.removeEventListener("keyup", keyup, true);
      root.removeEventListener("click", click, true);
    };
  }

  // lib/dg-panel-resize.ts
  function installDgPanelResize(handles, options) {
    const cleanups = [];
    for (const handle of handles) {
      let down2 = function(e) {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault();
        e.stopPropagation();
        const target = handle.parentElement;
        const size = options.getSize(target);
        options.prepare(target);
        active = { id: e.pointerId, x: e.clientX, y: e.clientY, size };
        try {
          handle.setPointerCapture?.(e.pointerId);
        } catch {
        }
        handle.dataset.resizing = "true";
      }, move2 = function(e) {
        if (!active || active.id !== e.pointerId) return;
        e.preventDefault();
        const fit = Math.max(0.2, active.size.scale);
        options.apply(
          Math.max(260, Math.min(520, active.size.width + (e.clientX - active.x) / fit)),
          Math.max(360, Math.min(900, active.size.height + (e.clientY - active.y) / fit))
        );
      }, end2 = function(e) {
        if (!active || active.id !== e.pointerId) return;
        if (handle.hasPointerCapture?.(e.pointerId)) handle.releasePointerCapture(e.pointerId);
        active = null;
        delete handle.dataset.resizing;
      }, key2 = function(e) {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        const size = options.getSize(handle.parentElement);
        options.prepare(handle.parentElement);
        const delta = e.shiftKey ? 30 : 10;
        options.apply(
          Math.max(260, Math.min(520, size.width + (e.key === "ArrowRight" ? delta : e.key === "ArrowLeft" ? -delta : 0))),
          Math.max(360, Math.min(900, size.height + (e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0)))
        );
      }, lost2 = function() {
        active = null;
        delete handle.dataset.resizing;
      };
      var down = down2, move = move2, end = end2, key = key2, lost = lost2;
      let active = null;
      handle.addEventListener("pointerdown", down2);
      handle.addEventListener("pointermove", move2);
      handle.addEventListener("pointerup", end2);
      handle.addEventListener("pointercancel", end2);
      handle.addEventListener("lostpointercapture", lost2);
      handle.addEventListener("keydown", key2);
      cleanups.push(() => {
        active = null;
        delete handle.dataset.resizing;
        handle.removeEventListener("pointerdown", down2);
        handle.removeEventListener("pointermove", move2);
        handle.removeEventListener("pointerup", end2);
        handle.removeEventListener("pointercancel", end2);
        handle.removeEventListener("keydown", key2);
        handle.removeEventListener("lostpointercapture", lost2);
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }

  // lib/dg-provider-logos.ts
  var DG_PROVIDER_LOGOS = { "chatgpt": '<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"></path></svg>', "gemini": '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Gemini</title><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-0-_R_0_)"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-1-_R_0_)"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-2-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-0-_R_0_" x1="7" x2="11" y1="15.5" y2="12"><stop stop-color="#08B962"></stop><stop offset="1" stop-color="#08B962" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-1-_R_0_" x1="8" x2="11.5" y1="5.5" y2="11"><stop stop-color="#F94543"></stop><stop offset="1" stop-color="#F94543" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-2-_R_0_" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stop-color="#FABC12"></stop><stop offset=".46" stop-color="#FABC12" stop-opacity="0"></stop></linearGradient></defs></svg>', "grok": '<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Grok</title><path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"></path></svg>', "meta": '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>MetaAI</title><path d="M10.547.232c.776-.086 1.543.244 2.152.712.784.598 1.375 1.434 1.757 2.347.19.444.3.92.345 1.402.01.384.024.781-.108 1.148-.126.406-.362.795-.728 1.017-.352.236-.786.3-1.199.288-.84-.073-1.613-.52-2.212-1.106-.15-.1-.236-.263-.368-.38-.801-.97-1.394-2.203-1.324-3.496.048-.698.38-1.44 1.03-1.75.206-.1.428-.164.655-.182z" fill="url(#lobe-icons-meta-ai-0-_R_0_)"></path><path d="M18.595 3.077c.52-.045 1.032.186 1.4.551.402.434.625 1.006.736 1.584.096.605.09 1.233-.048 1.83a5.97 5.97 0 01-.907 2.19c-.198.25-.382.519-.633.719-.493.45-1.181.725-1.848.598-.42-.08-.819-.306-1.085-.646-.514-.591-.687-1.403-.714-2.17a6.11 6.11 0 011.03-3.285c.237-.314.49-.62.797-.867.375-.27.805-.486 1.272-.504z" fill="url(#lobe-icons-meta-ai-1-_R_0_)"></path><path d="M5.038 4.172c.618-.045 1.238.067 1.832.235.871.28 1.741.78 2.182 1.624.177.383.256.826.152 1.242-.097.442-.375.816-.71 1.105-.724.59-1.664.84-2.577.887a5.356 5.356 0 01-2.881-.675c-.39-.248-.765-.539-1.025-.93a1.9 1.9 0 01-.327-1.283c.067-.507.357-.968.741-1.289.723-.62 1.684-.873 2.613-.916z" fill="url(#lobe-icons-meta-ai-2-_R_0_)"></path><path d="M4.87 10.369c.69-.06 1.465.223 1.811.866.213.349.278.763.29 1.166.006.528-.136 1.046-.34 1.529-.34.793-.893 1.478-1.538 2.036-.64.538-1.42.951-2.26 1.015a2.031 2.031 0 01-1.467-.398c-.353-.281-.578-.707-.662-1.15-.156-.8.077-1.62.445-2.327.196-.377.444-.724.72-1.044.767-.886 1.814-1.608 3.001-1.693z" fill="url(#lobe-icons-meta-ai-3-_R_0_)"></path><path d="M20.391 11.05c.881-.087 1.872.116 2.477.822.473.58.534 1.425.239 2.102-.118.317-.32.59-.527.852-.877.962-2.11 1.553-3.379 1.744-.818.123-1.723.036-2.406-.477-.2-.161-.386-.346-.514-.573-.277-.436-.321-.994-.216-1.492.224-.904.92-1.594 1.676-2.073a5.874 5.874 0 012.65-.905z" fill="url(#lobe-icons-meta-ai-4-_R_0_)"></path><path d="M7.553 15.523c.381-.052.775.004 1.118.184.344.154.613.427.866.702.866 1.097 1.267 2.549 1.146 3.944a4.476 4.476 0 01-.497 1.61c-.273.469-.663.91-1.187 1.08-.35.103-.731.118-1.077-.005a2.53 2.53 0 01-.959-.612c-.798-.859-1.236-2.02-1.343-3.185-.055-.646-.006-1.31.21-1.923.146-.471.384-.92.738-1.265.261-.277.62-.452.985-.53z" fill="url(#lobe-icons-meta-ai-5-_R_0_)"></path><path d="M13.637 16.5a4.237 4.237 0 011.82.219c.795.286 1.542.724 2.148 1.323.535.504.963 1.162 1.099 1.899.055.379.038.785-.122 1.138-.19.465-.599.807-1.051.996-.883.364-1.887.253-2.76-.082a5.568 5.568 0 01-2.343-1.685c-.347-.445-.616-.968-.697-1.534-.042-.382-.036-.788.13-1.142.194-.418.55-.76.978-.925.25-.119.525-.174.798-.207z" fill="url(#lobe-icons-meta-ai-6-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-0-_R_0_" x1="9.789" x2="13" y1="0" y2="7.5"><stop stop-color="#C65EFF"></stop><stop offset=".5" stop-color="#EA4FFF"></stop><stop offset="1" stop-color="#9553FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-1-_R_0_" x1="19" x2="17" y1="3" y2="10.5"><stop stop-color="#CF72FF"></stop><stop offset=".5" stop-color="#E541FF"></stop><stop offset="1" stop-color="#944DFF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-2-_R_0_" x1="9" x2="2.5" y1="6.5" y2="8"><stop stop-color="#A555FF"></stop><stop offset=".5" stop-color="#DE67FF"></stop><stop offset="1" stop-color="#E581FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-3-_R_0_" x1="1" x2="6" y1="12" y2="16"><stop stop-color="#6C48FF"></stop><stop offset=".309" stop-color="#AA5AFF"></stop><stop offset="1" stop-color="#5145FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-4-_R_0_" x1="19" x2="21" y1="11.5" y2="16.5"><stop stop-color="#CA3EFF"></stop><stop offset=".5" stop-color="#AB5CFF"></stop><stop offset="1" stop-color="#5042FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-5-_R_0_" x1="6" x2="11" y1="20.5" y2="19"><stop stop-color="#5041FF"></stop><stop offset=".26" stop-color="#734FFF"></stop><stop offset=".75" stop-color="#6A4CFF"></stop><stop offset="1" stop-color="#483FFF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-6-_R_0_" x1="12" x2="18.5" y1="17.5" y2="21.5"><stop stop-color="#7B51FF"></stop><stop offset=".475" stop-color="#6049FF"></stop><stop offset="1" stop-color="#8466FF"></stop></linearGradient></defs></svg>', "combined": '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M10 3v5M14 3v5M10 16v5M14 16v5M3 10h5M3 14h5M16 10h5M16 14h5"/><circle cx="12" cy="12" r="1.5"/></svg>', "road": '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="5" r="2"/><circle cx="14" cy="12" r="2"/><path d="M18 18h3M20 16v4"/></svg>' };
  DG_PROVIDER_LOGOS.counting = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>';
  DG_PROVIDER_LOGOS.parity = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3" fill="currentColor"/><circle cx="6" cy="18" r="3" fill="currentColor"/><path d="M10 12h4"/></svg>';

  // lib/dg-provider-menu.ts
  function installDgProviderMenu(shadow, options) {
    const select = shadow.getElementById("provider");
    const trigger = shadow.getElementById("provider-trigger");
    const menu = shadow.getElementById("provider-menu");
    const currentLogo = shadow.getElementById("provider-selected-logo");
    const currentName = shadow.getElementById("provider-selected-name");
    const mainLogo = shadow.getElementById("main-strategy-logo");
    let last = "";
    const buttons = [];
    function logo(key, prefix) {
      return (DG_PROVIDER_LOGOS[key] ?? DG_PROVIDER_LOGOS.road).replace(/id="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^\)]+)\)/g, `url(#${prefix}-$1)`);
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    function sync() {
      const key = select.value;
      if (key === last) return;
      last = key;
      currentLogo.innerHTML = logo(key, "trigger");
      mainLogo.innerHTML = logo(key, "main");
      currentName.textContent = options.find((x) => x.key === key)?.label ?? key;
      for (const b of buttons) {
        const active = b.dataset.value === key;
        b.classList.toggle("selected", active);
        b.setAttribute("aria-selected", String(active));
      }
    }
    function open() {
      if (trigger.disabled) return;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const triggerBox = trigger.getBoundingClientRect();
      const surface = shadow.getElementById("settings-page").getBoundingClientRect();
      const scale = trigger.offsetHeight ? triggerBox.height / trigger.offsetHeight : 1;
      const below = Math.max(0, (surface.bottom - triggerBox.bottom) / Math.max(0.2, scale) - 10);
      const above = Math.max(0, (triggerBox.top - surface.top) / Math.max(0.2, scale) - 10);
      const up = below < 252 && above > below;
      menu.style.top = up ? "auto" : "46px";
      menu.style.bottom = up ? "46px" : "auto";
      menu.style.maxHeight = Math.min(260, Math.max(84, up ? above : below)) + "px";
      menu.style.overflowY = "auto";
    }
    trigger.onclick = () => {
      sync();
      if (menu.hidden) open();
      else close();
    };
    trigger.onkeydown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open();
        (buttons.find((b) => b.dataset.value === select.value) ?? buttons[0]).focus();
      }
    };
    for (const option of options) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.value = option.key;
      b.className = "provider-option";
      b.setAttribute("role", "option");
      b.setAttribute("aria-label", option.label);
      const mark = document.createElement("span");
      mark.className = "provider-logo";
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = logo(option.key, "option-" + option.key);
      const label = document.createElement("span");
      label.textContent = option.label;
      const check = document.createElement("span");
      check.className = "provider-check";
      check.textContent = "\u2713";
      check.setAttribute("aria-hidden", "true");
      b.append(mark, label, check);
      b.onclick = () => {
        select.value = option.key;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
        trigger.focus();
      };
      b.onkeydown = (e) => {
        const index = buttons.indexOf(b);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          buttons[(index + (e.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length].focus();
        }
        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          buttons[e.key === "Home" ? 0 : buttons.length - 1].focus();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          close();
          trigger.focus();
        }
      };
      buttons.push(b);
      menu.append(b);
    }
    function outside(e) {
      if (!e.target?.closest(".provider-picker")) close();
    }
    function escape(e) {
      if (e.key === "Escape") close();
    }
    shadow.addEventListener("pointerdown", outside);
    shadow.addEventListener("keydown", escape);
    select.addEventListener("change", sync);
    sync();
    return { sync, close, cleanup: () => {
      shadow.removeEventListener("pointerdown", outside);
      shadow.removeEventListener("keydown", escape);
      select.removeEventListener("change", sync);
      trigger.onclick = trigger.onkeydown = null;
      for (const b of buttons) b.onclick = b.onkeydown = null;
    } };
  }

  // lib/dg-official-turnover.ts
  var DG_OFFICIAL_REFRESH_MS = 3e4;
  var DG_OFFICIAL_TIMEOUT_MS = 3e4;
  var EMPTY_STATUS = "\u5F85\u540C\u6B65\u5B98\u65B9\u5831\u8868";
  var SCOPE = "DG \u5B98\u65B9\u6709\u6548\u984D\uFF08dList[1]\uFF09";
  var EVENT_RECEIVED_SUCCESS = "RECEIVED_SUCCESS";
  function taipeiDay(now = Date.now()) {
    return new Date(now + 8 * 60 * 60 * 1e3).toISOString().slice(0, 10);
  }
  function rangeFor(period, day) {
    return period === "today" ? `${day}\uFF08DG \u5B98\u65B9\u4ECA\u65E5\uFF0CtimeSpan=1\uFF09` : "DG \u5B98\u65B9\u8FD17\u65E5\uFF08timeSpan=7\uFF1B\u4EE5\u5E73\u53F0\u5B9A\u7FA9\u70BA\u6E96\uFF09";
  }
  function emptyValue(period, day, status = EMPTY_STATUS) {
    return { value: null, status, updatedAt: null, range: rangeFor(period, day), scope: SCOPE };
  }
  function isObject(value) {
    return !!value && typeof value === "object";
  }
  function numberOrNull(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return value;
  }
  function zeroOrMissing(value) {
    return value === void 0 || value === null || value === "" || value === 0 || value === "0";
  }
  function accountIdentity(account, objectIds, nextObjectId) {
    if (account === null || account === void 0) return "none";
    if (typeof account === "string" || typeof account === "number" || typeof account === "boolean") {
      return `${typeof account}:${String(account)}`;
    }
    if (!isObject(account)) return typeof account;
    for (const key of ["id", "accountId", "account", "username", "userName", "uid", "playerId", "memberId"]) {
      const value = account[key];
      if (typeof value === "string" || typeof value === "number") return `${key}:${String(value)}`;
    }
    const object = account;
    let id = objectIds.get(object);
    if (id === void 0) {
      id = nextObjectId();
      objectIds.set(object, id);
    }
    return `object:${id}`;
  }
  function candidatePlayerInfo(value) {
    if (!isObject(value)) return null;
    const direct = value;
    if (direct.socketMan && typeof direct.socketMan.sendData === "function") return direct;
    const playerInfo = value.playerInfo;
    if (isObject(playerInfo)) {
      const player = playerInfo;
      if (player.socketMan && typeof player.socketMan.sendData === "function") return player;
    }
    return null;
  }
  function findRuntime(W) {
    if (!isObject(W)) return null;
    const laya = isObject(W.Laya) ? W.Laya : null;
    const stage = laya && laya.stage;
    const roots = [];
    if (stage) roots.push(stage);
    roots.push(W);
    const seen = /* @__PURE__ */ new Set();
    let inspected = 0;
    while (roots.length && inspected++ < 2e3) {
      const node = roots.shift();
      if (!isObject(node)) continue;
      if (seen.has(node)) continue;
      seen.add(node);
      const playerInfo = candidatePlayerInfo(node);
      if (playerInfo?.socketMan && typeof playerInfo.socketMan.sendData === "function") {
        return { playerInfo, socket: playerInfo.socketMan };
      }
      const count = numberOrNull(node.numChildren);
      if (count !== null && count >= 0 && typeof node.getChildAt === "function") {
        for (let i = 0; i < Math.min(count, 500); i++) {
          try {
            roots.push(node.getChildAt(i));
          } catch {
          }
        }
      }
      const children = node._children;
      if (Array.isArray(children)) roots.push(...children.slice(0, 500));
    }
    return null;
  }
  function readRequestBinding(bean, ownRequests, transportEpoch) {
    if (!isObject(bean) || Number(bean.cmd) !== 13) return null;
    const list = Array.isArray(bean.list) ? bean.list : [];
    const type = Number.isFinite(Number(bean.type)) ? Number(bean.type) : null;
    const span = typeof bean.object === "string" || typeof bean.object === "number" ? String(bean.object) : null;
    const unfilteredFirstPage = type === 1 && (span === "1" || span === "7") && list.length === 4 && list[0] === "" && list[1] === "" && String(list[2]) === "12" && String(list[3]) === "1" && zeroOrMissing(bean.lobbyId) && zeroOrMissing(bean.tableId);
    return { own: ownRequests.get(bean) ?? null, type, span, unfilteredFirstPage, transportEpoch };
  }
  function parseReportObject(raw) {
    if (typeof raw === "string") {
      if (!raw.trim()) return null;
      try {
        const parsed = JSON.parse(raw);
        return isObject(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return isObject(raw) ? raw : null;
  }
  function officialValidAmount(raw) {
    if (typeof raw !== "number" && typeof raw !== "string") return null;
    if (typeof raw === "string" && !raw.trim()) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER / 100 ? value : null;
  }
  function responseLooksLikeUnfilteredBetReport(bean, binding) {
    if (Number(bean.cmd) !== 13 || Number(bean.type) !== 1 || binding.type !== 1 || !binding.unfilteredFirstPage) return false;
    if (!zeroOrMissing(bean.lobbyId) || !zeroOrMissing(bean.tableId)) return false;
    if (Array.isArray(bean.list)) {
      const list = bean.list;
      if (list.length && (list.length !== 4 || list[0] !== "" || list[1] !== "" || String(list[2]) !== "12" || String(list[3]) !== "1")) return false;
    }
    return true;
  }
  function parseOfficialReply(bean) {
    if (bean.codeId === null || bean.codeId === void 0 || bean.codeId === "" || Number(bean.codeId) !== 0) return null;
    const report = parseReportObject(bean.object);
    if (!report || !Array.isArray(report.records)) return null;
    for (const key of ["pageNow", "pageCount", "pageSize", "rowCount"]) {
      const value = Number(report[key]);
      if (!Number.isFinite(value) || value < 0) return null;
    }
    if (!Array.isArray(bean.dList) || bean.dList.length !== 3) return null;
    return officialValidAmount(bean.dList[1]);
  }
  function createDgOfficialTurnover(W, getAccount, canRefresh = () => true) {
    let disposed = false;
    let objectId = 0;
    const objectIds = /* @__PURE__ */ new WeakMap();
    const ownRequests = /* @__PURE__ */ new WeakMap();
    let requestId = 0;
    let currentDay = taipeiDay();
    let currentAccount = safeAccountIdentity();
    let today = emptyValue("today", currentDay);
    let week = emptyValue("week", currentDay);
    let socket = null;
    let originalSend = null;
    let sendObserver = null;
    let listenerAttached = false;
    let listenerMode = null;
    const listenerOwner = {};
    let socketListener = null;
    let transportEpoch = 0;
    let nativeTransport = void 0;
    let closedObserved = false;
    let connectionListeners = [];
    const bindings = [];
    let pending = null;
    let remaining = [];
    let timeout = null;
    let refreshTimer = null;
    let refreshQueued = false;
    let lastCycleAt = 0;
    let reconciliationRequired = false;
    const interval = setInterval(() => refresh(false), 1e3);
    function safeAccountIdentity() {
      let account = null;
      try {
        account = getAccount();
      } catch {
        return "unavailable";
      }
      return accountIdentity(account, objectIds, () => ++objectId);
    }
    function update(period, patch) {
      const previous = period === "today" ? today : week;
      const next = { ...previous, ...patch, range: rangeFor(period, currentDay), scope: SCOPE };
      if (period === "today") today = next;
      else week = next;
    }
    function clearTimeoutForPending() {
      if (timeout !== null) clearTimeout(timeout);
      timeout = null;
    }
    function scheduleRefresh() {
      if (disposed || refreshTimer !== null) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        refresh(false);
      }, 250);
    }
    function reconcileDrainedBindings() {
      if (pending || bindings.length) return;
      reconciliationRequired = false;
      lastCycleAt = 0;
      scheduleRefresh();
    }
    function markCurrentCancelled() {
      if (!pending) return;
      pending.cancelled = true;
      pending = null;
      clearTimeoutForPending();
    }
    function resetValues(status = EMPTY_STATUS) {
      markCurrentCancelled();
      remaining = [];
      refreshQueued = false;
      today = emptyValue("today", currentDay, status);
      week = emptyValue("week", currentDay, status);
    }
    function resetTransport(status) {
      transportEpoch++;
      resetValues(status);
      bindings.length = 0;
      reconciliationRequired = false;
      lastCycleAt = 0;
    }
    function refreshTransport(runtime) {
      if (socket && (socket !== runtime.socket || nativeTransport !== runtime.socket.socket)) {
        const distinctNative = !!nativeTransport && !!runtime.socket.socket && nativeTransport !== runtime.socket.socket;
        const distinctEmitter = socket !== runtime.socket && !nativeTransport && !runtime.socket.socket;
        if (distinctNative || distinctEmitter) resetTransport("DG\u5B98\u65B9\u9023\u7DDA\u5DF2\u66F4\u65B0\uFF0C\u91CD\u65B0\u540C\u6B65\u4E2D");
        detachSocket();
        closedObserved = false;
      }
      return attach(runtime);
    }
    function ensureFreshIdentity() {
      const day = taipeiDay();
      const account = safeAccountIdentity();
      if (day === currentDay && account === currentAccount) return;
      currentDay = day;
      currentAccount = account;
      resetValues();
      reconciliationRequired = false;
    }
    function detachSocket() {
      if (!socket) return;
      if (listenerAttached && socketListener && typeof socket.off === "function") {
        try {
          if (listenerMode === "emitter") socket.off(EVENT_RECEIVED_SUCCESS, socketListener);
          else socket.off(EVENT_RECEIVED_SUCCESS, listenerOwner, socketListener);
        } catch {
        }
        for (const entry of connectionListeners) {
          try {
            if (listenerMode === "emitter") socket.off(entry.event, entry.listener);
            else socket.off(entry.event, listenerOwner, entry.listener);
          } catch {
          }
        }
      }
      if (sendObserver && socket.sendData === sendObserver && originalSend) socket.sendData = originalSend;
      listenerAttached = false;
      listenerMode = null;
      socketListener = null;
      connectionListeners = [];
      nativeTransport = void 0;
      originalSend = null;
      sendObserver = null;
      socket = null;
    }
    function attach(runtime) {
      if (socket === runtime.socket && sendObserver && listenerAttached) return true;
      detachSocket();
      if (typeof runtime.socket.sendData !== "function" || typeof runtime.socket.on !== "function" || typeof runtime.socket.off !== "function") return false;
      socket = runtime.socket;
      const previousSend = runtime.socket.sendData;
      originalSend = previousSend;
      const observerEpoch = transportEpoch;
      sendObserver = function observedSend(bean) {
        if (!disposed && !closedObserved && socket === runtime.socket && observerEpoch === transportEpoch) observeOutgoing(bean);
        return previousSend.call(this, bean);
      };
      runtime.socket.sendData = sendObserver;
      const activeSocket = runtime.socket;
      const listenerEpoch = transportEpoch;
      nativeTransport = runtime.socket.socket;
      socketListener = (bean) => {
        if (!disposed && !closedObserved && socket === activeSocket && listenerEpoch === transportEpoch) receivedHandler(bean);
      };
      try {
        runtime.socket.on(EVENT_RECEIVED_SUCCESS, listenerOwner, socketListener);
        listenerMode = "laya";
        listenerAttached = true;
      } catch {
        try {
          runtime.socket.on(EVENT_RECEIVED_SUCCESS, socketListener);
          listenerMode = "emitter";
          listenerAttached = true;
        } catch {
          if (runtime.socket.sendData === sendObserver) runtime.socket.sendData = originalSend;
          socket = null;
          socketListener = null;
          originalSend = null;
          sendObserver = null;
          return false;
        }
      }
      const connectionEnded = () => {
        if (disposed || socket !== activeSocket || closedObserved || listenerEpoch !== transportEpoch) return;
        closedObserved = true;
        resetTransport("DG\u5B98\u65B9\u9023\u7DDA\u4E2D\u65B7\uFF0C\u7B49\u5F85\u65B0\u9023\u7DDA\u540C\u6B65");
      };
      const connectionFailed = () => {
        if (activeSocket.socket?.connected === false) connectionEnded();
      };
      const connectionOpened = () => {
        if (disposed || socket !== activeSocket || !closedObserved || activeSocket.socket?.connected === false) return;
        closedObserved = false;
        detachSocket();
        if (attach(runtime)) scheduleRefresh();
      };
      for (const entry of [
        { event: "CONNECT_CLOSED", listener: connectionEnded },
        { event: "CONNECT_FAILED", listener: connectionFailed },
        { event: "CONNECT_SUCCESS", listener: connectionOpened }
      ]) {
        try {
          if (listenerMode === "emitter") activeSocket.on(entry.event, entry.listener);
          else activeSocket.on(entry.event, listenerOwner, entry.listener);
          connectionListeners.push(entry);
        } catch {
        }
      }
      return true;
    }
    function observeOutgoing(bean) {
      const binding = readRequestBinding(bean, ownRequests, transportEpoch);
      if (!binding) return;
      bindings.push(binding);
      if (!binding.own && pending) {
        resetValues("\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u91CD\u758A\uFF0C\u5F85\u540C\u6B65");
        reconciliationRequired = true;
        return;
      }
      if (bindings.length > 64) failClosed("\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u7121\u6CD5\u5C0D\u61C9\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
    }
    function finishPeriod(request, value, status) {
      if (pending?.id !== request.id) return;
      clearTimeoutForPending();
      pending = null;
      if (!request.cancelled && request.account === currentAccount && request.taipeiDay === currentDay) {
        update(request.period, { value, status, updatedAt: value === null ? null : Date.now() });
      }
      sendNext();
    }
    function failClosed(status) {
      clearTimeoutForPending();
      if (pending && !pending.cancelled && pending.account === currentAccount && pending.taipeiDay === currentDay) {
        update(pending.period, { value: null, status, updatedAt: null });
      }
      if (pending) pending.expired = true;
      pending = null;
      remaining = [];
      reconciliationRequired = true;
    }
    function receivedHandler(bean) {
      if (disposed || !isObject(bean) || Number(bean.cmd) !== 13) return;
      const binding = bindings.shift();
      if (!binding) {
        if (pending) failClosed("\u5B98\u65B9\u5831\u8868\u56DE\u8986\u7121\u6CD5\u5C0D\u61C9\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
        return;
      }
      if (binding.transportEpoch !== transportEpoch) return;
      if (!binding.own) {
        if (reconciliationRequired) reconcileDrainedBindings();
        return;
      }
      const request = binding.own;
      if (request.transportEpoch !== transportEpoch || request.expired || request.cancelled || pending?.id !== request.id) {
        reconcileDrainedBindings();
        return;
      }
      if (!responseLooksLikeUnfilteredBetReport(bean, binding)) {
        failClosed("\u5B98\u65B9\u5831\u8868\u56DE\u8986\u4E0D\u7B26\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
        return;
      }
      const amount = parseOfficialReply(bean);
      finishPeriod(request, amount, amount === null ? "\u5B98\u65B9\u5831\u8868\u56DE\u8986\u7121\u6548" : "\u5DF2\u540C\u6B65\u5B98\u65B9\u5831\u8868");
    }
    function requestPeriod(period) {
      ensureFreshIdentity();
      if (disposed) return;
      const runtime = findRuntime(W);
      if (!runtime || !refreshTransport(runtime)) {
        update(period, { value: null, status: "\u5F85DG\u5B98\u65B9\u5831\u8868\u5C31\u7DD2", updatedAt: null });
        remaining = [];
        lastCycleAt = 0;
        return;
      }
      let suppliedAccount;
      try {
        suppliedAccount = getAccount();
      } catch {
        suppliedAccount = null;
      }
      if (isObject(suppliedAccount) && suppliedAccount !== runtime.playerInfo) {
        resetValues("DG\u5DE5\u4F5C\u968E\u6BB5\u5DF2\u8B8A\u66F4\uFF0C\u5F85\u91CD\u65B0\u5B89\u88DD\u6838\u5C0D");
        reconciliationRequired = true;
        return;
      }
      if (runtime.socket.socket?.connected === false) {
        update(period, { value: null, status: "\u5F85DG\u5B98\u65B9\u5831\u8868\u9023\u7DDA", updatedAt: null });
        remaining = [];
        lastCycleAt = 0;
        return;
      }
      if (runtime.playerInfo.token === void 0 || runtime.playerInfo.token === null || runtime.playerInfo.token === "") {
        update(period, { value: null, status: "\u5F85DG\u5B98\u65B9\u5E33\u865F\u5C31\u7DD2", updatedAt: null });
        remaining = [];
        lastCycleAt = 0;
        return;
      }
      const request = {
        id: ++requestId,
        period,
        account: currentAccount,
        taipeiDay: currentDay,
        sentAt: Date.now(),
        expired: false,
        cancelled: false,
        transportEpoch
      };
      const bean = { cmd: 13, type: 1, token: runtime.playerInfo.token, object: period === "today" ? "1" : "7", list: ["", "", "12", "1"] };
      ownRequests.set(bean, request);
      pending = request;
      update(period, { status: "\u8B80\u53D6DG\u5B98\u65B9\u5831\u8868\u4E2D" });
      try {
        runtime.socket.sendData(bean);
      } catch {
        if (pending?.id === request.id) finishPeriod(request, null, "DG\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u5931\u6557");
        return;
      }
      if (!bindings.some((binding) => binding.own?.id === request.id)) {
        failClosed("DG\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u7121\u6CD5\u9A57\u8B49\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
        return;
      }
      timeout = setTimeout(() => {
        if (disposed || pending?.id !== request.id) return;
        request.expired = true;
        failClosed("DG\u5B98\u65B9\u5831\u8868\u903E\u6642\uFF0C\u7B49\u5F85\u524D\u6B21\u56DE\u8986\u5F8C\u81EA\u52D5\u91CD\u8A66\uFF1B\u53EF\u6838\u5C0D\u7D50\u7B97\u5F8C\u91CD\u9023");
      }, DG_OFFICIAL_TIMEOUT_MS);
    }
    function sendNext() {
      if (disposed || pending || reconciliationRequired) return;
      if (!canRefresh()) return;
      const period = remaining.shift();
      if (period) requestPeriod(period);
      else if (refreshQueued) scheduleRefresh();
    }
    function refresh(force = false) {
      if (disposed) return;
      ensureFreshIdentity();
      if (force) refreshQueued = true;
      const runtime = findRuntime(W);
      if (runtime) refreshTransport(runtime);
      if (!canRefresh()) return;
      if (closedObserved) return;
      if (pending) return;
      if (reconciliationRequired || bindings.length) return;
      if (remaining.length) {
        sendNext();
        return;
      }
      const now = Date.now();
      if (!refreshQueued && now - lastCycleAt < DG_OFFICIAL_REFRESH_MS) return;
      refreshQueued = false;
      lastCycleAt = now;
      remaining = ["today", "week"];
      sendNext();
    }
    function view() {
      ensureFreshIdentity();
      const result = { platform: "DG", today: { ...today }, week: { ...week } };
      if (pending && !pending.cancelled) {
        const elapsed = Math.max(0, Date.now() - pending.sentAt);
        if (elapsed >= 1e4) result[pending.period].status = `DG\u5B98\u65B9\u5831\u8868\u56DE\u61C9\u8F03\u6162\uFF0C\u5DF2\u7B49\u5F85${Math.floor(elapsed / 1e3)}\u79D2`;
      }
      return result;
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      clearInterval(interval);
      if (refreshTimer !== null) clearTimeout(refreshTimer);
      refreshTimer = null;
      refreshQueued = false;
      clearTimeoutForPending();
      markCurrentCancelled();
      remaining = [];
      detachSocket();
    }
    return { view, refresh, dispose };
  }

  // lib/dg-mobile-native.ts
  function isRecord(value) {
    return !!value && typeof value === "object";
  }
  function safeProperty(value, key) {
    try {
      return isRecord(value) ? value[key] : void 0;
    } catch {
      return void 0;
    }
  }
  function control(value) {
    return typeof value === "function" || isRecord(value) && typeof safeProperty(value, "event") === "function";
  }
  function getDgBetControls(card) {
    if (control(card?.betMan?.confirm) && control(card?.betMan?.cancel)) return { profile: "desktop", manager: card.betMan, confirm: card.betMan.confirm, cancel: card.betMan.cancel };
    if (control(card?.betBtnMan?.confirmBtn) && control(card?.betBtnMan?.cancelBtn)) return { profile: "mobile-v329", manager: card.betBtnMan, confirm: card.betBtnMan.confirmBtn, cancel: card.betBtnMan.cancelBtn };
    return null;
  }
  function isDgMultiLobbyCard(value) {
    if (!isRecord(value)) return false;
    const gameInfo = safeProperty(value, "gameInfo"), betBtn = safeProperty(value, "betBtn");
    const socketMan = safeProperty(safeProperty(value, "playerInfo"), "socketMan");
    return value.tableId !== void 0 && isRecord(gameInfo) && isRecord(betBtn) && betBtn.Banker !== void 0 && betBtn.Player !== void 0 && getDgBetControls(value) !== null && isRecord(safeProperty(value, "betMoneyTmp")) && isRecord(safeProperty(value, "betMoneyTrue")) && typeof safeProperty(value, "confirmBet") === "function" && isRecord(socketMan) && typeof socketMan.sendData === "function";
  }
  function dgBuilderSourceFingerprint(fn) {
    let source;
    try {
      source = Function.prototype.toString.call(fn).replace(/^function\s+/, "").replace(/\s+/g, "");
    } catch {
      return "";
    }
    let hash = 2166136261;
    for (let index = 0; index < source.length; index++) hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
    return `${source.length}:${(hash >>> 0).toString(16)}`;
  }
  function hasDgVerifiedMobilePacketBuilder(card) {
    if (!isDgMultiLobbyCard(card) || getDgBetControls(card)?.profile !== "mobile-v329") return false;
    return ["1517:2faa00b2", "1443:b3416a14"].includes(dgBuilderSourceFingerprint(card.confirmBet));
  }
  function hasDgVerifiedDirectPacketBuilder(card) {
    if (!isDgMultiLobbyCard(card)) return false;
    if (getDgBetControls(card)?.profile === "mobile-v329") return hasDgVerifiedMobilePacketBuilder(card);
    let source = "";
    try {
      source = Function.prototype.toString.call(card.confirmBet);
    } catch {
      return false;
    }
    return ["betMoneyTmp", "betMoneyTrue", "gameNo", "BET_CHIP", "encrypt", "demo"].every((marker) => source.includes(marker));
  }
  function dgNativeBetEnabled(card) {
    const controls = getDgBetControls(card);
    return controls?.profile === "mobile-v329" ? hasDgVerifiedMobilePacketBuilder(card) && controls.manager.betFlag === true : card?.betFlag === true;
  }
  function inspectDgMobileNativeSurface(W) {
    const win = W, width = Number(win?.innerWidth), height = Number(win?.innerHeight);
    const portrait = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > width;
    const stage = win?.Laya?.stage;
    if (!isRecord(stage) || typeof safeProperty(stage, "getChildAt") !== "function") return { readiness: "waiting-stage", portrait, cardCount: 0, rejectedCardCount: 0 };
    const cards = readDgSceneNodes(stage).filter((node) => isDgMultiLobbyCard(node) && dgSceneNodeVisible(node));
    if (!cards.length) return { readiness: "waiting-multi-table", portrait, cardCount: 0, rejectedCardCount: 0 };
    const rejectedCardCount = cards.filter((card) => !hasDgVerifiedDirectPacketBuilder(card)).length;
    return { readiness: rejectedCardCount ? "unverified-packet-builder" : "compatible", portrait, cardCount: cards.length, rejectedCardCount };
  }

  // lib/dg-mobile-public-source.ts
  function exportDgMobileLoadedPublicScripts(documentLike) {
    const doc = documentLike;
    const base = typeof doc?.baseURI === "string" ? doc.baseURI : doc?.location?.href;
    if (typeof base !== "string" || !base) return { version: 1, status: "unavailable", scripts: [] };
    let baseUrl;
    try {
      baseUrl = new URL(base);
    } catch {
      return { version: 1, status: "unavailable", scripts: [] };
    }
    const scripts = [];
    const seen = /* @__PURE__ */ new Set();
    for (const script of Array.from(doc?.scripts ?? [])) {
      const raw = typeof script?.src === "string" ? script.src.trim() : "";
      if (!raw) continue;
      let source;
      try {
        source = new URL(raw, baseUrl);
      } catch {
        continue;
      }
      if (source.protocol !== "https:" && source.protocol !== "http:") continue;
      const url = source.origin + source.pathname;
      if (seen.has(url)) continue;
      seen.add(url);
      scripts.push({ url, type: typeof script.type === "string" ? script.type : "" });
    }
    return { version: 1, status: "ready", scripts };
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
    const pokerTracker = createDgPokerTracker();
    const sessionTimer = createDgSessionTimer();
    let running = false, busy = false, disposed = false, epoch = 0, once = false;
    let base = 100, scope = "global", provider = "combined", roomCount = "1", maxStake = 1e5, minSeconds = 6;
    let singleStaking = "martingale", userZoom = 1;
    let startMode = "fresh";
    let panelWidth = 280, panelHeight = 560, lastRenderedEvents = "";
    let riskLimits = { stopLoss: null, takeProfit: null };
    let riskApproved = false, riskTestOnce = false, riskReturnFocus = null;
    let mini = false, miniPreviousCompact = true;
    let manualSelection = false;
    let selected = /* @__PURE__ */ new Set(), status = "\u505C\u6B62\uFF1A\u5148\u8B80\u53D6 DG \u55AE\u9801\u591A\u684C\u8CC7\u6599";
    let socket = null, account = null;
    let walletPlayer = null;
    let nativeBetKey = "", originalSend = null, sendObserver = null;
    const owner = {}, logs = [], contexts = /* @__PURE__ */ new Map();
    let persistKey = "";
    let compact = true, reportPeriod = "today", reportPage = 0, reportTab = "bets";
    const tableWait = /* @__PURE__ */ new Map(), lastNotice = /* @__PURE__ */ new Map();
    const watchedRounds = /* @__PURE__ */ new Map();
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
      logs.unshift(`${(/* @__PURE__ */ new Date()).toLocaleTimeString("zh-TW", { hour12: false })} ${text}`);
      logs.length = Math.min(logs.length, 50);
      console.log("[DG]", text);
      render();
    }
    function stop(reason = "\u5DF2\u505C\u6B62\uFF1B\u5DF2\u9001\u51FA\u7684\u4E0B\u6CE8\u4ECD\u7B49\u5F85\u5E73\u53F0\u7D50\u7B97") {
      sessionTimer.stop();
      running = false;
      once = false;
      riskApproved = false;
      epoch++;
      q("risk-dialog").hidden = true;
      log(reason);
    }
    function stopIfTimeExpired() {
      if (!running || !sessionTimer.expired()) return false;
      stop(`\u5DF2\u9054\u8A2D\u5B9A ${sessionTimer.view().minutes} \u5206\u9418\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\uFF1B\u5DF2\u63A5\u53D7\u6CE8\u55AE\u7E7C\u7E8C\u7B49\u5F85\u7D50\u7B97`);
      return true;
    }
    function userStatus(text) {
      let value = text.replace(/\b\d{10,}\b/g, "");
      for (const c of boards()) value = value.replaceAll(String(c.tableId) + "\uFF5C", (c.gameInfo.tableName || String(c.tableId)) + "\uFF5C");
      value = value.replace(/｜[^｜]*｜已直接傳送 cmd 6：[\s\S]*/, "\uFF1A\u5DF2\u9001\u51FA\uFF0C\u7B49\u5F85\u78BA\u8A8D");
      value = value.replace(/｜[^｜]*｜平台已接受下注｜/, "\uFF1A\u4E0B\u6CE8\u6210\u529F ");
      value = value.replace(/｜[^｜]*｜結算 /, "\uFF1A\u7D50\u7B97 ");
      if (/已接上 DG 原生/.test(value)) return "\u5DF2\u9023\u7DDA\uFF0C\u5C1A\u672A\u958B\u59CB";
      if (/^找到 /.test(value)) {
        const wanted = value.match(/要求 (\d+) 桌/);
        return `\u5DF2\u9078 ${selected.size} \u684C${wanted ? `\uFF08\u8981\u6C42 ${wanted[1]} \u684C\uFF0C\u7B49\u5F85\u88DC\u8DB3\uFF09` : "\uFF0C\u53EF\u8A2D\u5B9A\u5F8C\u958B\u59CB"}`;
      }
      if (/^同時 \d+ 桌啟動/.test(value)) return `${selected.size} \u684C\u57F7\u884C\u4E2D\uFF0C\u5404\u684C\u7368\u7ACB\u4E0B\u6CE8`;
      if (/^測試一筆完整/.test(value)) return "\u6E2C\u8A66\u4E00\u7B46\uFF1A\u7B49\u5F85\u4E0B\u6CE8\u78BA\u8A8D";
      if (/金額 .* 低於平台最低/.test(value)) return value.replace(/金額 (\d+) 低於平台最低 (\d+)[\s\S]*/, "\u91D1\u984D $1 \u4F4E\u65BC\u6700\u4F4E $2\uFF0C\u672A\u4E0B\u6CE8");
      if (/莊閒限額尚未同步/.test(value)) return value.split("\uFF5C")[0] + "\uFF1A\u7B49\u5F85\u4E0B\u6CE8\u9650\u984D";
      return value.replace("DG ", "").replace("cmd 6", "\u4E0B\u6CE8").replace("\u5C01\u5305", "\u9023\u7DDA\u8CC7\u6599").replace("global", "\u5171\u7528\u5E33\u672C").replace("\u5DE5\u4F5C\u968E\u6BB5", "\u9023\u7DDA").replace("\u4FDD\u7559\u672C\u5C40\u9396\u5B9A\uFF0C\u4E0D\u91CD\u9001", "\u8ACB\u6838\u5C0D\u4E0B\u6CE8\u7D00\u9304\uFF0C\u4E0D\u91CD\u9001");
    }
    function waitTable(card, reason) {
      const id = String(card.tableId);
      tableWait.set(id, reason);
      const signature = String(card.gameInfo?.gameNo) + "|" + reason;
      if (lastNotice.get(id) !== signature) {
        lastNotice.set(id, signature);
        log(`${card.gameInfo?.tableName || id}\uFF5C${reason}`);
      }
    }
    function currentRoundState(card) {
      const id = String(card.tableId), gameNo = String(card.gameInfo?.gameNo ?? "");
      const bet = ledger.state.bets.find((b) => b.key === `${id}:${gameNo}`);
      if (bet) return { label: bet.state === "accepted" ? "\u5DF2\u63A5\u53D7 \xB7 \u5F85\u7D50\u7B97" : bet.state === "settled" ? "\u5DF2\u4E0B\u6CE8 \xB7 \u5DF2\u7D50\u7B97" : bet.state === "rejected" ? "\u4E0B\u6CE8\u88AB\u62D2\u7D55" : bet.state === "uncertain" ? "\u56DE\u8986\u672A\u78BA\u5B9A" : bet.state === "aborted" ? "\u672A\u9001\u51FA" : "\u5DF2\u9001\u51FA \xB7 \u5F85\u78BA\u8A8D", ok: bet.state === "accepted" || bet.state === "settled" };
      if (ledger.pending().some((b) => b.tableId === id)) return { label: "\u4E0A\u4E00\u7B46\u5F85\u7D50\u7B97", ok: false };
      const limit = checkDgAmount(card, stakeAmount(id));
      if (!limit.ok) return { label: userStatus(limit.reason), ok: false };
      if (Number(card.gameInfo?.stateId) !== 1) return { label: "\u672C\u5C40\u5DF2\u5C01\u76E4\uFF0F\u672A\u958B\u653E", ok: false };
      if (remaining(card) < minSeconds) return { label: "\u5269\u9918\u6642\u9593\u4E0D\u8DB3\uFF0C\u672A\u4E0B\u6CE8", ok: false };
      if (!dgNativeBetEnabled(card)) return { label: "\u539F\u751F\u78BA\u8A8D\u5C1A\u5728\u9396\u5B9A\uFF0C\u672A\u4E0B\u6CE8", ok: false };
      const decision = strategyFor(card);
      if (!decision.side) return { label: decision.reason || "\u7B56\u7565\u8CC7\u6599\u4E0D\u8DB3\uFF0C\u672A\u4E0B\u6CE8", ok: false };
      return { label: tableWait.get(id) ? userStatus(tableWait.get(id)) : running ? "\u6E96\u5099\u9001\u51FA" : "\u5DF2\u505C\u6B62", ok: false };
    }
    function trackRounds(cards) {
      if (!running) return;
      for (const c of cards.filter((c2) => selected.has(String(c2.tableId)))) {
        let finish2 = function() {
          if (!watched || watched.closed) return;
          watched.closed = true;
          const bet = ledger.state.bets.find((b) => b.key === `${id}:${watched.gameNo}`);
          if (!bet || bet.state === "aborted" || bet.state === "rejected") log(`${c.gameInfo.tableName || id} \u7B2C${watched.round}\u5C40\u672A\u4E0B\u5230\uFF1A${watched.reason}`);
        };
        var finish = finish2;
        const id = String(c.tableId), gameNo = String(c.gameInfo?.gameNo ?? "");
        if (!gameNo) continue;
        let watched = watchedRounds.get(id);
        if (watched && watched.gameNo !== gameNo) {
          finish2();
          watched = void 0;
          watchedRounds.delete(id);
          tableWait.delete(id);
        }
        if (!watched && Number(c.gameInfo?.stateId) === 1) {
          watched = { gameNo, round: String(c.gameInfo.playId ?? "\u2014"), closed: false, reason: "" };
          watchedRounds.set(id, watched);
        }
        if (watched && watched.gameNo === gameNo) {
          const state = currentRoundState(c);
          if (Number(c.gameInfo?.stateId) === 1) watched.reason = state.label;
          else finish2();
        }
      }
    }
    const visible = dgSceneNodeVisible;
    function nodes() {
      return readDgSceneNodes(L.stage);
    }
    function boards(all = nodes()) {
      const unique = /* @__PURE__ */ new Map();
      for (const n of all) {
        if (isDgMultiLobbyCard(n) && visible(n) && (getDgBetControls(n)?.profile !== "mobile-v329" || hasDgVerifiedMobilePacketBuilder(n))) {
          const k = String(n.tableId);
          if (!unique.has(k)) unique.set(k, n);
        }
      }
      return [...unique.values()].sort((a, b) => Number(a.tableId) - Number(b.tableId));
    }
    function remaining(n) {
      const info = n.gameInfo;
      let result = Number(info.countDown);
      if (info.starTime != null && Number.isFinite(Number(info.starTime))) {
        const now = L.Browser?.now?.() ?? Date.now();
        result -= Math.max(0, (now - Number(info.starTime)) / 1e3);
      }
      const text = String(n.countDownMan?.countDown ?? n.countDownMan?.text ?? "").trim();
      if (/^\d+$/.test(text)) result = Math.min(result, Number(text));
      return Number.isFinite(result) ? Math.max(0, result) : 0;
    }
    function ready(n) {
      return visible(n) && Number(n.gameInfo?.stateId) === 1 && remaining(n) >= minSeconds && dgNativeBetEnabled(n) && visible(n.betBtn?.Banker) && visible(n.betBtn?.Player) && n.betBtn.Banker.mouseEnabled !== false && n.betBtn.Player.mouseEnabled !== false;
    }
    function roads(n) {
      if (!Array.isArray(n.gameInfo.roadArray)) return [];
      return [...n.gameInfo.roadArray].reverse().map((r) => {
        const x = r?.road;
        const v = Number(Array.isArray(x) ? x[0] : typeof x === "string" ? x.split(",")[0] : NaN);
        return v >= 1 && v <= 4 ? "\u838A" : v >= 5 && v <= 8 ? "\u9592" : v >= 9 && v <= 12 ? "\u548C" : null;
      }).filter((x) => x !== null);
    }
    function strategyFor(card, key = provider) {
      if (key === "counting" || key === "parity") {
        const result = pokerTracker.decision(card, key);
        return result.ok ? result : { confidence: 0, reason: result.reason };
      }
      const results = roads(card);
      if (results.filter((x) => x !== "\u548C").length < 3) return { confidence: 0, reason: "\u7B49\u5F85\u81F3\u5C113\u7B46\u838A\u9592\u724C\u8DEF" };
      return localProviderDecision(key, results);
    }
    function sameSession(b) {
      return b.playerInfo === account && b.playerInfo?.socketMan === socket && socket?.socket?.connected !== false;
    }
    function attach(all) {
      const p = findDgScenePlayer(all);
      walletPlayer = p;
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
      ledger.state.roundStartedAt ??= mountedAt;
      migrateSingleChain();
      for (const bet of ledger.pending()) if (bet.state === "submitted" || bet.state === "reserved") bet.state = "uncertain";
      originalSend = socket.sendData;
      sendObserver = function(msg, ...args) {
        if (Number(msg?.cmd) === 6) {
          const key = `${msg.tableId}:${msg.gameNo}`;
          const bet = ledger.pending().find((b) => b.key === key);
          if (bet && nativeBetKey !== key) {
            bet.attributionUncertain = true;
            bet.state = "uncertain";
            persist();
            stop("\u5075\u6E2C\u540C\u5C40\u984D\u5916\u4E0B\u6CE8\uFF1B\u672C\u7B46\u640D\u76CA\u4E0D\u80FD\u55AE\u7368\u6838\u5C0D\uFF0C\u505C\u6B62\u914D\u6CE8\u63A8\u9032");
          }
        }
        return originalSend.call(this, msg, ...args);
      };
      socket.sendData = sendObserver;
      socket.on("RECEIVED_SUCCESS", owner, onMessage);
      persist();
      log("\u5DF2\u63A5\u4E0A DG \u539F\u751F\u56DE\u8986\uFF0F\u7D50\u7B97\u4E8B\u4EF6\uFF1B\u672A\u57F7\u884C\u4E0B\u6CE8");
    }
    function onMessage(msg) {
      if (disposed) return;
      queueMicrotask(() => {
        if (!disposed) pokerTracker.observe(boards());
      });
      const receipt = ledger.receipt(msg);
      if (receipt) {
        persist();
        log(`${receipt.bet.tableId}\uFF5C${receipt.bet.gameNo}\uFF5C${receipt.accepted ? "\u5E73\u53F0\u5DF2\u63A5\u53D7\u4E0B\u6CE8" : "\u5E73\u53F0\u62D2\u7D55\u6216\u91D1\u984D\u4E0D\u7B26\uFF0C\u672A\u6A19\u793A\u6210\u529F"}\uFF5C${receipt.bet.side} ${money(receipt.bet.amount)}`);
        if (!receipt.accepted) stop("\u672C\u7B46\u4E0B\u6CE8\u672A\u78BA\u8A8D\u63A5\u53D7\uFF0C\u5DF2\u505C\u6B62\uFF1B\u4E0D\u81EA\u52D5\u91CD\u9001");
        if (once) {
          sessionTimer.stop();
          running = false;
          once = false;
        }
      }
      const settled = ledger.settle(msg);
      if (settled) {
        if (settled.bet.scope === "table" && settled.bet.staking !== "flat" && roomCount === "1") ledger.state.levels.global = settled.nextLevel;
        persist();
        log(`${settled.bet.tableId}\uFF5C${settled.bet.gameNo}\uFF5C\u7D50\u7B97 ${settled.pnl > 0 ? "+" : ""}${money(settled.pnl)}\uFF5C${settled.bet.staking === "flat" ? "\u5E73\u6CE8\uFF1A\u91D1\u984D\u56FA\u5B9A" : settled.pnl > 0 ? "\u8D0F\uFF1A\u91CD\u7F6E" : settled.pnl < 0 ? "\u8F38\uFF1A\u5347\u968E" : "\u548C\uFF0F\u9000\u6CE8\uFF1A\u7DAD\u6301"}\uFF5C\u4E0B\u4E00\u6CE8 ${money(stakeAmount(settled.bet.tableId))}`);
        if (running) {
          const reason = riskStopReason(roundPnl(), riskLimits);
          if (reason) stop(reason);
        }
        window.dispatchEvent(new CustomEvent("dg-singlepage-settlement", { detail: { ...settled.bet, nextLevel: settled.nextLevel } }));
        window.setTimeout(() => official.refresh(true), 800);
      }
    }
    function migrateSingleChain() {
      if (ledger.state.levels.global != null || ledger.pending().length) return;
      const last = ledger.state.bets.filter((b) => b.state === "settled" && b.staking !== "flat").slice().sort((a, b) => (a.settledAt ?? a.createdAt) - (b.settledAt ?? b.createdAt)).at(-1);
      if (last) ledger.state.levels.global = ledger.level(last.tableId, last.scope);
    }
    function desiredScope() {
      return roomCount === "1" && singleStaking !== "flat" ? "global" : "table";
    }
    function stakingMode() {
      return roomCount === "1" ? singleStaking : "flat";
    }
    function amountLevel(tableId, mode = scope) {
      return stakingMode() === "flat" || !running && !ledger.pending().length && startMode === "fresh" ? 0 : ledger.level(tableId, mode);
    }
    function stakeAmount(tableId, amount = base, mode = scope) {
      return stakingAmount(amount, amountLevel(tableId, mode), stakingMode());
    }
    function stakeDiagnostics() {
      return { base: running || ledger.pending().length ? base : Number(q("base").value), startMode, staking: stakingMode(), levels: { ...ledger.state.levels }, tables: boards().map((c) => ({ table: c.gameInfo.tableName, tableId: String(c.tableId), savedLevel: ledger.level(String(c.tableId), scope), effectiveLevel: amountLevel(String(c.tableId)), nextAmount: stakeAmount(String(c.tableId), !running && !ledger.pending().length ? Number(q("base").value) : base) })), recentBets: ledger.state.bets.slice(-10).map((b) => ({ ...b })) };
    }
    function roundBets() {
      return ledger.state.bets.filter((b) => b.state === "settled" && (b.settledAt ?? b.createdAt) >= (ledger.state.roundStartedAt ?? mountedAt));
    }
    function roundPnl() {
      return roundBets().reduce((sum, b) => sum + (b.pnl ?? 0), 0);
    }
    function unacknowledgedFunds() {
      return ledger.pending().filter((b) => b.state !== "accepted").reduce((sum, b) => sum + b.amount, 0);
    }
    async function execute(card, token, budget) {
      if (stopIfTimeExpired()) return;
      const decision = strategyFor(card);
      if (!decision.side) {
        waitTable(card, decision.reason || "\u7B56\u7565\u8CC7\u6599\u4E0D\u8DB3");
        return;
      }
      const gameNo = String(card.gameInfo.gameNo ?? ""), tableId = String(card.tableId);
      if (!gameNo || ledger.state.bets.some((b) => b.key === `${tableId}:${gameNo}`)) return;
      if (!sameSession(card) || !ready(card)) return;
      if (Object.values(card.betMoneyTmp).some((v) => Number(v) !== 0) || Object.values(card.betMoneyTrue).some((v) => Number(v) !== 0)) {
        waitTable(card, "\u672C\u5C40\u5DF2\u6709\u539F\u751F\u4E0B\u6CE8\u6216\u5F85\u78BA\u8A8D\u7C4C\u78BC\uFF0C\u4E0D\u6DF7\u5408\u6295\u6CE8");
        return;
      }
      const side = decision.side;
      const amount = stakeAmount(tableId);
      if (amount > maxStake) {
        stop(`\u4E0B\u4E00\u6CE8 ${money(amount)} \u8D85\u904E\u4F60\u8A2D\u5B9A\u7684\u91D1\u984D\u4E0A\u9650 ${money(maxStake)}`);
        return;
      }
      const preflight = checkDgAmount(card, amount);
      if (!preflight.ok) {
        waitTable(card, preflight.reason);
        return;
      }
      if (amount > budget.remaining) {
        waitTable(card, `\u540C\u6279\u53EF\u7528\u9918\u984D ${money(Math.max(0, budget.remaining))} \u4E0D\u8DB3 ${money(amount)}\uFF1B\u5176\u4ED6\u684C\u5DF2\u9810\u7559\uFF0C\u4E0D\u9001\u51FA`);
        return;
      }
      tableWait.delete(tableId);
      lastNotice.delete(tableId);
      const bet = ledger.reserve(tableId, gameNo, side, base, scope, stakingMode());
      bet.provider = provider;
      persist();
      contexts.set(bet.key, card);
      const internalSide = side === "\u838A" ? "Banker" : "Player";
      function guard() {
        if (stopIfTimeExpired()) throw new Error("\u5DF2\u9054\u81EA\u52D5\u505C\u6B62\u6642\u9593\uFF0C\u6C92\u6709\u9001\u51FA\u65B0\u4E0B\u6CE8");
        if (window.__DG_MANUAL_CAPTURE_ACTIVE__) throw new Error("\u624B\u52D5\u6D41\u7A0B\u8A18\u9304\u4E2D\uFF0C\u5DE5\u5177\u4E0D\u9001\u55AE");
        if (!running || disposed || token !== epoch || document.hidden || String(card.gameInfo.gameNo) !== gameNo || !ready(card) || !sameSession(card)) throw new Error("\u5DF2\u505C\u6B62\u3001\u5C40\u865F\u6539\u8B8A\u6216\u505C\u6B62\u63A5\u53D7\u4E0B\u6CE8");
        const riskReason = riskStopReason(roundPnl(), riskLimits);
        if (riskReason) throw new Error(riskReason);
        const check = checkDgAmount(card, amount);
        if (!check.ok) throw new Error(check.reason);
      }
      try {
        guard();
        if (typeof card.confirmBet !== "function") throw new Error("DG \u7248\u672C\u7F3A\u5C11\u53EF\u7528\u7684\u539F\u751F\u5C01\u5305\u5EFA\u69CB\u5668");
        let packet = null;
        const detached = Object.create(card);
        detached.betMoneyTmp = Object.fromEntries(Object.keys(card.betMoneyTmp).map((k) => [k, k === internalSide ? amount : 0]));
        detached.betMoneyTrue = Object.fromEntries(Object.keys(card.betMoneyTrue).map((k) => [k, 0]));
        if (getDgBetControls(card)?.profile === "mobile-v329") {
          if (!hasDgVerifiedMobilePacketBuilder(card)) throw new Error("\u624B\u6A5F\u539F\u751Fbuilder\u7248\u672C\u672A\u6838\u5C0D\uFF0C\u6C92\u6709\u50B3\u9001");
          detached.betBtn = Object.fromEntries(Object.entries(card.betBtn).map(([key, value]) => [key, Object.assign(Object.create(value), { hideHover: () => {
          } })]));
          detached.betBtnMan = Object.assign(Object.create(card.betBtnMan), { betFlag: true, visible: false });
        }
        detached.betFlag = true;
        detached.showBetMan = () => {
        };
        detached.showBetFailed = () => {
          throw new Error("DG \u539F\u751F\u9A57\u8B49\uFF0F\u5C01\u5305\u5EFA\u69CB\u5931\u6557");
        };
        detached.event = (name, msg) => {
          if (name === "BET_CHIP" && Number(msg?.cmd) === 6) {
            if (packet) throw new Error("\u5C01\u5305\u5EFA\u69CB\u5668\u56DE\u50B3\u591A\u7B46\u4E0B\u6CE8");
            packet = msg;
            return true;
          }
          throw new Error("\u5C01\u5305\u5EFA\u69CB\u5668\u56DE\u50B3\u975E\u9810\u671F\u4E8B\u4EF6");
        };
        card.confirmBet.call(detached);
        if (!packet || String(packet.tableId) !== tableId || String(packet.gameNo) !== gameNo) throw new Error("\u4E0B\u6CE8\u5C01\u5305\u684C\u865F\uFF0F\u5C40\u865F\u4E0D\u7B26\uFF0C\u6C92\u6709\u50B3\u9001");
        guard();
        ledger.submit(bet);
        persist();
        budget.remaining -= amount;
        nativeBetKey = bet.key;
        try {
          socket.sendData(packet);
        } finally {
          nativeBetKey = "";
        }
        log(`${tableId}\uFF5C${gameNo}\uFF5C\u5DF2\u76F4\u63A5\u50B3\u9001 cmd 6\uFF1A${side} ${money(amount)}\uFF1B\u7B49\u5F85\u5E73\u53F0\u63A5\u53D7\u56DE\u8986`);
      } catch (error) {
        if (bet.state === "reserved") {
          ledger.abort(bet);
        } else ledger.uncertain(bet);
        persist();
        stop(String(error.message));
      }
    }
    async function tick() {
      if (disposed) return;
      stopIfTimeExpired();
      if (busy) return;
      if (window.__DG_MANUAL_CAPTURE_ACTIVE__ && running) stop("\u624B\u52D5\u6D41\u7A0B\u8A18\u9304\u4E2D\uFF0C\u5DE5\u5177\u5DF2\u505C\u6B62");
      const all = nodes();
      pokerTracker.observe(boards(all));
      attach(all);
      autoScan(boards(all));
      trackRounds(boards(all));
      render();
      if (socket?.socket?.connected === false && ledger.pending().length) {
        for (const b of ledger.pending()) b.state = "uncertain";
        persist();
        stop("DG \u9023\u7DDA\u5DF2\u4E2D\u65B7\uFF1B\u5F85\u7D50\u7B97\u4E0B\u6CE8\u4FDD\u7559\u70BA\u672A\u78BA\u5B9A\uFF0C\u8ACB\u6838\u5C0D\u6B63\u5F0F\u7D00\u9304");
      }
      for (const b of ledger.pending()) {
        if (b.state === "submitted" && Date.now() - (b.submittedAt ?? b.createdAt) > 12e3) {
          ledger.uncertain(b);
          persist();
          stop("\u4E0B\u6CE8\u56DE\u8986\u903E\u6642\uFF1B\u4FDD\u7559\u672C\u5C40\u9396\u5B9A\uFF0C\u4E0D\u91CD\u9001");
        }
        if (running && b.state === "accepted" && Date.now() - (b.acceptedAt ?? b.createdAt) > 18e4) stop("\u5E73\u53F0\u7D50\u7B97\u903E\u6642\uFF1B\u5DF2\u505C\u6B62\uFF0C\u4FDD\u7559\u5F85\u7D50\u7B97\u5E33\u672C");
      }
      if (!running || !socket || document.hidden) return;
      const riskReason = riskStopReason(roundPnl(), riskLimits);
      if (riskReason) {
        stop(riskReason);
        return;
      }
      const cards = boards(all).filter((c) => selected.has(String(c.tableId)));
      const budget = { remaining: Math.max(0, Number(account?.balance ?? 0) - unacknowledgedFunds()) };
      const current = epoch;
      busy = true;
      try {
        for (const card of cards) {
          if (!running || epoch !== current) break;
          if (ledger.pending().some((b) => scope === "global" || b.scope === "global" || b.tableId === String(card.tableId))) continue;
          if (ready(card)) await execute(card, current, budget);
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
    shadow.innerHTML = DG_PANEL_HTML;
    const cleanupFeedback = installDgButtonFeedback(shadow);
    const cleanupTouchScroll = installDgPanelTouchScroll(shadow);
    const mountedAt = Date.now();
    const q = (id) => shadow.getElementById(id);
    q("panel").classList.toggle("compact", compact);
    q("count").value = q("parallel-count").value = roomCount;
    for (const option of AI_PROVIDER_OPTIONS) {
      const el = document.createElement("option");
      el.value = option.key;
      el.textContent = option.label;
      q("provider").appendChild(el);
    }
    q("provider").value = provider;
    const providerMenu = installDgProviderMenu(shadow, AI_PROVIDER_OPTIONS);
    const official = createDgOfficialTurnover(window, () => account, () => !busy);
    function selectionLocked() {
      return running || busy || ledger.pending().length > 0;
    }
    function openForAuto(card) {
      const id = String(card.tableId), gameNo = String(card.gameInfo?.gameNo ?? "");
      if (!gameNo || !ready(card) || !sameSession(card)) return false;
      if (ledger.state.bets.some((b) => b.key === `${id}:${gameNo}`)) return false;
      if (roads(card).filter((x) => x !== "\u548C").length < 3) return false;
      if (Object.values(card.betMoneyTmp).some((v) => Number(v) !== 0) || Object.values(card.betMoneyTrue).some((v) => Number(v) !== 0)) return false;
      const amount = stakeAmount(id);
      return amount <= maxStake && checkDgAmount(card, amount).ok;
    }
    function autoScan(cards) {
      if (manualSelection || !q("rooms-page").hidden && !running) return;
      const pending = ledger.pending().map((b) => b.tableId);
      const eligible = cards.filter(openForAuto).map((c) => String(c.tableId));
      const ids = running ? selectOpenDgTables(eligible, pending, roomCount) : syncDgTables(eligible.length ? eligible : cards.map((c) => String(c.tableId)), [...selected], pending, roomCount);
      if (ids.length === selected.size && ids.every((id) => selected.has(id))) return;
      selected = new Set(ids);
      renderRooms();
      log(`\u81EA\u52D5\u627E\u684C\uFF1A\u5DF2\u9078 ${selected.size} \u684C\uFF1B\u6709\u53EF\u4E0B\u6CE8\u7A7A\u4F4D\u5C31\u57F7\u884C`);
    }
    function selectCount(value) {
      if (!["1", "3", "5", "all"].includes(value)) return;
      if (selectionLocked()) {
        q("count").value = q("parallel-count").value = roomCount;
        log("\u5148\u505C\u6B62\u4E26\u7B49\u5DF2\u9001\u51FA\u4E0B\u6CE8\u7D50\u7B97\uFF0C\u624D\u80FD\u8B8A\u66F4\u540C\u6642\u684C\u6578");
        return;
      }
      roomCount = value;
      scope = desiredScope();
      q("count").value = q("parallel-count").value = value;
      if (manualSelection && value !== "all") selected = new Set([...selected].slice(0, Number(value)));
      scan();
    }
    function scan() {
      if (selectionLocked()) {
        log("\u5148\u505C\u6B62\u4E26\u7B49\u5DF2\u9001\u51FA\u4E0B\u6CE8\u7D50\u7B97\uFF0C\u624D\u80FD\u8B8A\u66F4\u684C\u53F0\u6216\u7B56\u7565");
        return;
      }
      const cards = boards(), limit = roomCount === "all" ? cards.length : Number(roomCount);
      if (!manualSelection) selected = new Set(cards.slice(0, limit).map((c) => String(c.tableId)));
      autoScan(cards);
      log(cards.length ? `\u627E\u5230 ${cards.length} \u500B\u55AE\u9801\u684C\u53F0\uFF1B\u540C\u6642\u9078\u4E2D ${selected.size} \u684C${roomCount !== "all" && selected.size < limit ? `\uFF08\u8981\u6C42 ${limit} \u684C\uFF0C\u76EE\u524D\u50C5\u8F09\u5165 ${selected.size} \u684C\uFF09` : ""}` : "\u5C1A\u672A\u627E\u5230 DG \u55AE\u9801\u591A\u684C\u8CC7\u6599\uFF1B\u8ACB\u958B\u555F DG \u591A\u53F0\u6216\u53F3\u5074\u597D\u8DEF\u4E0B\u6CE8\u9762\u677F");
      renderRooms();
    }
    function renderRooms() {
      q("rooms").replaceChildren();
      for (const c of boards()) {
        const button = document.createElement("button"), id = String(c.tableId);
        button.className = "room" + (selected.has(id) ? " active" : "");
        button.setAttribute("aria-pressed", String(selected.has(id)));
        button.disabled = selectionLocked();
        const title = document.createElement("span");
        title.className = "room-title";
        const name = document.createElement("strong");
        name.textContent = c.gameInfo.tableName || id;
        const check = document.createElement("span");
        check.className = "room-check";
        check.textContent = "\u2713";
        check.setAttribute("aria-hidden", "true");
        title.append(name, check);
        const detail = document.createElement("span");
        detail.className = "room-detail";
        detail.textContent = selected.has(id) ? "\u5DF2\u9078\u64C7 \xB7 \u7368\u7ACB\u8A08\u7B97\u65B9\u5411" : "\u9EDE\u9078\u52A0\u5165\u4E0B\u6CE8\u7BC4\u570D";
        button.append(title, detail);
        button.onclick = () => {
          if (selectionLocked()) return;
          if (selected.has(id)) {
            manualSelection = true;
            selected.delete(id);
          } else if (roomCount === "all" || selected.size < Number(roomCount)) {
            manualSelection = true;
            selected.add(id);
          } else {
            log(`\u540C\u6642 ${roomCount} \u684C\u5DF2\u6EFF\uFF0C\u5148\u53D6\u6D88\u4E00\u684C\u518D\u9078\u5176\u4ED6\u684C`);
            return;
          }
          renderRooms();
          render();
        };
        q("rooms").appendChild(button);
      }
    }
    function start(testOnce = false) {
      if (window.__DG_MANUAL_CAPTURE_ACTIVE__) {
        log("\u624B\u52D5\u6D41\u7A0B\u8A18\u9304\u4E2D\uFF0C\u4E0D\u80FD\u958B\u555F\u81EA\u52D5\u4E0B\u6CE8");
        return;
      }
      if (busy) {
        log("\u4E0A\u4E00\u6D41\u7A0B\u5C1A\u672A\u9000\u51FA\uFF0C\u8ACB\u7A0D\u5019\u518D\u958B\u59CB");
        return;
      }
      if (!riskApproved) {
        requestStart(testOnce);
        return;
      }
      riskApproved = false;
      if (startMode === "fresh" && ledger.pending().length) {
        log("\u65B0\u958B\u59CB\u9808\u7B49\u5F85\u6240\u6709\u5DF2\u9001\u51FA\u55AE\u7D50\u7B97\uFF1B\u53EF\u9078\u7E8C\u63A5\uFF0C\u4F46\u4E0D\u6E05\u9664\u5F85\u7D50\u7B97\u55AE");
        return;
      }
      if (ledger.pending().some((b) => b.state === "uncertain")) {
        log("\u6709\u672A\u80FD\u6838\u5C0D\u7684\u4E0B\u6CE8\uFF0C\u4FDD\u6301\u505C\u6B62\uFF1B\u8ACB\u5148\u67E5\u770B DG \u6B63\u5F0F\u4E0B\u6CE8\u7D00\u9304");
        return;
      }
      let durationMinutes;
      try {
        durationMinutes = parseDurationMinutes(q("duration-minutes").value);
      } catch (e) {
        log(e.message);
        return;
      }
      let nextRisk;
      try {
        nextRisk = parseRiskLimits(q("stop-loss").value, q("take-profit").value);
      } catch (e) {
        log(e.message);
        return;
      }
      if (ledger.pending().length && (nextRisk.stopLoss !== riskLimits.stopLoss || nextRisk.takeProfit !== riskLimits.takeProfit)) {
        log("\u5F85\u7D50\u7B97\u671F\u9593\u4E0D\u80FD\u6539\u6B62\u640D\uFF0F\u6B62\u76C8");
        return;
      }
      const riskReason = riskStopReason(roundPnl(), nextRisk);
      if (riskReason) {
        log(riskReason);
        return;
      }
      const nextBase = Number(q("base").value), nextScope = desiredScope(), nextProvider = q("provider").value;
      if (ledger.pending().length && (nextBase !== base || nextScope !== scope || nextProvider !== provider)) {
        log("\u5F85\u7D50\u7B97\u671F\u9593\u4E0D\u80FD\u6539\u57FA\u672C\u91D1\u984D\u3001\u7B56\u7565\u6216\u5E33\u672C");
        return;
      }
      if (!Number.isSafeInteger(nextBase) || nextBase <= 0) {
        log("\u57FA\u672C\u55AE\u6CE8\u5FC5\u9808\u662F\u6B63\u6574\u6578");
        return;
      }
      const nextStaking = stakingMode();
      attach(nodes());
      if (!boards().length) {
        log("\u5C1A\u672A\u8FA8\u8B58\u539F\u751F\u591A\u684C\u5361\u7247\uFF0C\u6C92\u6709\u958B\u59CB\uFF1B\u8ACB\u532F\u51FA DG \u9023\u7DDA\u8A3A\u65B7");
        return;
      }
      if (!socket || socket.socket?.connected === false) {
        log("\u539F\u751F\u904A\u6232\u9023\u7DDA\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6C92\u6709\u958B\u59CB");
        return;
      }
      if (dgSceneWallet(walletPlayer) === null) {
        log("\u539F\u751F\u9918\u984D\u5C1A\u672A\u540C\u6B65\uFF0C\u6C92\u6709\u958B\u59CB");
        return;
      }
      if (ledger.pending().length && nextStaking !== stakingMode()) {
        log("\u7B49\u5F85\u4E0B\u6CE8\u7D50\u7B97\u5F8C\u624D\u80FD\u8B8A\u66F4\u914D\u6CE8\u65B9\u5F0F");
        return;
      }
      if (roomCount === "1") singleStaking = nextStaking;
      maxStake = Number(q("cap").value);
      if (!Number.isSafeInteger(maxStake) || maxStake < nextBase) {
        log("\u55AE\u7B46\u4E0A\u9650\u5FC5\u9808\u4E0D\u5C0F\u65BC\u57FA\u672C\u55AE\u6CE8");
        return;
      }
      base = nextBase;
      scope = nextScope;
      provider = nextProvider;
      riskLimits = nextRisk;
      if (!selected.size) scan();
      if (!selected.size && manualSelection) {
        log("\u6307\u5B9A\u684C\u6A21\u5F0F\u5C1A\u672A\u9078\u684C\uFF1B\u5148\u9078\u684C\u6216\u5207\u56DE\u81EA\u52D5\u627E\u684C");
        return;
      }
      if (roomCount !== "1" && ledger.pending().some((b) => b.scope === "global")) {
        log("\u820A\u7248\u5171\u7528\u5E33\u672C\u4ECD\u6709\u5F85\u7D50\u7B97\u4E0B\u6CE8\uFF1B\u5148\u7B49\u6B63\u5F0F\u7D50\u7B97\u518D\u958B\u59CB\u540C\u6642\u591A\u684C");
        return;
      }
      if (startMode === "fresh") {
        ledger.resetLevels();
        persist();
        log(`\u65B0\u958B\u59CB\uFF1A\u57FA\u672C\u55AE\u6CE8 ${money(base)}\uFF0C\u914D\u6CE8\u5F9E\u7B2C1\u968E\u958B\u59CB\uFF1B\u4E0B\u6CE8\u7D00\u9304\u4FDD\u7559`);
      }
      sessionTimer.start(durationMinutes);
      running = true;
      once = testOnce;
      epoch++;
      log(testOnce ? "\u6E2C\u8A66\u4E00\u7B46\u5B8C\u6574\u6D41\u7A0B\uFF08\u4E0D\u662F\u591A\u684C\u6279\u6B21\uFF09" : roomCount === "1" && stakingMode() !== "flat" ? `\u540C\u6642 1 \u684C\u555F\u52D5\uFF1A\u8DE8\u623F\u9593\u63A5\u7E8C${stakingMode() === "doubling" ? "\u500D\u6295\u6CD5" : "\u99AC\u4E01"}\uFF0C\u7D50\u7B97\u5F8C\u624D\u627E\u4E0B\u4E00\u684C` : `\u540C\u6642 ${selected.size} \u684C\u555F\u52D5\uFF1A\u5404\u684C\u56FA\u5B9A\u5E73\u6CE8\uFF0C\u4E0D\u7B49\u5176\u4ED6\u684C\u7D50\u7B97`);
      void tick();
    }
    function showPage(name) {
      providerMenu.close();
      if (mini && name !== "overview") setMini(false);
      for (const page of ["overview", "settings", "logs", "rooms"]) q(page + "-page").hidden = page !== name;
      for (const page of ["overview", "settings", "logs"]) q("nav-" + page).classList.toggle("active", page === name);
      fitPanel();
    }
    function fitPanel() {
      const top = host.getBoundingClientRect().top;
      const overlay = !q("risk-dialog").hidden || !q("report-shell").hidden;
      const width = mini && !overlay ? 210 : panelWidth;
      const widthScale = Math.min(userZoom, (window.innerWidth - 24) / width);
      const fullHeight = Math.min(panelHeight, Math.max(280, (window.innerHeight - top - 16) / Math.max(0.2, widthScale)));
      host.style.setProperty("--full-height", fullHeight + "px");
      host.style.setProperty("--full-width", panelWidth + "px");
      const height = mini && !overlay ? Math.max(228, q("panel").scrollHeight) : fullHeight;
      const scale = Math.min(widthScale, (window.innerHeight - top - 12) / height);
      host.style.setProperty("--fit", String(Math.max(0.2, scale)));
      q("zoom-label").textContent = `${Math.round(scale * 100)}%`;
    }
    function render() {
      if (disposed) return;
      renderOfficialTurnover(shadow, official.view());
      const usage = sessionTimer.view();
      q("session-elapsed").textContent = usage.elapsedText;
      const limit = usage.started ? usage.minutes : (() => {
        try {
          return parseDurationMinutes(q("duration-minutes").value);
        } catch {
          return null;
        }
      })();
      q("session-remaining").textContent = usage.started && usage.remainingMs !== null ? `\u5269\u9918 ${formatDuration(usage.remainingMs)}` : limit === null ? "\u6642\u9650\u683C\u5F0F\u932F\u8AA4" : limit ? `\u8A2D\u5B9A ${limit} \u5206\u9418` : "\u4E0D\u9650\u6642";
      q("duration-minutes").disabled = running || busy;
      q("status").textContent = `${running ? "\u57F7\u884C\u4E2D" : "\u5DF2\u505C\u6B62"}\uFF5C${userStatus(status)}`;
      q("hero-status").textContent = userStatus(status);
      const eventSignature = logs.join("\n");
      if (eventSignature !== lastRenderedEvents) {
        lastRenderedEvents = eventSignature;
        q("events").replaceChildren();
        for (const text of logs) {
          const entry = document.createElement("article");
          entry.className = "event-card" + (/平台已接受|結算 [+-]/.test(text) ? " accepted" : /失敗|拒絕|不足|逾時|未下到/.test(text) ? " warning" : "");
          const first = text.indexOf(" "), time = document.createElement("time");
          time.textContent = first >= 0 ? text.slice(0, first) : "";
          const body = document.createElement("p");
          body.textContent = userStatus(first >= 0 ? text.slice(first + 1) : text);
          entry.append(time, body);
          q("events").append(entry);
        }
      }
      for (const button of q("rooms").querySelectorAll("button")) button.disabled = selectionLocked();
      const cards = boards(), chosen = cards.filter((c) => selected.has(String(c.tableId))), pending = ledger.pending();
      const currentBet = pending[0];
      const focus = chosen.find((c) => String(c.tableId) === currentBet?.tableId) ?? chosen.find(ready) ?? chosen[0];
      const previewBase = !running && !pending.length && Number.isSafeInteger(Number(q("base").value)) && Number(q("base").value) > 0 ? Number(q("base").value) : base;
      const previewProvider = q("provider").value;
      const strategyLabel = AI_PROVIDER_OPTIONS.find((x) => x.key === previewProvider)?.label ?? "\u672C\u5730\u7B56\u7565";
      q("current-strategy").textContent = strategyLabel;
      providerMenu.sync();
      const previewScope = !running && !pending.length ? desiredScope() : scope;
      const settled = roundBets();
      const pnl = settled.reduce((sum, b) => sum + (b.pnl ?? 0), 0);
      const wins = settled.filter((b) => (b.pnl ?? 0) > 0).length, losses = settled.filter((b) => (b.pnl ?? 0) < 0).length, ties = settled.length - wins - losses;
      q("brand-count").textContent = "\u767E\u5BB6\u5DE5\u7A0B\u5E2B";
      const wallet = dgSceneWallet(walletPlayer);
      q("balance").textContent = wallet === null ? "\u5F85\u540C\u6B65" : money(wallet);
      q("mini-balance").textContent = q("balance").textContent;
      q("mini-running").textContent = `${running ? selected.size ? "\u57F7\u884C\u4E2D" : "\u7B49\u5F85\u958B\u76E4" : pending.length ? "\u5F85\u7D50\u7B97" : "\u5DF2\u505C\u6B62"} \xB7 ${mini ? selected.size + "\u684C" : manualSelection ? "\u6307\u5B9A\u684C" : "\u81EA\u52D5\u627E\u684C"}`;
      q("auto-tables").disabled = selectionLocked();
      q("auto-tables").classList.toggle("selected", !manualSelection);
      q("auto-tables").textContent = manualSelection ? "\u5207\u56DE\u81EA\u52D5\u627E\u684C" : "\u81EA\u52D5\u627E\u684C\u4E2D";
      q("selection-mode").textContent = manualSelection ? "\u6307\u5B9A\u684C\u53F0 \xB7 \u4E0D\u81EA\u52D5\u88DC\u5176\u4ED6\u684C" : "\u81EA\u52D5\u627E\u684C \xB7 \u958B\u653E\u4E0B\u6CE8\u5C31\u52A0\u5165";
      q("scope").options[0].textContent = stakingMode() === "flat" ? "\u5E73\u6CE8 \xB7 \u91D1\u984D\u56FA\u5B9A" : stakingMode() === "doubling" ? "\u55AE\u684C\u5171\u7528\u500D\u6295 \xB7 \u63DB\u623F\u63A5\u7E8C 1\u21922\u21924\u21928" : "\u55AE\u684C\u5171\u7528\u99AC\u4E01 \xB7 \u63DB\u623F\u63A5\u7E8C 1\u21923\u21927\u219215";
      q("doubling-reminder").hidden = stakingMode() !== "doubling";
      q("single-staking").value = stakingMode();
      q("single-staking").disabled = roomCount !== "1" || selectionLocked();
      q("start-mode").value = startMode;
      q("start-mode").disabled = running || busy;
      q("staking-hint").textContent = roomCount === "1" ? singleStaking === "flat" ? "\u55AE\u684C\u5E73\u6CE8\uFF1A\u6BCF\u7B46\u56FA\u5B9A\u57FA\u672C\u984D\uFF0C\u63DB\u623F\u4E0D\u52A0\u6CE8\u3002" : `\u8DE8\u623F\u9593\u63A5\u7E8C${singleStaking === "doubling" ? "\u500D\u62951\u21922\u21924\u21928" : "\u99AC\u4E011\u21923\u21927\u219215"}\uFF1A\u8F38\u5347\u968E\u3001\u8D0F\u91CD\u7F6E\u3001\u548C\u7DAD\u6301\u3002${startMode === "fresh" ? "\u65B0\u958B\u59CB\u9996\u7B46\u57FA\u672C\u984D\u3002" : "\u7E8C\u63A5\u4FDD\u7559\u5171\u7528\u968E\u7D1A\u3002"}` : "\u591A\u684C\u56FA\u5B9A\u5E73\u6CE8\uFF0C\u4E0D\u53EF\u66F4\u6539\u3002";
      q("stop-loss").disabled = q("take-profit").disabled = q("base").disabled = q("cap").disabled = selectionLocked();
      q("run-pill").textContent = running ? "\u25CF \u81EA\u52D5\u4E0B\u6CE8\u4E2D" : pending.length ? "\u25CF \u5F85\u7D50\u7B97" : "\u25CF \u5DF2\u505C\u6B62";
      q("run-pill").classList.toggle("idle", !running);
      q("method").textContent = `${stakingMode() === "flat" ? "\u5E73\u6CE8 \xB7 \u56FA\u5B9A\u91D1\u984D" : stakingMode() === "doubling" ? "\u55AE\u684C \xB7 \u500D\u6295\u6CD5" : "\u55AE\u684C \xB7 \u99AC\u4E01"}\uFF08${selected.size} \u684C\uFF09`;
      q("parallel-count").value = q("count").value = roomCount;
      q("parallel-count").disabled = q("count").disabled = q("scan").disabled = selectionLocked();
      q("parallel-summary").textContent = `\u5DF2\u9078 ${selected.size} \u684C \xB7 \u5F85\u63A5\u53D7 ${pending.filter((b) => b.state !== "accepted").length} \xB7 \u5F85\u7D50\u7B97 ${pending.filter((b) => b.state === "accepted").length}`;
      const rec = focus ? strategyFor(focus, previewProvider) : null;
      q("focus-table").textContent = focus ? focus.gameInfo.tableName || String(focus.tableId) : "\u5C0B\u627E\u53EF\u4E0B\u6CE8\u684C";
      q("focus-phase").textContent = currentBet ? currentBet.state === "accepted" ? "\u7B49\u5F85\u7D50\u7B97" : currentBet.state === "uncertain" ? "\u56DE\u8986\u672A\u78BA\u5B9A" : "\u7B49\u5F85\u63A5\u53D7" : focus && ready(focus) ? "\u53EF\u4E0B\u6CE8" : "\u6E96\u5099\u4E2D";
      const focusId = focus ? String(focus.tableId) : "";
      const shownLevel = currentBet?.level ?? amountLevel(focusId, previewScope);
      const shownStaking = currentBet?.staking ?? stakingMode();
      const multiplier = shownStaking === "flat" ? 1 : shownStaking === "doubling" ? 2 ** shownLevel : 2 ** (shownLevel + 1) - 1;
      const label = currentBet ? currentBet.state === "accepted" ? "\u5DF2\u63A5\u53D7\u91D1\u984D" : currentBet.state === "uncertain" ? "\u672A\u78BA\u5B9A\u91D1\u984D" : "\u5DF2\u9001\u51FA\u91D1\u984D" : "\u4E0B\u4E00\u6CE8\u9810\u89BD";
      q("amount-label").textContent = !running && !pending.length && (!Number.isSafeInteger(Number(q("base").value)) || Number(q("base").value) <= 0) ? "\u57FA\u672C\u55AE\u6CE8\u9808\u70BA\u6B63\u6574\u6578" : label;
      q("amount-rule").textContent = `\u57FA\u672C ${money(currentBet ? currentBet.amount / multiplier : previewBase)} \xB7 ${shownStaking === "flat" ? "\u5E73\u6CE8 \xD71" : `\u7B2C${shownLevel + 1}\u968E \xD7${multiplier}`}`;
      q("amount").textContent = money(currentBet?.amount ?? stakeAmount(focusId, previewBase, previewScope));
      q("amount").title = label + "\uFF5C" + q("amount-rule").textContent;
      q("amount").classList.toggle("long-number", q("amount").textContent.length > 7);
      const side = currentBet?.side ?? rec?.side;
      q("side").textContent = side ? `${side} ${currentBet ? "\u4E0B\u6CE8" : "\u63A8\u85A6"}` : "\u2014";
      q("side").classList.toggle("player", side === "\u9592");
      const seconds = focus ? Math.floor(remaining(focus)) : null;
      q("countdown").textContent = seconds !== null ? String(seconds) : "\u2014";
      q("ring").style.setProperty("--progress", `${seconds !== null ? Math.min(1, seconds / Math.max(1, Number(focus.gameInfo.countDown))) * 360 : 0}deg`);
      q("focus-meta").textContent = focus ? `\u9774 ${focus.gameInfo.shoeId ?? "\u2014"} \xB7 \u5C40 ${focus.gameInfo.playId ?? "\u2014"} \xB7 ${getPatternInfo(roads(focus)).label} \xB7 ${strategyLabel}` : `${strategyLabel} \xB7 \u7B49\u5019\u724C\u8DEF\u8207\u5012\u6578`;
      if (rec?.reason && !currentBet) q("focus-meta").textContent += " \xB7 " + rec.reason;
      if (currentBet) {
        const original = AI_PROVIDER_OPTIONS.find((x) => x.key === currentBet.provider)?.label;
        q("focus-meta").textContent += original && original !== strategyLabel ? `\uFF5C\u6B64\u55AE ${original}` : "";
      }
      if (!focus && !currentBet) {
        q("focus-phase").textContent = cards.length ? "\u7B49\u5F85\u958B\u76E4" : "\u684C\u5361\u672A\u63A5\u901A";
        q("focus-meta").textContent = cards.length ? `\u5DF2\u8FA8\u8B58 ${cards.length} \u684C\uFF1B\u7B49\u5F85\u958B\u76E4\u3001\u8DB3\u5920\u5012\u6578\u8207\u724C\u8DEF` : "\u5C1A\u672A\u8FA8\u8B58\u539F\u751F\u684C\u5361\uFF0C\u672A\u9001\u55AE\uFF1B\u8ACB\u532F\u51FA\u9023\u7DDA\u8A3A\u65B7";
      }
      const stage = currentBet ? currentBet.state === "accepted" ? 3 : 2 : running ? 1 : 0;
      for (let i = 1; i <= 4; i++) q("step-" + i).classList.toggle("active", i <= stage);
      const seeking = running && !currentBet;
      q("search-box").hidden = compact || !seeking;
      q("target-box").hidden = !compact && seeking;
      q("search-title").textContent = compact ? "\u6311\u9078\u4E0B\u6CE8\u55AE\u2026" : "\u6311\u9078\u4E0B\u6CE8\u684C\u2026";
      q("countdown").textContent = seconds === 0 && currentBet ? "\u2298" : seconds !== null ? String(seconds) : "\u2014";
      q("ring").style.background = seconds === 0 ? "#55525866" : `conic-gradient(${seconds !== null && seconds <= 5 ? "#c8a555" : "#73997a"} ${seconds !== null ? Math.min(1, seconds / Math.max(1, Number(focus.gameInfo.countDown))) * 360 : 0}deg,#52565344 0)`;
      const low = q("range-min").value, high = q("range-max").value;
      const rangeSummary = chartSummary(settled);
      q("range-low").textContent = money(rangeSummary.low);
      q("range-high").textContent = money(rangeSummary.high);
      const position = rangePosition(pnl, low, high);
      q("pnl-range").hidden = true;
      const points = cumulativePoints(settled), chart = chartSummary(settled);
      q("pnl-line").setAttribute("points", points);
      q("pnl-chart").classList.toggle("red", pnl < 0);
      const zero = 39 - (0 - chart.low) / (chart.high - chart.low || 1) * 35;
      const endpoint = points.split(" ").at(-1).split(",");
      q("chart-zero").setAttribute("y1", String(zero));
      q("chart-zero").setAttribute("y2", String(zero));
      q("chart-dot").setAttribute("cx", endpoint[0]);
      q("chart-dot").setAttribute("cy", endpoint[1]);
      q("chart-area").setAttribute("points", chart.count ? `0,${zero} ${points} 250,${zero}` : "");
      q("chart-empty").hidden = chart.count > 0;
      q("chart-dot").style.opacity = chart.count ? "1" : "0";
      q("pnl-line").style.opacity = chart.count ? "1" : ".2";
      q("chart-last").textContent = chart.count ? (pnl > 0 ? "+" : "") + money(pnl) : "\u5C1A\u7121\u7D50\u7B97";
      q("chart-low").textContent = chart.count ? `\u6700\u4F4E ${money(chart.low)}` : "\u6700\u4F4E \u2014";
      q("chart-high").textContent = chart.count ? `\u6700\u9AD8 ${money(chart.high)}` : "\u6700\u9AD8 \u2014";
      q("chart-count").textContent = `${chart.count} \u6CE8`;
      q("cards-result").hidden = true;
      if (focus && currentBet && String(focus.gameInfo.gameNo) === currentBet.gameNo) {
        const poker = knownPoker(focus.gameInfo.poker);
        if (poker) {
          q("cards-result").hidden = false;
          for (const side2 of ["player", "banker"]) {
            q(side2 + "-cards").replaceChildren();
            for (const id of poker[side2]) {
              const card = document.createElement("span");
              card.className = "playing-card";
              card.textContent = pokerRank(id);
              q(side2 + "-cards").append(card);
            }
            q(side2 + "-point").textContent = String(pokerPoint(poker[side2]));
          }
        }
      }
      for (const id of ["hero-pnl", "round-pnl"]) {
        q(id).textContent = (pnl > 0 ? "+" : "") + money(pnl);
        q(id).classList.toggle("green", pnl > 0);
        q(id).classList.toggle("red", pnl < 0);
      }
      q("round-wlt").textContent = `${wins}/${losses}/${ties}`;
      q("hit-rate").textContent = wins + losses ? `${(wins / (wins + losses) * 100).toFixed(1)}%` : "\u2014";
      q("stop-now").classList.toggle("live", running);
      q("stop-now").textContent = running ? "\u25A0  \u505C\u6B62\u81EA\u52D5\u4E0B\u6CE8" : "\u25B6  \u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8";
      q("tables").replaceChildren();
      q("table-strip").replaceChildren();
      for (const c of chosen) {
        const results = roads(c), r = strategyFor(c, previewProvider);
        const ownPending = pending.find((b) => b.tableId === String(c.tableId));
        const shownSide = ownPending?.side ?? r?.side;
        const row = document.createElement("div");
        row.className = "table-row";
        const badge = document.createElement("span");
        badge.className = "table-badge";
        badge.textContent = shownSide ?? "\u2014";
        const info = document.createElement("div");
        info.className = "table-info";
        const title = document.createElement("strong");
        title.textContent = c.gameInfo.tableName || String(c.tableId);
        const meta = document.createElement("small");
        meta.textContent = `\u9774 ${c.gameInfo.shoeId ?? "\u2014"} \xB7 \u5C40 ${c.gameInfo.playId ?? "\u2014"} \xB7 ${getPatternInfo(results).label}`;
        info.append(title, meta);
        const amount = document.createElement("div");
        amount.className = "table-rec";
        amount.textContent = money(ownPending?.amount ?? stakeAmount(String(c.tableId), previewBase, previewScope));
        const detail = document.createElement("small");
        const limitCheck = checkDgAmount(c, stakeAmount(String(c.tableId), previewBase, previewScope));
        detail.textContent = ownPending ? `${ownPending.state === "accepted" ? "\u5E73\u53F0\u5DF2\u63A5\u53D7 \xB7 \u5F85\u7D50\u7B97" : ownPending.state === "uncertain" ? "\u56DE\u8986\u672A\u78BA\u5B9A" : "\u5DF2\u9001\u51FA \xB7 \u5F85\u63A5\u53D7"} ${money(ownPending.amount)}` : !limitCheck.ok ? limitCheck.reason : tableWait.get(String(c.tableId)) ?? (r.side ? `\u6307\u6A19 ${r.confidence} \xB7 ${Math.floor(remaining(c))}s` : r.reason || "\u7B49\u5F85\u8CC7\u6599");
        detail.style.maxWidth = "120px";
        detail.style.whiteSpace = "normal";
        detail.title = limitCheck.reason;
        amount.append(detail);
        row.append(badge, info, amount);
        q("tables").append(row);
        const chip = document.createElement("button");
        chip.className = "table-chip" + (focus === c ? " selected" : "");
        const chipTitle = document.createElement("strong");
        chipTitle.textContent = `${c.gameInfo.tableName || c.tableId} \xB7 ${shownSide ?? "\u2014"} ${money(ownPending?.amount ?? stakeAmount(String(c.tableId), previewBase, previewScope))}`;
        const roundState = currentRoundState(c);
        const chipStatus = document.createElement("small");
        chipStatus.textContent = roundState.label;
        chipStatus.title = roundState.label;
        chipStatus.classList.toggle("green", roundState.ok);
        chipTitle.title = ownPending ? `\u539F\u55AE ${ownPending.side} ${money(ownPending.amount)}\uFF0C${ownPending.staking === "flat" ? "\u5E73\u6CE8" : `\u7B2C${ownPending.level + 1}\u968E`}` : `\u4E0B\u4E00\u6CE8\u9810\u89BD\uFF1A\u57FA\u672C ${money(previewBase)}\uFF0C${stakingMode() === "flat" ? "\u5E73\u6CE8" : `\u7B2C${amountLevel(String(c.tableId), previewScope) + 1}\u968E`}`;
        chip.append(chipTitle, chipStatus);
        chip.onclick = () => showPage("logs");
        q("table-strip").append(chip);
      }
      if (!chosen.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = manualSelection ? "\u7B49\u5F85\u6307\u5B9A\u684C\u53F0\u958B\u653E\u4E0B\u6CE8" : "\u81EA\u52D5\u627E\u684C\u4E2D \xB7 \u6709\u53EF\u4E0B\u6CE8\u684C\u5C31\u52A0\u5165";
        q("tables").append(empty);
      }
      q("compact-stop").classList.toggle("live", running);
      q("compact-stop").textContent = running ? "\u25A0 \u505C\u6B62\u81EA\u52D5\u4E0B\u6CE8" : "\u25B6 \u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8";
      if (!q("report-shell").hidden) renderReport();
      fitPanel();
    }
    q("scan").onclick = scan;
    q("count").onchange = () => selectCount(q("count").value);
    q("parallel-count").onchange = () => selectCount(q("parallel-count").value);
    function requestStart(testOnce = false) {
      if (running || busy) return;
      riskApproved = false;
      riskTestOnce = testOnce;
      riskReturnFocus = shadow.activeElement;
      q("risk-doubling-warning").hidden = stakingMode() !== "doubling";
      q("risk-doubling-warning").textContent = `\u4F7F\u7528\u500D\u6295\u6CD5\uFF0C\u8ACB\u8A2D\u5B9A\u6B62\u76C8\u8207\u6B62\u640D\u3002${!q("take-profit").value || !q("stop-loss").value ? "\u76EE\u524D\u6B62\u76C8\uFF0F\u6B62\u640D\u5C1A\u672A\u5168\u90E8\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u81F3\u8A2D\u5B9A\u9801\u78BA\u8A8D\u3002" : "\u8ACB\u78BA\u8A8D\u76EE\u524D\u6B62\u76C8\u8207\u6B62\u640D\u91D1\u984D\u7B26\u5408\u4F60\u7684\u8A2D\u5B9A\u3002"}`;
      q("risk-time-summary").textContent = (() => {
        try {
          const n = parseDurationMinutes(q("duration-minutes").value);
          return n ? `\u81EA\u52D5\u505C\u6B62\uFF1A${n} \u5206\u9418\uFF0C\u78BA\u8A8D\u958B\u59CB\u5F8C\u8A08\u6642` : "\u81EA\u52D5\u505C\u6B62\uFF1A\u4E0D\u9650\u6642\uFF1B\u78BA\u8A8D\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u4F7F\u7528\u6642\u9593";
        } catch (e) {
          return e.message;
        }
      })();
      q("risk-stake-summary").textContent = `${startMode === "fresh" ? "\u65B0\u958B\u59CB\uFF1A\u9996\u7B46\u57FA\u672C\u984D" : "\u7E8C\u63A5\uFF1A\u6CBF\u7528\u914D\u6CE8\u968E\u7D1A"} \xB7 \u57FA\u672C ${q("base").value} \xB7 ${stakingMode() === "flat" ? "\u5E73\u6CE8" : stakingMode() === "doubling" ? "\u500D\u6295 1\u21922\u21924\u21928" : `\u99AC\u4E01 1\u21923\u21927\u219215`}`;
      q("ack").checked = false;
      q("risk-confirm").disabled = true;
      q("risk-dialog").hidden = false;
      fitPanel();
      q("ack").focus();
    }
    function cancelRisk() {
      q("risk-dialog").hidden = true;
      riskApproved = false;
      fitPanel();
      riskReturnFocus?.focus();
    }
    q("ack").onchange = () => {
      q("risk-confirm").disabled = !q("ack").checked;
    };
    q("risk-cancel").onclick = cancelRisk;
    q("risk-confirm").onclick = () => {
      if (!q("ack").checked) return;
      riskApproved = true;
      q("risk-dialog").hidden = true;
      start(riskTestOnce);
      if (running) showPage("overview");
    };
    q("risk-dialog").onkeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelRisk();
      }
      if (e.key === "Tab") {
        const targets = [q("ack"), q("risk-cancel"), ...!q("risk-confirm").disabled ? [q("risk-confirm")] : []];
        const at = targets.indexOf(shadow.activeElement);
        e.preventDefault();
        targets[(at + (e.shiftKey ? -1 : 1) + targets.length) % targets.length].focus();
      }
    };
    q("start").onclick = () => requestStart();
    q("once").onclick = () => requestStart(true);
    q("stop").onclick = () => stop();
    q("stop-now").onclick = () => {
      if (running) stop();
      else requestStart();
    };
    q("nav-overview").onclick = () => showPage("overview");
    q("nav-settings").onclick = () => showPage("settings");
    q("nav-logs").onclick = () => showPage("logs");
    q("edit-rooms").onclick = () => showRooms();
    function showRooms() {
      renderRooms();
      q("rooms-hint").textContent = selectionLocked() ? "\u5F85\u4E0B\u6CE8\u5B8C\u6210\u7D50\u7B97\u5F8C\u624D\u80FD\u6539\u9078\u3002" : `\u76EE\u524D\u9078 ${selected.size} \u684C\uFF1B\u53D6\u6D88\u4E00\u684C\u5F8C\u53EF\u66F4\u63DB\u3002`;
      showPage("rooms");
    }
    q("auto-tables").onclick = () => {
      if (selectionLocked()) return;
      manualSelection = false;
      selected.clear();
      scan();
      render();
    };
    q("choose-tables").onclick = showRooms;
    q("rooms-back").onclick = () => showPage("overview");
    q("hero-status").onclick = () => showPage("logs");
    q("hero-status").onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showPage("logs");
      }
    };
    q("single-staking").onchange = () => {
      if (roomCount !== "1" || selectionLocked()) {
        q("single-staking").value = stakingMode();
        return;
      }
      const value = q("single-staking").value;
      if (value !== "flat" && value !== "martingale" && value !== "doubling") return;
      singleStaking = value;
      scope = desiredScope();
      render();
    };
    function setZoom(value) {
      userZoom = Math.max(0.7, Math.min(1.8, value));
      q("zoom").value = String(Math.round(userZoom * 100));
      fitPanel();
    }
    q("duration-minutes").oninput = render;
    q("zoom").oninput = () => setZoom(Number(q("zoom").value) / 100);
    function setMini(value) {
      if (value === mini) return;
      if (value) {
        miniPreviousCompact = compact;
        compact = true;
      } else compact = miniPreviousCompact;
      mini = value;
      q("panel").classList.toggle("mini", mini);
      q("panel").classList.toggle("compact", compact);
      q("zoom-out").setAttribute("aria-label", mini ? "\u5C55\u958B\u5B8C\u6574\u9762\u677F" : "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
      q("zoom-out").title = mini ? "\u5C55\u958B\u5B8C\u6574\u9762\u677F" : "\u5207\u63DB\u8FF7\u4F60\u9762\u677F";
      q("mini-label").textContent = mini ? "\u5C55\u958B" : "\u8FF7\u4F60";
      q("zoom-out").querySelector("path").setAttribute("d", mini ? "M5 9V5h4 M15 5h4v4 M19 15v4h-4 M9 19H5v-4" : "M5 12h14");
      if (mini) showPage("overview");
      render();
    }
    q("zoom-in").onclick = () => {
      if (mini) setMini(false);
      else setZoom(userZoom + 0.1);
    };
    q("zoom-out").onclick = () => setMini(!mini);
    for (const id of ["base", "cap", "scope", "range-min", "range-max"]) q(id).oninput = render;
    q("start-mode").onchange = () => {
      if (running || busy) {
        q("start-mode").value = startMode;
        return;
      }
      startMode = q("start-mode").value;
      render();
    };
    q("provider").oninput = q("provider").onchange = () => {
      provider = q("provider").value;
      render();
    };
    q("hide").onclick = () => setMini(true);
    q("hide").title = "\u5207\u63DB\u8FF7\u4F60\u9762\u677F";
    q("hide").setAttribute("aria-label", "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
    function openReport() {
      q("report-shell").hidden = false;
      renderReport();
      fitPanel();
    }
    function renderReport() {
      const perPage = 6;
      const records = reportTab === "bets" ? periodBets(ledger.state.bets, reportPeriod).slice().reverse() : [];
      const pages = Math.max(1, Math.ceil(records.length / perPage));
      reportPage = Math.max(0, Math.min(reportPage, pages - 1));
      q("report-body").replaceChildren();
      const fmtTime = (at) => new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(at);
      for (const [i, b] of records.slice(reportPage * perPage, (reportPage + 1) * perPage).entries()) {
        const card = boards().find((c) => String(c.tableId) === b.tableId);
        const labels = { reserved: "\u6E96\u5099\u4E2D", submitted: "\u5F85\u63A5\u53D7", accepted: "\u5F85\u7D50\u7B97", rejected: "\u62D2\u7D55", uncertain: "\u672A\u78BA\u5B9A", settled: "\u5DF2\u7D50\u7B97", aborted: "\u672A\u9001\u51FA" };
        const row = document.createElement("article");
        row.className = "report-card";
        const head2 = document.createElement("div");
        head2.className = "report-card-head";
        const title = document.createElement("strong");
        title.textContent = `${card?.gameInfo.tableName ?? b.tableId} \xB7 ${b.side}`;
        const state = document.createElement("span");
        state.className = "report-state";
        state.textContent = labels[b.state];
        head2.append(title, state);
        const values = document.createElement("div");
        values.className = "report-values";
        const stake = document.createElement("span");
        stake.textContent = `\u4E0B\u6CE8 ${money(b.amount)}`;
        const result = document.createElement("strong");
        result.textContent = b.pnl == null ? "\u640D\u76CA\u5F85\u5B9A" : `\u640D\u76CA ${b.pnl > 0 ? "+" : ""}${money(b.pnl)}`;
        if (b.pnl) result.className = b.pnl > 0 ? "green" : "red";
        values.append(stake, result);
        const time = document.createElement("div");
        time.className = "report-card-time";
        time.textContent = `\u4E0B\u6CE8 ${fmtTime(b.createdAt)}`;
        row.append(head2, values, time);
        q("report-body").append(row);
      }
      q("report-empty").hidden = records.length > 0;
      q("report-empty").textContent = reportTab === "transactions" ? "\u5C1A\u672A\u63A5\u5165\u5E73\u53F0\u5B58\u63D0\uFF0F\u8F49\u5E33\u8CC7\u6599\uFF0C\u4E0D\u6703\u7528\u4E0B\u6CE8\u7D00\u9304\u5192\u5145\u4EA4\u6613\u8A18\u9304" : "\u6B64\u671F\u9593\u5C1A\u7121\u4E0B\u6CE8\u8A18\u9304";
      q("report-note").textContent = "\u672C\u5DE5\u5177\u8A18\u9304\u7684\u4E0B\u6CE8\u8207\u7D50\u679C";
      q("report-total").textContent = `${records.length} \u7B46 \xB7 \u4E0B\u6CE8 ${money(records.reduce((a, b) => a + b.amount, 0))} \xB7 \u5DF2\u7D50\u7B97\u640D\u76CA ${money(records.reduce((a, b) => a + (b.pnl ?? 0), 0))}`;
      q("report-page").textContent = `${reportPage + 1} / ${pages}`;
      q("report-bets").classList.toggle("selected", reportTab === "bets");
      q("report-transactions").classList.toggle("selected", reportTab === "transactions");
      for (const period of ["today", "yesterday", "week"]) q("report-" + period).classList.toggle("selected", period === reportPeriod);
    }
    q("nav-mode").onclick = () => {
      compact = !compact;
      q("panel").classList.toggle("compact", compact);
      q("brand-count").textContent = "\u767E\u5BB6\u5DE5\u7A0B\u5E2B";
      showPage("overview");
      render();
    };
    q("official-refresh").onclick = () => official.refresh(true);
    q("open-records").onclick = q("open-report").onclick = openReport;
    q("compact-stop").onclick = () => q("stop-now").click();
    q("close-report").onclick = () => {
      q("report-shell").hidden = true;
      showPage("overview");
    };
    for (const period of ["today", "yesterday", "week"]) q("report-" + period).onclick = () => {
      reportPeriod = period;
      reportPage = 0;
      renderReport();
    };
    q("report-bets").onclick = () => {
      reportTab = "bets";
      reportPage = 0;
      renderReport();
    };
    q("report-transactions").onclick = () => {
      reportTab = "transactions";
      reportPage = 0;
      renderReport();
    };
    q("report-prev").onclick = () => {
      reportPage--;
      renderReport();
    };
    q("report-next").onclick = () => {
      reportPage++;
      renderReport();
    };
    q("report-lobby").onchange = q("report-game").onchange = () => {
      reportPage = 0;
      renderReport();
    };
    let drag = null;
    const head = q("head");
    head.onpointerdown = (e) => {
      if (e.target.closest("button,input,select")) return;
      const box = host.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: box.left, top: box.top };
      head.setPointerCapture?.(e.pointerId);
    };
    head.onpointermove = (e) => {
      if (!drag) return;
      const fit = parseFloat(host.style.getPropertyValue("--fit")) || 1;
      const left = Math.max(0, Math.min(window.innerWidth - (mini ? 210 : panelWidth) * fit, drag.left + e.clientX - drag.x));
      const top = Math.max(0, Math.min(window.innerHeight - 50, drag.top + e.clientY - drag.y));
      host.style.left = left + "px";
      host.style.top = top + "px";
      host.style.right = "auto";
      for (const id of ["panel", "risk-dialog", "report-shell"]) {
        q(id).style.transformOrigin = "top left";
        if (id !== "panel") {
          q(id).style.left = "0";
          q(id).style.right = "auto";
        }
      }
    };
    head.onpointerup = head.onpointercancel = head.onlostpointercapture = () => {
      drag = null;
    };
    const cleanupResize = installDgPanelResize([q("resize-panel"), q("resize-report")], {
      getSize: () => ({ width: panelWidth, height: Math.min(panelHeight, parseFloat(host.style.getPropertyValue("--full-height")) || panelHeight), scale: parseFloat(host.style.getPropertyValue("--fit")) || 1 }),
      prepare: (target) => {
        const box = target.getBoundingClientRect();
        host.style.left = box.left + "px";
        host.style.top = box.top + "px";
        host.style.right = "auto";
        for (const id of ["panel", "risk-dialog", "report-shell"]) {
          q(id).style.transformOrigin = "top left";
          if (id !== "panel") {
            q(id).style.left = "0";
            q(id).style.right = "auto";
          }
        }
      },
      apply: (width, height) => {
        panelWidth = Math.round(width);
        panelHeight = Math.round(height);
        fitPanel();
      }
    });
    window.addEventListener("resize", fitPanel);
    fitPanel();
    function visibility() {
      if (document.hidden) stop("\u9801\u9762\u9032\u5165\u80CC\u666F\uFF0C\u5DF2\u505C\u6B62\u65B0\u589E\u64CD\u4F5C\uFF1B\u8FD4\u56DE\u5F8C\u9700\u624B\u52D5\u958B\u59CB");
    }
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(() => void tick(), 500);
    window.__DG_SINGLEPAGE__ = {
      version: "3.2.2-mobile-v329-native",
      start: () => requestStart(),
      stop,
      scan,
      stakeDiagnostics,
      officialTurnover: official.view,
      refreshOfficialTurnover: () => official.refresh(true),
      mobileDiagnostics: () => inspectDgMobileNativeSurface(window),
      runtimeDiagnostics: () => describeDgScene(nodes()),
      exportMobilePublicSources: () => exportDgMobileLoadedPublicScripts(document),
      status: () => ({ running, status, usage: sessionTimer.view(), mini, base, startMode, selectionMode: manualSelection ? "manual" : "auto", panelSize: { width: panelWidth, height: panelHeight }, pending: ledger.pending().map((b) => ({ ...b })), selected: [...selected], roomCount, scope, staking: stakingMode(), riskLimits: { ...riskLimits }, roundPnl: roundPnl(), unacknowledgedFunds: unacknowledgedFunds() }),
      rounds: () => boards().filter((c) => selected.has(String(c.tableId))).map((c) => ({ table: c.gameInfo.tableName, round: c.gameInfo.playId, ...currentRoundState(c) })),
      diagnostics: () => boards().map((c) => ({ table: c.gameInfo?.tableName || String(c.tableId), tableId: String(c.tableId), selected: selected.has(String(c.tableId)), round: c.gameInfo?.playId, gameState: c.gameInfo?.stateId, countdown: Math.floor(remaining(c)), ready: ready(c), ...checkDgAmount(c, stakeAmount(String(c.tableId))) })),
      exportLedger: () => JSON.parse(JSON.stringify(ledger.state)),
      analysis: (tableId) => {
        const c = boards().find((n) => String(n.tableId) === String(tableId));
        return c ? provider === "counting" || provider === "parity" ? strategyFor(c).reason || "\u7B49\u5F85\u5BE6\u969B\u724C\u5F35" : providerAnalysisText(provider, { results: roads(c) }) : "\u672A\u627E\u5230\u684C\u53F0";
      },
      dispose: () => {
        sessionTimer.stop();
        running = false;
        disposed = true;
        epoch++;
        clearInterval(timer);
        official.dispose();
        cleanupFeedback();
        cleanupTouchScroll();
        cleanupResize();
        providerMenu.cleanup();
        socket?.off("RECEIVED_SUCCESS", owner, onMessage);
        if (socket?.sendData === sendObserver) socket.sendData = originalSend;
        document.removeEventListener("visibilitychange", visibility);
        window.removeEventListener("resize", fitPanel);
        persist();
        host.remove();
      }
    };
    attach(nodes());
    scan();
    showPage("overview");
    official.refresh();
    render();
  })();
})();
