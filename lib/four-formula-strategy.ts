import { baccaratValue, completePoker, handPoint } from './poker-hand';
import type { PokerDecision, PokerHand } from './poker-hand';

type FourVoteDecision =
  | {ok:true;side:'莊'|'閒';bankers:number;players:number}
  | {ok:false;reason:string;bankers?:number;players?:number};

/** Exactly four verified votes; unknown/missing votes are not player votes. */
export function resolveFourFormulaVotes(votes: readonly unknown[]): FourVoteDecision {
  if(!Array.isArray(votes)||votes.length!==4||!votes.every(v=>v==='莊'||v==='閒'))
    return {ok:false,reason:'四式結果未完整核對，不下注'};
  const bankers=votes.filter(v=>v==='莊').length,players=votes.filter(v=>v==='閒').length;
  if(bankers===players)return {ok:false,reason:'同票觀望，不下注',bankers,players};
  return {ok:true,side:bankers>players?'莊':'閒',bankers,players};
}

/** Original V38 formulas only. No parity-strategy import or fallback. */
export function fourFormulaPokerDecision(hand: PokerHand | null): PokerDecision {
  if(!hand||!completePoker(hand))return {ok:false,reason:'等待同桌同靴上一局完整實際牌張；不以牌路或點數代替'};
  const all=[...hand.player,...hand.banker];
  const sum=all.reduce((n,c)=>n+baccaratValue(c),0),pb=handPoint(hand.banker),pp=handPoint(hand.player);
  const votes=[sum%3===0?'莊':'閒',sum%2===0?'莊':'閒',(pb*pp)%2===0?'莊':'閒',(pb+pp)%2===0?'莊':'閒'];
  const result=resolveFourFormulaVotes(votes);
  const reason=`V38四式：閒 ${pp}／莊 ${pb} 點；牌值總和 ${sum}；A ${votes[0]}／B ${votes[1]}／乘 ${votes[2]}／加 ${votes[3]}；莊 ${result.bankers}：閒 ${result.players}（原公式，非剩牌機率）`;
  if(!result.ok)return {ok:false,reason:reason+'；'+result.reason};
  return {ok:true,side:result.side,confidence:Math.max(result.bankers,result.players)*25,reason};
}
