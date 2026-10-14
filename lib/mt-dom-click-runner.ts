import { chipPlan, stakingAmount } from './dg-bet-ledger';

export type MtClickConfig = {
  rooms: 1|3|5|'all'; base: number; maximum: number; provider: string;
  staking: 'flat'|'martingale'|'doubling'; startMode: 'new'|'resume';
  tableNames: string[]; takeProfit: number|null; stopLoss: number|null;
};
export type MtClickBet = {
  key: string; tableName: string; shoe: string; round: number; side: '莊'|'閒';
  amount: number; level: number; staking: 'flat'|'martingale'|'doubling'; provider: string;
  candidateIds: string[]; gameSnById: Record<string,string>; createdAt: number;
  state: 'reserved'|'submitted'|'accepted'|'settled'|'rejected'|'aborted'|'uncertain';
  baselineRecordId?: number;
  nativeRecordId?: number; nativeTableId?: string; gameSn?: string; playId?: string;
  nativeProof?: {tableId:string;gameSn:string;playId:string;at:number};
  submittedAt?: number; acceptedAt?: number;
  pnl?: number; settledAt?: number; reason?: string;
};
export type MtClickState = {
  version:1; config:MtClickConfig; bets:MtClickBet[]; level:number; sessionStart:number;
};
const defaults:MtClickConfig={rooms:1,base:100,maximum:100000,provider:'combined',staking:'martingale',startMode:'new',tableNames:[],takeProfit:null,stopLoss:null};
const pendingStates=new Set(['reserved','submitted','accepted','uncertain']);
const copy=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
const clean=(v:any)=>String(v??'').replace(/\s+/g,' ').trim();

export function createMtDomClickRunner(W:any, preview:(report:any,name:string,provider:string,now:number)=>any, saved?:MtClickState, readReport?:()=>any) {
  const D:Document=W.document;
  const state:MtClickState=saved?.version===1?copy(saved):{version:1,config:copy(defaults),bets:[],level:0,sessionStart:0};
  let running=false,disposed=false,generation=0,active:Promise<void>|null=null,testOnce=false;
  let message='已停止；安裝不會下注',stage:any=null;
  let onChange:()=>void=()=>{};
  const logs:{at:number;text:string}[]=[];
  const report=()=>readReport?readReport():W.__MT_AUTOBAC_DIAG__?.report?.();
  const previousSocketSend=W.WebSocket?.prototype?.send;
  function nativeSend(this:any,raw:any){
    if(stage?.nativeClickInProgress&&typeof raw==='string'){
      try{
        const packet=JSON.parse(raw),slips=packet.body?.order?.slips,id=String(packet.action?.data?.table_id??''),bet:MtClickBet=stage.bet;
        if(packet.method==='POST'&&packet.action?.name?.endsWith('/bet')&&bet.candidateIds.includes(id)&&packet.body?.game_sn===bet.gameSnById[id]&&slips?.length===1&&Number(slips[0].amount)===bet.amount&&slips[0].play_id!=null){
          if(bet.nativeProof){delete bet.nativeProof;stage.interference=true;stop('同次原生確認送出多筆注單，無法唯一核對');}
          else bet.nativeProof={tableId:id,gameSn:String(packet.body.game_sn),playId:String(slips[0].play_id),at:Date.now()};
        }
      }catch{}
    }
    return Reflect.apply(previousSocketSend,this,[raw]);
  }
  if(previousSocketSend)W.WebSocket.prototype.send=nativeSend;
  const pending=()=>state.bets.filter(b=>pendingStates.has(b.state));
  const mode=()=>state.config.rooms===1?state.config.staking:'flat';
  const pnl=()=>state.bets.slice(state.sessionStart).filter(b=>b.state==='settled').reduce((s,b)=>s+(b.pnl??0),0);
  function note(text:string){message=text;logs.push({at:Date.now(),text});if(logs.length>80)logs.shift();W.console.log('[AutoBac MT 點擊]',text);onChange();}
  function amount(){return stakingAmount(state.config.base,state.level,mode());}
  function previewAmount(){return !running&&!pending().length&&state.config.startMode==='new'?state.config.base:amount();}
  function isEligible(p:any){return p.ok&&p.canBet&&(p.count??0)>=6&&p.results?.filter((x:string)=>x!=='和').length>=3;}
  function selectedNames(r:any){
    const rows:any[]=r?.tableViewport?.tables||[],limit=state.config.rooms==='all'?rows.length:state.config.rooms;
    if(state.config.tableNames.length)return [...state.config.tableNames];
    const names=[...new Set(pending().map(b=>b.tableName))];
    const unoperated=(p:any)=>!state.bets.some(b=>b.key===`${p.tableName}|${p.roundKey}`)&&!existingNative(r,p);
    const previews=rows.map(x=>preview(r,x.name,state.config.provider,Date.now()));
    const eligible=previews.filter(p=>isEligible(p)&&unoperated(p));
    const pool=running?eligible:[...eligible,...previews];
    for(const p of pool){if(names.length>=limit)break;if(!names.includes(p.tableName))names.push(p.tableName);}
    return names;
  }
  function configure(values:Partial<MtClickConfig>){
    if(running||active||(pending().length&&Object.keys(values).some(k=>k!=='startMode')))throw Error('請先停止並等待已送出下注結算，才能改設定');
    const c={...state.config,...values};
    if(![1,3,5,'all'].includes(c.rooms))throw Error('桌數無效');
    if(!Number.isSafeInteger(c.base)||c.base<=0||!Number.isSafeInteger(c.maximum)||c.maximum<c.base)throw Error('基本金額/單筆上限無效');
    if(!['combined','chatgpt','gemini','grok','meta','road','counting','parity'].includes(c.provider))throw Error('推薦來源無效');
    if(!['flat','martingale','doubling'].includes(c.staking)||!['new','resume'].includes(c.startMode))throw Error('配注/開始方式無效');
    for(const v of [c.takeProfit,c.stopLoss])if(v!==null&&(!Number.isFinite(v)||v<=0))throw Error('止盈止損請輸入正金額，或留空');
    c.tableNames=[...new Set(c.tableNames.map(n=>clean(n).toUpperCase()))];
    if(c.rooms!=='all'&&c.tableNames.length>c.rooms)throw Error(`最多只能指定${c.rooms}桌`);
    state.config=c;onChange();return copy(c);
  }
  function start(approved=false,once=false){
    if(!approved)throw Error('必須先確認本次設定與風險');
    if(disposed||running||active)throw Error('目前不能開始');
    const r=report();if(!r?.tableViewport?.tables?.length)throw Error('請在MT原生多台頁開始');
    const unresolved=pending();
    if(unresolved.some(b=>b.state==='uncertain'))throw Error('仍有未確定下注；保留鎖定，不重送');
    if(unresolved.length&&state.config.startMode==='new')throw Error('新開始須等所有下注結算；可改為續接，但不清除待結算單');
    const p=pnl();if((state.config.takeProfit!==null&&p>=state.config.takeProfit)||(state.config.stopLoss!==null&&p<=-state.config.stopLoss))throw Error('本輪已達止盈/止損，不能續接');
    if(state.config.startMode==='new')state.level=0;
    testOnce=once;running=true;generation++;note('執行中：選籌碼 → 推薦方向 → 確認 → 平台回覆');void tick();
  }
  function stop(reason='已停止新增操作；已送出的下注繼續核對結算'){
    running=false;testOnce=false;generation++;W.__MT_AUTOBAC_DIAG__?.cancelScroll?.();note(reason);
  }
  function visible(e:Element|null):boolean{
    if(!e?.isConnected)return false;
    const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;
    for(let n:Element|null=e;n;n=n.parentElement){const s=W.getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||(n as HTMLElement).hidden)return false;}
    return true;
  }
  function usable(e:any){
    if(!visible(e)||e.disabled||e.getAttribute('aria-disabled')==='true'||e.closest?.('.gameDesk_bet_section li.disable'))return false;
    for(let n:Element|null=e.parentElement;n;n=n.parentElement)if((n as any).disabled||n.getAttribute('aria-disabled')==='true')return false;
    return true;
  }
  function nativeMobile(row:Element){return row.classList.contains('gameDesk')&&row.closest('.multiple#mulitScroll')!==null;}
  function numericText(value:any):number|null {
    const match=clean(value).match(/^(?:(?:TWD|NT\$|\$)\s*)?(\d[\d,]*(?:\.\d+)?)$/i);
    if(!match)return null;const number=Number(match[1].replace(/,/g,''));return Number.isFinite(number)?number:null;
  }
  function nativeSections(row:Element){return Array.from(row.querySelectorAll('.gameDesk_bet_section')).filter(visible);}
  function nativeSide(row:Element,side:string):Element|null {
    const wanted=side==='莊'?'zhuang':side==='閒'?'free':null;if(!wanted)return null;
    const matches=nativeSections(row).filter(section=>section.getAttribute('data-state')==='classic').flatMap(section=>Array.from(section.querySelectorAll(':scope > ul > li[data-state]')).filter(visible)).filter(li=>li.getAttribute('data-state')===wanted);
    return matches.length===1?matches[0]:null;
  }
  function nativeQueued(row:Element){
    return nativeSections(row).flatMap(section=>Array.from(section.querySelectorAll('.btn.btn-money')).filter(visible)).map(button=>({button,value:numericText(button.textContent),side:button.closest('li[data-state]')?.getAttribute('data-state')||null}));
  }
  function money(li:Element):number|null {
    if(nativeMobile(li.closest('.gameDesk')||li)){
      const values=Array.from(li.querySelectorAll('.btn.btn-money')).filter(visible).map(e=>numericText(e.textContent)).filter((value):value is number=>value!==null);
      if(!values.length)return null;if(new Set(values).size!==1)throw Error('畫面待確認金額顯示不一致');return values[0];
    }
    const found:number[]=[];
    for(const e of Array.from(li.querySelectorAll('.value .money span,.value .money'))){
      if(!visible(e))continue;
      const n=numericText(e.textContent);if(n!==null)found.push(n);
    }
    if(!found.length)return null;
    if(new Set(found).size!==1)throw Error('畫面待確認金額顯示不一致');
    return found[0];
  }
  function sides(row:Element){
    if(nativeMobile(row))return ['莊','閒'].map(side=>nativeSide(row,side)).filter((li):li is Element=>!!li);
    return Array.from(row.querySelectorAll('.gameDesk_bet li')).filter(li=>['莊','閒'].includes(clean(li.querySelector('.caption')?.textContent)));
  }
  function hasPending(row:Element){
    if(nativeMobile(row))return nativeQueued(row).some(entry=>(entry.value??0)>0);
    const confirm=row.querySelector('.gameDesk_bet .btn-check');
    if(usable(confirm))return true;
    return Array.from(row.querySelectorAll('.gameDesk_bet li')).some(li=>(money(li)??0)>0);
  }
  function stagedTotal(row:Element,side:string,expected:number){
    if(nativeMobile(row)){
      const own=nativeSide(row,side);if(!own)throw Error('同桌原生推薦下注區不存在或不唯一');
      const entries=nativeQueued(row),ownState=side==='莊'?'zhuang':'free';
      const ownValues=entries.filter(entry=>entry.side===ownState).map(entry=>entry.value);
      if(ownValues.length!==1||ownValues[0]!==expected)throw Error(`待確認金額未核實：預期${side} ${expected}，畫面${ownValues[0]??'讀不到'}`);
      if(entries.some(entry=>entry.side!==ownState&&(entry.value??0)>0))throw Error('其他下注區已有金額，不送出混合投注');
      return;
    }
    let target=false;
    for(const li of Array.from(row.querySelectorAll('.gameDesk_bet li'))){
      const caption=clean(li.querySelector('.caption')?.textContent),value=money(li);
      if(caption===side){target=true;if(value===null||value!==expected)throw Error(`待確認金額未核實：預期${side} ${expected}，畫面${value??'讀不到'}`);}
      else if((value??0)>0)throw Error('其他下注區已有金額，不送出混合投注');
    }
    if(!target)throw Error('同桌下注方向不存在');
  }
  function rowStillCurrent(row:Element,name:string){
    const mobile=nativeMobile(row),pane=mobile?D.querySelector('.multiple#mulitScroll'):D.querySelector('.ant-tabs-tabpane-active.multiple');
    if(!pane||!row.isConnected||!pane.contains(row))return false;
    const cards=Array.from(pane.querySelectorAll('.gameDesk')).filter(c=>clean(c.querySelector('.gameDesk_tag,.gameDesk_tag_live')?.textContent).match(/\bB\d{2}[A-Z]?(?:-L)?\b/i)?.[0]?.toUpperCase()===name);
    return cards.length===1&&(mobile?cards[0]===row:row.contains(cards[0]));
  }
  const pause=(ms=40)=>new Promise<void>(resolve=>W.setTimeout(resolve,ms));
  function chips(){
    const choices=new Map<number,HTMLElement[]>();
    const mobilePane=D.querySelector('.multiple#mulitScroll');
    const candidates=mobilePane?
      Array.from(mobilePane.querySelectorAll(':scope > .multiple_footer > .chip-group > [class*="chip-"]')):
      Array.from(D.querySelectorAll('[class*="chip-"]'));
    for(const e of candidates){
      if(!mobilePane&&e.closest('.gameDesk_bet,.gameDesk_bet_section,.bet_section_center')||!visible(e))continue;
      const token=Array.from(e.classList).find(x=>/^chip-\d+$/.test(x));if(!token)continue;
      const n=Number(token.slice(5));if(n<=0)continue;
      const a=choices.get(n)||[];a.push(e as HTMLElement);choices.set(n,a);
    }
    const out=new Map<number,HTMLElement>();for(const [n,a]of choices)if(a.length===1)out.set(n,a[0]);
    return out;
  }
  function existingNative(r:any,p:any){return (r.betObservation?.records||[]).some((b:any)=>p.candidateIds.includes(b.tableId)&&(b.gameSn===p.gameSnById[b.tableId]||(String(b.shoe)===p.shoe&&Number(b.round)===p.round)));}
  function nativeMatches(bet:MtClickBet,records:any[]){
    const proof=bet.nativeProof;if(!proof)return [];
    return records.filter(x=>Number(x.id)>(bet.baselineRecordId??0)&&Date.parse(x.at)>=bet.createdAt-5&&Date.parse(x.at)<=bet.createdAt+15000&&x.tableId===proof.tableId&&x.gameSn===proof.gameSn&&x.amount===bet.amount&&String(x.shoe)===bet.shoe&&Number(x.round)===bet.round&&x.slips?.length===1&&x.slips[0].amount===bet.amount&&String(x.slips[0].playId)===proof.playId);
  }
  function status(r:any){
    const records:any[]=r?.betObservation?.records||[],groups:any[]=r?.betObservation?.groups||[];
    for(const bet of state.bets){
      if(!['submitted','accepted','uncertain'].includes(bet.state))continue;
      if(bet.state==='uncertain'&&bet.nativeRecordId)continue;
      if(!bet.nativeRecordId){
        const candidates=nativeMatches(bet,records);
        if(candidates.length===1){const match=candidates[0];bet.nativeRecordId=match.id;bet.nativeTableId=match.tableId;bet.gameSn=match.gameSn;bet.playId=match.slips[0].playId;bet.reason=undefined;}
        else {if(Date.now()-(bet.submittedAt??bet.createdAt)>12000){bet.state='uncertain';bet.reason='確認已點但12秒內未取得唯一原生送單；不重送';if(running)stop(bet.reason);}continue;}
      }
      const rec=records.find(x=>x.id===bet.nativeRecordId);
      if(!rec||rec.tableId!==bet.nativeTableId||rec.gameSn!==bet.gameSn||rec.amount!==bet.amount||String(rec.shoe)!==bet.shoe||Number(rec.round)!==bet.round){bet.state='uncertain';bet.reason='原生注單欄位無法持續核對';if(running)stop(bet.reason);continue;}
      if(rec.state==='rejected'){bet.state='rejected';bet.reason=`平台拒絕：${rec.error}`;stop(`${bet.tableName} ${bet.reason}`);continue;}
      if(rec.reviewReason){bet.state='uncertain';bet.reason=rec.reviewReason;if(running)stop(`需核對：${rec.reviewReason}`);continue;}
      if(rec.state==='accepted'&&bet.state!=='accepted'){bet.state='accepted';bet.acceptedAt=Date.parse(rec.acceptedAt)||Date.now();note(`${bet.tableName} 平台已接受 ${bet.side} ${bet.amount}（${bet.nativeTableId}）`);if(testOnce)stop('測試一筆已接受；停止新增操作，繼續核對結算');}
      if(bet.state==='accepted'){
        const group=groups.find(g=>g.tableId===bet.nativeTableId&&String(g.shoe)===bet.shoe&&Number(g.round)===bet.round);
        if(group?.settlement){
          const accepted=group.recordIds.filter((id:number)=>records.some(x=>x.id===id&&x.state==='accepted'));
          if(group.unresolved||group.acceptedAmount!==bet.amount||accepted.length!==1||accepted[0]!==bet.nativeRecordId){bet.state='uncertain';bet.reason='本桌本局混有其他投注，不能將合計損益當成本筆';if(running)stop(bet.reason);continue;}
          const value=group.settlement.points;if(typeof value!=='number'||!Number.isFinite(value))continue;
          if(value < -bet.amount || value > bet.amount){bet.state='uncertain';bet.reason='會員本局合計超出此筆金額，可能含其他投注，不能改配注';if(running)stop(bet.reason);continue;}
          bet.state='settled';bet.pnl=value;bet.settledAt=Date.now();
          if(bet.staking!=='flat')state.level=value>0?0:value<0?bet.level+1:bet.level;
          note(`${bet.tableName} 已正式結算 ${value>=0?'+':''}${value}；下一注${amount()}`);
          const p=pnl();if(running&&((state.config.takeProfit!==null&&p>=state.config.takeProfit)||(state.config.stopLoss!==null&&p<=-state.config.stopLoss)))stop('已達本輪止盈/止損，停止新增下注');
        }
      }
      if(['submitted','uncertain'].includes(bet.state)&&Date.now()-(bet.submittedAt??bet.createdAt)>12000){bet.state='uncertain';bet.reason='未取得可唯一核對的成功回覆';if(running)stop(bet.reason);}
      if(bet.state==='accepted'&&running&&Date.now()-(bet.acceptedAt??bet.createdAt)>180000)stop('平台結算逾時；已停止，保留待結算帳本');
    }
  }
  async function clearOwnStage(){
    if(!stage||!stage.owned||stage.confirmed||stage.interference)return;
    if(rowStillCurrent(stage.row,stage.name)){
      // Native red-cross clears the entire table selection.  The runner may
      // use it only after re-reading the actual queue and proving it still
      // contains exactly its own amount on exactly its own side.
      try{stagedTotal(stage.row,stage.bet.side,stage.ownedAmount);}catch{
        stage.bet.state='uncertain';stage.bet.reason='待確認金額已非本工具唯一預備金額，不自動取消';note(stage.bet.reason);return;
      }
      const cancel=stage.cancel||stage.row.querySelector('.gameDesk_bet .btn-cancel');
      if(usable(cancel)){(cancel as HTMLElement).click();await pause();}
      if(hasPending(stage.row)){stage.bet.state='uncertain';stage.bet.reason='已停止，但本桌仍有待確認金額，請手動取消';note(stage.bet.reason);}
    }else{stage.bet.state='uncertain';stage.bet.reason='桌列消失，未確認金額需手動核對';note(stage.bet.reason);}
  }
  async function execute(p:any,r:any,run:number){
    const value=amount();if(value>state.config.maximum){stop(`下一注${value}超過設定單筆上限${state.config.maximum}`);return;}
    const available=chips(),plan=chipPlan(value,[...available.keys()],40);
    if((p.count??0)<Math.max(6,Math.ceil(plan.length*.15)+3))return;
    const gameSns=[...new Set(Object.values(p.gameSnById||{}).map(String).filter(Boolean))];
    const focused=await W.__MT_AUTOBAC_DIAG__.scrollToTable(p.tableName,{control:'side',side:p.side,identity:'display',...(gameSns.length===1?{expectedGameSn:gameSns[0]}:{})});
    if(!focused.ok)throw Error(`定位失敗：${focused.reason}`);
    const row:Element=focused.row;
    const nativeStaged=()=>{
      if(!focused.mobile)return;
      const orderMode=typeof focused.readNativeOrderMode==='function'?focused.readNativeOrderMode():focused.nativeOrderMode;
      if(orderMode==='direct')throw Error('原生 immediatelyOrderType 直接下注模式啟用；不點下注區');
      if(orderMode!=='staged'&&orderMode!=='staged-wait-countdown')throw Error('無法讀取原生 immediatelyOrderType；保守不點下注區');
      const countdown=typeof focused.readNativeCountdown==='function'?focused.readNativeCountdown():focused.nativeCountdown;
      const fresh=preview(report(),p.tableName,p.provider||state.config.provider,Date.now());
      if(!fresh.ok||!fresh.canBet||fresh.roundKey!==p.roundKey||JSON.stringify(fresh.gameSnById)!==JSON.stringify(p.gameSnById))throw Error('原生手機倒數更新時已換局或即時資料未核對；不點下注區');
      if(!Number.isSafeInteger(countdown)||countdown<6)throw Error('原生 data-value 倒數不足6秒；不點下注區');
      if(countdown!==fresh.count)throw Error('原生 data-value 倒數與已觀察 native wait count 不一致；不點下注區');
      if(!usable(focused.target))throw Error('同桌原生下注區已禁用或隱藏；不點籌碼');
    };
    nativeStaged();
    if(hasPending(row))throw Error(`${p.tableName} 已有未確認/已顯示投注，不覆蓋`);
    const baseline=Math.max(0,...(report()?.betObservation?.records||[]).map((x:any)=>Number(x.id)||0));
    const bet:MtClickBet={key:`${p.tableName}|${p.roundKey}`,tableName:p.tableName,shoe:p.shoe,round:p.round,side:p.side,amount:value,level:mode()!=='flat'?state.level:0,staking:mode(),provider:state.config.provider,candidateIds:[...p.candidateIds],gameSnById:{...p.gameSnById},createdAt:Date.now(),state:'reserved'};
    bet.baselineRecordId=baseline;
    state.bets.push(bet);stage={row,name:p.tableName,owned:false,ownedAmount:0,confirmed:false,interference:false,cancel:focused.cancel,confirm:focused.confirm,bet};
    function guard(){
      if(disposed||!running||run!==generation||stage?.interference||D.hidden)throw Error('已停止/有手動操作/頁面非前景');
      if(!rowStillCurrent(row,p.tableName))throw Error('桌列已變動');
      const fresh=preview(report(),p.tableName,bet.provider,Date.now());
      if(!fresh.ok||!fresh.canBet||fresh.roundKey!==p.roundKey||(fresh.count??0)<6||JSON.stringify(fresh.gameSnById)!==JSON.stringify(bet.gameSnById))throw Error('已換局/封盤/即時資料不足');
    }
    try{
      for(const denomination of plan){
        guard();nativeStaged();const chip=chips().get(denomination);if(!chip||!usable(chip))throw Error('指定籌碼不可用');
        chip.click();await pause();guard();
        nativeStaged();
        const target=focused.target;
        if(!target||!usable(target))throw Error('同桌推薦下注區不可用');
        stage.owned=true;(target as HTMLElement).click();stage.ownedAmount+=denomination;await pause();
        // Check each increment before a later chip/side action.  This makes a
        // limit clamp, hidden button, or external queue mutation non-cancellable.
        stagedTotal(row,p.side,stage.ownedAmount);
      }
      guard();stagedTotal(row,p.side,value);
      const confirm=focused.confirm||row.querySelector('.gameDesk_bet .btn-check');if(!usable(confirm))throw Error('畫面確認鈕仍不可用，未送出');
      guard();stage.confirmed=true;bet.state='submitted';bet.submittedAt=Date.now();note(`${p.tableName} 點擊確認 ${p.side} ${value}；等待原生送單證據`);
      stage.nativeClickInProgress=true;
      try{(confirm as HTMLElement).click();}finally{stage.nativeClickInProgress=false;}
      // Observe asynchronously: like DG, one table's slow send/ACK must not hold
      // the other tables in the same wave. Never click confirm a second time.
      await pause();status(report());
    }catch(error:any){
      if(!stage?.confirmed){bet.state='aborted';bet.reason=String(error.message||error);await clearOwnStage();}
      else{bet.state='uncertain';bet.reason=String(error.message||error);}
      stop(`${p.tableName} ${bet.reason}`);
    }finally{stage=null;}
  }
  async function wave(){
    const run=generation,r=report();if(!r)throw Error('MT原生觀察模組已移除');status(r);
    if(!running)return;
    if(!r.tableViewport?.tables?.length){stop('已離開多台頁，停止新增操作');return;}
    const rows:any[]=r.tableViewport.tables;
    const wanted=new Set(selectedNames(r));
    const candidates=rows.filter(x=>wanted.has(x.name)).map(x=>preview(r,x.name,state.config.provider,Date.now()));
    const limit=state.config.rooms==='all'?rows.length:state.config.rooms;
    const busyNames=new Set(pending().map(b=>b.tableName));
    for(const p of candidates){
      if(!running||run!==generation||pending().length>=limit)break;
      if(!isEligible(p)||busyNames.has(p.tableName)||state.bets.some(b=>b.key===`${p.tableName}|${p.roundKey}`)||existingNative(r,p))continue;
      if(mode()!=='flat'&&pending().length)break;
      await execute(p,r,run);busyNames.add(p.tableName);
      if(testOnce&&pending().length)break;
    }
    if(running)message=pending().length?`執行中｜待接受/待結算 ${pending().length} 桌`:'執行中｜等待有完整牌路的可下注桌';
  }
  async function tick(){
    if(disposed||active)return;
    const operation=(async()=>{try{if(running)await wave();else status(report());}catch(e:any){stop(String(e.message||e));}})();
    active=operation;
    try{await operation;}finally{if(active===operation)active=null;onChange();}
  }
  const interference=(event:Event)=>{
    if(!stage||!event.isTrusted)return;
    const e=event.target as Element;
    if(e?.closest('.gameDesk_bet,.gameDesk_bet_section,[class*="chip-"]')){stage.interference=true;stop('偵測到手動下注操作，保留畫面並停止自動操作');}
  };
  const visibility=()=>{if(D.hidden&&running)stop('頁面進入背景；停止新增操作，返回後需手動開始');};
  D.addEventListener('pointerdown',interference,true);D.addEventListener('visibilitychange',visibility);
  const timer=W.setInterval(()=>void tick(),600);
  async function halt(){stop();if(active)await active;}
  async function dispose(){await halt();disposed=true;W.clearInterval(timer);D.removeEventListener('pointerdown',interference,true);D.removeEventListener('visibilitychange',visibility);if(previousSocketSend&&W.WebSocket.prototype.send===nativeSend)W.WebSocket.prototype.send=previousSocketSend;}
  function view(){
    const r=report(),rows=r?.tableViewport?.tables||[];
    const current=pending()[0];
    return {running,busy:!!active,message,config:{...copy(state.config),staking:mode()},nextAmount:current?.amount??previewAmount(),pnl:pnl(),level:state.level,pending:pending().length,bets:copy(state.bets),sessionBets:copy(state.bets.slice(state.sessionStart)),selectedNames:selectedNames(r),balance:typeof r?.betObservation?.memberBalance==='number'&&Number.isFinite(r.betObservation.memberBalance)?r.betObservation.memberBalance:null,logs:copy(logs),previews:rows.map((x:any)=>preview(r,x.name,state.config.provider,Date.now()))};
  }
  return {configure,start,stop,halt,dispose,tick,view,state:()=>copy(state),subscribe:(fn:()=>void)=>{onChange=fn;},isBusy:()=>!!active,money};
}
