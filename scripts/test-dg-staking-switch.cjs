#!/usr/bin/env node
/*
 * Anonymous, offline-only regression for the DG one-table/multi-table staking
 * switch.  The shared fixture blocks HTTP(S), fetch, WebSocket, platform
 * endpoints, and uses only literal "offline" data.  It stores no credentials.
 */
"use strict";

const assert = require("node:assert/strict");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const { chromium } = playwright;
const {
  openOfflinePage,
  approveAndStart,
  packetPayload,
  stopAndClose
} = require("./test-dg-mobile-v329-complete.cjs");

const cards = Array.from({ length: 8 }, (_, index) => ({
  id: 910 + index,
  method: index % 2 ? "Ki" : "ei",
  tableName: `RB${String(index + 2).padStart(2, "0")}`
}));

const automaticPackets = (page) => page.evaluate(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1));
const status = (page) => page.evaluate(() => window.__DG_SINGLEPAGE__.status());
const receive = (page, message) => page.evaluate((fixtureMessage) => window.__offlineMobile.emit("RECEIVED_SUCCESS", fixtureMessage), message);
const sendManual = (page, message) => page.evaluate((fixtureMessage) => window.__offlineMobile.socket.sendData(fixtureMessage), message);

function controls(page) {
  const host = page.locator("#__dg_singlepage_panel__");
  return {
    host,
    count: host.locator("#count"),
    parallelCount: host.locator("#parallel-count"),
    staking: host.locator("#single-staking"),
    stopLoss: host.locator("#stop-loss"),
    takeProfit: host.locator("#take-profit"),
    stopLossError: host.locator("#stop-loss-error"),
    compactStop: host.locator("#compact-stop"),
    settings: host.locator("#nav-settings"),
    overview: host.locator("#nav-overview")
  };
}

async function panelSnapshot(page) {
  return page.evaluate(() => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    if (!shadow) throw new Error("production panel did not mount");
    const rect = shadow.getElementById("panel").getBoundingClientRect();
    const state = window.__DG_SINGLEPAGE__.status();
    return {
      state,
      panel: { width: rect.width, height: rect.height },
      values: {
        count: shadow.getElementById("count").value,
        parallelCount: shadow.getElementById("parallel-count").value,
        staking: shadow.getElementById("single-staking").value,
        scope: shadow.getElementById("scope").value
      }
    };
  });
}

async function assertUnchangedSize(page, expected, message) {
  const current = await panelSnapshot(page);
  assert.deepEqual(current.panel, expected, `${message}: switching staking/count must not resize the panel`);
  assert.deepEqual(current.state.panelSize, expected, `${message}: persisted panel dimensions must not change`);
}

async function choose(locator, value, label) {
  // Playwright's selectOption performs a real DOM selection and dispatches the
  // control's input/change path.  Do not set value or internal application
  // state directly in this test.
  await locator.selectOption(value);
  assert.equal(await locator.inputValue(), value, `${label} accepts the selected option before any required coercion`);
}

async function chooseStaking(page, value) {
  const ui = controls(page);
  await ui.settings.click();
  await choose(ui.staking, value, "staking");
}

async function chooseCount(page, value) {
  const ui = controls(page);
  await ui.overview.click();
  await choose(ui.parallelCount, value, "parallel table count");
}

async function waitForControlsLocked(page, wanted, message) {
  await page.waitForFunction((locked) => {
    const shadow = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
    return !!shadow && shadow.getElementById("single-staking").disabled === locked && shadow.getElementById("parallel-count").disabled === locked;
  }, wanted, { timeout: 2500 });
  const ui = controls(page);
  assert.equal(await ui.staking.isDisabled(), wanted, `${message}: staking select is ${wanted ? "locked" : "unlocked"}`);
  assert.equal(await ui.parallelCount.isDisabled(), wanted, `${message}: table-count select is ${wanted ? "locked" : "unlocked"}`);
}

async function settleAutomaticPackets(page, packets) {
  for (const packet of packets) {
    const payload = packetPayload(packet);
    delete payload.info;
    await receive(page, {
      cmd: 6,
      codeId: 0,
      tableId: packet.tableId,
      gameNo: packet.gameNo,
      list: [JSON.stringify(payload)]
    });
    await receive(page, {
      cmd: 1007,
      codeId: 0,
      tableId: packet.tableId,
      gameNo: packet.gameNo,
      dList: [0, 0]
    });
  }
}

async function testIdleSwitchesAndDrafts(browser) {
  const page = await openOfflinePage(browser, cards);
  const ui = controls(page);
  try {
    await ui.settings.click();
    const baseline = await panelSnapshot(page);
    const labels = await page.evaluate(() => [...document.querySelector("#__dg_singlepage_panel__").shadowRoot.querySelectorAll("label")].map((label) => label.textContent));
    assert(labels.some((label) => label.includes("配注方式") && label.includes("馬丁不支援多桌")), "the staking label documents that martingale does not support multiple tables");

    // Use flat first to establish an unlocked multi-table idle state.  Flat must
    // retain every requested table count and selecting it must not begin a run.
    await chooseStaking(page, "flat");
    for (const count of ["3", "5", "all"]) {
      await chooseCount(page, count);
      const flat = await panelSnapshot(page);
      const expectedSelected = count === "all" ? cards.length : Number(count);
      assert.equal(flat.state.running, false, `flat ${count} remains idle`);
      assert.equal(flat.state.staking, "flat", `flat ${count} remains flat`);
      assert.equal(flat.state.roomCount, count, `flat retains the requested ${count} table count`);
      assert.equal(flat.state.selected.length, expectedSelected, `flat ${count} keeps all requested staged tables`);
      assert.equal(await ui.staking.isDisabled(), false, `staking is editable while idle at flat ${count}`);
      assert.equal((await automaticPackets(page)).length, 0, `changing to flat ${count} never sends an automatic packet`);
      await assertUnchangedSize(page, baseline.panel, `flat ${count}`);

      // This is a user-visible select change from 3/5/all tables, not a direct
      // mutation.  Non-flat must reduce the selection to one table and sync both
      // count controls without starting or sending anything.
      await chooseStaking(page, "martingale");
      const martingale = await panelSnapshot(page);
      assert.equal(martingale.state.running, false, `selecting martingale from ${count} never starts automation`);
      assert.equal(martingale.state.staking, "martingale", `selecting martingale from ${count} enables martingale`);
      assert.equal(martingale.state.scope, "global", "single-table martingale uses the global progression scope");
      assert.equal(martingale.state.roomCount, "1", `selecting martingale from ${count} reduces room count to one`);
      assert(martingale.state.selected.length <= 1, `selecting martingale from ${count} retains at most one selected table`);
      assert.equal(martingale.values.count, "1", "legacy count is synchronized to one");
      assert.equal(martingale.values.parallelCount, "1", "parallel count is synchronized to one");
      assert.equal(await ui.staking.isDisabled(), false, "staking remains editable while the coerced one-table setting is idle");
      assert.equal((await automaticPackets(page)).length, 0, `selecting martingale from ${count} never sends an automatic packet`);
      await assertUnchangedSize(page, baseline.panel, `martingale selected from ${count}`);

      // Returning to flat is also explicit.  The next loop count verifies that a
      // flat selection can again retain multiple tables.
      await chooseStaking(page, "flat");
    }

    // Each staking mode keeps a separate human-entered risk-input draft.  In
    // particular, the exact martingale 2,600 threshold must remain valid and the
    // below-minimum red validation must still appear from actual input events.
    await chooseCount(page, "3");
    await chooseStaking(page, "martingale");
    await ui.stopLoss.fill("2500");
    await ui.stopLoss.blur();
    assert.equal(await ui.stopLossError.isVisible(), true, "a manually entered martingale stop-loss below 2,600 remains visibly invalid");
    assert.match(await ui.stopLossError.textContent(), /2,600/, "the martingale validation names the 2,600 minimum");
    assert.equal(await ui.stopLossError.evaluate((node) => getComputedStyle(node).color), "rgb(255, 114, 126)", "the below-2,600 validation remains red");
    await ui.stopLoss.fill("2600");
    assert.equal(await ui.stopLossError.isVisible(), false, "a manually entered 2,600 stop-loss remains valid");
    assert.equal(await ui.stopLoss.getAttribute("aria-invalid"), "false", "2,600 clears the stop-loss invalid state");
    await ui.takeProfit.fill("9100");

    await chooseStaking(page, "flat");
    await ui.stopLoss.fill("600");
    await ui.takeProfit.fill("800");
    await chooseStaking(page, "martingale");
    assert.equal(await ui.stopLoss.inputValue(), "2600", "martingale retains its original stop-loss draft independently from flat");
    assert.equal(await ui.takeProfit.inputValue(), "9100", "martingale retains its original take-profit draft independently from flat");

    // Reversing the count from one to three must force the effective setting to
    // flat, while preserving the original single-table martingale draft for a
    // later return to one table.
    await chooseCount(page, "3");
    let reversed = await panelSnapshot(page);
    assert.equal(reversed.state.roomCount, "3", "changing count from martingale one-table to three tables takes effect");
    assert.equal(reversed.state.staking, "flat", "changing count from one table to three forces effective flat staking");
    assert.equal(reversed.values.staking, "flat", "the staking select displays the effective flat mode at three tables");
    assert.equal(reversed.state.selected.length, 3, "the reversed three-table choice selects three staged tables");
    assert.equal(await ui.stopLoss.inputValue(), "600", "the effective flat draft is restored when multi-table mode is selected");
    await assertUnchangedSize(page, baseline.panel, "reverse count change to three");

    await chooseCount(page, "1");
    let restored = await panelSnapshot(page);
    assert.equal(restored.state.staking, "martingale", "returning to one table restores the separately retained martingale draft");
    assert.equal(await ui.stopLoss.inputValue(), "2600", "returning to one table restores martingale's independent stop-loss draft");
    await chooseCount(page, "3");
    reversed = await panelSnapshot(page);
    assert.equal(reversed.state.staking, "flat", "a second reverse count change to three remains forced flat");

    // Doubling has the same non-flat restriction: choosing it from a real
    // multi-table select must reduce the count rather than permit a multi-table
    // progressive run.
    await chooseStaking(page, "doubling");
    const doubling = await panelSnapshot(page);
    assert.equal(doubling.state.staking, "doubling", "doubling is enabled after its required one-table coercion");
    assert.equal(doubling.state.scope, "global", "single-table doubling uses the global progression scope");
    assert.equal(doubling.state.roomCount, "1", "choosing doubling from three tables also reduces table count to one");
    assert(doubling.state.selected.length <= 1, "doubling retains at most one selected table");
    assert.equal((await automaticPackets(page)).length, 0, "all idle staking/count changes leave automatic packet count at zero");
    await assertUnchangedSize(page, baseline.panel, "doubling selected from three tables");
  } finally {
    await stopAndClose(page);
  }
}

async function testRunningAndPendingLocks(browser) {
  const page = await openOfflinePage(browser, cards);
  const ui = controls(page);
  try {
    await ui.settings.click();
    const baseline = (await panelSnapshot(page)).panel;
    await chooseStaking(page, "flat");
    await chooseCount(page, "3");
    await approveAndStart(page);
    await page.waitForFunction(() => window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length === 3, null, { timeout: 4000 });

    let running = await status(page);
    assert.equal(running.running, true, "the explicit approved start enters a running state");
    assert.equal(running.pending.length, 3, "the running three-table fixture has three automatic pending packets");
    await waitForControlsLocked(page, true, "running with automatic pending packets");
    await assertUnchangedSize(page, baseline, "running lock");

    // Stop through the panel UI. It halts new sends but deliberately leaves the
    // next-run draft editable; the unresolved original packets remain frozen and
    // block a new start before the acknowledgement dialog can open.
    await ui.compactStop.click();
    let stopped = await status(page);
    assert.equal(stopped.running, false, "the visible stop control stops automation");
    assert.equal(stopped.pending.length, 3, "stopping does not discard automatic pending bets");
    await waitForControlsLocked(page, false, "stopped with automatic packets keeps the next-run draft editable");
    const originalPending = await page.evaluate(() => window.__DG_SINGLEPAGE__.exportLedger().bets.filter((bet) => ["reserved", "submitted", "accepted", "uncertain"].includes(bet.state)).map((bet) => ({ key: bet.key, amount: bet.amount, level: bet.level, scope: bet.scope, staking: bet.staking })));
    await chooseCount(page, "5");
    await page.evaluate(() => window.__DG_SINGLEPAGE__.start());
    const blockedStart = await page.evaluate(() => {
      const shadow = document.querySelector("#__dg_singlepage_panel__").shadowRoot;
      return {
        dialogHidden: shadow.getElementById("risk-dialog").hidden,
        running: window.__DG_SINGLEPAGE__.status().running,
        pending: window.__DG_SINGLEPAGE__.exportLedger().bets.filter((bet) => ["reserved", "submitted", "accepted", "uncertain"].includes(bet.state)).map((bet) => ({ key: bet.key, amount: bet.amount, level: bet.level, scope: bet.scope, staking: bet.staking })),
        sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length
      };
    });
    assert.equal(blockedStart.dialogHidden, true, "pending start is blocked before the acknowledgement dialog can imply that it may proceed");
    assert.equal(blockedStart.running, false, "pending start never resumes automation");
    assert.deepEqual(blockedStart.pending, originalPending, "editing the next-run count never changes original pending amount/scope/staking/level");
    assert.equal(blockedStart.sent, 3, "blocked pending start sends no additional automatic packet");
    const submitted = await automaticPackets(page);
    assert.equal(submitted.length, 3, "stopping adds no extra automatic packets");
    await settleAutomaticPackets(page, submitted);
    await page.waitForFunction(() => {
      const current = window.__DG_SINGLEPAGE__.status();
      return !current.running && current.pending.length === 0 && current.manualPending.length === 0;
    }, null, { timeout: 2500 });
    await waitForControlsLocked(page, false, "stop followed by settlement of every automatic packet");
    assert.equal((await automaticPackets(page)).length, 3, "settling after stop never restarts or adds automatic orders");
    await assertUnchangedSize(page, baseline, "automatic full-settlement unlock");

    // A native/manual packet is injected only through the fixture's observed
    // socket, never through the tool's internal state. It also leaves the draft
    // editable while independently blocking a new start.
    const manual = { cmd: 6, tableId: 999, gameNo: "offline-manual-lock", bet: { banker6: 100 } };
    await sendManual(page, manual);
    await page.waitForFunction(() => window.__DG_SINGLEPAGE__.status().manualPending.length === 1, null, { timeout: 2500 });
    const manualLocked = await status(page);
    assert.equal(manualLocked.running, false, "a manual pending packet does not restart automation");
    assert.equal(manualLocked.manualPending.length, 1, "fixture socket records one manual pending packet");
    await waitForControlsLocked(page, false, "manual packet pending keeps the next-run draft editable");
    await page.evaluate(() => window.__DG_SINGLEPAGE__.start());
    const manualBlocked = await page.evaluate(() => {
      const shadow = document.querySelector("#__dg_singlepage_panel__").shadowRoot;
      return { dialogHidden: shadow.getElementById("risk-dialog").hidden, running: window.__DG_SINGLEPAGE__.status().running, sent: window.__offlineMobile.sent.filter((message) => Number(message?.cmd) === 6 && message.type === 1).length };
    });
    assert.equal(manualBlocked.dialogHidden, true, "manual pending start is blocked before acknowledgement");
    assert.equal(manualBlocked.running, false, "manual pending never restarts automation");
    assert.equal(manualBlocked.sent, 3, "manual pending start sends no automatic packet");

    await receive(page, { cmd: 6, codeId: 0, tableId: manual.tableId, gameNo: manual.gameNo, list: [JSON.stringify(manual.bet)] });
    await receive(page, { cmd: 1007, codeId: 0, tableId: manual.tableId, gameNo: manual.gameNo, dList: [0, 0] });
    await page.waitForFunction(() => window.__DG_SINGLEPAGE__.status().manualPending.length === 0, null, { timeout: 2500 });
    await waitForControlsLocked(page, false, "manual packet fully settled");
    await assertUnchangedSize(page, baseline, "manual full-settlement unlock");

    // Prove the unlocked controls can again receive a genuine user selection.
    await chooseCount(page, "5");
    const unlocked = await panelSnapshot(page);
    assert.equal(unlocked.state.roomCount, "5", "an unlocked count control accepts a new multi-table choice");
    assert.equal(unlocked.state.staking, "flat", "post-settlement multi-table selection remains flat");
    assert.equal(unlocked.state.selected.length, 5, "post-settlement multi-table selection reaches five tables");
  } finally {
    await stopAndClose(page);
  }
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
    await testIdleSwitchesAndDrafts(browser);
    await testRunningAndPendingLocks(browser);
    console.log("PASS offline-only DG staking switch: real select changes cover 3/5/all coercion, flat multi-table retention, independent drafts, 2,600 validation, running/busy control locks, stopped-pending editable drafts with pre-acknowledgement start blocks, full settlement, and unchanged panel size. No platform connection or credentials were used.");
  } finally {
    await browser?.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
