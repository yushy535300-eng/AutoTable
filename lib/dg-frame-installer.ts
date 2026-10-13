import { DG_CONSOLE_SOURCE } from './dg-console-source';

export type DgFrame = { contentWindow: any; contentDocument: Document | null };
export type DgInstallResult = 'waiting' | 'installed' | 'cross-origin' | 'blocked';

/** Existing same-origin foreground only; no cross-origin DOM access workaround. */
export function installDgFramePanel(frame: DgFrame): DgInstallResult {
  let win: any;
  let doc: Document | null;
  try {
    win = frame.contentWindow;
    doc = frame.contentDocument;
    if (!win || !doc) return 'cross-origin';
    if (doc.location.origin !== window.location.origin) return 'cross-origin';
    if (win.__DG_SINGLEPAGE__) return 'installed';
    if (!win.Laya?.stage?.getChildAt) return 'waiting';
  } catch {
    return 'cross-origin';
  }
  try {
    const node = doc.createElement('script');
    node.textContent = DG_CONSOLE_SOURCE;
    doc.documentElement.appendChild(node);
    node.remove();
    return win.__DG_SINGLEPAGE__ ? 'installed' : 'blocked';
  } catch {
    return 'blocked';
  }
}

export function stopDgFramePanel(frame: DgFrame | null): void {
  try { frame?.contentWindow?.__DG_SINGLEPAGE__?.stop(); } catch { /* 已切換來源 */ }
}

export function dgFrameHasPending(frame: DgFrame | null): boolean {
  if (!frame) return false;
  try {
    if (!frame.contentDocument) return true; // Unknown is not a verified empty ledger.
    return !!frame.contentWindow?.__DG_SINGLEPAGE__?.status()?.pending?.length;
  } catch { return true; }
}

export function preserveDgFrameLedger(frame: DgFrame | null): void {
  try {
    const ledger = frame?.contentWindow?.__DG_SINGLEPAGE__?.exportLedger?.();
    if (ledger) sessionStorage.setItem('dg.only.last-ledger', JSON.stringify(ledger));
  } catch { /* Never clear a prior snapshot if the frame is inaccessible. */ }
}

export function dgFramePanelStatus(frame: DgFrame | null): { installed: boolean; connected: boolean; selected: number } {
  try {
    const agent = frame?.contentWindow?.__DG_SINGLEPAGE__;
    if (!agent) return { installed: false, connected: false, selected: 0 };
    const state = agent.status();
    const tables = agent.diagnostics?.() ?? [];
    return { installed: true, connected: tables.length > 0, selected: state.selected?.length ?? 0 };
  } catch { return { installed: false, connected: false, selected: 0 }; }
}

export async function enterDgForeground(sessionId: string, gameUrl: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const result = await fetch('/api/dg/proxy/enter', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, gameUrl }),
      signal: controller.signal,
    });
    const data = await result.json();
    if (!result.ok || !data?.ok || typeof data.url !== 'string')
      throw new Error('DG 入口啟動失敗，請確認原平台授權與連線。');
    const url = new URL(data.url, window.location.origin);
    if (url.origin !== window.location.origin || !/^\/ddnew(?:pc|wap)\//.test(url.pathname))
      throw new Error('DG 入口回傳非預期來源，未載入遊戲。');
    return url.pathname + url.search + url.hash;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('DG 入口逾時，請重試。');
    throw error;
  } finally { clearTimeout(timer); }
}
