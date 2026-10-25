import { completePoker, handPoint, rankNames } from './poker-hand';
import type { PokerDecision, PokerHand } from './poker-hand';

/** Original terminal-parity formula. It never reads four-formula votes. */
export function parityPokerDecision(hand: PokerHand | null): PokerDecision {
  if(!hand||!completePoker(hand))return {ok:false,reason:'等待同桌同靴上一局完整實際牌張；不以牌路或點數代替'};
  const all=[...hand.player,...hand.banker];
  const values=all.map(c=>rankNames.indexOf(c)+1),total=values.reduce((a,b)=>a+b,0);
  const first=Math.floor(total/10)+total%10,terminal=first>=10?first%10:first;
  const side=terminal%2===0?'莊':'閒';
  return {ok:true,side,confidence:0,reason:`終值奇偶：閒 ${handPoint(hand.player)}／莊 ${handPoint(hand.banker)} 點；${all.join('、')}；牌面總和 ${total} → ${first} → ${terminal}；${terminal%2===0?'偶莊':'奇閒'}（原公式，非勝率）`};
}
