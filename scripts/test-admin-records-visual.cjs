const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=require('/tmp/dg-testdeps/node_modules/playwright'))}
const project=process.env.ADMIN_PROJECT_ROOT||path.join(__dirname,'..');
const out=process.env.ADMIN_SCREENSHOT_DIR||'/home/ubuntu/v3220-check';fs.mkdirSync(out,{recursive:true});
for(const name of ['admin-page','admin-audit-reader','admin-online-page']){
 const entry=name==='admin-page'&&fs.existsSync(path.join(project,'admin-page.js'))?path.join(project,'admin-page.js'):path.join(project,'server',name+'.ts');
 esbuild.buildSync({entryPoints:[entry],outfile:path.join(out,name+'.cjs'),bundle:true,platform:'node',format:'cjs'});
}
const {adminPage}=require(path.join(out,'admin-page.cjs'));
const {adminAuditDetailsPage}=require(path.join(out,'admin-audit-reader.cjs'));
const {adminOnlinePage}=require(path.join(out,'admin-online-page.cjs'));
const now=Date.now(),account={id:8,platform:'TZ',username:'預覽帳號'};
const settings={version:1,gamePlatform:'DG',runMode:'continuous',startMode:'fresh',provider:'combined',tableCount:'3',selectionMode:'auto',selectedTables:[],baseAmount:100,staking:'flat',maxStake:2000,stopLoss:350,takeProfit:200,durationMinutes:30,minSeconds:6,currency:'TWD'};
const records=adminAuditDetailsPage({account,total:1,page:1,pages:1,unavailable:false,rows:[{record_source:'usage',run_id:'00000000-0000-4000-8000-000000000008',settings_event_id:'00000000-0000-4000-8000-000000000008',status:'stopped',sequence:3,client_started_at_ms:now-665000,client_updated_at_ms:now,client_ended_at_ms:now,elapsed_ms:665000,server_updated_at:new Date(now).toISOString(),settings_snapshot:settings,report:{stopCode:'time_limit',result:{settledPnl:120,settledCount:4,wins:2,losses:1,pendingCount:1,uncertainCount:0}}}]},'usage');
const html=adminPage(true,'',[{...account,enabled:1,expires_at:null,note:'匿名測試',acknowledgement_count:1,acknowledgement_latest:new Date(now).toISOString()}]);
const presence={ok:true,onlineAccounts:4,runningAccounts:2,applications:[{appId:'autobac',name:'AutoBac',onlineAccounts:3,runningAccounts:2},{appId:'baccarat-helper',name:'百家輔助',onlineAccounts:2,runningAccounts:0},{appId:'scarab-heart',name:'聖甲之心',onlineAccounts:1,runningAccounts:0}],onlineUsers:[{appId:'autobac',platform:'TZ',username:'示範 A001'},{appId:'autobac',platform:'OFA',username:'示範 A002'},{appId:'autobac',platform:'TZ',username:'示範 A003'},{appId:'baccarat-helper',platform:'TZ',username:'示範 A001'},{appId:'baccarat-helper',platform:'TZ',username:'示範 A004'},{appId:'scarab-heart',platform:'OFA',username:'示範 A002'}]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [320,390,1180]){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();let response=presence;
   await page.route('**/*',async route=>{
    const p=new URL(route.request().url()).pathname;
    if(p==='/admin-brand-v3220.css'||p.startsWith('/admin-brand-v3215/')||p==='/admin-icon-192.png')return route.fulfill({status:200,contentType:p.endsWith('.css')?'text/css':'image/png',body:fs.readFileSync(path.join(project,'public',p))});
    if(p==='/admin')return route.fulfill({status:200,contentType:'text/html',body:html});
    if(p==='/admin/online')return route.fulfill({status:200,contentType:'text/html',body:adminOnlinePage(new URL(route.request().url()).searchParams.get("app")||"autobac")});
    if(p==='/api/admin/presence')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
    if(p==='/api/admin/whitelist/8/records')return route.fulfill({status:200,contentType:'text/html',body:records});
    return route.abort();
   });
   await page.goto('https://offline-admin.example/admin');await page.waitForFunction(()=>document.querySelector('#presence-autobac-online')?.textContent==='3');
   assert.equal(await page.locator('.presence-stat').count(),3);assert.equal(await page.locator('.program-logo').count(),3);assert.equal(await page.locator('.online-accounts').count(),0);assert.equal(await page.locator('.online-users').count(),0);assert.equal(await page.locator('.program-view-btn').count(),3);assert.equal(await page.locator('.online-view-btn').count(),0);
   const positions=await page.locator('.presence-stat').evaluateAll(nodes=>nodes.map(n=>{const number=n.querySelector('b').getBoundingClientRect(),button=n.querySelector('.program-view-btn').getBoundingClientRect();return {right:button.x>=number.right,overlap:button.y<number.bottom&&button.bottom>number.y}}));assert(positions.every(p=>p.right&&p.overlap),'each view button must be right beside its count');
   if(width<700)assert((await page.locator('.online-section').boundingBox()).height<160,'compact mobile section under 160px');
   assert.equal(await page.locator('#presence-total-online,#presence-autobac-running').count(),0);
   assert(await page.locator('.program-logo').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)));
   const cards=await page.locator('.presence-stat').evaluateAll(nodes=>nodes.map(n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y,width:n.getBoundingClientRect().width})));
   assert(cards.every(c=>c.y===cards[0].y),'all three cards horizontal on desktop and mobile');assert(cards[0].x<cards[1].x&&cards[1].x<cards[2].x);assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
   await page.locator('.top').evaluate(n=>n.insertAdjacentHTML('afterend','<p style="color:#aaa;font-size:12px">設計預覽 · 帳號及在線數為匿名示範資料</p>'));
   await page.screenshot({path:path.join(out,`admin-${width}.png`),fullPage:true});
   await page.locator(".online-section").screenshot({path:path.join(out,`online-cards-${width}.png`)});
   for(const [id,count]of [['scarab-heart','1'],['baccarat-helper','2'],['autobac','3']]){await page.locator('.program-view-btn[href$="app='+id+'"]').click();assert.equal(new URL(page.url()).searchParams.get('app'),id);await page.waitForFunction(({id,count})=>document.querySelector('#online-count-'+id)?.textContent===count,{id,count});assert.equal(await page.locator('.roster-card').count(),1);for(const other of ['scarab-heart','autobac','baccarat-helper'].filter(x=>x!==id))assert.equal(await page.locator('#online-list-'+other).count(),0);await page.getByRole('link',{name:'返回管理首頁',exact:true}).click();}
   await page.locator('.program-view-btn[href$="app=autobac"]').click();
   await page.waitForFunction(()=>document.querySelector('#online-count-autobac')?.textContent==='3');
   assert.equal(await page.locator('#online-list-autobac .online-user').count(),3);assert.equal(await page.locator('.roster-card').count(),1);assert.equal(await page.locator('#online-list-baccarat-helper,#online-list-scarab-heart').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
   await page.locator('.online-page-top').evaluate(n=>n.insertAdjacentHTML('afterend','<p style="color:#aaa;font-size:12px">名單預覽 · 以下皆為示範帳號</p>'));
   await page.screenshot({path:path.join(out,`online-${width}.png`),fullPage:true});
   response={...presence,onlineUsers:null};await page.evaluate(()=>refreshOnline());assert.equal(await page.locator('#online-list-autobac').textContent(),'待同步');assert.equal(await page.locator('#online-count-autobac').textContent(),'3');
   response={...presence,onlineUsers:presence.onlineUsers.map((u,i)=>i===0?{...u,username:'<img src=x onerror="window.__nameXss=1">'}:u)};await page.evaluate(()=>refreshOnline());assert.equal(await page.locator('#online-list-autobac img').count(),0);assert.equal(await page.evaluate(()=>window.__nameXss),undefined);assert((await page.locator('#online-list-autobac').textContent()).includes('<img src=x'));
   response={ok:true,applications:presence.applications.map(s=>({...s,onlineAccounts:0})),onlineUsers:[]};await page.evaluate(()=>refreshOnline());assert.equal(await page.locator('#online-list-autobac').textContent(),'目前無在線帳號');
   response=presence;await page.getByRole('link',{name:'返回管理首頁',exact:true}).click();await page.getByRole('link',{name:'使用紀錄',exact:true}).click();assert.equal(await page.locator('.tabs a').count(),2);assert((await page.locator('body').textContent()).includes('00:11:05'));assert((await page.locator('body').textContent()).includes('本次已結算輸贏：120'));assert.equal(await page.locator('details[open]').count(),0);
   await page.getByText('完整設定',{exact:true}).click();assert(await page.getByText('基本金額',{exact:true}).isVisible());await context.close();
  }
  console.log('PASS: 320/390/1180 three horizontal logo/count cards, three buttons right beside counts; each opens only its program roster; mobile section below 160px, no homepage account expansion, roster safe text/unknown/empty distinction, return navigation and original audit settings. Anonymous mocked data only.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
