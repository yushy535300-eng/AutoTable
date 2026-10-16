import { createHash } from 'node:crypto';
import { DG_SETTINGS_EVENT, dgSettingsSnapshotSchema, type DgSettingsSnapshot } from '../shared/dg-settings-snapshot';

export type DgSettingsDatabase = { query: (text: string, values?: any[]) => Promise<any> };
const initialized = new WeakMap<object, Promise<void>>();

/** Raised only when a retry UUID belongs to a different, already-recorded settings snapshot. */
export class DgSettingsEventConflict extends Error {
  constructor() {
    super('settings_event_conflict');
    this.name = 'DgSettingsEventConflict';
  }
}

/** Additive schema only. Existing tracker_sessions and tz_whitelist rows are never modified. */
export function ensureDgSettingsRecords(db: DgSettingsDatabase): Promise<void> {
  const previous = initialized.get(db);
  if (previous) return previous;
  const job = (async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS autobac_dg_settings_records (
      id BIGSERIAL PRIMARY KEY,
      platform VARCHAR(16) NOT NULL,
      username VARCHAR(128) NOT NULL,
      username_key VARCHAR(128) NOT NULL,
      event_id UUID NOT NULL,
      event_type VARCHAR(64) NOT NULL DEFAULT '${DG_SETTINGS_EVENT}',
      statement_version VARCHAR(80) NOT NULL,
      snapshot JSONB NOT NULL,
      snapshot_sha256 VARCHAR(64) NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (platform, username_key, event_id)
    )`);
    await db.query(`CREATE INDEX IF NOT EXISTS autobac_dg_settings_records_account_time
      ON autobac_dg_settings_records (platform, username_key, recorded_at DESC, id DESC)`);
  })();
  initialized.set(db, job);
  void job.catch(() => { if (initialized.get(db) === job) initialized.delete(db); });
  return job;
}

/** Deterministic JSON preserves idempotency regardless of client object-key ordering. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

export async function recordDgSettingsSnapshot(
  db: DgSettingsDatabase,
  identity: { platform: string; username: string },
  eventId: string,
  sessionId: string,
  statementVersion: string,
  snapshot: DgSettingsSnapshot,
) {
  await ensureDgSettingsRecords(db);
  // Do not trust internal callers to have parsed the snapshot already.
  const parsedSnapshot = dgSettingsSnapshotSchema.parse(snapshot);
  const canonicalSnapshot = canonicalJson(parsedSnapshot);
  const snapshotHash = createHash('sha256').update(canonicalSnapshot).digest('hex');
  const platform = identity.platform.toUpperCase();

  // Database-side binding rechecks the current session and whitelist. This avoids a
  // time-of-check/time-of-use gap after readRiskTrackerIdentity returns an identity.
  await db.query(`INSERT INTO autobac_dg_settings_records
    (platform, username, username_key, event_id, statement_version, snapshot, snapshot_sha256)
    SELECT UPPER(w.platform), w.username, LOWER(w.username), $3::uuid, $4, $5::jsonb, $6
    FROM tz_whitelist w
    WHERE UPPER(w.platform)=$1 AND LOWER(w.username)=LOWER($2)
      AND w.enabled=TRUE AND (w.expires_at IS NULL OR w.expires_at>NOW())
      AND EXISTS (SELECT 1 FROM tracker_sessions s WHERE s.session_id=$7
        AND UPPER(s.platform)=UPPER(w.platform) AND LOWER(s.username)=LOWER(w.username))
    ON CONFLICT (platform, username_key, event_id) DO NOTHING`,
    [platform, identity.username, eventId, statementVersion, canonicalSnapshot, snapshotHash, sessionId]);

  const result = await db.query(`SELECT recorded_at, snapshot_sha256 FROM autobac_dg_settings_records
    WHERE platform=$1 AND username_key=LOWER($2) AND event_id=$3::uuid`,
  [platform, identity.username, eventId]);
  const row = result.rows[0];
  if (!row) return null;
  if (String(row.snapshot_sha256) !== snapshotHash) throw new DgSettingsEventConflict();
  return { ok: true as const, recordedAt: new Date(row.recorded_at).toISOString() };
}

export async function listDgSettingsRecords(db: DgSettingsDatabase, whitelistId: number, page: number) {
  await ensureDgSettingsRecords(db);
  // Historical rows remain available to an admin even if the account was later disabled.
  const account = (await db.query('SELECT id, platform, username FROM tz_whitelist WHERE id=$1', [whitelistId])).rows[0];
  if (!account) return null;
  const identity = [String(account.platform).toUpperCase(), String(account.username).toLowerCase()];
  const total = Number((await db.query(`SELECT COUNT(*)::int AS total FROM autobac_dg_settings_records
    WHERE platform=$1 AND username_key=$2`, identity)).rows[0]?.total || 0);
  const pages = Math.max(1, Math.ceil(total / 30));
  const selectedPage = Math.max(1, Math.min(page, pages));
  const rows = (await db.query(`SELECT id, event_type, statement_version, snapshot, snapshot_sha256, recorded_at
    FROM autobac_dg_settings_records
    WHERE platform=$1 AND username_key=$2 ORDER BY recorded_at DESC, id DESC LIMIT 30 OFFSET $3`,
  [...identity, (selectedPage - 1) * 30])).rows;
  return { account, total, page: selectedPage, pages, rows };
}
