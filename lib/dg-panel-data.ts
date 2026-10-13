import type {DgBet} from './dg-bet-ledger';
export function cumulativePoints(bets:DgBet[],width=250,height=43){
  const ordered=bets.filter(b=>b.state==='settled'&&Number.isFinite(b.pnl)).slice().sort((a,b)=>(a.settledAt??a.acceptedAt??a.createdAt)-(b.settledAt??b.acceptedAt??b.createdAt));
  if(!ordered.length)return `0,${height/2} ${width},${height/2}`;
  let sum=0;const values=[0,...ordered.map(b=>sum+=b.pnl??0)];
  const low=Math.min(...values),high=Math.max(...values),span=high-low||1;
  return values.map((v,i)=>`${(i/Math.max(1,values.length-1)*width).toFixed(1)},${(height-4-(v-low)/span*(height-8)).toFixed(1)}`).join(' ');
}
export function chartSummary(bets:DgBet[]){
  const ordered=bets.filter(b=>b.state==='settled'&&Number.isFinite(b.pnl)).slice().sort((a,b)=>(a.settledAt??a.acceptedAt??a.createdAt)-(b.settledAt??b.acceptedAt??b.createdAt));
  let total=0;const values=[0,...ordered.map(b=>total+=b.pnl??0)];
  return {count:ordered.length,total,low:Math.min(...values),high:Math.max(...values)};
}
export function periodBets(bets:DgBet[],period:'today'|'yesterday'|'week',now=Date.now()){
  // Report dates are GMT+8 irrespective of the viewer's local timezone.
  const day=86400000,offset=28800000,start=Math.floor((now+offset)/day)*day-offset;
  const from=period==='yesterday'?start-day:period==='week'?start-6*day:start;
  const until=period==='yesterday'?start:start+day;
  return bets.filter(b=>b.createdAt>=from&&b.createdAt<until&&['submitted','accepted','rejected','uncertain','settled'].includes(b.state));
}
export function rangePosition(pnl:number,lowText:string,highText:string):number|null{
  if(!lowText.trim()||!highText.trim())return null;
  const low=Number(lowText),high=Number(highText);
  if(!Number.isFinite(low)||!Number.isFinite(high)||low>=high)return null;
  return Math.max(0,Math.min(100,(pnl-low)/(high-low)*100));
}
export function knownPoker(raw:any):{player:number[];banker:number[]}|null{
  let obj:any=raw;
  try{if(typeof raw==='string')obj=JSON.parse(raw);}catch{return null;}
  if(!obj||typeof obj.player!=='string'||typeof obj.banker!=='string')return null;
  const parse=(v:string)=>v.split('-').map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=52).slice(0,3);
  const player=parse(obj.player),banker=parse(obj.banker);
  return player.length||banker.length?{player,banker}:null;
}
export function pokerRank(id:number){const n=id%13||13;return n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);}
export function pokerPoint(ids:number[]){return ids.reduce((s,id)=>s+Math.min(id%13||13,10)%10,0)%10;}
