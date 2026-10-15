const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {html:mtHtml}=require('./test-mt-click-console.cjs');
const mtMarker=`<script>Object.defineProperty(window,'__AUTOBAC_MT_FOREGROUND__',{value:Object.freeze({kind:'autobac-mt-foreground-v1',version:1,pathPrefix:'/mt-game',ledgerKey:'mt.session.'+'c'.repeat(32)}),writable:false,configurable:false});</script>`;
const mtSource=fs.readFileSync(path.join(__dirname,'../public/mt-native-click-console.js'),'utf8');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/tmp/dg-testdeps/node_modules/playwright'); }

(async () => {
  const browser = await playwright.chromium.launch({headless: true, executablePath: process.env.DG_TEST_CHROME || '/usr/bin/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 1440, height: 960}});
  const outputDir = process.env.AUTOBAC_SCREENSHOT_DIR;
  if (outputDir) fs.mkdirSync(outputDir, {recursive: true});
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
        u.pathname === '/api/v2/game/MTLI/login' ? {code: 200, data: {url: 'https://gsa.ofalive99.net/?token=offline-mt-token&lang=zhtw'}} :
        u.pathname === '/api/v2/game/DGLI/login' ? {code: 200, data: {url: 'https://dg-offline.example/ddnewpc/index.html?token=offline-game-token'}} : null;
      assert.notEqual(data, null, 'Only login and DGLI are permitted; got ' + u.pathname);
      requests.push(u.pathname);
      return route.fulfill({contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(data)});
    }
    if (u.pathname === '/api/dg/proxy/enter') {
      requests.push(u.pathname);
      return route.fulfill({contentType: 'application/json', body: JSON.stringify({ok: true, url: '/ddnewpc/index.html?token=offline-game-token'})});
    }
    if(u.pathname==='/api/mt/proxy/enter'){requests.push(u.pathname);return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,url:'/mt-game/'})});}
    if(u.pathname==='/mt-game/')return route.fulfill({contentType:'text/html',body:mtHtml().replace('<!doctype html>',`<!doctype html>${mtMarker}<script defer src="/mt-native-click-console.js" data-autobac-mt-console="1"></script>`)});
    if(u.pathname==='/mt-native-click-console.js')return route.fulfill({contentType:'application/javascript',body:mtSource});

    if (u.pathname === '/ddnewpc/index.html') {
      return route.fulfill({contentType:'text/html',body:"<html><head><script>const main={currentView:{viewName:'GameLobby'},playerInfo:{layout:0},numChildren:0,getChildAt:function(){}};const multi={buttonName:'MultiLobby',gameId:0,visible:true,mouseEnabled:true,event:function(){window.__MULTI_NAV_COUNT__=(window.__MULTI_NAV_COUNT__||0)+1;main.currentView.viewName='MultiLobby';}};main.gameLeftMan={classicBtnArr:[multi]};window.Laya={Event:{CLICK:'click'},stage:{numChildren:1,getChildAt:function(){return main;}}};</script></head><body style='background:black;color:white'>離線DG場景；未連平台</body></html>"});
    }
    if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') { requests.push('BLOCKED ' + u.hostname + u.pathname); return route.abort(); }
    return route.continue();
  });
  try {
    await page.goto('http://127.0.0.1:8082/', {waitUntil: 'domcontentloaded', timeout: 90000});
    await page.waitForTimeout(1800);
    await page.getByTestId('autobac-access-title').waitFor();
    assert.equal(await page.getByText('MT ASSISTANT · ACCESS', {exact: true}).count(), 0);
    assert.equal(await page.locator('video').count(), 1, 'Preserve original poker backdrop');
    const geometry = await page.getByTestId('autobac-access-card').evaluate(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));
    assert.equal(geometry.width,480,'Original card width must stay 480px');
    assert(geometry.height<560,'No new long introduction area');
    assert.equal(Math.round((await page.getByTestId('autobac-username').boundingBox()).height),48);
    assert.equal(Math.round((await page.getByTestId('autobac-login').boundingBox()).height),50);
    assert.equal(await page.getByText('MT工程師',{exact:true}).count(),1);
    assert.equal(await page.getByText('@uss0857',{exact:true}).count(),1);
    assert.equal(await page.getByText('FOLLOW',{exact:true}).count(),1);
    if(outputDir)await page.getByTestId('autobac-access-card').screenshot({path:path.join(outputDir,'login-card-original-size.png')});
    if (outputDir) await page.screenshot({path: path.join(outputDir, 'login-desktop.png'), fullPage: true});
    for (const size of [{width:390,height:844},{width:320,height:700}]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Login horizontal overflow');
    }
    await page.setViewportSize({width:390,height:844});
    if (outputDir) await page.screenshot({path: path.join(outputDir, 'login-mobile.png'), fullPage: true});

    await page.getByPlaceholder('輸入 TZ 帳號', {exact: true}).pressSequentially('offline-test-user', {delay: 30});
    await page.getByPlaceholder('輸入密碼', {exact: true}).pressSequentially('not-a-real-password', {delay: 30});
    await page.getByPlaceholder('輸入密碼', {exact: true}).press('Tab');
    await page.waitForTimeout(200);
    await page.getByText('安全登入', {exact: true}).click();
    await page.getByTestId('choose-dg').waitFor();
    assert.equal(requests.filter(x => /DGLI|MTLI/.test(x)).length, 0, 'No game authorization before platform choice');
    for(const id of ['choose-dg','choose-mt']){const box=await page.getByTestId(id).boundingBox();assert(box.width>=44&&box.height>=44&&box.y+box.height<=844,'Both large logos must be reachable on phone');}
    if (outputDir) await page.screenshot({path:path.join(outputDir,'platform-choice-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:960});
    if (outputDir) await page.screenshot({path:path.join(outputDir,'platform-choice-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.getByTestId('choose-dg').click();
    await page.waitForSelector('iframe[title="DG 真人遊戲"]', {timeout: 30000});
    await page.waitForFunction(() => {
      const f = document.querySelector('iframe[title="DG 真人遊戲"]');
      return !!f?.contentWindow?.__DG_SINGLEPAGE__;
    }, {timeout: 30000});
    const status = await page.evaluate(() => document.querySelector('iframe[title="DG 真人遊戲"]').contentWindow.__DG_SINGLEPAGE__.status());
    assert.equal(status.running, false, 'Login/installation must not start betting');
    assert.equal(await page.evaluate(()=>document.querySelector('iframe').contentWindow.__MULTI_NAV_COUNT__),1,'Auto multi-hall entry exactly once');
    assert.equal(status.roomCount, '1');
    assert.equal(requests.filter(x => x === '/api/v2/game/DGLI/login').length, 1, 'Exactly one DG authorization');
    assert.equal(requests.filter(x => /MTLI|SALI|LIVE77|wallet/.test(x)).length, 0, 'No other platform or wallet operations');
    assert.equal(await page.getByText('回牌路', {exact: true}).count(), 0);
    assert.equal(await page.getByText('即時多桌牌路', {exact: true}).count(), 0);
    const frame = page.frame({url: /\/ddnewpc\/index\.html/});
    const header = page.getByTestId('autobac-game-header');
    for (const id of ['header-platform','header-help','header-reconnect','header-logout']) await page.getByTestId(id).waitFor();
    assert.equal(await header.getByRole('button').count(),4,'Only four useful actions remain permanently on top');
    assert.equal(await page.getByTestId('header-collapse-mobile').count(),0,'No dropdown or collapse control');
    await frame.evaluate(() => window.__AUTOBAC_FRAME_MARKER__ = 'same-document');
    await page.getByTestId('header-help').click();
    await page.getByTestId('autobac-help').waitFor();
    await page.evaluate(() => {
      window.__AUTOBAC_LINKS__ = [];
      window.open = (url, target, features) => { window.__AUTOBAC_LINKS__.push({url,target,features}); return null; };
    });
    for (const id of ['header-threads','header-line','header-register']) await page.getByTestId(id).click();
    const links = await page.evaluate(() => window.__AUTOBAC_LINKS__);
    assert.equal(links[0].url, 'https://www.threads.com/@uss0857?igshid=NTc4MTIwNjQ2YQ==');
    assert.equal(links[1].url, 'https://line.me/ti/p/k2pkYGXGL3');
    assert.equal(links[2].url, 'https://shy9453.tz6868.cc');
    assert(links.every(x => x.target === '_blank' && x.features.includes('noopener')));
    await page.getByTestId('autobac-help').waitFor();
    assert.equal(await page.getByText('自動下注使用說明', {exact:true}).count(), 1);
    await page.getByRole('button', {name:'關閉使用說明',exact:true}).click();
    assert.equal(await page.getByRole('button', {name:'展開頂部資訊',exact:true}).count(),0,'Useful actions are never hidden in a dropdown');
    assert.equal(await frame.evaluate(() => window.__AUTOBAC_FRAME_MARKER__), 'same-document', 'Help must not reload DG');
    assert.equal(await frame.evaluate(() => window.__DG_SINGLEPAGE__.status().running), false, 'Header actions must not start betting');
    for (const size of [{width:390,height:844},{width:320,height:700},{width:1440,height:960}]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(180);
      const fits = await header.evaluate(n => n.scrollWidth <= n.clientWidth + 1);
      assert(fits, 'Header overflow at ' + size.width);
      for (const id of ['header-platform','header-help','header-reconnect','header-logout']) assert(await page.getByTestId(id).isVisible());
      const boxes=await Promise.all(['header-platform','header-reconnect','header-help','header-logout'].map(id=>page.getByTestId(id).boundingBox()));
      assert(boxes.every(box=>Math.abs(box.y-boxes[0].y)<1),'All useful buttons remain on one row');
      const top=await header.boundingBox();assert.equal(Math.round(top.height),56);assert.equal(Math.round(top.y),0);
      if(size.width<850)assert(boxes.every(box=>box.width>=44&&box.height>=44),'Phone touch targets are 44px');
      for(const id of ['header-line','header-register','header-record','header-diagnostics'])assert.equal(await header.getByTestId(id).count(),0,'Auxiliary tools do not occupy header');
      if (outputDir && size.width !== 320) await header.screenshot({path:path.join(outputDir, size.width === 390 ? 'header-mobile.png' : 'header-desktop.png')});
    }
    await page.setViewportSize({width:390,height:844});

    await frame.evaluate(() => {
      const main=window.Laya.stage.getChildAt(0), handlers=[];
      const socket={socket:{connected:true},on:(event,owner,fn)=>handlers.push({event,owner,fn}),off:(event,owner,fn)=>{for(let i=handlers.length-1;i>=0;i--)if(handlers[i].event===event&&handlers[i].owner===owner&&handlers[i].fn===fn)handlers.splice(i,1);},sendData:()=>undefined};
      main.playerInfo.balance=1234.56;main.playerInfo.selectChip=100;main.playerInfo.socketMan=socket;
      main._children=[{tableId:60102,gameInfo:{tableName:'RB02',stateId:0,gameNo:'manual-ui',countDown:0,roadArray:[]},playerInfo:main.playerInfo,betBtn:{Banker:{},Player:{}},betMan:{confirm:{},cancel:{}},betMoneyTmp:{},betMoneyTrue:{},confirmBet(){}}];
      window.__MANUAL_TEST_SEND__=()=>{socket.sendData({cmd:6,tableId:60102,gameNo:'manual-ui'});for(const h of handlers.filter(h=>h.event==='RECEIVED_SUCCESS'))h.fn({cmd:6,tableId:60102,gameNo:'manual-ui',codeId:0,list:['{"banker":100}']});for(const h of handlers.filter(h=>h.event==='RECEIVED_SUCCESS'))h.fn({cmd:1007,tableId:60102,gameNo:'manual-ui',codeId:0,dList:[1234.56,95]});};
    });
    await page.getByTestId('header-help').click();
    await page.getByTestId('header-record').click();
    await page.getByTestId('dg-live-diagnostics').waitFor();
    await page.waitForFunction(()=>document.querySelector('[data-testid="dg-live-diagnostics"]').textContent.includes('1,234.56'));
    await frame.evaluate(()=>window.__MANUAL_TEST_SEND__());
    await page.waitForFunction(()=>document.querySelector('[data-testid="dg-live-diagnostics"]').textContent.includes('接受 1'));
    const diagnosticText=await page.getByTestId('dg-live-diagnostics').innerText();
    assert(diagnosticText.includes('送出 1')&&diagnosticText.includes('結算 1'),'Live diagnostic shows matched native lifecycle');
    assert.equal(await frame.evaluate(()=>window.__DG_SINGLEPAGE__.status().running),false,'Diagnostic recording never starts the automatic engine');
    if(outputDir)await page.screenshot({path:path.join(outputDir,'dg-mobile-live-diagnostics.png'),fullPage:true});
    await page.getByTestId('header-help').click();
    const downloadPromise=page.waitForEvent('download');
    await page.getByTestId('header-record').click();
    const download=await downloadPromise;assert.equal(download.suggestedFilename(),'AutoBac-DG-manual-flow.json');
    assert.equal(await page.getByTestId('dg-live-diagnostics').count(),0,'Diagnostic window closes after export');
    assert.equal(await frame.evaluate(()=>window.__DG_SINGLEPAGE__.status().running),false,'Export does not resume automatic wagering');
    const before = await frame.evaluate(() => window.__DG_SINGLEPAGE__.status().running);
    await page.getByText('重連', {exact: true}).click();
    await page.waitForFunction(() => !!document.querySelector('iframe[title="DG 真人遊戲"]')?.contentWindow?.__DG_SINGLEPAGE__);
    assert.equal(before, false);
    assert.equal(requests.filter(x => x === '/api/v2/game/DGLI/login').length, 1, 'Reconnect reuses authorized URL');
    const activeFrame = page.frame({url:/\/ddnewpc\/index\.html/});
    await activeFrame.evaluate(() => {
      const agent = window.__DG_SINGLEPAGE__;
      window.__REAL_DG_STATUS__ = agent.status;
      agent.status = () => ({...window.__REAL_DG_STATUS__(),pending:[{id:'offline-pending-lock'}]});
    });
    await page.getByTestId('header-platform').click();
    await page.getByTestId('pending-departure').waitFor();
    assert.equal(await page.getByTestId('choose-mt').count(), 0, 'Pending DG wager must prevent platform switch');
    await page.getByText('返回核對',{exact:true}).click();
    await activeFrame.evaluate(() => { window.__DG_SINGLEPAGE__.status = window.__REAL_DG_STATUS__; });
    await page.getByTestId('header-platform').click();
    await page.getByTestId('choose-mt').waitFor();
    await page.getByTestId('choose-mt').click();
    await page.waitForSelector('iframe[title="MT 真人遊戲"]');
    await page.getByTestId('mt-native-status').waitFor();
    assert.equal(requests.filter(x=>x==='/api/v2/game/MTLI/login').length,1,'Only one MT authorization');
    assert.equal(requests.filter(x=>x==='/api/v2/game/DGLI/login').length,1,'MT choice must not reauthorize DG');
    await page.waitForFunction(()=>!!document.querySelector('iframe[title="MT 真人遊戲"]')?.contentWindow?.__MT_NATIVE_CLICK__);
    const mtFrame = page.frame({url:/\/mt-game\//});
    assert.equal(await mtFrame.evaluate(()=>!!window.__DG_SINGLEPAGE__),false,'Never inject DG engine into MT');
    assert.equal(await mtFrame.evaluate(()=>window.__MT_NATIVE_CLICK__.view().running),false,'MT installation must not auto-bet');
    assert.equal(await mtFrame.evaluate(()=>new URLSearchParams(location.search).get('token')),'offline-mt-token','Native MT client receives only this authorized user token');
    await mtFrame.evaluate(()=>{window.__REAL_MT_VIEW__=window.__MT_NATIVE_CLICK__.view;window.__MT_NATIVE_CLICK__.view=()=>({...window.__REAL_MT_VIEW__(),pending:1,bets:[{state:'uncertain'}]});});
    await page.getByTestId('header-platform').click();
    await page.getByTestId('pending-departure').waitFor();
    await page.getByTestId('mt-confirm-departure').click();
    assert.equal(await page.getByTestId('choose-dg').count(),0,'A label cannot bypass a real MT pending lock');
    await page.getByText('返回核對',{exact:true}).click();
    assert.equal(await page.locator('iframe[title="MT 真人遊戲"]').count(),1,'Cancel retains MT document');
    await mtFrame.evaluate(()=>{window.__MT_NATIVE_CLICK__.view=window.__REAL_MT_VIEW__;});
    await page.getByTestId('header-platform').click();
    await page.getByTestId('choose-dg').waitFor();
    await page.getByTestId('choose-dg').click();
    await page.waitForFunction(()=>!!document.querySelector('iframe[title="DG 真人遊戲"]')?.contentWindow?.__DG_SINGLEPAGE__);
    assert.equal(requests.filter(x=>x==='/api/v2/game/DGLI/login').length,1,'Returning to DG uses prior authorized URL, no second Token');
    assert.equal(await page.evaluate(()=>document.querySelector('iframe[title="DG 真人遊戲"]').contentWindow.__DG_SINGLEPAGE__.status().running),false);
    await page.getByText('登出', {exact: true}).click();
    await page.getByPlaceholder('輸入 TZ 帳號', {exact: true}).waitFor();
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS：手機診斷按鈕→即時餘額／桌卡／送出接受結算→JSON下載且不恢復自動下注；原登入→MT/DG選擇前不取遊戲Token→DG面板初始停止→待結算禁止切換→MT完整面板初始停止→兩平台待結算均阻擋切換→返回DG不重取Token→登出。全程離線攔截，無真實帳密或下注。');
  } catch (e) { console.error('Requests:',requests); console.error('Page:',await page.locator('body').innerText()); console.error('Runtime:',errors); console.error('Frame debug:',await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>{try{return {url:f.src,href:f.contentDocument?.location.href,stage:!!f.contentWindow.Laya?.stage,main:f.contentWindow.Laya?.stage?.getChildAt(0)?.currentView,count:f.contentWindow.__MULTI_NAV_COUNT__}}catch(e){return {url:f.src,error:String(e)}}}))); throw e; } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
