import { describe, expect, it } from 'vitest';
import { nextStakeRiskCheck, riskStopReason } from '../lib/dg-risk-limits';

describe('preflight stop-loss exposure', () => {
  const limits={stopLoss:2600,takeProfit:null};
  it('rejects the next martingale stake before losses can cross the limit',()=>{
    expect(nextStakeRiskCheck(-1100,limits,[],1500).ok).toBe(true);
    expect(nextStakeRiskCheck(-1100,limits,[],1501).ok).toBe(false);
    expect(nextStakeRiskCheck(-100,{stopLoss:200,takeProfit:null},[],300).ok).toBe(false);
  });
  it('reserves all other unsettled exposure across tables',()=>{
    const pending=[{key:'A',amount:100},{key:'B',amount:100}];
    expect(nextStakeRiskCheck(0,{stopLoss:250,takeProfit:null},pending,100).ok).toBe(false);
    expect(nextStakeRiskCheck(0,{stopLoss:300,takeProfit:null},pending,100).ok).toBe(true);
  });
  it('does not double-count the current reserved wager at the second guard',()=>{
    expect(nextStakeRiskCheck(-100,{stopLoss:200,takeProfit:null},[{key:'own',amount:100}],100,'own').ok).toBe(true);
    expect(nextStakeRiskCheck(-100,{stopLoss:200,takeProfit:null},[{key:'own',amount:100},{key:'other',amount:100}],100,'own').ok).toBe(false);
  });
  it('uses net settled P/L and never treats pending wagers as actual settled loss',()=>{
    const result=nextStakeRiskCheck(100,{stopLoss:200,takeProfit:null},[{key:'A',amount:100}],200);
    expect(result).toMatchObject({ok:true,remaining:200,exposure:100});
    expect(riskStopReason(100,{stopLoss:200,takeProfit:100})).toContain('止盈');
  });
  it('still disables loss preflight only when the loss limit is explicitly absent',()=>{
    expect(nextStakeRiskCheck(-500,{stopLoss:null,takeProfit:1000},[],100).ok).toBe(true);
  });
  it('fails closed for malformed money or exposure',()=>{
    expect(()=>nextStakeRiskCheck(NaN,limits,[],100)).toThrow();
    expect(()=>nextStakeRiskCheck(0,limits,[{key:'A',amount:NaN}],100)).toThrow();
    expect(()=>nextStakeRiskCheck(0,limits,[],Infinity)).toThrow();
  });
});
