import {adminRecordPage, escapeRecordText, recordTime} from './admin-record-view';
import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import { DG_RISK_STATEMENT, RISK_EVENT_ID } from '../shared/dg-risk-statement';
import { dgSettingsFields, dgSettingsSnapshotSchema } from '../shared/dg-settings-snapshot';
import { getPool } from './whitelist';
import {
  DgSettingsEventConflict,
  listDgSettingsRecords,
  recordDgSettingsSnapshot,
} from './dg-settings-records';
import { readRiskTrackerIdentity } from './risk-acknowledgements';

const payload = z.object({
  sessionId: z.string().min(1).max(64),
  eventId: z.string().regex(RISK_EVENT_ID),
  statementVersion: z.string().max(80),
  settings: dgSettingsSnapshotSchema,
}).strict();

const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

function settingsDisplay(snapshot: unknown): string {
  let value = snapshot;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { /* safely render the raw value below */ }
  }
  const parsed = dgSettingsSnapshotSchema.safeParse(value);
  if (parsed.success) {
    const fields = dgSettingsFields(parsed.data);
    return `<dl>${fields.map(field => `<dt>${esc(field.key)}</dt><dd>${esc(field.value)}</dd>`).join('')}</dl>`;
  }
  // A malformed historical JSONB value must never be inserted as markup.
  let raw = '';
  try { raw = JSON.stringify(value); } catch { raw = String(value ?? ''); }
  return `<p class="bad">設定快照格式無法辨識</p><pre>${esc(raw)}</pre>`;
}

/** Admin-only HTML deliberately treats every database field as untrusted. */
export function dgSettingsDetailsPage(data: NonNullable<Awaited<ReturnType<typeof listDgSettingsRecords>>>) {
  const cards = data.rows.map((row: any) => {
    let raw = row.snapshot;
    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch {} }
    const parsed = dgSettingsSnapshotSchema.safeParse(raw);
    const brief = parsed.success
      ? `${parsed.data.staking === 'flat' ? '平注' : parsed.data.staking === 'martingale' ? '馬丁' : '倍投'} · 每注 ${parsed.data.baseAmount} · ${parsed.data.tableCount === 'all' ? '全部桌台' : parsed.data.tableCount + ' 桌'}`
      : '設定格式待核對';
    const limits = parsed.success
      ? `止損 ${parsed.data.stopLoss ?? '未設定'} / 止盈 ${parsed.data.takeProfit ?? '未設定'} / ${parsed.data.durationMinutes ? '時限 ' + parsed.data.durationMinutes + ' 分鐘' : '不限時'}`
      : '請點開詳細內容核對';
    return `<article class="record"><div class="meta"><time>${escapeRecordText(recordTime(row.recorded_at))}</time><span class="badge">開始設定已記錄</span></div><div class="summary">${escapeRecordText(brief)}</div><div class="limits">${escapeRecordText(limits)}</div><details><summary>詳細設定</summary>${settingsDisplay(row.snapshot)}<small>聲明版本：${esc(row.statement_version)}</small></details></article>`;
  }).join('');
  return adminRecordPage({ ...data, tab: 'settings', content: cards });
}

export function registerDgSettingsRoutes(
  app: Express,
  requireAdmin: RequestHandler,
  deps = { getPool, readRiskTrackerIdentity, recordDgSettingsSnapshot, listDgSettingsRecords },
) {
  app.post('/api/dg/settings-records', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    // Keep the opaque session credential out of URLs and reject browser cross-site posts.
    if (req.get('Sec-Fetch-Site') === 'cross-site') return res.status(403).json({ ok: false, error: 'same_origin_required' });
    const origin = req.get('Origin');
    if (origin) {
      try {
        if (new URL(origin).host !== req.get('Host')) return res.status(403).json({ ok: false, error: 'same_origin_required' });
      } catch {
        return res.status(403).json({ ok: false, error: 'same_origin_required' });
      }
    }
    const input = payload.safeParse(req.body);
    if (!input.success) return res.status(400).json({ ok: false, error: 'invalid_settings_record' });
    if (input.data.statementVersion !== DG_RISK_STATEMENT.version) return res.status(409).json({ ok: false, error: 'statement_version_changed' });
    try {
      const db = deps.getPool();
      if (!db) return res.status(503).json({ ok: false, error: 'recording_unavailable' });
      // The client submits no account field: current server-side session ownership is authoritative.
      const identity = await deps.readRiskTrackerIdentity(db, input.data.sessionId);
      if (!identity) return res.status(401).json({ ok: false, error: 'session_or_whitelist_unavailable' });
      const receipt = await deps.recordDgSettingsSnapshot(
        db,
        identity,
        input.data.eventId,
        input.data.sessionId,
        input.data.statementVersion,
        input.data.settings,
      );
      if (!receipt) return res.status(403).json({ ok: false, error: 'whitelist_unavailable' });
      return res.json(receipt);
    } catch (error) {
      if (error instanceof DgSettingsEventConflict || (error as any)?.name === 'DgSettingsEventConflict') {
        return res.status(409).json({ ok: false, error: 'settings_event_conflict' });
      }
      // Never disclose SQL, session IDs, usernames, or connection details.
      return res.status(503).json({ ok: false, error: 'recording_unavailable' });
    }
  });

}
