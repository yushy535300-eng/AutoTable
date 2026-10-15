import { describe, expect, it, vi } from 'vitest';
import { detectGameDevice } from '../lib/game-device';
import { mtLaunchOrigin, MT_MOBILE_ORIGIN } from '../shared/mt-origins';
import { parseMtLaunchUrl, registerMtGameProxy, rewriteMtHtml, rewriteMtAssetText } from '../server/mt-game-proxy';
import { enterMtForeground } from '../lib/mt-frame-installer';

const headers = { host: 'autobac.example', origin: 'https://autobac.example', 'x-forwarded-proto': 'https' };
function response() {
  return { code: 200, body: undefined as any, headers: new Map<string,string>(), headersSent: false,
    status(n:number) { this.code=n; return this; }, type(){return this;},
    setHeader(n:string,v:string){this.headers.set(n.toLowerCase(),v);return this;},
    json(v:any){this.body=v;this.headersSent=true;return this;},send(v:any){this.body=v;this.headersSent=true;return this;},end(){this.headersSent=true;return this;} };
}

describe('native mobile game launch', () => {
  it('requests Mobile for phone/iPad, not a small desktop window', () => {
    expect(detectGameDevice({ userAgent: 'Mozilla iPhone Safari' })).toBe('Mobile');
    expect(detectGameDevice({ userAgent: 'Mozilla Android Chrome' })).toBe('Mobile');
    expect(detectGameDevice({ userAgent: 'Mozilla Macintosh Safari', platform: 'MacIntel', maxTouchPoints: 5 })).toBe('Mobile');
    expect(detectGameDevice({ userAgent: 'Mozilla Windows Chrome', maxTouchPoints: 0 })).toBe('Desktop');
    expect(detectGameDevice({ userAgent: 'Mozilla Macintosh Safari', platform: 'MacIntel', maxTouchPoints: 0 })).toBe('Desktop');
  });

  it('accepts only the observed GSB root with one authorized token', () => {
    expect(parseMtLaunchUrl('https://gsb.ofalive99.net/?token=mobile-only&lang=zhtw')).toEqual({ origin: MT_MOBILE_ORIGIN, pathAndSearch: '/?token=mobile-only&lang=zhtw' });
    for (const raw of [
      'https://gsb.ofalive99.net.attacker.test/?token=abc&lang=zhtw',
      'https://gsb.ofalive99.net:444/?token=abc&lang=zhtw',
      'https://gsb.ofalive99.net/?token=a&token=b&lang=zhtw',
      'https://gsb.ofalive99.net/assets/app.js?token=a&lang=zhtw',
      'https://name@gsb.ofalive99.net/?token=a&lang=zhtw',
      'http://gsb.ofalive99.net/?token=a&lang=zhtw',
    ]) expect(mtLaunchOrigin(new URL(raw))).toBeNull();
  });

  it('maps only the active mobile assets, not desktop assets or vendor WSS commands', () => {
    const html=rewriteMtHtml('<head><script src="https://gsb.ofalive99.net/assets/mobile.js"></script></head>',undefined,MT_MOBILE_ORIGIN);
    expect(html).toContain('src="/mt-game/assets/mobile.js"');
    const script=rewriteMtAssetText('import("/assets/x.js");let api="/api/v1/game/bet";let ws="wss://a1.ofalive99.net/game/ws";let other="https://gsa.ofalive99.net/assets/desktop.js";',MT_MOBILE_ORIGIN);
    expect(script).toContain('"/mt-game/assets/x.js"');
    expect(script).toContain('"/api/v1/game/bet"');
    expect(script).toContain('"wss://a1.ofalive99.net/game/ws"');
    expect(script).toContain('"https://gsa.ofalive99.net/assets/desktop.js"');
  });

  it('pins each mobile session to GSB with its own headers and forbids a foreign token', async () => {
    const posts=new Map<string,any>(),uses=new Map<string,any>();
    const app:any={post:(path:string,handler:any)=>posts.set(path,handler),use:(path:string,handler:any)=>uses.set(path,handler)};
    const upstream=vi.fn<typeof fetch>().mockImplementation(async()=>new Response('<head><script src="/assets/mobile.js"></script></head>',{headers:{'content-type':'text/html'}}));
    registerMtGameProxy({app,hasActiveSession:id=>id==='mobile-session',createSessionId:()=> 'mobile-proxy-isolated',fetchImpl:upstream});
    const entered=response();
    posts.get('/api/mt/proxy/enter')({headers,body:{sessionId:'mobile-session',gameUrl:'https://gsb.ofalive99.net/?token=phone-native&lang=zhtw'}},entered);
    expect(entered.code).toBe(200);
    const cookie=entered.headers.get('set-cookie')!.split(';')[0];
    const document=response();
    await uses.get('/mt-game')({method:'GET',originalUrl:'/mt-game/',headers:{cookie}},document);
    const [url,options]=upstream.mock.calls[0];
    expect(String(url)).toBe('https://gsb.ofalive99.net/?token=phone-native&lang=zhtw');
    expect((options!.headers as Headers).get('origin')).toBeNull();
    expect((options!.headers as Headers).get('referer')).toBeNull();
    expect(document.body).toContain('/mt-game/assets/mobile.js');
    const wrong=response();
    await uses.get('/mt-game')({method:'GET',originalUrl:'/mt-game/?token=foreign&lang=zhtw',headers:{cookie}},wrong);
    expect(wrong.code).toBe(401);
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it('keeps the native mobile token only in the authenticated local iframe', async () => {
    vi.stubGlobal('window',{location:{origin:'https://autobac.example'}});
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true,url:'/mt-game/'}))));
    try {
      expect(await enterMtForeground('mobile-session','https://gsb.ofalive99.net/?token=phone-native&lang=zhtw')).toBe('/mt-game/?token=phone-native&lang=zhtw');
    } finally { vi.unstubAllGlobals(); }
  });
});
