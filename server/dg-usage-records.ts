import { createHash } from 'node:crypto';
import { dgUsageReportSchema, type DgUsageReport } from '../shared/dg-usage-report';
import { canonicalJson, ensureDgSettingsRecords } from './dg-settings-records';

export type DgUsageDatabase = { query: (text: string, values?: any[]) => Promise<any> };
export type DgUsageIdentity = { platform: string; username: string };
const initialized = new WeakMap<object, Promise<void>>();

export class DgUsageSettingsNotReady extends Error {
  constructor() { super('usage_settings_not_ready'); this.name = 'DgUsageSettingsNotReady'; }
}
export class DgUsageRunOwnershipConflict extends Error {
  constructor() { super('usage_run_ownership_conflict'); this.name = 'DgUsageRunOwnershipConflict'; }
}
export class DgUsageReportConflict extends Error {
  constructor() { super('usage_report_conflict'); this.name = 'DgUsageReportConflict'; }
}

/** Additive audit table only. No legacy whitelist/session table is altered. */
export function ensureDgUsageRecords(db: DgUsageDatabase): Promise<void> {
  const previous = initialized.get(db);
  if (previous) return previous;
  const job = (async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS autobac_dg_usage_records (
      id BIGSERIAL PRIMARY KEY,
      platform VARCHAR(16) NOT NULL,
      username VARCHAR(128) NOT NULL,
      username_key VARCHAR(128) NOT NULL,
      run_id UUID NOT NULL UNIQUE,
      settings_event_id UUID NOT NULL,
      statement_version VARCHAR(80) NOT NULL,
      status VARCHAR(16) NOT NULL CHECK (status IN ('active','stopped','interrupted')),
      stop_code VARCHAR(16) NULL CHECK (stop_code IN ('manual','time_limit','stop_loss','take_profit','stake_cap','other')),
      sequence INTEGER NOT NULL CHECK (sequence >= 0),
      client_started_at_ms BIGINT NOT NULL CHECK (client_started_at_ms >= 0),
      client_updated_at_ms BIGINT NOT NULL CHECK (client_updated_at_ms >= 0),
      client_ended_at_ms BIGINT NULL CHECK (client_ended_at_ms IS NULL OR client_ended_at_ms >= 0),
      elapsed_ms BIGINT NOT NULL CHECK (elapsed_ms >= 0),
      report JSONB NOT NULL,
      report_sha256 VARCHAR(64) NOT NULL,
      first_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      server_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      stopped_received_at TIMESTAMPTZ NULL,
      CHECK (settings_event_id = run_id),
      CHECK ((status IN ('active','interrupted') AND client_ended_at_ms IS NULL AND stop_code IS NULL) OR (status = 'stopped' AND client_ended_at_ms IS NOT NULL AND stop_code IS NOT NULL))
    )`);
    await db.query(`CREATE INDEX IF NOT EXISTS autobac_dg_usage_records_account_time
      ON autobac_dg_usage_records (platform, username_key, server_updated_at DESC, id DESC)`);
  })();
  initialized.set(db, job);
  void job.catch(() => { if (initialized.get(db) === job) initialized.delete(db); });
  return job;
}

function receipt(row: any) {
  return {
    ok: true as const,
    serverUpdatedAt: new Date(row.server_updated_at).toISOString(),
    sequence: Number(row.sequence),
    status: String(row.status) as DgUsageReport['status'],
  };
}

/**
 * Upserts only a monotonic report. Retrying exactly the same sequence/payload is idempotent;
 * a UUID is globally owned by its first resolved whitelist account and cannot cross accounts.
 */
export async function recordDgUsageReport(
  db: DgUsageDatabase,
  identity: DgUsageIdentity,
  sessionId: string,
  statementVersion: string,
  report: DgUsageReport,
) {
  await Promise.all([ensureDgUsageRecords(db), ensureDgSettingsRecords(db)]);
  const parsed = dgUsageReportSchema.parse(report);
  const platform = String(identity.platform).toUpperCase();
  const canonicalReport = canonicalJson(parsed);
  const reportHash = createHash('sha256').update(canonicalReport).digest('hex');

  // The settings writer can arrive milliseconds later than the usage writer. This explicit,
  // non-destructive signal lets the parent resend the same immutable sequence a bounded number
  // of times; it never invents a settings acknowledgement.
  const settings = await db.query(`SELECT 1 FROM autobac_dg_settings_records
    WHERE platform=$1 AND username_key=LOWER($2) AND event_id=$3::uuid LIMIT 1`,
  [platform, identity.username, parsed.runId]);
  if (!settings.rows[0]) throw new DgUsageSettingsNotReady();

  const written = await db.query(`INSERT INTO autobac_dg_usage_records
    (platform, username, username_key, run_id, settings_event_id, statement_version, status, stop_code, sequence,
      client_started_at_ms, client_updated_at_ms, client_ended_at_ms, elapsed_ms, report, report_sha256, stopped_received_at)
    SELECT UPPER(w.platform), w.username, LOWER(w.username), $3::uuid, $4::uuid, $5, $6::varchar, $7, $8,
      $9, $10, $11, $12, $13::jsonb, $14, CASE WHEN $6::varchar='stopped' THEN NOW() ELSE NULL END
    FROM tz_whitelist w
    WHERE UPPER(w.platform)=$1 AND LOWER(w.username)=LOWER($2)
      AND w.enabled=TRUE AND (w.expires_at IS NULL OR w.expires_at>NOW())
      AND EXISTS (SELECT 1 FROM tracker_sessions s WHERE s.session_id=$15
        AND UPPER(s.platform)=UPPER(w.platform) AND LOWER(s.username)=LOWER(w.username))
      AND EXISTS (SELECT 1 FROM autobac_dg_settings_records sr
        WHERE sr.platform=UPPER(w.platform) AND sr.username_key=LOWER(w.username) AND sr.event_id=$3::uuid)
    ON CONFLICT (run_id) DO UPDATE SET
      statement_version=EXCLUDED.statement_version,
      status=EXCLUDED.status,
      stop_code=EXCLUDED.stop_code,
      sequence=EXCLUDED.sequence,
      client_started_at_ms=EXCLUDED.client_started_at_ms,
      client_updated_at_ms=EXCLUDED.client_updated_at_ms,
      client_ended_at_ms=EXCLUDED.client_ended_at_ms,
      elapsed_ms=EXCLUDED.elapsed_ms,
      report=EXCLUDED.report,
      report_sha256=EXCLUDED.report_sha256,
      server_updated_at=NOW(),
      stopped_received_at=CASE WHEN EXCLUDED.status='stopped' THEN NOW() ELSE autobac_dg_usage_records.stopped_received_at END
    WHERE autobac_dg_usage_records.platform=EXCLUDED.platform
      AND autobac_dg_usage_records.username_key=EXCLUDED.username_key
      AND EXCLUDED.sequence > autobac_dg_usage_records.sequence
      AND EXCLUDED.elapsed_ms >= autobac_dg_usage_records.elapsed_ms
      AND EXCLUDED.client_updated_at_ms >= autobac_dg_usage_records.client_updated_at_ms
      AND NOT (autobac_dg_usage_records.status IN ('stopped','interrupted') AND EXCLUDED.status='active')
    RETURNING sequence, status, server_updated_at`,
  [
    platform, identity.username, parsed.runId, parsed.settingsEventId, statementVersion,
    parsed.status, parsed.stopCode, parsed.sequence, parsed.startedAt, parsed.updatedAt, parsed.endedAt,
    parsed.elapsedMs, canonicalReport, reportHash, sessionId,
  ]);
  if (written.rows[0]) return receipt(written.rows[0]);

  const existing = (await db.query(`SELECT platform, username_key, sequence, status, elapsed_ms,
    client_updated_at_ms, report_sha256, server_updated_at FROM autobac_dg_usage_records WHERE run_id=$1::uuid LIMIT 1`,
  [parsed.runId])).rows[0];
  if (!existing) return null; // Whitelist/session ceased to authorize during the database-side write.
  if (String(existing.platform).toUpperCase() !== platform || String(existing.username_key).toLowerCase() !== String(identity.username).toLowerCase()) {
    throw new DgUsageRunOwnershipConflict();
  }
  if (Number(existing.sequence) === parsed.sequence && String(existing.report_sha256) === reportHash) return receipt(existing);
  throw new DgUsageReportConflict();
}

/** Read-only account-scoped export for administrator readers. Database errors intentionally propagate. */
export async function listDgUsageRecords(db: DgUsageDatabase, whitelistId: number, page: number) {
  await ensureDgUsageRecords(db);
  const account = (await db.query('SELECT id, platform, username FROM tz_whitelist WHERE id=$1', [whitelistId])).rows[0];
  if (!account) return null;
  const identity = [String(account.platform).toUpperCase(), String(account.username).toLowerCase()];
  const total = Number((await db.query(`SELECT COUNT(*)::int AS total FROM autobac_dg_usage_records
    WHERE platform=$1 AND username_key=$2`, identity)).rows[0]?.total ?? NaN);
  if (!Number.isFinite(total) || total < 0) throw new Error('usage_record_count_unavailable');
  const pages = Math.max(1, Math.ceil(total / 30));
  const selectedPage = Math.max(1, Math.min(page, pages));
  const rows = (await db.query(`SELECT id, run_id, settings_event_id, statement_version, status, stop_code, sequence,
    client_started_at_ms, client_updated_at_ms, client_ended_at_ms, elapsed_ms, report,
    first_received_at, server_updated_at, stopped_received_at
    FROM autobac_dg_usage_records WHERE platform=$1 AND username_key=$2
    ORDER BY server_updated_at DESC, id DESC LIMIT 30 OFFSET $3`,
  [...identity, (selectedPage - 1) * 30])).rows;
  return { account, total, page: selectedPage, pages, rows };
}
