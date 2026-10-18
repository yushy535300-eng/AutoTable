'use strict';
const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require('/tmp/dg-testdeps/node_modules/playwright')}
const fs=require('node:fs'),path=require('node:path');
const {openOfflinePage,configure,approveAndStart,stopAndClose,packetPayload}=require('./test-dg-mobile-v329-complete.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const body=(side='banker6',amount=100)=>({[side]:amount});
const sent=(gameNo,amount=100,tableId=799)=>({cmd:6,tableId,gameNo,bet:body('banker6',amount)});
const receipt=(gameNo,amount=100,tableId=799)=>({cmd:6,codeId:0,tableId,gameNo,list:[JSON.stringify(body('banker6',amount))]});
const settle=(gameNo,pnl,tableId=799)=>({cmd:1007,codeId:0,tableId,gameNo,dList:[0,pnl]});
const emit=(page,msg)=>page.evaluate(m=>window.__offlineMobile.emit('RECEIVED_SUCCESS',m),msg);
const send=(page,msg)=>page.evaluate(m=>window.__offlineMobile.socket.sendData(m),msg);
const state=page=>page.evaluate(()=>window.__DG_SINGLEPAGE__.status());
const automaticPackets=page=>page.evaluate(()=>window.__offlineMobile.sent.filter(m=>Number(m.cmd)===6&&m.type===1).length);
const field=(page,id,value)=>page.evaluate(({id,value})=>{const n=document.querySelector('#__dg_singlepage_panel__').shadowRoot.getElementById(id);n.value=String(value);n.dispatchEvent(new Event('input',{bubbles:true}));},{id,value});
const roundSummary=page=>page.evaluate(()=>{const root=document.querySelector('#__dg_singlepage_panel__').shadowRoot,panel=root.getElementById('panel').getBoundingClientRect();return {pnl:root.getElementById('round-pnl').textContent,wlt:root.getElementById('round-wlt').textContent,hit:root.getElementById('round-hit').textContent,size:{width:panel.width,height:panel.height}};});
async function readyPage(browser,staking='flat',limits={loss:600,profit:200}){
 const page=await openOfflinePage(browser,[{id:701,method:'ei'}]);
 await configure(page,{count:'1',staking});
 await field(page,'stop-loss',staking==='martingale'?2600:limits.loss);
 await field(page,'take-profit',limits.profit);
 return page;
}
async function settleAuto(page,pnl){
 const packet=await page.evaluate(()=>window.__offlineMobile.sent.find(m=>Number(m.cmd)===6&&m.type===1));
 assert(packet,'one automatic order must exist');
 const payload=packetPayload(packet);delete payload.info;
 await emit(page,{cmd:6,codeId:0,tableId:packet.tableId,gameNo:packet.gameNo,list:[JSON.stringify(payload)]});
 await emit(page,settle(packet.gameNo,pnl,packet.tableId));
}
(async()=>{
 const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  // A valid 1007 can arrive before the documented cmd 6 acceptance shape. It
  // remains non-P/L evidence until that exact acceptance arrives; auto handling
  // runs first in the same listener and must not consume this manual result.
  let page=await readyPage(browser,'martingale');
  try{
   await approveAndStart(page);await settleAuto(page,100);
   const levelsBefore=await page.evaluate(()=>window.__DG_SINGLEPAGE__.exportLedger().levels);
   await send(page,sent('manual-profit'));assert.equal((await state(page)).roundPnl,100);
   await emit(page,settle('manual-profit',100));
   let s=await state(page);assert.equal(s.roundPnl,100,'1007 before cmd 6 acknowledgement does not immediately fabricate manual P/L');assert.equal(s.manualPending[0].state,'sent');
   await emit(page,receipt('manual-profit'));
   s=await state(page);assert.equal(s.roundPnl,200);assert.deepEqual(s.roundPnlBreakdown,{automatic:100,manual:100});assert.equal(s.manualPending.length,0);assert.equal(s.running,false);assert(s.status.includes('止盈'));
   assert.deepEqual(await page.evaluate(()=>window.__DG_SINGLEPAGE__.exportLedger().levels),levelsBefore,'manual independent wager cannot alter martingale levels');
   await emit(page,settle('manual-profit',100));assert.equal((await state(page)).roundPnl,200);
   const before=await automaticPackets(page);await page.evaluate(()=>window.__offlineMobile.cards.forEach(c=>c.gameInfo.gameNo+='-new'));await sleep(650);assert.equal(await automaticPackets(page),before,'combined target stops all new automatic submissions');
   const usages=await page.evaluate(()=>window.__DG_SINGLEPAGE__.usageHistory());assert.equal(usages[0].pnl,100,'tool-only usage is not inflated by manual P/L');
  }finally{await stopAndClose(page)}
  // A single confirmed manual wager clears its own lock after real settlement;
  // the following auto round can start normally.
  page=await readyPage(browser,'flat',{loss:600,profit:2000});
  try{
   await send(page,sent('manual-normal',100,701));await emit(page,receipt('manual-normal',100,701));await emit(page,settle('manual-normal',95,701));
   let s=await state(page);assert.equal(s.roundPnl,95);assert.equal(s.manualPending.length,0,'one confirmed manual wager is no longer pending after 1007');
   await approveAndStart(page);await sleep(650);
   s=await state(page);assert.equal(s.running,true);assert.equal(await automaticPackets(page),1,'after the normal manual settlement, a new automatic round is permitted');
  }finally{await stopAndClose(page)}
  // A different table/round manual wager is allowed while auto is running. Its
  // verified result is included in the combined risk P/L, but does not stop a
  // run that has not reached a configured target.
  page=await readyPage(browser,'flat',{loss:600,profit:2000});
  try{
   await approveAndStart(page);await send(page,sent('manual-live',100,799));await emit(page,receipt('manual-live',100,799));await emit(page,settle('manual-live',95,799));
   const s=await state(page);assert.equal(s.running,true);assert.deepEqual(s.roundPnlBreakdown,{automatic:0,manual:95});assert.equal(s.roundPnl,95);assert.equal(s.manualPending.length,0);
   assert.equal(await automaticPackets(page),1,'normal manual input during auto neither blocks nor resubmits the existing automatic order');
  }finally{await stopAndClose(page)}
  // Stopping auto never detaches the passive native observer: a later manual
  // round still updates the same risk total, without restarting its timer/run.
  page=await readyPage(browser,'flat',{loss:600,profit:2000});
  try{
   await approveAndStart(page);await page.evaluate(()=>window.__DG_SINGLEPAGE__.stop());
   const stopped=await state(page);assert.equal(stopped.running,false);assert.equal(stopped.usage.running,false);
   const beforeSummary=await roundSummary(page);
   await send(page,sent('manual-after-stop-win',100,799));await emit(page,receipt('manual-after-stop-win',100,799));await emit(page,settle('manual-after-stop-win',95,799));
   await send(page,sent('manual-after-stop-loss',100,799));await emit(page,receipt('manual-after-stop-loss',100,799));await emit(page,settle('manual-after-stop-loss',-95,799));
   await send(page,sent('manual-after-stop-zero',100,799));await emit(page,receipt('manual-after-stop-zero',100,799));await emit(page,settle('manual-after-stop-zero',0,799));
   const s=await state(page);assert.equal(s.running,false);assert.equal(s.usage.running,false);assert.equal(s.usage.started,stopped.usage.started);assert.equal(s.usage.elapsedMs,stopped.usage.elapsedMs,'manual settlement after stop does not restart or extend the automatic timer');
   assert.deepEqual(s.roundPnlBreakdown,{automatic:0,manual:0});assert.equal(s.roundPnl,0);assert.equal(s.manualPending.length,0);
   const summary=await roundSummary(page);assert.deepEqual(summary,{pnl:'0',wlt:'1／1／1',hit:'50%',size:beforeSummary.size},'stopped manual-only verified win/loss/zero P/L results share the combined summary without resizing it');
  }finally{await stopAndClose(page)}
  // A manual loss after stopping still fills the original round, and a fresh start clears totals only after no pending remains.
  page=await readyPage(browser,'flat',{loss:300,profit:2000});
  try{
   await approveAndStart(page);await settleAuto(page,-100);
   await send(page,sent('manual-loss',200));await emit(page,receipt('manual-loss',200));
   await page.evaluate(()=>window.__DG_SINGLEPAGE__.stop());await emit(page,settle('manual-loss',-200));
   assert.equal((await state(page)).roundPnl,-300);assert.equal((await state(page)).running,false);
   await emit(page,settle('manual-loss',-200));assert.equal((await state(page)).roundPnl,-300);
   await approveAndStart(page);assert.equal((await state(page)).roundPnl,0,'fresh resets both observed settled totals, not history');
  }finally{await stopAndClose(page)}
  // Live manual loss crosses stop-loss and freezes the entire scan; pending manual amount is reserved preflight.
  page=await readyPage(browser,'flat',{loss:300,profit:2000});
  try{
   await approveAndStart(page);await settleAuto(page,-100);
   await send(page,sent('manual-threshold',200));await emit(page,receipt('manual-threshold',200));await emit(page,settle('manual-threshold',-200));
   const s=await state(page);assert.equal(s.running,false);assert.equal(s.roundPnl,-300);assert(s.status.includes('止損'));
  }finally{await stopAndClose(page)}
  page=await readyPage(browser,'flat',{loss:200,profit:2000});
  try{
   await approveAndStart(page);await settleAuto(page,-100);
   await send(page,sent('manual-exposure',100));await emit(page,receipt('manual-exposure',100));
   const before=await automaticPackets(page);await page.evaluate(()=>window.__offlineMobile.cards.forEach(c=>{c.gameInfo.gameNo+='-new';c.gameInfo.starTime=Date.now()}));await sleep(650);
   assert.equal((await state(page)).running,false);assert.equal(await automaticPackets(page),before,'manual accepted principal consumes risk budget before another auto packet');
  }finally{await stopAndClose(page)}
  // Opaque/manual-unknown cannot fabricate P/L or bypass fresh-start lock.
  page=await readyPage(browser);
  try{
   await approveAndStart(page);await settleAuto(page,0);
   await send(page,{cmd:6,tableId:799,gameNo:'manual-opaque',list:['opaque-test']});
   assert.equal((await state(page)).running,false);await emit(page,settle('manual-opaque',900));assert.equal((await state(page)).roundPnl,0);
   await approveAndStart(page);assert.equal((await state(page)).running,false);assert.equal((await state(page)).manualPending.length,1);
  }finally{await stopAndClose(page)}
  page=await readyPage(browser);
  try{
   await approveAndStart(page);await settleAuto(page,0);await send(page,sent('manual-mismatch'));
   await emit(page,{cmd:6,codeId:0,tableId:799,gameNo:'manual-mismatch',list:[JSON.stringify({player:100})]});
   assert.equal((await state(page)).running,false,'equal amount but wrong side stops immediately');
   await emit(page,settle('manual-mismatch',100));assert.equal((await state(page)).roundPnl,0);
  }finally{await stopAndClose(page)}
  // A second manual cmd 6 for the same table/game has no unique native request
  // id. It remains a stopped attribution lock even if later receipts/1007s arrive.
  page=await readyPage(browser);
  try{
   await page.evaluate(()=>window.__offlineMobile.cards[0].gameInfo.gameNo='manual-double');
   await send(page,sent('manual-double',100,701));await send(page,sent('manual-double',100,701));
   await emit(page,receipt('manual-double',100,701));await emit(page,settle('manual-double',100,701));
   let s=await state(page);assert.equal(s.roundPnl,0);assert.equal(s.manualPending.length,1);assert.equal(s.manualPending[0].attributionUncertain,true);
   assert((await page.evaluate(()=>window.__DG_SINGLEPAGE__.rounds()[0].label)).includes('歸屬待核'),'mixed same-game state is labelled attribution pending, not settlement pending');
   await approveAndStart(page);s=await state(page);assert.equal(s.running,false);assert(s.status.includes('歸屬待核'),'mixed attribution cannot resume automation from a later 1007');
  }finally{await stopAndClose(page)}
  // Reinstall retains stopped source round; account changes cannot inherit that manual sum.
  page=await readyPage(browser);
  try{
   await send(page,sent('manual-reload'));await emit(page,receipt('manual-reload'));await page.evaluate(()=>window.__DG_SINGLEPAGE__.dispose());
   await page.addScriptTag({path:path.join(__dirname,'..','public','dg-direct-bet-console.js')});
   assert.equal((await state(page)).manualPending.length,1);await emit(page,settle('manual-reload',95));assert.equal((await state(page)).roundPnl,95);
   await page.evaluate(()=>{window.__DG_SINGLEPAGE__.dispose();window.__offlineMobile.playerInfo.playerName='other-offline-account'});
   await page.addScriptTag({path:path.join(__dirname,'..','public','dg-direct-bet-console.js')});assert.equal((await state(page)).roundPnl,0,'different DG account scope does not read other manual ledger');
  }finally{await stopAndClose(page)}
  // A manual win arriving during the first send cancels remaining cards in that same batch.
  page=await openOfflinePage(browser,[{id:801,method:'ei'},{id:802,method:'Ki'},{id:803,method:'ei'}]);
  try{
   await configure(page,{count:'3',staking:'flat'});await field(page,'take-profit',95);
   await page.evaluate(()=>{
    const sent=window.__offlineMobile.sent,originalPush=sent.push;let fired=false;
    sent.push=function(packet){const result=originalPush.call(this,packet);if(packet.type===1&&!fired){fired=true;const socket=window.__offlineMobile.socket;socket.sendData({cmd:6,tableId:899,gameNo:'batch-manual',bet:{banker6:100}});window.__offlineMobile.emit('RECEIVED_SUCCESS',{cmd:6,codeId:0,tableId:899,gameNo:'batch-manual',list:[JSON.stringify({banker6:100})]});window.__offlineMobile.emit('RECEIVED_SUCCESS',{cmd:1007,codeId:0,tableId:899,gameNo:'batch-manual',dList:[0,95]});}return result;};
   });
   await approveAndStart(page);await sleep(650);assert.equal((await state(page)).running,false);assert.equal((await state(page)).roundPnl,95);assert.equal(await automaticPackets(page),1,'manual threshold cancels remaining two native submissions in the same batch');
  }finally{await stopAndClose(page)}
  console.log('PASS: ordered and out-of-order manual settlement, live/post-stop manual P/L, combined risk limits, pending exposure, unknown lock, tool usage separation, martingale isolation, reload/account isolation. Offline-only.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
