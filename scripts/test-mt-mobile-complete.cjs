const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright');}catch{playwright=require('/tmp/dg-testdeps/node_modules/playwright');}
const {html}=require('./test-mt-click-console.cjs');
const root=path.resolve(__dirname,'..'),code=fs.readFileSync(path.join(root,'public/mt-native-click-console.js'),'utf8');
async function mobileDOM(page,options){
 await page.evaluate(options=>{
  const names=live.map(t=>t.name);
  document.querySelector('.toolbar')?.remove();document.querySelector('.multiple')?.remove();
  const pane=document.createElement('div');pane.id='mulitScroll';pane.className='multiple';
  pane.style.cssText='height:650px;width:390px;overflow:auto';
  pane.innerHTML=names.map(name=>`<div class="gameDesk" data-name="${name}" data-table-id="BAV${name.slice(1)}" style="width:390px;height:195px;display:block"><div class="gameDesk_title"><div class="gameDesk_tag">百家樂 ${name}</div><div class="gameDesk_title_r"><div class="countdown" data-value="15" style="width:20px;height:20px"></div></div></div><div class="gameDesk_bet_section" data-state="classic"><ul>${['free','zhuang'].map(side=>`<li data-state="${side}" style="display:block;width:150px;height:100px"><div class="chip-group"><div class="chip-100">顯示籌碼</div></div><div class="native-actions" style="display:none"><button class="btn van-button--danger">×</button><button class="btn van-button--warning">↪</button><button class="btn van-button--success">✓</button></div><button class="btn btn-money" style="display:none">0</button></li>`).join('')}</ul></div></div>`).join('')+`<div class="multiple_footer" style="position:fixed;bottom:0;background:#eee;width:390px;height:50px"><div class="chip-group" style="width:390px;height:45px"><div class="chip-100">100</div><div class="chip-500">500</div><div class="chip-1000">1000</div></div></div>`;
  document.body.append(pane);
  pane.querySelectorAll('.multiple_footer > .chip-group > div').forEach(el=>el.onclick=()=>{
   window.chip=Number(el.textContent);events.push('chip:'+window.chip);
   if(options.advanceCountOnChip)for(const table of live){table.clock.count--;table.clock.at=new Date().toISOString();pane.querySelector(`[data-name="${table.name}"] .countdown`).setAttribute('data-value',String(table.clock.count));}
   if(options.stopOnChip)window.__MT_NATIVE_CLICK__.stop('停止測試');
  });
  for(const row of pane.querySelectorAll('.gameDesk')){
   const name=row.dataset.name,id='BAV'+name.slice(1);
   row.__vueParentComponent={setupState:{MulitGameData:{[id]:{immediatelyOrderType:false}}}};
   const clear=()=>row.querySelectorAll('li').forEach(li=>{li.querySelector('.btn-money').textContent='0';li.querySelector('.btn-money').style.display='none';li.querySelector('.native-actions').style.display='none';});
   for(const li of row.querySelectorAll('li')){
    const side=li.dataset.state;
    li.querySelector('.chip-group').onclick=()=>{
     events.push('side:'+name+':'+side);
     const money=li.querySelector('.btn-money');money.textContent=String(Number(money.textContent)+chip);money.style.display='block';li.querySelector('.native-actions').style.display='block';
     if(options.stopOnSide)window.__MT_NATIVE_CLICK__.stop('停止測試');
     if(options.badAmount)money.textContent='999';
    };
    li.querySelector('.van-button--danger').onclick=()=>{events.push('cancel:'+name);clear();};
    li.querySelector('.van-button--success').onclick=()=>{
     events.push('confirm:'+name);const amount=Number(li.querySelector('.btn-money').textContent);
     window.nativeUI=true;
     socket.send(JSON.stringify({method:'POST',action:{name:'/api/v1/gametype/*/game/*/room/*/table/*/bet',data:{table_id:id,room_id:1}},body:{game_sn:lookup(id).clock.gameSn,order:{slips:[{play_id:side==='free'?'1':'2',amount}]}}}));
     window.nativeUI=false;clear();
    };
   }
  }
 },options);
}
(async()=>{
 const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});let passed=0;
 async function fixture(options={}){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.route('**/*',r=>r.request().url()==='https://gsb.ofalive99.net/offline-test'?r.fulfill({contentType:'text/html',body:html(6,options)}):r.abort());
  await page.goto('https://gsb.ofalive99.net/offline-test');await mobileDOM(page,options);await page.evaluate(code);await page.waitForFunction(()=>!!window.__MT_NATIVE_CLICK__);
  return page;
 }
 async function start(page,config={}){await page.evaluate(config=>{window.__MT_NATIVE_CLICK__.configure(config);window.__MT_NATIVE_CLICK__.start(true);},config);}
 try{
  for(const rooms of [1,3,5,'all']){
   const page=await fixture(),target=rooms==='all'?6:rooms;
   assert.equal(await page.evaluate(()=>events.filter(e=>e.startsWith('confirm:')).length),0,'install stays stopped');
   await start(page,{rooms});await page.waitForFunction(n=>window.__MT_NATIVE_CLICK__.view().bets.filter(b=>b.state==='accepted').length===n,target,{timeout:15000});
   const bets=await page.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets);
   assert(bets.every(b=>b.amount===100&&b.nativeProof&&b.nativeRecordId),'native Green-check send must be bound and accepted');
   if(rooms!==1)assert(bets.every(b=>b.staking==='flat'));
   await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>events.filter(e=>e.startsWith('confirm:')).length),target,'no duplicate in the same round');
   await page.close();passed++;
  }
  {
   const page=await fixture({advanceCountOnChip:true});await start(page);
   await page.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='accepted');
   assert.equal(await page.evaluate(()=>live[0].clock.count),14);
   assert.equal(await page.evaluate(()=>events.filter(e=>e.startsWith('confirm:')).length),1,'a synchronized normal countdown decrement must not abort the native flow');
   await page.close();passed++;
  }
  {
   const page=await fixture({ackDelay:2500});await start(page,{rooms:3});
   await page.waitForFunction(()=>events.filter(e=>e.startsWith('confirm:')).length===3);
   assert.equal(await page.evaluate(()=>window.__MT_AUTOBAC_DIAG__.report().betObservation.acceptedCount),0,'do not wait for first ACK before sending the other tables');await page.close();passed++;
  }
  {
   const page=await fixture();await start(page,{staking:'doubling'});
   await page.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='accepted');
   await page.evaluate(()=>{window.__MT_NATIVE_CLICK__.stop();settle('B05',-100);});
   await page.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='settled');
   await start(page,{startMode:'resume'});
   await page.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[1]?.state==='accepted');
   const second=await page.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[1]);
   assert.equal(second.tableName,'B06');assert.equal(second.amount,200,'doubling carries across rooms only after accepted official settlement');
   await page.evaluate(()=>{window.__MT_NATIVE_CLICK__.stop();settle('B06',190);});
   await page.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[1]?.state==='settled');
   assert.equal(await page.evaluate(()=>window.__MT_NATIVE_CLICK__.view().level),0,'positive settlement resets doubling');
   await page.close();passed++;
  }
  for(const options of [{stopOnChip:true},{stopOnSide:true},{badAmount:true}]){
   const page=await fixture(options);await start(page);await page.waitForFunction(()=>!window.__MT_NATIVE_CLICK__.view().running);await page.waitForTimeout(180);
   assert.equal(await page.evaluate(()=>events.some(e=>e.startsWith('confirm:'))),false);
   if(options.stopOnSide)assert(await page.evaluate(()=>events.some(e=>e.startsWith('cancel:'))));
   if(options.badAmount){assert.equal(await page.evaluate(()=>events.some(e=>e.startsWith('cancel:'))),false);assert.equal(await page.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state),'uncertain');}
   await page.close();passed++;
  }
  console.log(`PASS ${passed} MT Mobile full Chromium scenarios: footer chip→native side→green check→source proof→accepted/settled, 1/3/5/all, cross-room doubling, stop/queue ownership. All requests intercepted; no real login or bet.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
