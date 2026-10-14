import {describe,it,expect} from 'vitest';
import {DgBetLedger,doublingAmount,martingaleAmount,stakingAmount} from '../lib/dg-bet-ledger';
import {createMtDomClickRunner,type MtClickState,type MtClickBet} from '../lib/mt-dom-click-runner';

describe('shared classic doubling formulas',()=>{
 it('distinguishes 1/2/4/8 from existing 1/3/7/15 Martingale',()=>{
  expect([0,1,2,3].map(n=>doublingAmount(100,n))).toEqual([100,200,400,800]);
  expect([0,1,2,3].map(n=>martingaleAmount(100,n))).toEqual([100,300,700,1500]);
  expect(stakingAmount(100,9,'flat')).toBe(100);
 });
 it.each([[0,0],[-1,0],[1.1,0],[100,-1],[100,31],[100,1.1],[Number.MAX_SAFE_INTEGER,1]])('rejects invalid base/level or integer overflow %s/%s',(b,n)=>expect(()=>doublingAmount(b,n)).toThrow());
 it('DG carries a single global doubling chain across rooms and resets only after winning',()=>{
  const ledger=new DgBetLedger();let round=0;
  for(const [table,pnl,wanted]of [['1',-100,100],['2',-200,200],['3',0,400],['4',380,400],['5',-100,100]] as const){
   const b=ledger.reserve(table,String(++round),'莊',100,'global','doubling');expect(b.amount).toBe(wanted);ledger.submit(b);
   ledger.receipt({cmd:6,tableId:table,gameNo:String(round),codeId:0,list:[JSON.stringify({banker:b.amount,player:0})]});
   ledger.settle({cmd:1007,tableId:table,gameNo:String(round),codeId:0,dList:[0,pnl]});
  }
  expect(ledger.level('next','global')).toBe(1);
 });
 it('DG rejection/uncertainty/wrong-round do not advance and accepted pending remains locked',()=>{
  const ledger=new DgBetLedger();const b=ledger.reserve('1','1','閒',100,'global','doubling');ledger.submit(b);
  expect(ledger.settle({cmd:1007,tableId:'1',gameNo:'1',dList:[0,-100]})).toBeNull();expect(ledger.level('1','global')).toBe(0);
  ledger.receipt({cmd:6,tableId:'1',gameNo:'1',codeId:21});expect(b.state).toBe('rejected');expect(ledger.level('1','global')).toBe(0);
  const c=ledger.reserve('2','2','閒',100,'global','doubling');ledger.submit(c);ledger.uncertain(c);expect(()=>ledger.resetLevels()).toThrow();expect(()=>ledger.reserve('3','3','閒',100,'global','doubling')).toThrow();
 });
});
function fixture({level=0,state='settled',pnl=-100,staking='doubling'}:{level?:number;state?:MtClickBet['state'];pnl?:number;staking?:MtClickBet['staking']}={}){
 const b:MtClickBet={key:'B05|777|4',tableName:'B05',shoe:'777',round:4,side:'閒',amount:100,level,staking,provider:'combined',candidateIds:['BAV05'],gameSnById:{BAV05:'SN4'},createdAt:Date.now(),state,pnl:state==='settled'?pnl:undefined,nativeRecordId:1,nativeTableId:'BAV05',gameSn:'SN4'};
 const saved:MtClickState={version:1,config:{rooms:1,base:100,maximum:1000,provider:'combined',staking,startMode:'resume',tableNames:[],takeProfit:null,stopLoss:null},bets:[b],level,sessionStart:0};
 const report:any={tableViewport:{tables:[{name:'B05'},{name:'B06'},{name:'B07'}]},betObservation:{records:[{id:1,tableId:'BAV05',gameSn:'SN4',amount:100,shoe:'777',round:4,state:'accepted'}],groups:[]}};
 const W:any={document:{hidden:false,addEventListener(){},removeEventListener(){}},console:{log(){}},setInterval(){return 1;},clearInterval(){},__MT_AUTOBAC_DIAG__:{report:()=>report,cancelScroll(){}}};
 return{runner:createMtDomClickRunner(W,(_r,n)=>({ok:false,tableName:n,reason:'測試無牌路'}),saved),report};
}
describe('MT shares doubling settlement/risk semantics',()=>{
 it.each([[-100,3],[95,0],[0,2]])('accepted formal settlement %s gives level %s only once',async(points,next)=>{
  const {runner,report}=fixture({level:2,state:'accepted'});
  report.betObservation.groups=[{tableId:'BAV05',shoe:'777',round:4,recordIds:[1],acceptedAmount:100,unresolved:0,settlement:{points}}];
  await runner.tick();expect(runner.view().level).toBe(next);expect(runner.view().nextAmount).toBe(doublingAmount(100,next));await runner.tick();expect(runner.view().level).toBe(next);
 });
 it('new starts at base while resume preserves common chain',async()=>{
  const {runner}=fixture({level:3});expect(runner.view().nextAmount).toBe(800);runner.configure({startMode:'new'});expect(runner.view().nextAmount).toBe(100);runner.start(true);await runner.halt();expect(runner.view().level).toBe(0);expect(runner.view().pnl).toBe(-100);
 });
 it('3/5/all stays flat even if external config requests doubling, one restores single preference',()=>{
  const {runner}=fixture({level:3});for(const rooms of [3,5,'all'] as const){runner.configure({rooms,staking:'doubling'});expect(runner.view().config.staking).toBe('flat');expect(runner.view().nextAmount).toBe(100);}runner.configure({rooms:1});expect(runner.view().config.staking).toBe('doubling');expect(runner.view().nextAmount).toBe(800);
 });
 it('does not change current pending stake when user changes strategy',()=>{
  const {runner}=fixture({state:'accepted'});expect(()=>runner.configure({staking:'flat'})).toThrow();expect(()=>runner.configure({staking:'martingale'})).toThrow();expect(runner.view().bets[0].staking).toBe('doubling');expect(runner.view().bets[0].amount).toBe(100);
 });
 it('rejection does not advance, reached stop loss remains enforced',async()=>{
  const {runner,report}=fixture({state:'submitted'});report.betObservation.records[0].state='rejected';await runner.tick();expect(runner.view().level).toBe(0);
  runner.configure({stopLoss:100}); // rejected contributes no P&L
  const x=fixture();x.runner.configure({stopLoss:100});expect(()=>x.runner.start(true)).toThrow(/止盈\/止損/);
 });
});
