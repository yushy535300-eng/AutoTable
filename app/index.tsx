import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AccessScreen, getDgLoginUrlFromPlatform } from '@/lib/legacy-platform-screen';
import { trpc } from '@/lib/trpc';
import {
  enterDgForeground,
  installDgFramePanel,
  stopDgFramePanel,
  dgFrameHasPending,
  dgFramePanelStatus,
  preserveDgFrameLedger,
} from '@/lib/dg-frame-installer';

type Auth = { sessionId: string; token: string; platform: 'TZ' | 'OFA' };

/** DG-only entry. Never mount the old dashboard or its wallet/other-provider effects. */
export default function DgOnlyScreen() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [gameUrl, setGameUrl] = useState('');
  const [message, setMessage] = useState('正在取得 DG 授權…');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingNotice, setPendingNotice] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [authInvalid, setAuthInvalid] = useState(false);
  const [compactTools, setCompactTools] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const launchRef = useRef<{ sessionId: string; promise: Promise<string> } | null>(null);
  const launchBusy = useRef(false);
  const generation = useRef(0);
  const authorizedUrl = useRef('');
  const logoutMutation = trpc.trackerAccess.logout.useMutation();
  const check = trpc.trackerAccess.checkSession.useQuery(
    { sessionId: auth?.sessionId || 'not-authenticated' },
    { enabled: !!auth, refetchInterval: 30000, retry: 1 },
  );

  const launch = useCallback(async (current: Auth) => {
    if (launchBusy.current) return;
    launchBusy.current = true;
    const token = generation.current;
    setError('');
    setMessage('正在取得 DG 授權…');
    setInstalled(false);
    try {
      if (Platform.OS !== 'web') throw new Error('這個版本請使用手機或電腦瀏覽器開啟。');
      if (!launchRef.current || launchRef.current.sessionId !== current.sessionId) {
        const promise = getDgLoginUrlFromPlatform(current.platform, current.token);
        launchRef.current = { sessionId: current.sessionId, promise };
        // A rejected authorization can be retried only by a new explicit attempt.
        void promise.catch(() => {
          if (launchRef.current?.promise === promise) launchRef.current = null;
        });
      }
      const url = await launchRef.current.promise;
      if (token !== generation.current) return;
      authorizedUrl.current = url;
      setMessage('正在開啟 DG…');
      const foreground = await enterDgForeground(current.sessionId, url);
      if (token !== generation.current) return;
      setGameUrl(foreground);
      setMessage('正在載入 DG 與百家工程師面板…');
    } catch (e: any) {
      if (token === generation.current) {
        setError(e?.message || 'DG 載入失敗，請重試。');
        setMessage('DG 尚未開啟');
      }
    } finally { if (token === generation.current) launchBusy.current = false; }
  }, []);

  useEffect(() => {
    if (auth) void launch(auth);
  }, [auth, launch]);

  const signOut = useCallback((reason = '', force = false) => {
    stopDgFramePanel(frameRef.current);
    preserveDgFrameLedger(frameRef.current);
    if (!force && dgFrameHasPending(frameRef.current)) {
      setPendingNotice(true);
      return;
    }
    generation.current++;
    launchBusy.current = false;
    launchRef.current = null;
    authorizedUrl.current = '';
    const sessionId = auth?.sessionId;
    setAuth(null);
    setGameUrl('');
    setInstalled(false);
    setPendingNotice(false);
    setNotice(reason);
    if (sessionId) void logoutMutation.mutateAsync({ sessionId }).catch(() => {});
  }, [auth, logoutMutation.mutateAsync]);

  useEffect(() => {
    if (auth && check.data?.valid === false) {
      setAuthInvalid(true);
      setError('登入授權已失效，已停止新增下注；先核對現有注單，再重新登入。');
      signOut('登入授權已失效，已停止新增下注，請重新登入。');
    }
  }, [auth, check.data, signOut]);

  useEffect(() => {
    if (!auth || !gameUrl) return;
    let attempts = 0;
    const tick = () => {
      const frame = frameRef.current;
      if (!frame) return;
      if (authInvalid) { stopDgFramePanel(frame); preserveDgFrameLedger(frame); return; }
      const existing = dgFramePanelStatus(frame);
      preserveDgFrameLedger(frame);
      if (existing.installed) {
        setInstalled(true);
        setError('');
        setMessage(existing.connected ? '百家工程師已連線' : '面板已載入，請在 DG 顯示多桌畫面');
        return;
      }
      const outcome = installDgFramePanel(frame);
      if (outcome === 'installed') { setInstalled(true); setError(''); return; }
      // Ignore initial about:blank or a loading document for a short interval.
      if (++attempts < 4) return;
      if (outcome === 'cross-origin') {
        setError('DG 目前不是可存取的原同源入口，面板未安裝；請確認原平台授權及入口。');
      } else if (outcome === 'blocked') {
        setError('DG 頁面阻止面板載入，尚未啟用自動操作。');
      } else if (attempts >= 90) {
        setError('DG 載入逾時，尚未偵測到遊戲畫面。請檢查網路或重試。');
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => { clearInterval(timer); stopDgFramePanel(frameRef.current); };
  }, [auth, gameUrl, authInvalid]);

  function retry() {
    if (!auth || authInvalid) return;
    stopDgFramePanel(frameRef.current);
    if (dgFrameHasPending(frameRef.current)) { setPendingNotice(true); return; }
    // Do not request a second DG token or reload pending wagers in the background.
    if (gameUrl && frameRef.current) {
      setInstalled(false);
      setError('');
      frameRef.current.src = gameUrl;
      return;
    }
    void launch(auth);
  }

  if (!auth) {
    return <AccessScreen notice={notice} onAuthenticated={(sessionId, token, platform) => {
      setAuthInvalid(false); setNotice(''); setError(''); setAuth({ sessionId, token, platform });
    }} />;
  }

  return <View style={s.page}>
    <View style={s.toolbar}>
      <View style={s.brand}><View style={[s.dot, { backgroundColor: installed ? '#65b59b' : '#aa9d72' }]} /><Text style={s.brandText}>百家工程師</Text></View>
      {!compactTools ? <View style={s.actions}>
        <Pressable style={s.toolButton} onPress={retry}><Text style={s.toolText}>重連</Text></Pressable>
        <Pressable style={s.toolButton} onPress={() => signOut()}><Text style={s.toolText}>登出</Text></Pressable>
      </View> : null}
      <Pressable style={s.collapse} onPress={() => setCompactTools(v => !v)} accessibilityLabel={compactTools ? '展開工具列' : '收起工具列'}><Text style={s.toolText}>{compactTools ? '＋' : '－'}</Text></Pressable>
    </View>
    <View style={s.game}>
      {gameUrl && Platform.OS === 'web' ? createElement('iframe', {
        ref: (node: HTMLIFrameElement | null) => { frameRef.current = node; },
        src: gameUrl,
        title: 'DG 真人遊戲',
        allow: 'clipboard-read; clipboard-write; fullscreen; autoplay',
        style: { width: '100%', height: '100%', border: 0, background: '#000' },
        onLoad: () => { if (frameRef.current) installDgFramePanel(frameRef.current); },
      }) : <View style={s.loading}><View style={s.loadingMark}><Text style={s.loadingLetter}>DG</Text></View><Text style={s.loadingTitle}>正在進入 DG</Text><Text style={s.loadingText}>{message}</Text></View>}
      {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text><Pressable onPress={retry} disabled={authInvalid} style={s.retry}><Text style={s.toolText}>重試</Text></Pressable></View> : null}
      {pendingNotice ? <View style={s.pendingBox}><Text style={s.errorText}>已停止新增下注。仍有待結算／未核對注單，請先在面板核對後再重連或登出；這些操作不會取消已接受的下注。</Text><View style={{ gap: 8 }}><Pressable onPress={() => setPendingNotice(false)} style={s.retry}><Text style={s.toolText}>返回核對</Text></Pressable>{authInvalid ? <Pressable onPress={() => signOut("請重新登入並核對平台正式下注紀錄。", true)} style={s.retry}><Text style={s.toolText}>已核對，離開重登</Text></Pressable> : null}</View></View> : null}
    </View>
  </View>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080e13' },
  toolbar: { height: 42, paddingHorizontal: 14, backgroundColor: '#101b23', borderBottomWidth: 1, borderBottomColor: '#263840', flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  brandText: { color: '#edf3ef', fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 6 },
  toolButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#23343b' },
  collapse: { paddingHorizontal: 10, paddingVertical: 6 },
  toolText: { color: '#d4e5df', fontSize: 11, fontWeight: '600' },
  game: { flex: 1, position: 'relative' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingMark: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#243b3b', alignItems: 'center', justifyContent: 'center' },
  loadingLetter: { color: '#85b8a4', fontSize: 20, fontWeight: '800' },
  loadingTitle: { color: '#ecf1ed', fontSize: 19, fontWeight: '700' },
  loadingText: { color: '#97aaa9', fontSize: 12 },
  errorBox: { position: 'absolute', top: 12, left: 12, right: 12, padding: 14, backgroundColor: '#3d252b', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pendingBox: { position: 'absolute', left: 14, right: 14, bottom: 18, padding: 16, backgroundColor: '#243630', borderWidth: 1, borderColor: '#547267', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  errorText: { color: '#f0e9e1', fontSize: 12, lineHeight: 19, flex: 1 },
  retry: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 6, backgroundColor: '#4d6658' },
});
