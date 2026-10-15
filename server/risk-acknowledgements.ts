import { createHash } from 'node:crypto';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';

type Database = { query: (text: string, values?: any[]) => Promise<any> };
const initialized = new WeakMap<object, Promise<void>>();

/** Additive schema only. No ALTER/UPDATE/DELETE of existing whitelist rows. */
export function ensureRiskAcknowledgements(db: Database): Promise<void> {
  const previous = initialized.get(db);
  if (previous) return previous;
  const job = (async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS autobac_risk_acknowledgements (
      id BIGSERIAL PRIMARY KEY,
      platform VARCHAR(16) NOT NULL,
      username VARCHAR(128) NOT NULL,
      username_key VARCHAR(128) NOT NULL,
      event_id UUID NOT NULL,
      game_platform VARCHAR(16) NOT NULL DEFAULT 'DG',
      event_type VARCHAR(32) NOT NULL DEFAULT 'checkbox_checked',
      statement_version VARCHAR(80) NOT NULL,
      statement_text TEXT NOT NULL,
      statement_sha256 VARCHAR(64) NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (platform, username_key, event_id)
    )`);
    await db.query(`CREATE INDEX IF NOT EXISTS autobac_risk_ack_account_time
      ON autobac_risk_acknowledgements (platform, username_key, recorded_at DESC, id DESC)`);
  })();
  initialized.set(db, job);
  void job.catch(() => { if (initialized.get(db) === job) initialized.delete(db); });
  return job;
}

export async function recordRiskAcknowledgement(db: Database, identity: { platform: string; username: string }, eventId: string, sessionId: string) {
  await ensureRiskAcknowledgements(db);
  const platform = identity.platform.toUpperCase();
  const text = [DG_RISK_STATEMENT.title, DG_RISK_STATEMENT.text, DG_RISK_STATEMENT.acknowledgement, DG_RISK_STATEMENT.recordNotice].join('\n');
  const hash = createHash('sha256').update(text).digest('hex');
  // Binding and current whitelist authorization are evaluated by the database.
  // Retries preserve the FIRST recorded_at and never increment the event count.
  await db.query(`INSERT INTO autobac_risk_acknowledgements
    (platform, username, username_key, event_id, statement_version, statement_text, statement_sha256)
    SELECT UPPER(w.platform), w.username, LOWER(w.username), $3::uuid, $4, $5, $6
    FROM tz_whitelist w
    WHERE UPPER(w.platform)=$1 AND LOWER(w.username)=LOWER($2)
      AND w.enabled=TRUE AND (w.expires_at IS NULL OR w.expires_at>NOW())
      AND EXISTS (SELECT 1 FROM tracker_sessions s WHERE s.session_id=$7
        AND UPPER(s.platform)=UPPER(w.platform) AND LOWER(s.username)=LOWER(w.username))
    ON CONFLICT (platform, username_key, event_id) DO NOTHING`,
    [platform, identity.username, eventId, DG_RISK_STATEMENT.version, text, hash, sessionId]);
  const result = await db.query(`SELECT recorded_at FROM autobac_risk_acknowledgements
    WHERE platform=$1 AND username_key=LOWER($2) AND event_id=$3::uuid`,
    [platform, identity.username, eventId]);
  if (!result.rows[0]) return null;
  return { ok: true as const, recordedAt: new Date(result.rows[0].recorded_at).toISOString() };
}

export async function withRiskAcknowledgementSummaries(db: Database, items: any[]) {
  await ensureRiskAcknowledgements(db);
  const result = await db.query(`SELECT platform, username_key, COUNT(*)::int AS acknowledgement_count,
    MAX(recorded_at) AS acknowledgement_latest
    FROM autobac_risk_acknowledgements GROUP BY platform, username_key`);
  const map = new Map(result.rows.map((row: any) => [`${row.platform}:${row.username_key}`, row]));
  return items.map(item => ({ ...item, ...(map.get(`${String(item.platform).toUpperCase()}:${String(item.username).toLowerCase()}`) || { acknowledgement_count: 0, acknowledgement_latest: null }) }));
}

export async function listRiskAcknowledgements(db: Database, whitelistId: number, page: number) {
  await ensureRiskAcknowledgements(db);
  const account = (await db.query('SELECT id, platform, username FROM tz_whitelist WHERE id=$1', [whitelistId])).rows[0];
  if (!account) return null;
  const identity = [String(account.platform).toUpperCase(), String(account.username).toLowerCase()];
  const total = Number((await db.query(`SELECT COUNT(*)::int AS total FROM autobac_risk_acknowledgements
    WHERE platform=$1 AND username_key=$2`, identity)).rows[0]?.total || 0);
  const selectedPage = Math.max(1, Math.min(page, Math.max(1, Math.ceil(total / 30))));
  const rows = (await db.query(`SELECT id, game_platform, event_type, statement_version, statement_text,
    statement_sha256, recorded_at FROM autobac_risk_acknowledgements
    WHERE platform=$1 AND username_key=$2 ORDER BY recorded_at DESC, id DESC LIMIT 30 OFFSET $3`,
    [...identity, (selectedPage - 1) * 30])).rows;
  return { account, total, page: selectedPage, pages: Math.max(1, Math.ceil(total / 30)), rows };
}

/** Existing session/whitelist tables are read only: no legacy initializer here. */
export async function readRiskTrackerIdentity(db: Database, sessionId: string): Promise<{ platform: string; username: string } | null> {
  const row = (await db.query(`SELECT s.platform, s.username FROM tracker_sessions s
    JOIN tz_whitelist w ON UPPER(w.platform)=UPPER(s.platform) AND LOWER(w.username)=LOWER(s.username)
    WHERE s.session_id=$1 AND w.enabled=TRUE AND (w.expires_at IS NULL OR w.expires_at>NOW()) LIMIT 1`, [sessionId])).rows[0];
  return row ? { platform: String(row.platform), username: String(row.username) } : null;
}
