import {describe,it,expect,vi} from 'vitest';
import {checkDgAmount,readDgLimits} from '../lib/dg-limit-check';
const card=()=>({limitId:2,gameInfo:{gameId:1},baccaratLimit:{bpMin:100,bpMax:10000},playerInfo:{balance:5700,gameLimitMan:{getGameLimit:vi.fn(()=>({bpMin:100,bpMax:10000}))}}});
describe('DG限額診斷與快取同步',()=>{
 it('餘額5700且最低100時，100可進入原本送單流程',()=>{expect(checkDgAmount(card(),100).ok).toBe(true);});
 it('桌台零快取使用同級同遊戲的原生最新限額，不改金額',()=>{
  const c=card();c.baccaratLimit={bpMin:0,bpMax:0};const check=checkDgAmount(c,100);
  expect(check.ok).toBe(true);expect(check.limits.source).toBe('DG原生限額管理器');expect(c.playerInfo.gameLimitMan.getGameLimit).toHaveBeenCalledWith(2,1);
 });
 it('原生最新限制優先，不使用過期舊限额放行',()=>{const c=card();c.playerInfo.gameLimitMan.getGameLimit.mockReturnValue({bpMin:300,bpMax:10000});expect(checkDgAmount(c,100).code).toBe('below-min');});
 it('原生無資料但快取有效時沿用有效快取',()=>{const c=card();c.playerInfo.gameLimitMan.getGameLimit.mockReturnValue({bpMin:0,bpMax:0});expect(checkDgAmount(c,100).ok).toBe(true);});
 it('全部為零時明示未同步，不能稱為真超額，更不繞過',()=>{const c=card();c.baccaratLimit={bpMin:0,bpMax:0};c.playerInfo.gameLimitMan.getGameLimit.mockReturnValue({bpMin:0,bpMax:0});expect(checkDgAmount(c,100).code).toBe('limits-unready');});
 it('真的低於300就停止此筆，不自動把100改300',()=>{const c=card();c.playerInfo.gameLimitMan.getGameLimit.mockReturnValue({bpMin:300,bpMax:10000});const check=checkDgAmount(c,100);expect(check.ok).toBe(false);expect(check.reason).toContain('最低 300');});
 it('區分最高限額與餘額不足',()=>{expect(checkDgAmount(card(),11000).code).toBe('above-max');expect(checkDgAmount(card(),6000).code).toBe('insufficient-balance');});
 it('餘額無效不默認放行',()=>{const c=card();c.playerInfo.balance=NaN;expect(checkDgAmount(c,100).code).toBe('balance-unready');});
 it('讀取限額是唯讀、不改原本卡片快取',()=>{const c=card();readDgLimits(c);expect(c.baccaratLimit).toEqual({bpMin:100,bpMax:10000});});
});
