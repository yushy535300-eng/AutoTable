#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def apply(name, transforms):
    p = root / name
    text = p.read_text()
    for old, new in transforms:
        if old not in text:
            raise RuntimeError(f'Exact source not found in {name}: {old[:100]}')
        text = text.replace(old, new, 1)
    p.write_text(text)
    print(name)

apply('lib/legacy-platform-screen.tsx', [
    ('export async function getMtLoginUrlFromPlatform(\n  platform: "TZ" | "OFA",\n  token: string,\n) {\n  return getGameLoginUrlFromPlatform(platform, token, "MTLI", "Desktop", "MT");',
     'export async function getMtLoginUrlFromPlatform(\n  platform: "TZ" | "OFA",\n  token: string,\n  device: "Desktop" | "Mobile" = "Desktop",\n) {\n  return getGameLoginUrlFromPlatform(platform, token, "MTLI", device, "MT");'),
    ('export async function getDgLoginUrlFromPlatform(\n  platform: "TZ" | "OFA",\n  token: string,\n) {\n  return getGameLoginUrlFromPlatform(platform, token, "DGLI", "Desktop", "DG");',
     'export async function getDgLoginUrlFromPlatform(\n  platform: "TZ" | "OFA",\n  token: string,\n  device: "Desktop" | "Mobile" = "Desktop",\n) {\n  return getGameLoginUrlFromPlatform(platform, token, "DGLI", device, "DG");'),
])
apply('app/index.tsx', [
    ("import { trpc } from '@/lib/trpc';", "import { trpc } from '@/lib/trpc';\nimport { detectGameDevice } from '@/lib/game-device';"),
    ("const promise = target === 'DG' ? getDgLoginUrlFromPlatform(current.platform, current.token) : getMtLoginUrlFromPlatform(current.platform, current.token);", "const device = detectGameDevice();\n        const promise = target === 'DG' ? getDgLoginUrlFromPlatform(current.platform, current.token, device) : getMtLoginUrlFromPlatform(current.platform, current.token, device);"),
])
apply('server/mt-game-proxy.ts', [
    ('import { Readable } from "node:stream";', 'import { Readable } from "node:stream";\nimport { MT_DESKTOP_ORIGIN, MT_TRUSTED_ORIGINS, mtLaunchOrigin } from "../shared/mt-origins";'),
    ('export const MT_UPSTREAM_ORIGIN = "https://gsa.ofalive99.net";', 'export const MT_UPSTREAM_ORIGIN = MT_DESKTOP_ORIGIN;'),
    ('  launchPathAndSearch: string;', '  launchPathAndSearch: string;\n  upstreamOrigin: string;'),
    ('export function parseMtLaunchUrl(raw: string): { pathAndSearch: string } | null {', 'export function parseMtLaunchUrl(raw: string): { pathAndSearch: string; origin: string } | null {'),
    ('''  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "gsa.ofalive99.net" ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    !url.searchParams.get("token") ||
    url.searchParams.get("lang") !== "zhtw"
  ) {
    return null;
  }''', '''  const origin = mtLaunchOrigin(url);
  if (!origin) return null;'''),
    ('const launch = new URL(MT_UPSTREAM_ORIGIN + "/");', 'const launch = new URL(origin + "/");'),
    ('return { pathAndSearch: launch.pathname + launch.search };', 'return { pathAndSearch: launch.pathname + launch.search, origin };'),
    ('headers.set("origin", MT_UPSTREAM_ORIGIN);\n  headers.set("referer", `${MT_UPSTREAM_ORIGIN}/`);', 'headers.set("origin", session.upstreamOrigin);\n  headers.set("referer", `${session.upstreamOrigin}/`);'),
    ('const url = new URL(MT_UPSTREAM_ORIGIN);', 'const url = new URL(session.upstreamOrigin);'),
    ('export function mtProxyAssetUrl(value: string): string {', 'export function mtProxyAssetUrl(value: string, upstreamOrigin: string = MT_UPSTREAM_ORIGIN): string {'),
    ('if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "gsa.ofalive99.net" || url.port || url.username || url.password) return raw;', 'if (url.protocol !== "https:" || url.origin !== upstreamOrigin || !(MT_TRUSTED_ORIGINS as readonly string[]).includes(upstreamOrigin) || url.port || url.username || url.password) return raw;'),
    ('export function rewriteMtAssetText(source: string): string {', 'export function rewriteMtAssetText(source: string, upstreamOrigin: string = MT_UPSTREAM_ORIGIN): string {'),
    ('https:\\/\\/gsa\\.ofalive99\\.net(?:', 'https:\\/\\/gs[ab]\\.ofalive99\\.net(?:'),
    ('\\/\\/gsa\\.ofalive99\\.net(?:', '\\/\\/gs[ab]\\.ofalive99\\.net(?:'),
    ('mtProxyAssetUrl(url)}${quote}', 'mtProxyAssetUrl(url, upstreamOrigin)}${quote}'),
    ('export function rewriteMtHtml(source: string, ledgerKey?: string): string {', 'export function rewriteMtHtml(source: string, ledgerKey?: string, upstreamOrigin: string = MT_UPSTREAM_ORIGIN): string {'),
    ('mtProxyAssetUrl(value)}${quote}', 'mtProxyAssetUrl(value, upstreamOrigin)}${quote}'),
    ('html = rewriteMtAssetText(html).replace', 'html = rewriteMtAssetText(html, upstreamOrigin).replace'),
    ('function redirectLocation(location: string, current: URL): string | null {', 'function redirectLocation(location: string, current: URL, upstreamOrigin: string): string | null {'),
    ('if (next.origin !== MT_UPSTREAM_ORIGIN) return null;', 'if (next.origin !== upstreamOrigin) return null;'),
    ('launchPathAndSearch: launch.pathAndSearch, upstreamCookies:', 'launchPathAndSearch: launch.pathAndSearch, upstreamOrigin: launch.origin, upstreamCookies:'),
    ('redirectLocation(location, target);', 'redirectLocation(location, target, session.upstreamOrigin);'),
    ('rewriteMtHtml(source, session.ledgerKey)', 'rewriteMtHtml(source, session.ledgerKey, session.upstreamOrigin)'),
    ('rewriteMtAssetText(source));', 'rewriteMtAssetText(source, session.upstreamOrigin));'),
])
apply('lib/mt-frame-installer.ts', [
    ('export type MtFrame =', "import { mtLaunchOrigin } from '../shared/mt-origins';\n\nexport type MtFrame ="),
    ('if(native.origin!=="https://gsa.ofalive99.net"||native.pathname!=="/"||!native.searchParams.get("token"))', 'if(!mtLaunchOrigin(native))'),
    ("'button,[role=\"tab\"],.ant-tabs-tab'", "'button,[role=\"tab\"],.ant-tabs-tab,.van-tab'"),
    ("element.closest('button,[role=\"tab\"]')", "element.closest('button,[role=\"tab\"],.van-tab')"),
])
for name in ['lib/mt-click-console-entry.ts', 'scripts/mt-diagnostic-base.js']:
    apply(name, [("location.hostname==='gsa.ofalive99.net'", "['gsa.ofalive99.net','gsb.ofalive99.net'].includes(location.hostname)")])
apply('scripts/package-autobac-v3.py', [
    ("source_extensions = {'.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.sql', '.md', '.py', '.sh'}", "source_extensions = {'.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.sql', '.md', '.py', '.sh'}\nrequired_source_data = {'lib/sa-table-labels.json'}"),
    ("return path.suffix.lower() in source_extensions", "return path.suffix.lower() in source_extensions or name in required_source_data"),
    ("'tailwind.config.js', 'theme.config.js', 'global.css',", "'tailwind.config.js', 'theme.config.js', 'global.css', 'lib/sa-table-labels.json',"),
    ("'version': 'AutoBac-3.0'", "'version': 'AutoBac-3.1'"),
])
