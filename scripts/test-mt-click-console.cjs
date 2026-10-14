const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright');}catch{playwright=require('/tmp/dg-testdeps/node_modules/playwright');}
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'public/mt-native-click-console.js'),'utf8');
const observer=fs.readFileSync(path.join(root,'scripts/mt-native-observer.js'),'utf8');
function html(count=6,options={}){
 const names=Array.from({length:count},(_,i)=>`B${String(i+5).padStart(2,'0')}`);
 return `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px sans-serif;background:#edf3f4}.multiple{width:1010px;height:630px;overflow:auto}.gameDesk_wrap{display:flex;height:125px;border-bottom:1px solid #aaa}.gameDesk{width:350px;flex-shrink:0}.gameDesk_bet{width:630px}ul{display:flex;padding:0;gap:12px}li{display:block;width:90px;cursor:pointer}.chip-group{background:#cad8e3;width:45px;height:35px}.chip-100,.chip-500,.chip-1000{display:inline-block;width:45px;height:35px;background:#99b5cb;cursor:pointer;margin:5px}.toolbar{height:50px}</style>
 <section id="__autobac_mt_diag__"><span class="ab-tag"></span><button class="ab-close"></button><button data-v="copy"></button><button data-v="remove"></button></section>
 <div class="toolbar"><div class="chip-100">100</div><div class="chip-500">500</div><div class="chip-1000">1000</div></div>
 <div class="ant-tabs-tabpane-active multiple">${names.map(n=>`<div class="gameDesk_wrap" data-name="${n}"><div class="gameDesk" data-table-id="BAV${n.slice(1)}"><div class="gameDesk_tag">百家樂 ${n}</div></div><div class="gameDesk_bet"><ul>${['閒','莊'].map(s=>`<li><div class="chip-group"><span></span></div><div class="value" style="display:none"><div class="money"><span>0</span></div></div><div class="caption">${s}</div></li>`).join('')}</ul><button class="btn-cancel">取消</button><button class="btn-check" disabled>確認</button></div></div>`).join('')}</div>
 <script>${observer}
 window.events=[];window.chip=100;window.nativeUI=false;window.freeze=false;window.gone=false;
 const names=${JSON.stringify(names)}, opts=${JSON.stringify(options)};
 const obs=createMtNativeObserver();
 window.live=names.map(n=>({tableId:'BAV'+n.slice(1),name:n,roomId:'48',snapshot:{at:new Date().toISOString(),shoe:'777',round:4,gameSn:'SN-'+n+'-4',rawRoad:'010201',results:['閒','莊','閒'],roadVerifiedAgainstTotals:true},clock:{at:new Date().toISOString(),phase:'wait',shoe:'777',round:4,gameSn:'SN-'+n+'-4',count:15}}));
 function lookup(id){return live.find(t=>t.tableId===id);}
 const entry=(direction,data)=>obs.consume({at:new Date().toISOString(),direction,data},lookup);
 class FakeSocket extends EventTarget {constructor(){super();this.url='wss://a1.ofalive99.net/game/ws';this.readyState=1;}send(raw){const p=JSON.parse(raw);if(p.action.name.endsWith('/bet')){if(!window.nativeUI)throw Error('Non-native UI bet detected');events.push('send:'+p.action.data.table_id);entry('send',p);if(!opts.noAck)setTimeout(()=>entry('receive',{action:{name:p.action.name,err:opts.reject?12:0},msg:{table:p.action.data.table_id}}),opts.ackDelay??0);}else if(p.action.name.endsWith('/tables')){events.push('readonly:GET');const data={action:{name:p.action.name},msg:{tables:live.map(t=>({table_id:t.tableId,table_name:t.name,room_id:48,game_sn:(t.clock||t.snapshot).gameSn,trend:{current_shoe:(t.clock||t.snapshot).shoe,current_round:(t.clock||t.snapshot).round,total_round:t.snapshot.results.length,bead_plate2:t.snapshot.rawRoad}}))}};setTimeout(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(data)})),0);}else events.push('other-send');}}
 window.WebSocket=FakeSocket;window.socket=new FakeSocket();
 const packet={action:{name:'/api/v1/gametype/*/game/*/room/*/tables'},msg:{tables:live.map(t=>({table_id:t.tableId,table_name:t.name,room_id:48,game_sn:t.clock.gameSn,trend:{current_shoe:777,current_round:4,total_round:3,bead_plate2:'010201'}}))}};
 window.__MT_AUTOBAC_DIAG__={report(){if(!freeze)for(const t of live)if(t.clock)t.clock.at=new Date().toISOString();return {version:'MT-DIAG-0.4.3',network:[{direction:'receive',at:new Date().toISOString(),data:packet}],liveTables:live,betObservation:obs.report(),tableViewport:{tables:names.map(n=>({name:n,tableId:'BAV'+n.slice(1),candidateIds:['BAV'+n.slice(1)]})),history:[]}}},dispose(){throw Error('Old observations disposed');},scrollToTable(){throw Error('Patch should replace this');},cancelScroll(){}};
 document.querySelectorAll('.toolbar div').forEach(chip=>chip.onclick=()=>{window.chip=Number(chip.textContent);events.push('chip:'+window.chip);if(opts.stopOnChip)window.__MT_NATIVE_CLICK__.stop('停止測試');});
 document.querySelectorAll('.gameDesk_wrap').forEach(row=>{
  const n=row.dataset.name,id='BAV'+n.slice(1);
  row.querySelectorAll('li').forEach(li=>li.querySelector('.chip-group').onclick=()=>{events.push('side:'+n+':'+li.querySelector('.caption').textContent);const span=li.querySelector('.money span');span.textContent=String(Number(span.textContent)+window.chip);li.querySelector('.value').style.display='block';row.querySelector('.btn-check').disabled=false;if(opts.stopOnSide)window.__MT_NATIVE_CLICK__.stop('停止測試');if(opts.badAmount)span.textContent='999';});
  const clear=()=>{row.querySelectorAll('.value').forEach(e=>{e.style.display='none';e.querySelector('span').textContent='0';});row.querySelector('.btn-check').disabled=true;};
  row.querySelector('.btn-cancel').onclick=()=>{events.push('cancel:'+n);clear();};
  row.querySelector('.btn-check').onclick=()=>{events.push('confirm:'+n);const li=[...row.querySelectorAll('li')].find(e=>Number(e.querySelector('.money span').textContent)>0);const amount=Number(li.querySelector('.money span').textContent);window.nativeUI=true;socket.send(JSON.stringify({method:'POST',action:{name:'/api/v1/gametype/*/game/*/room/*/table/*/bet',data:{table_id:id,room_id:1}},body:{game_sn:lookup(id).clock.gameSn,order:{slips:[{play_id:li.querySelector('.caption').textContent==='閒'?'1':'2',amount}]}}}));window.nativeUI=false;clear();};
 });
 window.settle=(name,points)=>entry('receive',{action:{name:'/api/v1/member/me/win',err:0},msg:{span:{table_id:'BAV'+name.slice(1),shoe:777,round:lookup('BAV'+name.slice(1)).clock.round,points}}});
 window.nextRound=(name)=>{const t=lookup('BAV'+name.slice(1)),r=t.clock.round;t.lastTableResult={at:new Date().toISOString(),shoe:'777',round:r,result:'閒',winner:1};t.clock={...t.clock,round:r+1,gameSn:'SN-'+name+'-'+(r+1),at:new Date().toISOString()};};
 </script>`;
}
async function run(){
 const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let passed=0;
 async function fixture(n=6,opts={}){const p=await browser.newPage({viewport:{width:1280,height:900}});p.on('pageerror',e=>console.error('Browser:',e.message));await p.route('**/*',r=>r.request().url()==='https://gsa.ofalive99.net/offline-test'?r.fulfill({contentType:'text/html',body:html(n,opts)}):r.abort());await p.goto('https://gsa.ofalive99.net/offline-test');await p.evaluate(code);await p.waitForFunction(()=>!!window.__MT_NATIVE_CLICK__);return p;}
 async function start(p,config={}){await p.evaluate(c=>{window.__MT_NATIVE_CLICK__.configure(c);window.__MT_NATIVE_CLICK__.start(true);},config);}
 try{
  for(const rooms of [1,3,5,'all']){
   const p=await fixture();const target=rooms==='all'?6:rooms;
   assert.equal(await p.evaluate(()=>events.length),0,'installation must not bet');
   await start(p,{rooms,staking:'flat'});await p.waitForFunction(n=>events.filter(e=>e.startsWith('confirm:')).length===n,target);
   await p.waitForFunction(n=>window.__MT_NATIVE_CLICK__.view().bets.filter(b=>b.state==='accepted').length===n,target);
   const e=await p.evaluate(()=>({events,view:window.__MT_NATIVE_CLICK__.view()}));
   assert.equal(e.view.bets.length,target);assert.equal(new Set(e.view.bets.map(b=>b.key)).size,target,'same shoe/round must not collide between tables');
   assert(e.events.every((x,i)=>!x.startsWith('confirm:')||(e.events.slice(0,i).some(y=>y==='chip:100')&&e.events.slice(0,i).some(y=>y.startsWith('side:'+x.slice(8)+':')))));
   await p.waitForTimeout(700);assert.equal(await p.evaluate(()=>events.filter(e=>e.startsWith('confirm:')).length),target,'no repeat within round');
   await p.evaluate(()=>window.__MT_NATIVE_CLICK__.dispose());await p.close();passed++;
  }
  {
   const p=await fixture(3,{ackDelay:2500});await start(p,{rooms:3});await p.waitForFunction(()=>events.filter(e=>e.startsWith('confirm:')).length===3);
   assert.equal(await p.evaluate(()=>window.__MT_AUTOBAC_DIAG__.report().betObservation.acceptedCount),0,'send all three without waiting for first ACK');
   await p.evaluate(()=>window.__MT_NATIVE_CLICK__.stop());await p.close();passed++;
  }
  {
   const p=await fixture(1);
   await p.evaluate(()=>{
    const original=window.socket.send;
    window.socket.send=function(data){const parsed=JSON.parse(data);if(parsed.action.name.endsWith('/bet')){const self=this;setTimeout(()=>{window.nativeUI=true;original.call(self,data);window.nativeUI=false;},2000);}else return original.call(this,data);};
   });
   await start(p);await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='submitted');
   await p.waitForFunction(()=>window.__MT_AUTOBAC_DIAG__.report().betObservation.acceptedCount===1);
   await p.waitForTimeout(650);assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state),'submitted','uncorrelated async send must not be assigned to the tool');
   await p.evaluate(()=>{const original=Date.now;Date.now=()=>original()+13000;});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='uncertain');
   assert.equal(await p.evaluate(()=>events.filter(e=>e.startsWith('confirm:')).length),1,'unproven delayed send must retain lock without retry');await p.close();passed++;
  }
  {
   const p=await fixture(3);await start(p,{rooms:3});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets.filter(b=>b.state==='accepted').length===3);
   await p.evaluate(()=>{window.__MT_NATIVE_CLICK__.stop();settle('B05',-100);});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='settled');
   await p.evaluate(()=>{nextRound('B05');window.__MT_NATIVE_CLICK__.configure({startMode:'resume'});window.__MT_NATIVE_CLICK__.start(true);});
   await p.waitForFunction(()=>events.filter(e=>e.startsWith('confirm:')).length===4);
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[3].amount),100,'multi-table resume remains flat');await p.close();passed++;
  }
  for(const opts of [{stopOnChip:true},{stopOnSide:true},{badAmount:true}]){
   const p=await fixture(1,opts);await start(p);await p.waitForFunction(()=>!window.__MT_NATIVE_CLICK__.view().running);await p.waitForTimeout(150);
   assert.equal(await p.evaluate(()=>events.some(e=>e.startsWith('confirm:'))),false,'stop/bad staged money must not confirm');
   if(opts.stopOnSide)assert(await p.evaluate(()=>events.some(e=>e.startsWith('cancel:'))),'owned exact queue is cleared after stopping');
   if(opts.badAmount){
    assert.equal(await p.evaluate(()=>events.some(e=>e.startsWith('cancel:'))),false,'mismatched queue ownership cannot be assumed');
    assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state),'uncertain','retain mismatched queue lock for manual review');
   }
   await p.close();passed++;
  }
  {
   const p=await fixture(1,{noAck:true});await start(p);await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets.some(b=>b.state==='submitted'));
   await p.evaluate(()=>window.__MT_NATIVE_CLICK__.stop());await p.evaluate(code);await p.waitForTimeout(900);
   assert.equal(await p.evaluate(()=>events.filter(e=>e.startsWith('confirm:')).length),1,'reinjection must preserve pending round lock');
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().pending),1);await p.close();passed++;
  }
  {
   const p=await fixture(1);await start(p,{staking:'martingale'});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='accepted');
   await p.evaluate(()=>{window.__MT_NATIVE_CLICK__.stop();settle('B05',-100);});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='settled');
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().nextAmount),100,'fresh preview must use the base, not saved level');
   await p.evaluate(()=>window.__MT_NATIVE_CLICK__.configure({startMode:'resume'}));
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().nextAmount),300);
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().pnl),-100);
   await p.evaluate(()=>nextRound('B05'));await start(p,{startMode:'resume'});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets.length===2);
   await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[1]?.state==='accepted');
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[1].amount),300);
   await p.evaluate(()=>{window.__MT_NATIVE_CLICK__.stop();settle('B05',285);});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[1]?.state==='settled');
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().nextAmount),100);await p.close();passed++;
  }
  {
   const p=await fixture(2);await p.evaluate(()=>{live[0].clock=null;});await p.waitForTimeout(3700);
   await start(p,{rooms:1});await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__.view().bets[0]?.state==='accepted');
   assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().bets[0].tableName),'B06','auto-find must skip a table with no current clock rather than stall');await p.close();passed++;
  }
  {
   const p=await fixture(1);const shadow=p.locator('#__autobac_mt_click__');await shadow.locator('#compact-stop').click();
   assert.equal(await shadow.locator('#risk-confirm').isEnabled(),false);assert.equal(await p.evaluate(()=>events.some(e=>e.startsWith('confirm:'))),false);
   await shadow.locator('#risk-cancel').click();await shadow.locator('#zoom-out').click();assert.equal(await shadow.locator('#panel').evaluate(e=>e.offsetWidth),210);
   await shadow.locator('#zoom-out').click();assert.equal(await shadow.locator('#panel').evaluate(e=>e.offsetWidth),280);await p.close();passed++;
  }
  console.log('PASS',passed,'MT full browser scenarios: native chip→side→confirm, 1/3/5/all independent ACK, stop/cancel, amount verification, re-injection, martingale and risk/mini controls. No real platform access.');
 }finally{await browser.close();}
}
module.exports={html};
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
