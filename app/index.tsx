import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AccessScreen, getDgLoginUrlFromPlatform, getMtLoginUrlFromPlatform } from '@/lib/legacy-platform-screen';
import { trpc } from '@/lib/trpc';
import { detectGameDevice, resolveGameDevice, type GameDevice } from '@/lib/game-device';
import { ensureDgMultiHall } from '@/lib/dg-auto-multihall';
import { AutoBacGameHeader } from '@/components/autobac-game-header';
import { AutoBacPlatformChoice, type GamePlatform } from '@/components/autobac-platform-choice';
import { createDgOperationCapture, captureDgViewport } from '@/lib/dg-operation-capture';
import { enterDgForeground, installDgFramePanel, stopDgFramePanel, dgFrameHasPending, dgFramePanelStatus, preserveDgFrameLedger, exportDgFrameMobilePublicSources, dgFrameInstallMode } from '@/lib/dg-frame-installer';
import { enterMtForeground, installMtFramePanel, ensureMtMultiplePage, mtFrameAccessBlocked, mtFrameHasPending, mtFramePanelStatus, preserveMtFrameLedger, stopMtFramePanel } from '@/lib/mt-frame-installer';

type Auth = { sessionId: string; token: string; platform: 'TZ' | 'OFA' };
type Departure = 'choose' | 'logout' | 'retry';

/** Only the explicitly selected game is authorized and mounted; no old-dashboard effects. */
export default function AutoBacScreen() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [selected, setSelected] = useState<GamePlatform | null>(null);
  const [gameDevice, setGameDevice] = useState<GameDevice>('Desktop');
  const [gameUrl, setGameUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [installed, setInstalled] = useState(false);
  const [mtAccessBlocked, setMtAccessBlocked] = useState(false);
  const [authInvalid, setAuthInvalid] = useState(false);
  const [captureRunning, setCaptureRunning] = useState(false);
  const [captureExpanded, setCaptureExpanded] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<ReturnType<ReturnType<typeof createDgOperationCapture>['status']> | null>(null);
  const captureRef = useRef<ReturnType<typeof createDgOperationCapture> | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const nativeMtLaunch = useRef('');
  const launchCache = useRef(new Map<string, { sessionId: string; promise: Promise<string> }>());
  const launchBusy = useRef(false);
  const generation = useRef(0);
  const logoutMutation = trpc.trackerAccess.logout.useMutation();
  const check = trpc.trackerAccess.checkSession.useQuery({ sessionId: auth?.sessionId || 'not-authenticated' }, { enabled: !!auth, refetchInterval: 30000, retry: 1 });

  const launch = useCallback(async (current: Auth, target: GamePlatform, device: GameDevice) => {
    if (launchBusy.current) return;
    launchBusy.current = true;
    const currentGeneration = generation.current;
    setError(''); setInstalled(false); setMtAccessBlocked(false); setMessage(`正在取得 ${target} 授權…`);
    try {
      if (Platform.OS !== 'web') throw new Error('請使用手機或電腦瀏覽器開啟此版本。');
      const cacheKey = `${target}:${device}`;
      let cache = launchCache.current.get(cacheKey);
      if (!cache || cache.sessionId !== current.sessionId) {
        const promise = target === 'DG' ? getDgLoginUrlFromPlatform(current.platform, current.token, device) : getMtLoginUrlFromPlatform(current.platform, current.token, device);
        cache = { sessionId: current.sessionId, promise };
        launchCache.current.set(cacheKey, cache);
        void promise.catch(() => { if (launchCache.current.get(cacheKey)?.promise === promise) launchCache.current.delete(cacheKey); });
      }
      const url = await cache.promise;
      if (currentGeneration !== generation.current) return;
      if (target === 'MT') nativeMtLaunch.current = url;
      setMessage(`正在開啟 ${target}…`);
      const foreground = target === 'DG' ? await enterDgForeground(current.sessionId, url) : await enterMtForeground(current.sessionId, url);
      if (currentGeneration !== generation.current) return;
      setGameUrl(foreground);
      setMessage(target === 'DG' ? '正在載入 DG 與百家工程師面板…' : '正在載入 MT 原生遊戲與完整操作面板…');
    } catch (e: any) {
      if (currentGeneration === generation.current) { setError(e?.message || `${target} 載入失敗，請重試。`); setMessage(`${target} 尚未開啟`); }
    } finally { if (currentGeneration === generation.current) launchBusy.current = false; }
  }, []);
  useEffect(() => { if (auth && selected) void launch(auth, selected, gameDevice); }, [auth, selected, gameDevice, launch]);

  function resetForeground() {
    captureRef.current?.stop(); captureRef.current = null; setCaptureRunning(false);
    generation.current++; launchBusy.current = false;
    setSelected(null); setGameUrl(''); setInstalled(false); setError(''); setDeparture(null); setMtAccessBlocked(false); nativeMtLaunch.current = '';
  }
  function stopAndPreserve() {
    if (selected === 'DG') { stopDgFramePanel(frameRef.current); preserveDgFrameLedger(frameRef.current); }
    else if (selected === 'MT') {
      // Halt stops new actions but deliberately retains the official native ledger.
      void stopMtFramePanel(frameRef.current);
      preserveMtFrameLedger(frameRef.current);
    }
  }
  const signOut = useCallback((reason = '', force = false) => {
    stopAndPreserve();
    if (!force && gameUrl && ((selected === 'MT' && mtFrameHasPending(frameRef.current)) || (selected === 'DG' && dgFrameHasPending(frameRef.current)))) { setDeparture('logout'); return; }
    generation.current++; launchBusy.current = false; launchCache.current.clear();
    const sid = auth?.sessionId;
    setAuth(null); setSelected(null); setGameUrl(''); setInstalled(false); setDeparture(null); setNotice(reason);
    if (sid) void logoutMutation.mutateAsync({ sessionId: sid }).catch(() => {});
  }, [auth, selected, gameUrl, logoutMutation.mutateAsync]);
  useEffect(() => {
    if (auth && check.data?.valid === false) {
      setAuthInvalid(true);
      setError('登入授權已失效，已停止新增操作；先核對現有注單，再重新登入。');
      captureRef.current?.stop(); setCaptureRunning(false);
      stopAndPreserve();
      setDeparture('logout');
    }
  }, [auth, check.data, signOut]);

  useEffect(() => {
    if (!auth || !gameUrl || selected !== 'DG') return;
    let attempts = 0, hallAttempts = 0;
    const requestedMode = /^\/ddnewwap\//.test(gameUrl) ? 'mobile' : 'desktop';
    const tick = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const mode = dgFrameInstallMode(frame, requestedMode);
      if (authInvalid) { stopDgFramePanel(frame); preserveDgFrameLedger(frame); return; }
      if (captureRunning) { stopDgFramePanel(frame); return; }
      // The compatible panel can display stopped/waiting state before MultiLobby
      // finishes loading. Do not make its visibility depend on a hall click.
      if (mode === 'desktop') {
        const panel = dgFramePanelStatus(frame);
        if (panel.installed || installDgFramePanel(frame, mode) === 'installed') setInstalled(true);
      }
      const hall = ensureDgMultiHall(frame, mode);
      if (hall !== 'ready' && hall !== 'finished') {
        setMessage(hall === 'requested' ? '正在自動切到 DG 多桌廳…' : mode === 'mobile' ? '等待 DG 手機原生多桌與已核對builder就緒，尚未送單…' : '等待 DG 原生多桌入口…');
        hallAttempts++;
        if (mode === 'mobile' && (hall === 'unavailable' || hallAttempts >= 90)) setError('DG手機多桌或原生builder未就緒／版本未核對，沒有下注；請按上方「診斷」匯出安全連線資料，不需提供憑證。');
        if (hall === 'unavailable' && mode === 'desktop') setError('未能確認 DG 多桌廳入口，尚未開始下注；請核對平台版本或重連。');
        if (hall === 'cross-origin') setError('DG 不在原同源前景入口，無法自動切廳或安裝面板。');
        if (mode === 'desktop' && hallAttempts >= 90 && !dgFramePanelStatus(frame).installed) setError('DG遊戲引擎尚未就緒，面板無法掛載；請核對遊戲是否已正常開啟。');
        return;
      }
      const existing = dgFramePanelStatus(frame); preserveDgFrameLedger(frame);
      if (existing.installed) { setInstalled(true); setError(''); setMessage(existing.connected ? (frame.contentWindow?.__DG_SINGLEPAGE__?.status?.().running ? '百家工程師執行中；請核對正式接受與結算' : '面板已接上桌卡；自動下注已停止，不會自行恢復') : '面板已載入，但原生桌卡尚未接通；未送單'); return; }
      const outcome = installDgFramePanel(frame, mode);
      if (outcome === 'installed') { setInstalled(true); setError(''); return; }
      if (++attempts < 4) return;
      if (outcome === 'cross-origin') setError('DG 目前不是可存取的原同源入口，面板未安裝；請確認原平台授權及入口。');
      else if (outcome === 'blocked') setError('DG 頁面阻止面板載入，尚未啟用自動操作。');
      else if (attempts >= 90) setError('DG 載入逾時，尚未偵測到遊戲畫面。請檢查網路或重試。');
    };
    tick(); const timer = setInterval(tick, 1000);
    return () => { clearInterval(timer); stopDgFramePanel(frameRef.current); };
  }, [auth, gameUrl, authInvalid, selected, gameDevice, captureRunning]);

  useEffect(() => {
    if (!auth || !gameUrl || selected !== 'MT') return;
    let cancelled = false;
    const tick = async () => {
      const frame = frameRef.current;
      if (!frame || cancelled) return;
      if (authInvalid) { await stopMtFramePanel(frame); preserveMtFrameLedger(frame); return; }
      if (mtFrameAccessBlocked(frame)) {
        await stopMtFramePanel(frame);
        try { await (frame.contentWindow as any)?.__MT_NATIVE_CLICK__?.dispose?.(); } catch { /* denial page cleanup is best effort */ }
        if (!cancelled) { setInstalled(false); setMtAccessBlocked(true); setError('MT 代理入口收到訪問限制頁，遊戲尚未載入；原因尚未確認。可按「核對原MT入口」比對舊版直接登入方式；此按鈕不執行下注。'); setMessage('MT 遊戲未載入，已停止自動操作。'); }
        return;
      }
      if (!cancelled) setMtAccessBlocked(false);
      const before = mtFramePanelStatus(frame);
      const multi=ensureMtMultiplePage(frame);
      if(multi==='requested')setMessage('正在自動進入 MT 多台…');
      preserveMtFrameLedger(frame);
      if (before.installed) {
        if (!cancelled) { setInstalled(true); setError(''); setMessage(before.pending ? 'MT 面板已載入，平台注單確認／結算中' : 'MT 完整面板已載入'); }
        return;
      }
      const outcome = await installMtFramePanel(frame);
      if (cancelled) return;
      const after = mtFramePanelStatus(frame);
      if (outcome === 'installed' || after.installed) { setInstalled(true); setError(''); setMessage(after.pending ? 'MT 面板已載入，平台注單確認／結算中' : 'MT 完整面板已載入'); return; }
      if (outcome === 'blocked') setError('MT 頁面阻止完整面板載入（CSP 或腳本失敗）；尚未啟用自動操作。');
      else if (outcome === 'failed') setError('MT 完整面板資源載入失敗；尚未啟用自動操作。');
      else if (outcome === 'cross-origin') setError('MT 並非已確認的同源前景入口，面板未安裝。');
      else if (after.failure) setError(`MT 面板未就緒（${after.failure}）；尚未啟用自動操作。`);
      else setMessage('等待 MT 原生頁面與完整面板就緒…');
    };
    void tick(); const timer = setInterval(() => void tick(), 1000);
    return () => { cancelled = true; clearInterval(timer); stopAndPreserve(); };
  }, [auth, gameUrl, authInvalid, selected]);

  useEffect(() => {
    if(!captureRunning)return;
    const refresh=()=>setCaptureStatus(captureRef.current?.status()||null);
    refresh();const timer=setInterval(refresh,500);
    return()=>clearInterval(timer);
  },[captureRunning]);

  useEffect(()=>{
    if(Platform.OS!=='web'||!gameUrl)return;
    const leaving=(event:BeforeUnloadEvent)=>{
      stopAndPreserve();
      const pending=selected==='MT'?mtFrameHasPending(frameRef.current):dgFrameHasPending(frameRef.current);
      if(pending){event.preventDefault();event.returnValue='';}
    };
    window.addEventListener('beforeunload',leaving);
    return()=>window.removeEventListener('beforeunload',leaving);
  },[gameUrl,selected]);

  function retry() {
    if (!auth || !selected || authInvalid) return;
    if(captureRunning){setError('請先按「結束記錄」下載流程檔，再重新載入遊戲。');return;}
    stopAndPreserve();
    if (gameUrl && ((selected === 'DG' && dgFrameHasPending(frameRef.current)) || (selected === 'MT' && mtFrameHasPending(frameRef.current)))) { setDeparture('retry'); return; }
    setDeparture(null);
    if (gameUrl && frameRef.current) { setInstalled(false); setError(''); frameRef.current.src = gameUrl; return; }
    void launch(auth, selected, gameDevice);
  }
  function choosePlatform() {
    if (authInvalid) return;
    if(captureRunning){setError('請先按「結束記錄」下載流程檔，再切換平台。');return;}
    stopAndPreserve();
    if (gameUrl && ((selected === 'DG' && dgFrameHasPending(frameRef.current)) || (selected === 'MT' && mtFrameHasPending(frameRef.current)))) { setDeparture('choose'); return; }
    resetForeground();
  }

  if (!auth) return <AccessScreen notice={notice} onAuthenticated={(sessionId, token, platform) => {
    setAuthInvalid(false); setNotice(''); setError(''); setSelected(null); launchCache.current.clear(); setAuth({ sessionId, token, platform });
  }} />;
  if (!selected) return <AutoBacPlatformChoice onChoose={(target) => { if (!authInvalid) {
    const detected = detectGameDevice();
    const device = resolveGameDevice(target, 'compatible', detected);
    setGameDevice(device); setSelected(target); setDeparture(null);
  } }} onLogout={() => signOut()} />;

  function recordManualFlow() {
    if(captureRunning){
      const recorder=captureRef.current;recorder?.stop();
      try {
        if(recorder){const blob=new Blob([JSON.stringify(recorder.report(),null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob),node=document.createElement('a');node.href=url;node.download='AutoBac-DG-manual-flow.json';node.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
        setCaptureRunning(false);setMessage('記錄已結束；自動下注仍已停止，不會自動恢復。');
      } catch { setError('記錄已停止，但下載未完成；已保留資料，請再按「結束記錄」重試。'); }
      return;
    }
    try {
      const frame=frameRef.current;
      if(!frame?.contentDocument||frame.contentDocument.location.origin!==window.location.origin){setError('遊戲入口尚未可讀，不能開始流程記錄。');return;}
      stopAndPreserve();
      captureRef.current?.stop();captureRef.current=createDgOperationCapture(frame.contentWindow,window);
      setCaptureStatus(captureRef.current.status());setCaptureExpanded(false);setCaptureRunning(true);setError('');
    } catch { captureRef.current?.stop();setCaptureRunning(false);setError('DG 記錄器未能掛上原生事件，沒有自動操作；請按「診斷」匯出當前狀態。'); }
  }
  function exportMobileSourceList() {
    const data = exportDgFrameMobilePublicSources(frameRef.current);
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob), node = document.createElement('a');
    node.href = url; node.download = 'DG-mobile-script-list.json'; node.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportConnectionDiagnosis() {
    const frame = frameRef.current;
    let runtime: any = { inaccessible: true };
    try {
      if (frame?.contentDocument?.location.origin === window.location.origin) {
        const W: any = frame.contentWindow;
        if (selected === 'DG') runtime = {
          laya: !!W.Laya?.stage, mobile: W.__DG_SINGLEPAGE__?.mobileDiagnostics?.(),
          tables: W.__DG_SINGLEPAGE__?.diagnostics?.() || [],
          state: W.__DG_SINGLEPAGE__?.status?.().running ? 'running' : 'stopped',
          surface: W.__DG_SINGLEPAGE__?.runtimeDiagnostics?.() || null,
          scripts: exportDgFrameMobilePublicSources(frame).scripts,
        };
        else { const report = W.__MT_AUTOBAC_DIAG__?.report?.(); runtime = {
          accessRestricted: mtFrameAccessBlocked(frame), marker: !!W.__AUTOBAC_MT_FOREGROUND__,
          tables: (report?.tableViewport?.tables || []).map((row: any) => ({name: row.name, tableId: row.tableId})),
          walletSynced: typeof report?.betObservation?.memberBalance === 'number',
          failure: mtFramePanelStatus(frame).failure,
        }; }
      }
    } catch { /* keep a credential-free inaccessible status */ }
    const data = {version: '3.2.1-mobile-capture', platform: selected, requestedDevice: gameDevice, outerViewport:captureDgViewport(window), hasError: !!error, errorCode: error.match(/session_invalid|foreground_origin_required|invalid_mt_launch|entry_response_invalid/)?.[0] || null, runtime};
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob), node = document.createElement('a');
    node.href = url; node.download = `AutoBac-${selected}-connection-diagnostic.json`; node.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const mt = selected === 'MT';
  return <View style={s.page}>
    <AutoBacGameHeader platform={selected} installed={installed} disabled={authInvalid} onReconnect={() => retry()} onLogout={() => {captureRef.current?.stop();setCaptureRunning(false);signOut();}} onSelectPlatform={() => choosePlatform()} onDiagnostics={exportConnectionDiagnosis} onRecord={selected==='DG'?recordManualFlow:undefined} recording={captureRunning} />
    <View style={s.game}>
      {gameUrl && Platform.OS === 'web' ? createElement('iframe', {
        key: selected,
        ref: (node: HTMLIFrameElement | null) => { frameRef.current = node; }, src: gameUrl,
        title: `${selected} 真人遊戲`, referrerPolicy: 'no-referrer', allow: 'clipboard-read; clipboard-write; fullscreen; autoplay',
        style: { width: '100%', height: '100%', border: 0, background: '#000' },
        onLoad: () => { if (!mt && frameRef.current&&!captureRunning) ensureDgMultiHall(frameRef.current, /^\/ddnewwap\//.test(gameUrl) ? 'mobile' : 'desktop'); },
      }) : <View style={s.loading}><View style={s.loadingMark}><Text style={s.loadingLetter}>{selected}</Text></View><Text style={s.loadingTitle}>正在進入 {selected}</Text><Text style={s.loadingText}>{message}</Text></View>}
      {captureRunning?<View testID="dg-live-diagnostics" style={s.captureBox}>
        <View style={s.captureHeading}><Text style={s.captureTitle}>{captureStatus?.recording?'DG 即時診斷':'記錄已停止'} · {captureStatus?.elapsedSeconds||0}秒</Text><Pressable onPress={()=>setCaptureExpanded(value=>!value)}><Text style={s.toolText}>{captureExpanded?'收合':'詳情'}</Text></Pressable></View>
        <Text style={s.captureText}>連線 {captureStatus?.socketDetected?'已偵測':'未偵測'} · 餘額 {captureStatus?.wallet===null||captureStatus?.wallet===undefined?'待同步':captureStatus.wallet.toLocaleString('zh-TW')}</Text>
        <Text style={s.captureText}>桌卡 {captureStatus?.completeCards||0}/{captureStatus?.cardCandidates||0} · 送出 {captureStatus?.sent||0} · 接受 {captureStatus?.accepted||0} · 結算 {captureStatus?.settled||0}</Text>
        {captureExpanded?<View style={{gap:4}}>
          <Text style={s.captureText}>籌碼值：{captureStatus?.selectedChip===null||captureStatus?.selectedChip===undefined?'未偵測':captureStatus.selectedChip.toLocaleString('zh-TW')}</Text>
          <Text style={s.captureText}>方向點擊：{captureStatus?.directionClick?'已偵測':'未偵測'} · 確認點擊：{captureStatus?.confirmClick?'已偵測':'未偵測'}</Text>
          <Text style={s.captureText}>原生送出：{captureStatus?.sent?'已偵測':'未偵測'} · 平台接受：{captureStatus?.accepted?'已偵測匹配回覆':'未偵測'}</Text>
          <Text style={s.captureText}>正式結算：{captureStatus?.settled?'已偵測匹配回覆':'未偵測'}</Text>
          <Text style={s.captureText}>桌卡缺欄位：{captureStatus?.missing.length?captureStatus.missing.join(' / '):captureStatus?.cardCandidates?'未缺欄位（非下注成功）':'尚無桌卡候選'}</Text>
          <Text style={s.captureNote}>確認點擊不是下注成功；僅顯示同桌同局的原生接受與結算回覆。若點擊未識別仍會記錄未知控制項。</Text>
        </View>:null}
        <Text style={s.captureNote}>只讀記錄 · 工具自動下注已停止</Text>
        <Pressable onPress={recordManualFlow} style={s.retry}><Text style={s.toolText}>結束記錄並下載</Text></Pressable>
      </View>:null}
      {mt && gameUrl && !mtAccessBlocked ? <View testID="mt-native-status" style={s.mtStatus}><Text style={s.mtStatusText}>{installed ? 'MT 同源原生入口 · 完整面板已接通' : 'MT 同源原生入口 · 等待完整面板'}</Text></View> : null}
      {selected === 'DG' && !installed && gameUrl ? <View testID="dg-install-status" style={s.mtStatus}><Text style={s.mtStatusText}>{message || 'DG 遊戲引擎載入中 · 尚未啟用自動操作'}</Text>{/^\/ddnewwap\//.test(gameUrl) ? <Pressable onPress={exportMobileSourceList}><Text style={s.toolText}>匯出 DG 手機腳本清單（不含憑證）</Text></Pressable> : null}</View> : null}
      {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text><View style={{gap: 6}}><Pressable onPress={() => retry()} disabled={authInvalid} style={s.retry}><Text style={s.toolText}>重試</Text></Pressable>{mtAccessBlocked && nativeMtLaunch.current ? <Pressable onPress={() => {
        stopAndPreserve();
        window.open(nativeMtLaunch.current, '_blank', 'noopener,noreferrer');
      }} style={s.retry}><Text style={s.toolText}>核對原MT入口</Text></Pressable> : null}<Pressable onPress={exportConnectionDiagnosis} style={s.retry}><Text style={s.toolText}>匯出連線診斷</Text></Pressable></View></View> : null}
      {departure ? <View testID="pending-departure" style={s.pendingBox}>
        <Text style={s.errorText}>{mt ? 'MT 完整面板已停止新增操作，但仍有待確認／待結算或無法安全讀取的原生注單。請先在面板核對；切換、重連或登出不會取消平台已接受的下注。' : '已停止新增下注。仍有待結算／未核對注單，請先在面板核對後再切換、重連或登出。這些操作不會取消已接受的注單。'}</Text>
        <View style={{ gap: 8 }}><Pressable onPress={() => setDeparture(null)} style={s.retry}><Text style={s.toolText}>返回核對</Text></Pressable>
          {mt && !authInvalid ? <Pressable testID="mt-confirm-departure" onPress={() => {
            stopAndPreserve();
            if(mtFrameHasPending(frameRef.current)){setError('仍有待確認／待結算或狀態未確定的注單，不能直接切換或重連。');return;}
            if (departure === 'choose') resetForeground();
            else if (departure === 'retry' && frameRef.current) { setInstalled(false); setError(''); frameRef.current.src = gameUrl; setDeparture(null); }
            else signOut('', true);
          }} style={s.retry}><Text style={s.toolText}>重新檢查並繼續</Text></Pressable> : null}
          {authInvalid ? <Pressable onPress={() => signOut('請重新登入並核對平台正式下注紀錄。', true)} style={s.retry}><Text style={s.toolText}>已核對，離開重登</Text></Pressable> : null}
        </View>
      </View> : null}
    </View>
  </View>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080e13' }, game: { flex: 1, position: 'relative' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }, loadingMark: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#243b3b', alignItems: 'center', justifyContent: 'center' },
  loadingLetter: { color: '#85b8a4', fontSize: 20, fontWeight: '800' }, loadingTitle: { color: '#ecf1ed', fontSize: 19, fontWeight: '700' }, loadingText: { color: '#97aaa9', fontSize: 12 },
  errorBox: { position: 'absolute', top: 12, left: 12, right: 12, padding: 14, backgroundColor: '#3d252b', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pendingBox: { position: 'absolute', left: 14, right: 14, bottom: 18, padding: 16, backgroundColor: '#243630', borderWidth: 1, borderColor: '#547267', borderRadius: 12, gap: 12 },
  errorText: { color: '#f0e9e1', fontSize: 12, lineHeight: 19, flexShrink: 1 }, retry: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 6, backgroundColor: '#4d6658' }, toolText: { color: '#d4e5df', fontSize: 11, fontWeight: '600' },
  captureBox: { position:'absolute',left:10,bottom:82,width:245,maxWidth:'90%',padding:10,gap:5,backgroundColor:'#152a2a',borderColor:'#73958c',borderWidth:1,borderRadius:9 },
  captureHeading: { flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8 },
  captureTitle: { color:'#e2eee7',fontSize:11,fontWeight:'700' },captureText: { color:'#d1e6da',fontSize:10,lineHeight:15 },captureNote: { color:'#a7bdb0',fontSize:9,lineHeight:13 },
  mtStatus: { position: 'absolute', left: 10, bottom: 10, padding: 9, borderRadius: 7, backgroundColor: '#28372c' }, mtStatusText: { color: '#c9d2c0', fontSize: 10 },
});
