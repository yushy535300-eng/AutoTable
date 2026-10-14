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
  const parse=(s:string)=>{const values=s.split('-');if(values.length>3||values.some(v=>!v.trim()))return null;const ranks=values.map(cardRank);return ranks.every((r):r is string=>r!==null)?ranks:null;};
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
    return {ok:true,side,confidence:0,reason:`終值奇偶：${all.join('、')}；牌面總和 ${total} → ${first} → ${terminal}；${terminal%2===0?'偶莊':'奇閒'}（原公式，非勝率）`};
  }
  const sum=all.reduce((n,c)=>n+baccaratValue(c),0),pb=handPoint(hand.banker),pp=handPoint(hand.player);
  const votes=[sum%3===0?'莊':'閒',sum%2===0?'莊':'閒',(pb*pp)%2===0?'莊':'閒',(pb+pp)%2===0?'莊':'閒'];
  const bankers=votes.filter(v=>v==='莊').length;
  const reason=`V38四式：A ${votes[0]}／B ${votes[1]}／乘 ${votes[2]}／加 ${votes[3]}；莊 ${bankers}：閒 ${4-bankers}（原公式，非剩牌機率）`;
  if(bankers===2)return {ok:false,reason:reason+'；同票觀望，不下注'};
  return {ok:true,side:bankers>2?'莊':'閒',confidence:Math.max(bankers,4-bankers)*25,reason};
}
export function mtPreviousPoker(table: any, shoe: string, nextRound: number): PokerHand | null {
  const p=table?.lastPoker;
  if(!p||p.tableId!==table.tableId||p.shoe!==shoe||p.round!==nextRound-1||p.conflict)return null;
  return mtPokerHand(p.slots);
}
export function createDgPokerTracker(){
  const snapshots=new Map<string,{shoe:string;round:number;hand:PokerHand;fingerprint:string;conflict:boolean}>();
  function observe(cards:any[]){
    for(const card of cards){
      const id=String(card.tableId||''),g=card.gameInfo||{},shoe=g.shoeId==null?'':String(g.shoeId),round=Number(g.playId);
      if(!id||!shoe||!Number.isSafeInteger(round)||round<1)continue;
      const old=snapshots.get(id);
      if(old&&(old.shoe!==shoe||round<old.round))snapshots.delete(id);
      // Never relabel a retained previous poker blob as this betting round.
      if(Number(g.stateId)===1)continue;
      const hand=dgPokerHand(g.poker);if(!hand)continue;
      const fingerprint=JSON.stringify(hand),previous=snapshots.get(id);
      if(previous&&previous.shoe===shoe&&previous.round===round){
        if(previous.fingerprint!==fingerprint)previous.conflict=true;
        continue;
      }
      snapshots.set(id,{shoe,round,hand,fingerprint,conflict:false});
    }
  }
  function decision(card:any,strategy:PokerStrategy):PokerDecision{
    const g=card?.gameInfo||{},old=snapshots.get(String(card?.tableId||''));
    if(!old||old.conflict||old.shoe!==String(g.shoeId??'')||old.round!==Number(g.playId)-1)return pokerDecision(strategy,null);
    return pokerDecision(strategy,old.hand);
  }
  return {observe,decision};
}
