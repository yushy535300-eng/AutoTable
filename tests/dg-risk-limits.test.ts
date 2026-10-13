import {describe,it,expect} from 'vitest';
import {parseRiskLimits,riskStopReason} from '../lib/dg-risk-limits';
describe('止損／止盈',()=>{
 it('留空停用，兩欄正整數',()=>{expect(parseRiskLimits('','')).toEqual({stopLoss:null,takeProfit:null});expect(parseRiskLimits('1000','2000')).toEqual({stopLoss:1000,takeProfit:2000});});
 it('達到或超過止損才停止',()=>{const l=parseRiskLimits('1000','');expect(riskStopReason(-999,l)).toBeNull();expect(riskStopReason(-1000,l)).toContain('止損');expect(riskStopReason(-1300,l)).toContain('止損');});
 it('達到或超過止盈才停止',()=>{const l=parseRiskLimits('','2000');expect(riskStopReason(1999,l)).toBeNull();expect(riskStopReason(2000,l)).toContain('止盈');expect(riskStopReason(2500,l)).toContain('止盈');});
 it('門檻不誤用相反損益',()=>{const l=parseRiskLimits('1000','2000');expect(riskStopReason(1500,l)).toBeNull();expect(riskStopReason(-500,l)).toBeNull();expect(riskStopReason(0,l)).toBeNull();});
 it('無效金額與資料拒絕',()=>{for(const v of ['0','-100','1.5','x'])expect(()=>parseRiskLimits(v,'')).toThrow();expect(()=>riskStopReason(NaN,parseRiskLimits('',''))).toThrow();});
});
