const TABLES='/api/v1/gametype/*/game/*/room/*/tables';
const result=(v:any)=>v===1||v==='1'?'閒':v===2||v==='2'?'莊':v===3||v==='3'?'和':null;
export function createMtRoadFeed(W:any,diagnosticReport:()=>any,canRefresh:()=>boolean=()=>true,seed:any[]=[]) {
  const snapshots=new Map<string,any>(seed.map(s=>[s.tableId,s.snapshot]));
  const live=new Map<string,any>(seed.map(s=>[s.tableId,{tableId:s.tableId,name:s.name,roomId:s.roomId,clock:s.clock,lastTableResult:s.lastTableResult}]));
  let disposed=false,socket:any=null,lastRequest=0,note='等待原生連線；下注訊息不由本模組發送';
  const listeners=new Map<any,(event:any)=>void>();
  const previousSend=W.WebSocket.prototype.send;
  function adoptSnapshot(tableId:string,s:any){
    const old=snapshots.get(tableId);
    if(!s?.shoe||s.roadVerifiedAgainstTotals!==true||s.rawRoad==null||!Array.isArray(s.results)||s.results.length!==s.round-1||!Number.isFinite(Date.parse(s.at)))return;
    if(!old||!Number.isFinite(Date.parse(old.at))||Date.parse(s.at)>=Date.parse(old.at))snapshots.set(tableId,{...s});
  }
  function consume(packet:any,at:string){
    const action=typeof packet?.action==='string'?packet.action:packet?.action?.name;
    const body=packet?.body;
    if(body?.table_id&&typeof action==='string'){
      const id=String(body.table_id),old=live.get(id)||{tableId:id};
      if(/\/(wait|ready|end)$/.test(action)){
        const phase=action.split('/').pop();
        live.set(id,{...old,roomId:String(body.room_id??old.roomId??''),clock:{at,phase,shoe:String(body.shoe??''),round:Number(body.round),gameSn:body.game_sn??null,count:phase==='wait'&&body.count!=null&&Number.isFinite(Number(body.count))?Number(body.count):null}});
      }else if(action.endsWith('/show_win')){
        live.set(id,{...old,lastTableResult:{at,shoe:String(body.shoe??''),round:Number(body.round),winner:body.winner,result:result(body.winner)},clock:old.clock?{...old.clock,at,phase:'show_win',count:null}:undefined});
      }
    }
    if(![TABLES,TABLES.replace(/tables$/,'tablesvg')].includes(action))return;
    const collection=packet?.msg?.tables;
    const tables=Array.isArray(collection)?collection:Array.isArray(collection?.tables)?collection.tables:[];
    for(const t of tables){
      if(!t?.table_id)continue;
      const tableId=String(t.table_id),metadata=live.get(tableId)||{tableId};
      live.set(tableId,{...metadata,name:t.table_name??metadata.name,roomId:String(t.room_id??metadata.roomId??'')});
      const trend=t.trend||{},raw=trend.bead_plate2??trend.bead_plate;
      if(raw===undefined||raw===null)continue;
      let results:any[]=[];
      if(typeof raw==='string'){
        const digits=raw.replace(/[^0-9]/g,'');if(digits.length%2)continue;
        for(let i=1;i<digits.length;i+=2){const r=result(digits[i]);if(r)results.push(r);}
      }else if(Array.isArray(raw))results=raw.map(x=>result(x?.winner??x?.result??x)).filter(Boolean);
      else continue;
      const round=Number(trend.current_round??t.round),shoe=String(trend.current_shoe??t.shoe??'');
      if(!shoe||!Number.isSafeInteger(round)||round<1||results.length!==round-1||Number(trend.total_round)!==results.length)continue;
      const id=String(t.table_id),old=snapshots.get(id);
      if(old&&Date.parse(old.at)>Date.parse(at))continue;
      snapshots.set(id,{at,shoe,round,rawRoad:raw,results,gameSn:t.game_sn??t.game_id??null,roadVerifiedAgainstTotals:true});
      note=`已保留${snapshots.size}桌完整原生bead牌路`;
    }
  }
  // Seed from original captured packets, not from a snapshot whose metadata was
  // advanced by a tablesvg packet while its road was copied from an older shoe.
  const initial=diagnosticReport();
  for(const t of initial?.liveTables||[])live.set(t.tableId,{...t});
  for(const e of initial?.network||[])if(e.direction==='receive')consume(e.data,e.at);
  for(const t of initial?.liveTables||[])adoptSnapshot(t.tableId,t.snapshot);
  function refresh(force=false){
    if(disposed||!socket||socket.readyState!==1||!canRefresh())return false;
    if(!force&&Date.now()-lastRequest<20000)return false;
    lastRequest=Date.now();
    // This exact read-only GET and numeric scope were observed in the supplied
    // MT logs. No account token, password, bet, slips or confirmation is replayed.
    socket.send(JSON.stringify({method:'GET',action:{name:TABLES,data:{gametype_id:3,game_id:1,room_id:1}}}));
    note='已用原生GET讀取完整牌路（不是下注）';return true;
  }
  function attach(s:any){
    try{const u=new URL(s.url);if(!/(^|\.)ofalive99\.net$/i.test(u.hostname)||u.pathname!=='/game/ws')return;}catch{return;}
    socket=s;if(listeners.has(s))return;
    const handler=async(event:any)=>{
      if(disposed)return;
      try{const data=typeof event.data==='string'?event.data:event.data instanceof W.Blob?await event.data.text():null;if(data&&data.length<5000000)consume(JSON.parse(data),new Date().toISOString());}catch{}
    };
    listeners.set(s,handler);s.addEventListener('message',handler);
    W.queueMicrotask(()=>refresh());
  }
  function send(this:any,data:any){const out=Reflect.apply(previousSend,this,[data]);try{attach(this);}catch{}return out;}
  W.WebSocket.prototype.send=send;
  const timer=W.setInterval(()=>refresh(),2000);
  function merge(report:any){
    if(!report)return report;
    const ids=new Set([...(report.liveTables||[]).map((t:any)=>t.tableId),...live.keys()]);
    const newest=(a:any,b:any)=>!b?a:!a?b:Date.parse(b.at)>Date.parse(a.at)?b:a;
    return {...report,liveTables:[...ids].map(id=>{
      const original=(report.liveTables||[]).find((t:any)=>t.tableId===id)||{tableId:id},own=live.get(id)||{};
      adoptSnapshot(id,original.snapshot);
      return {...own,...original,name:original.name??own.name,roomId:original.roomId??own.roomId,snapshot:snapshots.get(id)||original.snapshot,clock:newest(original.clock,own.clock),lastTableResult:newest(original.lastTableResult,own.lastTableResult)};
    })};
  }
  function dispose(){disposed=true;W.clearInterval(timer);for(const [s,h]of listeners)s.removeEventListener('message',h);listeners.clear();if(W.WebSocket.prototype.send===send)W.WebSocket.prototype.send=previousSend;}
  return {merge,refresh,dispose,status:()=>`${note}；即時靴局/倒數 ${[...live.values()].filter(t=>t.clock?.phase==='wait'&&Date.now()-Date.parse(t.clock.at)<3500).length} 桌`,export:()=>[...snapshots].map(([tableId,snapshot])=>({...live.get(tableId),tableId,snapshot:{...snapshot}}))};
}
