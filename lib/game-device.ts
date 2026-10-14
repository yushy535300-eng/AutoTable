export type GameDevice = 'Desktop' | 'Mobile';
export type GameLayout = 'compatible' | 'native' | 'desktop';
type BrowserDevice = { userAgent?: string; platform?: string; maxTouchPoints?: number };

/** Request the vendor's real profile; this does not emulate or resize a desktop page. */
export function detectGameDevice(browser?: BrowserDevice): GameDevice {
  const value = browser ?? (typeof navigator === 'undefined' ? {} : navigator);
  if (/Android|iPhone|iPad|iPod|IEMobile|Mobile/i.test(value.userAgent || '')) return 'Mobile';
  if ((value.platform === 'MacIntel' || /Macintosh/i.test(value.userAgent || '')) && Number(value.maxTouchPoints || 0) > 1) return 'Mobile';
  return 'Desktop';
}

/** Phones request the native profile; actual DG builders still pass the runtime version gate. */
export function resolveGameDevice(platform: 'DG'|'MT', layout: GameLayout, detected: GameDevice): GameDevice {
  if (layout === 'native') return 'Mobile';
  if (layout === 'desktop') return 'Desktop';
  return detected;
}
