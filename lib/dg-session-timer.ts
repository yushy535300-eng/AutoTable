export function parseDurationMinutes(value: unknown): number {
  const text = String(value ?? '').trim();
  if (text === '') return 0;
  if (!/^\d+$/.test(text)) throw new Error('自動停止時間須為整數分鐘；0或留空代表不限時');
  const minutes = Number(text);
  if (!Number.isSafeInteger(minutes) || !Number.isSafeInteger(minutes * 60000)) throw new Error('自動停止時間超出可用範圍');
  return minutes;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
}

/** Local run lifetime, unrelated to stake levels, financial reporting, or ledger ownership. */
export function createDgSessionTimer(wallNow = () => Date.now(), monoNow = () => performance.now()) {
  let running = false, started = false, startWall = 0, startMono = 0, elapsedMs = 0, minutes = 0;
  function elapsed() {
    if (running) elapsedMs = Math.max(elapsedMs, 0, wallNow() - startWall, monoNow() - startMono);
    return elapsedMs;
  }
  return {
    start(value: unknown) {
      minutes = parseDurationMinutes(value);
      startWall = wallNow(); startMono = monoNow(); elapsedMs = 0; started = true; running = true;
    },
    stop() { elapsed(); running = false; },
    expired() { return running && minutes > 0 && elapsed() >= minutes * 60000; },
    view() {
      const usedMs = elapsed();
      return { running, started, minutes, elapsedMs: usedMs, remainingMs: minutes > 0 ? Math.max(0, minutes * 60000 - usedMs) : null, elapsedText: formatDuration(usedMs) };
    },
  };
}
