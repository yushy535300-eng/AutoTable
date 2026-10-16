const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require('/tmp/dg-testdeps/node_modules/playwright')); }
const out = process.env.ADMIN_SCREENSHOT_DIR || '/home/ubuntu/v3214-check';
fs.mkdirSync(out, {recursive:true});
for (const name of ['admin-page','admin-audit-reader']) {
  esbuild.buildSync({entryPoints:[path.join(__dirname, '..', 'server', name+'.ts')], outfile:path.join(out,name+'.cjs'), bundle:true, platform:'node', format:'cjs'});
}
const {adminPage} = require(path.join(out,'admin-page.cjs'));
const {adminAuditDetailsPage} = require(path.join(out,'admin-audit-reader.cjs'));
const account = {id:8,platform:'TZ',username:'預覽帳號'};
const now = Date.now();
const settings = {version:1,gamePlatform:'DG',runMode:'continuous',startMode:'fresh',provider:'combined',tableCount:'3',selectionMode:'auto',selectedTables:[],baseAmount:100,staking:'flat',maxStake:2000,stopLoss:350,takeProfit:200,durationMinutes:30,minSeconds:6,currency:'TWD'};
const data = {account,total:1,page:1,pages:1,unavailable:false,rows:[{
  record_source:'usage',run_id:'00000000-0000-4000-8000-000000000008',settings_event_id:'00000000-0000-4000-8000-000000000008',
  status:'stopped',sequence:3,client_started_at_ms:now-665000,client_updated_at_ms:now,client_ended_at_ms:now,
  elapsed_ms:665000,server_updated_at:new Date(now).toISOString(),settings_snapshot:settings,
  report:{stopCode:'time_limit',result:{settledPnl:120,settledCount:4,wins:2,losses:1,pendingCount:1,uncertainCount:0}},
}]};
const html = adminPage(true,'',[{...account,enabled:1,expires_at:null,note:'匿名測試',acknowledgement_count:1,acknowledgement_latest:new Date(now).toISOString()}]);
const records = adminAuditDetailsPage(data,'usage');
const presence = {ok:true,onlineAccounts:4,runningAccounts:2,applications:[
  {appId:'autobac',name:'AutoBac',onlineAccounts:3,runningAccounts:2},
  {appId:'baccarat-helper',name:'百家輔助',onlineAccounts:2,runningAccounts:0},
  {appId:'scarab-heart',name:'聖甲之心',onlineAccounts:1,runningAccounts:0},
]};
(async()=>{
 const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const width of [390,1180]) {
   const context = await browser.newContext({viewport:{width,height:900}});
   const page = await context.newPage();
   await page.route('**/*',async route=>{
    const p = new URL(route.request().url()).pathname;
    if (p==='/admin') return route.fulfill({status:200,contentType:'text/html',body:html});
    if (p==='/api/admin/presence') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(presence)});
    if (p==='/api/admin/whitelist/8/records') return route.fulfill({status:200,contentType:'text/html',body:records});
    return route.abort();
   });
   await page.goto('https://offline-admin.example/admin');
   await page.waitForFunction(()=>document.querySelector('#presence-autobac-online')?.textContent==='3');
   assert.equal(await page.locator('#presence-helper-online').textContent(),'2');
   assert.equal(await page.locator('#presence-scarab-online').textContent(),'1');
   assert.equal(await page.locator('#presence-total-online').textContent(),'4');
   assert.equal(await page.locator('#presence-autobac-running').textContent(),'2');
   await page.screenshot({path:path.join(out,`admin-${width}.png`),fullPage:true});
   await page.getByRole('link',{name:'使用紀錄',exact:true}).click();
   assert.equal(await page.locator('.tabs a').count(),2);
   assert((await page.locator('body').textContent()).includes('00:11:05'));
   assert((await page.locator('body').textContent()).includes('本次已結算輸贏：120'));
   assert.equal(await page.locator('details[open]').count(),0);
   await page.screenshot({path:path.join(out,`records-${width}.png`),fullPage:true});
   await page.getByText('完整設定',{exact:true}).click();
   assert(await page.getByText('基本金額',{exact:true}).isVisible());
   assert(await page.getByText('配注方式',{exact:true}).isVisible());
   await page.screenshot({path:path.join(out,`records-expanded-${width}.png`),fullPage:true});
   await context.close();
  }
  console.log('PASS: 390/1180 admin per-site counts, deduplicated total, two tabs, elapsed usage, PnL, collapsed full settings; all network mocked.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
