export type LimitSnapshot={source:string;limitId:number|null;gameId:number|null;min:number|null;max:number|null;balance:number|null;available:boolean};
const numeric=(v:any):number|null=>v==null||v===''||typeof v==='boolean'||!Number.isFinite(Number(v))?null:Number(v);
const usable=(v:any)=>numeric(v?.bpMin)!=null&&Number(v.bpMin)>=0&&numeric(v?.bpMax)!=null&&Number(v.bpMax)>0&&Number(v.bpMax)>=Number(v.bpMin);
export function readDgLimits(card:any):LimitSnapshot{
  const player=card.playerInfo,limitId=numeric(card.limitId),gameId=numeric(card.gameInfo?.gameId);
  let value=card.baccaratLimit??card.gameLimit,source='桌台快取';
  // Same IDs as the native card's getGameLimit(). Never switch limit tiers or games.
  if(limitId!=null&&limitId>=1&&gameId!=null&&typeof player?.gameLimitMan?.getGameLimit==='function'){
    try{const current=player.gameLimitMan.getGameLimit(limitId,gameId);if(usable(current)){value=current;source='DG原生限額管理器';}}catch{/* 不猜測或繞過未知版本 */}
  }
  const min=numeric(value?.bpMin),max=numeric(value?.bpMax),balance=numeric(player?.balance);
  return {source,limitId,gameId,min,max,balance,available:usable(value)};
}
export function checkDgAmount(card:any,amount:number){
  const limits=readDgLimits(card);
  const result=(ok:boolean,code:string,reason:string)=>({ok,code,reason,limits});
  if(!Number.isSafeInteger(amount)||amount<=0)return result(false,'invalid-amount','下注金額不是正整數');
  if(!limits.available)return result(false,'limits-unready',`莊閒限額尚未同步（最低 ${limits.min??'未提供'}／最高 ${limits.max??'未提供'}）；等候，不改金額`);
  if(amount<limits.min!)return result(false,'below-min',`金額 ${amount} 低於平台最低 ${limits.min}（最高 ${limits.max}）；未送出，不自動加注`);
  if(amount>limits.max!)return result(false,'above-max',`金額 ${amount} 高於平台最高 ${limits.max}（最低 ${limits.min}）；未送出`);
  if(limits.balance==null)return result(false,'balance-unready','平台餘額尚未提供；等候，不送出');
  if(amount>limits.balance)return result(false,'insufficient-balance',`金額 ${amount} 超過目前餘額 ${limits.balance}；未送出`);
  return result(true,'ok',`金額 ${amount} 符合限額 ${limits.min}–${limits.max}／餘額 ${limits.balance}`);
}
