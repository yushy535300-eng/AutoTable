export type TurnoverPeriod = 'today' | 'week';
export type OfficialTurnoverValue = {
  value: number | null;
  status: string;
  updatedAt: number | null;
  range: string;
  scope: string;
};
export type OfficialTurnoverView = {
  platform: 'DG' | 'MT';
  today: OfficialTurnoverValue;
  week: OfficialTurnoverValue;
};

/** Official monetary fields only. Empty/malformed fields are unknown, not zero. */
export function officialAmount(raw: unknown): number | null {
  if (typeof raw !== 'number' && typeof raw !== 'string') return null;
  if (typeof raw === 'string' && !/^\d+(?:\.\d{1,2})?$/.test(raw.trim())) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > Number.MAX_SAFE_INTEGER / 100) return null;
  return n;
}

export function taipeiDay(now = Date.now()): string {
  return new Date(now + 8 * 3600_000).toISOString().slice(0, 10);
}

/** MT uses calendar strings with a literal Z, not converted UTC instants. */
export function mtOfficialRange(period: TurnoverPeriod, now = Date.now()) {
  const day = taipeiDay(now);
  const first = period === 'today' ? day : taipeiDay(now - 6 * 86400_000);
  return {
    begin_at: `${first}T00:00:00.000Z`,
    end_at: `${day}T23:59:59.000Z`,
    label: `${first} ～ ${day}${period === 'week' ? '（含今日近7日）' : '（台北）'}`,
  };
}

export function emptyTurnover(platform: 'DG' | 'MT', scope: string): OfficialTurnoverView {
  const make = (period: TurnoverPeriod): OfficialTurnoverValue => ({
    value: null, status: '待同步官方報表', updatedAt: null,
    range: mtOfficialRange(period).label, scope,
  });
  return { platform, today: make('today'), week: make('week') };
}
