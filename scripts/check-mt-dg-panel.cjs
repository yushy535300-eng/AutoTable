const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
let pw;try{pw=require('playwright');}catch{pw=require('/tmp/dg-testdeps/node_modules/playwright');}
const {buildSync}=require('esbuild');
const root=path.resolve(__dirname,'..');
const {html}=require('./test-mt-click-console.cjs');
const code=fs.readFileSync(path.join(root,'public/mt-native-click-console.js'),'utf8');
const built=buildSync({stdin:{contents:"export {DG_PANEL_HTML} from './lib/dg-panel-view';",resolveDir:root},bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text;
const moduleObj={exports:{}};new Function('module','exports',built)(moduleObj,moduleObj.exports);
const template=moduleObj.exports.DG_PANEL_HTML;
const out=process.env.MT_PARITY_PREVIEW_DIR||'/home/ubuntu/mt_dg_parity_preview';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await pw.chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let n=0;
 try{
  for(const size of [{name:'desktop',width:1280,height:900},{name:'portrait',width:390,height:844},{name:'landscape',width:844,height:390}]){
   const p=await browser.newPage({viewport:{width:size.width,height:size.height}});
   const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.route('**/*',r=>r.request().url()==='https://gsa.ofalive99.net/offline-test'?r.fulfill({contentType:'text/html',body:html()}):r.abort());
   await p.goto('https://gsa.ofalive99.net/offline-test');await p.evaluate(code);await p.waitForFunction(()=>window.__MT_NATIVE_CLICK__?.version==='0.6.1-official-turnover');
   const sh=p.locator('#__autobac_mt_click__');
   const parity=await p.evaluate(t=>{const expected=document.createElement('template');expected.innerHTML=t;const s=document.getElementById('__autobac_mt_click__').shadowRoot;return{sameStyle:expected.content.querySelector('style').textContent===s.querySelector('style').textContent,missing:[...expected.content.querySelectorAll('[id]')].map(e=>e.id).filter(id=>!s.getElementById(id)),width:s.getElementById('panel').offsetWidth,height:s.getElementById('panel').offsetHeight};},template);
   assert(parity.sameStyle,'all CSS must be directly shared with DG');assert.deepEqual(parity.missing,[],'every DG surface/control must exist');assert.equal(parity.width,280);
   async function shot(name,target='#panel'){await p.mouse.click(8,8);await sh.locator(target).screenshot({path:path.join(out,`${name}-${size.name}.png`)});n++;}
   await shot('overview');
   for(const [button,page,name]of [['#nav-settings','#settings-page','settings'],['#nav-logs','#logs-page','logs']]){await sh.locator(button).click();await sh.locator(page).waitFor({state:'visible'});await shot(name);}
   await sh.locator('#nav-overview').click();await sh.locator('#choose-tables').click();await sh.locator('#rooms-page').waitFor({state:'visible'});await shot('rooms');await sh.locator('#rooms-back').click();
   await sh.locator('#open-report').click();await sh.locator('#report-shell').waitFor({state:'visible'});await shot('report','#report-shell');
   await sh.locator('#report-yesterday').click();await sh.locator('#report-week').click();await sh.locator('#report-today').click();await sh.locator('#close-report').click();
   await sh.locator('#compact-stop').click();await sh.locator('#risk-dialog').waitFor({state:'visible'});assert.equal(await sh.locator('#risk-confirm').isEnabled(),false);await sh.locator('#ack').check();assert.equal(await sh.locator('#risk-confirm').isEnabled(),true);await shot('risk','#risk-dialog');await sh.locator('#risk-cancel').click();
   await sh.locator('#zoom-out').click();assert.equal(await sh.locator('#panel').evaluate(e=>e.offsetWidth),210);assert.equal(await sh.locator('#panel').evaluate(e=>e.offsetHeight),228);await shot('mini');await sh.locator('#zoom-out').click();assert.equal(await sh.locator('#panel').evaluate(e=>e.offsetWidth),280);
   await sh.locator('#nav-settings').click();await sh.locator('#provider-trigger').click();assert.equal(await sh.locator('#provider-menu button').count(),6);await sh.locator('#provider-menu [data-value="gemini"]').click();assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().config.provider),'gemini');assert.equal(await sh.locator('#provider-selected-logo svg').count(),1);
   await sh.locator('#single-staking').selectOption('flat');assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().config.staking),'flat');
   await sh.locator('#single-staking').selectOption('doubling');assert.equal(await p.evaluate(()=>window.__MT_NATIVE_CLICK__.view().config.staking),'doubling');assert(await sh.locator('#doubling-reminder').isVisible());
   await sh.locator('#nav-overview').click();await sh.locator('#compact-stop').click();assert(await sh.locator('#risk-doubling-warning').isVisible());assert((await sh.locator('#risk-doubling-warning').textContent()).includes('止盈與止損'));await sh.locator('#risk-cancel').click();
   await sh.locator('#nav-overview').click();await sh.locator('#parallel-count').selectOption('3');await sh.locator('#nav-settings').click();assert.equal(await sh.locator('#single-staking').isDisabled(),true);assert.equal(await sh.locator('#single-staking').inputValue(),'flat');
   if(size.name==='desktop'){
    await sh.locator('#nav-overview').click();const h=sh.locator('#resize-panel');const b=await h.boundingBox();await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2+40,b.y+b.height/2+40);await p.mouse.up();assert(await sh.locator('#panel').evaluate(e=>e.offsetWidth)>280,'shared drag-resize must work');
   }
   assert.equal(await p.evaluate(()=>events.some(e=>e.startsWith('confirm:'))),false,'visual/navigation checks must never bet');assert.deepEqual(errors,[]);
   console.log('PASS',size.name,'all shared DG surfaces, risk cancel, logo menu, staking lock, mini restore; no bet');await p.evaluate(()=>window.__MT_NATIVE_CLICK__.dispose());await p.close();
  }
  console.log('PASS shared DG CSS/IDs on MT and',n,'surface screenshots:',out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
