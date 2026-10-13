import {describe,it,expect} from 'vitest';
import {cumulativePoints,chartSummary,periodBets,rangePosition,knownPoker,pokerPoint} from '../lib/dg-panel-data';
import type {DgBet} from '../lib/dg-bet-ledger';
const bet=(at:number,pnl?:number):DgBet=>({key:String(at),tableId:'1',gameNo:String(at),side:'莊',amount:100,level:0,scope:'global',state:pnl==null?'submitted':'settled',createdAt:at,pnl});
describe('DG影片面板資料',()=>{
 it('趨勢線只看正式結算，累計從零開始',()=>{
  const points=cumulativePoints([bet(1,95),bet(2,-100),bet(3)],250,43);
  expect(points.split(' ')).toHaveLength(3);expect(points).not.toContain('NaN');
 });
 it('沒有結算時是可見零基準線，不生成假的上漲曲線',()=>{
  expect(cumulativePoints([])).toBe('0,21.5 250,21.5');expect(chartSummary([])).toEqual({count:0,total:0,low:0,high:0});
 });
 it('先收到的跨桌結算先畫，不以送單順序冒充',()=>{
  const loss={...bet(1,-100),settledAt:20},win={...bet(2,95),settledAt:10};
  const stats=chartSummary([loss,win]);expect(stats).toEqual({count:2,total:-5,low:-5,high:95});
 });
 it('GMT+8今日與昨日不受本機時區影響',()=>{
  const now=Date.parse('2026-10-13T02:00:00Z');
  const list=[bet(Date.parse('2026-10-12T17:00:00Z'),1),bet(Date.parse('2026-10-12T15:00:00Z'),1)];
  expect(periodBets(list,'today',now)).toHaveLength(1);expect(periodBets(list,'yesterday',now)).toHaveLength(1);
 });
 it('未設定滑桿顯示上下界不捏造限額',()=>{
  expect(rangePosition(95,'','')).toBeNull();expect(rangePosition(95,'100','50')).toBeNull();
  expect(rangePosition(0,'-100','100')).toBe(50);expect(rangePosition(999,'-100','100')).toBe(100);
 });
 it('只有已確認格式的牌卡才顯示，不猜未知JSON',()=>{
  expect(knownPoker('{"unknown":"abc"}')).toBeNull();expect(knownPoker('raw-other-format')).toBeNull();
  expect(knownPoker('{"player":"1-9-0","banker":"10-2-0"}')).toEqual({player:[1,9],banker:[10,2]});
  expect(pokerPoint([1,9])).toBe(0);expect(pokerPoint([10,2])).toBe(2);
 });
});
