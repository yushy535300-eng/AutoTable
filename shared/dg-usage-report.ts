import { z } from 'zod';
import { RISK_EVENT_ID } from './dg-risk-statement';

/** Parent-only recorder transport events. The DG iframe never receives the session capability. */
export const DG_USAGE_REPORT_EVENT = 'autobac-dg-usage-report' as const;
export const DG_USAGE_SYNC_EVENT = 'autobac-dg-usage-sync' as const;
export const DG_USAGE_REPORT_VERSION = 1 as const;
export const dgUsageStopCodeSchema = z.enum(['manual', 'time_limit', 'stop_loss', 'take_profit', 'stake_cap', 'other']);
export type DgUsageStopCode = z.infer<typeof dgUsageStopCodeSchema>;

const safeNonNegativeInt = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const safeSignedNumber = z.number().finite().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER);
const countSchema = z.object({
  reserved: safeNonNegativeInt,
  submitted: safeNonNegativeInt,
  accepted: safeNonNegativeInt,
  settled: safeNonNegativeInt,
  uncertain: safeNonNegativeInt,
  rejected: safeNonNegativeInt,
  aborted: safeNonNegativeInt,
}).strict();

/**
 * Aggregate only: intentionally excludes native packets, URLs, credentials, per-bet IDs,
 * balances, and arbitrary user text. All times are client-observed epoch milliseconds.
 */
export const dgUsageReportSchema = z.object({
  version: z.literal(DG_USAGE_REPORT_VERSION),
  runId: z.string().regex(RISK_EVENT_ID),
  settingsEventId: z.string().regex(RISK_EVENT_ID),
  sequence: safeNonNegativeInt,
  // `interrupted` means a previously reportable page was rebuilt. It is deliberately
  // non-running: no end time or guessed stop reason is manufactured during recovery.
  status: z.enum(['active', 'stopped', 'interrupted']),
  stopCode: dgUsageStopCodeSchema.nullable(),
  startedAt: safeNonNegativeInt,
  updatedAt: safeNonNegativeInt,
  endedAt: safeNonNegativeInt.nullable(),
  elapsedMs: safeNonNegativeInt,
  durationMinutes: safeNonNegativeInt,
  eventCounts: countSchema,
  result: z.object({
    settledPnl: safeSignedNumber,
    settledCount: safeNonNegativeInt,
    wins: safeNonNegativeInt,
    losses: safeNonNegativeInt,
    pendingCount: safeNonNegativeInt,
    uncertainCount: safeNonNegativeInt,
  }).strict(),
}).strict().superRefine((report, ctx) => {
  if (report.runId.toLowerCase() !== report.settingsEventId.toLowerCase()) {
    ctx.addIssue({ code: 'custom', path: ['settingsEventId'], message: 'settingsEventId must equal runId' });
  }
  if (report.updatedAt < report.startedAt) {
    ctx.addIssue({ code: 'custom', path: ['updatedAt'], message: 'updatedAt must not precede startedAt' });
  }
  if ((report.status === 'active' || report.status === 'interrupted') && report.endedAt !== null) {
    ctx.addIssue({ code: 'custom', path: ['endedAt'], message: 'non-stopped reports cannot have endedAt' });
  }
  if ((report.status === 'active' || report.status === 'interrupted') && report.stopCode !== null) {
    ctx.addIssue({ code: 'custom', path: ['stopCode'], message: 'non-stopped reports cannot have stopCode' });
  }
  if (report.status === 'stopped' && (report.endedAt === null || report.endedAt < report.startedAt)) {
    ctx.addIssue({ code: 'custom', path: ['endedAt'], message: 'stopped reports require a valid endedAt' });
  }
  if (report.status === 'stopped' && report.stopCode === null) {
    ctx.addIssue({ code: 'custom', path: ['stopCode'], message: 'stopped reports require stopCode' });
  }
  if (report.result.settledCount > report.eventCounts.settled) {
    ctx.addIssue({ code: 'custom', path: ['result', 'settledCount'], message: 'settled aggregate exceeds settled events' });
  }
  if (report.result.pendingCount > report.eventCounts.reserved + report.eventCounts.submitted + report.eventCounts.accepted) {
    ctx.addIssue({ code: 'custom', path: ['result', 'pendingCount'], message: 'pending aggregate exceeds pending events' });
  }
  if (report.result.uncertainCount > report.eventCounts.uncertain + report.eventCounts.settled) {
    ctx.addIssue({ code: 'custom', path: ['result', 'uncertainCount'], message: 'uncertain aggregate exceeds eligible events' });
  }
});

export type DgUsageReport = z.infer<typeof dgUsageReportSchema>;
export type DgUsageSyncState = 'synced' | 'failed';
export type DgUsageReceipt = { ok: true; serverUpdatedAt: string; sequence: number; status: DgUsageReport['status'] };
