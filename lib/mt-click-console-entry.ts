import {createMtRecommendationAdapter} from './mt-recommendation-adapter';
import {createMtDomClickRunner} from './mt-dom-click-runner';
import {createMtRoadFeed} from './mt-road-feed';
import {mountMtClickPanel} from './mt-click-panel';
import {createMtOfficialTurnover} from './mt-official-turnover';

(async()=>{
  const W=window as any;
  try{
    const marker=W.__AUTOBAC_MT_FOREGROUND__;
    const markerDescriptor=Object.getOwnPropertyDescriptor(W,'__AUTOBAC_MT_FOREGROUND__');
    const immutableMarker=!!markerDescriptor&&markerDescriptor.value===marker&&!markerDescriptor.writable&&!markerDescriptor.configurable;
    const foreground=!!marker&&Object.isFrozen(marker)&&immutableMarker&&marker.kind==='autobac-mt-foreground-v1'&&marker.version===1&&marker.pathPrefix==='/mt-game'&&(location.pathname==='/mt-game'||location.pathname.startsWith('/mt-game/'))&&W.parent!==W;
    let sameOriginParent=false;try{sameOriginParent=foreground&&W.parent.location.origin===location.origin;}catch{}
    const nativeConsole=location.protocol==='https:'&&['gsa.ofalive99.net','gsb.ofalive99.net'].includes(location.hostname);
    if(!sameOriginParent&&!nativeConsole)throw Error('請在MT原生遊戲頁或已確認的 /mt-game 同源前景入口執行');
    if(!W.__MT_AUTOBAC_DIAG__?.report||!W.__MT_AUTOBAC_DIAG__?.scrollToTable)throw Error('請在MT遊戲頁安裝完整版本，不要選主網站Console上下文');
    for(const name of ['__MT_MULTIROOM_CLEANUP__','__MT_COMBINED_CLEANUP__'])if(typeof W[name]==='function')W[name]();
    let saved=W.__MT_NATIVE_CLICK_SAVED__;
    const ledgerKey=typeof marker?.ledgerKey==='string'&&/^mt\.session\.[a-f0-9]{32}$/.test(marker.ledgerKey)?marker.ledgerKey:null;
    if(!saved&&ledgerKey)try{saved=JSON.parse(W.sessionStorage?.getItem(ledgerKey)||'null');}catch{}
    const previous=W.__MT_NATIVE_CLICK__;
    if(previous){await previous.halt();saved=previous.state();await previous.dispose();}
    const originalReport=W.__MT_AUTOBAC_DIAG__.report;
    let runner:ReturnType<typeof createMtDomClickRunner>|undefined;
    const feed=createMtRoadFeed(W,originalReport,()=>!runner?.isBusy(),saved?.roads||[]);
    const official=createMtOfficialTurnover(W,()=>!runner?.isBusy());
    const adapter=createMtRecommendationAdapter();
    runner=createMtDomClickRunner(W,(report,name,provider,now)=>adapter.preview(report,name,provider as any,now),saved,()=>feed.merge(originalReport()));
    const diagRoot=window.document.getElementById('__autobac_mt_diag__');
    if(diagRoot)diagRoot.style.display='none';
    let panel:ReturnType<typeof mountMtClickPanel>|null=null,disposed=false;
    const state=()=>({...runner!.state(),roads:feed.export()});
    async function dispose(){
      if(disposed)return;
      await runner!.halt();W.__MT_NATIVE_CLICK_SAVED__=state();
      if(ledgerKey)try{W.sessionStorage.setItem(ledgerKey,JSON.stringify(W.__MT_NATIVE_CLICK_SAVED__));}catch{}
      await runner!.dispose();official.dispose();feed.dispose();panel?.remove();disposed=true;
      if(W.__MT_NATIVE_CLICK__?.dispose===dispose)delete W.__MT_NATIVE_CLICK__;
      console.log('[AutoBac MT] 面板已移除；原生注單觀察仍保留，不重送任何未確定下注');
    }
    panel=mountMtClickPanel(W,runner,feed,dispose,official);
    W.__MT_NATIVE_CLICK__={version:'0.6.1-official-turnover',configure:runner.configure,start:runner.start,stop:runner.stop,halt:runner.halt,dispose,state,view:runner.view,officialTurnover:official.view,refreshOfficialTurnover:()=>official.refresh(true),refreshRoad:()=>feed.refresh(true)};
    console.log('[AutoBac MT] v0.6.1 官方今日／近7日流水版已載入，沒有開始下注。先設定金額及桌數，開始時勾選確認。');
    console.log('[AutoBac MT] 下注只由原生畫面點擊送出；原生GET用於重新取得完整牌路。停止：window.__MT_NATIVE_CLICK__.stop()；移除：window.__MT_NATIVE_CLICK__.dispose()');
  }catch(e){console.error('[AutoBac MT 安裝失敗]',e);}
})();
