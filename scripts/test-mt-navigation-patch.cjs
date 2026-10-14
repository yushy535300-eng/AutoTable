const fs=require('node:fs'),assert=require('node:assert/strict');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/tmp/dg-testdeps/node_modules/playwright'));}
const source=fs.readFileSync('/home/ubuntu/AutoBac-MT-Console-桌台辨識修補-v0.4.3.js','utf8');
const fixture=JSON.parse(fs.readFileSync('/home/ubuntu/upload/pasted_content_3.txt','utf8'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:707,height:452}});
  await page.route('**/*',route=>route.fulfill({body:'<!doctype html><body></body>',contentType:'text/html'}));
  await page.goto('https://gsa.ofalive99.net/');
  await page.evaluate(fixture=>{
   const tables=fixture.tables.map(x=>({tableId:x.id,name:x.name,clock:{shoe:x.shoe,round:x.round,count:x.countdown}}));
   document.head.innerHTML='<style>body{margin:0}#v{width:480px;height:310px;overflow:auto}.gameDesk_wrap{height:120px;display:flex}.gameDesk{width:50%}.gameDesk_bet{width:50%}#v button{height:30px;margin-top:70px}</style>';
   document.body.innerHTML='<section id="__autobac_mt_diag__"><span class="ab-tag">一次完整診斷</span><button class="ab-close">−</button><button data-v="copy">複製完整報告</button><button data-v="remove">移除</button></section><div id="v"><div class="ant-tabs-tabpane-active multiple">'+fixture.viewport.tables.map(t=>'<div class="gameDesk_wrap"><div class="gameDesk"><div class="gameDesk_tag">百家樂 '+t.name+'</div></div><div class="gameDesk_bet"><button class="btn-check">確認</button></div></div>').join('')+'</div></div>';
   const cards=[...document.querySelectorAll('.gameDesk')];for(let i=0;i<4;i++)cards[i].__reactProps$fixture={table:{table_id:fixture.viewport.tables[i].candidateIds[0]}};
   window.__clicks=0;document.querySelectorAll('.btn-check').forEach(b=>b.onclick=()=>__clicks++);
   const nativeObservation={acceptedCount:10,settledGroupCount:9,records:[{id:'OFFLINE-ONLY'}],groups:[]};
   window.__nativeObservation=nativeObservation;window.__sendBefore=WebSocket.prototype.send;window.__fetchBefore=fetch;
   window.__disposeCalls=0;window.__oldCancelCalls=0;
   function dispose(){__disposeCalls++;if(window.__MT_AUTOBAC_DIAG__?.dispose===dispose)delete window.__MT_AUTOBAC_DIAG__;document.getElementById('__autobac_mt_diag__')?.remove();}
   const report=()=>({version:'MT-DIAG-0.4',liveTables:tables,betObservation:nativeObservation,tableViewport:{tables:fixture.viewport.tables,history:[]},captureStats:{total:900}});
   window.__MT_AUTOBAC_DIAG__={report,dispose,scrollToTable:async()=>({ok:false}),cancelScroll:()=>__oldCancelCalls++};
   document.querySelector('[data-v="remove"]').onclick=dispose;
   window.__original=Object.assign({},window.__MT_AUTOBAC_DIAG__);
  },fixture);
  await page.addScriptTag({content:source});
  let r=await page.evaluate(()=>{const d=__MT_AUTOBAC_DIAG__.report();return {version:d.version,ids:d.tableViewport.tables.map(x=>x.tableId),counts:[d.betObservation.acceptedCount,d.betObservation.settledGroupCount],same:d.betObservation===__nativeObservation,send:WebSocket.prototype.send===__sendBefore,fetch:fetch===__fetchBefore};});
  assert.equal(r.version,'MT-DIAG-0.4.3');assert.deepEqual(r.ids,['BAV01','BAV02','BAV03','BAV03A','BAV05','BAV06','BAV07','BAV08','BAV09','BAV10']);assert.deepEqual(r.counts,[10,9]);assert(r.same&&r.send&&r.fetch);
  assert.equal(await page.evaluate(async()=>(await __MT_AUTOBAC_DIAG__.scrollToTable('BAV03')).ok),true);
  const domOnly=await page.evaluate(async()=>{
   const cards=[...document.querySelectorAll('.gameDesk')];for(let i=0;i<4;i++)delete cards[i].__reactProps$fixture;
   const d=__MT_AUTOBAC_DIAG__,located=await d.scrollToTable('B03'),strict=await d.scrollToTable('BAV03');
   const table=d.report().tableViewport.tables.find(t=>t.name==='B03');
   return {ok:located.ok,name:located.name,id:located.tableId,verified:located.identityVerified,source:located.locationSource,betArea:!!located.betArea,confirm:!!located.confirm,frameworks:table.identityInspection.frameworks,strictReason:strict.reason,clicks:__clicks,counts:[d.report().betObservation.acceptedCount,d.report().betObservation.settledGroupCount]};
  });
  assert.deepEqual(domOnly,{ok:true,name:'B03',id:null,verified:false,source:'unique-dom-name',betArea:true,confirm:true,frameworks:[],strictReason:'ambiguous-table-id',clicks:0,counts:[10,9]});
  await page.addScriptTag({content:source});
  r=await page.evaluate(()=>({accepted:__MT_AUTOBAC_DIAG__.report().betObservation.acceptedCount,disposed:__disposeCalls,clicks:__clicks}));assert.deepEqual(r,{accepted:10,disposed:0,clicks:0});
  assert.equal(await page.evaluate(async()=>{const p=__MT_AUTOBAC_DIAG__.scrollToTable('B10');__MT_AUTOBAC_DIAG__.cancelScroll();return (await p).reason;}),'cancelled');
  const restored=await page.evaluate(()=>{__MT_NAV_PATCH__.undo();return Object.entries(__original).every(([k,v])=>__MT_AUTOBAC_DIAG__[k]===v)&&!window.__MT_NAV_PATCH__;});assert(restored);
  await page.addScriptTag({content:source});await page.locator('[data-v="remove"]').click();
  r=await page.evaluate(()=>({disposed:__disposeCalls,diag:!!window.__MT_AUTOBAC_DIAG__,patch:!!window.__MT_NAV_PATCH__,clicks:__clicks,send:WebSocket.prototype.send===__sendBefore}));assert.deepEqual(r,{disposed:1,diag:false,patch:false,clicks:0,send:true});
  console.log('PASS MT熱修補：實際14ID/10桌名匿名樣本、4同名桌props辨識；10接受/9結算原物件保留；重貼/取消/還原/移除；零下注點擊/零WS方法變更。');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
