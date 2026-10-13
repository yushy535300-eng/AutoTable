import {describe,it,expect} from 'vitest';
import {DgBetLedger,martingaleAmount,chipPlan} from '../lib/dg-bet-ledger';
import {localProviderDecision,getPatternInfo} from '../lib/dg-original-ai';
import {chartSummary} from '../lib/dg-panel-data';
const accept=(l:DgBetLedger,b:any)=>{l.submit(b);return l.receipt({cmd:6,tableId:b.tableId,gameNo:b.gameNo,codeId:0,list:[JSON.stringify(b.side==='莊'?{banker6:b.amount}:{player:b.amount})]});};
describe('DG 原生回覆與馬丁帳本',()=>{
 it('未下注開牌不計損益，送出未接受與拒絕也不升階',()=>{
  const l=new DgBetLedger();const result=(gameNo:string,pnl=-100)=>({cmd:1007,tableId:'1',gameNo,dList:[0,pnl]});
  expect(l.settle(result('no-bet'))).toBeNull();
  const b=l.reserve('1','submitted','莊',100,'table');l.submit(b);
  expect(l.settle(result('submitted'))).toBeNull();
  l.receipt({cmd:6,tableId:'1',gameNo:'submitted',codeId:120});
  expect(l.settle(result('submitted'))).toBeNull();
  const c=l.reserve('1','actual','莊',100,'table');expect(c.amount).toBe(100);accept(l,c);
  expect(l.settle(result('other-round',999))).toBeNull();
  expect(l.level('1','table')).toBe(0);expect(chartSummary(l.state.bets).total).toBe(0);
  expect(l.settle(result('actual'))?.nextLevel).toBe(1);
  expect(chartSummary(l.state.bets)).toMatchObject({count:1,total:-100});
  expect(l.settle(result('actual'))).toBeNull();expect(chartSummary(l.state.bets).total).toBe(-100);
  expect(l.reserve('1','next','閒',100,'table').amount).toBe(300);
 });
 it('原式是 1,3,7,15，不是普通翻倍',()=>expect([0,1,2,3].map(l=>martingaleAmount(100,l))).toEqual([100,300,700,1500]));
 it('尚未成功不能升階，錯桌與錯局不能結算',()=>{
  const l=new DgBetLedger(),b=l.reserve('60102','round-1','莊',100,'global');
  expect(l.settle({cmd:1007,tableId:'60102',gameNo:'round-1',dList:[0,-100]})).toBeNull();
  accept(l,b);
  expect(l.settle({cmd:1007,tableId:'60103',gameNo:'round-1',dList:[0,-100]})).toBeNull();
  expect(l.settle({cmd:1007,tableId:'60102',gameNo:'round-0',dList:[0,-100]})).toBeNull();
  expect(l.level('60102','global')).toBe(0);
 });
 it('輸升階、和局維持、贏重置，重複結算無效',()=>{
  const l=new DgBetLedger();let b=l.reserve('60102','a','莊',100,'global');accept(l,b);
  const m={cmd:1007,tableId:'60102',gameNo:'a',dList:[0,-100]};
  expect(l.settle(m)?.nextLevel).toBe(1);expect(l.settle(m)).toBeNull();
  b=l.reserve('60103','b','閒',100,'global');expect(b.amount).toBe(300);accept(l,b);
  expect(l.settle({cmd:1007,tableId:'60103',gameNo:'b',dList:[0,0]})?.nextLevel).toBe(1);
  b=l.reserve('60102','c','莊',100,'global');accept(l,b);
  expect(l.settle({cmd:1007,tableId:'60102',gameNo:'c',dList:[0,285]})?.nextLevel).toBe(0);
 });
 it('未收到回覆保持鎖定，同桌同局不可重送',()=>{
  const l=new DgBetLedger(),b=l.reserve('60102','a','莊',100,'table');l.submit(b);l.uncertain(b);
  expect(()=>l.reserve('60102','a','莊',100,'table')).toThrow();
  expect(()=>l.reserve('60102','b','莊',100,'table')).toThrow();
 });
 it('拒絕與金額不符不能標示成功',()=>{
  const l=new DgBetLedger(),b=l.reserve('60102','a','莊',100,'global');l.submit(b);
  expect(l.receipt({cmd:6,tableId:'60102',gameNo:'a',codeId:120})?.accepted).toBe(false);expect(b.state).toBe('rejected');
  const c=l.reserve('60102','b','莊',100,'global');l.submit(c);
  expect(l.receipt({cmd:6,tableId:'60102',gameNo:'b',list:['{"banker6":200}']})?.accepted).toBe(false);expect(c.state).toBe('uncertain');
 });
 it('共用帳本等上一筆，逐桌帳本不互相升階',()=>{
  const l=new DgBetLedger(),a=l.reserve('1','a','莊',100,'table');accept(l,a);
  const b=l.reserve('2','b','閒',100,'table');accept(l,b);
  expect(()=>l.reserve('3','c','莊',100,'global')).toThrow();
  l.settle({cmd:1007,tableId:'1',gameNo:'a',dList:[0,-100]});
  expect(l.level('1','table')).toBe(1);expect(l.level('2','table')).toBe(0);
 });
 it('重新載入保留待結算，不從零下注',()=>{
  const l=new DgBetLedger(),b=l.reserve('1','a','莊',100,'global');accept(l,b);
  const next=new DgBetLedger(l.state);expect(()=>next.reserve('2','b','閒',100,'global')).toThrow();
 });
 it('多桌平注輸贏不升階，也不把舊馬丁階級用於金額',()=>{
  const l=new DgBetLedger();l.state.levels['table:1']=3;
  let b=l.reserve('1','flat-loss','莊',100,'table','flat');expect(b.amount).toBe(100);accept(l,b);
  expect(l.settle({cmd:1007,tableId:'1',gameNo:'flat-loss',dList:[0,-100]})?.nextLevel).toBe(3);
  b=l.reserve('1','flat-win','閒',100,'table','flat');expect(b.amount).toBe(100);accept(l,b);
  l.settle({cmd:1007,tableId:'1',gameNo:'flat-win',dList:[0,100]});expect(l.level('1','table')).toBe(3);
  expect(l.reserve('1','flat-again','莊',100,'table','flat').amount).toBe(100);
 });
 it('平注單重新載入仍平注，不錯按成馬丁結算',()=>{
  const l=new DgBetLedger(),b=l.reserve('1','flat','莊',100,'table','flat');accept(l,b);
  const next=new DgBetLedger(l.state);next.settle({cmd:1007,tableId:'1',gameNo:'flat',dList:[0,-100]});
  expect(next.level('1','table')).toBe(0);expect(next.reserve('1','next','閒',100,'table','flat').amount).toBe(100);
 });
 it('籌碼精確組合，不默默減少金額',()=>{
  expect(chipPlan(700,[100,500])).toEqual([500,100,100]);
  expect(chipPlan(600,[400,300])).toEqual([300,300]);
  expect(()=>chipPlan(150,[100,500])).toThrow();
 });
 it('原始各來源各自判斷牌路，不用固定推薦',()=>{
  const results=('莊莊莊莊閒莊閒莊閒閒閒'.split('') as Array<'莊'|'閒'>);
  for(const p of ['road','chatgpt','gemini','grok','meta','combined'] as const){
   const d=localProviderDecision(p,results);expect(['莊','閒']).toContain(d.side);expect(d.confidence).toBeGreaterThanOrEqual(35);
  }
  expect(getPatternInfo(['莊','莊','莊','莊']).type).toBe('連龍');
 });
});

describe('新開始只重設配注，不刪正式紀錄',()=>{
 it('旧階2基本1000續接是7000，新開始是1000',()=>{const l=new DgBetLedger({version:1,levels:{'table:1':2},bets:[]});expect(martingaleAmount(1000,l.level('1','table'))).toBe(7000);l.resetLevels();expect(l.reserve('1','new','莊',1000,'table').amount).toBe(1000);});
 it('重設保留已結算損益及同局防重送',()=>{const l=new DgBetLedger();const b=l.reserve('1','a','莊',1000,'table');accept(l,b);l.settle({cmd:1007,tableId:'1',gameNo:'a',dList:[0,-1000]});l.resetLevels();expect(l.state.bets[0].pnl).toBe(-1000);expect(()=>l.reserve('1','a','閒',1000,'table')).toThrow();expect(l.reserve('1','b','閒',1000,'table').amount).toBe(1000);});
 it('未确定單禁止重設階級及清除鎖',()=>{const l=new DgBetLedger();const b=l.reserve('1','a','莊',1000,'table');l.submit(b);l.uncertain(b);expect(()=>l.resetLevels()).toThrow();expect(l.pending()).toHaveLength(1);});
});
