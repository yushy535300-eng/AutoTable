import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createDgPokerTracker,dgPokerHand,DG_CARD_MEMORY_COMPACT_MS} from '../lib/poker-strategies';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/dg-card-results-anonymous.json',import.meta.url),'utf8'));
const hand={player:'10-33-0',banker:'10-17-8'};
const msg=(tableId=101,shoeId:any=0,playId=18,poker:any=hand,state=5)=>({cmd:1002,codeId:0,table:[{tableId,...(shoeId==null?{}:{shoeId}),playId,state,...(poker==null?{}:{poker:JSON.stringify(poker)})}]});
const card=(tableId=101,shoeId:any=0,playId=19)=>({tableId,gameInfo:{...(shoeId==null?{}:{shoeId}),playId,stateId:1}});
describe('real native DG card structure and passive per-room memory',()=>{
 it('accepts every sanitized fully revealed hand from the supplied native capture',()=>{
  const complete=fixture.table.filter((r:any)=>r.state===5&&r.poker);
  expect(complete.length).toBeGreaterThan(0);
  for(const row of complete)expect(dgPokerHand(row.poker),`native table ${row.tableId} round ${row.playId}`).not.toBeNull();
  for(const row of fixture.table.filter((r:any)=>r.state===2&&r.poker))expect(dgPokerHand(row.poker)).toBeNull();
 });
 it('only removes one unused third slot, never initial unrevealed cards or extra zeros',()=>{
  expect(dgPokerHand(hand)).toEqual({player:['10','7'],banker:['10','4','8']});
  for(const player of ['0-0-0','0-33-10','10-0-33','10-33-0-0','10--0','53-33-0'])expect(dgPokerHand({player,banker:hand.banker})).toBeNull();
 });
 it('collects an explicit completed result before any scene card exists, without starting automation',()=>{
  const t=createDgPokerTracker();t.observePacket(msg());
  expect(t.memoryView().tableCount).toBe(1);
  expect(t.decision(card(),'parity')).toMatchObject({ok:true,side:'莊'});
  expect(t.decision(card(),'counting')).toMatchObject({ok:true,side:'閒'});
 });
 it('binds absent scene shoe only when same-feed current native round supplies its identity',()=>{
  const t=createDgPokerTracker();t.observePacket(msg());
  expect(t.decision(card(101,null),'parity').ok).toBe(false);
  t.observePacket(msg(101,0,19,null,1));
  expect(t.decision(card(101,null),'parity')).toMatchObject({ok:true,side:'莊'});
  expect(t.identity(card(101,null))).toEqual({shoe:'0',round:19});
  expect(t.decision(card(102,null),'parity').ok).toBe(false);
 });
 it('allows omitted-shoe continuation only for an exact native table/round already identified',()=>{
  const t=createDgPokerTracker();t.observePacket(msg(101,0,18,null,2));t.observePacket(msg(101,null));
  expect(t.decision(card(),'parity').ok).toBe(true);
  const missing=createDgPokerTracker();missing.observePacket(msg(101,null));expect(missing.memoryView().tableCount).toBe(0);
  const wrong=createDgPokerTracker();wrong.observePacket(msg(101,0,17,null,2));wrong.observePacket(msg(101,null));expect(wrong.memoryView().tableCount).toBe(0);
 });
 it('does not replace a completed hand with an unrevealed or open-round retained poker blob',()=>{
  const t=createDgPokerTracker();t.observePacket(msg());
  t.observePacket(msg(101,0,19,{player:'0-0-0',banker:'0-0-0'},2));
  t.observePacket(msg(101,0,19,hand,1));
  expect(t.decision(card(),'parity').ok).toBe(true);
  expect(t.decision(card(101,0,20),'parity').ok).toBe(false);
 });
 it('compacts old history at twenty minutes while preserving every latest hand, identity and conflict flag',()=>{
  let time=0;const t=createDgPokerTracker(()=>time);
  t.observePacket(msg(101,0,17));t.observePacket(msg());t.observePacket(msg(102,13,18));
  const previous=t.decision(card(),'counting');expect(t.memoryView().historyCount).toBe(3);
  t.observePacket(msg(103,13,18));t.observePacket(msg(103,13,18,{player:'4-17-0',banker:'30-43-0'}));
  time=DG_CARD_MEMORY_COMPACT_MS;t.compactIfDue();
  expect(t.memoryView().tableCount).toBe(3);expect(t.memoryView().historyCount).toBe(3);
  expect(t.decision(card(),'counting')).toEqual(previous);
  expect(t.decision(card(102,13),'parity').ok).toBe(true);
  expect(t.decision(card(103,13),'parity').reason).toContain('衝突');
 });
 it('clears only source state on feed reset and cannot reuse old omitted-shoe metadata',()=>{
  const t=createDgPokerTracker();t.observePacket(msg());t.resetFeed();t.observePacket(msg(101,null));
  expect(t.memoryView().tableCount).toBe(0);expect(t.decision(card(),'parity').ok).toBe(false);
 });
 it('does not overwrite newly received native-shoe cards with a delayed old-shoe scene',()=>{
  const t=createDgPokerTracker();t.observePacket(msg(101,0,18));t.observePacket(msg(101,13,1));
  t.observe([{tableId:101,gameInfo:{shoeId:0,playId:18,stateId:5,poker:JSON.stringify(hand)}}]);
  expect(t.decision(card(101,13,2),'parity').ok).toBe(true);
 });
 it('does not reuse a previous shoe and detects an explicit new round-one epoch for zero-shoe tables',()=>{
  const t=createDgPokerTracker();t.observePacket(msg());t.observePacket(msg(101,0,1,null,1));
  expect(t.memoryView().tableCount).toBe(0);expect(t.decision(card(101,0,2),'parity').ok).toBe(false);
  t.observePacket(msg(101,13,1,hand,5));expect(t.decision(card(101,0,2),'parity').ok).toBe(false);
 });
});
