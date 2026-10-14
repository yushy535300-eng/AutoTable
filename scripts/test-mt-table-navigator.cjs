const assert=require('node:assert/strict');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/tmp/dg-testdeps/node_modules/playwright'));}
const {createMtTableNavigator}=require('./mt-table-navigator');
const factory=createMtTableNavigator.toString();
const html=`<!doctype html><html><head><style>body{margin:0;background:#16202a;overflow:hidden;font:12px system-ui}#toolbar{height:46px;color:white}#viewport{height:310px;width:calc(100vw - 28px);max-width:480px;overflow-y:auto;overflow-x:hidden;margin:0 14px;border:1px solid #465}.gameDesk_wrap{display:flex;height:130px;box-sizing:border-box;border-bottom:1px solid #789}.gameDesk{width:50%;background:#eee}.gameDesk_tag{height:22px}.gameDesk_road{height:80px}.gameDesk_bet{width:50%;background:white;padding:6px;box-sizing:border-box}.gameDesk_bet ul{display:flex;list-style:none;margin:0;padding:0}.gameDesk_bet li{width:50%;height:62px;text-align:center;background:#def}.chip-group{height:35px}.gameDesk_bet .btn-check{height:30px;width:100%;margin-top:8px}</style></head><body><div id="toolbar">離線MT多台模擬</div><div id="viewport"><div class="ant-tabs-tabpane-active multiple">${Array.from({length:10},(_,i)=>{const name='B'+String(i+1).padStart(2,'0');return `<div class="gameDesk_wrap"><div class="gameDesk"><div class="gameDesk_tag">百家樂 ${name}</div><div class="gameDesk_road"></div></div><div class="gameDesk_bet"><ul><li><div class="chip-group"></div><div class="caption">閒</div></li><li><div class="chip-group"></div><div class="caption">莊</div></li></ul><button class="btn-check" data-test-table="${name}">確認</button></div></div>`}).join('')}</div></div></body></html>`;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const [width,height]of [[707,452],[390,600]]){
   const page=await browser.newPage({viewport:{width,height}});await page.setContent(html);
   await page.evaluate(factory=>{
    window.__tables=Array.from({length:10},(_,i)=>({name:'B'+String(i+1).padStart(2,'0'),tableId:'BAV'+String(i+1).padStart(2,'0'),clock:{gameSn:'game-'+i}}));
    window.__clicked=[];document.querySelectorAll('.btn-check').forEach(b=>b.onclick=()=>window.__clicked.push(b.dataset.testTable));
    window.__nav=eval('('+factory+')')(window,()=>window.__tables);
   },factory);
   assert.equal(await page.evaluate(()=>document.getElementById('viewport').scrollTop),0);
   const down=await page.evaluate(async()=>{const r=await __nav.focus('B10');if(r.ok)r.confirm.click();return {ok:r.ok,id:r.tableId,scroll:document.getElementById('viewport').scrollTop,pageScroll:scrollY,clicked:__clicked};});
   assert.equal(down.ok,true);assert.equal(down.id,'BAV10');assert(down.scroll>800);assert.equal(down.pageScroll,0);assert.deepEqual(down.clicked,['B10']);
   const up=await page.evaluate(async()=>{const r=await __nav.focus('BAV01',{control:'side',side:'莊'});return {ok:r.ok,id:r.tableId,scroll:document.getElementById('viewport').scrollTop,side:r.target?.parentElement.querySelector('.caption').textContent};});
   assert.equal(up.ok,true);assert.equal(up.id,'BAV01');assert.equal(up.side,'莊');assert.equal(up.scroll,0);
   const cancelled=await page.evaluate(async()=>{const p=__nav.focus('B10');__nav.cancel();return (await p).reason;});assert.equal(cancelled,'cancelled');
   const round=await page.evaluate(async()=>{const p=__nav.focus('B10',{expectedGameSn:'game-9'});__tables[9].clock.gameSn='next-game';return (await p).reason;});assert.equal(round,'round-changed');
   await page.evaluate(()=>__tables.push({name:'B06',tableId:'BAV06_LIVE'}));
   assert.equal(await page.evaluate(async()=>(await __nav.focus('B06')).reason),'ambiguous-table-id');
   await page.evaluate(()=>{const card=[...document.querySelectorAll('.gameDesk')][5];card.__vueParentComponent={props:{table:{table_id:'BAV06'},token:'MUST-NOT-EXPORT'}};});
   const exact=await page.evaluate(async()=>{const r=await __nav.focus('BAV06');return {ok:r.ok,id:r.tableId,exportText:JSON.stringify(__nav.list())};});assert.equal(exact.ok,true);assert.equal(exact.id,'BAV06');assert(!exact.exportText.includes('MUST-NOT-EXPORT'));
   await page.evaluate(()=>{
    for(const i of [0,1,2,3])__tables.push({name:__tables[i].name,tableId:__tables[i].tableId+'_LIVE'});
    const cards=[...document.querySelectorAll('.gameDesk')];
    window.__secretReads=0;
    const props={table:{table_id:'BAV01'}};Object.defineProperty(props,'token',{enumerable:true,get(){__secretReads++;throw Error('不能讀取Token');}});
    cards[0].__reactProps$test=props;
    const row=cards[1].closest('.gameDesk_wrap');
    cards[1].__reactFiber$test={stateNode:cards[1],memoizedProps:{className:'gameDesk'},return:{memoizedProps:{table:{table_id:'BAV02'}},return:{stateNode:row,memoizedProps:{children:{props:{table_id:'BAV03'}}},return:{stateNode:document.getElementById('viewport'),memoizedProps:{table:{table_id:'BAV01_LIVE'}}}}}};
    const shared={stateNode:document.getElementById('viewport'),memoizedProps:{table:{table_id:'BAV03'}}};
    cards[2].__reactFiber$test={stateNode:cards[2],memoizedProps:{},return:shared};
    cards[3].__reactProps$test={table:{table_id:'BAV04_LIVE'}};
   });
   const propsId=await page.evaluate(async()=>{const r=await __nav.focus('BAV01');return {ok:r.ok,id:r.tableId,source:__nav.list()[0].identitySource,secretReads:__secretReads};});
   assert.equal(propsId.ok,true);assert.equal(propsId.id,'BAV01');assert.equal(propsId.source,'react-dom-props');assert.equal(propsId.secretReads,0);
   const fiberId=await page.evaluate(async()=>{const r=await __nav.focus('BAV02');return {ok:r.ok,id:r.tableId,source:__nav.list()[1].identitySource};});
   assert.equal(fiberId.ok,true);assert.equal(fiberId.id,'BAV02');assert.equal(fiberId.source,'react-row-props');
   assert.equal(await page.evaluate(async()=>(await __nav.focus('BAV03')).reason),'ambiguous-table-id');
   const screen=await page.evaluate(async()=>{const r=await __nav.focus('B03',{identity:'display',control:'side',side:'莊'});return {ok:r.ok,name:r.name,id:r.tableId,verified:r.identityVerified,source:r.locationSource,confirmTable:r.confirm?.dataset.testTable,caption:r.target?.parentElement.querySelector('.caption')?.textContent,betAreaPresent:!!r.betArea};});
   assert.deepEqual(screen,{ok:true,name:'B03',id:null,verified:false,source:'unique-dom-name',confirmTable:'B03',caption:'莊',betAreaPresent:true});
   assert.equal(await page.evaluate(async()=>(await __nav.focus('BAV03',{identity:'display'})).reason),'ambiguous-table-id');
   assert.equal(await page.evaluate(async()=>(await __nav.focus('B03',{identity:'display',expectedGameSn:'game-2'})).reason),'round-unverified');
   await page.evaluate(()=>{const c=[...document.querySelectorAll('.gameDesk')][2].closest('.gameDesk_wrap').cloneNode(true);c.id='duplicate-b03';document.querySelector('.multiple').append(c);});
   assert.equal(await page.evaluate(async()=>(await __nav.focus('B03',{identity:'display'})).reason),'duplicate-dom-row');
   await page.evaluate(()=>document.getElementById('duplicate-b03').remove());
   const liveId=await page.evaluate(async()=>{const r=await __nav.focus('BAV04_LIVE');return {ok:r.ok,id:r.tableId};});assert.equal(liveId.ok,true);assert.equal(liveId.id,'BAV04_LIVE');
   assert.equal(await page.evaluate(async()=>(await __nav.focus('BAV04',{timeoutMs:100})).ok),false);
   await page.evaluate(()=>{const c=[...document.querySelectorAll('.gameDesk')][0];c.__reactProps$test={items:[{table_id:'BAV01'},{table_id:'BAV01_LIVE'}]};});
   assert.equal(await page.evaluate(async()=>(await __nav.focus('BAV01')).reason),'ambiguous-table-id');
   const absent=await page.evaluate(async()=>(await __nav.focus('B99',{timeoutMs:120})).reason);assert(['scroll-timeout','table-not-found'].includes(absent));
   const unresolvedProbe=await page.evaluate(()=>__nav.list()[2].identityInspection);
   assert(unresolvedProbe.frameworks.includes('react-fiber'));assert(unresolvedProbe.scannedFibers>0);assert(unresolvedProbe.boundaryStops>0);
   await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.gameDesk')];
    const props={payload:{data:{identity:{code:'BAV01'}}},token:'MUST-NOT-EXPORT',username:'MUST-NOT-EXPORT'};
    Object.defineProperty(cards[0],'__reactProps$test',{value:props,enumerable:false,configurable:true,writable:true});
    cards[2].__reactFiber$test={stateNode:cards[2],key:'BAV03',memoizedProps:{className:'gameDesk'},return:{stateNode:cards[2].closest('.gameDesk_wrap'),memoizedProps:{}}};
   });
   const aliases=await page.evaluate(async()=>{const a=await __nav.focus('BAV01'),b=await __nav.focus('BAV03');return {ids:[a.tableId,b.tableId],sources:[__nav.list()[0].identitySource,__nav.list()[2].identitySource],exportText:JSON.stringify(__nav.list())};});
   assert.deepEqual(aliases.ids,['BAV01','BAV03']);assert(aliases.sources[0].includes('known-id'));assert(aliases.sources[1].includes('react-row-key'));assert(!aliases.exportText.includes('MUST-NOT-EXPORT'));assert.equal(await page.evaluate(()=>__secretReads),0);
   await page.evaluate(()=>{const c=[...document.querySelectorAll('.gameDesk')][2];c.__reactFiber$test.key='BAV02';});
   assert.equal(await page.evaluate(async()=>(await __nav.focus('BAV03')).reason),'ambiguous-table-id');
   await page.evaluate(()=>{const c=[...document.querySelectorAll('.gameDesk')][2];c.__reactFiber$test.key='BAV99';});
   assert.deepEqual(await page.evaluate(()=>__nav.list()[2].nativeIds),[]);
   assert.deepEqual(await page.evaluate(()=>__clicked),['B10']);
   console.log('PASS MT 捲動與ID',width,height,'React/Vue行內ID、直播桌、共享父層/多候選拒絕、Token getter不讀；下捲/上捲/取消/換局，不跳頁');await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
