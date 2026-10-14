export const MT_DESKTOP_ORIGIN = 'https://gsa.ofalive99.net';
export const MT_MOBILE_ORIGIN = 'https://gsb.ofalive99.net';
export const MT_TRUSTED_ORIGINS = [MT_DESKTOP_ORIGIN, MT_MOBILE_ORIGIN] as const;

/** These are the two observed vendor entrypoints, never a generic proxy allowlist. */
export function mtLaunchOrigin(url: URL): string | null {
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.pathname !== '/') return null;
  if (!(MT_TRUSTED_ORIGINS as readonly string[]).includes(url.origin)) return null;
  if (url.searchParams.getAll('token').length !== 1 || !url.searchParams.get('token') || url.searchParams.get('lang') !== 'zhtw') return null;
  return url.origin;
}
