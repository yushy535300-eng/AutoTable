export type DgSide = '莊' | '閒';
export type DgScope = 'global' | 'table';
export type DgBet = {
  key: string; tableId: string; gameNo: string; side: DgSide; amount: number;
  level: number; scope: DgScope; state: 'reserved' | 'submitted' | 'accepted' | 'rejected' | 'uncertain' | 'settled' | 'aborted';
  createdAt: number; submittedAt?: number; acceptedAt?: number; settledAt?: number; pnl?: number;
  staking?: 'martingale' | 'flat' | 'doubling';
  provider?: string;
  attributionUncertain?: boolean;
};
export type DgLedgerState = {version:1; levels:Record<string,number>; bets:DgBet[]; roundStartedAt?:number};
export function martingaleAmount(base:number, level:number):number {
  if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw new Error('基本金額／階級無效');
  const amount=base*(2**(level+1)-1);
  if (!Number.isSafeInteger(amount)) throw new Error('馬丁金額超出整數範圍');
  return amount;
}
/** Classic doubling: 1, 2, 4, 8; unlike the existing 1, 3, 7, 15 Martingale. */
export function doublingAmount(base:number, level:number):number {
  if(!Number.isSafeInteger(base)||base<=0||!Number.isInteger(level)||level<0||level>30)throw Error('基本金額／階級無效');
  const amount=base*2**level;
  if(!Number.isSafeInteger(amount))throw Error('倍投金額超出整數範圍');
  return amount;
}
export function stakingAmount(base:number,level:number,staking:'flat'|'martingale'|'doubling'):number {
  return staking==='doubling'?doublingAmount(base,level):martingaleAmount(base,staking==='flat'?0:level);
}
export class DgBetLedger {
  state:DgLedgerState;
  constructor(saved?:DgLedgerState) {
    this.state=saved?.version===1 ? JSON.parse(JSON.stringify(saved)) : {version:1,levels:{},bets:[]};
  }
  levelKey(tableId:string,scope:DgScope) {return scope==='global'?'global':`table:${tableId}`;}
  level(tableId:string,scope:DgScope) {return this.state.levels[this.levelKey(tableId,scope)]??0;}
  pending() {return this.state.bets.filter(b=>['reserved','submitted','accepted','uncertain'].includes(b.state));}
  resetLevels() {
    if(this.pending().length)throw new Error('仍有待接受／待結算或未確定下注，不能重設配注階級');
    this.state.levels={};
  }
  reserve(tableId:string,gameNo:string,side:DgSide,base:number,scope:DgScope,staking:'martingale'|'flat'|'doubling'='martingale') {
    const key=`${tableId}:${gameNo}`;
    if (!tableId || !gameNo || this.state.bets.some(b=>b.key===key)) throw new Error('局號缺失或本局已操作');
    if (this.pending().some(b=>scope==='global'||b.scope==='global'||b.tableId===tableId)) throw new Error('上一笔仍待結算');
    const level=this.level(tableId,scope);
    const amount=stakingAmount(base,level,staking);
    const bet:DgBet={key,tableId,gameNo,side,amount,level,scope,staking,state:'reserved',createdAt:Date.now()};
    this.state.bets.push(bet);return bet;
  }
  submit(bet:DgBet) {if(bet.state!=='reserved')throw new Error('下注狀態錯誤');bet.state='submitted';bet.submittedAt=Date.now();}
  abort(bet:DgBet) {if(bet.state==='reserved')bet.state='aborted';}
  uncertain(bet:DgBet) {if(bet.state==='submitted')bet.state='uncertain';}
  receipt(msg:any) {
    if(Number(msg?.cmd)!==6||!msg.gameNo||msg.tableId==null)return null;
    const bet=this.state.bets.find(b=>b.key===`${msg.tableId}:${msg.gameNo}`&&['submitted','uncertain'].includes(b.state));
    if(!bet)return null;
    // A later tool-sized acknowledgement cannot erase evidence of a second
    // manual packet in the same game. Combined settlement is not tool-owned.
    if(bet.attributionUncertain){bet.state='uncertain';return {bet,accepted:false};}
    // HAR cmd 6 explicitly contains codeId=0. A missing receipt code is not acceptance.
    if(msg.codeId==null){bet.state='uncertain';return {bet,accepted:false};}
    if(Number(msg.codeId)!==0){bet.state='rejected';return {bet,accepted:false};}
    let info:any;
    try{info=JSON.parse(msg.list?.[0]??'');}catch{bet.state='uncertain';return {bet,accepted:false};}
    const banker=Number(info.banker??0)+Number(info.banker6??0),player=Number(info.player??0);
    const total=banker+player+Number(info.tie??0)+Number(info.bPair??0)+Number(info.pPair??0);
    if((bet.side==='莊'?banker:player)!==bet.amount||total!==bet.amount){bet.state='uncertain';return {bet,accepted:false};}
    bet.state='accepted';bet.acceptedAt=Date.now();return {bet,accepted:true};
  }
  settle(msg:any) {
    if(Number(msg?.cmd)!==1007||Number(msg.codeId??0)!==0||!msg.gameNo||msg.tableId==null)return null;
    const bet=this.state.bets.find(b=>b.key===`${msg.tableId}:${msg.gameNo}`&&b.state==='accepted'&&!b.attributionUncertain);
    const pnl=msg.dList?.[1];
    if(!bet||typeof pnl!=='number'||!Number.isFinite(pnl))return null;
    const k=this.levelKey(bet.tableId,bet.scope);
    if(bet.staking!=='flat')this.state.levels[k]=pnl>0?0:pnl<0?bet.level+1:bet.level;
    bet.pnl=pnl;bet.state='settled';bet.settledAt=Date.now();return {bet,pnl,nextLevel:this.state.levels[k]??0};
  }
}
export function chipPlan(amount:number,denominations:number[],limit=120):number[] {
  if(!Number.isSafeInteger(amount)||amount<=0)throw new Error('金額無效');
  const ds=[...new Set(denominations.filter(d=>Number.isSafeInteger(d)&&d>0))].sort((a,b)=>b-a);
  // Breadth-first exact decomposition: handles custom denominations where greedy fails.
  let frontier=new Map<number,number[]>([[0,[]]]);const visited=new Set([0]);
  for(let n=0;n<limit;n++){
    const next=new Map<number,number[]>();
    for(const [sum,path] of frontier)for(const d of ds){
      const value=sum+d;if(value>amount||visited.has(value))continue;
      const p=[...path,d];if(value===amount)return p;
      visited.add(value);next.set(value,p);
      if(visited.size>50000)throw new Error('籌碼組合過多，請設定合適籌碼');
    }
    frontier=next;if(!frontier.size)break;
  }
  throw new Error('目前籌碼不能精確組成金額，或點擊次數超出限制');
}
