#!/usr/bin/env node
/*
 * Offline-only regression coverage for DG native-card poker strategies.
 * It uses only synthetic RECEIVED_SUCCESS events and the exact public V3.2.9
 * fixture builders. Browser routing, fetch, and WebSocket are blocked; no
 * account, credential, raw packet, or token is persisted or printed.
 */
"use strict";

const assert = require("node:assert/strict");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const { chromium } = playwright;
const {
  openOfflinePage,
  configure,
  approveAndStart,
  stopAndClose,
  packetPayload
} = require("./test-dg-mobile-v329-complete.cjs");

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PREVIOUS_NATURAL = { player: "4-17", banker: "30-43" }; // 4,4 / 4,4: parity 閒; V38 counting 莊
const SECOND_NATURAL = { player: "4-17", banker: "4-5" }; // 4,4 / 4,5: parity 莊; V38 counting 閒
const TIED_COUNTING_NATURAL = { player: "1-7", banker: "2-5" }; // exactly 2 V38 votes each; no decision

function tablePacket(tableId, shoeId, playId, poker, extra = {}) {
  // `state` and `stateId` deliberately do not describe the card's current state.
  // The production tracker must key only on the explicit table/shoe/play identity
  // and the live card state, rather than guessing a raw state mapping.
  return { tableId, shoeId, playId, poker, state: 1, stateId: 1, ...extra };
}

async function setFixtureCards(page, configs) {
  await page.evaluate((specs) => {
    const byId = new Map(window.__offlineMobile.cards.map((card) => [String(card.tableId), card]));
    for (const spec of specs) {
      const card = byId.get(String(spec.id));
      if (!card) throw new Error(`fixture card ${spec.id} is missing`);
      card.gameInfo.shoeId = spec.shoe;
      card.gameInfo.playId = spec.playId;
      card.gameInfo.gameNo = spec.gameNo || `${spec.shoe}-${spec.id}-${spec.playId}`;
      card.gameInfo.stateId = spec.stateId == null ? 1 : spec.stateId;
      card.gameInfo.countDown = spec.countDown == null ? 120 : spec.countDown;
      card.gameInfo.starTime = Date.now();
      card.gameInfo.roadArray = Array.from({ length: spec.roadCount || 0 }, () => ({ road: [1] }));
      delete card.gameInfo.poker;
      card.betBtnMan.betFlag = true;
      card.betBtnMan.visible = false;
      card.betMoneyTmp.Banker = 0;
      card.betMoneyTmp.Player = 0;
      card.betMoneyTrue.Banker = 0;
      card.betMoneyTrue.Player = 0;
    }
  }, configs);
}

async function selectPokerProvider(page, provider, count = "all") {
  await configure(page, { count, staking: "flat" });
  await page.evaluate((key) => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    if (!shadow) throw new Error("production panel did not mount");
    const input = shadow.getElementById("provider");
    if (!input) throw new Error("missing provider selector");
    input.value = key;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof input.onchange === "function") input.onchange();
    window.__DG_SINGLEPAGE__.scan();
  }, provider);
}

async function emitReceivedTable(page, table) {
  await page.evaluate((entries) => {
    // This is a local event dispatch only. It is not a socket, HTTP request, or
    // persisted packet capture.
    window.__offlineMobile.emit("RECEIVED_SUCCESS", { cmd: 1007, codeId: 0, table: entries });
  }, table);
  // Let the production onMessage microtask re-read the current Laya cards.
  await page.evaluate(() => Promise.resolve());
}

async function commandPackets(page) {
  return page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6));
}

async function waitForPacketCount(page, expected, label) {
  await page.waitForFunction((wanted) => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length >= wanted, expected, { timeout: 4000 });
  await pause(700);
  assert.equal((await commandPackets(page)).length, expected, label);
}

function packetSide(packet) {
  const payload = packetPayload(packet);
  const banker = Number(payload.banker ?? 0) + Number(payload.banker6 ?? 0);
  const player = Number(payload.player ?? 0);
  assert.equal(Number(Boolean(banker)) + Number(Boolean(player)), 1, "native request must contain exactly one of Banker or Player");
  return banker ? "莊" : "閒";
}

async function formalAcceptance(page, packet) {
  const payload = packetPayload(packet);
  delete payload.info;
  await page.evaluate((receipt) => window.__offlineMobile.emit("RECEIVED_SUCCESS", receipt), {
    cmd: 6,
    codeId: 0,
    tableId: packet.tableId,
    gameNo: packet.gameNo,
    list: [JSON.stringify(payload)]
  });
}

async function formalSettlement(page, packet, pnl = -100) {
  await page.evaluate((receipt) => window.__offlineMobile.emit("RECEIVED_SUCCESS", receipt), {
    cmd: 1007,
    codeId: 0,
    tableId: packet.tableId,
    gameNo: packet.gameNo,
    dList: [0, pnl]
  });
}

async function ledger(page) {
  return page.evaluate(() => window.__DG_SINGLEPAGE__.exportLedger());
}

async function seedPreviousNaturals(page, rows) {
  await emitReceivedTable(page, rows.map((row) => tablePacket(row.id, row.shoe, row.playId - 1, row.poker)));
}

async function testFormulaSidesWithoutRoadGate(browser, provider, expectedSides) {
  const page = await openOfflinePage(browser, [
    { id: 801, method: "ei", tableName: "RB-A" },
    { id: 802, method: "Ki", tableName: "RB-B" }
  ]);
  try {
    await setFixtureCards(page, [
      { id: 801, shoe: "S-A", playId: 40, roadCount: 0 },
      { id: 802, shoe: "S-B", playId: 91, roadCount: 1 }
    ]);
    await seedPreviousNaturals(page, [
      { id: 801, shoe: "S-A", playId: 40, poker: PREVIOUS_NATURAL },
      { id: 802, shoe: "S-B", playId: 91, poker: SECOND_NATURAL }
    ]);
    await selectPokerProvider(page, provider, "all");
    await approveAndStart(page);
    await waitForPacketCount(page, 2, `${provider}: empty/one-road cards with complete prior naturals send once per table`);
    const packets = await commandPackets(page);
    const actual = Object.fromEntries(packets.map((packet) => [String(packet.tableId), packetSide(packet)]));
    assert.deepEqual(actual, expectedSides, `${provider}: each table uses its own complete previous natural, not road data or another table's hand`);
    const state = await ledger(page);
    assert(state.bets.every((bet) => bet.provider === provider && bet.state === "submitted"), `${provider}: packets remain only submitted until formal acceptance`);
    // Parity's original formula deliberately reports confidence 0. This test asserts
    // the deterministic side, never a non-zero confidence or a claimed probability.
    const roads = await page.evaluate(() => window.__offlineMobile.cards.map((card) => card.gameInfo.roadArray.length));
    assert.deepEqual(roads, [0, 1], `${provider}: fixture proves the legacy three-road gate is not used for card strategies`);
  } finally {
    await stopAndClose(page);
  }
}

async function testUnacceptedCmd6NeverSucceeds(browser) {
  const page = await openOfflinePage(browser, [{ id: 811, method: "ei", tableName: "RB-reject" }]);
  try {
    await setFixtureCards(page, [{ id: 811, shoe: "S-R", playId: 30, roadCount: 0 }]);
    await seedPreviousNaturals(page, [{ id: 811, shoe: "S-R", playId: 30, poker: PREVIOUS_NATURAL }]);
    await selectPokerProvider(page, "parity", "1");
    await approveAndStart(page);
    await waitForPacketCount(page, 1, "rejection case sends exactly one source-gated native packet");
    const [packet] = await commandPackets(page);
    await page.evaluate((receipt) => window.__offlineMobile.emit("RECEIVED_SUCCESS", receipt), {
      cmd: 6,
      codeId: 1,
      tableId: packet.tableId,
      gameNo: packet.gameNo,
      list: ["{}"]
    });
    await pause(100);
    const state = await page.evaluate(() => ({ status: window.__DG_SINGLEPAGE__.status(), ledger: window.__DG_SINGLEPAGE__.exportLedger() }));
    assert.equal(state.status.running, false, "a non-accepted cmd 6 stops automatic progression");
    assert.equal(state.ledger.bets[0].state, "rejected", "non-zero cmd 6 code is rejected, not accepted or successful");
    assert(!["accepted", "settled"].includes(state.ledger.bets[0].state), "unaccepted cmd 6 never becomes a success record");
    await page.evaluate(() => {
      const card = window.__offlineMobile.cards[0];
      card.gameInfo.playId += 1;
      card.gameInfo.gameNo = "S-R-811-next";
      card.gameInfo.starTime = Date.now();
    });
    await pause(700);
    assert.equal((await commandPackets(page)).length, 1, "rejected run cannot send a later round");
  } finally {
    await stopAndClose(page);
  }
}

async function testPacketIdentityFilters(browser) {
  const page = await openOfflinePage(browser, [
    { id: 821, method: "ei", tableName: "RB-filtered" },
    { id: 822, method: "Ki", tableName: "RB-valid" }
  ]);
  try {
    await setFixtureCards(page, [
      { id: 821, shoe: "S-filter", playId: 60, roadCount: 0 },
      { id: 822, shoe: "S-valid", playId: 70, roadCount: 0 }
    ]);
    await emitReceivedTable(page, [
      tablePacket(821, "S-filter", 59, TIED_COUNTING_NATURAL), // V38 2-versus-2: no final side
      tablePacket(821, "S-filter", 59, { player: "4-17", banker: "30-43-2" }), // impossible natural extra card
      tablePacket(999, "S-filter", 59, PREVIOUS_NATURAL), // no known live table
      tablePacket(821, "wrong-shoe", 59, PREVIOUS_NATURAL), // cross-shoe
      tablePacket(821, "S-filter", 58, PREVIOUS_NATURAL), // stale: not current - 1
      tablePacket(822, "S-valid", 69, PREVIOUS_NATURAL) // valid other table
    ]);
    await selectPokerProvider(page, "counting", "all");
    await approveAndStart(page);
    await waitForPacketCount(page, 1, "only valid other-table evidence can pass tie/partial/cross-table/cross-shoe/stale filters");
    const [packet] = await commandPackets(page);
    assert.equal(String(packet.tableId), "822", "valid table may send while all invalid evidence for another table remains blocked");
    assert.equal(packetSide(packet), "莊", "valid complete 4/4 natural follows V38 counting side");
    const state = await ledger(page);
    assert.equal(state.bets.length, 1, "no inferred result or fallback road wager is created for filtered evidence");
    assert.equal(state.bets[0].tableId, "822");
  } finally {
    await stopAndClose(page);
  }
}

async function testSingleTablePrefersLaterCompleteEvidence(browser) {
  const page = await openOfflinePage(browser, [
    { id: 851, method: "ei", tableName: "RB-waiting" },
    { id: 852, method: "Ki", tableName: "RB-ready" }
  ]);
  try {
    await setFixtureCards(page, [
      { id: 851, shoe: "S-waiting", playId: 41, roadCount: 0 },
      { id: 852, shoe: "S-ready", playId: 41, roadCount: 0 }
    ]);
    // The first visible card intentionally has no same-table completed prior hand.
    // Only the later card has a verified PublicBean.table previous natural.
    await seedPreviousNaturals(page, [{ id: 852, shoe: "S-ready", playId: 41, poker: PREVIOUS_NATURAL }]);
    await selectPokerProvider(page, "parity", "1");
    await approveAndStart(page);
    await waitForPacketCount(page, 1, "count=1 chooses the later complete-card table instead of waiting on the first unknown table");
    const [packet] = await commandPackets(page);
    assert.equal(String(packet.tableId), "852", "single-table auto selection prioritizes a valid side over an earlier table awaiting poker evidence");
    assert.equal(packetSide(packet), "閒", "the selected later table uses its own parity side");
  } finally {
    await stopAndClose(page);
  }
}

async function closeRoundObserveCurrentThenAdvance(page, nextRounds) {
  await page.evaluate((rounds) => {
    for (const spec of rounds) {
      const card = window.__offlineMobile.cards.find((candidate) => String(candidate.tableId) === String(spec.id));
      card.gameInfo.stateId = 2;
    }
  }, nextRounds);
  // `playId === current` is valid only while the live card is no longer in state 1.
  await emitReceivedTable(page, nextRounds.map((row) => tablePacket(row.id, row.shoe, row.previousPlayId, row.poker)));
  await page.evaluate((rounds) => {
    for (const spec of rounds) {
      const card = window.__offlineMobile.cards.find((candidate) => String(candidate.tableId) === String(spec.id));
      card.gameInfo.playId = spec.nextPlayId;
      card.gameInfo.gameNo = `${spec.shoe}-${spec.id}-${spec.nextPlayId}`;
      card.gameInfo.stateId = 1;
      card.gameInfo.starTime = Date.now();
    }
  }, nextRounds);
}

async function testFormalReceiptAndOnePerNewRound(browser) {
  const page = await openOfflinePage(browser, [
    { id: 831, method: "ei", tableName: "RB-life-A" },
    { id: 832, method: "Ki", tableName: "RB-life-B" }
  ]);
  try {
    await setFixtureCards(page, [
      { id: 831, shoe: "S-life-A", playId: 70, roadCount: 0 },
      { id: 832, shoe: "S-life-B", playId: 80, roadCount: 1 }
    ]);
    await seedPreviousNaturals(page, [
      { id: 831, shoe: "S-life-A", playId: 70, poker: PREVIOUS_NATURAL },
      { id: 832, shoe: "S-life-B", playId: 80, poker: SECOND_NATURAL }
    ]);
    await selectPokerProvider(page, "counting", "all");
    await approveAndStart(page);
    await waitForPacketCount(page, 2, "two independent tables submit their first native packets exactly once");
    const firstPackets = await commandPackets(page);
    const firstSides = Object.fromEntries(firstPackets.map((packet) => [String(packet.tableId), packetSide(packet)]));
    assert.deepEqual(firstSides, { "831": "莊", "832": "閒" }, "V38 uses each table's prior natural independently");

    // A settlement before a matching accepted cmd 6 cannot settle or unlock a new bet.
    for (const packet of firstPackets) await formalSettlement(page, packet, -100);
    assert((await ledger(page)).bets.every((bet) => bet.state === "submitted"), "settlement before formal accepted cmd 6 has no success effect");

    for (const packet of firstPackets) await formalAcceptance(page, packet);
    assert((await ledger(page)).bets.every((bet) => bet.state === "accepted"), "only exact codeId=0 native receipts formally accept both packets");

    await closeRoundObserveCurrentThenAdvance(page, [
      { id: 831, shoe: "S-life-A", previousPlayId: 70, nextPlayId: 71, poker: PREVIOUS_NATURAL },
      { id: 832, shoe: "S-life-B", previousPlayId: 80, nextPlayId: 81, poker: SECOND_NATURAL }
    ]);
    await pause(700);
    assert.equal((await commandPackets(page)).length, 2, "accepted-but-unsettled packets block all later round sends");

    for (const packet of firstPackets) await formalSettlement(page, packet, -100);
    await waitForPacketCount(page, 4, "after formal accept and formal settlement, each new table round emits once");
    const allPackets = await commandPackets(page);
    const newPackets = allPackets.slice(2);
    assert.deepEqual(newPackets.map((packet) => String(packet.tableId)).sort(), ["831", "832"], "each table owns exactly one new-round packet");
    assert.equal(new Set(newPackets.map((packet) => `${packet.tableId}:${packet.gameNo}`)).size, 2, "new-round packets have distinct table/game identities");
    await pause(900);
    assert.equal((await commandPackets(page)).length, 4, "ticks never duplicate either table's new-round packet");
  } finally {
    await stopAndClose(page);
  }
}

async function testStopAndExpiryPreventNewPackets(browser) {
  const stopped = await openOfflinePage(browser, [{ id: 841, method: "ei", tableName: "RB-stop" }]);
  try {
    await setFixtureCards(stopped, [{ id: 841, shoe: "S-stop", playId: 20, roadCount: 0 }]);
    await seedPreviousNaturals(stopped, [{ id: 841, shoe: "S-stop", playId: 20, poker: PREVIOUS_NATURAL }]);
    await selectPokerProvider(stopped, "parity", "1");
    await approveAndStart(stopped);
    await waitForPacketCount(stopped, 1, "stop case submits only its initial complete-card decision");
    const [packet] = await commandPackets(stopped);
    await formalAcceptance(stopped, packet);
    await formalSettlement(stopped, packet, 100);
    await stopped.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    await closeRoundObserveCurrentThenAdvance(stopped, [{ id: 841, shoe: "S-stop", previousPlayId: 20, nextPlayId: 21, poker: PREVIOUS_NATURAL }]);
    await pause(800);
    assert.equal((await commandPackets(stopped)).length, 1, "manual stop blocks an otherwise valid complete-card next round");
  } finally {
    await stopAndClose(stopped);
  }

  const expired = await openOfflinePage(browser, [{ id: 842, method: "Ki", tableName: "RB-expiry" }]);
  try {
    await expired.evaluate(() => {
      const base = Date.now();
      window.__testOffset = 0;
      Date.now = () => base + window.__testOffset;
      window.Laya.Browser.now = () => Date.now();
    });
    await setFixtureCards(expired, [{ id: 842, shoe: "S-expiry", playId: 30, roadCount: 0, countDown: 3600 }]);
    await seedPreviousNaturals(expired, [{ id: 842, shoe: "S-expiry", playId: 30, poker: PREVIOUS_NATURAL }]);
    await selectPokerProvider(expired, "counting", "1");
    await expired.evaluate(() => {
      const shadow = document.querySelector("#__dg_singlepage_panel__").shadowRoot;
      shadow.getElementById("duration-minutes").value = "1";
      // The exact source-gated native builder advances only the local test clock;
      // the post-builder production guard must abort before socket.sendData.
      window.__testBuilderAdvance = 60000;
    });
    await approveAndStart(expired);
    await pause(800);
    const state = await expired.evaluate(() => ({ status: window.__DG_SINGLEPAGE__.status(), ledger: window.__DG_SINGLEPAGE__.exportLedger(), sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length }));
    assert.equal(state.sent, 0, "time expiration inside native builder sends no cmd 6");
    assert.equal(state.status.running, false, "time expiration stops the run");
    assert.match(state.status.status, /時間|停止/, "time expiration leaves the run in a stopped state even if the post-builder guard supplies the final status text");
    assert.equal(state.ledger.bets[0]?.state, "aborted", "expired pre-send reservation is aborted, not accepted or successful");
  } finally {
    await stopAndClose(expired);
  }
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
    await testFormulaSidesWithoutRoadGate(browser, "parity", { "801": "閒", "802": "莊" });
    await testFormulaSidesWithoutRoadGate(browser, "counting", { "801": "莊", "802": "閒" });
    await testUnacceptedCmd6NeverSucceeds(browser);
    await testPacketIdentityFilters(browser);
    await testSingleTablePrefersLaterCompleteEvidence(browser);
    await testFormalReceiptAndOnePerNewRound(browser);
    await testStopAndExpiryPreventNewPackets(browser);
    console.log("PASS offline DG poker strategies: exact V3.2.9 builders, zero/one-road complete-card formula sides, identity-filtered PublicBean.table evidence, formal receipt/settlement lifecycle, stop and expiry guards. No network or live wagering.");
  } finally {
    await browser?.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
