#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
let playwright; try { playwright = require('playwright'); } catch { playwright = require('/tmp/dg-testdeps/node_modules/playwright'); }
const { openOfflinePage, configure, approveAndStart, waitForCmd6, stopAndClose, packetPayload } = require('./test-dg-mobile-v329-complete.cjs');
const out = '/home/ubuntu/autobac-v327-check';
async function installClock(page) {
  await page.evaluate(() => {
    const base = Date.now(); window.__testOffset = 0;
    Date.now = () => base + window.__testOffset;
    for (const card of window.__offlineMobile.cards) { card.gameInfo.countDown = 3600; card.gameInfo.starTime = base; }
  });
}
async function swipe(page, client, locator, direction) {
  const box = await locator.boundingBox(); assert(box);
  const x = box.x + 4;
  const start = direction < 0 ? box.y + box.height - 20 : box.y + 20;
  const distance = Math.min(170, box.height - 45) * direction;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: start, id: 1 }] });
  for (let i = 1; i <= 12; i++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: start + distance * i / 12, id: 1 }] });
    await page.waitForTimeout(16);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(80);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await playwright.chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await openOfflinePage(context, [{ id: 701, method: 'ei' }]);
    try {
      await page.evaluate(() => {
        const meta = document.createElement('meta'); meta.name = 'viewport'; meta.content = 'width=device-width,initial-scale=1'; document.head.appendChild(meta);
        window.__vendorCaptureMoves = 0; window.__vendorBubbleMoves = 0;
        document.addEventListener('touchmove', e => { window.__vendorCaptureMoves++; e.preventDefault(); }, { capture: true, passive: false });
        document.addEventListener('touchmove', () => window.__vendorBubbleMoves++, { passive: false });
      });
      await page.waitForTimeout(100);
      const host = page.locator('#__dg_singlepage_panel__');
      await host.locator('#nav-settings').tap();
      const settings = host.locator('#settings-page');
      assert(await settings.evaluate(el => el.scrollHeight > el.clientHeight + 30));
      const client = await context.newCDPSession(page);
      await swipe(page, client, settings, -1);
      assert(await settings.evaluate(el => el.scrollTop) > 30, 'real touch swipe scrolls even when vendor capture cancels default');
      assert.equal(await page.evaluate(() => window.__vendorBubbleMoves), 0, 'panel touchmove does not leak into game bubble handler');
      assert(await page.evaluate(() => window.__vendorCaptureMoves) > 0, 'adversarial capture handler was actually invoked');
      await swipe(page, client, settings, 1);
      assert(await settings.evaluate(el => el.scrollTop) < 10, 'reverse swipe reaches top');
      await host.locator('#duration-minutes').fill('1');
      assert.equal(await host.locator('#duration-minutes').inputValue(), '1');
      await host.locator('#nav-overview').tap();
      assert(await host.locator('#session-elapsed').isVisible());
      await host.locator('#zoom-out').tap();
      assert(await host.locator('#session-elapsed').isVisible(), 'mini retains usage time');
      await host.locator('#zoom-out').tap();
      await host.locator('#nav-logs').tap();
      await page.evaluate(() => {
        const events = document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('events');
        for (let i = 0; i < 35; i++) { const node = document.createElement('p'); node.textContent = '匿名捲動測試紀錄 ' + i; events.appendChild(node); }
      });
      await swipe(page, client, host.locator('#events'), -1);
      assert(await host.locator('#events').evaluate(el => el.scrollTop) > 20, 'log contents scroll');
      assert.equal(await page.evaluate(() => window.__offlineMobile.sent.filter(m => m.cmd === 6).length), 0, 'swiping and settings never send a bet');
      await host.locator('#nav-overview').tap();
      await page.screenshot({ path: out + '/mobile-timer.png' });
      console.log('PASS trusted mobile touch: settings/logs scroll, reverse swipe, vendor cancellation isolation, inputs/buttons and mini timer visible; zero wagers.');
    } finally { await stopAndClose(page); }

    const timed = await openOfflinePage(context, [{ id: 702, method: 'Ki' }]);
    try {
      await installClock(timed);
      await timed.evaluate(() => {
        window.__anonymousUsageReports = []; window.__anonymousSettingsEvents = [];
        window.addEventListener('autobac-dg-usage-report', event => window.__anonymousUsageReports.push(event.detail.report));
        window.addEventListener('autobac-dg-run-started', event => window.__anonymousSettingsEvents.push(event.detail));
      });
      await configure(timed, { count: '1', staking: 'flat' });
      await timed.evaluate(() => document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('duration-minutes').value = '1');
      assert.equal(await timed.evaluate(() => window.__DG_SINGLEPAGE__.status().usage.started), false);
      await approveAndStart(timed); await waitForCmd6(timed, 1, 'first anonymous native packet');
      const startReports = await timed.evaluate(() => ({ reports: window.__anonymousUsageReports, settings: window.__anonymousSettingsEvents }));
      assert.equal(startReports.settings.length, 1, 'actual trusted start emits one settings snapshot');
      assert.equal(startReports.reports.length, 1, 'actual trusted start emits the zero-second usage baseline');
      assert.equal(startReports.reports[0].runId, startReports.settings[0].eventId, 'settings event and usage report share one run UUID');
      assert.equal(startReports.reports[0].settingsEventId, startReports.reports[0].runId);
      assert.equal(startReports.reports[0].sequence, 0);
      assert.equal(startReports.reports[0].elapsedMs, 0);
      assert.equal(startReports.reports[0].status, 'active');
      assert.equal(startReports.reports[0].stopCode, null);
      const packet = await timed.evaluate(() => window.__offlineMobile.sent.find(m => m.cmd === 6));
      const payload = packetPayload(packet); delete payload.info;
      await timed.evaluate(msg => window.__offlineMobile.emit('RECEIVED_SUCCESS', msg), { cmd: 6, codeId: 0, tableId: packet.tableId, gameNo: packet.gameNo, list: [JSON.stringify(payload)] });
      await timed.evaluate(() => window.__testOffset = 60000);
      await timed.waitForFunction(() => window.__DG_SINGLEPAGE__.status().running === false);
      let state = await timed.evaluate(() => ({ s: window.__DG_SINGLEPAGE__.status(), l: window.__DG_SINGLEPAGE__.exportLedger() }));
      assert.match(state.s.status, /設定 1 分鐘/);
      assert.equal(state.s.usage.elapsedText, '00:01:00');
      assert.equal(state.l.bets[0].state, 'accepted', 'time limit does not erase accepted lock');
      await timed.evaluate(msg => window.__offlineMobile.emit('RECEIVED_SUCCESS', msg), { cmd: 1007, codeId: 0, tableId: packet.tableId, gameNo: packet.gameNo, dList: [0, 100] });
      await timed.evaluate(() => { window.__testOffset = 90000; window.__offlineMobile.cards[0].gameInfo.gameNo = 'next-offline'; });
      await timed.waitForTimeout(650);
      state = await timed.evaluate(() => ({ s: window.__DG_SINGLEPAGE__.status(), l: window.__DG_SINGLEPAGE__.exportLedger(), count: window.__offlineMobile.sent.filter(m => m.cmd === 6).length }));
      assert.equal(state.l.bets[0].state, 'settled', 'accepted order still settles after automatic stop');
      assert.equal(state.s.usage.elapsedText, '00:01:00', 'stopped usage freezes');
      assert.equal(state.count, 1, 'next round cannot send after expiry');
      const previousUsage = await timed.evaluate(() => window.__DG_SINGLEPAGE__.usageHistory()[0]);
      assert.equal(previousUsage.elapsedText, '00:01:00');
      assert.equal(previousUsage.pnl, 100, 'late settlement belongs to completed usage');
      assert.equal(previousUsage.pendingCount, 0);
      const usageReports = await timed.evaluate(() => window.__anonymousUsageReports);
      const stopped = usageReports.find(report => report.status === 'stopped');
      const settledUpdate = usageReports.at(-1);
      assert(stopped && stopped.stopCode === 'time_limit' && stopped.endedAt !== null, 'auto timeout sends an enumerated stopped report');
      assert.equal(settledUpdate.runId, startReports.reports[0].runId, 'late settlement stays on the stopped run, not a future run');
      assert.equal(settledUpdate.result.settledPnl, 100, 'late formal settlement updates aggregate only');
      assert.equal(settledUpdate.result.pendingCount, 0);
      const timedHost = timed.locator('#__dg_singlepage_panel__');
      await timedHost.locator('#nav-logs').click();
      await timedHost.locator('#last-usage').click();
      const usageReportText=await timedHost.locator('#report-body').innerText();
      assert(usageReportText.includes('00:01:00') && usageReportText.includes('已結算輸贏 +100'), usageReportText || 'Empty usage report');
      await timedHost.locator('#close-report').click();
      await timed.evaluate(() => document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('duration-minutes').value = '2');
      await approveAndStart(timed);
      assert.equal(await timed.evaluate(() => window.__DG_SINGLEPAGE__.status().usage.elapsedText), '00:00:00', 'new run resets usage');
      const restartedUsage = await timed.evaluate(() => window.__DG_SINGLEPAGE__.usageHistory());
      assert.equal(restartedUsage[0].elapsedText, '00:00:00');
      assert.equal(restartedUsage[0].pnl, 0);
      assert.equal(restartedUsage[1].pnl, 100, 'new start never clears last run winnings');
      assert.equal(restartedUsage[1].elapsedText, '00:01:00');
      console.log('PASS usage history: shared settings/run UUID, zero baseline, enumerated stop, late settlement aggregate, record UI, restart zero, previous record retained.');
      console.log('PASS production native timer: 1-minute auto stop, no extra packet, accepted lock preserved and settled, frozen display, restart resets. Offline only.');
    } finally { await stopAndClose(timed); }
    const recovered = await openOfflinePage(context, [{ id: 705, method: 'ei' }]);
    try {
      await installClock(recovered);
      await recovered.evaluate(() => {
        const values = new Map();
        Object.defineProperty(window, 'localStorage', { configurable: true, value: {
          getItem: key => values.has(key) ? values.get(key) : null,
          setItem: (key, value) => values.set(key, String(value)),
          removeItem: key => values.delete(key), clear: () => values.clear(), key: index => [...values.keys()][index] || null,
          get length() { return values.size; },
        }});
        window.__anonymousUsageReports = [];
        window.addEventListener('autobac-dg-usage-report', event => window.__anonymousUsageReports.push(event.detail.report));
      });
      await configure(recovered, { count: '1', staking: 'flat' }); await approveAndStart(recovered); await waitForCmd6(recovered, 1, 'checkpoint old packet');
      const old = await recovered.evaluate(() => ({ report: window.__anonymousUsageReports[0], packet: window.__offlineMobile.sent.find(m => m.cmd === 6) }));
      const oldPayload = packetPayload(old.packet); delete oldPayload.info;
      await recovered.evaluate(msg => window.__offlineMobile.emit('RECEIVED_SUCCESS', msg), { cmd: 6, codeId: 0, tableId: old.packet.tableId, gameNo: old.packet.gameNo, list: [JSON.stringify(oldPayload)] });
      await recovered.evaluate(() => window.__DG_SINGLEPAGE__.stop('已停止；保留待結算帳本'));
      const stopped = await recovered.evaluate(id => window.__anonymousUsageReports.find(r => r.runId === id && r.status === 'stopped'), old.report.runId);
      assert(stopped && stopped.stopCode === 'manual', 'manual stop has a real stopped report before rebuilding');
      const oldReportCount = await recovered.evaluate(id => window.__anonymousUsageReports.filter(r => r.runId === id).length, old.report.runId);
      await recovered.evaluate(() => window.__DG_SINGLEPAGE__.dispose());
      await recovered.addScriptTag({ path: require('node:path').resolve(__dirname, '../public/dg-direct-bet-console.js') });
      const beforeNew = await recovered.evaluate(id => window.__anonymousUsageReports.filter(r => r.runId === id), old.report.runId);
      assert.equal(beforeNew.length, oldReportCount, 'rebuild does not backfill or replay a stopped checkpoint without a new observation');
      assert.equal(await recovered.evaluate(() => window.__DG_SINGLEPAGE__.status().running), false, 'rebuild never auto-starts a recovered run');
      await recovered.evaluate(msg => window.__offlineMobile.emit('RECEIVED_SUCCESS', msg), { cmd: 1007, codeId: 0, tableId: old.packet.tableId, gameNo: old.packet.gameNo, dList: [0, 77] });
      const after = await recovered.evaluate(id => ({ history: window.__DG_SINGLEPAGE__.usageHistory(), ledger: window.__DG_SINGLEPAGE__.exportLedger(), reports: window.__anonymousUsageReports.filter(r => r.runId === id) }), old.report.runId);
      const late = after.reports.at(-1);
      assert.equal(late.runId, old.report.runId, 'late settlement uses the original checkpointed UUID after reload');
      assert.equal(late.status, 'stopped'); assert(late.sequence > stopped.sequence, `recovered sequence remains strictly monotonic: ${JSON.stringify({ stopped, late, ledger: after.ledger, history: after.history, reports: after.reports })}`);
      assert.equal(late.result.settledPnl, 77); assert.equal(late.result.pendingCount, 0);
      assert.equal(after.history.find(r => r.id === old.report.runId).pnl, 77, 'late settlement remains attributed to the original recovered run');
      console.log('PASS anonymous v5 checkpoint reload: no history backfill, stopped UUID/sequence survives rebuild, and late settlement stays on the source run.');
    } finally { await stopAndClose(recovered); }
    const interrupted = await openOfflinePage(context, [{ id: 706, method: 'Ki' }]);
    try {
      await installClock(interrupted);
      await interrupted.evaluate(() => {
        const values = new Map();
        Object.defineProperty(window, 'localStorage', { configurable: true, value: {
          getItem: key => values.has(key) ? values.get(key) : null,
          setItem: (key, value) => values.set(key, String(value)),
          removeItem: key => values.delete(key), clear: () => values.clear(), key: index => [...values.keys()][index] || null,
          get length() { return values.size; },
        }});
        window.__anonymousUsageReports = [];
        window.addEventListener('autobac-dg-usage-report', event => window.__anonymousUsageReports.push(event.detail.report));
      });
      await configure(interrupted, { count: '1', staking: 'flat' }); await approveAndStart(interrupted); await waitForCmd6(interrupted, 1, 'interrupted checkpoint packet');
      const active = await interrupted.evaluate(() => ({ report: window.__anonymousUsageReports[0], packet: window.__offlineMobile.sent.find(m => m.cmd === 6) }));
      const activePayload = packetPayload(active.packet); delete activePayload.info;
      await interrupted.evaluate(msg => window.__offlineMobile.emit('RECEIVED_SUCCESS', msg), { cmd: 6, codeId: 0, tableId: active.packet.tableId, gameNo: active.packet.gameNo, list: [JSON.stringify(activePayload)] });
      await interrupted.evaluate(() => window.__DG_SINGLEPAGE__.dispose());
      const beforeRebuild = await interrupted.evaluate(id => window.__anonymousUsageReports.filter(r => r.runId === id), active.report.runId);
      assert(beforeRebuild.every(r => r.status === 'active'), 'destruction sends only the permitted final active snapshot');
      await interrupted.addScriptTag({ path: require('node:path').resolve(__dirname, '../public/dg-direct-bet-console.js') });
      const recoveredState = await interrupted.evaluate(id => ({ running: window.__DG_SINGLEPAGE__.status().running, run: window.__DG_SINGLEPAGE__.usageHistory().find(r => r.id === id), reports: window.__anonymousUsageReports.filter(r => r.runId === id) }), active.report.runId);
      assert.equal(recoveredState.running, false); assert.deepEqual({ state: recoveredState.run.state, endedAt: recoveredState.run.endedAt }, { state: 'interrupted', endedAt: null });
      assert.equal(recoveredState.reports.length, beforeRebuild.length, 'reload does not invent an active/stopped recovery report');
      await interrupted.evaluate(msg => window.__offlineMobile.emit('RECEIVED_SUCCESS', msg), { cmd: 1007, codeId: 0, tableId: active.packet.tableId, gameNo: active.packet.gameNo, dList: [0, -35] });
      const interruptedLate = await interrupted.evaluate(id => window.__anonymousUsageReports.filter(r => r.runId === id).at(-1), active.report.runId);
      assert.deepEqual({ status: interruptedLate.status, endedAt: interruptedLate.endedAt, stopCode: interruptedLate.stopCode, settledPnl: interruptedLate.result.settledPnl }, { status: 'interrupted', endedAt: null, stopCode: null, settledPnl: -35 });
      assert(interruptedLate.sequence > beforeRebuild.at(-1).sequence, 'interrupted late settlement retains the original monotonic sequence');
      console.log('PASS anonymous active reload: recovered run is interrupted (not active/stopped), preserves no end time, and late settlement stays reportable.');
    } finally { await stopAndClose(interrupted); }
    const deadline = await openOfflinePage(context, [{ id: 703, method: 'ei' }, { id: 704, method: 'Ki' }]);
    try {
      await installClock(deadline); await configure(deadline, { count: 'all', staking: 'flat' });
      await deadline.evaluate(() => { window.__testBuilderAdvance = 60000; document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('duration-minutes').value = '1'; });
      await approveAndStart(deadline); await deadline.waitForTimeout(600);
      const state = await deadline.evaluate(() => ({ s: window.__DG_SINGLEPAGE__.status(), l: window.__DG_SINGLEPAGE__.exportLedger(), count: window.__offlineMobile.sent.filter(m => m.cmd === 6).length, calls: window.__offlineMobile.nativeCalls.filter(c => c.kind === 'encrypt').length }));
      assert.equal(state.s.running, false);
      assert.equal(state.count, 0, 'expired inside native builder: neither first nor next table may send');
      assert.equal(state.calls, 1, 'only first builder ran, batch was cancelled');
      assert.equal(state.l.bets[0].state, 'aborted', 'unsent reservation is aborted, not accepted or uncertain');
      console.log('PASS expiry inside native builder aborts unsent reservation and cancels the remaining multi-table batch.');
    } finally { await stopAndClose(deadline); }
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
