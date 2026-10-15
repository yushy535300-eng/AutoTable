#!/usr/bin/env node
/*
 * Offline-only regression test. It creates synthetic mobile V3.2.9 cards in
 * Chromium, blocks every browser network path, and never logs in or contacts DG.
 */
"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const { chromium } = playwright;
const mobileBuilders = require("../tests/fixtures/dg-mobile-v329-builders.cjs");

const root = path.resolve(__dirname, "..");
const productionBundle = path.join(root, "public", "dg-direct-bet-console.js");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function packets(state) {
  return state.sent.filter((message) => Number(message?.cmd) === 6);
}

function packetPayload(packet) {
  assert.equal(packet.cmd, 6, "the native mobile builder must produce cmd 6");
  assert.equal(packet.token, "offline", "fixture token is the literal offline marker");
  assert.equal(packet.type, 1, "the native mobile builder preserves type 1");
  assert.equal(packet.list.length, 3, "the native mobile builder has its original three-list layout");
  assert.equal(packet.list[0], "1", "limitInfo[gameId] is used as the native limit id");
  const payload = JSON.parse(packet.list[2]); // stubbed getBetEncryptInfo deliberately returns JSON, not ciphertext
  assert.equal(typeof payload.info, "string", "native builder includes its info JSON before a receipt is made");
  // ei and Ki have different captured obfuscated constants (1 and 6); neither is rewritten by the test harness.
  assert([1, 6].includes(Number(JSON.parse(payload.info).betType)), "native builder retains an original V3.2.9 bet type");
  return payload;
}

function packetAmount(packet) {
  const payload = packetPayload(packet);
  const amount = Number(payload.banker ?? 0) + Number(payload.banker6 ?? 0) + Number(payload.player ?? 0);
  assert.equal(amount, 100, "packet payload represents the requested fixture stake before receipt conversion");
  return payload;
}

async function openOfflinePage(browser, cards) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route("**/*", (route) => route.abort()); // no HTTP(S), assets, or platform endpoints
  await page.addInitScript(() => {
    window.fetch = () => Promise.reject(new Error("offline mobile fixture: fetch blocked"));
    window.WebSocket = class OfflineBlockedWebSocket {
      constructor() { throw new Error("offline mobile fixture: WebSocket blocked"); }
    };
  });
  await page.setContent("<!doctype html><html><head></head><body><main>offline fixture</main></body></html>");
  await page.evaluate(({ cards: cardSpecs, builders }) => {
    const sent = [];
    const listeners = new Map();
    const nativeCalls = [];
    const socket = {
      socket: { connected: true },
      on(name, owner, handler) {
        // Laya overload: on(event, owner, handler); preserve every subscription.
        if (typeof owner === "function" && handler === undefined) handler = owner;
        if (typeof handler !== "function") throw new TypeError("offline socket listener must be a function");
        const list = listeners.get(name) || [];
        list.push({ owner, handler });
        listeners.set(name, list);
      },
      off(name, owner, handler) {
        if (typeof owner === "function" && handler === undefined) handler = owner;
        listeners.set(name, (listeners.get(name) || []).filter((entry) => entry.owner !== owner || entry.handler !== handler));
      },
      sendData(message) {
        // This is a local array only; it does not send to any network or platform.
        sent.push(message);
        return true;
      }
    };
    const playerInfo = {
      socketMan: socket,
      limitInfo: { 1: 1 },
      playerName: "offline",
      secretkey: "offline",
      token: "offline",
      balance: 20000
    };
    const m = { MultiBaccaratType: ["Banker", "Player"] };
    const r = { BET_CHIP: "BET_CHIP" };
    const g = {
      getVerifyInfo(value, secret) {
        nativeCalls.push({ kind: "verify", value, secret });
        return JSON.stringify({ fixture: "verify", value, secret: "offline" });
      },
      getBetEncryptInfo(secret, payload) {
        // Recorded plaintext fixture payload: deliberately parsable, never encrypted.
        nativeCalls.push({ kind: "encrypt", secret, payload });
        if (window.__testBuilderAdvance) { window.__testOffset += window.__testBuilderAdvance; window.__testBuilderAdvance = 0; }
        return payload;
      }
    };
    const md5 = (value) => {
      nativeCalls.push({ kind: "md5", value });
      return JSON.stringify({ fixture: "md5", value });
    };
    const fingerprint = (fn) => {
      const source = Function.prototype.toString.call(fn).replace(/^function\s+/, "").replace(/\s+/g, "");
      let hash = 2166136261;
      for (let i = 0; i < source.length; i += 1) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
      return `${source.length}:${(hash >>> 0).toString(16)}`;
    };
    const make = (spec) => {
      const method = builders[spec.method || "ei"];
      // Keep the exact fixture method text as a class method. The production source
      // fingerprint intentionally rejects lookalikes, so do not wrap it here.
      const NativeCard = Function("m", "g", "r", "md5", `return class NativeCard { ${method} }`)(m, g, r, md5);
      const card = new NativeCard();
      const hoverCalls = [];
      const bankerHideHover = function nativeBankerHideHover() { hoverCalls.push("Banker"); };
      const playerHideHover = function nativePlayerHideHover() { hoverCalls.push("Player"); };
      const id = String(spec.id);
      card.tableId = id;
      card.limitId = 1;
      card.playerInfo = playerInfo;
      card.visible = spec.hidden ? false : true;
      card.gameInfo = {
        stateId: 1,
        countDown: spec.countDown == null ? 20 : spec.countDown,
        starTime: Date.now(),
        shoeId: 14,
        playId: spec.playId == null ? 40 : spec.playId,
        gameNo: spec.gameNo || `shoe14-${id}-40`,
        gameId: 1,
        tableName: spec.tableName || "RB02",
        goodRoadType: 1,
        roadArray: [{ road: [1] }, { road: [5] }, { road: [1] }, { road: [5] }],
        baccaratLimit: { bpMin: 100, bpMax: 100000 }
      };
      card.baccaratLimit = { bpMin: 100, bpMax: 100000 };
      card.betBtn = {
        Banker: { visible: true, mouseEnabled: !spec.disabled, hideHover: bankerHideHover },
        Player: { visible: true, mouseEnabled: !spec.disabled, hideHover: playerHideHover }
      };
      card.betBtnMan = {
        betFlag: spec.managerDisabled ? false : true,
        visible: false,
        confirmBtn: { event() {} },
        cancelBtn: { event() {} }
      };
      card.betMoneyTmp = { Banker: 0, Player: 0 };
      card.betMoneyTrue = { Banker: 0, Player: 0 };
      // Real V3.2.9 mobile cards deliberately have neither desktop betFlag nor betMan.
      if (spec.unknownSource) card.confirmBet = function unverifiedSameShapeConfirmBet() { throw new Error("unknown mobile builder must never be called"); };
      card.__fixture = { id, method: spec.method || "ei", hoverCalls, bankerHideHover, playerHideHover, fingerprint: fingerprint(card.confirmBet) };
      return card;
    };
    const cards = cardSpecs.map(make);
    const stage = {
      playerInfo,
      numChildren: cards.length,
      getChildAt(index) { return cards[index] || null; },
      _children: cards
    };
    const emit = (name, message) => {
      for (const { handler } of [...(listeners.get(name) || [])]) handler(message);
    };
    window.Laya = { stage, Browser: { now: () => Date.now() } };
    window.__offlineMobile = { sent, listeners, nativeCalls, socket, playerInfo, cards, stage, emit, fingerprint };
  }, { cards, builders: mobileBuilders });
  await page.addScriptTag({ path: productionBundle });
  return page;
}

async function configure(page, { count, staking = "flat" }) {
  await page.evaluate(({ count, staking }) => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    if (!shadow) throw new Error("production panel did not mount");
    const set = (id, value) => {
      const node = shadow.getElementById(id);
      if (!node) throw new Error(`missing production control ${id}`);
      node.value = value;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof node.onchange === "function") node.onchange();
    };
    set("count", count);
    if (count === "1") set("single-staking", staking);
    window.__DG_SINGLEPAGE__.scan();
  }, { count, staking });
}

async function approveAndStart(page) {
  await page.evaluate(() => window.__DG_SINGLEPAGE__.start());
  await page.evaluate(() => {
    const shadow = document.querySelector("#__dg_singlepage_panel__").shadowRoot;
    shadow.getElementById("ack").click();
    shadow.getElementById("risk-confirm").click();
  });
}

async function waitForCmd6(page, count, label) {
  await page.waitForFunction((wanted) => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length >= wanted, count, { timeout: 4000 });
  const actual = await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length);
  assert.equal(actual, count, label);
}

async function stopAndClose(page) {
  try { await page.evaluate(() => window.__DG_SINGLEPAGE__?.dispose()); } finally { await page.close(); }
}

async function testFlatCounts(browser) {
  for (const count of ["1", "3", "5", "all"]) {
    const eightCards = Array.from({ length: 8 }, (_, index) => ({ id: 201 + index, method: index % 2 ? "Ki" : "ei", tableName: `RB${String(index + 2).padStart(2, "0")}` }));
    const page = await openOfflinePage(browser, eightCards);
    try {
      await configure(page, { count, staking: "flat" });
      const expected = count === "all" ? 8 : Number(count);
      const before = await page.evaluate(() => ({
        selected: window.__DG_SINGLEPAGE__.status().selected.length,
        cards: window.__offlineMobile.cards.map((card) => ({
          noDesktopBetFlag: !Object.hasOwn(card, "betFlag"),
          noDesktopBetMan: !Object.hasOwn(card, "betMan"),
          managerFlag: card.betBtnMan.betFlag,
          managerVisible: card.betBtnMan.visible,
          banker: card.betBtn.Banker.hideHover === card.__fixture.bankerHideHover,
          player: card.betBtn.Player.hideHover === card.__fixture.playerHideHover,
          fingerprint: card.__fixture.fingerprint
        }))
      }));
      assert.equal(before.selected, expected, `${count} selection uses only the requested number of the eight staged cards`);
      assert(before.cards.every((card) => card.noDesktopBetFlag && card.noDesktopBetMan), "fixture has mobile, not desktop, controls");
      assert(before.cards.every((card) => card.managerFlag && !card.managerVisible && card.banker && card.player), "native buttons and manager start untouched");
      assert.deepEqual([...new Set(before.cards.map((card) => card.fingerprint))].sort(), ["1443:b3416a14", "1517:2faa00b2"], "fixture class method text retains both production V3.2.9 fingerprints");

      await approveAndStart(page);
      await waitForCmd6(page, expected, `${count} staged mobile cards submit exactly once each`);
      await sleep(650);
      const state = await page.evaluate(() => ({
        sent: window.__offlineMobile.sent,
        calls: window.__offlineMobile.nativeCalls,
        cards: window.__offlineMobile.cards.map((card) => ({
          hoverCalls: [...card.__fixture.hoverCalls],
          managerFlag: card.betBtnMan.betFlag,
          managerVisible: card.betBtnMan.visible,
          bankerUnchanged: card.betBtn.Banker.hideHover === card.__fixture.bankerHideHover,
          playerUnchanged: card.betBtn.Player.hideHover === card.__fixture.playerHideHover
        })),
        ledger: window.__DG_SINGLEPAGE__.exportLedger()
      }));
      assert.equal(packets(state).length, expected, `${count} same-game cards are never resent before a receipt`);
      for (const packet of packets(state)) {
        const payload = packetAmount(packet);
        assert.equal(Number(payload.banker ?? 0) + Number(payload.banker6 ?? 0) + Number(payload.player ?? 0), 100, `${count} mode remains fixed at 100`);
      }
      assert(state.ledger.bets.every((bet) => bet.amount === 100 && bet.staking === "flat" && bet.state === "submitted"), `${count} mode is fixed-stake in the production ledger`);
      assert.equal(state.calls.filter((call) => call.kind === "verify").length, expected, "each local packet made one recorded verify stub call");
      assert.equal(state.calls.filter((call) => call.kind === "encrypt").length, expected, "each local packet made one recorded JSON payload stub call");
      assert(state.calls.every((call) => !Object.hasOwn(call, "secret") || call.secret === "offline"), "all stubs receive only the literal offline secret marker");
      assert(state.cards.every((card) => card.hoverCalls.length === 0 && card.managerFlag && !card.managerVisible && card.bankerUnchanged && card.playerUnchanged), "detached packet build does not call or replace real mobile button spies or mutate the real manager");
    } finally {
      await stopAndClose(page);
    }
  }
}

async function testExclusions(browser) {
  const page = await openOfflinePage(browser, [
    { id: 401, method: "ei", tableName: "RB02" },
    { id: 402, method: "Ki", tableName: "RB03", unknownSource: true }
  ]);
  try {
    await configure(page, { count: "all", staking: "flat" });
    const initial = await page.evaluate(() => ({ selected: window.__DG_SINGLEPAGE__.status().selected, source: window.__offlineMobile.cards[1].__fixture.fingerprint }));
    assert.equal(initial.selected.length, 1, "same-shape card with an unknown native source is excluded from selection");
    assert.notEqual(initial.source, "1517:2faa00b2", "unverified lookalike does not carry an accepted source fingerprint");
    await approveAndStart(page);
    await waitForCmd6(page, 1, "only the exact-source mobile card is sent");
    await sleep(650);
    const state = await page.evaluate(() => ({ sent: window.__offlineMobile.sent, unknownHover: window.__offlineMobile.cards[1].__fixture.hoverCalls.length }));
    assert.equal(packets(state).length, 1, "unknown-source same-shape card remains excluded on later ticks");
    assert.equal(String(packets(state)[0].tableId), "401", "packet cannot originate from the lookalike card");
    assert.equal(state.unknownHover, 0, "unknown card's native controls are never touched");
  } finally {
    await stopAndClose(page);
  }

  const blocked = await openOfflinePage(browser, [
    { id: 411, method: "ei", managerDisabled: true },
    { id: 412, method: "Ki", hidden: true },
    { id: 413, method: "ei", disabled: true },
    { id: 414, method: "Ki", countDown: 5 }
  ]);
  try {
    await configure(blocked, { count: "all", staking: "flat" });
    await approveAndStart(blocked);
    await sleep(850);
    const state = await blocked.evaluate(() => ({ sent: window.__offlineMobile.sent, diagnostic: window.__DG_SINGLEPAGE__.diagnostics() }));
    assert.equal(packets(state).length, 0, "manager betFlag=false, hidden, disabled, and countdown<6 cards never send cmd 6");
    assert(state.diagnostic.some((entry) => entry.tableId === "411" && !entry.ready), "mobile manager betFlag=false blocks readiness");
    assert(state.diagnostic.some((entry) => entry.tableId === "413" && !entry.ready), "disabled native bet button blocks readiness");
    assert(state.diagnostic.some((entry) => entry.tableId === "414" && !entry.ready), "countdown under six seconds blocks readiness");
  } finally {
    await stopAndClose(blocked);
  }
}

async function testReceiptSettlementAndDoubling(browser) {
  const page = await openOfflinePage(browser, [{ id: 501, method: "Ki", tableName: "RB02", gameNo: "shoe14-501-40", playId: 40 }]);
  try {
    await configure(page, { count: "1", staking: "doubling" });
    const listenerCount = await page.evaluate(() => (window.__offlineMobile.listeners.get("RECEIVED_SUCCESS") || []).length);
    assert(listenerCount >= 2, "report watcher and auto lifecycle subscribe independently; neither overwrites the other");
    await approveAndStart(page);
    await waitForCmd6(page, 1, "single mobile card emits its first native packet");
    const first = await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6)[0]);
    const firstPayload = packetAmount(first);
    assert.equal(Number(firstPayload.banker ?? 0) + Number(firstPayload.banker6 ?? 0) + Number(firstPayload.player ?? 0), 100, "first doubling stake is 100");

    // Same game has a submitted ledger record; neither extra ticks nor a changed live card may advance it.
    await sleep(700);
    assert.equal(await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length), 1, "same game is not resent before receipt");
    await page.evaluate(() => {
      const card = window.__offlineMobile.cards[0];
      card.gameInfo.gameNo = "shoe14-501-41";
      card.gameInfo.playId = 41;
    });
    await sleep(700);
    assert.equal(await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length), 1, "a new displayed game cannot advance while cmd 6 lacks matching success/settlement");

    const receipt = JSON.parse(JSON.stringify(first));
    const receiptBody = JSON.parse(receipt.list[2]);
    delete receiptBody.info; // receipt parser reads list[0]; native request list[2] keeps info.
    receipt.codeId = 0;
    receipt.list = [JSON.stringify(receiptBody)];
    await page.evaluate((message) => window.__offlineMobile.emit("RECEIVED_SUCCESS", message), receipt);
    await sleep(100);
    let ledger = await page.evaluate(() => window.__DG_SINGLEPAGE__.exportLedger());
    assert.equal(ledger.bets[0].state, "accepted", "only matching cmd 6 JSON receipt accepts the first stake");
    await sleep(700);
    assert.equal(await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length), 1, "accepted but unsettled cmd 6 still prevents progression");

    await page.evaluate((message) => window.__offlineMobile.emit("RECEIVED_SUCCESS", message), { cmd: 1007, codeId: 0, tableId: first.tableId, gameNo: first.gameNo, dList: [0, -100] });
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length === 2, null, { timeout: 4000 });
    const two = await page.evaluate(() => ({
      sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6),
      ledger: window.__DG_SINGLEPAGE__.exportLedger()
    }));
    assert.equal(two.ledger.bets[0].state, "settled", "matching cmd 1007 settles only the accepted first packet");
    assert.equal(two.ledger.bets[0].pnl, -100, "offline settlement loss is recorded exactly");
    const secondPayload = packetPayload(two.sent[1]);
    assert.equal(Number(secondPayload.banker ?? 0) + Number(secondPayload.banker6 ?? 0) + Number(secondPayload.player ?? 0), 200, "single-table doubling advances to 200 only after accepted settlement");
    assert.equal(two.ledger.bets[1].amount, 200, "production ledger also records the 200 doubling amount");

    await page.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    const beforeStop = await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length);
    await page.evaluate(() => {
      const card = window.__offlineMobile.cards[0];
      card.gameInfo.gameNo = "shoe14-501-42";
      card.gameInfo.playId = 42;
    });
    await sleep(750);
    assert.equal(await page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length), beforeStop, "stop produces zero additional cmd 6 packets");
  } finally {
    await stopAndClose(page);
  }
}

async function testManualAttribution(browser) {
  const mixed = await openOfflinePage(browser, [{id:601,method:'ei',tableName:'RB02'}]);
  try {
    await configure(mixed,{count:'1',staking:'flat'});
    await mixed.evaluate(()=>window.__offlineMobile.cards[0].betMoneyTmp.Banker=100);
    await approveAndStart(mixed);
    await sleep(750);
    assert.equal(await mixed.evaluate(()=>window.__offlineMobile.sent.filter(message=>Number(message.cmd)===6).length),0,'manual pending chips must never be mixed into a tool packet');
    assert.equal(await mixed.evaluate(()=>window.__DG_SINGLEPAGE__.exportLedger().bets.length),0,'manual chips must not be attributed to the tool ledger');
  } finally { await stopAndClose(mixed); }

  const extra = await openOfflinePage(browser,[{id:602,method:'Ki',tableName:'RB05'}]);
  try {
    await configure(extra,{count:'1',staking:'doubling'});await approveAndStart(extra);await waitForCmd6(extra,1,'first packet before simulated manual addition');
    const first=await extra.evaluate(()=>window.__offlineMobile.sent.find(message=>Number(message.cmd)===6));
    await extra.evaluate(message=>window.__offlineMobile.socket.sendData({...message,list:['manual-addition-offline']}),first);
    const stopped=await extra.evaluate(()=>({status:window.__DG_SINGLEPAGE__.status(),ledger:window.__DG_SINGLEPAGE__.exportLedger()}));
    assert.equal(stopped.status.running,false);assert.equal(stopped.ledger.bets[0].state,'uncertain');assert.equal(stopped.ledger.bets[0].attributionUncertain,true);
    const payload=packetPayload(first);delete payload.info;
    await extra.evaluate(message=>window.__offlineMobile.emit('RECEIVED_SUCCESS',message),{cmd:6,codeId:0,tableId:first.tableId,gameNo:first.gameNo,list:[JSON.stringify(payload)]});
    await extra.evaluate(message=>window.__offlineMobile.emit('RECEIVED_SUCCESS',message),{cmd:1007,codeId:0,tableId:first.tableId,gameNo:first.gameNo,dList:[0,-100]});
    await extra.evaluate(()=>window.__offlineMobile.cards[0].gameInfo.gameNo='next-offline-game');await sleep(750);
    const end=await extra.evaluate(()=>({count:window.__offlineMobile.sent.filter(message=>Number(message.cmd)===6).length,ledger:window.__DG_SINGLEPAGE__.exportLedger()}));
    assert.equal(end.count,2,'only one tool packet plus the explicitly simulated manual packet, never a follow-up');
    assert.equal(end.ledger.bets[0].state,'uncertain','later single-stake receipt cannot remove mixed ownership evidence');
    assert.equal(end.ledger.levels.global||0,0,'mixed settlement cannot advance doubling');
  } finally { await stopAndClose(extra); }
}

module.exports = { openOfflinePage, configure, approveAndStart, waitForCmd6, stopAndClose, packetPayload };

if (require.main === module) {
let browser;
(async () => {
  assert.equal(typeof mobileBuilders.ei, "string", "ei fixture method is available");
  assert.equal(typeof mobileBuilders.Ki, "string", "Ki fixture method is available");
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  await testFlatCounts(browser);
  await testExclusions(browser);
  await testReceiptSettlementAndDoubling(browser);
  await testManualAttribution(browser);
  await browser.close();
  browser = null;
  console.log("PASS offline-only DG mobile V3.2.9 ei/Ki native builder lifecycle: source-gated cards, fixed multi-table stake, receipt/settlement lock, doubling, and permanent mixed-manual attribution lock (not a live-device or platform result)");
})().catch(async (error) => {
  try { await browser?.close(); } catch {}
  console.error(error.stack || error);
  process.exitCode = 1;
});

}
