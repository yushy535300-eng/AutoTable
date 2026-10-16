import {createDgRiskInputDrafts} from './dg-risk-inputs';
import { DG_SETTINGS_EVENT, DG_SETTINGS_SYNC_EVENT, DG_SETTINGS_VERSION, type DgSettingsSnapshot } from '../shared/dg-settings-snapshot';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import { createDgUsageHistory, usageHistoryInPeriod, type DgUsageRunView } from './dg-usage-history';
import { DG_USAGE_REPORT_EVENT, dgUsageReportSchema, type DgUsageReport, type DgUsageStopCode } from '../shared/dg-usage-report';
import { dgBetSummary } from './dg-bet-summary';
import { createDgSessionTimer, parseDurationMinutes, formatDuration } from './dg-session-timer';
import { installDgPanelTouchScroll } from './dg-panel-touch-scroll';
import {readDgSceneNodes,dgSceneNodeVisible,findDgScenePlayer,dgSceneWallet,describeDgScene} from './dg-scene';
import {createDgPokerTracker} from './poker-strategies';
import {DgBetLedger, stakingAmount, type DgBet, type DgScope} from './dg-bet-ledger';
import {localProviderDecision,getPatternInfo,providerAnalysisText,AI_PROVIDER_OPTIONS} from './dg-original-ai';
import {DG_PANEL_HTML} from './dg-panel-view';
import {cumulativePoints,chartSummary, periodBets,rangePosition,knownPoker,pokerRank,pokerPoint} from './dg-panel-data';
import {checkDgAmount} from './dg-limit-check';
import {parseRiskLimits,riskStopReason,nextStakeRiskCheck,type DgRiskLimits} from './dg-risk-limits';
import {syncDgTables,selectOpenDgTables} from './dg-table-selection';
import {installDgButtonFeedback} from './dg-button-feedback';
import {installDgPanelResize} from './dg-panel-resize';
import {installDgProviderMenu} from './dg-provider-menu';
import {createDgOfficialTurnover} from './dg-official-turnover';
import {renderOfficialTurnover} from './official-turnover-panel';
import {inspectDgMobileNativeSurface,isDgMultiLobbyCard,getDgBetControls,dgNativeBetEnabled,hasDgVerifiedMobilePacketBuilder} from './dg-mobile-native';
import {exportDgMobileLoadedPublicScripts} from './dg-mobile-public-source';

declare global {interface Window {Laya:any;__DG_SINGLEPAGE__?:any;__DG_LEDGER_STATE__?:any;__DG_LEDGER_PERSIST_KEY__?:string;}}
(() => {
  const previous=window.__DG_SINGLEPAGE__;
  if(previous?.dispose)previous.dispose();
  const L=window.Laya;
  if(!L?.stage?.getChildAt){console.error('[DG] 目前不是載入完成的 DG Laya 頁面。請選擇 DG 分頁／Console 執行環境。');return;}
  const ledger=new DgBetLedger();
  const pokerTracker=createDgPokerTracker();
  const sessionTimer=createDgSessionTimer();
  const usageHistory=createDgUsageHistory();
  let running=false,busy=false,disposed=false,epoch=0,once=false;
  let base=100,scope:DgScope='global',provider:any='combined',roomCount='1',maxStake=100000,minSeconds=6;
  let singleStaking:'martingale'|'flat'|'doubling'='martingale',userZoom=1;
  let startMode:'fresh'|'resume'='fresh';
  let runEventId='',settingsSyncState='not-started';
  let activeSettings:DgSettingsSnapshot|null=null;
  let panelWidth=280,panelHeight=560,lastRenderedEvents='';
  let riskLimits:DgRiskLimits={stopLoss:null,takeProfit:null};
  let riskApproved=false,riskTestOnce=false,riskReturnFocus:HTMLElement|null=null;
  let mini=false,miniPreviousCompact=true;
  let manualSelection=false;
  let selected=new Set<string>(),status='停止：先讀取 DG 單頁多桌資料';
  let socket:any=null,account:any=null;
  let walletPlayer:any=null;
  let nativeBetKey='',originalSend:any=null,sendObserver:any=null;
  const owner={},logs:string[]=[],contexts=new Map<string,any>();
  let persistKey='';
  let compact=true,reportPeriod:'today'|'yesterday'|'week'='today',reportPage=0,reportTab:'bets'|'transactions'|'usage'='bets';
  const tableWait=new Map<string,string>(),lastNotice=new Map<string,string>();
  const watchedRounds=new Map<string,{gameNo:string;round:string;closed:boolean;reason:string}>();
  const usageReportableRuns=new Set<string>(),usageReportSequences=new Map<string,number>(),usageReportLastReports=new Map<string,DgUsageReport>(),usageReportLastSentAt=new Map<string,number>(),usageStopCodes=new Map<string,DgUsageStopCode>();
  const usageReportIntervalMs=20000;
  const money=(n:number)=>n.toLocaleString('zh-TW');
  function persistUsage(){
    usageHistory.sync(ledger.state.bets);
    try{if(persistKey)localStorage.setItem(persistKey+'.usage.v1',JSON.stringify(usageHistory.snapshot()));}catch{/* Browser storage unavailable: keep this page's history in memory. */}
  }
  // This is intentionally separate from usage history. Only a v5 run which this page
  // actually started is added here; legacy history is display-only and never backfilled.
  function persistUsageCheckpoint(){
    if(!persistKey)return;
    const known=new Set(usageHistory.view().map(run=>run.id));
    const runs=[...usageReportableRuns].filter(id=>known.has(id)).map(runId=>({runId,nextSequence:usageReportSequences.get(runId)??0,lastReport:usageReportLastReports.get(runId)??null,stopCode:usageStopCodes.get(runId)??null}));
    try{localStorage.setItem(persistKey+'.usage.v5.checkpoint',JSON.stringify({version:1,statementVersion:DG_RISK_STATEMENT.version,runs}));}catch{/* The report remains page-local when storage is unavailable. */}
  }
  function markUsageReportable(runId:string){usageReportableRuns.add(runId);usageReportSequences.set(runId,0);persistUsageCheckpoint();}
  function restoreUsageCheckpoint(){
    usageReportableRuns.clear();usageReportSequences.clear();usageReportLastReports.clear();usageStopCodes.clear();
    if(!persistKey)return;
    try{
      const saved=JSON.parse(localStorage.getItem(persistKey+'.usage.v5.checkpoint')??'null');
      if(saved?.version!==1||saved?.statementVersion!==DG_RISK_STATEMENT.version||!Array.isArray(saved.runs))return;
      const known=new Set(usageHistory.view().map(run=>run.id));
      for(const value of saved.runs){
        const runId=typeof value?.runId==='string'?value.runId:'';
        const parsed=dgUsageReportSchema.safeParse(value?.lastReport);
        const nextSequence=value?.nextSequence;
        if(!known.has(runId)||!parsed.success||parsed.data.runId!==runId||!Number.isSafeInteger(nextSequence)||nextSequence<parsed.data.sequence+1)continue;
        usageReportableRuns.add(runId);usageReportSequences.set(runId,nextSequence);usageReportLastReports.set(runId,parsed.data);
        if(parsed.data.status==='stopped'&&parsed.data.stopCode)usageStopCodes.set(runId,parsed.data.stopCode);
        if(value?.stopCode&&['manual','time_limit','stop_loss','take_profit','stake_cap','other'].includes(value.stopCode))usageStopCodes.set(runId,value.stopCode);
      }
    }catch{/* Malformed or inaccessible checkpoints never make legacy history reportable. */}
  }
  function usageStopCode(reason:string):DgUsageStopCode{
    if(/已達設定|時間/.test(reason))return 'time_limit';
    if(/止損/.test(reason))return 'stop_loss';
    if(/止盈/.test(reason))return 'take_profit';
    if(/超過.*上限|上限.*超過/.test(reason))return 'stake_cap';
    if(/^已停止/.test(reason))return 'manual';
    return 'other';
  }
  function reportUsage(runId:string,force=false,keepalive=false){
    if(!usageReportableRuns.has(runId))return;
    const at=Date.now(),last=usageReportLastSentAt.get(runId)??0;
    if(!force&&at-last<usageReportIntervalMs)return;
    const run=usageHistory.view().find(item=>item.id===runId) as DgUsageRunView|undefined;
    if(!run)return;
    const sequence=usageReportSequences.get(runId)??0;
    const status=run.state==='stopped'?'stopped':run.state==='interrupted'?'interrupted':'active';
    const report:DgUsageReport={version:1,runId,settingsEventId:runId,sequence,status,stopCode:status==='stopped'?(usageStopCodes.get(runId)??'other'):null,startedAt:run.createdAt,updatedAt:run.updatedAt,
      endedAt:status==='stopped'?run.endedAt:null,elapsedMs:Math.floor(run.elapsedMs),durationMinutes:run.minutes,eventCounts:run.eventCounts,
      result:{settledPnl:run.pnl,settledCount:run.settledCount,wins:run.wins,losses:run.losses,pendingCount:run.pendingCount,uncertainCount:run.uncertainCount}};
    try{window.dispatchEvent(new CustomEvent(DG_USAGE_REPORT_EVENT,{detail:{report,keepalive}}));usageReportSequences.set(runId,sequence+1);usageReportLastReports.set(runId,report);usageReportLastSentAt.set(runId,at);persistUsageCheckpoint();}catch{/* Parent recorder may be unavailable; local history stays intact. */}
  }
  function reportUsageForBet(key:string){for(const run of usageHistory.view())if(usageReportableRuns.has(run.id)&&Object.prototype.hasOwnProperty.call(run.bets,key))reportUsage(run.id,true);}
  function finishUsage(stopCode:DgUsageStopCode='other'){sessionTimer.stop();const finished=usageHistory.finish(sessionTimer.view().elapsedMs);persistUsage();if(finished){usageStopCodes.set(finished,stopCode);persistUsageCheckpoint();reportUsage(finished,true);}}
  function persist(){
    if(persistKey){window.__DG_LEDGER_STATE__=ledger.state;window.__DG_LEDGER_PERSIST_KEY__=persistKey;}persistUsage();
    try{if(persistKey)sessionStorage.setItem(persistKey,JSON.stringify(ledger.state));}catch{/* 帳本仍保留於當前頁面 */}
  }
  function log(text:string){status=text;logs.unshift(`${new Date().toLocaleTimeString('zh-TW',{hour12:false})} ${text}`);logs.length=Math.min(logs.length,50);console.log('[DG]',text);render();}
  function stop(reason='已停止；已送出的下注仍等待平台結算') {finishUsage(usageStopCode(reason));running=false;once=false;riskApproved=false;epoch++;q('risk-dialog').hidden=true;log(reason);}
  function stopIfTimeExpired(){
    if(!running||!sessionTimer.expired())return false;
    stop(`已達設定 ${sessionTimer.view().minutes} 分鐘，停止新增下注；已接受注單繼續等待結算`);
    return true;
  }
  function userStatus(text:string){
    let value=text.replace(/\b\d{10,}\b/g,'');
    for(const c of boards())value=value.replaceAll(String(c.tableId)+'｜',(c.gameInfo.tableName||String(c.tableId))+'｜');
    value=value.replace(/｜[^｜]*｜已直接傳送 cmd 6：[\s\S]*/,'：已送出，等待確認');
    value=value.replace(/｜[^｜]*｜平台已接受下注｜/,'：下注成功 ');
    value=value.replace(/｜[^｜]*｜結算 /,'：結算 ');
    if(/已接上 DG 原生/.test(value))return '已連線，尚未開始';
    if(/^找到 /.test(value)){const wanted=value.match(/要求 (\d+) 桌/);return `已選 ${selected.size} 桌${wanted?`（要求 ${wanted[1]} 桌，等待補足）`:'，可設定後開始'}`;}
    if(/^同時 \d+ 桌啟動/.test(value))return `${selected.size} 桌執行中，各桌獨立下注`;
    if(/^測試一筆完整/.test(value))return '測試一筆：等待下注確認';
    if(/金額 .* 低於平台最低/.test(value))return value.replace(/金額 (\d+) 低於平台最低 (\d+)[\s\S]*/,'金額 $1 低於最低 $2，未下注');
    if(/莊閒限額尚未同步/.test(value))return value.split('｜')[0]+'：等待下注限額';
    return value.replace('DG ','').replace('cmd 6','下注').replace('封包','連線資料').replace('global','共用帳本').replace('工作階段','連線').replace('保留本局鎖定，不重送','請核對下注紀錄，不重送');
  }
  function waitTable(card:any,reason:string){
    const id=String(card.tableId);tableWait.set(id,reason);
    const signature=String(card.gameInfo?.gameNo)+'|'+reason;
    if(lastNotice.get(id)!==signature){lastNotice.set(id,signature);log(`${card.gameInfo?.tableName||id}｜${reason}`);}
  }
  function currentRoundState(card:any){
    const id=String(card.tableId),gameNo=String(card.gameInfo?.gameNo??'');
    const bet=ledger.state.bets.find(b=>b.key===`${id}:${gameNo}`);
    if(bet)return {label:bet.state==='accepted'?'已接受 · 待結算':bet.state==='settled'?'已下注 · 已結算':bet.state==='rejected'?'下注被拒絕':bet.state==='uncertain'?'回覆未確定':bet.state==='aborted'?'未送出':'已送出 · 待確認',ok:bet.state==='accepted'||bet.state==='settled'};
    if(ledger.pending().some(b=>b.tableId===id))return {label:'上一筆待結算',ok:false};
    const limit=checkDgAmount(card,stakeAmount(id));if(!limit.ok)return {label:userStatus(limit.reason),ok:false};
    if(Number(card.gameInfo?.stateId)!==1)return {label:'本局已封盤／未開放',ok:false};
    if(remaining(card)<minSeconds)return {label:'剩餘時間不足，未下注',ok:false};
    if(!dgNativeBetEnabled(card))return {label:'原生確認尚在鎖定，未下注',ok:false};
    const decision=strategyFor(card);if(!decision.side)return {label:decision.reason||'策略資料不足，未下注',ok:false};
    return {label:tableWait.get(id)?userStatus(tableWait.get(id)!):running?'準備送出':'已停止',ok:false};
  }
  function trackRounds(cards:any[]){
    if(!running)return;
    for(const c of cards.filter(c=>selected.has(String(c.tableId)))){
      const id=String(c.tableId),gameNo=String(c.gameInfo?.gameNo??'');if(!gameNo)continue;
      let watched=watchedRounds.get(id);
      function finish(){
        if(!watched||watched.closed)return;
        watched.closed=true;
        const bet=ledger.state.bets.find(b=>b.key===`${id}:${watched!.gameNo}`);
        if(!bet||bet.state==='aborted'||bet.state==='rejected')log(`${c.gameInfo.tableName||id} 第${watched.round}局未下到：${watched.reason}`);
      }
      if(watched&&watched.gameNo!==gameNo){finish();watched=undefined;watchedRounds.delete(id);tableWait.delete(id);}
      if(!watched&&Number(c.gameInfo?.stateId)===1){watched={gameNo,round:String(c.gameInfo.playId??'—'),closed:false,reason:''};watchedRounds.set(id,watched);}
      if(watched&&watched.gameNo===gameNo){const state=currentRoundState(c);if(Number(c.gameInfo?.stateId)===1)watched.reason=state.label;else finish();}
    }
  }
  const visible=dgSceneNodeVisible;
  function nodes(){return readDgSceneNodes(L.stage);}
  function boards(all=nodes()){
    const unique=new Map<string,any>();
    for(const n of all){
      // The real mobile V3.2.9 cards own betBtnMan, not PC betMan.
      // Mobile is supported only for the exact evidenced native builders;
      // single-room or unknown mobile packet builders remain excluded.
      if(isDgMultiLobbyCard(n)&&visible(n)&&(getDgBetControls(n)?.profile!=='mobile-v329'||hasDgVerifiedMobilePacketBuilder(n))){
        const k=String(n.tableId);if(!unique.has(k))unique.set(k,n);
      }
    }
    return [...unique.values()].sort((a,b)=>Number(a.tableId)-Number(b.tableId));
  }
  function remaining(n:any){
    const info=n.gameInfo;
    let result=Number(info.countDown);
    if(info.starTime!=null&&Number.isFinite(Number(info.starTime))){
      const now=L.Browser?.now?.()??Date.now();
      result-=Math.max(0,(now-Number(info.starTime))/1000);
    }
    const text=String(n.countDownMan?.countDown??n.countDownMan?.text??'').trim();
    if(/^\d+$/.test(text))result=Math.min(result,Number(text));
    return Number.isFinite(result)?Math.max(0,result):0;
  }
  function ready(n:any){return visible(n)&&Number(n.gameInfo?.stateId)===1&&remaining(n)>=minSeconds&&dgNativeBetEnabled(n)&&visible(n.betBtn?.Banker)&&visible(n.betBtn?.Player)&&n.betBtn.Banker.mouseEnabled!==false&&n.betBtn.Player.mouseEnabled!==false;}
  function roads(n:any):Array<'莊'|'閒'|'和'>{
    // bundle showAllRoad walks roadArray from length-1 down to 0: newest first in memory.
    if(!Array.isArray(n.gameInfo.roadArray))return [];
    return [...n.gameInfo.roadArray].reverse().map((r:any)=>{
      const x=r?.road;
      const v=Number(Array.isArray(x)?x[0]:typeof x==='string'?x.split(',')[0]:NaN);
      return v>=1&&v<=4?'莊':v>=5&&v<=8?'閒':v>=9&&v<=12?'和':null;
    }).filter((x:any)=>x!==null) as Array<'莊'|'閒'|'和'>;
  }
  function strategyFor(card:any,key=provider):{side?:'莊'|'閒';confidence:number;reason?:string}{
    if(key==='counting'||key==='parity'){
      const result=pokerTracker.decision(card,key);
      return result.ok?result:{confidence:0,reason:result.reason};
    }
    const results=roads(card);
    if(results.filter(x=>x!=='和').length<3)return {confidence:0,reason:'等待至少3筆莊閒牌路'};
    return localProviderDecision(key,results);
  }
  function sameSession(b:any){return b.playerInfo===account&&b.playerInfo?.socketMan===socket&&socket?.socket?.connected!==false;}
  function attach(all:any[]){
    const p=findDgScenePlayer(all);walletPlayer=p;
    if(!p?.socketMan?.on||!p?.socketMan?.off)return;
    if(account&&p!==account){stop('DG 工作階段改變，請重新載入腳本');return;}
    if(socket===p.socketMan)return;
    socket?.off('RECEIVED_SUCCESS',owner,onMessage);
    socket=p.socketMan;account=p;
    const ident=String(p.mid??p.playerName??'session')+'|'+String(p.currency??'');
    let h=2166136261;for(const ch of ident)h=Math.imul(h^ch.charCodeAt(0),16777619);
    persistKey=`dg.singlepage.ledger.v1.${h>>>0}`;
    let savedLedger:any=null;
    try{const saved=JSON.parse(sessionStorage.getItem(persistKey)??'null');if(saved?.version===1)savedLedger=saved;}catch{/* 不接受破損的歷史帳本 */}
    const scopedMemory=window.__DG_LEDGER_PERSIST_KEY__===persistKey?window.__DG_LEDGER_STATE__:null;
    ledger.state=new DgBetLedger(savedLedger??scopedMemory).state;
    try{usageHistory.load(JSON.parse(localStorage.getItem(persistKey+'.usage.v1')??'null'));}catch{usageHistory.load(null);}
    restoreUsageCheckpoint();
    ledger.state.roundStartedAt??=mountedAt;
    migrateSingleChain();
    for(const bet of ledger.pending())if(bet.state==='submitted'||bet.state==='reserved')bet.state='uncertain';
    originalSend=socket.sendData;
    sendObserver=function(this:any,msg:any,...args:any[]){
      if(Number(msg?.cmd)===6){
        const key=`${msg.tableId}:${msg.gameNo}`;
        const bet=ledger.pending().find(b=>b.key===key);
        if(bet&&nativeBetKey!==key){
          bet.attributionUncertain=true;bet.state='uncertain';persist();stop('偵測同局額外下注；本筆損益不能單獨核對，停止配注推進');
        }
      }
      return originalSend.call(this,msg,...args);
    };
    socket.sendData=sendObserver;
    socket.on('RECEIVED_SUCCESS',owner,onMessage);persist();
    log('已接上 DG 原生回覆／結算事件；未執行下注');
  }
  function onMessage(msg:any){
    if(disposed)return;
    queueMicrotask(()=>{if(!disposed)pokerTracker.observe(boards());});
    const receipt=ledger.receipt(msg);
    if(receipt){
      persist();log(`${receipt.bet.tableId}｜${receipt.bet.gameNo}｜${receipt.accepted?'平台已接受下注':'平台拒絕或金額不符，未標示成功'}｜${receipt.bet.side} ${money(receipt.bet.amount)}`);
      reportUsageForBet(receipt.bet.key);
      if(!receipt.accepted)stop('本筆下注未確認接受，已停止；不自動重送');
      if(once){finishUsage();running=false;once=false;}
    }
    const settled=ledger.settle(msg);
    if(settled){
      if(settled.bet.scope==='table'&&settled.bet.staking!=='flat'&&roomCount==='1')ledger.state.levels.global=settled.nextLevel;
      persist();log(`${settled.bet.tableId}｜${settled.bet.gameNo}｜結算 ${settled.pnl>0?'+':''}${money(settled.pnl)}｜${settled.bet.staking==='flat'?'平注：金額固定':settled.pnl>0?'贏：重置':settled.pnl<0?'輸：升階':'和／退注：維持'}｜下一注 ${money(stakeAmount(settled.bet.tableId))}`);
      reportUsageForBet(settled.bet.key);
      if(running){const reason=riskStopReason(roundPnl(),riskLimits);if(reason)stop(reason);}
      window.dispatchEvent(new CustomEvent('dg-singlepage-settlement',{detail:{...settled.bet,nextLevel:settled.nextLevel}}));
      window.setTimeout(()=>official.refresh(true),800);
    }
  }
  function migrateSingleChain(){
    if(ledger.state.levels.global!=null||ledger.pending().length)return;
    const last=ledger.state.bets.filter(b=>b.state==='settled'&&b.staking!=='flat').slice().sort((a,b)=>(a.settledAt??a.createdAt)-(b.settledAt??b.createdAt)).at(-1);
    if(last)ledger.state.levels.global=ledger.level(last.tableId,last.scope);
  }
  function desiredScope():DgScope{return roomCount==='1'&&singleStaking!=='flat'?'global':'table';}
  function stakingMode(){return roomCount==='1'?singleStaking:'flat' as const;}
  function amountLevel(tableId:string,mode:DgScope=scope){
    return stakingMode()==='flat'||(!running&&!ledger.pending().length&&startMode==='fresh')?0:ledger.level(tableId,mode);
  }
  function stakeAmount(tableId:string,amount=base,mode:DgScope=scope){return stakingAmount(amount,amountLevel(tableId,mode),stakingMode());}
  function stakeDiagnostics(){return {base:running||ledger.pending().length?base:Number(q('base').value),startMode,staking:stakingMode(),levels:{...ledger.state.levels},tables:boards().map(c=>({table:c.gameInfo.tableName,tableId:String(c.tableId),savedLevel:ledger.level(String(c.tableId),scope),effectiveLevel:amountLevel(String(c.tableId)),nextAmount:stakeAmount(String(c.tableId),!running&&!ledger.pending().length?Number(q('base').value):base)})),recentBets:ledger.state.bets.slice(-10).map(b=>({...b}))};}

  function roundBets(){const from=ledger.state.roundStartIndex;return Number.isSafeInteger(from)&&from!>=0?ledger.state.bets.slice(from).filter(b=>b.state==='settled'):ledger.state.bets.filter(b=>b.state==='settled'&&(b.settledAt??b.createdAt)>=(ledger.state.roundStartedAt??mountedAt));}
  function roundPnl(){return roundBets().reduce((sum,b)=>sum+(b.pnl??0),0);}
  function unacknowledgedFunds(){return ledger.pending().filter(b=>b.state!=='accepted').reduce((sum,b)=>sum+b.amount,0);}
  async function execute(card:any,token:number,budget:{remaining:number}){
    if(stopIfTimeExpired())return;
    const decision=strategyFor(card);if(!decision.side){waitTable(card,decision.reason||'策略資料不足');return;}
    const gameNo=String(card.gameInfo.gameNo??''),tableId=String(card.tableId);
    if(!gameNo||ledger.state.bets.some(b=>b.key===`${tableId}:${gameNo}`))return;
    if(!sameSession(card)||!ready(card))return;
    // Never combine with a manual wager or unconfirmed chips.
    if(Object.values(card.betMoneyTmp).some((v:any)=>Number(v)!==0)||Object.values(card.betMoneyTrue).some((v:any)=>Number(v)!==0)){waitTable(card,'本局已有原生下注或待確認籌碼，不混合投注');return;}
    const side=decision.side;
    const amount=stakeAmount(tableId);
    if(amount>maxStake){stop(`下一注 ${money(amount)} 超過你設定的金額上限 ${money(maxStake)}`);return;}
    if(amount>maxStake){stop(`下一注 ${money(amount)} 超過單筆上限 ${money(maxStake)}；停止新增下注`);return;}
    const riskPreflight=nextStakeRiskCheck(roundPnl(),riskLimits,ledger.pending(),amount);
    if(!riskPreflight.ok){stop(riskPreflight.reason!);return;}
    const preflight=checkDgAmount(card,amount);
    if(!preflight.ok){waitTable(card,preflight.reason);return;}
    if(amount>budget.remaining){waitTable(card,`同批可用餘額 ${money(Math.max(0,budget.remaining))} 不足 ${money(amount)}；其他桌已預留，不送出`);return;}
    tableWait.delete(tableId);lastNotice.delete(tableId);
    const bet=ledger.reserve(tableId,gameNo,side,base,scope,stakingMode());bet.provider=provider;usageHistory.addBet(bet);persist();contexts.set(bet.key,card);
    const internalSide=side==='莊'?'Banker':'Player';
    function guard(){
      if(stopIfTimeExpired())throw new Error('已達自動停止時間，沒有送出新下注');
      if((window as any).__DG_MANUAL_CAPTURE_ACTIVE__)throw new Error('手動流程記錄中，工具不送單');
      if(!running||disposed||token!==epoch||document.hidden||String(card.gameInfo.gameNo)!==gameNo||!ready(card)||!sameSession(card))throw new Error('已停止、局號改變或停止接受下注');
      const riskReason=riskStopReason(roundPnl(),riskLimits);if(riskReason)throw new Error(riskReason);
      const exposure=nextStakeRiskCheck(roundPnl(),riskLimits,ledger.pending(),amount,bet.key);if(!exposure.ok)throw new Error(exposure.reason!);
      const check=checkDgAmount(card,amount);if(!check.ok)throw new Error(check.reason);
    }
    try{
      guard();
      // Run DG's authenticated packet builder on a detached context, NOT the UI card.
      // Its lexical session random/encrypt/demo remain native. Every mutable UI
      // property/method is replaced; event() only captures the built PublicBean.
      // No chip, side, confirmation click, event dispatch, or navigation is used.
      if(typeof card.confirmBet!=='function')throw new Error('DG 版本缺少可用的原生封包建構器');
      let packet:any=null;
      const detached=Object.create(card);
      detached.betMoneyTmp=Object.fromEntries(Object.keys(card.betMoneyTmp).map(k=>[k,k===internalSide?amount:0]));
      detached.betMoneyTrue=Object.fromEntries(Object.keys(card.betMoneyTrue).map(k=>[k,0]));
      // Mobile confirmBet calls hideHover and updates betBtnMan state. Both
      // writes are isolated; never hide/mutate the user's real UI controls.
      if(getDgBetControls(card)?.profile==='mobile-v329'){
        if(!hasDgVerifiedMobilePacketBuilder(card))throw new Error('手機原生builder版本未核對，沒有傳送');
        detached.betBtn=Object.fromEntries(Object.entries(card.betBtn).map(([key,value])=>[key,Object.assign(Object.create(value as object),{hideHover:()=>{}})]));
        detached.betBtnMan=Object.assign(Object.create(card.betBtnMan),{betFlag:true,visible:false});
      }
      detached.betFlag=true;
      detached.showBetMan=()=>{};
      detached.showBetFailed=()=>{throw new Error('DG 原生驗證／封包建構失敗');};
      detached.event=(name:string,msg:any)=>{
        if(name==='BET_CHIP'&&Number(msg?.cmd)===6){
          if(packet)throw new Error('封包建構器回傳多筆下注');packet=msg;return true;
        }
        throw new Error('封包建構器回傳非預期事件');
      };
      card.confirmBet.call(detached);
      if(!packet||String(packet.tableId)!==tableId||String(packet.gameNo)!==gameNo)throw new Error('下注封包桌號／局號不符，沒有傳送');
      guard();
      ledger.submit(bet);persist();
      budget.remaining-=amount;
      nativeBetKey=bet.key;
      try{socket.sendData(packet);}finally{nativeBetKey='';}
      log(`${tableId}｜${gameNo}｜已直接傳送 cmd 6：${side} ${money(amount)}；等待平台接受回覆`);
    }catch(error){
      if(bet.state==='reserved'){
        ledger.abort(bet);
      }else ledger.uncertain(bet);
      persist();stop(String((error as Error).message));
    }
  }
  async function tick(){
    if(disposed)return;
    stopIfTimeExpired();
    if(busy)return;
    if((window as any).__DG_MANUAL_CAPTURE_ACTIVE__&&running)stop('手動流程記錄中，工具已停止');
    if(running&&roomCount==='1'&&scope==='global'&&stakeAmount('global')>maxStake)stop(`下一注 ${money(stakeAmount('global'))} 超過單筆上限 ${money(maxStake)}；停止新增下注`);
    const all=nodes();pokerTracker.observe(boards(all));attach(all);autoScan(boards(all));trackRounds(boards(all));render();
    if(socket?.socket?.connected===false&&ledger.pending().length){
      for(const b of ledger.pending())b.state='uncertain';persist();stop('DG 連線已中斷；待結算下注保留為未確定，請核對正式紀錄');
    }
    for(const b of ledger.pending()){
      if(b.state==='submitted'&&Date.now()-(b.submittedAt??b.createdAt)>12000){ledger.uncertain(b);persist();stop('下注回覆逾時；保留本局鎖定，不重送');}
      if(running&&b.state==='accepted'&&Date.now()-(b.acceptedAt??b.createdAt)>180000)stop('平台結算逾時；已停止，保留待結算帳本');
    }
    if(!running||!socket||document.hidden)return;
    const riskReason=riskStopReason(roundPnl(),riskLimits);if(riskReason){stop(riskReason);return;}
    const cards=boards(all).filter(c=>selected.has(String(c.tableId)));
    // Multiple authenticated packets in one scan, without waiting for any other
    // table's receipt or settlement. The socket itself still serializes bytes.
    const budget={remaining:Math.max(0,Number(account?.balance??0)-unacknowledgedFunds())};
    const current=epoch;busy=true;
    try{for(const card of cards){
      if(!running||epoch!==current)break;
      if(ledger.pending().some(b=>scope==='global'||b.scope==='global'||b.tableId===String(card.tableId)))continue;
      if(ready(card))await execute(card,current,budget);
      if(once&&ledger.pending().length)break;
    }}catch(e){stop(String((e as Error).message));}finally{busy=false;}
  }
  const host=document.createElement('div');host.id='__dg_singlepage_panel__';document.body.appendChild(host);
  const shadow=host.attachShadow({mode:'open'});
  shadow.innerHTML=DG_PANEL_HTML;
  const cleanupFeedback=installDgButtonFeedback(shadow);
  const cleanupTouchScroll=installDgPanelTouchScroll(shadow);
  const mountedAt=Date.now();
  let summarySince=mountedAt;
  const q=(id:string)=>shadow.getElementById(id) as any;
  q('panel').classList.toggle('compact',compact);
  q('count').value=q('parallel-count').value=roomCount;
  const riskInputDrafts=createDgRiskInputDrafts(stakingMode());
  const initialRiskInputs=riskInputDrafts.initial();
  q('stop-loss').value=initialRiskInputs.stopLoss;
  q('take-profit').value=initialRiskInputs.takeProfit;
  function syncRiskInputMode(){
    const values=riskInputDrafts.switchTo(stakingMode(),{stopLoss:q('stop-loss').value,takeProfit:q('take-profit').value});
    q('stop-loss').value=values.stopLoss;q('take-profit').value=values.takeProfit;
  }
  for(const option of AI_PROVIDER_OPTIONS){const el=document.createElement('option');el.value=option.key;el.textContent=option.label;q('provider').appendChild(el);}q('provider').value=provider;
  const providerMenu=installDgProviderMenu(shadow,AI_PROVIDER_OPTIONS);
  const official=createDgOfficialTurnover(window,()=>account,()=>!busy);
  function selectionLocked(){return running||busy||ledger.pending().length>0;}
  function openForAuto(card:any){
    const id=String(card.tableId),gameNo=String(card.gameInfo?.gameNo??'');
    if(!gameNo||!ready(card)||!sameSession(card))return false;
    if(ledger.state.bets.some(b=>b.key===`${id}:${gameNo}`))return false;
    if(roads(card).filter(x=>x!=='和').length<3)return false;
    if(Object.values(card.betMoneyTmp).some(v=>Number(v)!==0)||Object.values(card.betMoneyTrue).some(v=>Number(v)!==0))return false;
    const amount=stakeAmount(id);
    return amount<=maxStake&&checkDgAmount(card,amount).ok;
  }
  function autoScan(cards:any[]){
    if(manualSelection||(!q('rooms-page').hidden&&!running))return;
    const pending=ledger.pending().map(b=>b.tableId);
    const eligible=cards.filter(openForAuto).map(c=>String(c.tableId));
    const ids=running?selectOpenDgTables(eligible,pending,roomCount as '1'|'3'|'5'|'all'):
      syncDgTables(eligible.length?eligible:cards.map(c=>String(c.tableId)),[...selected],pending,roomCount as '1'|'3'|'5'|'all');
    if(ids.length===selected.size&&ids.every(id=>selected.has(id)))return;
    selected=new Set(ids);renderRooms();
    log(`自動找桌：已選 ${selected.size} 桌；有可下注空位就執行`);
  }
  function selectCount(value:string){
    if(!['1','3','5','all'].includes(value))return;
    if(selectionLocked()){q('count').value=q('parallel-count').value=roomCount;log('先停止並等已送出下注結算，才能變更同時桌數');return;}
    roomCount=value;scope=desiredScope();syncRiskInputMode();q('count').value=q('parallel-count').value=value;if(manualSelection&&value!=='all')selected=new Set([...selected].slice(0,Number(value)));scan();
  }
  function scan(){
    if(selectionLocked()){log('先停止並等已送出下注結算，才能變更桌台或策略');return;}
    const cards=boards(),limit=roomCount==='all'?cards.length:Number(roomCount);if(!manualSelection)selected=new Set(cards.slice(0,limit).map(c=>String(c.tableId)));autoScan(cards);
    log(cards.length?`找到 ${cards.length} 個單頁桌台；同時選中 ${selected.size} 桌${roomCount!=='all'&&selected.size<limit?`（要求 ${limit} 桌，目前僅載入 ${selected.size} 桌）`:''}`:'尚未找到 DG 單頁多桌資料；請開啟 DG 多台或右側好路下注面板');renderRooms();
  }
  function renderRooms(){
    q('rooms').replaceChildren();for(const c of boards()){
      const button=document.createElement('button'),id=String(c.tableId);button.className='room'+(selected.has(id)?' active':'');
      button.setAttribute('aria-pressed',String(selected.has(id)));button.disabled=selectionLocked();
      const title=document.createElement('span');title.className='room-title';
      const name=document.createElement('strong');name.textContent=c.gameInfo.tableName||id;
      const check=document.createElement('span');check.className='room-check';check.textContent='✓';check.setAttribute('aria-hidden','true');title.append(name,check);
      const detail=document.createElement('span');detail.className='room-detail';detail.textContent=selected.has(id)?'已選擇 · 獨立計算方向':'點選加入下注範圍';button.append(title,detail);
      button.onclick=()=>{
        if(selectionLocked())return;
        if(selected.has(id)){manualSelection=true;selected.delete(id);}
        else if(roomCount==='all'||selected.size<Number(roomCount)){manualSelection=true;selected.add(id);}
        else{log(`同時 ${roomCount} 桌已滿，先取消一桌再選其他桌`);return;}
        renderRooms();render();
      };q('rooms').appendChild(button);
    }
  }
  function start(testOnce=false){
    if(running){log('目前仍在執行，請先停止再重新開始；使用時間不重設');return;}
    if((window as any).__DG_MANUAL_CAPTURE_ACTIVE__){log('手動流程記錄中，不能開啟自動下注');return;}
    if(busy){log('上一流程尚未退出，請稍候再開始');return;}
    if(!riskApproved){requestStart(testOnce);return;}
    riskApproved=false;
    if(startMode==='fresh'&&ledger.pending().length){log('新開始須等待所有已送出單結算；可選續接，但不清除待結算單');return;}
    if(ledger.pending().some(b=>b.state==='uncertain')){log('有未能核對的下注，保持停止；請先查看 DG 正式下注紀錄');return;}
    let durationMinutes:number;
    try{durationMinutes=parseDurationMinutes(q('duration-minutes').value);}catch(e){log((e as Error).message);return;}
    let nextRisk:DgRiskLimits;
    try{nextRisk=parseRiskLimits(q('stop-loss').value,q('take-profit').value);}catch(e){log((e as Error).message);return;}
    if(ledger.pending().length&&(nextRisk.stopLoss!==riskLimits.stopLoss||nextRisk.takeProfit!==riskLimits.takeProfit)){log('待結算期間不能改止損／止盈');return;}
    if(stakingMode()==='martingale'&&(nextRisk.stopLoss===null||nextRisk.stopLoss<2600)){log('馬丁配注須設定止損，最低 2,600；沒有開始');return;}
    const riskReason=riskStopReason(startMode==='fresh'?0:roundPnl(),nextRisk);if(riskReason){log(riskReason+'；全數結算後可選新開始重設本輪');return;}
    const nextBase=Number(q('base').value),nextScope:DgScope=desiredScope(),nextProvider=q('provider').value;
    if(ledger.pending().length&&(nextBase!==base||nextScope!==scope||nextProvider!==provider)){log('待結算期間不能改基本金額、策略或帳本');return;}
    if(!Number.isSafeInteger(nextBase)||nextBase<=0){log('基本單注必須是正整數');return;}
    if(!AI_PROVIDER_OPTIONS.some(x=>x.key===nextProvider)){log('推薦來源無效，沒有開始');return;}
    const nextStaking=stakingMode();
    attach(nodes());
    if(!boards().length){log('尚未辨識原生多桌卡片，沒有開始；請匯出 DG 連線診斷');return;}
    if(!socket||socket.socket?.connected===false){log('原生遊戲連線尚未就緒，沒有開始');return;}
    if(dgSceneWallet(walletPlayer)===null){log('原生餘額尚未同步，沒有開始');return;}
    if(ledger.pending().length&&nextStaking!==stakingMode()){log('等待下注結算後才能變更配注方式');return;}
    if(roomCount==='1')singleStaking=nextStaking;
    maxStake=Number(q('cap').value);if(!Number.isSafeInteger(maxStake)||maxStake<nextBase){log('單筆上限必須不小於基本單注');return;}
    base=nextBase;scope=nextScope;provider=nextProvider;
    riskLimits=nextRisk;
    if(!selected.size)scan();if(!selected.size&&manualSelection){log('指定桌模式尚未選桌；先選桌或切回自動找桌');return;}
    if(roomCount!=='1'&&ledger.pending().some(b=>b.scope==='global')){log('舊版共用帳本仍有待結算下注；先等正式結算再開始同時多桌');return;}
    if(startMode==='fresh'){ledger.resetLevels();ledger.state.roundStartIndex=ledger.state.bets.length;ledger.state.roundStartedAt=Date.now();persist();log(`新開始：基本單注 ${money(base)}，配注從第1階開始；下注紀錄保留`);}
    summarySince=Date.now();
    runEventId=usageHistory.begin(durationMinutes);
    markUsageReportable(runEventId);
    sessionTimer.start(durationMinutes);persistUsage();
    running=true;once=testOnce;epoch++;
    activeSettings={version:DG_SETTINGS_VERSION,gamePlatform:'DG',runMode:testOnce?'once':'continuous',startMode,provider,tableCount:roomCount as '1'|'3'|'5'|'all',selectionMode:manualSelection?'manual':'auto',selectedTables:boards().filter(c=>selected.has(String(c.tableId))).map(c=>({tableId:String(c.tableId),tableName:String(c.gameInfo.tableName||c.tableId)})),baseAmount:base,staking:stakingMode(),maxStake,stopLoss:riskLimits.stopLoss,takeProfit:riskLimits.takeProfit,durationMinutes,minSeconds,currency:String(account?.currency??'UNKNOWN')};
    settingsSyncState='pending';
    try{window.dispatchEvent(new CustomEvent(DG_SETTINGS_EVENT,{detail:{eventId:runEventId,settings:JSON.parse(JSON.stringify(activeSettings))}}));}
    catch{settingsSyncState='failed';}
    reportUsage(runEventId,true);
    log(testOnce?'測試一筆完整流程（不是多桌批次）':roomCount==='1'&&stakingMode()!=='flat'?`同時 1 桌啟動：跨房間接續${stakingMode()==='doubling'?'倍投法':'馬丁'}，結算後才找下一桌`:`同時 ${selected.size} 桌啟動：各桌固定平注，不等其他桌結算`);void tick();
  }
  function showPage(name:'overview'|'settings'|'logs'|'rooms'){
    providerMenu.close();
    if(mini&&name!=='overview')setMini(false);
    for(const page of ['overview','settings','logs','rooms'])q(page+'-page').hidden=page!==name;
    for(const page of ['overview','settings','logs'])q('nav-'+page).classList.toggle('active',page===name);
    fitPanel();
  }
  function fitPanel(){
    const top=host.getBoundingClientRect().top;
    const overlay=!q('risk-dialog').hidden||!q('report-shell').hidden;
    const width=mini&&!overlay?210:panelWidth;
    const widthScale=Math.min(userZoom,(window.innerWidth-24)/width);
    const fullHeight=Math.min(panelHeight,Math.max(280,(window.innerHeight-top-16)/Math.max(.2,widthScale)));
    host.style.setProperty('--full-height',fullHeight+'px');
    host.style.setProperty('--full-width',panelWidth+'px');
    const height=mini&&!overlay?Math.max(228,q('panel').scrollHeight):fullHeight;
    const scale=Math.min(widthScale,(window.innerHeight-top-12)/height);
    host.style.setProperty('--fit',String(Math.max(.2,scale)));
    q('zoom-label').textContent=`${Math.round(scale*100)}%`;
  }
  function render(){
    if(disposed)return;
    renderOfficialTurnover(shadow,official.view());
    const usage=sessionTimer.view();
    if(usageHistory.updateElapsed(usage.elapsedMs))persistUsage();
    if(running&&runEventId)reportUsage(runEventId);
    q('session-elapsed').textContent=usage.elapsedText;
    const lastUsage=usageHistory.view().find(r=>r.state!=='active');
    q('last-usage').textContent=lastUsage?`上次 ${lastUsage.elapsedText} · 已結算輸贏 ${lastUsage.pnl>0?'+':''}${money(lastUsage.pnl)}${lastUsage.pendingCount?' · 待結算 '+lastUsage.pendingCount:''}${lastUsage.uncertainCount?' · 未確定 '+lastUsage.uncertainCount:''}`:'尚無上次使用紀錄';
    q('last-usage').title=q('last-usage').textContent;
    const limit=usage.started?usage.minutes: (()=>{try{return parseDurationMinutes(q('duration-minutes').value);}catch{return null;}})();
    q('session-remaining').textContent=usage.started&&usage.remainingMs!==null?`剩餘 ${formatDuration(usage.remainingMs)}`:limit===null?'時限格式錯誤':limit?`設定 ${limit} 分鐘`:'不限時';
    q('duration-minutes').disabled=selectionLocked();
    q('status').textContent=`${running?'執行中':'已停止'}｜${userStatus(status)}`;
    let heroText=userStatus(status);
    const eventSignature=logs.join('\n');
    if(eventSignature!==lastRenderedEvents){
      lastRenderedEvents=eventSignature;q('events').replaceChildren();
      for(const text of logs){
        const entry=document.createElement('article');entry.className='event-card'+(/平台已接受|結算 [+-]/.test(text)?' accepted':/失敗|拒絕|不足|逾時|未下到/.test(text)?' warning':'');
        const first=text.indexOf(' '),time=document.createElement('time');time.textContent=first>=0?text.slice(0,first):'';
        const body=document.createElement('p');body.textContent=userStatus(first>=0?text.slice(first+1):text);entry.append(time,body);q('events').append(entry);
      }
    }
    for(const button of q('rooms').querySelectorAll('button'))button.disabled=selectionLocked();
    const cards=boards(),chosen=cards.filter(c=>selected.has(String(c.tableId))),pending=ledger.pending();
    const tableNames:Record<string,string>={};
    for(const c of [...contexts.values(),...cards])tableNames[String(c.tableId)]=c.gameInfo?.tableName||String(c.tableId);
    const summaries=dgBetSummary(ledger.state.bets,tableNames,summarySince);
    const normalStatus=/平台已接受下注|結算 |已直接傳送|自動找桌|同時 \d+|找到 |新開始/.test(status);
    if(summaries.success&&normalStatus)heroText='下注成功：'+summaries.success;
    else if(summaries.confirming&&normalStatus)heroText='待確認：'+summaries.confirming;
    if(q('hero-status').textContent!==heroText)q('hero-status').textContent=heroText;
    q('hero-status').title=heroText;
    const currentBet=pending[0];
    const focus=chosen.find(c=>String(c.tableId)===currentBet?.tableId)??chosen.find(ready)??chosen[0];
    const previewBase=!running&&!pending.length&&Number.isSafeInteger(Number(q('base').value))&&Number(q('base').value)>0?Number(q('base').value):base;
    const previewProvider=q('provider').value;
    const strategyLabel=AI_PROVIDER_OPTIONS.find(x=>x.key===previewProvider)?.label??'本地策略';
    q('current-strategy').textContent=strategyLabel;providerMenu.sync();
    const previewScope=!running&&!pending.length?desiredScope():scope;
    const settled=roundBets();
    const pnl=settled.reduce((sum,b)=>sum+(b.pnl??0),0);
    const wins=settled.filter(b=>(b.pnl??0)>0).length,losses=settled.filter(b=>(b.pnl??0)<0).length,ties=settled.length-wins-losses;
    q('brand-count').textContent='百家工程師';
    const wallet=dgSceneWallet(walletPlayer);
    q('balance').textContent=wallet===null?'待同步':money(wallet);
    q('mini-balance').textContent=q('balance').textContent;
    q('mini-running').textContent=`${running?(selected.size?'執行中':'等待開盤'):pending.length?'待結算':'已停止'} · ${mini?selected.size+'桌':manualSelection?'指定桌':'自動找桌'}`;
    q('auto-tables').disabled=selectionLocked();q('auto-tables').classList.toggle('selected',!manualSelection);q('auto-tables').textContent=manualSelection?'切回自動找桌':'自動找桌中';
    q('selection-mode').textContent=manualSelection?'指定桌台 · 不自動補其他桌':'自動找桌 · 開放下注就加入';
    q('scope').options[0].textContent=stakingMode()==='flat'?'平注 · 金額固定':stakingMode()==='doubling'?'單桌共用倍投 · 換房接續 1→2→4→8':'單桌共用馬丁 · 換房接續 1→3→7→15';
    q('doubling-reminder').hidden=stakingMode()!=='doubling';
    q('single-staking').value=stakingMode();q('single-staking').disabled=roomCount!=='1'||selectionLocked();
    q('start-mode').value=startMode;q('start-mode').disabled=selectionLocked();
    q('staking-hint').textContent=roomCount==='1'?(singleStaking==='flat'?'單桌平注：每筆固定基本額，換房不加注。':`跨房間接續${singleStaking==='doubling'?'倍投1→2→4→8':'馬丁1→3→7→15'}：輸升階、贏重置、和維持。${startMode==='fresh'?'新開始首筆基本額。':'續接保留共用階級。'}`):'多桌固定平注，不可更改。';
    q('stop-loss').disabled=q('take-profit').disabled=q('base').disabled=q('cap').disabled=selectionLocked();
    q('stop-loss').min=stakingMode()==='martingale'?'2600':'1';
    q('provider').disabled=q('provider-trigger').disabled=selectionLocked();if(selectionLocked())providerMenu.close();
    q('run-pill').textContent=running?'● 自動下注中':pending.length?'● 待結算':'● 已停止';
    q('run-pill').classList.toggle('idle',!running);
    q('method').textContent=`${stakingMode()==='flat'?'平注 · 固定金額':stakingMode()==='doubling'?'單桌 · 倍投法':'單桌 · 馬丁'}（${selected.size} 桌）`;
    q('parallel-count').value=q('count').value=roomCount;
    q('parallel-count').disabled=q('count').disabled=q('scan').disabled=selectionLocked();
    q('parallel-summary').textContent=`已選 ${selected.size} 桌 · 待接受 ${pending.filter(b=>b.state!=='accepted').length} · 待結算 ${pending.filter(b=>b.state==='accepted').length}`;
    const rec=focus?strategyFor(focus,previewProvider):null;
    let focusTableText=focus?(focus.gameInfo.tableName||String(focus.tableId)):'尋找可下注桌';
    let focusPhaseText=currentBet?(currentBet.state==='accepted'?'等待結算':currentBet.state==='uncertain'?'回覆未確定':'等待接受'):focus&&ready(focus)?'可下注':'準備中';
    const focusId=focus?String(focus.tableId):'';
    const shownLevel=currentBet?.level??amountLevel(focusId,previewScope);
    const shownStaking=currentBet?.staking??stakingMode();
    const multiplier=shownStaking==='flat'?1:shownStaking==='doubling'?2**shownLevel:2**(shownLevel+1)-1;
    const label=currentBet?(currentBet.state==='accepted'?'已接受金額':currentBet.state==='uncertain'?'未確定金額':'已送出金額'):'下一注預覽';
    q('amount-label').textContent=!running&&!pending.length&&(!Number.isSafeInteger(Number(q('base').value))||Number(q('base').value)<=0)?'基本單注須為正整數':label;
    q('amount-rule').textContent=`基本 ${money(currentBet?currentBet.amount/multiplier:previewBase)} · ${shownStaking==='flat'?'平注 ×1':`第${shownLevel+1}階 ×${multiplier}`}`;
    q('amount').textContent=money(currentBet?.amount??stakeAmount(focusId,previewBase,previewScope));
    q('amount').title=label+'｜'+q('amount-rule').textContent;

    q('amount').classList.toggle('long-number',q('amount').textContent.length>7);
    const side=currentBet?.side??rec?.side;
    q('side').textContent=side?`${side} ${currentBet?'下注':'推薦'}`:'—';q('side').classList.toggle('player',side==='閒');
    const seconds=focus?Math.floor(remaining(focus)):null;
    q('countdown').textContent=seconds!==null?String(seconds):'—';
    q('ring').style.setProperty('--progress',`${seconds!==null?Math.min(1,seconds/Math.max(1,Number(focus.gameInfo.countDown)))*360:0}deg`);
    q('focus-meta').textContent=focus?`靴 ${focus.gameInfo.shoeId??'—'} · 局 ${focus.gameInfo.playId??'—'} · ${getPatternInfo(roads(focus)).label} · ${strategyLabel}`:`${strategyLabel} · 等候牌路與倒數`;
    if(rec?.reason&&!currentBet)q('focus-meta').textContent+=' · '+rec.reason;
    if(currentBet){const original=AI_PROVIDER_OPTIONS.find(x=>x.key===currentBet.provider)?.label;q('focus-meta').textContent+=original&&original!==strategyLabel?`｜此單 ${original}`:'';}
    if(!focus&&!currentBet){
      focusPhaseText=cards.length?'等待開盤':'桌卡未接通';
      q('focus-meta').textContent=cards.length?`已辨識 ${cards.length} 桌；等待開盤、足夠倒數與牌路`:'尚未辨識原生桌卡，未送單；請匯出連線診斷';
    }
    if(summaries.waiting||summaries.confirming||summaries.uncertain){
      focusTableText=summaries.waiting?'等待結算：':summaries.uncertain?'未確定：':'待確認：';
      focusPhaseText=summaries.waiting? summaries.waiting+(summaries.confirming?' ｜待確認：'+summaries.confirming:'')+(summaries.uncertain?' ｜未確定：'+summaries.uncertain:'') : summaries.uncertain? summaries.uncertain+(summaries.confirming?' ｜待確認：'+summaries.confirming:'') : summaries.confirming;
    }
    if(q('focus-table').textContent!==focusTableText)q('focus-table').textContent=focusTableText;
    if(q('focus-phase').textContent!==focusPhaseText)q('focus-phase').textContent=focusPhaseText;
    q('focus-phase').title=focusTableText+focusPhaseText;
    const stage=currentBet?(currentBet.state==='accepted'?3:2):running?1:0;
    for(let i=1;i<=4;i++)q('step-'+i).classList.toggle('active',i<=stage);
    const seeking=running&&!currentBet;
    q('search-box').hidden=compact||!seeking;
    q('target-box').hidden=!compact&&seeking;
    q('search-title').textContent=compact?'挑選下注單…':'挑選下注桌…';
    q('countdown').textContent=seconds===0&&currentBet?'⊘':seconds!==null?String(seconds):'—';
    q('ring').style.background=seconds===0?'#55525866':`conic-gradient(${seconds!==null&&seconds<=5?'#c8a555':'#73997a'} ${seconds!==null?Math.min(1,seconds/Math.max(1,Number(focus.gameInfo.countDown)))*360:0}deg,#52565344 0)`;
    const low=q('range-min').value,high=q('range-max').value;
    const rangeSummary=chartSummary(settled);q('range-low').textContent=money(rangeSummary.low);q('range-high').textContent=money(rangeSummary.high);
    const position=rangePosition(pnl,low,high);q('pnl-range').hidden=true;
    const points=cumulativePoints(settled),chart=chartSummary(settled);
    q('pnl-line').setAttribute('points',points);q('pnl-chart').classList.toggle('red',pnl<0);
    const zero=39-(0-chart.low)/(chart.high-chart.low||1)*35;
    const endpoint=points.split(' ').at(-1)!.split(',');
    q('chart-zero').setAttribute('y1',String(zero));q('chart-zero').setAttribute('y2',String(zero));
    q('chart-dot').setAttribute('cx',endpoint[0]);q('chart-dot').setAttribute('cy',endpoint[1]);
    q('chart-area').setAttribute('points',chart.count?`0,${zero} ${points} 250,${zero}`:'');
    q('chart-empty').hidden=chart.count>0;q('chart-dot').style.opacity=chart.count?'1':'0';q('pnl-line').style.opacity=chart.count?'1':'.2';
    q('chart-last').textContent=chart.count?(pnl>0?'+':'')+money(pnl):'尚無結算';
    q('chart-low').textContent=chart.count?`最低 ${money(chart.low)}`:'最低 —';q('chart-high').textContent=chart.count?`最高 ${money(chart.high)}`:'最高 —';q('chart-count').textContent=`${chart.count} 注`;
    q('cards-result').hidden=true;
    if(focus&&currentBet&&String(focus.gameInfo.gameNo)===currentBet.gameNo){
      const poker=knownPoker(focus.gameInfo.poker);
      if(poker){
        q('cards-result').hidden=false;
        for(const side of ['player','banker'] as const){
          q(side+'-cards').replaceChildren();for(const id of poker[side]){
            const card=document.createElement('span');card.className='playing-card';card.textContent=pokerRank(id);q(side+'-cards').append(card);
          }
          q(side+'-point').textContent=String(pokerPoint(poker[side]));
        }
      }
    }
    for(const id of ['hero-pnl','round-pnl']){q(id).textContent=(pnl>0?'+':'')+money(pnl);q(id).classList.toggle('green',pnl>0);q(id).classList.toggle('red',pnl<0);}

    q('round-wlt').textContent=`${wins}/${losses}/${ties}`;
    q('hit-rate').textContent=wins+losses?`${(wins/(wins+losses)*100).toFixed(1)}%`:'—';
    q('stop-now').classList.toggle('live',running);
    q('stop-now').textContent=running?'■  停止自動下注':'▶  開始自動下注';
    q('tables').replaceChildren();
    q('table-strip').replaceChildren();
    for(const c of chosen){
      const results=roads(c),r=strategyFor(c,previewProvider);
      const ownPending=pending.find(b=>b.tableId===String(c.tableId));
      const shownSide=ownPending?.side??r?.side;
      const row=document.createElement('div');row.className='table-row';
      const badge=document.createElement('span');badge.className='table-badge';badge.textContent=shownSide??'—';
      const info=document.createElement('div');info.className='table-info';
      const title=document.createElement('strong');title.textContent=c.gameInfo.tableName||String(c.tableId);
      const meta=document.createElement('small');meta.textContent=`靴 ${c.gameInfo.shoeId??'—'} · 局 ${c.gameInfo.playId??'—'} · ${getPatternInfo(results).label}`;
      info.append(title,meta);
      const amount=document.createElement('div');amount.className='table-rec';amount.textContent=money(ownPending?.amount??stakeAmount(String(c.tableId),previewBase,previewScope));
      const detail=document.createElement('small');const limitCheck=checkDgAmount(c,stakeAmount(String(c.tableId),previewBase,previewScope));
      detail.textContent=ownPending?`${ownPending.state==='accepted'?'平台已接受 · 待結算':ownPending.state==='uncertain'?'回覆未確定':'已送出 · 待接受'} ${money(ownPending.amount)}`:!limitCheck.ok?limitCheck.reason:tableWait.get(String(c.tableId))??(r.side?`指標 ${r.confidence} · ${Math.floor(remaining(c))}s`:r.reason||'等待資料');
      detail.style.maxWidth='120px';detail.style.whiteSpace='normal';detail.title=limitCheck.reason;amount.append(detail);
      row.append(badge,info,amount);q('tables').append(row);
      const chip=document.createElement('button');chip.className='table-chip'+(focus===c?' selected':'');
      const chipTitle=document.createElement('strong');chipTitle.textContent=`${c.gameInfo.tableName||c.tableId} · ${shownSide??'—'} ${money(ownPending?.amount??stakeAmount(String(c.tableId),previewBase,previewScope))}`;
      const roundState=currentRoundState(c);
      const chipStatus=document.createElement('small');chipStatus.textContent=roundState.label;chipStatus.title=roundState.label;chipStatus.classList.toggle('green',roundState.ok);
      chipTitle.title=ownPending?`原單 ${ownPending.side} ${money(ownPending.amount)}，${ownPending.staking==='flat'?'平注':`第${ownPending.level+1}階`}`:`下一注預覽：基本 ${money(previewBase)}，${stakingMode()==='flat'?'平注':`第${amountLevel(String(c.tableId),previewScope)+1}階`}`;
      chip.append(chipTitle,chipStatus);chip.onclick=()=>showPage('logs');q('table-strip').append(chip);
    }
    if(!chosen.length){const empty=document.createElement('div');empty.className='empty';empty.textContent=manualSelection?'等待指定桌台開放下注':'自動找桌中 · 有可下注桌就加入';q('tables').append(empty);}
    q('compact-stop').classList.toggle('live',running);
    q('compact-stop').textContent=running?'■ 停止自動下注':'▶ 開始自動下注';
    if(!q('report-shell').hidden)renderReport();
    fitPanel();
  }
  q('scan').onclick=scan;q('count').onchange=()=>selectCount(q('count').value);q('parallel-count').onchange=()=>selectCount(q('parallel-count').value);
  function requestStart(testOnce=false){
    if(running||busy)return;
    riskApproved=false;riskTestOnce=testOnce;riskReturnFocus=shadow.activeElement as HTMLElement|null;
    q('risk-record-state').textContent='';
    q('risk-doubling-warning').hidden=stakingMode()!=='doubling';
    q('risk-doubling-warning').textContent=`使用倍投法，請設定止盈與止損。${!q('take-profit').value||!q('stop-loss').value?'目前止盈／止損尚未全部設定，請先至設定頁確認。':'請確認目前止盈與止損金額符合你的設定。'}`;
    q('risk-time-summary').textContent=(()=>{try{const n=parseDurationMinutes(q('duration-minutes').value);return n?`自動停止：${n} 分鐘，確認開始後計時`:'自動停止：不限時；確認開始後顯示本次使用時間';}catch(e){return (e as Error).message;}})();
    q('risk-stake-summary').textContent=`${startMode==='fresh'?'新開始：首筆基本額':'續接：沿用配注階級'} · 基本 ${q('base').value} · ${stakingMode()==='flat'?'平注':stakingMode()==='doubling'?'倍投 1→2→4→8':`馬丁 1→3→7→15`}`;
    q('ack').checked=false;q('risk-confirm').disabled=true;q('risk-dialog').hidden=false;fitPanel();q('ack').focus();
  }
  function cancelRisk(){q('risk-dialog').hidden=true;riskApproved=false;fitPanel();riskReturnFocus?.focus();}
  q('ack').onchange=()=>{
    q('risk-confirm').disabled=!q('ack').checked;
    if(!q('ack').checked)q('risk-record-state').textContent='已取消勾選；先前已記錄的勾選不會抹除';
    else if(q('ack').dataset.autobacRiskRecording!=='connected')q('risk-record-state').textContent='未連接網站紀錄服務，勾選尚未同步至後台';
  };
  q('risk-cancel').onclick=cancelRisk;
  q('risk-confirm').onclick=()=>{if(!q('ack').checked)return;riskApproved=true;q('risk-dialog').hidden=true;start(riskTestOnce);if(running)showPage('overview');};
  q('risk-dialog').onkeydown=(e:KeyboardEvent)=>{
    if(e.key==='Escape'){e.preventDefault();cancelRisk();}
    if(e.key==='Tab'){const targets=[q('ack'),q('risk-cancel'),...(!q('risk-confirm').disabled?[q('risk-confirm')]:[])];const at=targets.indexOf(shadow.activeElement);e.preventDefault();targets[(at+(e.shiftKey?-1:1)+targets.length)%targets.length].focus();}
  };
  q('start').onclick=()=>requestStart();q('once').onclick=()=>requestStart(true);q('stop').onclick=()=>stop();
  q('stop-now').onclick=()=>{if(running)stop();else requestStart();};
  q('nav-overview').onclick=()=>showPage('overview');q('nav-settings').onclick=()=>showPage('settings');q('nav-logs').onclick=()=>showPage('logs');q('edit-rooms').onclick=()=>showRooms();
  function showRooms(){renderRooms();q('rooms-hint').textContent=selectionLocked()?'待下注完成結算後才能改選。':`目前選 ${selected.size} 桌；取消一桌後可更換。`;showPage('rooms');}
  q('auto-tables').onclick=()=>{if(selectionLocked())return;manualSelection=false;selected.clear();scan();render();};
  q('choose-tables').onclick=showRooms;q('rooms-back').onclick=()=>showPage('overview');
  q('hero-status').onclick=()=>showPage('logs');q('hero-status').onkeydown=(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPage('logs');}};
  q('single-staking').onchange=()=>{
    if(roomCount!=='1'||selectionLocked()){q('single-staking').value=stakingMode();return;}
    const value=q('single-staking').value;if(value!=='flat'&&value!=='martingale'&&value!=='doubling')return;
    singleStaking=value;scope=desiredScope();syncRiskInputMode();render();
  };
  function setZoom(value:number){userZoom=Math.max(.7,Math.min(1.8,value));q('zoom').value=String(Math.round(userZoom*100));fitPanel();}
  q('duration-minutes').oninput=render;
  q('zoom').oninput=()=>setZoom(Number(q('zoom').value)/100);
  function setMini(value:boolean){
    if(value===mini)return;
    if(value){miniPreviousCompact=compact;compact=true;}
    else compact=miniPreviousCompact;
    mini=value;q('panel').classList.toggle('mini',mini);q('panel').classList.toggle('compact',compact);
    q('zoom-out').setAttribute('aria-label',mini?'展開完整面板':'切換迷你面板');
    q('zoom-out').title=mini?'展開完整面板':'切換迷你面板';
    q('mini-label').textContent=mini?'展開':'迷你';
    q('zoom-out').querySelector('path').setAttribute('d',mini?'M5 9V5h4 M15 5h4v4 M19 15v4h-4 M9 19H5v-4':'M5 12h14');
    if(mini)showPage('overview');render();
  }
  q('zoom-in').onclick=()=>{if(mini)setMini(false);else setZoom(userZoom+.1);};q('zoom-out').onclick=()=>setMini(!mini);
  for(const id of ['base','cap','scope','range-min','range-max'])q(id).oninput=render;
  q('start-mode').onchange=()=>{if(selectionLocked()){q('start-mode').value=startMode;return;}startMode=q('start-mode').value;render();};
  q('provider').oninput=q('provider').onchange=()=>{if(selectionLocked()){q('provider').value=provider;providerMenu.sync();return;}provider=q('provider').value;render();};
  q('hide').onclick=()=>setMini(true);
  q('hide').title='切換迷你面板';q('hide').setAttribute('aria-label','切換迷你面板');
  function openReport(){q('report-shell').hidden=false;renderReport();fitPanel();}
  function renderUsageReport(){
    const all=usageHistory.view();
    const records=usageHistoryInPeriod(all,reportPeriod);
    const perPage=6,pages=Math.max(1,Math.ceil(records.length/perPage));reportPage=Math.max(0,Math.min(reportPage,pages-1));
    const previous=all.find(r=>r.state!=='active');
    const fmt=(at:number)=>new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(at);
    q('report-body').replaceChildren();
    for(const r of records.slice(reportPage*perPage,(reportPage+1)*perPage)){
      const row=document.createElement('article');row.className='report-card';row.dataset.usageId=r.id;
      const head=document.createElement('div');head.className='report-card-head';
      const title=document.createElement('strong');title.textContent=r.state==='active'?'本次使用':r.id===previous?.id?'上次使用':'使用紀錄';
      const state=document.createElement('span');state.className='report-state';state.textContent=(r.state==='active'?'執行中':r.state==='interrupted'?'頁面中斷':'已停止')+(r.pendingCount?` · 待結算 ${r.pendingCount}`:'')+(r.uncertainCount?` · 未確定 ${r.uncertainCount}`:'');head.append(title,state);
      const values=document.createElement('div');values.className='report-values';
      const used=document.createElement('span');used.textContent=`使用 ${r.elapsedText}`;
      const result=document.createElement('strong');result.textContent=`已結算輸贏 ${r.pnl>0?'+':''}${money(r.pnl)}`;if(r.pnl)result.className=r.pnl>0?'green':'red';values.append(used,result);
      const time=document.createElement('div');time.className='report-card-time';time.textContent=`開始 ${fmt(r.createdAt)} · ${r.endedAt===null?'尚未停止':'停止 '+fmt(r.endedAt)} · 贏/輸 ${r.wins}/${r.losses}`;
      row.append(head,values,time);q('report-body').append(row);
    }
    q('report-empty').hidden=records.length>0;q('report-empty').textContent='尚無使用紀錄；確認開始後建立新的一次';
    q('report-note').textContent='每次使用時間與已結算輸贏；待結算回填原次，不計入下一次';
    q('report-total').textContent=`${records.length} 次 · 已結算輸贏 ${money(records.reduce((sum,r)=>sum+r.pnl,0))}`;
    q('report-page').textContent=`${reportPage+1} / ${pages}`;
  }
  function renderReport(){
    q('report-usage').classList.toggle('selected',reportTab==='usage');
    q('report-bets').classList.toggle('selected',reportTab==='bets');q('report-transactions').classList.toggle('selected',reportTab==='transactions');
    for(const period of ['today','yesterday','week'])q('report-'+period).classList.toggle('selected',period===reportPeriod);
    if(reportTab==='usage'){renderUsageReport();return;}
    const perPage=6;
    const records=reportTab==='bets'?periodBets(ledger.state.bets,reportPeriod).slice().reverse():[];
    const pages=Math.max(1,Math.ceil(records.length/perPage));reportPage=Math.max(0,Math.min(reportPage,pages-1));
    q('report-body').replaceChildren();
    const fmtTime=(at:number)=>new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(at);
    for(const [i,b] of records.slice(reportPage*perPage,(reportPage+1)*perPage).entries()){
      const card=boards().find(c=>String(c.tableId)===b.tableId);
      const labels:any={reserved:'準備中',submitted:'待接受',accepted:'待結算',rejected:'拒絕',uncertain:'未確定',settled:'已結算',aborted:'未送出'};
      const row=document.createElement('article');row.className='report-card';
      const head=document.createElement('div');head.className='report-card-head';
      const title=document.createElement('strong');title.textContent=`${card?.gameInfo.tableName??b.tableId} · ${b.side}`;
      const state=document.createElement('span');state.className='report-state';state.textContent=labels[b.state];head.append(title,state);
      const values=document.createElement('div');values.className='report-values';
      const stake=document.createElement('span');stake.textContent=`下注 ${money(b.amount)}`;
      const result=document.createElement('strong');result.textContent=b.pnl==null?'損益待定':`損益 ${b.pnl>0?'+':''}${money(b.pnl)}`;if(b.pnl)result.className=b.pnl>0?'green':'red';values.append(stake,result);
      const time=document.createElement('div');time.className='report-card-time';time.textContent=`下注 ${fmtTime(b.createdAt)}`;
      row.append(head,values,time);q('report-body').append(row);
    }
    q('report-empty').hidden=records.length>0;
    q('report-empty').textContent=reportTab==='transactions'?'尚未接入平台存提／轉帳資料，不會用下注紀錄冒充交易記錄':'此期間尚無下注記錄';
    q('report-note').textContent='本工具記錄的下注與結果';
    q('report-total').textContent=`${records.length} 筆 · 下注 ${money(records.reduce((a,b)=>a+b.amount,0))} · 已結算損益 ${money(records.reduce((a,b)=>a+(b.pnl??0),0))}`;
    q('report-page').textContent=`${reportPage+1} / ${pages}`;
    q('report-bets').classList.toggle('selected',reportTab==='bets');q('report-transactions').classList.toggle('selected',reportTab==='transactions');
    for(const period of ['today','yesterday','week'])q('report-'+period).classList.toggle('selected',period===reportPeriod);
  }
  q('nav-mode').onclick=()=>{
    compact=!compact;q('panel').classList.toggle('compact',compact);q('brand-count').textContent='百家工程師';
    showPage('overview');render();
  };
  q('official-refresh').onclick=()=>official.refresh(true);
  q('open-records').onclick=q('open-report').onclick=openReport;
  q('last-usage').onclick=()=>{reportTab='usage';reportPage=0;openReport();};
  q('compact-stop').onclick=()=>q('stop-now').click();
  q('close-report').onclick=()=>{q('report-shell').hidden=true;showPage('overview');};
  for(const period of ['today','yesterday','week'] as const)q('report-'+period).onclick=()=>{reportPeriod=period;reportPage=0;renderReport();};
  q('report-usage').onclick=()=>{reportTab='usage';reportPage=0;renderReport();};
  q('report-bets').onclick=()=>{reportTab='bets';reportPage=0;renderReport();};q('report-transactions').onclick=()=>{reportTab='transactions';reportPage=0;renderReport();};
  q('report-prev').onclick=()=>{reportPage--;renderReport();};q('report-next').onclick=()=>{reportPage++;renderReport();};
  q('report-lobby').onchange=q('report-game').onchange=()=>{reportPage=0;renderReport();};
  let drag:any=null;
  const head=q('head');
  head.onpointerdown=(e:PointerEvent)=>{
    if((e.target as Element).closest('button,input,select'))return;
    const box=host.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:box.left,top:box.top};head.setPointerCapture?.(e.pointerId);
  };
  head.onpointermove=(e:PointerEvent)=>{
    if(!drag)return;
    const fit=parseFloat(host.style.getPropertyValue('--fit'))||1;
    const left=Math.max(0,Math.min(window.innerWidth-(mini?210:panelWidth)*fit,drag.left+e.clientX-drag.x));
    const top=Math.max(0,Math.min(window.innerHeight-50,drag.top+e.clientY-drag.y));
    host.style.left=left+'px';host.style.top=top+'px';host.style.right='auto';
    for(const id of ['panel','risk-dialog','report-shell']){q(id).style.transformOrigin='top left';if(id!=='panel'){q(id).style.left='0';q(id).style.right='auto';}}
  };
  head.onpointerup=head.onpointercancel=head.onlostpointercapture=()=>{drag=null;};
  const cleanupResize=installDgPanelResize([q('resize-panel'),q('resize-report')],{
    getSize:()=>({width:panelWidth,height:Math.min(panelHeight,parseFloat(host.style.getPropertyValue('--full-height'))||panelHeight),scale:parseFloat(host.style.getPropertyValue('--fit'))||1}),
    prepare:target=>{
      const box=target.getBoundingClientRect();host.style.left=box.left+'px';host.style.top=box.top+'px';host.style.right='auto';
      for(const id of ['panel','risk-dialog','report-shell']){q(id).style.transformOrigin='top left';if(id!=='panel'){q(id).style.left='0';q(id).style.right='auto';}}
    },
    apply:(width,height)=>{panelWidth=Math.round(width);panelHeight=Math.round(height);fitPanel();},
  });
  window.addEventListener('resize',fitPanel);fitPanel();
  function visibility(){if(document.hidden)stop('頁面進入背景，已停止新增操作；返回後需手動開始');}
  document.addEventListener('visibilitychange',visibility);
  function settingsSync(event:Event){
    const detail=(event as CustomEvent).detail;if(!detail||detail.eventId!==runEventId||!['synced','failed'].includes(detail.state))return;
    settingsSyncState=detail.state;
    logs.unshift(`${new Date().toLocaleTimeString('zh-TW',{hour12:false})} ${detail.state==='synced'?'本次使用設定已記錄至管理後台':'本次設定尚未同步至後台，執行設定不受影響'}`);logs.length=Math.min(logs.length,50);render();
  }
  window.addEventListener(DG_SETTINGS_SYNC_EVENT,settingsSync);
  const timer=setInterval(()=>void tick(),500);
  window.__DG_SINGLEPAGE__={
    version:'3.2.2-mobile-v329-native',start:()=>requestStart(),stop,scan,
    flushUsageKeepalive:()=>{if(running&&runEventId){usageHistory.updateElapsed(sessionTimer.view().elapsedMs);persistUsage();reportUsage(runEventId,true,true);}},
    usageHistory:()=>usageHistory.view(),settingsSnapshot:()=>activeSettings?JSON.parse(JSON.stringify(activeSettings)):null,stakeDiagnostics,officialTurnover:official.view,refreshOfficialTurnover:()=>official.refresh(true),
    mobileDiagnostics:()=>inspectDgMobileNativeSurface(window),
    runtimeDiagnostics:()=>describeDgScene(nodes()),
    exportMobilePublicSources:()=>exportDgMobileLoadedPublicScripts(document),
    status:()=>({running,status,settingsSyncState,usage:sessionTimer.view(),mini,base,startMode,selectionMode:manualSelection?'manual':'auto',panelSize:{width:panelWidth,height:panelHeight},pending:ledger.pending().map(b=>({...b})),selected:[...selected],roomCount,scope,staking:stakingMode(),riskLimits:{...riskLimits},roundPnl:roundPnl(),unacknowledgedFunds:unacknowledgedFunds()}),
    rounds:()=>boards().filter(c=>selected.has(String(c.tableId))).map(c=>({table:c.gameInfo.tableName,round:c.gameInfo.playId,...currentRoundState(c)})),
    diagnostics:()=>boards().map(c=>({table:c.gameInfo?.tableName||String(c.tableId),tableId:String(c.tableId),selected:selected.has(String(c.tableId)),round:c.gameInfo?.playId,gameState:c.gameInfo?.stateId,countdown:Math.floor(remaining(c)),ready:ready(c),...checkDgAmount(c,stakeAmount(String(c.tableId)))})),
    exportLedger:()=>JSON.parse(JSON.stringify(ledger.state)),
    analysis:(tableId:string)=>{const c=boards().find(n=>String(n.tableId)===String(tableId));return c?(provider==='counting'||provider==='parity'?strategyFor(c).reason||'等待實際牌張':providerAnalysisText(provider,{results:roads(c)})):'未找到桌台';},
    dispose:()=>{if(running&&runEventId){usageHistory.updateElapsed(sessionTimer.view().elapsedMs);persistUsage();reportUsage(runEventId,true,true);}running=false;disposed=true;epoch++;clearInterval(timer);official.dispose();cleanupFeedback();cleanupTouchScroll();cleanupResize();providerMenu.cleanup();socket?.off('RECEIVED_SUCCESS',owner,onMessage);if(socket?.sendData===sendObserver)socket.sendData=originalSend;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',fitPanel);window.removeEventListener(DG_SETTINGS_SYNC_EVENT,settingsSync);persist();host.remove();},
  };
  attach(nodes());scan();showPage('overview');official.refresh();render();
})();
