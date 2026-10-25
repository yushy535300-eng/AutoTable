export type PokerStrategy = 'counting' | 'parity';
export type PokerHand = { player: string[]; banker: string[] };
export type PokerDecision = { ok: true; side: '莊'|'閒'; confidence: number; reason: string } | { ok: false; reason: string };
const rankNames = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export function cardRank(value: unknown): string | null {
  if (typeof value === 'string' && rankNames.includes(value.toUpperCase().trim())) return value.toUpperCase().trim();
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 52 ? rankNames[(n-1)%13] : null;
}
export function baccaratValue(card: string): number { const n = rankNames.indexOf(card)+1; return n>0&&n<10?n:0; }
export function handPoint(cards: string[]): number { return cards.reduce((sum,c)=>sum+baccaratValue(c),0)%10; }
/** Standard baccarat draw rules also reject impossible extra third cards. */
export function completePoker(hand: PokerHand): boolean {
  const {player:p,banker:b}=hand;
  if(p.length<2||p.length>3||b.length<2||b.length>3||![...p,...b].every(c=>rankNames.includes(c)))return false;
  const pp=handPoint(p.slice(0,2)),bp=handPoint(b.slice(0,2));
  if(pp>=8||bp>=8)return p.length===2&&b.length===2;
  const pd=pp<=5;
  if(p.length!==(pd?3:2))return false;
  const third=pd?baccaratValue(p[2]):-1;
  const bd=!pd?bp<=5:bp<=2||(bp===3&&third!==8)||(bp===4&&third>=2&&third<=7)||(bp===5&&third>=4&&third<=7)||(bp===6&&(third===6||third===7));
  return b.length===(bd?3:2);
}
export function dgPokerHand(raw: unknown): PokerHand | null {
  let data:any=raw;try{if(typeof raw==='string')data=JSON.parse(raw);}catch{return null;}
  if(!data||typeof data.player!=='string'||typeof data.banker!=='string')return null;
  const parse=(s:string)=>{if(s.length>80)return null;const values=s.split('-').map(v=>v.trim());if(values.length>3||values.some(v=>!v))return null;
    // The real DG result has exactly three slots. Only unused THIRD slot 0
    // may be removed; zero in either initial slot is still unrevealed.
    if(values.length===3&&values[2]==='0')values.pop();
    const ranks=values.map(cardRank);return ranks.every((r):r is string=>r!==null)?ranks:null;};
  const player=parse(data.player),banker=parse(data.banker);
  if(!player||!banker)return null;
  const hand={player,banker};return completePoker(hand)?hand:null;
}
/** MT native result slots are P1,B1,P2,B2,P3,B3; zeros are unrevealed/unused. */
export function mtPokerHand(raw: unknown): PokerHand | null {
  if(!Array.isArray(raw)||raw.length<4||raw.length>10)return null;
  const values=raw.map(v=>typeof v==='number'?v:NaN);
  if(values.slice(0,6).some(v=>!Number.isInteger(v)||v<0||v>52))return null;
  const read=(indexes:number[])=>indexes.map(i=>values[i]??0).filter(v=>v!==0).map(cardRank);
  const p=read([0,2,4]),b=read([1,3,5]);
  if(!p.every((v):v is string=>v!==null)||!b.every((v):v is string=>v!==null))return null;
  const hand={player:p,banker:b};if(!completePoker(hand))return null;
  if(values.length>=10&&(values[8]!==handPoint(p)||values[9]!==handPoint(b)))return null;
  return hand;
}
export function pokerDecision(strategy: PokerStrategy, hand: PokerHand | null): PokerDecision {
  if(!hand||!completePoker(hand))return {ok:false,reason:'等待同桌同靴上一局完整實際牌張；不以牌路或點數代替'};
  const all=[...hand.player,...hand.banker];
  if(strategy==='parity'){
    const values=all.map(c=>rankNames.indexOf(c)+1),total=values.reduce((a,b)=>a+b,0);
    const first=Math.floor(total/10)+total%10,terminal=first>=10?first%10:first;
    const side=terminal%2===0?'莊':'閒';
    return {ok:true,side,confidence:0,reason:`終值奇偶：閒 ${handPoint(hand.player)}／莊 ${handPoint(hand.banker)} 點；${all.join('、')}；牌面總和 ${total} → ${first} → ${terminal}；${terminal%2===0?'偶莊':'奇閒'}（原公式，非勝率）`};
  }
  const sum=all.reduce((n,c)=>n+baccaratValue(c),0),pb=handPoint(hand.banker),pp=handPoint(hand.player);
  const votes=[sum%3===0?'莊':'閒',sum%2===0?'莊':'閒',(pb*pp)%2===0?'莊':'閒',(pb+pp)%2===0?'莊':'閒'];
  const bankers=votes.filter(v=>v==='莊').length;
  const reason=`V38四式：閒 ${pp}／莊 ${pb} 點；牌值總和 ${sum}；A ${votes[0]}／B ${votes[1]}／乘 ${votes[2]}／加 ${votes[3]}；莊 ${bankers}：閒 ${4-bankers}（原公式，非剩牌機率）`;
  if(bankers===2)return {ok:false,reason:reason+'；同票觀望，不下注'};
  return {ok:true,side:bankers>2?'莊':'閒',confidence:Math.max(bankers,4-bankers)*25,reason};
}
export function mtPreviousPoker(table: any, shoe: string, nextRound: number): PokerHand | null {
  const p=table?.lastPoker;
  if(!p||p.tableId!==table.tableId||p.shoe!==shoe||p.round!==nextRound-1||p.conflict)return null;
  return mtPokerHand(p.slots);
}
export const DG_CARD_MEMORY_COMPACT_MS=20*60_000;
export function createDgPokerTracker(now:()=>number=()=>Date.now()){
  type Snapshot={shoe:string;round:number;hand:PokerHand;fingerprint:string;conflict:boolean};
  type Identity={shoe:string;round:number};
  const snapshots=new Map<string,Snapshot>(),nativeCurrent=new Map<string,Identity>();
  const history=new Map<string,Snapshot[]>(),retiredShoes=new Map<string,Set<string>>();
  let compactedAt=now();
  const nativeNumber=(value:any,min=0)=>{if(value==null||value===''||typeof value==='boolean')return null;const n=Number(value);return Number.isSafeInteger(n)&&n>=min?n:null;};
  function compactIfDue(){
    const time=now();if(time-compactedAt<DG_CARD_MEMORY_COMPACT_MS)return false;
    // Hanging automation must retain EACH latest completed hand, including a
    // conflict flag. Compact history only: never reset betting state or levels.
    history.clear();for(const [id,last] of snapshots)history.set(id,[last]);
    compactedAt=time;return true;
  }
  function resetFeed(){snapshots.clear();nativeCurrent.clear();history.clear();retiredShoes.clear();compactedAt=now();}
  function record(id:string,shoe:string,round:number,hand:PokerHand){
    const previous=snapshots.get(id),fingerprint=JSON.stringify(hand);
    if(previous&&previous.shoe===shoe&&round<previous.round)return;
    if(previous&&previous.shoe===shoe&&previous.round===round){if(previous.fingerprint!==fingerprint)previous.conflict=true;return;}
    const next={shoe,round,hand,fingerprint,conflict:false};snapshots.set(id,next);
    const list=history.get(id)??[];list.push(next);if(list.length>128)list.shift();history.set(id,list);
  }
  function observe(cards:any[]){
    compactIfDue();
    for(const card of cards){
      const id=String(card.tableId||''),g=card.gameInfo||{},shoe=g.shoeId==null?'':String(g.shoeId),round=nativeNumber(g.playId,1),state=Number(g.stateId);
      if(!id||!shoe||round===null)continue;
      const native=nativeCurrent.get(id);if(native&&native.shoe!==shoe)continue;
      const old=snapshots.get(id);if(old&&old.shoe!==shoe){snapshots.delete(id);history.delete(id);}
      if(!Number.isFinite(state)||state===1)continue;
      const hand=dgPokerHand(g.poker);if(hand)record(id,shoe,round,hand);
    }
  }
  function observePacket(packet:any,cards:any[]=[]){
    compactIfDue();if(!Array.isArray(packet?.table)||Number(packet.codeId??0)!==0)return;
    const rows=packet.table.slice(0,768);
    // Track explicit native metadata for all rooms, even before their scene
    // cards exist. A missing shoe may only bind to the SAME native round.
    for(const raw of rows){
      const table=nativeNumber(raw?.tableId,1),round=nativeNumber(raw?.playId,1),shoe=nativeNumber(raw?.shoeId);
      if(table===null||round===null||shoe===null)continue;
      const id=String(table),shoeKey=String(shoe),old=nativeCurrent.get(id);
      const scene=cards.find(c=>String(c?.tableId)===id);
      if(scene){const g=scene.gameInfo??{},current=nativeNumber(g.playId,1);
        if(g.shoeId!=null&&String(g.shoeId)!==shoeKey)continue;
        if(current!==null&&round!==current&&round!==current-1)continue;
      }
      if(old&&old.shoe!==shoeKey){
        const retired=retiredShoes.get(id)??new Set<string>();if(retired.has(shoeKey))continue;
        retired.add(old.shoe);retiredShoes.set(id,retired);snapshots.delete(id);history.delete(id);
      }else if(old&&round<old.round){
        // Some electronic tables report shoe 0. An explicit new betting
        // round 1 is a new epoch, never a reason to reuse the old last hand.
        if(shoeKey==='0'&&round===1&&Number(raw.state)===1){snapshots.delete(id);history.delete(id);}else continue;
      }
      if(nativeCurrent.size>=256&&!nativeCurrent.has(id))continue;
      nativeCurrent.set(id,{shoe:shoeKey,round});
    }
    for(const raw of rows){
      const table=nativeNumber(raw?.tableId,1),round=nativeNumber(raw?.playId,1);if(table===null||round===null||raw?.poker==null)continue;
      const id=String(table),meta=nativeCurrent.get(id),explicit=nativeNumber(raw.shoeId);
      const shoe=explicit!==null?String(explicit):meta?.round===round?meta.shoe:null;
      if(shoe===null||!meta||meta.shoe!==shoe||meta.round<round)continue;
      const card=cards.find(c=>String(c?.tableId)===id);
      if(card){
        const g=card.gameInfo??{},current=nativeNumber(g.playId,1),state=Number(g.stateId);
        if(g.shoeId!=null&&String(g.shoeId)!==shoe)continue;
        if(current===null||!(round===current-1||(round===current&&Number.isFinite(state)&&state!==1)))continue;
      }else if(Number(raw.state)===1)continue;
      const hand=dgPokerHand(raw.poker);if(hand)record(id,shoe,round,hand);
    }
  }
  function identity(card:any):Identity|null{
    const g=card?.gameInfo??{},id=String(card?.tableId??''),round=nativeNumber(g.playId,1);if(round===null)return null;
    if(g.shoeId!=null)return {shoe:String(g.shoeId),round};
    const meta=nativeCurrent.get(id);return meta&&meta.round===round?{shoe:meta.shoe,round}:null;
  }
  function decision(card:any,strategy:PokerStrategy):PokerDecision{
    compactIfDue();const old=snapshots.get(String(card?.tableId||'')),current=identity(card);
    if(!old)return {ok:false,reason:'等待此桌上一局完整牌張／開牌推送；尚未取得可核對資料'};
    if(old.conflict)return {ok:false,reason:'此桌同靴同局牌張資料衝突，暫不下注'};
    if(!current)return {ok:false,reason:'等待此桌當前靴號／局號的原生綁定，不借用其他桌或舊局資料'};
    if(old.shoe!==current.shoe)return {ok:false,reason:'此桌已換靴，等待新靴上一局完整牌張'};
    if(old.round!==current.round-1)return {ok:false,reason:'此桌牌張局號不是當前上一局，等待相符開牌資料'};
    return pokerDecision(strategy,old.hand);
  }
  function memoryView(){return {tableCount:snapshots.size,historyCount:[...history.values()].reduce((n,list)=>n+list.length,0),compactEveryMs:DG_CARD_MEMORY_COMPACT_MS,compactedAt,retainsLastHand:true};}
  return {observe,observePacket,decision,identity,compactIfDue,resetFeed,memoryView};
}
