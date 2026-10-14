const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('/tmp/dg-testdeps/node_modules/jsdom'));}
const source=fs.readFileSync(process.env.MT_DIAG_SCRIPT||'/home/ubuntu/AutoBac-MT-Console-完整診斷-v0.3.js','utf8');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'../tests/fixtures/mt-multitable-snapshot.json'),'utf8'));
const dom=new JSDOM('<html><body><div class="gameDesk"><div class="gameDesk_tag">百家樂B01</div><div class="gameDesk_road"><svg></svg></div><button class="btn-check">確認</button></div><div class="gameDesk"><div class="gameDesk_tag">百家樂B06</div><button disabled>確認</button></div></body></html>',{url:'https://gsa.ofalive99.net/?token=URL-PRIVATE',runScripts:'outside-only'});
const w=dom.window;w.console={log(){},warn(){}};
w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:90,height:30,right:90,bottom:30});
const sent=[];
class WS extends w.EventTarget{constructor(url){super();this.url=url;this.readyState=1;}send(data){sent.push(data);return 77;}}
w.WebSocket=WS;const nativeSend=WS.prototype.send;
w.fetch=()=>Promise.resolve({clone(){return {json:()=>Promise.resolve({})}}});
let betClicks=0;w.document.querySelector('button').onclick=()=>betClicks++;
try{
 w.eval(source);
 const socket=new WS('wss://a1.ofalive99.net/game/ws');
 const transmit=JSON.stringify({method:'POST',action:{name:'/offline-test/bet/submit'},body:{amount:100,token:'BODY-PRIVATE'}});
 assert.equal(socket.send(transmit),77);assert.deepEqual(sent,[transmit]);
 const receive=data=>socket.dispatchEvent(new w.MessageEvent('message',{data:JSON.stringify(data)}));
 receive(fixture);
 // Synthetic personal-ack packet tests retention only; no real MT success schema is asserted.
 receive({action:{name:'/offline-test/bet/ack'},err:0,msg:{reference:'SYNTHETIC-ONLY'}});
 receive({action:'/api/v1/member/me/table/betinfo',err:0,msg:{total:{total:0}}});
 for(let i=0;i<900;i++)receive({action:{name:'/api/v1/gametype/*/game/*/room/*/table/*/wait'},body:{table_id:'BAV01',room_id:48,shoe:1153,round:37,count:19-i%19,game_sn:'OFFLINE-GAME'}});
 const report=w.__MT_AUTOBAC_DIAG__.report();
 assert.equal(report.network.length,300);
 assert.equal(report.captureStats.total,904);
 assert.equal(report.captureStats.ordinaryDropped,604);
 assert.equal(report.importantNetwork.length,3);
 assert.equal(report.captureStats.importantDropped,0);
 assert.equal(report.liveTables.length,11);
 for(const t of fixture.msg.tables){
  const actual=report.liveTables.find(x=>x.tableId===t.table_id);assert(actual);
  const results=actual.snapshot.results;
  assert.equal(results.length,Number(t.trend.total_round));
  for(const [result,key] of [['莊','total_round_banker'],['閒','total_round_player'],['和','total_round_tie']])assert.equal(results.filter(x=>x===result).length,Number(t.trend[key]));
 }
 const b01=report.scopedCards.find(c=>c.name==='B01');assert.equal(b01.exactTableId,'BAV01');assert.equal(b01.controls[0].disabled,false);assert(b01.structure);
 const b06=report.scopedCards.find(c=>c.name==='B06');assert.equal(b06.exactTableId,null);assert.deepEqual([...b06.candidateTableIds].sort(),['BAV06','BAV06_LIVE']);assert.equal(b06.controls[0].disabled,true);
 assert.equal(betClicks,0);assert(!JSON.stringify(report).includes('BODY-PRIVATE'));assert(!JSON.stringify(report).includes('URL-PRIVATE'));
 w.__MT_AUTOBAC_DIAG__.dispose();assert.equal(WS.prototype.send,nativeSend);
 assert.equal(w.document.querySelectorAll('#__autobac_mt_diag__').length,0);
 console.log('PASS MT v0.3：11桌真實牌路逐桌對官方統計；900則倒數後注單關鍵仍保留；B06與LIVE不混同；原封傳遞一次，沒有下注確認，憑證遮罩/清理。');
}catch(e){console.error(e);process.exitCode=1;}
finally{w.__MT_AUTOBAC_DIAG__?.dispose();w.close();}
