import { mtLaunchOrigin, mtLaunchSearch } from '../shared/mt-origins';

export type MtFrame = { contentWindow: any; contentDocument: Document | null };
export type MtInstallResult = 'waiting' | 'installed' | 'cross-origin' | 'blocked' | 'failed';

type MtNativeClick = {
  version?: string;
  halt?: () => Promise<void> | void;
  stop?: (reason?: string) => void;
  dispose?: () => Promise<void> | void;
  state?: () => unknown;
  view?: () => { pending?: number; bets?: Array<{ state?: string }> } | undefined;
};

const PREFIX = '/mt-game';
const KIND = 'autobac-mt-foreground-v1';
const CONSOLE_URL = '/mt-native-click-console.js';
const installing = new WeakMap<object, Promise<MtInstallResult>>();
const multipleRequested = new WeakSet<object>();

function verifiedMtWindow(frame: MtFrame | null): { win: any; doc: Document } | null {
  try {
    const win = frame?.contentWindow;
    const doc = frame?.contentDocument;
    if (!win || !doc || !doc.documentElement || doc.readyState === 'loading') return null;
    if (doc.location.href === 'about:blank' || doc.location.origin !== window.location.origin) return null;
    if (!(doc.location.pathname === PREFIX || doc.location.pathname.startsWith(`${PREFIX}/`))) return null;
    if (win.parent !== window || window.location.origin !== win.parent.location.origin) return null;
    const marker = win.__AUTOBAC_MT_FOREGROUND__;
    const descriptor = Object.getOwnPropertyDescriptor(win, '__AUTOBAC_MT_FOREGROUND__');
    if (!descriptor || descriptor.writable || descriptor.configurable || descriptor.value !== marker || !Object.isFrozen(marker)) return null;
    if (marker?.kind !== KIND || marker?.version !== 1 || marker?.pathPrefix !== PREFIX) return null;
    return { win, doc };
  } catch {
    return null;
  }
}

function nativeClick(frame: MtFrame | null): MtNativeClick | null {
  const verified = verifiedMtWindow(frame);
  const api = verified?.win.__MT_NATIVE_CLICK__ as MtNativeClick | undefined;
  return api && typeof api.view === 'function' ? api : null;
}

/** A marker, matching local prefix, parent identity, and ready DOM are all required. */
export function mtFramePanelStatus(frame: MtFrame | null): { installed: boolean; pending: boolean; uncertain: boolean; ready: boolean; failure: string | null } {
  const verified = verifiedMtWindow(frame);
  if (!verified) return { installed: false, pending: true, uncertain: true, ready: false, failure: 'foreground_unverified' };
  const api = verified.win.__MT_NATIVE_CLICK__ as MtNativeClick | undefined;
  if (!api || typeof api.view !== 'function') {
    const failure = verified.win.__AUTOBAC_MT_CONSOLE_ERROR__;
    return { installed: false, pending: false, uncertain: false, ready: true, failure: typeof failure === 'string' ? failure : null };
  }
  try {
    const view = api.view() || {};
    const bets = Array.isArray(view.bets) ? view.bets : [];
    const uncertain = bets.some((bet) => bet?.state === 'uncertain');
    const pending = uncertain || Number(view.pending || 0) > 0 || bets.some((bet) => ['reserved', 'submitted', 'accepted'].includes(String(bet?.state || '')));
    return { installed: true, pending, uncertain, ready: true, failure: null };
  } catch {
    return { installed: true, pending: true, uncertain: true, ready: true, failure: 'state_unreadable' };
  }
}

/**
 * The proxy normally loads the official source with defer before vendor scripts.
 * This fallback never injects into an arbitrary/cross-origin/about:blank frame.
 */
export async function installMtFramePanel(frame: MtFrame): Promise<MtInstallResult> {
  const verified = verifiedMtWindow(frame);
  if (!verified) return 'cross-origin';
  if (nativeClick(frame)) return 'installed';
  if (verified.win.__AUTOBAC_MT_CONSOLE_ERROR__) return 'blocked';
  // Normal proxy HTML has a defer tag before vendor scripts. Let that single
  // source execute instead of racing it with a duplicate text injection.
  if (verified.doc.querySelector('script[data-autobac-mt-console="1"]')) return 'waiting';
  const existing = installing.get(verified.win);
  if (existing) return existing;

  const operation = (async (): Promise<MtInstallResult> => {
    try {
      const response = await fetch(CONSOLE_URL, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return 'failed';
      const source = await response.text();
      if (!source || source.length < 100) return 'failed';
      // Recheck after the await: a navigation makes a previously safe frame unsafe.
      const current = verifiedMtWindow(frame);
      if (!current || current.win !== verified.win || current.doc !== verified.doc) return 'cross-origin';
      if (nativeClick(frame)) return 'installed';
      const script = current.doc.createElement('script');
      script.type = 'text/javascript';
      script.dataset.autobacMtFallback = '1';
      script.textContent = source;
      current.doc.documentElement.appendChild(script);
      script.remove();
      return nativeClick(frame) ? 'installed' : 'blocked';
    } catch {
      return 'failed';
    } finally {
      installing.delete(verified.win);
    }
  })();
  installing.set(verified.win, operation);
  return operation;
}

/** Stop new actions but intentionally retain the native observer and its in-frame ledger. */
export async function stopMtFramePanel(frame: MtFrame | null): Promise<void> {
  const api = nativeClick(frame);
  try {
    await api?.halt?.();
  } catch { /* a leaving frame must not turn into an unsafe retry */ }
}

/** Persist only the formal local runner ledger, never platform credentials or raw packets. */
export function preserveMtFrameLedger(frame: MtFrame | null): void {
  const verified = verifiedMtWindow(frame);
  const api = nativeClick(frame);
  if (!verified || !api?.state) return;
  try {
    const ledger = api.state();
    const key=verified.win.__AUTOBAC_MT_FOREGROUND__?.ledgerKey;
    if(typeof key==='string'&&/^mt\.session\.[a-f0-9]{32}$/.test(key))verified.win.sessionStorage.setItem(key, JSON.stringify(ledger));
  } catch { /* do not erase an earlier safe snapshot */ }
}

/** Unknown/cross-origin state is conservatively non-departable. */
export function mtFrameHasPending(frame: MtFrame | null): boolean {
  const state = mtFramePanelStatus(frame);
  return state.pending || state.uncertain;
}

/** Navigate through the real MT multi-table tab once; never touches betting controls. */
export function ensureMtMultiplePage(frame: MtFrame | null): 'ready' | 'requested' | 'waiting' | 'blocked' | 'unavailable' {
  const verified=verifiedMtWindow(frame);
  if(!verified)return 'waiting';
  const {win,doc}=verified;
  const visible=(element:Element)=>{
    const rect=element.getBoundingClientRect();
    const style=win.getComputedStyle(element);
    return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden';
  };
  const multiple=Array.from(doc.querySelectorAll('.multiple')).find(element=>visible(element)&&!!element.querySelector('.gameDesk_wrap,.gameDesk_bet,.gameDesk_bet_section'));
  if(multiple)return 'ready';
  if(nativeClick(frame)&&mtFrameHasPending(frame))return 'blocked';
  if(multipleRequested.has(win))return 'waiting';
  const targets=Array.from(new Set(Array.from(doc.querySelectorAll('button,[role="tab"],.ant-tabs-tab,.van-tab'))
    .filter(element=>['多台','多桌'].includes((element.textContent||'').replace(/\s+/g,'').trim()))
    .map(element=>element.closest('button,[role="tab"],.van-tab')||element)
    .filter(element=>visible(element)&&!element.hasAttribute('disabled')&&element.getAttribute('aria-disabled')!=='true')));
  if(targets.length!==1)return 'unavailable';
  multipleRequested.add(win);
  (targets[0] as HTMLElement).click();
  return 'requested';
}

export async function enterMtForeground(sessionId: string, gameUrl: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/api/mt/proxy/enter', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, gameUrl }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok || typeof data.url !== 'string') {
      const reasons: Record<string,string> = {
        session_invalid: '網站登入工作階段失效，請重新登入；不需停用白名單',
        foreground_origin_required: '網站同源入口驗證失敗，請核對部署網址',
        invalid_mt_launch: 'MT回傳的授權網址尚未被此版本支援，請更新網站入口',
      };
      const code = typeof data?.error === 'string' && Object.prototype.hasOwnProperty.call(reasons,data.error) ? data.error : 'entry_response_invalid';
      throw new Error(`MT 入口啟動失敗（HTTP ${response.status} / ${code}）：${reasons[code] || '服務回應異常，請重試或核對部署版本'}。`);
    }
    const url = new URL(data.url, window.location.origin);
    if (url.origin !== window.location.origin || !(url.pathname === PREFIX || url.pathname.startsWith(`${PREFIX}/`))) throw new Error('MT 入口回傳非預期來源，未載入遊戲。');
    // The native MT browser client reads its authorized token from location.search.
    // Keep it in this user's iframe, not in a public log or report attachment.
    const native=new URL(gameUrl);
    if(!mtLaunchOrigin(native))throw new Error('MT原生授權格式不符，未載入遊戲。');
    url.search = mtLaunchSearch(native).toString();
    return url.pathname + url.search + url.hash;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('MT 入口逾時，請重試。');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
