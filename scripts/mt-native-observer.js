function createMtNativeObserver() {
  const records = [], groups = new Map(), unmatched = [];
  let serial = 0;
  const actionOf = packet => typeof packet?.action === 'string' ? packet.action : packet?.action?.name || '';
  const codeOf = packet => typeof packet?.action === 'object' ? packet.action.err ?? packet.err : packet?.err;
  const groupKey = r => r.tableId && r.shoe != null && r.round != null ? `${r.tableId}|${r.shoe}|${r.round}` : null;
  function addGroup(record) {
    const key=groupKey(record); if (!key) return;
    if (!groups.has(key)) groups.set(key,{tableId:record.tableId,shoe:record.shoe,round:record.round,recordIds:[],settlement:null});
    const group=groups.get(key);if(!group.recordIds.includes(record.id))group.recordIds.push(record.id);
  }
  function consume(entry, lookup) {
    const packet=entry.data,name=actionOf(packet);
    if(entry.direction==='send'&&name.endsWith('/bet')&&packet.method==='POST') {
      const body=packet.body||{},tableId=String(packet.action?.data?.table_id||''),slips=body.order?.slips;
      if(!tableId||!body.game_sn||!Array.isArray(slips)||!slips.length)return;
      const amount=slips.reduce((sum,s)=>sum+Number(s.amount),0);
      if(!Number.isFinite(amount)||amount<=0)return;
      const live=lookup(tableId);
      const identity=live?.clock?.gameSn===body.game_sn?live.clock:live?.snapshot?.gameSn===body.game_sn?live.snapshot:null;
      const row={id:++serial,at:entry.at,tableId,gameSn:String(body.game_sn),requestRoomContext:packet.action?.data?.room_id,shoe:identity?.shoe||null,round:Number.isFinite(identity?.round)?identity.round:null,amount,slips:slips.map(s=>({playId:String(s.play_id),amount:Number(s.amount)})),state:'sent',source:'observed-native-client'};
      records.push(row);addGroup(row);return;
    }
    if(entry.direction==='receive'&&name.endsWith('/bet')) {
      const tableId=String(packet.msg?.table||'');
      if(!tableId)return;
      const candidates=records.filter(r=>r.tableId===tableId&&r.state==='sent'&&Date.parse(entry.at)>=Date.parse(r.at)&&Date.parse(entry.at)-Date.parse(r.at)<15000);
      // The actual MT acknowledgement has only msg.table, not game_sn/order id.
      // Never guess an amount when multiple sends for that table are unresolved.
      if(candidates.length!==1){if(candidates.length>1)for(const r of candidates)r.reviewReason='同桌有多筆未回覆，ACK未提供game_sn，無法唯一歸屬';return;}
      const row=candidates[0],code=codeOf(packet);
      if(code===0){row.state='accepted';row.acceptedAt=entry.at;}
      else if(typeof code==='number'){row.state='rejected';row.error=code;row.repliedAt=entry.at;}
      else row.reviewReason='回覆缺少明確err成功碼';
      return;
    }
    if(entry.direction==='receive'&&name==='/api/v1/member/me/win'&&codeOf(packet)===0) {
      const span=packet.msg?.span,points=span?.points;
      if(!span?.table_id||span.shoe==null||span.round==null||typeof points!=='number'||!Number.isFinite(points))return;
      const key=`${span.table_id}|${span.shoe}|${Number(span.round)}`,group=groups.get(key);
      if(!group||!records.some(r=>group.recordIds.includes(r.id)&&r.state==='accepted')){
        if(!unmatched.some(x=>x.key===key&&x.points===points))unmatched.push({key,points,at:entry.at,reason:'未找到本次觀察到的同桌同靴同局已接受下注'});
        return;
      }
      group.settlement={points,at:entry.at,source:'/api/v1/member/me/win',scope:'個人本桌本局合計，不是每筆加注各自的損益'};
    }
  }
  function report() {
    const rows=records.map(r=>({...r,slips:r.slips.map(s=>({...s}))}));
    const grouped=[...groups.values()].map(g=>{
      const rs=records.filter(r=>g.recordIds.includes(r.id));
      return {...g,recordIds:[...g.recordIds],acceptedAmount:rs.filter(r=>r.state==='accepted').reduce((s,r)=>s+r.amount,0),unresolved:rs.filter(r=>r.state==='sent').length,settlement:g.settlement?{...g.settlement}:null};
    });
    return {records:rows,groups:grouped,unmatchedSettlements:[...unmatched],acceptedCount:records.filter(r=>r.state==='accepted').length,settledGroupCount:grouped.filter(g=>g.settlement).length,observedGroupPoints:grouped.reduce((s,g)=>s+(g.settlement?.points||0),0),limits:'只核對已觀察到的原生操作；同桌多筆並行未回覆不猜ACK歸屬；個人win按桌/靴/局合計且去重，不使用全桌betinfo或show_win推算個人損益。'};
  }
  return {consume,report};
}
if (typeof module !== 'undefined') module.exports = {createMtNativeObserver};
