function installMtNavigationPatch(W, makeNavigator) {
  let foreground=false;
  try {
    const marker=W.__AUTOBAC_MT_FOREGROUND__,descriptor=Object.getOwnPropertyDescriptor(W,'__AUTOBAC_MT_FOREGROUND__');
    foreground=!!marker&&Object.isFrozen(marker)&&!!descriptor&&descriptor.value===marker&&!descriptor.writable&&!descriptor.configurable&&marker.kind==='autobac-mt-foreground-v1'&&marker.version===1&&marker.pathPrefix==='/mt-game'&&(W.location.pathname==='/mt-game'||W.location.pathname.startsWith('/mt-game/'))&&W.parent!==W&&W.parent.location.origin===W.location.origin;
  } catch { foreground=false; }
  const native=W.location.protocol==='https:'&&['gsa.ofalive99.net','gsb.ofalive99.net','gs1.ofalive99.net'].includes(W.location.hostname);
  if(!foreground&&!native){
    W.console.error('[AutoBac MT] 請在MT頁面本身執行定位修補。');return null;
  }
  const D=W.document,diag=W.__MT_AUTOBAC_DIAG__;
  if(!diag||typeof diag.report!=='function'||typeof diag.dispose!=='function'||!D.getElementById('__autobac_mt_diag__')){
    W.console.error('[AutoBac MT] 請先載入v0.4診斷版；此檔是定位修補，不是獨立下注程式。');return null;
  }
  if(typeof W.__MT_NAV_PATCH__?.undo==='function')W.__MT_NAV_PATCH__.undo();
  const original={report:diag.report,scrollToTable:diag.scrollToTable,cancelScroll:diag.cancelScroll,dispose:diag.dispose};
  const root=D.getElementById('__autobac_mt_diag__'),badge=root.querySelector('.ab-tag'),copyButton=root.querySelector('[data-v="copy"]'),removeButton=root.querySelector('[data-v="remove"]');
  const saved={badge:badge?.textContent,copy:copyButton?.onclick,remove:removeButton?.onclick};
  const past=original.report.call(diag).tableViewport?.history||[];
  let removed=false;
  const readTables=()=>original.report.call(diag).liveTables||[];
  const nav=makeNavigator(W,readTables,()=>removed||W.__MT_AUTOBAC_DIAG__!==diag||!root.isConnected);
  original.cancelScroll?.call(diag);
  function report(){
    const r=original.report.call(diag);
    return {...r,version:'MT-DIAG-0.4.3',tableViewport:{tables:nav.list(),history:[...past,...nav.history()].slice(-40)},navigationPatch:{version:'0.4.3',readOnly:true,preserveNativeObservation:true}};
  }
  async function scrollToTable(id,options={}){
    if(removed)return {ok:false,reason:'patch-removed'};
    root.dataset.mini='true';const close=root.querySelector('.ab-close');if(close)close.textContent='+';
    const identity=options.identity||(/^B\d{2}[A-Z]?(?:-L)?$/i.test(String(id))?'display':'verified');
    const result=await nav.focus(id,{...options,identity});
    W.console.log('[AutoBac MT 定位]',{ok:result.ok,tableId:result.tableId||null,name:result.name||null,identityVerified:result.identityVerified??false,locationSource:result.locationSource??null,reason:result.reason||null,confirmEnabled:result.confirmEnabled??null});
    return result;
  }
  const cancelScroll=()=>{nav.cancel();original.cancelScroll?.call(diag);};
  function undo(){
    if(removed)return;removed=true;cancelScroll();
    if(diag.report===report)diag.report=original.report;
    if(diag.scrollToTable===scrollToTable)diag.scrollToTable=original.scrollToTable;
    if(diag.cancelScroll===cancelScroll)diag.cancelScroll=original.cancelScroll;
    if(diag.dispose===dispose)diag.dispose=original.dispose;
    if(badge)badge.textContent=saved.badge||'';
    if(copyButton?.onclick===copyReport)copyButton.onclick=saved.copy;
    if(removeButton?.onclick===dispose)removeButton.onclick=saved.remove;
    if(W.__MT_NAV_PATCH__===api)delete W.__MT_NAV_PATCH__;
  }
  function dispose(){undo();original.dispose.call(diag);}
  async function copyReport(){
    const value=JSON.stringify(report(),null,2);W.console.log('[AutoBac MT 完整報告]',value);
    try{await W.navigator.clipboard.writeText(value);}catch{W.console.log('請用Console的copy(JSON.stringify(window.__MT_AUTOBAC_DIAG__.report(),null,2))複製。');}
  }
  const api={version:'0.4.3',undo,viewport:()=>({tables:nav.list(),history:nav.history()})};
  diag.report=report;diag.scrollToTable=scrollToTable;diag.cancelScroll=cancelScroll;diag.dispose=dispose;
  if(badge)badge.textContent='桌台辨識 0.4.3';
  if(copyButton)copyButton.onclick=copyReport;
  if(removeButton)removeButton.onclick=dispose;
  W.__MT_NAV_PATCH__=api;
  W.console.table(nav.list().map(r=>({table:r.name,screenRow:'已找到',betArea:r.betAreaPresent?'已找到':'尚未載入',nativeId:r.tableId||'待核對'})));
  W.console.log('[AutoBac MT] 畫面定位修補已載入。唯一B03名稱即可定位，不再因原生ID未知擋住捲動；沒有開始下注，原生觀察紀錄保留。');
  return api;
}
if(typeof module!=='undefined')module.exports={installMtNavigationPatch};
