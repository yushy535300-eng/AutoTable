import {describe,it,expect} from 'vitest';
import {createMtDomClickRunner,type MtClickState,type MtClickBet} from '../lib/mt-dom-click-runner';
import {martingaleAmount} from '../lib/dg-bet-ledger';

function saved(overrides:Partial<MtClickState>={}):MtClickState{
  return {version:1,config:{rooms:1,base:1000,maximum:100000,provider:'combined',staking:'martingale',startMode:'new',tableNames:[],takeProfit:null,stopLoss:null},bets:[],level:0,sessionStart:0,...overrides};
}
function bet(patch:Partial<MtClickBet>={}):MtClickBet{
  return {key:'B05|777|4',tableName:'B05',shoe:'777',round:4,side:'閒',amount:1000,level:0,staking:'martingale',provider:'combined',candidateIds:['BAV05'],gameSnById:{BAV05:'SN4'},createdAt:Date.now(),state:'settled',pnl:-1000,settledAt:Date.now(),...patch};
}
function fixture(state?:MtClickState){
  const report:any={tableViewport:{tables:[{name:'B05'},{name:'B06'},{name:'B07'},{name:'B08'},{name:'B09'}]},betObservation:{records:[],groups:[]}};
  const W:any={document:{hidden:false,addEventListener(){},removeEventListener(){}},console:{log(){}},setInterval(){return 1;},clearInterval(){},__MT_AUTOBAC_DIAG__:{report:()=>report,cancelScroll(){}}};
  const runner=createMtDomClickRunner(W,(_r,n)=>({ok:false,tableName:n,reason:'測試無牌路'}),state);
  return {runner,report};
}

describe('MT shares DG staking and session semantics',()=>{
  it.each([undefined,{tableId:'BAV05',gameSn:'SN4',playId:'OWN-PLAY',at:Date.now()}])('does not attribute same-amount external/opposite play without a matching native confirmation proof',async(nativeProof)=>{
    const own=bet({state:'submitted',pnl:undefined,settledAt:undefined,baselineRecordId:10,nativeProof});
    const {runner,report}=fixture(saved({bets:[own]}));
    report.betObservation={records:[{id:11,at:new Date().toISOString(),tableId:'BAV05',gameSn:'SN4',amount:1000,shoe:'777',round:4,slips:[{playId:'EXTERNAL-OPPOSITE-SIDE',amount:1000}],state:'accepted'}],groups:[{tableId:'BAV05',shoe:'777',round:4,recordIds:[11],acceptedAmount:1000,unresolved:0,settlement:{points:-1000}}]};
    await runner.tick();expect(runner.view().bets[0].state).toBe('submitted');expect(runner.view().pnl).toBe(0);expect(runner.view().level).toBe(0);expect(runner.view().bets[0].nativeRecordId).toBeUndefined();
  });
  it('defaults to one table, martingale, fresh base 100, installation remains stopped',()=>{
    const {runner}=fixture();const v=runner.view();expect(v.running).toBe(false);expect(v.config.rooms).toBe(1);expect(v.config.staking).toBe('martingale');expect(v.config.startMode).toBe('new');expect(v.nextAmount).toBe(100);expect(v.bets).toEqual([]);
  });
  it('one table allows flat and switching to 3/5/all forces effective flat without losing the single preference',()=>{
    const {runner}=fixture();runner.configure({staking:'flat'});expect(runner.view().config.staking).toBe('flat');runner.configure({staking:'martingale'});
    for(const rooms of [3,5,'all'] as const){runner.configure({rooms,staking:'martingale'});expect(runner.view().config.staking).toBe('flat');expect(runner.view().nextAmount).toBe(100);}
    runner.configure({rooms:1});expect(runner.view().config.staking).toBe('martingale');
  });
  it('fresh preview never shows the saved 7000 as the first 1000 base stake',async()=>{
    const {runner}=fixture(saved({level:2,bets:[bet({pnl:-6000})]}));expect(martingaleAmount(1000,2)).toBe(7000);expect(runner.view().nextAmount).toBe(1000);
    runner.start(true);await runner.halt();expect(runner.view().level).toBe(0);expect(runner.view().pnl).toBe(-6000);expect(runner.view().bets).toHaveLength(1);
  });
  it('resume uses saved 1/3/7/15 level and never resets the round profit/loss',()=>{
    const {runner}=fixture(saved({level:2,bets:[bet({pnl:-4000})]}));runner.configure({startMode:'resume'});expect(runner.view().nextAmount).toBe(martingaleAmount(1000,2));expect(runner.view().pnl).toBe(-4000);
  });
  it('fresh cannot start with pending wagers; resume can continue without removing locks',async()=>{
    const own=bet({state:'accepted',pnl:undefined,settledAt:undefined,nativeRecordId:1,nativeTableId:'BAV05',gameSn:'SN4'});
    const {runner,report}=fixture(saved({bets:[own]}));report.betObservation.records=[{id:1,tableId:'BAV05',gameSn:'SN4',amount:1000,shoe:'777',round:4,state:'accepted'}];
    expect(()=>runner.start(true)).toThrow(/新開始/);expect(()=>runner.configure({base:2000})).toThrow();runner.configure({startMode:'resume'});runner.start(true);await runner.halt();expect(runner.view().pending).toBe(1);expect(runner.view().bets[0].amount).toBe(1000);
  });
  it('does not reset already reached stop-loss on fresh start',()=>{
    const seed=saved({bets:[bet({pnl:-1000})],level:1});seed.config.stopLoss=1000;
    const {runner}=fixture(seed);expect(()=>runner.start(true)).toThrow(/止盈\/止損/);expect(runner.view().pnl).toBe(-1000);expect(runner.view().level).toBe(1);
  });
  it('rejects unapproved start and excessive manual selections',()=>{
    const {runner}=fixture();expect(()=>runner.start()).toThrow(/確認/);expect(()=>runner.configure({rooms:1,tableNames:['B05','B06']})).toThrow(/最多/);
  });
  it.each([[-1000,3],[950,0],[0,2]])('martingale formal settlement %s produces level %s',async(points,next)=>{
    const own=bet({amount:1000,state:'accepted',pnl:undefined,settledAt:undefined,level:2,nativeRecordId:1,nativeTableId:'BAV05',gameSn:'SN4'});
    const {runner,report}=fixture(saved({level:2,bets:[own]}));
    report.betObservation={records:[{id:1,tableId:'BAV05',gameSn:'SN4',amount:1000,shoe:'777',round:4,state:'accepted'}],groups:[{tableId:'BAV05',shoe:'777',round:4,recordIds:[1],acceptedAmount:1000,unresolved:0,settlement:{points}}]};
    await runner.tick();expect(runner.view().level).toBe(next);expect(runner.view().pnl).toBe(points);await runner.tick();expect(runner.view().level).toBe(next);
  });
  it('multi-table flat settles the loss without advancing any martingale level',async()=>{
    const own=bet({state:'accepted',pnl:undefined,settledAt:undefined,staking:'flat',nativeRecordId:1,nativeTableId:'BAV05',gameSn:'SN4'});
    const seed=saved({level:2,bets:[own]});seed.config.rooms=3;
    const {runner,report}=fixture(seed);report.betObservation={records:[{id:1,tableId:'BAV05',gameSn:'SN4',amount:1000,shoe:'777',round:4,state:'accepted'}],groups:[{tableId:'BAV05',shoe:'777',round:4,recordIds:[1],acceptedAmount:1000,unresolved:0,settlement:{points:-1000}}]};
    await runner.tick();runner.configure({startMode:'resume'});expect(runner.view().nextAmount).toBe(1000);expect(runner.view().level).toBe(2);expect(runner.view().pnl).toBe(-1000);
  });
});
