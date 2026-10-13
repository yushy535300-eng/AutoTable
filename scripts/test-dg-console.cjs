const fs=require('node:fs'),assert=require('node:assert/strict');
let JSDOM;
try {({JSDOM}=require('jsdom'));}catch {({JSDOM}=require('/tmp/dg-testdeps/node_modules/jsdom'));}
const source=fs.readFileSync(require('node:path').join(__dirname,'../public/dg-direct-bet-console.js'),'utf8');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function setup({size=8,receiptDelay=20,balance=100000,saved=null}={}){
 const dom=new JSDOM('<body></body>',{url:'https://dg-test.example/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,calls=[];w.console={...console,log:()=>{},error:console.error};
 class N{constructor(){this.children=[];this.visible=true;this.alpha=1;this.mouseEnabled=true;this.events={};}get numChildren(){return this.children.length;}getChildAt(i){return this.children[i];}add(n){n.parent=this;this.children.push(n);return n;}on(e,o,f){(this.events[e]??=[]).push([o,f]);}off(e,o,f){this.events[e]=(this.events[e]??[]).filter(x=>x[0]!==o||x[1]!==f);}event(e,v){for(const [o,f] of [...(this.events[e]??[])])f.call(o,v);}}
 const socket=new N();socket.socket={connected:true};socket.sendData=msg=>{
  calls.push({kind:'send',at:Date.now(),...msg});
  if(receiptDelay!==null)setTimeout(()=>socket.event('RECEIVED_SUCCESS',{cmd:6,tableId:msg.tableId,gameNo:msg.gameNo,list:[JSON.stringify(msg.bet)],codeId:0}),receiptDelay);
 };
 const account={mid:1,currency:'TEST',socketMan:socket,balance,selectChip:100};
 const stage=new N();w.Laya={stage,Event:class {static CLICK='click';},Browser:{now:()=>Date.now()}};
 const cards=Array.from({length:size},(_,i)=>i+1).map(id=>{
  const c=stage.add(new N());c.tableId=id;c.playerInfo=account;c.betFlag=true;
  c.gameInfo={tableName:'RB0'+id,gameNo:'r'+id,playId:40,shoeId:14,stateId:1,countDown:30,starTime:Date.now(),roadArray:[{road:[1]},{road:[1]},{road:[1]},{road:[1]}]};
  c.betMoneyTmp={Banker:0,Player:0};c.betMoneyTrue={Banker:0,Player:0};c.baccaratLimit={bpMin:100,bpMax:100000};
  c.betBtn={Banker:c.add(new N()),Player:c.add(new N())};for(const n of Object.values(c.betBtn))n.on('click',n,()=>calls.push({kind:'UI_CLICK'}));
  c.betMan=c.add(new N());c.betMan.visible=false;c.betMan.confirm=c.betMan.add(new N());c.betMan.cancel=c.betMan.add(new N());
  c.betMan.confirm.on('click',c,()=>calls.push({kind:'UI_CLICK'}));
  c.showBetMan=function(v){this.betMan.visible=v;};
  c.confirmBet=function(){
   const bet={banker6:this.betMoneyTmp.Banker,player:this.betMoneyTmp.Player};
   this.betFlag=false;this.showBetMan(false);this.event('BET_CHIP',{cmd:6,tableId:this.tableId,gameNo:this.gameInfo.gameNo,bet});
  };return c;
 });
 if(saved)w.__DG_LEDGER_STATE__=saved;
 w.eval(source);const q=id=>w.document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById(id);q('ack').checked=true;
 const choose=value=>{q('parallel-count').value=value;q('parallel-count').dispatchEvent(new w.Event('change'));};
 return {dom,w,calls,cards,socket,q,choose};
}
function confirmedStart(t,id='start'){t.q(id).click();assert.equal(t.q('risk-dialog').hidden,false);assert.equal(t.q('ack').checked,false);assert.equal(t.q('risk-confirm').disabled,true);t.q('ack').checked=true;t.q('ack').dispatchEvent(new t.w.Event('change'));t.q('risk-confirm').click();}
const cleanup=t=>{if(!t||t.cleaned)return;t.cleaned=true;t.w.__DG_SINGLEPAGE__?.dispose();t.dom.window.close();};
(async()=>{
 let t;
 try{
  t=await setup();assert.equal(t.calls.length,0,'安裝不得下注');assert.equal(t.w.__DG_SINGLEPAGE__.status().roomCount,'1');assert.equal(t.w.__DG_SINGLEPAGE__.status().selected.length,1);assert.equal(t.q('panel').classList.contains('compact'),true);confirmedStart(t,'once');await delay(100);
  assert.equal(t.calls.length,1);assert.equal(t.calls[0].cmd,6);assert.equal(t.calls[0].bet.banker6,100);
  assert.equal(t.calls.filter(x=>x.kind==='UI_CLICK').length,0,'直接訊息不觸發畫面按鈕');
  assert.equal(t.cards[0].betMoneyTmp.Banker,0);assert.equal(t.cards[0].betFlag,true);
  assert.equal(t.w.__DG_SINGLEPAGE__.status().pending[0].state,'accepted');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[99900,-100]});
  assert.equal(t.w.__DG_SINGLEPAGE__.exportLedger().levels.global,1);
  t.w.eval(source);assert.equal(t.w.document.querySelectorAll('#__dg_singlepage_panel__').length,1);
  assert.equal(t.socket.events.RECEIVED_SUCCESS.length,1);cleanup(t);
  for(const [value,expected] of [['1',1],['3',3],['5',5],['all',8]]){
   t=await setup({receiptDelay:null});t.choose(value);
   assert.equal(t.q('count').value,value,'總覽與設定選單同步');
   confirmedStart(t);await delay(100);
   assert.equal(t.calls.length,expected,`${value}桌在收到任何回覆前全部送出`);
   assert.equal(t.w.__DG_SINGLEPAGE__.status().scope,value==='1'?'global':'table');
   assert.equal(t.w.__DG_SINGLEPAGE__.status().pending.length,expected);
   assert.ok(t.w.__DG_SINGLEPAGE__.status().pending.every(b=>b.state==='submitted'));
   assert.equal(new Set(t.calls.map(c=>c.tableId)).size,expected,'每桌一筆');
   assert.ok(t.calls.at(-1).at-t.calls[0].at<300,'同批不等接受回覆或結算');
   assert.equal(t.q('parallel-count').disabled,true,'執行時不改桌數');
   await delay(550);assert.equal(t.calls.length,expected,'下一掃描不重送');
   t.q('stop').click();await delay(550);assert.equal(t.calls.length,expected,'停止不新增');
   assert.equal(t.q('count').disabled,true,'停止但未核對下注不得改選');cleanup(t);
  }
  t=await setup({size:3});t.choose('3');confirmedStart(t);await delay(100);assert.equal(t.calls.length,3);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[99900,-100]});
  const c=t.cards[0];c.gameInfo.gameNo='next1';c.gameInfo.starTime=Date.now();
  await delay(550);assert.equal(t.calls.length,4,'第一桌結算可續注，不必等其他桌');
  assert.equal(t.calls[3].tableId,1);assert.equal(t.calls[3].bet.banker6,100,'多桌輸後仍平注100');assert.equal(t.w.__DG_SINGLEPAGE__.status().staking,'flat');
  assert.equal(t.w.__DG_SINGLEPAGE__.exportLedger().levels['table:2'],undefined,'另一桌不被升階');
  t.q('stop').click();t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'next1',dList:[99800,-100]});
  await delay(550);assert.equal(t.calls.length,4,'停止後仍可結算但不新增');cleanup(t);
  t=await setup({balance:5700,receiptDelay:null});t.choose('all');t.q('base').value='1000';confirmedStart(t);await delay(100);
  assert.equal(t.calls.length,5,'5700不可同批送8筆1000');
  assert.equal(t.w.__DG_SINGLEPAGE__.status().unacknowledgedFunds,5000);
  assert.ok(t.q('events').textContent.includes('可用餘額 700'));cleanup(t);
  t=await setup({size:3});t.choose('3');t.cards[1].gameInfo.stateId=2;confirmedStart(t);await delay(100);
  assert.equal(t.calls.length,2,'一桌開獎不阻塞其他桌');assert.ok(t.calls.every(c=>c.tableId!==2));cleanup(t);
  t=await setup();t.choose('1');t.q('rooms').children[1].click();
  assert.equal(t.w.__DG_SINGLEPAGE__.status().selected.length,1,'手選不能超過桌數');
  t.q('rooms').children[0].click();t.q('rooms').children[1].click();assert.deepEqual(Array.from(t.w.__DG_SINGLEPAGE__.status().selected),['2']);cleanup(t);
  t=await setup({size:3});t.choose('5');assert.equal(t.w.__DG_SINGLEPAGE__.status().selected.length,3);
  assert.ok(t.q('events').textContent.includes('要求 5 桌'));cleanup(t);
  t=await setup({size:3});t.choose('3');confirmedStart(t);await delay(100);
  t.socket.sendData({cmd:6,tableId:1,gameNo:'r1',bet:{banker6:100,player:0}});
  assert.equal(t.w.__DG_SINGLEPAGE__.status().running,false,'同局額外投注停止');cleanup(t);
  t=await setup();
  for(const c of t.cards){c.limitId=1;c.gameInfo.gameId=1;c.baccaratLimit={bpMin:0,bpMax:0};c.playerInfo.balance=5700;c.playerInfo.gameLimitMan={getGameLimit:(id,game)=>{assert.equal(id,1);assert.equal(game,1);return {bpMin:100,bpMax:10000};}};}
  confirmedStart(t,'once');await delay(100);assert.equal(t.calls.length,1);assert.equal(t.calls[0].bet.banker6,100);cleanup(t);
  t=await setup();for(const c of t.cards){c.limitId=1;c.gameInfo.gameId=1;c.playerInfo.gameLimitMan={getGameLimit:()=>({bpMin:300,bpMax:10000})};}
  confirmedStart(t,'once');await delay(100);assert.equal(t.calls.length,0);assert.ok(t.w.__DG_SINGLEPAGE__.diagnostics()[0].reason.includes('最低 300'));cleanup(t);
  t=await setup({saved:{version:1,levels:{},bets:[{key:'1:r1',tableId:'1',gameNo:'r1',side:'莊',amount:100,level:0,scope:'global',state:'accepted',createdAt:Date.now(),acceptedAt:Date.now()}]}});
  confirmedStart(t);await delay(100);assert.equal(t.calls.length,0,'舊共用pending不得刪除解鎖');assert.equal(t.w.__DG_SINGLEPAGE__.status().pending[0].scope,'global');cleanup(t);
  t=await setup({size:1});confirmedStart(t);await delay(100);t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[99900,-100]});t.cards[0].gameInfo.gameNo='single-next';t.cards[0].gameInfo.starTime=Date.now();await delay(550);assert.equal(t.calls[1].bet.banker6,300,'單桌仍沿用馬丁');cleanup(t);
  t=await setup({size:1});t.q('single-staking').value='flat';t.q('single-staking').dispatchEvent(new t.w.Event('change'));confirmedStart(t);await delay(100);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[99900,-100]});t.cards[0].gameInfo.gameNo='single-flat-next';t.cards[0].gameInfo.starTime=Date.now();await delay(550);
  assert.equal(t.calls[1].bet.banker6,100,'單桌平注輸後仍固定基本額');cleanup(t);
  t=await setup();t.choose('5');assert.equal(t.q('single-staking').value,'flat');assert.equal(t.q('single-staking').disabled,true,'多桌配注選單鎖平注');cleanup(t);
  t=await setup({receiptDelay:null});confirmedStart(t);await delay(100);assert.equal(t.w.__DG_SINGLEPAGE__.rounds()[0].ok,false,'未回覆不能算已下到');cleanup(t);
  t=await setup({size:1});t.q('rooms').children[0].click();t.q('rooms').children[0].click();t.cards[0].baccaratLimit.bpMin=1000;confirmedStart(t);await delay(100);t.cards[0].gameInfo.stateId=2;await delay(550);
  assert.ok(t.q('events').textContent.includes('未下到'),'封盤漏單明示');assert.equal(t.calls.length,0);cleanup(t);
  t=await setup({size:3});t.choose('3');t.q('stop-loss').value='100';confirmedStart(t);await delay(100);assert.equal(t.calls.length,3);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[99900,-100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().running,false,'達止損停止');
  t.cards[0].gameInfo.gameNo='after-risk';t.cards[0].gameInfo.starTime=Date.now();await delay(550);assert.equal(t.calls.length,3,'止損後不續注');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:2,gameNo:'r2',dList:[99800,-100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,-200,'達標後其他已接受下注仍結算');cleanup(t);
  t=await setup({size:1});t.q('take-profit').value='100';confirmedStart(t);await delay(100);t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[100100,100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().running,false,'達止盈停止');
  confirmedStart(t);assert.equal(t.w.__DG_SINGLEPAGE__.status().running,false,'再次開始不繞過達標');cleanup(t);
  t=await setup();t.q('stop-loss').value='-100';confirmedStart(t);await delay(100);assert.equal(t.calls.length,0,'無效止損不下注');cleanup(t);
  t=await setup();t.q('compact-stop').click();await delay(100);assert.equal(t.calls.length,0,'未確認不能下注');assert.equal(t.q('ack').checked,false);
  t.q('risk-cancel').click();assert.equal(t.q('risk-dialog').hidden,true);assert.equal(t.calls.length,0);
  t.q('compact-stop').click();assert.equal(t.q('ack').checked,false);t.q('ack').checked=true;t.q('ack').dispatchEvent(new t.w.Event('change'));t.q('risk-confirm').click();await delay(100);assert.equal(t.calls.length,1);
  t.q('stop').click();t.q('compact-stop').click();assert.equal(t.q('risk-dialog').hidden,false);assert.equal(t.q('ack').checked,false,'每次開始重設勾選');assert.equal(t.q('risk-confirm').disabled,true);cleanup(t);
  t=await setup({size:1,receiptDelay:null});
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,0,'未下注開牌不計損益');
  t.q('zoom-out').click();assert.equal(t.q('panel').classList.contains('mini'),true);assert.equal(t.calls.length,0);
  confirmedStart(t,'compact-stop');await delay(100);assert.equal(t.calls.length,1);assert.equal(t.q('panel').classList.contains('mini'),true,'确认開始後仍迷你');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,0,'未接受不計損益');assert.equal(t.w.__DG_SINGLEPAGE__.exportLedger().levels.global,undefined);
  t.socket.event('RECEIVED_SUCCESS',{cmd:6,tableId:1,gameNo:'r1',codeId:0,list:['{"banker6":100}']});
  t.q('zoom-out').click();assert.equal(t.q('panel').classList.contains('mini'),false);assert.equal(t.w.__DG_SINGLEPAGE__.status().running,true,'還原不停止');assert.equal(t.calls.length,1,'還原不加單');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'unplayed',dList:[0,-900]});assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,0);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,-100);assert.equal(t.w.__DG_SINGLEPAGE__.exportLedger().levels.global,1);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,-100,'重複結算不重計');t.q('stop').click();cleanup(t);
  t=await setup({size:5,receiptDelay:null});t.choose('5');
  t.cards.forEach((c,i)=>{c.gameInfo.roadArray=(i%2?[5,1,5,5,5]:[1,5,1,1,1]).map(v=>({road:[v]}));});
  confirmedStart(t);await delay(100);assert.equal(t.calls.length,5,'五桌各自計算不同牌路也全部送出，不只畫面焦點');
  assert.equal(new Set(t.calls.map(c=>c.tableId)).size,5);assert.ok(t.calls.every(c=>c.bet.banker6+c.bet.player===100));cleanup(t);
  t=await setup({size:5});for(const c of t.cards)c.visible=false;t.w.eval(source);t.choose('all');
  assert.equal(t.w.__DG_SINGLEPAGE__.status().selected.length,0);
  t.cards[0].visible=t.cards[1].visible=true;await delay(650);assert.deepEqual(Array.from(t.w.__DG_SINGLEPAGE__.status().selected),['1','2'],'延遲載入自動掃描');assert.equal(t.calls.length,0,'自動掃描不自動下注');
  t.cards[2].visible=true;await delay(650);assert.equal(t.w.__DG_SINGLEPAGE__.status().selected.length,3,'新桌自動補入所有桌');
  t.cards[0].visible=false;await delay(650);assert.deepEqual(Array.from(t.w.__DG_SINGLEPAGE__.status().selected),['2','3'],'移除失效桌');
  confirmedStart(t);await delay(100);assert.equal(t.calls.length,2);
  t.cards[3].visible=true;await delay(650);assert.equal(t.calls.length,3,'執行中新載入桌自動加入');assert.equal(t.calls.at(-1).tableId,4);cleanup(t);
  t=await setup({size:3});confirmedStart(t);await delay(100);t.cards[0].visible=false;await delay(650);
  assert.deepEqual(Array.from(t.w.__DG_SINGLEPAGE__.status().selected),['1'],'消失的待結算桌不擴大曝險');assert.equal(t.calls.length,1);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});await delay(650);assert.equal(t.calls.length,2,'結算後自動補入新桌');assert.equal(t.calls.at(-1).tableId,2);assert.equal(t.calls.at(-1).bet.banker6,300,'跨房间接续馬丁');cleanup(t);
  t=await setup();t.q('hide').click();assert.equal(t.q('panel').hidden,false);assert.equal(t.q('panel').classList.contains('mini'),true);assert.equal(t.q('orb'),null,'不應有小球');assert.equal(t.calls.length,0);t.q('zoom-out').click();assert.equal(t.q('panel').classList.contains('mini'),false);cleanup(t);
  t=await setup();const sh=t.q('panel').getRootNode();
  for(const b of sh.querySelectorAll('button,[role="button"]')){
    const disabled=b.disabled;b.disabled=false;
    b.dispatchEvent(new t.w.Event('pointerdown',{bubbles:true}));assert.equal(b.dataset.pressed,'true','按鈕觸控有回饋 '+b.id);
    b.dispatchEvent(new t.w.Event('pointerup',{bubbles:true}));assert.equal(b.hasAttribute('data-pressed'),false,'放開還原 '+b.id);b.disabled=disabled;
  }
  const fb=t.q('nav-settings');fb.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(fb.dataset.pressed,'true');fb.dispatchEvent(new t.w.KeyboardEvent('keyup',{key:'Enter',bubbles:true}));assert.equal(fb.hasAttribute('data-pressed'),false);
  fb.click();assert.equal(fb.dataset.pressed,'true','點擊後短暫高亮');await delay(220);assert.equal(fb.hasAttribute('data-pressed'),false);
  t.q('risk-confirm').dispatchEvent(new t.w.Event('pointerdown',{bubbles:true}));assert.equal(t.q('risk-confirm').hasAttribute('data-pressed'),false,'停用確認不假裝可按');assert.equal(t.calls.length,0);cleanup(t);
  t=await setup({size:3});t.cards[0].gameInfo.stateId=2;confirmedStart(t);await delay(100);assert.equal(t.calls[0].tableId,2,'自動找桌跳過封盤桌');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:2,gameNo:'r2',dList:[0,100]});await delay(600);assert.equal(t.calls[1].tableId,3,'同桌同局已下過，改找其他空桌');cleanup(t);
  t=await setup({size:3});t.q('rooms').children[0].click();t.q('rooms').children[1].click();assert.equal(t.w.__DG_SINGLEPAGE__.status().selectionMode,'manual');t.cards[1].gameInfo.stateId=2;confirmedStart(t);await delay(650);assert.equal(t.calls.length,0,'指定封盤桌不改下別桌');t.q('stop').click();t.q('auto-tables').click();assert.equal(t.w.__DG_SINGLEPAGE__.status().selectionMode,'auto');confirmedStart(t);await delay(100);assert.equal(t.calls[0].tableId,1,'取消指定後找其他空桌');cleanup(t);
  t=await setup({size:2});for(const c of t.cards)c.visible=false;t.w.eval(source);confirmedStart(t);await delay(100);assert.equal(t.w.__DG_SINGLEPAGE__.status().running,true,'沒有桌先自動等待');t.cards[1].visible=true;await delay(650);assert.equal(t.calls[0].tableId,2,'桌台稍後出現不用再次手動開始');cleanup(t);
  t=await setup({size:2});t.q('provider').value='grok';t.q('provider').dispatchEvent(new t.w.Event('change'));assert.equal(t.q('current-strategy').textContent,'Grok');assert.ok(t.q('focus-meta').textContent.includes('Grok'));confirmedStart(t);await delay(100);const originalSide=t.q('side').textContent,originalAmount=t.q('amount').textContent;t.q('provider').value='meta';t.q('provider').dispatchEvent(new t.w.Event('change'));assert.equal(t.q('current-strategy').textContent,'Meta AI');assert.equal(t.q('side').textContent,originalSide,'已送出方向不被新策略改寫');assert.equal(t.q('amount').textContent,originalAmount);assert.equal(t.w.__DG_SINGLEPAGE__.exportLedger().bets[0].provider,'grok');cleanup(t);
  t=await setup();const rs=t.q('resize-panel');rs.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(t.w.__DG_SINGLEPAGE__.status().panelSize.width,290);t.q('zoom-out').click();assert.equal(t.q('mini-label').textContent,'展開');t.q('zoom-out').click();assert.equal(t.q('mini-label').textContent,'迷你');assert.equal(t.w.__DG_SINGLEPAGE__.status().panelSize.width,290,'還原保留伸縮尺寸');assert.equal(t.calls.length,0);cleanup(t);
  t=await setup();t.q('provider-trigger').click();assert.equal(t.q('provider-menu').hidden,false);assert.equal(t.q('provider-menu').children.length,6);assert.equal(t.q('provider-menu').querySelectorAll('svg').length,6);t.q('provider-menu').children[1].click();assert.equal(t.q('provider').value,'gemini');assert.equal(t.q('current-strategy').textContent,'Gemini');assert.equal(t.q('provider-menu').hidden,true);t.q('provider-trigger').dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));assert.equal(t.q('provider-menu').hidden,false);t.q('provider-menu').children[1].dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(t.q('provider-menu').hidden,true);assert.equal(t.calls.length,0);cleanup(t);
  t=await setup({size:3});t.choose('3');confirmedStart(t);await delay(100);const originalBadges=[...t.q('tables').querySelectorAll('.table-badge')].map(n=>n.textContent),originalChips=[...t.q('table-strip').querySelectorAll('strong')].map(n=>n.textContent);t.cards.forEach(c=>c.gameInfo.roadArray=[5,5,5,5].map(v=>({road:[v]})));t.q('provider').value='grok';t.q('provider').dispatchEvent(new t.w.Event('change'));assert.deepEqual([...t.q('tables').querySelectorAll('.table-badge')].map(n=>n.textContent),originalBadges,'多桌每一待結算方向維持原單');assert.deepEqual([...t.q('table-strip').querySelectorAll('strong')].map(n=>n.textContent),originalChips,'桌台摘要方向與金額不被新策略覆寫');cleanup(t);
  const oldStake={version:1,levels:{'table:1':2},bets:[{key:'1:old',tableId:'1',gameNo:'old',side:'莊',amount:3000,level:1,scope:'table',staking:'martingale',state:'settled',createdAt:Date.now()-5000,settledAt:Date.now()-4000,pnl:-3000}]};
  t=await setup({size:1,saved:oldStake});t.q('base').value='1000';t.q('base').dispatchEvent(new t.w.Event('input'));assert.equal(t.q('amount').textContent,'1,000','新開始預覽不能顯示舊7000');confirmedStart(t);await delay(100);assert.equal(t.calls[0].bet.banker6,1000,'新開始首筆不得沿用舊階級');assert.equal(t.q('amount-label').textContent,'已接受金額');assert.ok(t.q('amount-rule').textContent.includes('第1階 ×1'));assert.equal(t.w.__DG_SINGLEPAGE__.exportLedger().bets[0].pnl,-3000,'正式歷史保留');t.q('stop').click();confirmedStart(t);assert.equal(t.w.__DG_SINGLEPAGE__.status().running,false,'新開始不得清除pending');assert.equal(t.calls.length,1);t.q('start-mode').value='resume';t.q('start-mode').dispatchEvent(new t.w.Event('change'));confirmedStart(t);await delay(100);assert.equal(t.calls.length,1,'續接不重送');cleanup(t);
  t=await setup({size:1,saved:oldStake});t.q('base').value='1000';t.q('start-mode').value='resume';t.q('start-mode').dispatchEvent(new t.w.Event('change'));assert.equal(t.q('amount').textContent,'7,000','只有明選續接才沿用舊第3階');confirmedStart(t);await delay(100);assert.equal(t.calls[0].bet.banker6,7000);assert.ok(t.q('amount-rule').textContent.includes('第3階 ×7'));cleanup(t);
  t=await setup({size:1});t.q('base').value='1000';confirmedStart(t);await delay(100);t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-1000]});t.q('stop').click();t.cards[0].gameInfo.gameNo='restart';t.cards[0].gameInfo.starTime=Date.now();confirmedStart(t);await delay(100);assert.equal(t.calls[1].bet.banker6,1000,'停後新開始基本1000');cleanup(t);
  t=await setup({size:3,saved:oldStake});t.choose('3');t.q('base').value='1000';confirmedStart(t);await delay(100);assert.ok(t.calls.every(c=>c.bet.banker6===1000),'多桌舊馬丁不改平注');cleanup(t);
  t=await setup({size:1});t.q('base').value='100.5';t.q('base').dispatchEvent(new t.w.Event('input'));assert.equal(t.q('amount-label').textContent,'基本單注須為正整數');confirmedStart(t);assert.equal(t.calls.length,0);cleanup(t);
  t=await setup({size:1});confirmedStart(t);await delay(100);t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});t.q('stop').click();const oldPnl=t.w.__DG_SINGLEPAGE__.status().roundPnl;t.w.eval(source);assert.equal(t.w.__DG_SINGLEPAGE__.status().roundPnl,oldPnl,'同頁換版不歸零本輪已結算損益');cleanup(t);
  t=await setup({size:5});t.q('base').value='1000';confirmedStart(t);await delay(100);assert.equal(t.calls[0].bet.banker6,1000);await delay(550);assert.equal(t.calls.length,1,'上一桌未結算不下別桌');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-1000]});await delay(650);assert.equal(t.calls[1].tableId,2);assert.equal(t.calls[1].bet.banker6,3000);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:2,gameNo:'r2',dList:[0,-3000]});await delay(650);assert.equal(t.calls[2].tableId,3);assert.equal(t.calls[2].bet.banker6,7000);
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:3,gameNo:'r3',dList:[0,0]});await delay(650);assert.equal(t.calls[3].tableId,4);assert.equal(t.calls[3].bet.banker6,7000,'和局跨房間維持');
  t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:4,gameNo:'r4',dList:[0,6650]});await delay(650);assert.equal(t.calls[4].tableId,5);assert.equal(t.calls[4].bet.banker6,1000,'贏後下一房間重置');assert.ok(t.w.__DG_SINGLEPAGE__.exportLedger().bets.every(b=>b.scope==='global'));cleanup(t);
  t=await setup({size:3});assert.equal(t.q('single-staking').disabled,false);t.q('single-staking').value='flat';t.q('single-staking').dispatchEvent(new t.w.Event('change'));assert.equal(t.w.__DG_SINGLEPAGE__.status().staking,'flat');confirmedStart(t);await delay(100);assert.equal(t.q('single-staking').disabled,true);
  t.q('single-staking').value='martingale';t.q('single-staking').dispatchEvent(new t.w.Event('change'));assert.equal(t.w.__DG_SINGLEPAGE__.status().staking,'flat','待結算不能修改配注');assert.equal(t.q('single-staking').value,'flat');t.socket.event('RECEIVED_SUCCESS',{cmd:1007,tableId:1,gameNo:'r1',dList:[0,-100]});await delay(650);assert.equal(t.calls[1].tableId,2);assert.equal(t.calls[1].bet.banker6,100,'平注跨房間固定100');cleanup(t);
  for(const value of ['3','5','all']){t=await setup();t.choose(value);assert.equal(t.q('single-staking').value,'flat');assert.equal(t.q('single-staking').disabled,true);t.q('single-staking').value='martingale';t.q('single-staking').dispatchEvent(new t.w.Event('change'));assert.equal(t.q('single-staking').value,'flat');assert.equal(t.w.__DG_SINGLEPAGE__.status().staking,'flat');confirmedStart(t);await delay(100);assert.ok(t.w.__DG_SINGLEPAGE__.exportLedger().bets.every(b=>b.staking==='flat'&&b.amount===100));cleanup(t);}
  t=await setup();t.q('single-staking').value='flat';t.q('single-staking').dispatchEvent(new t.w.Event('change'));t.choose('3');t.choose('1');assert.equal(t.q('single-staking').disabled,false);assert.equal(t.q('single-staking').value,'flat','返回單桌保留原本選擇');cleanup(t);
  console.log('PASS: 1/3/5/all同批不等回覆、單桌升階/多桌平注、單局防重送、批次預留5700、停止、手選限制、選單同步、限額回歸、單例');
 }finally{cleanup(t);}
})().catch(e=>{console.error(e);process.exitCode=1;});
