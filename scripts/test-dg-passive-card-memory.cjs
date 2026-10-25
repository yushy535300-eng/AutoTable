#!/usr/bin/env node
/*
 * Offline-only regression test for the passive DG room-card feed.
 *
 * It uses only the anonymized native table fixture and the existing mobile
 * V3.2.9 ei/Ki helper. Chromium blocks every browser network path; packets
 * captured by the local socket stub never leave this process.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const esbuild = require("esbuild");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const { chromium } = playwright;

const root = path.resolve(__dirname, "..");
const fixture = require("../tests/fixtures/dg-card-results-anonymous.json");
const protobuf = require("../public/dg-vendor/protobuf.js");
const {
  openOfflinePage,
  configure,
  approveAndStart,
  packetPayload,
  stopAndClose
} = require("./test-dg-mobile-v329-complete.cjs");

const bundlePath = path.join(root, "public", "dg-direct-bet-console.js");
const protoPath = path.join(root, "public", "dg-vendor", "PublicBeanProto.proto");
const bridgePath = path.join(root, "server", "dg-card-bridge.ts");
const bridgeOut = path.join(os.tmpdir(), `dg-passive-card-bridge-${process.pid}.cjs`);
const PublicBean = protobuf.parse(fs.readFileSync(protoPath, "utf8")).root.lookupType("PublicBean");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cmd6 = (page) => page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6));

function assertFreshBundle() {
  const bundle = fs.readFileSync(bundlePath, "utf8");
  const required = ["bindCardFeed", "__AUTOBAC_DG_CARD_FEED__", "cardMemory:", "compactIfDue"];
  const missing = required.filter((needle) => !bundle.includes(needle));
  if (missing.length) {
    throw new Error(
      `STALE DG console bundle: missing ${missing.join(", ")}. ` +
      "The current source has passive card-feed support but public/dg-direct-bet-console.js does not. " +
      "Run `pnpm build:dg` before rerunning this offline regression."
    );
  }
}

function loadBridgeScript() {
  esbuild.buildSync({
    entryPoints: [bridgePath],
    outfile: bridgeOut,
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node22",
    legalComments: "none",
    logLevel: "silent"
  });
  delete require.cache[bridgeOut];
  const { DG_CARD_BRIDGE_SCRIPT } = require(bridgeOut);
  assert.equal(typeof DG_CARD_BRIDGE_SCRIPT, "string", "compiled bridge exports its browser script string");
  return DG_CARD_BRIDGE_SCRIPT;
}

function row(sourceTableId, tableId, overrides = {}) {
  const source = fixture.table.find((entry) => entry.tableId === sourceTableId && !Object.hasOwn(overrides, "match") && entry.state === 5 && entry.poker)
    || fixture.table.find((entry) => entry.tableId === sourceTableId && entry.state === 1 && !entry.poker)
    || fixture.table.find((entry) => entry.tableId === sourceTableId);
  assert(source, `fixture row ${sourceTableId} exists`);
  const copy = { tableId };
  for (const key of ["shoeId", "playId", "state", "poker"]) {
    if (Object.hasOwn(source, key)) copy[key] = source[key];
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (key !== "match" && value !== undefined) copy[key] = value;
  }
  return copy;
}

function fixtureRow(sourceTableId, tableId, predicate) {
  const source = fixture.table.find((entry) => entry.tableId === sourceTableId && predicate(entry));
  assert(source, `matching fixture row ${sourceTableId} exists`);
  const copy = { tableId };
  for (const key of ["shoeId", "playId", "state", "poker"]) {
    if (Object.hasOwn(source, key)) copy[key] = source[key];
  }
  return copy;
}

function encodeFrame(table) {
  const message = { cmd: 1002, codeId: 0, table };
  const error = PublicBean.verify(message);
  assert.equal(error, null, `fixture PublicBean validates: ${error || "ok"}`);
  return Buffer.from(PublicBean.encode(PublicBean.create(message)).finish());
}

async function installBridge(page, script) {
  await page.evaluate((source) => {
    // This is intentionally the same page-realm installation used by the proxy:
    // no WebSocket, fetch, HTTP request, or synthetic JS object reaches the feed.
    const receiver = new Function(`${source}\nreturn __dgCardReceive;`)();
    if (typeof receiver !== "function") throw new Error("DG card receiver did not install");
    window.__testCardReceive = receiver;
  }, script);
}

async function receiveRows(page, rows) {
  const bytes = encodeFrame(rows);
  await page.evaluate((numbers) => {
    const value = Uint8Array.from(numbers);
    const emitted = window.__testCardReceive(value.buffer);
    if (!emitted) throw new Error("fixture protobuf frame was not accepted by the passive bridge");
  }, Array.from(bytes));
}

async function setProvider(page, provider) {
  await page.evaluate((value) => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    if (!shadow) throw new Error("production panel did not mount");
    const select = shadow.getElementById("provider");
    if (!select) throw new Error("provider control missing");
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof select.onchange === "function") select.onchange();
  }, provider);
}

async function acceptAndSettle(page, packet, pnl) {
  const receipt = JSON.parse(JSON.stringify(packet));
  const body = JSON.parse(receipt.list[2]);
  delete body.info;
  receipt.codeId = 0;
  receipt.list = [JSON.stringify(body)];
  await page.evaluate((message) => window.__offlineMobile.emit("RECEIVED_SUCCESS", message), receipt);
  await page.evaluate(({ tableId, gameNo, pnl: amount }) => window.__offlineMobile.emit("RECEIVED_SUCCESS", {
    cmd: 1007,
    codeId: 0,
    tableId,
    gameNo,
    dList: [0, amount]
  }), { tableId: packet.tableId, gameNo: packet.gameNo, pnl });
  await page.waitForFunction(() => window.__DG_SINGLEPAGE__.status().pending.length === 0, null, { timeout: 4000 });
}

async function waitForCards(page, count) {
  await page.waitForFunction((wanted) => window.__DG_SINGLEPAGE__?.cardMemory?.().tableCount >= wanted, count, { timeout: 4000 });
}

async function run() {
  assertFreshBundle();
  const bridgeScript = loadBridgeScript();
  let browser;
  let page;
  try {
    browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
    // The two visible candidates use the exact public V3.2.9 source methods. They
    // begin hidden so native feed memory is proven independent of scene cards.
    page = await openOfflinePage(browser, [
      { id: 201, method: "ei", hidden: true, tableName: "FX201", playId: 19, gameNo: "shoe0-201-19" },
      { id: 206, method: "Ki", hidden: true, tableName: "FX206", playId: 35, gameNo: "shoe0-206-35" },
      { id: 303, method: "ei", hidden: true, tableName: "FX303", playId: 19, gameNo: "shoe0-303-19" }
    ]);
    await installBridge(page, bridgeScript);

    // Feed a fully revealed 10-33-0 / 10-17-8 hand plus its current open round
    // before card 201 is visible. Shoe zero is deliberately explicit metadata.
    const previous201 = fixtureRow(101, 201, (entry) => entry.state === 5 && entry.poker);
    const open201 = fixtureRow(101, 201, (entry) => entry.state === 1 && !entry.poker);
    assert.equal(previous201.poker, '{"player":"10-33-0","banker":"10-17-8"}', "parity source preserves the native three-slot poker strings");
    await receiveRows(page, [previous201, open201]);

    // Table 206 receives two real fixture results under an allowed table-id remap:
    // it gives compaction an actual retained latest record rather than invented ranks.
    const early206 = fixtureRow(101, 206, (entry) => entry.state === 5 && entry.poker);
    await receiveRows(page, [early206]);

    // A third, hidden card is intentionally fed conflict evidence. Both poker
    // payloads are unmodified strings from the anonymized fixture; only table IDs
    // are remapped for isolated offline tables.
    const first303 = fixtureRow(101, 303, (entry) => entry.state === 5 && entry.poker);
    const open303 = fixtureRow(101, 303, (entry) => entry.state === 1 && !entry.poker);
    await receiveRows(page, [first303, open303]);

    // bindCardFeed runs in tick before the running gate. Its safe subscribe snapshot
    // must record passive native evidence while the console has never been started.
    await waitForCards(page, 3);
    const passive = await page.evaluate(() => ({
      memory: window.__DG_SINGLEPAGE__.cardMemory(),
      sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length,
      running: window.__DG_SINGLEPAGE__.status().running
    }));
    assert(passive.memory.tableCount > 0, "complete fixture cards received before a scene card are retained passively");
    assert.equal(passive.sent, 0, "passive feed evidence does not emit cmd 6 before automation starts");
    assert.equal(passive.running, false, "the console remains stopped while passive evidence arrives");

    // Complete 206 after the subscription exists, so history is demonstrably
    // longer than the table count prior to 20-minute compaction.
    const latest206 = fixtureRow(106, 206, (entry) => entry.state === 5 && entry.poker);
    const open206 = fixtureRow(106, 206, (entry) => entry.state === 1 && !entry.poker);
    assert.equal(latest206.poker, '{"player":"49-20-0","banker":"27-4-50"}', "counting source preserves its native three-slot poker strings");
    await receiveRows(page, [latest206, open206]);

    const conflicting303 = { ...first303, poker: latest206.poker };
    await receiveRows(page, [conflicting303]);
    await page.waitForFunction(() => window.__DG_SINGLEPAGE__.cardMemory().historyCount > window.__DG_SINGLEPAGE__.cardMemory().tableCount, null, { timeout: 4000 });

    // Make the precreated matching card appear only after its prior result was
    // recorded. The scene has no shoeId; feed metadata (shoe 0/current play 19)
    // is the only permitted identity binding.
    await page.evaluate(() => {
      const card = window.__offlineMobile.cards.find((item) => String(item.tableId) === "201");
      card.visible = true;
      delete card.gameInfo.shoeId;
      card.gameInfo.stateId = 1;
      card.gameInfo.playId = 19;
      card.gameInfo.gameNo = "shoe0-201-19";
      card.gameInfo.starTime = Date.now();
    });
    await configure(page, { count: "1", staking: "flat" });
    await setProvider(page, "parity");
    await page.waitForFunction(() => /靴 0/.test(document.querySelector("#__dg_singlepage_panel__").shadowRoot.getElementById("focus-meta").textContent), null, { timeout: 4000 });
    const renderedShoe = await page.evaluate(() => document.querySelector("#__dg_singlepage_panel__").shadowRoot.getElementById("focus-meta").textContent);
    assert.match(renderedShoe, /靴 0/, "shoe zero renders as zero, never as a missing dash");
    assert(!/靴 —/.test(renderedShoe), "a feed-bound shoe zero is not rendered as —");

    await approveAndStart(page);
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length === 1, null, { timeout: 4000 });
    const parityPacket = (await cmd6(page))[0];
    const parityPayload = packetPayload(parityPacket);
    assert.equal(Number(parityPayload.banker || 0), 100, "10-33-0 / 10-17-8 parity decision submits banker flat stake");
    assert.equal(Number(parityPayload.player || 0), 0, "parity fixture does not fabricate a player stake");
    await acceptAndSettle(page, parityPacket, 100);
    const afterParity = await page.evaluate(() => ({ ledger: window.__DG_SINGLEPAGE__.exportLedger(), status: window.__DG_SINGLEPAGE__.status() }));
    assert.equal(afterParity.ledger.bets.length, 1, "formal receipt and settlement retain one automatic ledger item");
    assert.equal(afterParity.ledger.bets[0].state, "settled", "formal receipt and settlement clear the first pending bet");
    assert.equal(afterParity.ledger.bets[0].pnl, 100, "first settled P/L is recorded before compaction");
    assert.equal(afterParity.status.pending.length, 0, "no pending automatic bet remains before clock jump");

    // Stop the parity run only after its formal settlement, switch strategy while
    // settings are editable, then begin a counting run with the final card closed.
    await page.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    await page.evaluate(() => {
      const first = window.__offlineMobile.cards.find((item) => String(item.tableId) === "201");
      const final = window.__offlineMobile.cards.find((item) => String(item.tableId) === "206");
      first.visible = false;
      final.visible = true;
      delete final.gameInfo.shoeId;
      final.gameInfo.stateId = 2;
      final.gameInfo.playId = 35;
      final.gameInfo.gameNo = "shoe0-206-35";
      final.gameInfo.starTime = Date.now();
    });
    await configure(page, { count: "1", staking: "flat" });
    await setProvider(page, "counting");
    await approveAndStart(page);
    await sleep(120);
    assert.equal((await cmd6(page)).length, 1, "closed current card cannot send before it reopens");
    assert.equal(await page.evaluate(() => window.__DG_SINGLEPAGE__.status().running), true, "counting run remains active without a pending wager");

    const beforeCompact = await page.evaluate(() => ({
      memory: window.__DG_SINGLEPAGE__.cardMemory(),
      ledger: window.__DG_SINGLEPAGE__.exportLedger(),
      status: window.__DG_SINGLEPAGE__.status()
    }));
    assert(beforeCompact.memory.historyCount > beforeCompact.memory.tableCount, "history contains earlier hands before compactIfDue");
    assert.equal(beforeCompact.status.pending.length, 0, "clock jump begins with no submitted or accepted bet");

    // Do not advance a pending order across the artificial clock. The first run is
    // settled and the second has none; this tests memory compaction only, not a
    // timeout or auto-stop path.
    await page.evaluate(() => {
      const real = Date.now();
      window.__testClock = real + 20 * 60 * 1000;
      Date.now = () => window.__testClock;
      window.Laya.Browser.now = () => window.__testClock;
      window.__DG_SINGLEPAGE__.scan();
    });
    await sleep(750); // next regular tick invokes pokerTracker.observe(...).compactIfDue()
    const compacted = await page.evaluate(() => ({
      memory: window.__DG_SINGLEPAGE__.cardMemory(),
      ledger: window.__DG_SINGLEPAGE__.exportLedger(),
      status: window.__DG_SINGLEPAGE__.status()
    }));
    assert.equal(compacted.memory.historyCount, compacted.memory.tableCount, "20-minute compaction retains exactly each table's latest hand");
    assert.equal(compacted.memory.tableCount, beforeCompact.memory.tableCount, "compaction preserves all remembered table identities");
    assert.deepEqual(compacted.ledger, beforeCompact.ledger, "compaction never changes ledger, P/L, or settled evidence");
    assert.equal(compacted.status.pending.length, 0, "compaction does not create or clear pending wagers");
    assert.equal(compacted.status.running, true, "a no-pending clock jump does not auto-stop the active run");

    // Restore the SAME current native play/state to open. Table 206 has never had
    // a bet for this gameNo, so this proves the retained last hand is immediately
    // usable rather than relying on a same-game resend.
    await page.evaluate(() => {
      const conflict = window.__offlineMobile.cards.find((item) => String(item.tableId) === "303");
      const final = window.__offlineMobile.cards.find((item) => String(item.tableId) === "206");
      conflict.visible = true;
      delete conflict.gameInfo.shoeId;
      conflict.gameInfo.stateId = 1;
      conflict.gameInfo.playId = 19;
      conflict.gameInfo.gameNo = "shoe0-303-19";
      conflict.gameInfo.starTime = Date.now();
      final.gameInfo.stateId = 1;
      final.gameInfo.playId = 35;
      final.gameInfo.gameNo = "shoe0-206-35";
      final.gameInfo.starTime = Date.now();
      window.__DG_SINGLEPAGE__.scan();
    });
    await receiveRows(page, [open206, open303]);
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length === 2, null, { timeout: 4000 });
    const countingPacket = (await cmd6(page))[1];
    const countingPayload = packetPayload(countingPacket);
    assert.equal(String(countingPacket.tableId), "206", "the never-bet final table, not a same-game resend, receives the retained decision");
    assert.equal(Number(countingPayload.banker || 0), 100, "49-20-0 / 27-4-50 counting decision submits banker flat stake");
    assert.equal(Number(countingPayload.player || 0), 0, "counting fixture does not use mocked ranks or points");
    const conflictReason = await page.evaluate(() => window.__DG_SINGLEPAGE__.analysis("303"));
    assert.match(conflictReason, /衝突/, "compaction preserves same-round conflicting evidence and keeps it non-bettable");
    await acceptAndSettle(page, countingPacket, 100);

    // Stopping only gates automation. Feed callbacks continue recording inbound
    // sanitized frames; they must not reactivate the console or send a packet.
    await page.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    const beforeStop = await page.evaluate(() => ({ memory: window.__DG_SINGLEPAGE__.cardMemory(), packets: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length }));
    const stoppedFrame = fixtureRow(107, 407, (entry) => entry.state === 5 && entry.poker);
    await receiveRows(page, [stoppedFrame]);
    await page.waitForFunction((oldCount) => window.__DG_SINGLEPAGE__.cardMemory().tableCount > oldCount, beforeStop.memory.tableCount, { timeout: 4000 });
    const afterStop = await page.evaluate(() => ({ memory: window.__DG_SINGLEPAGE__.cardMemory(), packets: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6).length, running: window.__DG_SINGLEPAGE__.status().running }));
    assert(afterStop.memory.tableCount > beforeStop.memory.tableCount, "stopped console still records inbound passive card frames");
    assert.equal(afterStop.packets, beforeStop.packets, "stopped console sends no cmd 6 for later feed frames");
    assert.equal(afterStop.running, false, "later feed traffic cannot auto-start automation");
  } finally {
    try { if (page) await stopAndClose(page); } catch {}
    try { if (browser) await browser.close(); } catch {}
    try { fs.unlinkSync(bridgeOut); } catch {}
  }
}

run().then(() => {
  console.log("PASS offline-only DG passive card-memory bridge: protobuf fixture feed, shoe-0 metadata binding, parity/counting flat packets, settled compaction, conflict retention, and stopped-feed recording (not a live-device or platform result)");
}).catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
