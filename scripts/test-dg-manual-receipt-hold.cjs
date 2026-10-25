#!/usr/bin/env node
/*
 * Offline-only regression coverage for the short-lived manual opaque-receipt
 * hold.  No network, HAR, credentials, or encrypted request contents are read.
 */
"use strict";

const assert = require("node:assert/strict");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const { openOfflinePage, configure, approveAndStart, stopAndClose, packetPayload } = require("./test-dg-mobile-v329-complete.cjs");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const automaticPackets = (page) => page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message?.type === 1).length);
const state = (page) => page.evaluate(() => window.__DG_SINGLEPAGE__.status());
const emit = (page, message) => page.evaluate((value) => window.__offlineMobile.emit("RECEIVED_SUCCESS", value), message);
const send = (page, message) => page.evaluate((value) => {
  const card=window.__offlineMobile.cards.find(c=>String(c.tableId)===String(value.tableId));
  if(card)card.gameInfo.gameNo=value.gameNo;
  return window.__offlineMobile.socket.sendData(value);
}, message);

// These are synthetic native messages in the same public reducer shape used by
// test-dg-manual-combined.cjs.  The test never examines any opaque list item.
const manualCommand = (gameNo, tableId = 799) => ({ cmd: 6, tableId, gameNo, bet: { banker6: 100 } });
const opaqueManualCommand = (gameNo, tableId = 799) => ({ cmd: 6, tableId, gameNo, list: ["offline-opaque-manual-payload"] });
const manualReceipt = (gameNo, tableId = 799, codeId = 0, fields = { banker6: 100 }) => ({
  cmd: 6,
  codeId,
  tableId,
  gameNo,
  list: [JSON.stringify(fields)]
});
const settle = (gameNo, pnl, tableId = 799) => ({ cmd: 1007, codeId: 0, tableId, gameNo, dList: [0, pnl] });

async function makePage(browser) {
  // Both S03 and RB04 are visible. Manual table/game identity is synchronized
  // to its real outgoing event; the engine must exclude that manual round.
  const page = await openOfflinePage(browser, [
    { id: 701, method: "ei", tableName: "S03", gameNo: "s03-auto-1", playId: 40 },
    { id: 799, method: "ei", tableName: "RB04", gameNo: "rb04-manual-1", playId: 40 }
  ]);
  await configure(page, { count: "1", staking: "flat" });
  const selected = await page.evaluate(() => window.__DG_SINGLEPAGE__.status().selected);
  assert.deepEqual(selected, ["701"], "only the source-ei S03 card is selected for automatic play; visible RB04 remains a separate manual native table");
  return page;
}

async function automaticPacket(page) {
  await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message?.type === 1).length === 1, null, { timeout: 4000 });
  return page.evaluate(() => window.__offlineMobile.sent.find((message) => Number(message?.cmd) === 6 && message?.type === 1));
}

async function settleAuto(page, pnl = 0) {
  const packet = await automaticPacket(page);
  // This copied fixture helper only decodes its own local JSON stub to make a
  // matching automatic receipt; it never receives an encrypted production body.
  const payload = packetPayload(packet);
  delete payload.info;
  await emit(page, { cmd: 6, codeId: 0, tableId: packet.tableId, gameNo: packet.gameNo, list: [JSON.stringify(payload)] });
  await emit(page, settle(packet.gameNo, pnl, packet.tableId));
  return packet;
}

async function moveS03ToNextGame(page, suffix) {
  await page.evaluate((next) => {
    const card = window.__offlineMobile.cards.find((item) => String(item.tableId) === "701");
    card.gameInfo.gameNo = next;
    card.gameInfo.playId += 1;
    card.gameInfo.starTime = Date.now();
    card.gameInfo.stateId = 1;
  }, suffix);
}

async function startWithAcceptedS03(page) {
  await approveAndStart(page);
  const packet = await automaticPacket(page);
  const payload = packetPayload(packet);
  delete payload.info;
  await emit(page, { cmd: 6, codeId: 0, tableId: packet.tableId, gameNo: packet.gameNo, list: [JSON.stringify(payload)] });
  assert.equal((await state(page)).pending[0]?.state, "accepted", "S03 automatic packet is accepted before the independent RB04 opaque send");
  return packet;
}

async function testFreshOpaqueHoldResumesAfterVerifiedReceipt(browser) {
  const page = await makePage(browser);
  try {
    const first = await startWithAcceptedS03(page);
    await send(page, opaqueManualCommand("rb04-opaque-release"));
    let view = await state(page);
    assert.equal(view.running, true, "a fresh uniquely attributable opaque manual cmd 6 holds sends without stopping the run");
    assert.equal(view.manualPending.length, 1, "opaque RB04 command is retained as manual pending evidence");
    assert.equal(view.manualPending[0].state, "unknown", "fresh opaque manual command remains unknown until its cmd 6 receipt");
    assert.equal(view.manualPending[0].amount, null, "fresh opaque manual command has no invented amount");
    assert.equal(view.roundPnl, 0, "an opaque command cannot create P/L");

    await emit(page, settle(first.gameNo, 0, first.tableId));
    await moveS03ToNextGame(page, "s03-auto-2");
    await sleep(650);
    assert.equal(await automaticPackets(page), 1, "after S03 settlement, the fresh opaque hold still blocks every new automatic packet");
    assert.equal((await state(page)).running, true, "the temporary hold preserves the active run");

    await emit(page, manualReceipt("rb04-opaque-release"));
    view = await state(page);
    assert.equal(view.running, true, "a valid code=0 manual receipt releases the temporary hold without a new Start");
    assert.equal(view.manualPending.length, 1, "verified manual stake remains pending only for its actual settlement");
    assert.equal(view.manualPending[0].state, "accepted", "code=0 banker6=100 receipt converts the opaque manual record to accepted");
    assert.equal(view.manualPending[0].amount, 100, "the reducer receives the formal banker6=100 stake exactly");
    assert.equal(view.roundPnl, 0, "acceptance alone does not manufacture manual P/L");

    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message?.type === 1).length === 2, null, { timeout: 4000 });
    assert.equal(await automaticPackets(page), 2, "release of the verified receipt hold sends exactly one S03 next-game packet without another Start");

    await emit(page, settle("rb04-opaque-release", 95));
    view = await state(page);
    assert.equal(view.running, true, "a non-threshold verified manual profit does not auto-stop automation");
    assert.equal(view.roundPnl, 95, "the formal manual 1007 is counted exactly once");
    assert.deepEqual(view.roundPnlBreakdown, { automatic: 0, manual: 95 }, "manual P/L is kept separate from S03 automatic P/L");
    assert.equal(view.manualPending.length, 0, "settled verified manual command clears manual pending evidence");
    await emit(page, settle("rb04-opaque-release", 95));
    assert.equal((await state(page)).roundPnl, 95, "duplicate manual 1007 cannot count P/L twice");
  } finally {
    await stopAndClose(page);
  }
}

async function testOpaqueSettlementBeforeReceiptIsStagedUntilStrictConfirmation(browser) {
  const page = await makePage(browser);
  try {
    const first = await startWithAcceptedS03(page);
    await send(page, opaqueManualCommand("rb04-1007-before-receipt"));
    await emit(page, settle("rb04-1007-before-receipt", 95));
    let beforeReceipt = await state(page);
    assert.equal(beforeReceipt.running, true, "a fresh opaque manual 1007 is temporarily held without stopping the active run");
    assert.equal(beforeReceipt.manualPending.length, 1, "manual 1007-before-receipt leaves one unknown manual record pending");
    assert.equal(beforeReceipt.manualPending[0].state, "unknown", "pre-receipt manual 1007 cannot proclaim acceptance");
    assert.equal(beforeReceipt.manualPending[0].amount, null, "pre-receipt manual 1007 cannot invent its opaque stake");
    assert.equal(beforeReceipt.roundPnl, 0, "pre-receipt manual 1007 is staged, never counted as P/L");
    assert.deepEqual(beforeReceipt.roundPnlBreakdown, { automatic: 0, manual: 0 }, "staged manual 1007 is absent from both P/L reducers");

    await emit(page, settle(first.gameNo, 0, first.tableId));
    await moveS03ToNextGame(page, "s03-1007-before-receipt-next");
    await sleep(650);
    assert.equal(await automaticPackets(page), 1, "the fresh opaque hold still prevents a replacement S03 packet before strict receipt confirmation");

    await emit(page, manualReceipt("rb04-1007-before-receipt"));
    const confirmed = await state(page);
    assert.equal(confirmed.running, true, "strict receipt confirmation applies the staged result without requiring another Start");
    assert.equal(confirmed.manualPending.length, 0, "strict receipt consumes the staged manual result and clears pending evidence");
    assert.equal(confirmed.roundPnl, 95, "the staged 1007 is counted once only after matching code=0 banker6=100 receipt");
    assert.deepEqual(confirmed.roundPnlBreakdown, { automatic: 0, manual: 95 }, "only the formally confirmed manual P/L is credited");
    await emit(page, settle("rb04-1007-before-receipt", 95));
    assert.equal((await state(page)).roundPnl, 95, "a duplicate 1007 after confirmation cannot add a second manual P/L");
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message?.type === 1).length === 2, null, { timeout: 4000 });
    assert.equal(await automaticPackets(page), 2, "receipt-confirmed staged settlement releases the hold and permits the next S03 packet without Start");
  } finally {
    await stopAndClose(page);
  }
}

async function testExplicitStopWinsOverVerifiedReceipt(browser) {
  const page = await makePage(browser);
  try {
    const first = await startWithAcceptedS03(page);
    await send(page, opaqueManualCommand("rb04-user-stop"));
    await emit(page, settle(first.gameNo, 0, first.tableId));
    await moveS03ToNextGame(page, "s03-user-stop-next");
    await page.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    const stopped = await state(page);
    assert.equal(stopped.running, false, "an explicit user stop ends the run even while a receipt hold exists");

    await emit(page, manualReceipt("rb04-user-stop"));
    await sleep(650);
    const after = await state(page);
    assert.equal(after.running, false, "a valid later receipt never restarts a user-stopped run");
    assert.equal(await automaticPackets(page), 1, "receipt release after explicit stop sends no automatic packet");
    assert.equal(after.manualPending[0]?.state, "accepted", "the manual receipt is still recorded while the user stop remains authoritative");
    const focus = await page.evaluate(() => {
      const root = document.querySelector("#__dg_singlepage_panel__").shadowRoot;
      return root.getElementById("focus-phase").textContent;
    });
    assert(/停止|手動|使用者/.test(focus), "when not running, caption focus prioritizes the actual explicit stop reason over an accepted-manual waiting caption");
  } finally {
    await stopAndClose(page);
  }
}

async function testFormalRejectionReleasesHoldWithoutPnl(browser) {
  const page = await makePage(browser);
  try {
    const first = await startWithAcceptedS03(page);
    await send(page, opaqueManualCommand("rb04-rejected"));
    await emit(page, settle(first.gameNo, 0, first.tableId));
    await moveS03ToNextGame(page, "s03-rejection-next");
    await emit(page, manualReceipt("rb04-rejected", 799, 17));
    const afterReject = await state(page);
    assert.equal(afterReject.running, true, "a formal nonzero manual rejection clears the temporary hold without stopping the run");
    assert.equal(afterReject.manualPending.length, 0, "a rejected manual command is no longer pending");
    assert.equal(afterReject.roundPnl, 0, "rejection never fabricates a manual P/L result");
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message?.type === 1).length === 2, null, { timeout: 4000 });
    assert.equal(await automaticPackets(page), 2, "the next S03 game proceeds after formal rejection without another Start");
  } finally {
    await stopAndClose(page);
  }
}

async function testMissingAcknowledgementStopsAfterTwelveSeconds(browser) {
  const page = await makePage(browser);
  try {
    const first = await startWithAcceptedS03(page);
    await emit(page, settle(first.gameNo, 0, first.tableId));
    assert.equal((await state(page)).pending.length, 0, "the S03 packet is completely settled before the fake-time timeout jump");

    await send(page, opaqueManualCommand("rb04-missing-ack"));
    await page.evaluate(() => {
      const now = Date.now() + 13001;
      Date.now = () => now;
      window.Laya.Browser.now = () => now;
      const s03 = window.__offlineMobile.cards.find((item) => String(item.tableId) === "701");
      s03.gameInfo.starTime = now;
      s03.gameInfo.countDown = 20;
      s03.gameInfo.stateId = 1;
    });
    await sleep(650);
    const timedOut = await state(page);
    assert.equal(timedOut.running, false, "missing manual receipt beyond 12 seconds is a safety stop, not a silent resume");
    assert.equal(timedOut.roundPnl, 0, "timeout produces no guessed P/L");
    assert.equal(timedOut.pending.length, 0, "the auto packet was already settled, so timeout leaves no own automatic pending record");
    assert.equal(timedOut.manualPending.length, 1, "timed-out opaque manual command remains evidence for later formal reconciliation");
    assert.equal(timedOut.manualPending[0].state, "unknown", "timed-out opaque command remains unknown rather than accepted or settled");
    assert.equal(await automaticPackets(page), 1, "the fake-time deadline does not produce a replacement automatic packet");
  } finally {
    await stopAndClose(page);
  }
}

async function testInvalidReceiptCannotReleaseOrProclaimAccepted(browser) {
  const page = await makePage(browser);
  try {
    const first = await startWithAcceptedS03(page);
    await send(page, opaqueManualCommand("rb04-invalid-receipt"));
    await emit(page, settle(first.gameNo, 0, first.tableId));
    await moveS03ToNextGame(page, "s03-invalid-receipt-next");
    // A first opaque command has no side/signature with which a formal receipt
    // can be compared.  A code=0 receipt that remains opaque is therefore the
    // true invalid boundary: it must hard-stop, never release this hold.
    await emit(page, { cmd: 6, codeId: 0, tableId: 799, gameNo: "rb04-invalid-receipt", list: ["offline-opaque-receipt"] });
    await sleep(650);
    const invalid = await state(page);
    assert.equal(invalid.running, false, "opaque/invalid manual receipt hard-stops rather than releasing the opaque hold");
    assert.equal(invalid.roundPnl, 0, "invalid receipt cannot proclaim manual profit or loss");
    assert.equal(invalid.manualPending.length, 1, "invalid receipt retains manual evidence for reconciliation");
    assert.equal(invalid.manualPending[0].state, "unknown", "invalid receipt cannot falsely mark the manual command accepted");
    assert.equal(invalid.manualPending[0].amount, null, "invalid receipt does not backfill an unverified opaque amount");
    assert.equal(await automaticPackets(page), 1, "invalid receipt never permits an S03 follow-up packet");
  } finally {
    await stopAndClose(page);
  }
}

(async () => {
  let browser;
  try {
    browser = await playwright.chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
    await testFreshOpaqueHoldResumesAfterVerifiedReceipt(browser);
    await testOpaqueSettlementBeforeReceiptIsStagedUntilStrictConfirmation(browser);
    await testExplicitStopWinsOverVerifiedReceipt(browser);
    await testFormalRejectionReleasesHoldWithoutPnl(browser);
    await testMissingAcknowledgementStopsAfterTwelveSeconds(browser);
    await testInvalidReceiptCannotReleaseOrProclaimAccepted(browser);
    console.log("PASS offline-only manual opaque receipt hold: temporary hold/release, explicit-stop priority, rejection, 12s safety stop, and invalid-receipt hard-stop. No network, HAR, credentials, or encrypted payload reads.");
  } finally {
    await browser?.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
