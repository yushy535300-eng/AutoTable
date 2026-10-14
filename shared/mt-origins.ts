export const MT_DESKTOP_ORIGIN = 'https://gsa.ofalive99.net';
export const MT_MOBILE_ORIGIN = 'https://gsb.ofalive99.net';
/** gs1 is an exact alternate entrypoint observed in the platform-issued launch. */
export const MT_ALTERNATE_ORIGIN = 'https://gs1.ofalive99.net';
export const MT_TRUSTED_ORIGINS = [MT_DESKTOP_ORIGIN, MT_MOBILE_ORIGIN, MT_ALTERNATE_ORIGIN] as const;

/** Exact observed vendor entrypoints; never accept arbitrary subdomains. */
export function mtLaunchOrigin(url: URL): string | null {
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.pathname !== '/') return null;
  if (!(MT_TRUSTED_ORIGINS as readonly string[]).includes(url.origin)) return null;
  if (url.searchParams.getAll('token').length !== 1 || !url.searchParams.get('token') || url.searchParams.getAll('lang').length !== 1 || url.searchParams.get('lang') !== 'zhtw') return null;
  const ti = url.searchParams.getAll('ti');
  if (ti.length > 1 || (ti.length === 1 && !/^\d{1,64}$/.test(ti[0]))) return null;
  return url.origin;
}

/** Retain only native authorization parameters, never a caller-supplied redirect. */
export function mtLaunchSearch(url: URL): URLSearchParams {
  const query = new URLSearchParams();
  query.set('token', url.searchParams.get('token')!);
  query.set('lang', 'zhtw');
  if (url.searchParams.has('ti')) query.set('ti', url.searchParams.get('ti')!);
  return query;
}
