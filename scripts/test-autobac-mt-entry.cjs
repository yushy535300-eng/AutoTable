const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright');}catch{playwright=require('/tmp/dg-testdeps/node_modules/playwright');}
const {html}=require('./test-mt-click-console.cjs');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(process.env.MT_ENTRY_CONSOLE_PATH||path.join(root,'public/mt-native-click-console.js'),'utf8');
const origin='https://autobac.invalid';
const foregroundMarker=`<script>Object.defineProperty(window,'__AUTOBAC_MT_FOREGROUND__',{value:Object.freeze({kind:'autobac-mt-foreground-v1',version:1,pathPrefix:'/mt-game'}),writable:false,configurable:false});</script>`;
const gameHtml=html().replace('<!doctype html>',`<!doctype html>${foregroundMarker}`);

async function run(){
 assert(source.includes('__AUTOBAC_MT_FOREGROUND__'),'public console is stale: run the MT console build after the foreground guard source is merged');
 const browser=await playwright.chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const viewport of [{name:'portrait',width:390,height:844},{name:'landscape',width:844,height:390}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin)return route.abort();
    if(url.pathname==='/shell')return route.fulfill({contentType:'text/html',body:'<!doctype html><iframe id="mt" src="/mt-game/"></iframe>'});
    if(url.pathname==='/mt-game/')return route.fulfill({contentType:'text/html',body:gameHtml});
    return route.abort();
   });
   await page.goto(`${origin}/shell`);
   const frame=page.frames().find(f=>f.url()===`${origin}/mt-game/`);assert(frame,'same-origin MT foreground frame did not load');
   await frame.evaluate(source);
   await frame.waitForFunction(()=>window.__MT_NATIVE_CLICK__?.version==='0.6.1-official-turnover');
   const state=await frame.evaluate(()=>({marker:window.__AUTOBAC_MT_FOREGROUND__,view:window.__MT_NATIVE_CLICK__.view(),events:window.events||[],root:!!document.getElementById('__autobac_mt_click__')}));
   assert.equal(state.marker.kind,'autobac-mt-foreground-v1');
   assert.equal(state.root,true);assert.equal(state.view.running,false);assert.equal(state.view.pending,0);
   assert.equal(state.events.some(e=>String(e).startsWith('confirm:')),false,'installer must not submit a native bet');
   assert.deepEqual(errors,[]);
   await frame.evaluate(()=>window.__MT_NATIVE_CLICK__.dispose());await page.close();
   console.log(`PASS MT same-origin ${viewport.name}: official API, panel and no-autostart`);
  }
 }finally{await browser.close();}
}
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={run};
