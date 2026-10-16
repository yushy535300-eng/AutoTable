import {adminRecordPage, recordTime} from './admin-record-view';
import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import { DG_RISK_STATEMENT, RISK_EVENT_ID } from '../shared/dg-risk-statement';
import { getPool } from './whitelist';
import { listRiskAcknowledgements, recordRiskAcknowledgement, readRiskTrackerIdentity } from './risk-acknowledgements';

const payload = z.object({
  sessionId: z.string().min(1).max(64),
  eventId: z.string().regex(RISK_EVENT_ID),
  checked: z.literal(true),
  statementVersion: z.string().max(80),
}).strict();
const esc = (value: any) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function acknowledgementDetailsPage(data: NonNullable<Awaited<ReturnType<typeof listRiskAcknowledgements>>>) {
  const cards = data.rows.map((row: any) => `<article class="record"><div class="meta"><time>${esc(recordTime(row.recorded_at))}</time><span class="badge">${esc(row.game_platform)} · 已勾選</span></div><details><summary>查看當時聲明</summary><pre>${esc(row.statement_text)}</pre><small>聲明版本：${esc(row.statement_version)}</small><small>SHA-256：${esc(row.statement_sha256)}</small></details></article>`).join('');
  return adminRecordPage({ ...data, tab: 'acknowledgements', content: cards });
}

export function registerRiskAcknowledgementRoutes(app: Express, requireAdmin: RequestHandler, deps = { getPool, readRiskTrackerIdentity, recordRiskAcknowledgement, listRiskAcknowledgements }) {
  app.post('/api/dg/risk-acknowledgements', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    // The session credential stays in the request body, never in a URL/log.
    if (req.get('Sec-Fetch-Site') === 'cross-site') return res.status(403).json({ ok: false, error: 'same_origin_required' });
    const origin = req.get('Origin');
    if (origin) { try { if (new URL(origin).host !== req.get('Host')) return res.status(403).json({ ok: false, error: 'same_origin_required' }); } catch { return res.status(403).json({ ok: false, error: 'same_origin_required' }); } }
    const input = payload.safeParse(req.body);
    if (!input.success) return res.status(400).json({ ok: false, error: 'invalid_acknowledgement' });
    if (input.data.statementVersion !== DG_RISK_STATEMENT.version) return res.status(409).json({ ok: false, error: 'statement_version_changed' });
    try {
      const db = deps.getPool();
      if (!db) return res.status(503).json({ ok: false, error: 'recording_unavailable' });
      const session = await deps.readRiskTrackerIdentity(db, input.data.sessionId);
      if (!session) return res.status(401).json({ ok: false, error: 'session_or_whitelist_unavailable' });
      const receipt = await deps.recordRiskAcknowledgement(db, session, input.data.eventId, input.data.sessionId);
      if (!receipt) return res.status(403).json({ ok: false, error: 'whitelist_unavailable' });
      return res.json(receipt);
    } catch {
      // Do not print SQL, connection strings, session credentials or account data.
      return res.status(503).json({ ok: false, error: 'recording_unavailable' });
    }
  });
}
