'use strict';
const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require('/tmp/dg-testdeps/node_modules/playwright')}
const {openOfflinePage,configure,stopAndClose}=require('./test-dg-mobile-v329-complete.cjs');
(async()=>{
 const browser=await playwright.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await openOfflinePage(context,[{id:701,method:'ei'}]);
 try{
  await configure(page,{count:'1',staking:'martingale'});
  const host=page.locator('#__dg_singlepage_panel__'),input=host.locator('#stop-loss'),error=host.locator('#stop-loss-error');
  assert.equal(await input.inputValue(),'');
  await page.evaluate(()=>window.__DG_SINGLEPAGE__.start());
  assert(await error.isVisible());assert((await error.textContent()).includes('請輸入'));
  await page.waitForTimeout(600);assert(await error.isVisible());
  await input.fill('2500');assert(await error.isVisible());assert((await error.textContent()).includes('低於 2,600'));
  const color=await error.evaluate(n=>getComputedStyle(n).color);assert.equal(color,'rgb(255, 114, 126)');
  await page.evaluate(()=>window.__DG_SINGLEPAGE__.start());
  assert.equal(await page.evaluate(()=>window.__offlineMobile.sent.filter(x=>Number(x.cmd)===6).length),0);
  assert.equal(await input.getAttribute('aria-invalid'),'true');
  await input.fill('2600');assert(!(await error.isVisible()));
  await page.evaluate(()=>window.__DG_SINGLEPAGE__.start());
  assert(await host.locator('#risk-confirm').isVisible(),'2600 reaches consent, does not auto-start');
  await host.locator('#risk-cancel').click();
  await configure(page,{count:'1',staking:'flat'});
  assert.equal(await input.inputValue(),'');
  await host.locator('#nav-settings').click();await input.fill('2500');assert(!(await error.isVisible()));
  console.log('PASS: manual empty martingale; persistent red blank/2500 error; zero orders; 2600 eligible for consent; flat unchanged. Anonymous offline only.');
 }finally{await stopAndClose(page);await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
