import { afterEach, describe, expect, it, vi } from 'vitest';
import { installMtFramePanel, mtFrameHasPending, mtFramePanelStatus, preserveMtFrameLedger, ensureMtMultiplePage, enterMtForeground } from '../lib/mt-frame-installer';

const parentWindow: any = { location: { origin: 'https://autobac.example' } };
function marker() { return Object.freeze({ kind: 'autobac-mt-foreground-v1', version: 1, pathPrefix: '/mt-game', ledgerKey:'mt.session.'+'a'.repeat(32) }); }
function frameFixture(options: { loading?: boolean; marker?: boolean; aboutBlank?: boolean; pending?: boolean; install?: boolean } = {}) {
  const win: any = {
    parent: parentWindow,
    sessionStorage: { setItem: vi.fn() },
    location: { origin: 'https://autobac.example', pathname: '/mt-game/', href: options.aboutBlank ? 'about:blank' : 'https://autobac.example/mt-game/' },
  };
  if (options.marker !== false) Object.defineProperty(win, '__AUTOBAC_MT_FOREGROUND__', { value: marker(), writable: false, configurable: false });
  if (options.install) win.__MT_NATIVE_CLICK__ = { version: '0.6.1-official-turnover', view: () => ({ pending: options.pending ? 1 : 0, bets: options.pending ? [{ state: 'uncertain' }] : [] }) };
  const script: any = { dataset: {}, remove: vi.fn() };
  const doc: any = {
    readyState: options.loading ? 'loading' : 'complete',
    location: win.location,
    documentElement: { appendChild: vi.fn(() => { win.__MT_NATIVE_CLICK__ = { version: '0.6.1-official-turnover', view: () => ({ pending: 0, bets: [] }) }; return script; }) },
    querySelector: vi.fn(() => null),
    createElement: vi.fn(() => script),
  };
  return { frame: { contentWindow: win, contentDocument: doc } as any, win, doc };
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('MT same-origin frame installer', () => {
  it('fails closed for loading/about:blank/no-marker frames rather than treating a normal value as authorization', async () => {
    const oldWindow = (globalThis as any).window;
    (globalThis as any).window = parentWindow;
    try {
      for (const fixture of [frameFixture({ loading: true }), frameFixture({ aboutBlank: true }), frameFixture({ marker: false })]) {
        expect(mtFramePanelStatus(fixture.frame).ready).toBe(false);
        expect(mtFrameHasPending(fixture.frame)).toBe(true);
        await expect(installMtFramePanel(fixture.frame)).resolves.toBe('cross-origin');
      }
    } finally { (globalThis as any).window = oldWindow; }
  });

  it('injects only into a complete marked same-origin MT frame and reports an HTTP failure instead of a false install', async () => {
    const oldWindow = (globalThis as any).window;
    (globalThis as any).window = parentWindow;
    try {
      const valid = frameFixture();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('/* official native console source */'.padEnd(180, 'x'), { status: 200 })));
      await expect(installMtFramePanel(valid.frame)).resolves.toBe('installed');
      expect(valid.doc.createElement).toHaveBeenCalledWith('script');
      expect(mtFramePanelStatus(valid.frame)).toMatchObject({ installed: true, pending: false, ready: true });

      const failed = frameFixture();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not found', { status: 404 })));
      await expect(installMtFramePanel(failed.frame)).resolves.toBe('failed');
      expect(mtFramePanelStatus(failed.frame)).toMatchObject({ installed: false, ready: true });
    } finally { (globalThis as any).window = oldWindow; }
  });

  it('recognizes formal submitted/accepted/uncertain native runner state as departure-blocking', () => {
    const oldWindow = (globalThis as any).window;
    (globalThis as any).window = parentWindow;
    try {
      const pending = frameFixture({ install: true, pending: true });
      expect(mtFramePanelStatus(pending.frame)).toMatchObject({ installed: true, pending: true, uncertain: true });
      expect(mtFrameHasPending(pending.frame)).toBe(true);
    } finally { (globalThis as any).window = oldWindow; }
  });

  it('preserves formal local bets only under the verified login-scoped key', () => {
    const oldWindow = (globalThis as any).window;
    (globalThis as any).window = parentWindow;
    try {
      const fixture=frameFixture({install:true});
      const ledger={bets:[{state:'uncertain',amount:100}]};
      fixture.win.__MT_NATIVE_CLICK__.state=()=>ledger;
      preserveMtFrameLedger(fixture.frame);
      expect(fixture.win.sessionStorage.setItem).toHaveBeenCalledWith('mt.session.'+'a'.repeat(32),JSON.stringify(ledger));
      const unverified=frameFixture({marker:false,install:true});
      unverified.win.__MT_NATIVE_CLICK__.state=()=>ledger;
      preserveMtFrameLedger(unverified.frame);
      expect(unverified.win.sessionStorage.setItem).not.toHaveBeenCalled();
    } finally { (globalThis as any).window = oldWindow; }
  });

  it('uses the one native multi-table tab once and never navigates with an uncertain bet', () => {
    vi.stubGlobal('window',parentWindow);
    const fixture=frameFixture({install:true});
    const tab:any={textContent:'多台',closest:()=>tab,getBoundingClientRect:()=>({width:50,height:30}),hasAttribute:()=>false,getAttribute:()=>null,click:vi.fn()};
    fixture.win.getComputedStyle=()=>({display:'block',visibility:'visible'});
    fixture.doc.querySelectorAll=(selector:string)=>selector==='.multiple'?[]:[tab];
    expect(ensureMtMultiplePage(fixture.frame)).toBe('requested');
    expect(ensureMtMultiplePage(fixture.frame)).toBe('waiting');
    expect(tab.click).toHaveBeenCalledTimes(1);
    const pending=frameFixture({install:true,pending:true});
    pending.win.getComputedStyle=fixture.win.getComputedStyle;
    pending.doc.querySelectorAll=fixture.doc.querySelectorAll;
    expect(ensureMtMultiplePage(pending.frame)).toBe('blocked');
    expect(tab.click).toHaveBeenCalledTimes(1);
  });

  it('keeps only the authorized native token in its local iframe query so the MT client can log in', async () => {
    vi.stubGlobal('window',parentWindow);
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true,url:'/mt-game/'}),{status:200})));
    const url=await enterMtForeground('offline-session','https://gsa.ofalive99.net/?token=own-offline-token&lang=zhtw');
    expect(url).toBe('/mt-game/?token=own-offline-token&lang=zhtw');
  });
});
