import {describe,it,expect} from 'vitest';
import {createMtRoadFeed} from '../lib/mt-road-feed';
import {createMtRecommendationAdapter} from '../lib/mt-recommendation-adapter';
function fixture(){
  const emitted:any[]=[],timers:(()=>void)[]=[],tasks:(()=>void)[]=[];
  class Socket extends EventTarget{
    url='wss://a1.ofalive99.net/game/ws';readyState=1;
    send(data:string){emitted.push(JSON.parse(data));}
  }
  const W={WebSocket:Socket,setInterval:(f:()=>void)=>{timers.push(f);return 1;},clearInterval:()=>{},queueMicrotask:(f:()=>void)=>tasks.push(f),Blob};
  const at=new Date().toISOString();
  const packet={action:{name:'/api/v1/gametype/*/game/*/room/*/tables'},msg:{tables:[{table_id:'BAV03',game_sn:'SN-4',trend:{current_shoe:777,current_round:4,total_round:3,bead_plate2:'010201'}}]}};
  const report:any={network:[{direction:'receive',at,data:packet}],liveTables:[{name:'B03',tableId:'BAV03',clock:{at,phase:'wait',shoe:'777',round:4,count:15,gameSn:'SN-4'},snapshot:{shoe:'777',round:5,rawRoad:'010201',results:['閒','莊','閒'],roadSourceAt:at}}],tableViewport:{tables:[{name:'B03',tableId:'BAV03',candidateIds:['BAV03']}]}};
  return {W,Socket,emitted,tasks,timers,report,packet};
}
describe('MT完整原生牌路資料保留',()=>{
 it('重裝時較新的完整verified快照優先舊saved道路，merge後更新也可前進',()=>{
  const f=fixture(),now=Date.now();f.report.network=[];
  const old={at:new Date(now-60000).toISOString(),shoe:'100',round:4,rawRoad:'010201',results:['閒','莊','閒'],roadVerifiedAgainstTotals:true};
  f.report.liveTables[0].snapshot={...old,shoe:'101',at:new Date(now-1000).toISOString()};
  const feed=createMtRoadFeed(f.W,()=>f.report,()=>true,[{tableId:'BAV03',snapshot:old}]);
  expect(feed.merge(f.report).liveTables[0].snapshot.shoe).toBe('101');
  f.report.liveTables[0].snapshot={...old,shoe:'102',at:new Date(now).toISOString()};
  expect(feed.merge(f.report).liveTables[0].snapshot.shoe).toBe('102');feed.dispose();
 });
 it('從真實完整network快照恢復正確局號，不以後續SVG局號假冒牌路同步',()=>{
  const f=fixture(),feed=createMtRoadFeed(f.W,()=>f.report);
  const r=feed.merge(f.report);expect(r.liveTables[0].snapshot.round).toBe(4);expect(r.liveTables[0].snapshot.roadVerifiedAgainstTotals).toBe(true);
  expect(createMtRecommendationAdapter().preview(r,'B03','combined').ok).toBe(true);feed.dispose();
 });
 it('附加原生socket，只能讀取已核對的GET，不重播下注；移除後恢復原send',()=>{
  const f=fixture(),original=f.W.WebSocket.prototype.send,feed=createMtRoadFeed(f.W,()=>f.report);
  const socket=new f.Socket();socket.send(JSON.stringify({method:'POST',action:{name:'/api/v1/ping'}}));for(const task of f.tasks)task();
  const extra=f.emitted.filter(p=>p.action.name!=='/api/v1/ping');expect(extra).toEqual([{method:'GET',action:{name:'/api/v1/gametype/*/game/*/room/*/tables',data:{gametype_id:3,game_id:1,room_id:1}}}]);
  expect(extra.some(p=>p.action.name.endsWith('/bet'))).toBe(false);feed.dispose();expect(f.W.WebSocket.prototype.send).toBe(original);
 });
 it('新局只接受連續原生show_win，採用新clock的gameSn而不是舊快照的SN',()=>{
  const f=fixture(),feed=createMtRoadFeed(f.W,()=>f.report),adapter=createMtRecommendationAdapter();
  expect(adapter.preview(feed.merge(f.report),'B03','combined').ok).toBe(true);
  f.report.liveTables[0].clock={...f.report.liveTables[0].clock,round:5,gameSn:'SN-5'};
  f.report.liveTables[0].lastTableResult={at:new Date().toISOString(),shoe:'777',round:4,winner:1,result:'閒'};
  const next=adapter.preview(feed.merge(f.report),'B03','combined');
  expect(next.ok).toBe(true);if(next.ok){expect(next.gameSnById).toEqual({BAV03:'SN-5'});expect(next.results).toEqual(['閒','莊','閒','閒']);expect(next.canBet).toBe(true);}
  feed.dispose();
 });
 it('原診斷沒有clock時，獨立接收實際wait靴局倒數後即可恢復推薦',()=>{
  const f=fixture();f.report.liveTables[0].clock=null;
  const feed=createMtRoadFeed(f.W,()=>f.report),adapter=createMtRecommendationAdapter(),socket=new f.Socket();
  socket.send(JSON.stringify({action:{name:'/api/v1/ping'}}));
  expect(adapter.preview(feed.merge(f.report),'B03','combined').ok).toBe(false);
  const packet={action:{name:'/api/v1/gametype/*/game/*/room/*/table/*/wait'},body:{table_id:'BAV03',room_id:48,shoe:777,round:4,game_sn:'SN-4',count:15}};
  socket.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(packet)}));
  const r=feed.merge(f.report),p=adapter.preview(r,'B03','combined');
  expect(r.liveTables[0].clock.shoe).toBe('777');expect(p.ok).toBe(true);if(p.ok)expect(p.canBet).toBe(true);
  const stale=adapter.preview(r,'B03','combined',Date.now()+4000);expect(stale.ok).toBe(true);if(stale.ok)expect(stale.canBet).toBe(false);feed.dispose();
 });
 it('完整牌路GET成功不會自行生成可下注clock',()=>{
  const f=fixture();f.report.liveTables[0].clock=null;
  const feed=createMtRoadFeed(f.W,()=>f.report),socket=new f.Socket();socket.send(JSON.stringify({action:{name:'/api/v1/ping'}}));
  socket.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(f.packet)}));
  const p=createMtRecommendationAdapter().preview(feed.merge(f.report),'B03','combined');expect(p.ok).toBe(false);if(!p.ok)expect(p.reason).toMatch(/clock/);feed.dispose();
 });
 it('收到實際end後不再沿用先前wait倒數',()=>{
  const f=fixture(),feed=createMtRoadFeed(f.W,()=>f.report),socket=new f.Socket();socket.send(JSON.stringify({action:{name:'/api/v1/ping'}}));
  const at=Date.now();f.report.liveTables[0].clock.at=new Date(at-10).toISOString();
  socket.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({action:{name:'/api/v1/gametype/*/game/*/room/*/table/*/end'},body:{table_id:'BAV03',room_id:48,shoe:777,round:4,game_sn:'SN-4'}})}));
  const p=createMtRecommendationAdapter().preview(feed.merge(f.report),'B03','combined');expect(p.ok).toBe(true);if(p.ok){expect(p.canBet).toBe(false);expect(p.count).toBe(null);}feed.dispose();
 });
});
