import type { Express } from 'express';
import { z } from 'zod';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import { dgUsageReportSchema } from '../shared/dg-usage-report';
import { getPool } from './whitelist';
import { readRiskTrackerIdentity } from './risk-acknowledgements';
import {
  DgUsageReportConflict,
  DgUsageRunOwnershipConflict,
  DgUsageSettingsNotReady,
  recordDgUsageReport,
} from './dg-usage-records';

const payload = z.object({
  sessionId: z.string().min(1).max(64),
  statementVersion: z.string().max(80),
  report: dgUsageReportSchema,
}).strict();

/** Client account fields are intentionally absent; the opaque original session resolves ownership server-side. */
export function registerDgUsageRoutes(
  app: Express,
  deps = { getPool, readRiskTrackerIdentity, recordDgUsageReport },
) {
  app.post('/api/dg/usage-records', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
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
    if (!input.success) return res.status(400).json({ ok: false, error: 'invalid_usage_report' });
    if (input.data.statementVersion !== DG_RISK_STATEMENT.version) return res.status(409).json({ ok: false, error: 'statement_version_changed' });
    try {
      const db = deps.getPool();
      if (!db) return res.status(503).json({ ok: false, error: 'recording_unavailable' });
      const identity = await deps.readRiskTrackerIdentity(db, input.data.sessionId);
      if (!identity) return res.status(401).json({ ok: false, error: 'session_or_whitelist_unavailable' });
      const receipt = await deps.recordDgUsageReport(db, identity, input.data.sessionId, input.data.statementVersion, input.data.report);
      if (!receipt) return res.status(403).json({ ok: false, error: 'whitelist_unavailable' });
      return res.json(receipt);
    } catch (error) {
      if (error instanceof DgUsageSettingsNotReady || (error as any)?.name === 'DgUsageSettingsNotReady') {
        return res.status(409).json({ ok: false, error: 'settings_not_ready' });
      }
      if (error instanceof DgUsageRunOwnershipConflict || error instanceof DgUsageReportConflict ||
          ['DgUsageRunOwnershipConflict', 'DgUsageReportConflict'].includes((error as any)?.name)) {
        return res.status(409).json({ ok: false, error: 'usage_report_conflict' });
      }
      // Never disclose SQL, session IDs, usernames, or connection details.
      return res.status(503).json({ ok: false, error: 'recording_unavailable' });
    }
  });
}
