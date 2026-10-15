#!/usr/bin/env node
'use strict';
// Anonymous documents only. Never requests a vendor or uses a real login.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const esbuild = require('esbuild');
let playwright;try{playwright=require('playwright');}catch{playwright=require('/tmp/dg-testdeps/node_modules/playwright');}
const root = path.resolve(__dirname,'..');
function moduleFrom(file) {
  const module = { exports:{} };
  vm.runInNewContext(esbuild.transformSync(fs.readFileSync(path.join(root,file),'utf8'),{loader:'ts',format:'cjs'}).code,{module,exports:module.exports});
  return module.exports;
}
const { withPageZoomLock } = moduleFrom('shared/page-zoom-lock.ts');
const { DG_MOBILE_LAYOUT_CSS } = moduleFrom('lib/dg-panel-mobile-layout.ts');
(async()=>{
  const browser = await playwright.chromium.launch({executablePath:process.env.DG_TEST_CHROME||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const origin = 'https://autobac-offline.example';
  const html = withPageZoomLock('<!doctype html><html><head><meta name="viewport" content="width=980,initial-scale=2"></head><body style="margin:0"><input id="root-input" style="font-size:12px" placeholder="匿名測試"><button id="tap">測試單擊</button><iframe src="/game" style="width:390px;height:500px;border:0"></iframe><div style="height:1500px"></div><script>document.getElementById("tap").onclick=()=>window.tapCount=(window.tapCount||0)+1;</script></body></html>');
  const game = withPageZoomLock('<html><head><meta name="viewport" content="width=980"></head><body><input id="game-input" style="font-size:12px"><div id="panel"></div><script>var s=document.getElementById("panel").attachShadow({mode:"open"});s.innerHTML='+JSON.stringify('<style>input{font-size:11px}'+DG_MOBILE_LAYOUT_CSS+'</style><input id="panel-input">')+';</script></body></html>');
  try {
    await page.route('**/*',r=>r.request().url()===origin+'/'?r.fulfill({contentType:'text/html',body:html}):r.request().url()===origin+'/game'?r.fulfill({contentType:'text/html',body:game}):r.abort());
    await page.goto(origin+'/');
    const frame=page.frames().find(f=>f.url()===origin+'/game');assert(frame);
    for(const [target,selector] of [[page,'#root-input'],[frame,'#game-input'],[frame,'#panel-input']]) {
      assert.equal(await target.locator(selector).evaluate(el=>parseFloat(getComputedStyle(el).fontSize)),16);
      await target.locator(selector).fill('123');
      assert.equal(await page.evaluate(()=>visualViewport.scale),1);
      assert.equal(await frame.evaluate(()=>visualViewport.scale),1);
    }
    for(const target of [page,frame]) {
      assert.equal(await target.locator('meta[name="viewport"]').count(),1);
      assert.match(await target.locator('meta[name="viewport"]').getAttribute('content'),/maximum-scale=1/);
      assert.equal(await target.evaluate(()=>{
        const event=new Event('gesturestart',{bubbles:true,cancelable:true});document.dispatchEvent(event);return event.defaultPrevented;
      }),true);
      assert.equal(await target.evaluate(()=>{
        const event=new Event('touchmove',{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:[{}]});document.dispatchEvent(event);return event.defaultPrevented;
      }),false);
      await target.evaluate(()=>{const meta=document.createElement('meta');meta.name='viewport';meta.content='initial-scale=2';document.head.appendChild(meta);});
      await target.waitForFunction(()=>document.querySelectorAll('meta[name="viewport"]').length===1);
    }
    await frame.evaluate(()=>document.activeElement?.blur());
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await page.waitForTimeout(250);
    const visible=await page.evaluate(()=>({width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale,scrollY}));
    console.log('Pinch fixture viewport',JSON.stringify(visible));
    const client=await page.context().newCDPSession(page);
    await client.send('Input.synthesizePinchGesture',{x:Math.min(150,visible.width/2),y:Math.min(150,visible.height/2),scaleFactor:1.5,gestureSourceType:'touch'});
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(()=>visualViewport.scale),1,'root pinch stays at scale 1');
    await page.locator('#tap').tap();assert.equal(await page.evaluate(()=>tapCount),1,'single tap still works');
    await page.evaluate(()=>window.scrollTo(0,800));assert(await page.evaluate(()=>scrollY)>0,'ordinary scrolling still works');
    console.log('PASS Chromium mobile root/iframe/shadow input=16px, focus scale=1, pinch blocked, viewport mutation repair, single tap and scrolling preserved. No real login/game/bet. iOS Safari still needs device confirmation.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
