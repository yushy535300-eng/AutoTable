#!/usr/bin/env node
/*
 * Anonymous, offline-only DG regression. It uses literal fixture identities,
 * blocks HTTP(S), fetch and WebSocket, and never connects to a platform or DB.
 */
"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const { chromium } = playwright;
const {
  openOfflinePage,
  approveAndStart,
  packetPayload,
  stopAndClose
} = require("./test-dg-mobile-v329-complete.cjs");

const productionBundle = path.resolve(__dirname, "..", "public", "dg-direct-bet-console.js");
const cards = Array.from({ length: 5 }, (_, index) => ({
  id: 801 + index,
  method: index % 2 ? "Ki" : "ei",
  tableName: `IS${String(index + 1).padStart(2, "0")}`
}));
const automaticPackets = (page) => page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1));
const receive = (page, message) => page.evaluate((fixtureMessage) => window.__offlineMobile.emit("RECEIVED_SUCCESS", fixtureMessage), message);
const status = (page) => page.evaluate(() => window.__DG_SINGLEPAGE__.status());
const settingsControlIds = [
  "single-staking", "start-mode", "provider", "provider-trigger", "base", "cap",
  "duration-minutes", "stop-loss", "take-profit", "parallel-count", "count", "scan", "auto-tables"
];

function host(page) { return page.locator("#__dg_singlepage_panel__"); }
function control(page, id) { return host(page).locator(`#${id}`); }
async function choose(page, id, value) {
  await control(page, id).selectOption(value);
  assert.equal(await control(page, id).inputValue(), value, `${id} accepts the anonymous fixture draft`);
}
async function setProvider(page, value) {
  await page.evaluate((next) => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    const select = shadow?.getElementById("provider");
    if (!select) throw new Error("provider select missing");
    select.value = next;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
async function assertSettingsEditable(page, label) {
  const controls = await page.evaluate((ids) => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    if (!shadow) throw new Error("production panel missing");
    return Object.fromEntries(ids.map((id) => {
      const node = shadow.getElementById(id);
      if (!node) throw new Error(`missing ${id}`);
      return [id, Boolean(node.disabled)];
    }));
  }, settingsControlIds);
  for (const [id, disabled] of Object.entries(controls)) assert.equal(disabled, false, `${label}: ${id} is enabled`);
  const rooms = await page.evaluate(() => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    return [...(shadow?.querySelectorAll("#rooms button") || [])].map((button) => Boolean(button.disabled));
  });
  assert(rooms.length > 0, `${label}: anonymous fixture has room selection buttons`);
  assert(rooms.every((disabled) => !disabled), `${label}: every room selection button is enabled`);
}
async function assertStartBlockedBeforeAcknowledgement(page, expectedPackets, label) {
  await page.evaluate(() => window.__DG_SINGLEPAGE__.start());
  const result = await page.evaluate(() => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    return {
      dialogHidden: Boolean(shadow?.getElementById("risk-dialog")?.hidden),
      running: window.__DG_SINGLEPAGE__.status().running,
      packets: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length
    };
  });
  assert.equal(result.dialogHidden, true, `${label}: pending block occurs before acknowledgement dialog`);
  assert.equal(result.running, false, `${label}: blocked request never changes to running`);
  assert.equal(result.packets, expectedPackets, `${label}: blocked request sends no cmd 6 packet`);
}
async function rerunBundle(page) {
  await page.addScriptTag({ path: productionBundle });
  await page.waitForFunction(() => Boolean(document.querySelector("#__dg_singlepage_panel__")?.shadowRoot && window.__DG_SINGLEPAGE__));
}

async function testFreshAndStoppedPendingDraft(browser) {
  const page = await openOfflinePage(browser, cards);
  try {
    await assertSettingsEditable(page, "fresh anonymous login");
    await control(page, "nav-settings").click();
    await choose(page, "single-staking", "doubling");
    await approveAndStart(page);
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length === 1, null, { timeout: 4000 });
    const first = (await automaticPackets(page))[0];
    const beforeStop = await page.evaluate(() => {
      const ledger = window.__DG_SINGLEPAGE__.exportLedger();
      return {
        levels: structuredClone(ledger.levels),
        bet: structuredClone(ledger.bets[0]),
        sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length
      };
    });
    assert.deepEqual({ amount: beforeStop.bet.amount, level: beforeStop.bet.level, scope: beforeStop.bet.scope, staking: beforeStop.bet.staking }, { amount: 100, level: 0, scope: "global", staking: "doubling" }, "first order keeps frozen single-table doubling terms");

    await page.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    assert.equal((await status(page)).running, false, "manual stop halts automatic execution");
    await assertSettingsEditable(page, "stopped with unresolved automatic packet");

    // These are actual DOM controls for the *next* run. They must not modify the
    // original sent order or its saved level, and must never synthesize an order.
    await control(page, "nav-overview").click();
    await choose(page, "parallel-count", "3");
    await control(page, "nav-settings").click();
    await choose(page, "single-staking", "flat");
    await choose(page, "start-mode", "resume");
    await control(page, "base").fill("200");
    await control(page, "cap").fill("2000");
    await control(page, "duration-minutes").fill("17");
    await control(page, "stop-loss").fill("900");
    await control(page, "take-profit").fill("800");
    await setProvider(page, "road");
    await control(page, "nav-overview").click();
    await control(page, "choose-tables").click();
    const roomButtons = host(page).locator("#rooms button");
    await roomButtons.nth(0).click();
    await roomButtons.nth(3).click();
    const draft = await status(page);
    assert.equal(draft.roomCount, "3", "stopped pending draft accepts a new table count");
    assert.equal(draft.scope, "table", "multi-table draft receives table scope without rewriting the pending order");
    assert.equal(draft.staking, "flat", "multi-table draft remains flat");
    assert.equal(draft.startMode, "resume", "stopped pending draft accepts new start mode");
    assert.equal(draft.selected.length, 3, "stopped pending draft accepts a new table selection");
    assert.equal(await control(page, "base").inputValue(), "200", "stopped pending draft accepts new base amount");
    assert.equal(await control(page, "stop-loss").inputValue(), "900", "stopped pending draft accepts next risk level");
    assert.equal(await control(page, "take-profit").inputValue(), "800", "stopped pending draft accepts next profit level");
    const afterDraft = await page.evaluate(() => {
      const ledger = window.__DG_SINGLEPAGE__.exportLedger();
      return { levels: structuredClone(ledger.levels), bet: structuredClone(ledger.bets[0]) };
    });
    assert.deepEqual(afterDraft, { levels: beforeStop.levels, bet: beforeStop.bet }, "all next-run edits leave original amount/level/scope/staking/state intact");
    assert.equal((await automaticPackets(page)).length, beforeStop.sent, "draft edits never send a cmd 6 packet");
    await assertStartBlockedBeforeAcknowledgement(page, beforeStop.sent, "stopped automatic pending packet");

    // Only a matching official receipt followed by a matching settlement releases
    // the ledger. No timeout, clearing, or fake settlement is used.
    const receiptPayload = packetPayload(first);
    delete receiptPayload.info;
    await receive(page, { cmd: 6, codeId: 0, tableId: first.tableId, gameNo: first.gameNo, list: [JSON.stringify(receiptPayload)] });
    await receive(page, { cmd: 1007, codeId: 0, tableId: first.tableId, gameNo: first.gameNo, dList: [0, -100] });
    await page.waitForFunction(() => window.__DG_SINGLEPAGE__.status().pending.length === 0, null, { timeout: 2500 });
    assert.equal((await status(page)).running, false, "settlement does not restart a stopped run");

    await page.evaluate(() => {
      for (const [index, card] of window.__offlineMobile.cards.entries()) {
        card.gameInfo.gameNo = `next-draft-${index}`;
        card.gameInfo.playId = 70 + index;
      }
    });
    await approveAndStart(page);
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length === 4, null, { timeout: 4000 });
    const applied = await page.evaluate(() => ({
      settings: window.__DG_SINGLEPAGE__.settingsSnapshot(),
      ledger: window.__DG_SINGLEPAGE__.exportLedger(),
      sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1)
    }));
    assert.deepEqual({ startMode: applied.settings.startMode, provider: applied.settings.provider, tableCount: applied.settings.tableCount, selectionMode: applied.settings.selectionMode, selectedCount: applied.settings.selectedTables.length, baseAmount: applied.settings.baseAmount, staking: applied.settings.staking, maxStake: applied.settings.maxStake, stopLoss: applied.settings.stopLoss, takeProfit: applied.settings.takeProfit, durationMinutes: applied.settings.durationMinutes }, { startMode: "resume", provider: "road", tableCount: "3", selectionMode: "manual", selectedCount: 3, baseAmount: 200, staking: "flat", maxStake: 2000, stopLoss: 900, takeProfit: 800, durationMinutes: 17 }, "manual start after real settlement snapshots the staged next-run draft");
    const newBets = applied.ledger.bets.slice(1);
    assert.equal(newBets.length, 3, "manual start emits exactly the staged three-table batch");
    assert(newBets.every((bet) => bet.amount === 200 && bet.scope === "table" && bet.staking === "flat"), "new automatic bets use only the post-settlement draft, never frozen prior progression");
  } finally {
    await stopAndClose(page);
  }
}

async function testReloadUnresolvedAndAccountIsolation(browser) {
  const page = await openOfflinePage(browser, [{ id: 881, method: "ei", tableName: "RL01" }]);
  try {
    await control(page, "nav-settings").click();
    await choose(page, "single-staking", "flat");
    await approveAndStart(page);
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length === 1, null, { timeout: 4000 });
    await page.evaluate(() => window.__DG_SINGLEPAGE__.stop());
    const preReload = await page.evaluate(() => ({
      persistKey: window.__DG_LEDGER_PERSIST_KEY__,
      bet: structuredClone(window.__DG_SINGLEPAGE__.exportLedger().bets[0]),
      sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length
    }));
    await page.evaluate(() => window.__DG_SINGLEPAGE__.dispose());
    await rerunBundle(page);
    await assertSettingsEditable(page, "reload with unresolved anonymous packet");
    const reloaded = await page.evaluate(() => ({
      state: window.__DG_SINGLEPAGE__.status(),
      ledger: window.__DG_SINGLEPAGE__.exportLedger(),
      sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length
    }));
    assert.equal(reloaded.state.running, false, "reload stays stopped");
    assert.equal(reloaded.state.pending.length, 1, "reload preserves the unresolved order");
    assert.equal(reloaded.ledger.bets[0].state, "uncertain", "reload marks a sent order unresolved rather than clearing it");
    assert.deepEqual({ amount: reloaded.ledger.bets[0].amount, level: reloaded.ledger.bets[0].level, scope: reloaded.ledger.bets[0].scope, staking: reloaded.ledger.bets[0].staking }, { amount: preReload.bet.amount, level: preReload.bet.level, scope: preReload.bet.scope, staking: preReload.bet.staking }, "reload preserves immutable original order terms");
    await assertStartBlockedBeforeAcknowledgement(page, preReload.sent, "reload unresolved packet");

    await page.evaluate(() => {
      window.__DG_SINGLEPAGE__.dispose();
      const original = window.__offlineMobile.playerInfo;
      const isolated = { ...original, playerName: "offline-isolated-account", currency: "ISO" };
      window.__offlineMobile.playerInfo = isolated;
      window.__offlineMobile.stage.playerInfo = isolated;
      for (const card of window.__offlineMobile.cards) card.playerInfo = isolated;
    });
    await rerunBundle(page);
    await assertSettingsEditable(page, "different anonymous account after reload");
    const isolated = await page.evaluate(() => ({
      persistKey: window.__DG_LEDGER_PERSIST_KEY__,
      state: window.__DG_SINGLEPAGE__.status(),
      ledger: window.__DG_SINGLEPAGE__.exportLedger()
    }));
    assert.notEqual(isolated.persistKey, preReload.persistKey, "account identity derives a different ledger storage key");
    assert.equal(isolated.state.pending.length, 0, "a different account never inherits another account's unresolved pending bet");
    assert.equal(isolated.ledger.bets.length, 0, "a different account starts with an isolated ledger");
  } finally {
    await stopAndClose(page);
  }
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
    await testFreshAndStoppedPendingDraft(browser);
    await testReloadUnresolvedAndAccountIsolation(browser);
    console.log("PASS offline-only DG initial settings: fresh controls enabled; stopped pending drafts stay editable; start blocks before acknowledgement; genuine receipt/settlement applies the staged draft; reload preserves unresolved bets; account ledgers isolate. No platform, DB, credentials, HTTP(S), fetch, or WebSocket was used.");
  } finally {
    await browser?.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
