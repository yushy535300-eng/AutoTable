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
      await configure(timed, { count: '1', staking: 'flat' });
      await timed.evaluate(() => document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('duration-minutes').value = '1');
      assert.equal(await timed.evaluate(() => window.__DG_SINGLEPAGE__.status().usage.started), false);
      await approveAndStart(timed); await waitForCmd6(timed, 1, 'first anonymous native packet');
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
      console.log('PASS usage history: last duration/profit in record UI, pending settlement backfill, restart zero, previous record retained.');
      console.log('PASS production native timer: 1-minute auto stop, no extra packet, accepted lock preserved and settled, frozen display, restart resets. Offline only.');
    } finally { await stopAndClose(timed); }
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
