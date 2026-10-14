import { describe, expect, it, vi } from 'vitest';
import {
  MT_GAME_PREFIX,
  MT_UPSTREAM_ORIGIN,
  isMtForegroundEnterRequest,
  mtProxyCookieSecureAttr,
  parseMtLaunchUrl,
  registerMtGameProxy,
  rewriteMtAssetText,
  rewriteMtHtml,
} from '../server/mt-game-proxy';

type Handler = (req: any, res: any) => any;
function fakeApp() {
  const posts = new Map<string, Handler>();
  const uses = new Map<string, Handler>();
  return {
    posts, uses,
    post(path: string, handler: Handler) { posts.set(path, handler); return this; },
    use(path: string, handler: Handler) { uses.set(path, handler); return this; },
  };
}
function fakeResponse() {
  const headers = new Map<string, string>();
  return {
    code: 200, body: undefined as unknown, headers, headersSent: false,
    status(code: number) { this.code = code; return this; },
    setHeader(name: string, value: string) { headers.set(name.toLowerCase(), value); return this; },
    type() { return this; },
    json(body: unknown) { this.body = body; this.headersSent = true; return this; },
    send(body: unknown) { this.body = body; this.headersSent = true; return this; },
    end() { this.headersSent = true; return this; },
  };
}
const localHeaders = { host: 'autobac.example', origin: 'https://autobac.example', 'x-forwarded-proto': 'https' };

describe('MT foreground proxy boundaries', () => {
  it('accepts only the exact tracker-issued gsa root token launch', () => {
    expect(parseMtLaunchUrl('https://gsa.ofalive99.net/?token=abc&lang=zhtw')).toEqual({ pathAndSearch: '/?token=abc&lang=zhtw', origin: 'https://gsa.ofalive99.net' });
    for (const invalid of [
      'http://gsa.ofalive99.net/?token=abc&lang=zhtw',
      'https://evil.test/?token=abc&lang=zhtw',
      'https://gsa.ofalive99.net/game?token=abc&lang=zhtw',
      'https://gsa.ofalive99.net/?token=abc&lang=en',
      'https://user@gsa.ofalive99.net/?token=abc&lang=zhtw',
      'https://gsa.ofalive99.net/?lang=zhtw',
    ]) expect(parseMtLaunchUrl(invalid)).toBeNull();
  });

  it('requires same-origin foreground XHR and derives public HTTPS cookie settings without NODE_ENV', () => {
    expect(isMtForegroundEnterRequest({ headers: localHeaders } as any)).toBe(true);
    expect(isMtForegroundEnterRequest({ headers: { ...localHeaders, origin: 'https://attacker.test' } } as any)).toBe(false);
    expect(isMtForegroundEnterRequest({ headers: { host: 'autobac.example' } } as any)).toBe(false);
    expect(mtProxyCookieSecureAttr({ headers: { 'x-forwarded-proto': 'https' } } as any)).toBe('; Secure');
    expect(mtProxyCookieSecureAttr({ headers: { 'x-forwarded-proto': 'http' }, secure: false, protocol: 'http' } as any)).toBe('');
  });

  it('rewrites gsa HTTP assets into the constrained prefix and injects the early native observer', () => {
    const html = rewriteMtHtml('<html><head><script src="/assets/main.js"></script></head><body><link href="https://gsa.ofalive99.net/css/a.css?token=leak"></body></html>');
    expect(html).toContain(`${MT_GAME_PREFIX}/assets/main.js`);
    expect(html).toContain(`${MT_GAME_PREFIX}/css/a.css`);
    expect(html).not.toContain('token=leak');
    expect(html).toContain('__AUTOBAC_MT_FOREGROUND__');
    expect(html).toContain('new Proxy(Ctor');
    expect(html).toContain('src="/mt-native-click-console.js"');
  });

  it('never rewrites native WebSocket command strings while mapping real browser assets', () => {
    const raw='const api="/api/v1/member/me";const bet="/api/v1/gametype/3/game/1/bet";const ws="wss://a1.ofalive99.net/game/ws";import("/assets/main.js");const sprite="/images/chip.png";';
    const patched=rewriteMtAssetText(raw);
    expect(patched).toContain('api="/api/v1/member/me"');
    expect(patched).toContain('bet="/api/v1/gametype/3/game/1/bet"');
    expect(patched).toContain('wss://a1.ofalive99.net/game/ws');
    expect(patched).toContain('"/mt-game/assets/main.js"');
    expect(patched).toContain('"/mt-game/images/chip.png"');
  });

  it('embeds only an opaque login-scoped ledger namespace, not an account or game token', () => {
    const key='mt.session.'+'a'.repeat(32);
    const html=rewriteMtHtml('<head></head>',key);
    expect(html).toContain(`ledgerKey:"${key}"`);
    expect(rewriteMtHtml('<head></head>','other-account-secret')).not.toContain('other-account-secret');
  });

  it('keeps the token and upstream cookies server-side in a fixed-host GET-only fetch-mock route', async () => {
    const app = fakeApp();
    const upstreamFetch = vi.fn<typeof fetch>().mockImplementation(async () => new Response('<!doctype html><head></head><body><script src="/assets/app.js"></script></body>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'set-cookie': 'mt_upstream=isolated; Path=/; HttpOnly' },
    }));
    registerMtGameProxy({ app: app as any, hasActiveSession: (id) => id === 'tracker-A', fetchImpl: upstreamFetch as unknown as typeof fetch, createSessionId: () => 'opaque-session-A' });
    const enter = fakeResponse();
    await app.posts.get('/api/mt/proxy/enter')!({ method: 'POST', headers: localHeaders, body: { sessionId: 'tracker-A', gameUrl: 'https://gsa.ofalive99.net/?token=secret-token&lang=zhtw' } }, enter);
    expect(enter.code).toBe(200);
    expect(enter.body).toEqual({ ok: true, url: '/mt-game/' });
    const browserCookie = enter.headers.get('set-cookie')!;
    expect(browserCookie).toContain('HttpOnly');
    expect(browserCookie).toContain('SameSite=None;');
    expect(browserCookie).toContain('Secure');
    expect(browserCookie).not.toContain('secret-token');

    const asset = fakeResponse();
    await app.uses.get(MT_GAME_PREFIX)!({ method: 'GET', originalUrl: '/mt-game/', url: '/mt-game/', headers: { cookie: browserCookie.split(';')[0], accept: 'text/html' } }, asset);
    expect(upstreamFetch).toHaveBeenCalledTimes(1);
    const [target, init] = upstreamFetch.mock.calls[0]!;
    expect(String(target)).toBe(`${MT_UPSTREAM_ORIGIN}/?token=secret-token&lang=zhtw`);
    expect(String(target)).toContain(MT_UPSTREAM_ORIGIN);
    expect((init?.headers as Headers).get('cookie')).toBeNull();
    expect(String(asset.body)).toContain('/mt-game/assets/app.js');
    expect(String(asset.body)).not.toContain('secret-token');
    expect(asset.headers.get('cache-control')).toContain('no-store');

    const followup = fakeResponse();
    await app.uses.get(MT_GAME_PREFIX)!({ method: 'GET', originalUrl: '/mt-game/api/v1/tables?lang=zhtw', url: '/mt-game/api/v1/tables?lang=zhtw', headers: { cookie: browserCookie.split(';')[0] } }, followup);
    const [followupTarget, followupInit] = upstreamFetch.mock.calls[1]!;
    expect(String(followupTarget)).toBe(`${MT_UPSTREAM_ORIGIN}/api/v1/tables?lang=zhtw`);
    expect((followupInit?.headers as Headers).get('cookie')).toBe('mt_upstream=isolated');

    const rejected = fakeResponse();
    await app.uses.get(MT_GAME_PREFIX)!({ method: 'POST', originalUrl: '/mt-game/api/v1/bet', url: '/mt-game/api/v1/bet', headers: { cookie: browserCookie.split(';')[0] } }, rejected);
    expect(rejected.code).toBe(405);
    expect(upstreamFetch).toHaveBeenCalledTimes(2);

    const native=fakeResponse();
    await app.uses.get(MT_GAME_PREFIX)!({method:'GET',originalUrl:'/mt-game/?token=secret-token&lang=zhtw',headers:{cookie:browserCookie.split(';')[0]}},native);
    expect(native.code).toBe(200);
    expect(native.headers.get('referrer-policy')).toBe('no-referrer');
    expect(upstreamFetch).toHaveBeenCalledTimes(3);
    for(const pathname of ['/mt-game/?token=wrong-token&lang=zhtw','/mt-game/assets/app.js?token=secret-token']){
      const wrong=fakeResponse();
      await app.uses.get(MT_GAME_PREFIX)!({method:'GET',originalUrl:pathname,headers:{cookie:browserCookie.split(';')[0]}},wrong);
      expect(wrong.code).toBe(401);
    }
    expect(upstreamFetch).toHaveBeenCalledTimes(3);
  });
});
