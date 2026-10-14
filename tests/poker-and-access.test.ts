import {describe,it,expect} from 'vitest';
import {cardRank,completePoker,dgPokerHand,mtPokerHand,pokerDecision,mtPreviousPoker,createDgPokerTracker} from '../lib/poker-strategies';
import {isMtRestrictedHtml} from '../shared/mt-access-page';
import {rewriteMtHtml} from '../server/mt-game-proxy';
const hand={player:['4','4'],banker:['4','4']};
describe('complete native card strategies',()=>{
 it('uses identical DG and MT native ranks and checks display points',()=>{
  expect(dgPokerHand({player:'4-17',banker:'30-43'})).toEqual(hand);
  expect(mtPokerHand([4,30,17,43,0,0,0,0,8,8])).toEqual(hand);
  expect(mtPokerHand([4,30,17,43,0,0,0,0,7,8])).toBeNull();
  expect(cardRank(52)).toBe('K');expect(cardRank('')).toBeNull();expect(cardRank(true)).toBeNull();
 });
 it('preserves the original parity and four-vote formulas without claiming win probability',()=>{
  expect(pokerDecision('parity',hand)).toMatchObject({ok:true,side:'閒',confidence:0});
  expect(pokerDecision('counting',hand)).toMatchObject({ok:true,side:'莊',confidence:75});
  expect(pokerDecision('counting',{player:['A','7'],banker:['2','5']})).toMatchObject({ok:false});
 });
 it('refuses partial/impossible hands rather than falling back to road recommendations',()=>{
  expect(completePoker({player:['A','2'],banker:['3','4']})).toBe(false);
  expect(completePoker({player:['4','4','2'],banker:['4','4']})).toBe(false);
  for(const mode of ['counting','parity'] as const)expect(pokerDecision(mode,null).ok).toBe(false);
 });
 it('requires previous round, same native table and same shoe for MT',()=>{
  const table={tableId:'BAV05',lastPoker:{tableId:'BAV05',shoe:'S1',round:7,slots:[4,30,17,43,0,0,0,0,8,8]}};
  expect(mtPreviousPoker(table,'S1',8)).toEqual(hand);
  expect(mtPreviousPoker(table,'S2',8)).toBeNull();expect(mtPreviousPoker(table,'S1',9)).toBeNull();
  table.lastPoker.tableId='BAV06';expect(mtPreviousPoker(table,'S1',8)).toBeNull();
 });
 it('keeps DG completed cards at their actual round and blocks conflicting same-round evidence',()=>{
  const tracker=createDgPokerTracker(),base={tableId:5,gameInfo:{shoeId:'S1',playId:7,stateId:2,poker:{player:'4-17',banker:'30-43'}}};
  tracker.observe([base]);const next={tableId:5,gameInfo:{shoeId:'S1',playId:8,stateId:1,poker:base.gameInfo.poker}};
  tracker.observe([next]);expect(tracker.decision(next,'counting')).toMatchObject({ok:true,side:'莊'});
  tracker.observe([{...base,gameInfo:{...base.gameInfo,poker:{player:'1-7',banker:'2-5'}}}]);expect(tracker.decision(next,'counting').ok).toBe(false);
 });
});
describe('MT restricted documents are never a ready betting page',()=>{
 const denied='<html><head><title>Access restricted</title></head><body>Unauthorized access 訪問受限制 Due to the location from which you are accessing this page, the service is restricted.</body></html>';
 it('recognizes the known vendor denial document',()=>expect(isMtRestrictedHtml(denied)).toBe(true));
 it('does not treat ordinary chat containing only an access phrase as a denial page',()=>expect(isMtRestrictedHtml('<html><title>MT真人</title><body>聊天：Unauthorized access</body></html>')).toBe(false));
 it('ignores restriction text embedded only inside scripts',()=>expect(isMtRestrictedHtml('<title>MT真人</title><script>"Unauthorized access service is restricted"</script>')).toBe(false));
 it('does not inject the automation console into a denial document',()=>{
  const html=rewriteMtHtml(denied);expect(html).toContain('__AUTOBAC_MT_ACCESS_RESTRICTED__');expect(html).not.toContain('data-autobac-mt-console="1"');
 });
 it('preserves console injection on actual game documents',()=>expect(rewriteMtHtml('<html><head></head><body><div id="root"></div></body></html>')).toContain('data-autobac-mt-console="1"'));
});
