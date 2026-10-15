import {isMtRestrictedHtml} from '../shared/mt-access-page';
import {withPageZoomLock} from '../shared/page-zoom-lock';
import type { Express, Request, Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import { Readable } from "node:stream";
import { MT_DESKTOP_ORIGIN, MT_TRUSTED_ORIGINS, mtLaunchOrigin, mtLaunchSearch } from "../shared/mt-origins";

/** MT is intentionally not a general-purpose HTTP proxy. */
export const MT_UPSTREAM_ORIGIN = MT_DESKTOP_ORIGIN;
export const MT_GAME_PREFIX = "/mt-game";
const COOKIE_NAME = "mt_mt_foreground_sid";
const MT_FOREGROUND_KIND = "autobac-mt-foreground-v1";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

type MtProxySession = {
  id: string;
  trackerSessionId: string;
  ledgerKey: string;
  launchPathAndSearch: string;
  upstreamOrigin: string;
  upstreamCookies: Map<string, string>;
  lastUsed: number;
};

export type RegisterMtGameProxyOptions = {
  app: Express;
  hasActiveSession: (sessionId: string) => boolean;
  /** Test-only seam; production uses the platform fetch implementation. */
  fetchImpl?: typeof fetch;
  /** Test-only seam. Values are never logged or returned to the browser. */
  createSessionId?: () => string;
};

const sessions = new Map<string, MtProxySession>();

function header(req: Pick<Request, "headers">, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

function cookieValue(raw: string | undefined, name: string): string {
  if (!raw) return "";
  for (const part of raw.split(";")) {
    const at = part.indexOf("=");
    if (at < 0 || part.slice(0, at).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(at + 1).trim());
    } catch {
      return "";
    }
  }
  return "";
}

/** Only the exact tracker-issued MT launch shape is accepted. */
export function parseMtLaunchUrl(raw: string): { pathAndSearch: string; origin: string } | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const origin = mtLaunchOrigin(url);
  if (!origin) return null;
  // Do not retain arbitrary redirect/proxy parameters from a browser-provided URL.
  const launch = new URL(origin + "/");
  launch.search = mtLaunchSearch(url).toString();
  return { pathAndSearch: launch.pathname + launch.search, origin };
}

/** Cloud Preview is HTTPS outside the Node listener; do not depend on NODE_ENV. */
export function mtProxyCookieSecureAttr(req: Pick<Request, "headers" | "secure" | "protocol">): string {
  const forwarded = header(req, "x-forwarded-proto").split(",")[0]?.trim().toLowerCase();
  return forwarded === "https" || (!forwarded && (req.secure || req.protocol === "https")) ? "; Secure" : "";
}

function requestOrigin(req: Pick<Request, "headers" | "secure" | "protocol">): string | null {
  const host = header(req, "host").trim();
  if (!host || /[\s@/\\]/.test(host)) return null;
  const forwarded = header(req, "x-forwarded-proto").split(",")[0]?.trim().toLowerCase();
  const scheme = forwarded === "https" || (!forwarded && (req.secure || req.protocol === "https")) ? "https" : "http";
  try {
    const origin = new URL(`${scheme}://${host}`).origin;
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
}

/** Enter is an authenticated same-site XHR only, never a CSRF-able form post. */
export function isMtForegroundEnterRequest(req: Pick<Request, "headers" | "secure" | "protocol">): boolean {
  const expected = requestOrigin(req);
  const supplied = header(req, "origin");
  if (!expected || !supplied) return false;
  try {
    const origin = new URL(supplied).origin;
    return origin === expected;
  } catch {
    return false;
  }
}

function getSession(req: Request, hasActiveSession: (sessionId: string) => boolean): MtProxySession | null {
  const id = cookieValue(header(req, "cookie"), COOKIE_NAME);
  const session = id ? sessions.get(id) : undefined;
  if (!session || !hasActiveSession(session.trackerSessionId)) {
    if (id) sessions.delete(id);
    return null;
  }
  session.lastUsed = Date.now();
  return session;
}

function upstreamCookieHeader(cookies: Map<string, string>): string {
  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function retainUpstreamCookies(session: MtProxySession, response: globalThis.Response): void {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const lines = headers.getSetCookie?.() ?? (() => {
    const raw = response.headers.get("set-cookie");
    return raw ? [raw] : [];
  })();
  for (const line of lines) {
    const first = String(line || "").split(";", 1)[0] || "";
    const at = first.indexOf("=");
    if (at <= 0) continue;
    const name = first.slice(0, at).trim();
    const value = first.slice(at + 1).trim();
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) || !value) continue;
    session.upstreamCookies.set(name, value);
  }
}

function upstreamHeaders(req: Request, session: MtProxySession): Headers {
  const headers = new Headers();
  for (const name of ["accept", "accept-language", "cache-control", "pragma", "range", "if-none-match", "if-modified-since", "user-agent"]) {
    const value = header(req, name);
    if (value) headers.set(name, value);
  }
  // A document GET is a navigation, not a CORS XHR. The old iframe does not
  // manufacture Origin/Referer. Asset requests retain their vendor context.
  const route = pathForRequest(req.originalUrl || req.url || "");
  if (route?.pathname !== "/") {
    if (header(req, "origin")) headers.set("origin", session.upstreamOrigin);
    headers.set("referer", `${session.upstreamOrigin}/`);
  }
  const cookies = upstreamCookieHeader(session.upstreamCookies);
  if (cookies) headers.set("cookie", cookies);
  return headers;
}

function pathForRequest(originalUrl: string): { pathname: string; search: string } | null {
  let local: URL;
  try {
    local = new URL(originalUrl, "http://mt-proxy.invalid");
  } catch {
    return null;
  }
  if (local.pathname !== MT_GAME_PREFIX && !local.pathname.startsWith(`${MT_GAME_PREFIX}/`)) return null;
  const pathname = local.pathname === MT_GAME_PREFIX ? "/" : local.pathname.slice(MT_GAME_PREFIX.length);
  if (!pathname.startsWith("/") || pathname.startsWith("//") || /[\\\u0000-\u001f]/.test(pathname)) return null;
  // Root token is checked against this authenticated proxy session below.
  return { pathname, search: local.search };
}

function upstreamUrl(session: MtProxySession, route: { pathname: string; search: string }): URL {
  const url = new URL(session.upstreamOrigin);
  url.pathname = route.pathname;
  // The hidden tracker-issued token is sent only for the MT document root.
  if (route.pathname === "/" && !route.search) {
    const queryAt = session.launchPathAndSearch.indexOf("?");
    url.search = queryAt >= 0 ? session.launchPathAndSearch.slice(queryAt) : "";
  } else url.search = route.search;
  return url;
}

function removeToken(search: URLSearchParams): void {
  for (const key of [...search.keys()]) if (key.toLowerCase() === "token") search.delete(key);
}

/** Rewrites only the fixed MT origin back into the constrained local prefix. */
export function mtProxyAssetUrl(value: string, upstreamOrigin: string = MT_UPSTREAM_ORIGIN): string {
  const raw = String(value || "").trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("data:") || raw.startsWith("javascript:")) return raw;
  const map = (url: URL) => {
    if (url.protocol !== "https:" || url.origin !== upstreamOrigin || !(MT_TRUSTED_ORIGINS as readonly string[]).includes(upstreamOrigin) || url.port || url.username || url.password) return raw;
    removeToken(url.searchParams);
    return `${MT_GAME_PREFIX}${url.pathname}${url.search}${url.hash}`;
  };
  try {
    if (/^https:\/\//i.test(raw)) return map(new URL(raw));
    if (raw.startsWith("//")) return map(new URL(`https:${raw}`));
  } catch {
    return raw;
  }
  if (raw.startsWith("/") && !raw.startsWith("//") && !(raw === MT_GAME_PREFIX || raw.startsWith(`${MT_GAME_PREFIX}/`))) return `${MT_GAME_PREFIX}${raw}`;
  return raw;
}

/** Rewrite root-relative module/CSS strings without turning arbitrary hosts into proxy targets. */
export function rewriteMtAssetText(source: string, upstreamOrigin: string = MT_UPSTREAM_ORIGIN): string {
  // Verified official mobile source derives game/chat socket hosts from this
  // exact expression. On Render it would produce a1.onrender.net/game/ws.
  // Restore the authorized vendor family only; never rewrite arbitrary host
  // reads, socket command strings, authentication bodies, or unknown origins.
  if ((MT_TRUSTED_ORIGINS as readonly string[]).includes(upstreamOrigin)) {
    const family = new URL(upstreamOrigin).hostname.split(".")[1];
    source = source.replace(/\b(?:window\.)?location\.host\.split\((['"])\.\1\)\s*\[\s*1\s*\]/g, JSON.stringify(family));
  }
  return source.replace(/(["'])(https:\/\/gs[ab1]\.ofalive99\.net(?:\/[^"'\\\s]*)?|\/\/gs[ab1]\.ofalive99\.net(?:\/[^"'\\\s]*)?|\/(?!\/|mt-game(?:\/|$))[^"'\\\s]*)\1/gi, (_whole, quote: string, url: string) => {
    // Protocol action paths (e.g. /api/v1/member/me) are not browser assets.
    // Rewriting every slash-prefixed string would corrupt native WSS commands.
    if (url.startsWith("/") && !url.startsWith("//") && !/^\/(?:assets|static|images?|img|fonts|js|css|media|video|audio|voice|res|resource|build)(?:\/|$)/i.test(url) && !/\.(?:m?js|css|json|wasm|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|otf|mp4|webm|flv|mp3|ogg|wav|html?)(?:[?#]|$)/i.test(url)) return _whole;
    return `${quote}${mtProxyAssetUrl(url, upstreamOrigin)}${quote}`;
  });
}

const MT_BOOTSTRAP = `<script data-autobac-mt-bootstrap>(function(){"use strict";var W=window,P="/mt-game";if(!((location.pathname===P||location.pathname.indexOf(P+"/")===0)&&W.parent!==W))return;try{if(W.parent.location.origin!==location.origin)return;}catch(_){return;}var marker=Object.freeze({kind:"${MT_FOREGROUND_KIND}",version:1,pathPrefix:P});try{Object.defineProperty(W,"__AUTOBAC_MT_FOREGROUND__",{value:marker,writable:false,configurable:false});}catch(_){return;}var early={records:[],sockets:[]};Object.defineProperty(W,"__AUTOBAC_MT_EARLY_WS__",{value:early,writable:false,configurable:false});function capture(socket,data){try{var raw=typeof data==="string"?data:"";if(!raw||raw.length>5000000)return;early.records.push({at:new Date().toISOString(),direction:"receive",transport:"WebSocket",endpoint:String(socket.url||""),data:raw});if(early.records.length>120)early.records.shift();}catch(_){}}function observe(socket){if(!socket||early.sockets.indexOf(socket)>=0)return;early.sockets.push(socket);if(early.sockets.length>12)early.sockets.shift();try{socket.addEventListener("message",function(event){capture(socket,event.data);});}catch(_){}try{W.dispatchEvent(new CustomEvent("autobac:mt-websocket",{detail:socket}));}catch(_){}}var Native=W.WebSocket,ProxySocket;function wrap(Ctor){return new Proxy(Ctor,{construct:function(target,args){var socket=Reflect.construct(target,args,target);observe(socket);return socket;}});}try{ProxySocket=wrap(Native);Object.defineProperty(W,"WebSocket",{configurable:true,enumerable:true,get:function(){return ProxySocket;},set:function(next){if(typeof next==="function"&&next!==ProxySocket)ProxySocket=wrap(next);}});}catch(_){}document.addEventListener("securitypolicyviolation",function(event){if(String(event.blockedURI||"").indexOf("mt-native-click-console.js")>=0)W.__AUTOBAC_MT_CONSOLE_ERROR__="csp";});W.addEventListener("error",function(event){var target=event.target;if(target&&target.getAttribute&&target.getAttribute("data-autobac-mt-console")==="1")W.__AUTOBAC_MT_CONSOLE_ERROR__="load";},true);})();</script>`;
const MT_CONSOLE_TAG = '<script defer src="/mt-native-click-console.js" data-autobac-mt-console="1"></script>';

export function rewriteMtHtml(source: string, ledgerKey?: string, upstreamOrigin: string = MT_UPSTREAM_ORIGIN): string {
  let html = source.replace(/\b(src|href|action|poster)\s*=\s*(["'])(.*?)\2/gi, (_whole, name: string, quote: string, value: string) => `${name}=${quote}${mtProxyAssetUrl(value, upstreamOrigin)}${quote}`);
  html = rewriteMtAssetText(html, upstreamOrigin).replace(/<base\b[^>]*>/gi, "");
  const bootstrap = ledgerKey && /^mt\.session\.[a-f0-9]{32}$/.test(ledgerKey) ? MT_BOOTSTRAP.replace("pathPrefix:P}", `pathPrefix:P,ledgerKey:${JSON.stringify(ledgerKey)}}`) : MT_BOOTSTRAP;
  const restricted=isMtRestrictedHtml(source);
  const accessMarker='<script>Object.defineProperty(window,"__AUTOBAC_MT_ACCESS_RESTRICTED__",{value:true,writable:false,configurable:false});</script>';
  const injection = `${bootstrap}<base href="${MT_GAME_PREFIX}/">${restricted?accessMarker:MT_CONSOLE_TAG}`;
  if (/<head(?:\s[^>]*)?>/i.test(html)) return withPageZoomLock(html.replace(/<head(?:\s[^>]*)?>/i, (tag) => `${tag}${injection}`));
  if (/<html(?:\s[^>]*)?>/i.test(html)) return withPageZoomLock(html.replace(/<html(?:\s[^>]*)?>/i, (tag) => `${tag}<head>${injection}</head>`));
  return withPageZoomLock(`<!doctype html><head>${injection}</head>${html}`);
}

function forwardResponseHeaders(upstream: globalThis.Response, res: Response): void {
  const blocked = new Set(["content-length", "content-encoding", "transfer-encoding", "connection", "keep-alive", "set-cookie", "content-security-policy", "content-security-policy-report-only", "x-frame-options", "cross-origin-opener-policy", "cross-origin-embedder-policy", "cross-origin-resource-policy"]);
  upstream.headers.forEach((value, name) => {
    if (!blocked.has(name.toLowerCase())) {
      try { res.setHeader(name, value); } catch { /* response already closed */ }
    }
  });
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Vary", "Cookie");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
}

function redirectLocation(location: string, current: URL, upstreamOrigin: string): string | null {
  let next: URL;
  try { next = new URL(location, current); } catch { return null; }
  if (next.origin !== upstreamOrigin) return null;
  removeToken(next.searchParams);
  return `${MT_GAME_PREFIX}${next.pathname}${next.search}`;
}

function isHtml(contentType: string, pathname: string): boolean {
  return /text\/html|application\/xhtml\+xml/i.test(contentType) || /(?:^|\/)index\.html?$/i.test(pathname);
}

function isRewritableText(contentType: string, pathname: string): boolean {
  return /(?:javascript|ecmascript|json|css|text\/plain)/i.test(contentType) || /\.(?:m?js|css)$/i.test(pathname);
}

function purgeExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) if (now - session.lastUsed > SESSION_TTL_MS) sessions.delete(id);
}

export function registerMtGameProxy(options: RegisterMtGameProxyOptions): void {
  const { app, hasActiveSession, fetchImpl = fetch, createSessionId = () => randomBytes(32).toString("base64url") } = options;

  app.post("/api/mt/proxy/enter", (req: Request, res: Response) => {
    const trackerSessionId = String(req.body?.sessionId || "");
    const launch = parseMtLaunchUrl(String(req.body?.gameUrl || ""));
    if (!trackerSessionId || !hasActiveSession(trackerSessionId)) return res.status(401).json({ ok: false, error: "session_invalid" });
    if (!isMtForegroundEnterRequest(req)) return res.status(403).json({ ok: false, error: "foreground_origin_required" });
    if (!launch) return res.status(400).json({ ok: false, error: "invalid_mt_launch" });

    // Replace only this tracker's previous browser proxy session; another user's jar is never reused.
    for (const [id, session] of sessions) if (session.trackerSessionId === trackerSessionId) sessions.delete(id);
    const id = createSessionId();
    sessions.set(id, { id, trackerSessionId, ledgerKey: `mt.session.${createHash("sha256").update(trackerSessionId).digest("hex").slice(0,32)}`, launchPathAndSearch: launch.pathAndSearch, upstreamOrigin: launch.origin, upstreamCookies: new Map(), lastUsed: Date.now() });
    const secure = mtProxyCookieSecureAttr(req);
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=${secure ? "None" : "Lax"}; Max-Age=14400${secure}`);
    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true, url: `${MT_GAME_PREFIX}/` });
  });

  app.post("/api/mt/proxy/leave", (req: Request, res: Response) => {
    if (!isMtForegroundEnterRequest(req)) return res.status(403).json({ ok: false, error: "foreground_origin_required" });
    const session = getSession(req, hasActiveSession);
    if (!session) return res.status(401).json({ ok: false, error: "session_invalid" });
    sessions.delete(session.id);
    const secure = mtProxyCookieSecureAttr(req);
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=${secure ? "None" : "Lax"}; Max-Age=0${secure}`);
    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  });

  const proxy = async (req: Request, res: Response) => {
    if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).setHeader("Allow", "GET, HEAD").end();
    const session = getSession(req, hasActiveSession);
    const route = pathForRequest(req.originalUrl || req.url || "");
    if (!session || !route) return res.status(401).type("text").send("MT foreground session unavailable");
    const query=new URLSearchParams(route.search);
    const tokenKeys=[...query.keys()].filter(key=>key.toLowerCase()==="token");
    if(tokenKeys.length){
      const expected=new URLSearchParams(session.launchPathAndSearch.split("?")[1]||"").get("token");
      if(route.pathname!=="/"||tokenKeys.length!==1||tokenKeys[0]!=="token"||query.getAll("token").length!==1||query.get("token")!==expected)return res.status(401).type("text").send("MT foreground session unavailable");
    }
    const target = upstreamUrl(session, route);
    try {
      const upstream = await fetchImpl(target, { method: req.method, headers: upstreamHeaders(req, session), redirect: "manual", signal: route.pathname === '/' ? AbortSignal.timeout(25000) : undefined });
      retainUpstreamCookies(session, upstream);
      const location = upstream.headers.get("location");
      if (location && upstream.status >= 300 && upstream.status < 400) {
        const mapped = redirectLocation(location, target, session.upstreamOrigin);
        if (!mapped) return res.status(502).type("text").send("MT foreground redirect rejected");
        res.status(upstream.status).setHeader("Location", mapped).setHeader("Cache-Control", "private, no-store, max-age=0");
        return res.end();
      }
      const contentType = upstream.headers.get("content-type") || "";
      const html = isHtml(contentType, target.pathname);
      const rewrite = html || isRewritableText(contentType, target.pathname);
      res.status(upstream.status);
      forwardResponseHeaders(upstream, res);
      if (req.method === "HEAD" || upstream.status === 204 || upstream.status === 304 || !upstream.body) return res.end();
      if (rewrite) {
        const source = await upstream.text();
        if (route.pathname === '/') console.info('[AutoBac MT entry]', JSON.stringify({ stage:'document', status:upstream.status, vendor:new URL(session.upstreamOrigin).hostname, html, restricted:isMtRestrictedHtml(source) }));
        if (html) return res.type("html").send(rewriteMtHtml(source, session.ledgerKey, session.upstreamOrigin));
        return res.type(contentType || "text/plain").send(rewriteMtAssetText(source, session.upstreamOrigin));
      }
      Readable.fromWeb(upstream.body as never).pipe(res);
    } catch {
      // Never echo the URL, launch token, upstream cookie, or low-level network error.
      if (route.pathname === '/') console.warn('[AutoBac MT entry]', JSON.stringify({stage:'document',status:502,error:'upstream_unavailable'}));
      if (!res.headersSent) res.status(502).type("text").send("MT foreground upstream unavailable");
      else res.end();
    }
  };

  // The prefix is the only proxied HTTP namespace. WSS intentionally remains vendor-native.
  app.use(MT_GAME_PREFIX, proxy);
  const timer = setInterval(purgeExpiredSessions, 30 * 60 * 1000);
  (timer as any).unref?.();
}
