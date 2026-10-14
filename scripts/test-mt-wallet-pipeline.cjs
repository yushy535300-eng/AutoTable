const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('/tmp/dg-testdeps/node_modules/jsdom'));}
const {buildSync}=require('esbuild'),root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'public/mt-native-click-console.js'),'utf8');
const runnerCode=buildSync({stdin:{contents:"import {createMtDomClickRunner} from './lib/mt-dom-click-runner'; window.TEST_RUNNER=createMtDomClickRunner;",resolveDir:root,loader:'ts'},bundle:true,write:false,format:'iife',platform:'browser'}).outputFiles[0].text;
const dom=new JSDOM('<html><body></body></html>',{url:'https://gs1.ofalive99.net/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;w.console={log(){},warn(){},error(){},table(){}};
class WS extends w.EventTarget{constructor(url){super();this.url=url;this.readyState=1;}send(){}}
w.WebSocket=WS;w.fetch=()=>Promise.reject(new Error('offline: all requests disabled'));
let runner;
(async()=>{
 try{
  w.eval(code);w.eval(runnerCode);runner=w.TEST_RUNNER(w);
  const socket=new WS('wss://a1.ofalive99.net/game/ws');socket.send('{}');
  const receive=(value,err=0,direction='receive')=>{
   const packet={action:{name:'/api/v1/member/me/balance'},err,msg:{user:{points:value,token:'NEVER-EXPORTED',name:'PRIVATE-MEMBER'}}};
   if(direction==='receive')socket.dispatchEvent(new w.MessageEvent('message',{data:JSON.stringify(packet)}));else socket.send(JSON.stringify(packet));
  };
  assert.equal(runner.view().balance,null,'no official balance means unknown, not zero');
  receive('1234.50');assert.equal(w.__MT_AUTOBAC_DIAG__.report().betObservation.memberBalance,1234.5);assert.equal(runner.view().balance,1234.5,'nested observer value reaches runner');
  receive(0);assert.equal(runner.view().balance,0,'an explicit official zero remains zero');
  for(const invalid of [null,'',true,'not-a-number',-20]){receive(invalid);assert.equal(runner.view().balance,null,'invalid value is not a synthesized zero');}
  receive(456);receive(999,403);assert.equal(runner.view().balance,456,'a rejected response cannot replace the wallet');
  receive(888,0,'send');assert.equal(runner.view().balance,456,'outbound packets are not balances');
  const report=JSON.stringify(w.__MT_AUTOBAC_DIAG__.report());assert(!report.includes('NEVER-EXPORTED'));assert(!report.includes('PRIVATE-MEMBER'));
  const now=w.Date.now;w.Date.now=()=>now()+121000;assert.equal(runner.view().balance,null,'stale official wallet returns pending synchronization');w.Date.now=now;
  const pause=(ms)=>new Promise(resolve=>w.setTimeout(resolve,ms));
  await pause(25);
  const shadow=[...w.document.querySelectorAll('div')].map(element=>element.shadowRoot).find(root=>root?.getElementById('official-today'));
  assert(shadow,'actual MT panel must mount');
  receive(2468.5);await pause(0);assert.equal(shadow.getElementById('balance').textContent,'2,468.5','native balance redraws the actual stopped panel');
  assert.equal(w.__MT_NATIVE_CLICK__.view().running,false,'official sync does not start wagering');
  const officialReply=(v)=>socket.dispatchEvent(new w.MessageEvent('message',{data:JSON.stringify({action:{name:'/api/v1/gametype/*/game/*/bet/history',err:0},msg:{total:{all:{v}}}})}));
  officialReply(3990);await pause(0);
  assert.equal(shadow.getElementById('official-today').textContent,'3,990','official response must redraw a stopped panel without UI interaction');
  await pause(350);officialReply(6535);await pause(0);
  assert.equal(shadow.getElementById('official-week').textContent,'6,535','next official period must redraw automatically');
  assert.equal(w.__MT_NATIVE_CLICK__.view().running,false);
  console.log('PASS MT stopped-panel official response → subscribed redraw: today 3,990 / near-seven-day 6,535; no clicks, no start, no runner mutation, no real requests.');
  console.log('PASS MT official wallet: native receive → safe observation → nested report → runner; msg.user.points, zero/unknown/rejected/outbound/stale, no member credentials retained. Offline only.');
 }finally{runner?.dispose();w.__MT_NATIVE_CLICK__?.dispose();w.__MT_AUTOBAC_DIAG__?.dispose();w.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
