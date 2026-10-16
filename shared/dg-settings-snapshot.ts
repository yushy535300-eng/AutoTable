import { z } from 'zod';

/** Events emitted by the DG panel; settings are an audit snapshot, not a wager receipt. */
export const DG_SETTINGS_EVENT = 'autobac-dg-run-started' as const;
export const DG_SETTINGS_SYNC_EVENT = 'autobac-dg-settings-sync' as const;
export const DG_SETTINGS_VERSION = 1 as const;

/** Keep this in sync with the keys exported by lib/dg-original-ai.ts. */
const dgProviderSchema = z.enum([
  'chatgpt',
  'gemini',
  'grok',
  'meta',
  'combined',
  'road',
  'counting',
  'parity',
]);

const safePositiveInt = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const durationMaxMinutes = Math.floor(Number.MAX_SAFE_INTEGER / 60_000);
const dgTableSchema = z.object({
  // DG's native table IDs are numeric strings. Do not coerce or accept URLs/objects.
  tableId: z.string().regex(/^\d{1,32}$/),
  // Native names are short labels such as RB04, S03, or a DG-provided Chinese label.
  // Rendering remains escaped because a stored database value is never trusted HTML.
  tableName: z.string().min(1).max(64).refine(value => value.trim().length > 0, 'tableName must not be blank'),
}).strict();

export const dgSettingsSnapshotSchema = z.object({
  version: z.literal(DG_SETTINGS_VERSION),
  gamePlatform: z.literal('DG'),
  runMode: z.enum(['continuous', 'once']),
  startMode: z.enum(['fresh', 'resume']),
  provider: dgProviderSchema,
  tableCount: z.enum(['1', '3', '5', 'all']),
  selectionMode: z.enum(['auto', 'manual']),
  selectedTables: z.array(dgTableSchema).max(100),
  baseAmount: safePositiveInt,
  staking: z.enum(['flat', 'martingale', 'doubling']),
  maxStake: safePositiveInt,
  stopLoss: safePositiveInt.nullable(),
  takeProfit: safePositiveInt.nullable(),
  // This exactly mirrors parseDurationMinutes' numeric safe range (including zero).
  durationMinutes: z.number().int().min(0).max(durationMaxMinutes),
  minSeconds: z.number().int().min(1).max(60),
  // A code or numeric string only, never a URL or free-form value.
  currency: z.string().regex(/^[A-Za-z0-9]{1,16}$/),
}).strict().superRefine((snapshot, ctx) => {
  if (snapshot.maxStake < snapshot.baseAmount) {
    ctx.addIssue({ code: 'custom', path: ['maxStake'], message: 'maxStake must be at least baseAmount' });
  }
  // Fixed risk floor: martingale cannot start without an explicit stop loss of 2600 or more.
  if (snapshot.staking === 'martingale' && (snapshot.stopLoss === null || snapshot.stopLoss < 2600)) {
    ctx.addIssue({ code: 'custom', path: ['stopLoss'], message: 'martingale requires stopLoss of at least 2600' });
  }
  const ids = new Set<string>();
  for (const [index, table] of snapshot.selectedTables.entries()) {
    if (ids.has(table.tableId)) {
      ctx.addIssue({ code: 'custom', path: ['selectedTables', index, 'tableId'], message: 'duplicate tableId' });
    }
    ids.add(table.tableId);
  }
  // The panel forces flat staking for its 3/5/all room modes, even before every room loads.
  if ((snapshot.tableCount !== '1' || snapshot.selectedTables.length > 1) && snapshot.staking !== 'flat') {
    ctx.addIssue({ code: 'custom', path: ['staking'], message: 'multi-table runs require flat staking' });
  }
});

export type DgSettingsSnapshot = z.infer<typeof dgSettingsSnapshotSchema>;
export type DgSettingsField = { key: string; value: string };

const label = <T extends string>(value: T, labels: Record<T, string>) => labels[value];
const money = (value: number | null) => value === null ? '未設定' : String(value);

/**
 * Text-only labels for the administrator page. The caller must still HTML-escape both
 * strings because historical database rows are not trusted browser input.
 */
export function dgSettingsFields(snapshot: DgSettingsSnapshot): DgSettingsField[] {
  return [
    { key: '設定版本', value: String(snapshot.version) },
    { key: '遊戲平台', value: snapshot.gamePlatform },
    { key: '執行模式', value: label(snapshot.runMode, { continuous: '持續執行', once: '單次執行' }) },
    { key: '啟動方式', value: label(snapshot.startMode, { fresh: '全新開始', resume: '繼續執行' }) },
    { key: '策略提供者', value: snapshot.provider },
    { key: '桌台數量', value: snapshot.tableCount === 'all' ? '全部桌台' : `${snapshot.tableCount} 桌` },
    { key: '選桌方式', value: label(snapshot.selectionMode, { auto: '自動', manual: '手動' }) },
    { key: '已選桌台', value: snapshot.selectedTables.length ? snapshot.selectedTables.map(table => `${table.tableName}（ID ${table.tableId}）`).join('、') : '尚未選擇桌台' },
    { key: '基本金額', value: String(snapshot.baseAmount) },
    { key: '配注方式', value: label(snapshot.staking, { flat: '平注', martingale: '馬丁格爾', doubling: '加倍' }) },
    { key: '單注上限', value: String(snapshot.maxStake) },
    { key: '止損', value: money(snapshot.stopLoss) },
    { key: '止盈', value: money(snapshot.takeProfit) },
    { key: '自動停止時間（分鐘）', value: snapshot.durationMinutes === 0 ? '不限時' : String(snapshot.durationMinutes) },
    { key: '最少剩餘秒數', value: String(snapshot.minSeconds) },
    { key: '幣別', value: snapshot.currency },
  ];
}
