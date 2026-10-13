export type DgRiskLimits={stopLoss:number|null;takeProfit:number|null};
export function parseRiskLimits(lossText:string,profitText:string):DgRiskLimits{
  function parse(text:string,label:string){
    if(!text.trim())return null;
    const value=Number(text);
    if(!Number.isSafeInteger(value)||value<=0)throw new Error(`${label}必須是正整數金額，或留空停用`);
    return value;
  }
  return {stopLoss:parse(lossText,'止損'),takeProfit:parse(profitText,'止盈')};
}
export function riskStopReason(pnl:number,limits:DgRiskLimits):string|null{
  if(!Number.isFinite(pnl))throw new Error('累計損益資料無效');
  const fmt=(n:number)=>n.toLocaleString('zh-TW');
  if(limits.stopLoss!=null&&pnl<=-limits.stopLoss)return `已達止損 ${fmt(limits.stopLoss)}：本輪損益 ${fmt(pnl)}，停止新增下注`;
  if(limits.takeProfit!=null&&pnl>=limits.takeProfit)return `已達止盈 ${fmt(limits.takeProfit)}：本輪損益 +${fmt(pnl)}，停止新增下注`;
  return null;
}
