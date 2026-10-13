import {describe,it,expect} from 'vitest';
import {syncDgTables,selectOpenDgTables} from '../lib/dg-table-selection';
describe('DG 自動掃描全部可讀桌台',()=>{
  it('載入時沒有桌，資料出現後自動補齊',()=>{
    expect(syncDgTables([],[],[],'3')).toEqual([]);
    expect(syncDgTables(['1','2','3','4'],[],[],'3')).toEqual(['1','2','3']);
  });
  it('所有桌模式自動補入新載入桌，不依牌型排名',()=>{
    expect(syncDgTables(['1','2','3'],['1'],[],'all')).toEqual(['1','2','3']);
  });
  it('保留使用者已選桌，空位才補齊',()=>{
    expect(syncDgTables(['1','2','3','4'],['4','2'],[],'3')).toEqual(['4','2','1']);
  });
  it('待結算桌消失不釋出額外桌位',()=>{
    expect(syncDgTables(['2','3'],['1'],['1'],'1')).toEqual(['1']);
    expect(syncDgTables(['2','3'],['1'],[],'1')).toEqual(['2']);
  });
  it('載入桌不足不捏造，重複桌只算一次',()=>{
    expect(syncDgTables(['1','1','2'],[],[],'5')).toEqual(['1','2']);
  });
});

describe('可下注空桌自動填入',()=>{
  it('單桌跳過已封盤或已下注桌',()=>{expect(selectOpenDgTables(['2','3'],[],'1')).toEqual(['2']);});
  it('待結算占桌位，其他空位仍可填入',()=>{expect(selectOpenDgTables(['2','3','4'],['1'],'3')).toEqual(['1','2','3']);});
  it('所有桌載入即加入，去重不重送',()=>{expect(selectOpenDgTables(['1','2','2'],['1'],'all')).toEqual(['1','2']);});
});
