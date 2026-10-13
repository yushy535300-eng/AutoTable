const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/tmp/dg-testdeps/node_modules/playwright'); }

(async () => {
  const browser = await playwright.chromium.launch({headless: true, executablePath: process.env.DG_TEST_CHROME || '/usr/bin/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  const errors = [];
  const requests = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', async route => {
    const request = route.request();
    const u = new URL(request.url());
    if (u.pathname.startsWith('/api/trpc/')) {
      const names = decodeURIComponent(u.pathname.slice('/api/trpc/'.length)).split(',');
      const responses = names.map(name => {
        requests.push(name);
        const data = name === 'trackerAccess.resolvePlatform' ? {found: true, platform: 'TZ'} :
          name === 'trackerAccess.login' ? {success: true, sessionId: 'offline-test-session'} :
          name === 'trackerAccess.checkSession' ? {valid: true, reason: 'ok'} :
          name === 'trackerAccess.logout' ? {success: true} : null;
        assert.notEqual(data, null, 'Unexpected procedure: ' + name);
        return {result: {data: {json: data}}};
      });
      return route.fulfill({contentType: 'application/json', body: JSON.stringify(u.searchParams.get('batch') ? responses : responses[0])});
    }
    if (u.hostname === 'www.tz6868.cc') {
      if (request.method() === 'OPTIONS') return route.fulfill({status: 204, headers: {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'}});
      const data = u.pathname === '/api/v1/login' ? {code: 200, data: {token: 'offline-platform-test-token'}} :
        u.pathname === '/api/v2/game/DGLI/login' ? {code: 200, data: {url: 'https://dg-offline.example/ddnewpc/index.html?token=offline-game-token'}} : null;
      assert.notEqual(data, null, 'Only login and DGLI are permitted; got ' + u.pathname);
      requests.push(u.pathname);
      return route.fulfill({contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(data)});
    }
    if (u.pathname === '/api/dg/proxy/enter') {
      requests.push(u.pathname);
      return route.fulfill({contentType: 'application/json', body: JSON.stringify({ok: true, url: '/ddnewpc/index.html?token=offline-game-token'})});
    }
    if (u.pathname === '/ddnewpc/index.html') {
      return route.fulfill({contentType: 'text/html', body: '<html><head><script>window.Laya={stage:{numChildren:0,getChildAt:function(){}}};</script></head><body style="background:black;color:white">離線DG場景；未連平台</body></html>'});
    }
    if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') { requests.push('BLOCKED ' + u.hostname + u.pathname); return route.abort(); }
    return route.continue();
  });
  try {
    await page.goto('http://127.0.0.1:8082/', {waitUntil: 'domcontentloaded', timeout: 90000});
    await page.waitForTimeout(1500);
    await page.getByPlaceholder('輸入 TZ 帳號', {exact: true}).pressSequentially('offline-test-user', {delay: 30});
    await page.getByPlaceholder('輸入密碼', {exact: true}).pressSequentially('not-a-real-password', {delay: 30});
    await page.getByPlaceholder('輸入密碼', {exact: true}).press('Tab');
    await page.waitForTimeout(200);
    await page.getByText('登入並進入 DG', {exact: true}).click();
    await page.waitForSelector('iframe[title="DG 真人遊戲"]', {timeout: 30000});
    await page.waitForFunction(() => {
      const f = document.querySelector('iframe[title="DG 真人遊戲"]');
      return !!f?.contentWindow?.__DG_SINGLEPAGE__;
    }, {timeout: 30000});
    const status = await page.evaluate(() => document.querySelector('iframe[title="DG 真人遊戲"]').contentWindow.__DG_SINGLEPAGE__.status());
    assert.equal(status.running, false, 'Login/installation must not start betting');
    assert.equal(status.roomCount, '1');
    assert.equal(requests.filter(x => x === '/api/v2/game/DGLI/login').length, 1, 'Exactly one DG authorization');
    assert.equal(requests.filter(x => /MTLI|SALI|LIVE77|wallet/.test(x)).length, 0, 'No other platform or wallet operations');
    assert.equal(await page.getByText('回牌路', {exact: true}).count(), 0);
    assert.equal(await page.getByText('即時多桌牌路', {exact: true}).count(), 0);
    const frame = page.frame({url: /\/ddnewpc\/index\.html/});
    const before = await frame.evaluate(() => window.__DG_SINGLEPAGE__.status().running);
    await page.getByText('重連', {exact: true}).click();
    await page.waitForFunction(() => !!document.querySelector('iframe[title="DG 真人遊戲"]')?.contentWindow?.__DG_SINGLEPAGE__);
    assert.equal(before, false);
    assert.equal(requests.filter(x => x === '/api/v2/game/DGLI/login').length, 1, 'Reconnect reuses authorized URL');
    await page.getByText('登出', {exact: true}).click();
    await page.getByPlaceholder('輸入 TZ 帳號', {exact: true}).waitFor();
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS：原登入→只取得一次DG授權→DG全畫面→自動安裝面板但不下注→重連不另取Token→登出回登入。全程離線攔截，無真實帳密或下注。');
  } catch (e) { console.error('Requests:',requests); console.error('Page:',await page.locator('body').innerText()); console.error('Runtime:',errors); throw e; } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
