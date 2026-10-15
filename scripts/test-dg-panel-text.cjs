#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
let chromium; try { ({chromium}=require('playwright')); } catch { ({chromium}=require('/tmp/dg-testdeps/node_modules/playwright')); }
const {openOfflinePage,configure,approveAndStart,waitForCmd6,packetPayload,stopAndClose}=require('./test-dg-mobile-v329-complete.cjs');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  const page=await openOfflinePage(context,Array.from({length:8},(_,i)=>({id:800+i,tableName:['S03','S05','RB04','RB02','S06','S07','RB08','RB09'][i]})));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const geometry=()=>page.evaluate(()=>{
    const s=document.querySelector('#__dg_singlepage_panel__').shadowRoot,p=s.getElementById('panel');
    const r=p.getBoundingClientRect();const hero=s.getElementById('hero-status'),phase=s.getElementById('focus-phase');
    return {width:r.width,height:r.height,heroHeight:hero.getBoundingClientRect().height,phaseHeight:phase.parentElement.getBoundingClientRect().height,hero:hero.textContent,phase:phase.textContent,heading:s.getElementById('focus-table').textContent,heroWrap:getComputedStyle(hero).whiteSpace,phaseWrap:getComputedStyle(phase).whiteSpace,overflow:hero.scrollWidth>hero.clientWidth};
  });
  try{
    await page.evaluate(()=>{const m=document.createElement('meta');m.name='viewport';m.content='width=device-width,initial-scale=1';document.head.append(m);});
    await configure(page,{count:'all',staking:'flat'});
    await page.evaluate(()=>document.querySelector('#__dg_singlepage_panel__').shadowRoot.getElementById('zoom-out').click());
    await approveAndStart(page);await waitForCmd6(page,8,'eight offline table packets');
    const before=await geometry();assert(!before.hero.includes('下注成功'),'submitted alone is not success');
    const packets=await page.evaluate(()=>window.__offlineMobile.sent.filter(p=>Number(p.cmd)===6));
    for(const p of packets){const payload=packetPayload(p);delete payload.info;await page.evaluate(m=>window.__offlineMobile.emit('RECEIVED_SUCCESS',m),{cmd:6,codeId:0,tableId:p.tableId,gameNo:p.gameNo,list:[JSON.stringify(payload)]});}
    const after=await geometry();
    assert.equal(after.heading,'等待結算：');assert(after.hero.startsWith('下注成功：'));
    for(const n of ['S03','S05','RB04','RB02','S06','S07','RB08','RB09']){assert(after.hero.includes(n));assert(after.phase.includes(n));}
    assert.equal(after.heroWrap,'nowrap');assert.equal(after.phaseWrap,'nowrap');assert(after.overflow,'all table text remains available through horizontal scroll');
    assert(Math.abs(before.width-after.width)<1,'no panel widening');assert(after.height<=before.height+1,'no panel lengthening');assert(after.phaseHeight<=before.phaseHeight+1,'same row height');assert(after.heroHeight<=before.heroHeight+1,'same success row height');
    await page.evaluate(()=>{const e=document.querySelector('#__dg_singlepage_panel__').shadowRoot.getElementById('hero-status');e.scrollLeft=200;});
    await page.waitForTimeout(500);
    assert(await page.evaluate(()=>document.querySelector('#__dg_singlepage_panel__').shadowRoot.getElementById('hero-status').scrollLeft>0),'horizontal text is not permanently clipped');
    await page.evaluate(m=>window.__offlineMobile.emit('RECEIVED_SUCCESS',m),{cmd:1007,codeId:0,tableId:packets[0].tableId,gameNo:packets[0].gameNo,dList:[0,100]});
    const settled=await geometry();assert(!settled.phase.includes('S03'),'settled table removed from waiting');assert(settled.hero.includes('S03'),'accepted history remains success');
    fs.mkdirSync('/home/ubuntu/autobac-v328-check',{recursive:true});
    await page.screenshot({path:'/home/ubuntu/autobac-v328-check/mini-summary.png'});
    await page.evaluate(()=>{window.__DG_SINGLEPAGE__.stop();document.querySelector('#__dg_singlepage_panel__').shadowRoot.getElementById('nav-settings').click();});
    const controls=await page.evaluate(()=>{const s=document.querySelector('#__dg_singlepage_panel__').shadowRoot;return ['single-staking','start-mode'].map(id=>{const e=s.getElementById(id),c=getComputedStyle(e);const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=`${c.fontWeight} ${c.fontSize} ${c.fontFamily}`;return {id,height:e.clientHeight,usableHeight:e.clientHeight-parseFloat(c.paddingTop)-parseFloat(c.paddingBottom),font:parseFloat(c.fontSize),usableWidth:e.clientWidth-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight),texts:[...e.options].map(o=>({text:o.textContent,width:ctx.measureText(o.textContent).width}))};});});
    for(const c of controls){assert(c.font>=16,'mobile font preserves no-zoom rule');assert(c.usableHeight>=c.font+3,'glyph height is not cut');assert(c.texts.every(t=>t.width<=c.usableWidth+1),'option captions fit before native arrow');}
    await page.screenshot({path:'/home/ubuntu/autobac-v328-check/settings-text.png'});
    assert.deepEqual(errors,[]);console.log('PASS eight-table accepted/settled summaries, nowrap/horizontal scroll, unchanged panel dimensions, mobile 16px select glyph and caption clearance. Offline only.');
  }finally{await stopAndClose(page);await context.close();await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
