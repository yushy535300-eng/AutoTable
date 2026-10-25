import { completePoker, dgPokerHand, mtPokerHand } from './poker-hand';
import type { PokerHand, PokerDecision } from './poker-hand';
import { parityPokerDecision } from './parity-strategy';
import { fourFormulaPokerDecision } from './four-formula-strategy';
export * from './poker-hand';
export type PokerStrategy = 'counting' | 'parity';
/** Strict routing: never substitute one card strategy for another. */
export function pokerDecision(strategy: PokerStrategy, hand: PokerHand | null): PokerDecision {
  if(strategy==='parity')return parityPokerDecision(hand);
  if(strategy==='counting')return fourFormulaPokerDecision(hand);
  return {ok:false,reason:'未選擇有效牌張策略，不以其他策略代替'};
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
