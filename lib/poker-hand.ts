export type PokerHand = { player: string[]; banker: string[] };
export type PokerDecision = { ok: true; side: '莊'|'閒'; confidence: number; reason: string } | { ok: false; reason: string };
export const rankNames = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
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
