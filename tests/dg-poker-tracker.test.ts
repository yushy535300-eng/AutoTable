import {describe,it,expect} from 'vitest';
import {createDgPokerTracker,dgPokerHand,pokerDecision,handPoint} from '../lib/poker-strategies';
const a={player:'4-17',banker:'30-43'};
const b={player:'3-5',banker:'16-6'};
const card=(id='1',shoe='13',round=8,state=1,poker:any=undefined)=>({tableId:id,gameInfo:{shoeId:shoe,playId:round,stateId:state,poker}});
const packet=(id='1',shoe='13',round=7,poker:any=a)=>({cmd:44,codeId:0,table:[{tableId:id,shoeId:shoe,playId:round,poker:JSON.stringify(poker),state:1}]});
describe('DG per-table complete card result tracking',()=>{
 it('uses explicit packet previous-round identifiers even while the current card has cleared its poker',()=>{
  const t=createDgPokerTracker(),c=card();t.observePacket(packet(),[c]);
  expect(t.decision(c,'parity')).toMatchObject({ok:true,side:'閒'});
  expect(t.decision(c,'counting')).toMatchObject({ok:true,side:'莊'});
  expect(t.decision(c,'counting').reason).toContain('閒 8／莊 8 點');
 });
 it('does not guess raw Table.state mapping or label current betting poker as a finished hand',()=>{
  const t=createDgPokerTracker(),c=card();t.observePacket(packet('1','13',8),[c]);
  expect(t.decision({...c,gameInfo:{...c.gameInfo,playId:9}},'parity').ok).toBe(false);
  t.observePacket(packet('1','13',8),[card('1','13',8,2)]);
  expect(t.decision(card('1','13',9),'parity').ok).toBe(true);
 });
 it('computes each table independently and never uses another room result',()=>{
  const t=createDgPokerTracker(),c1=card(),c2=card('2');
  t.observePacket({cmd:44,table:[...packet().table,...packet('2','13',7,b).table]},[c1,c2]);
  expect(t.decision(c1,'parity')).toMatchObject({ok:true,side:'閒'});
  expect(t.decision(c2,'parity')).toMatchObject({ok:true,side:'莊'});
  expect(t.decision(c2,'counting')).toMatchObject({ok:true,side:'閒'});
  expect(t.decision(card('3'),'counting').ok).toBe(false);
 });
 it('rejects wrong shoe, stale/missing round, incomplete/impossible cards and errors',()=>{
  for(const msg of [packet('1','99'),packet('1','13',6),packet('1','13',9),packet('1','13',7,{player:'A-2',banker:'3-4'}),packet('1','13',7,{player:'4-17',banker:'30'}),{...packet(),codeId:1}]){
   const t=createDgPokerTracker(),c=card();t.observePacket(msg,[c]);expect(t.decision(c,'parity').ok).toBe(false);
  }
  const t=createDgPokerTracker();t.observePacket({table:[{tableId:'1',poker:JSON.stringify(a)}]},[card()]);expect(t.decision(card(),'counting').ok).toBe(false);
 });
 it('keeps latest same-shoe evidence on delayed packets and blocks conflicting same-round cards',()=>{
  const t=createDgPokerTracker();t.observePacket(packet(),[card()]);t.observePacket(packet('1','13',6,b),[card('1','13',7)]);
  expect(t.decision(card(),'parity')).toMatchObject({ok:true,side:'閒'});
  t.observePacket(packet('1','13',7,b),[card()]);expect(t.decision(card(),'parity').reason).toContain('衝突');
 });
 it('does not retain a previous shoe as a current result and reports insufficient point-only input',()=>{
  const t=createDgPokerTracker();t.observePacket(packet(),[card()]);
  expect(t.decision(card('1','14'),'parity').ok).toBe(false);
  expect(dgPokerHand({playerPoint:8,bankerPoint:8})).toBeNull();
 });
 it('keeps the original formulas, baccarat face-card value zero, and no answer on a four-vote tie',()=>{
  expect(handPoint(['J','Q','K'])).toBe(0);
  expect(pokerDecision('parity',dgPokerHand(b))).toMatchObject({ok:true,side:'莊',confidence:0});
  expect(pokerDecision('counting',dgPokerHand({player:'1-7',banker:'2-5'}))).toMatchObject({ok:false});
 });
});
