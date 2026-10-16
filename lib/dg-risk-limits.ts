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

/** Unsettled principal is worst-case loss, not an actual settled loss. */
export function nextStakeRiskCheck(pnl:number,limits:DgRiskLimits,pending:Array<{key:string;amount:number}>,nextAmount:number,ownReservation?:string){
  if(!Number.isFinite(pnl)||!Number.isSafeInteger(nextAmount)||nextAmount<=0)throw new Error('送單前損益或下注金額無效');
  const exposure=pending.filter(b=>b.key!==ownReservation).reduce((sum,b)=>{
    if(!Number.isSafeInteger(b.amount)||b.amount<=0)throw new Error('待結算金額無效，停止新增下注');
    return sum+b.amount;
  },0);
  if(!Number.isSafeInteger(exposure))throw new Error('待結算總額超出可用範圍');
  if(limits.stopLoss===null)return {ok:true,remaining:null,exposure,reason:null};
  if(!Number.isSafeInteger(limits.stopLoss)||limits.stopLoss<=0)throw new Error('止損設定無效');
  const remaining=limits.stopLoss+pnl-exposure;
  const ok=nextAmount<=remaining;
  const fmt=(n:number)=>n.toLocaleString('zh-TW');
  return {ok,remaining,exposure,reason:ok?null:`下一注 ${fmt(nextAmount)} 加上待結算 ${fmt(exposure)}，可能超過止損 ${fmt(limits.stopLoss)}（本輪損益 ${fmt(pnl)}、剩餘額度 ${fmt(Math.max(0,remaining))}）；停止新增下注`};
}
