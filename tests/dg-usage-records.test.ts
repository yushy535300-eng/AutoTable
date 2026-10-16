import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import type { DgUsageReport } from '../shared/dg-usage-report';
import { registerDgUsageRoutes } from '../server/dg-usage-routes';
import {
  DgUsageReportConflict,
  DgUsageRunOwnershipConflict,
  ensureDgUsageRecords,
  recordDgUsageReport,
} from '../server/dg-usage-records';

const runId = '12345678-1234-4234-8234-123456789abc';
const now = '2026-10-16T10:00:00.000Z';
const report: DgUsageReport = {
  version: 1, runId, settingsEventId: runId, sequence: 0, status: 'active', stopCode: null,
  startedAt: 1000, updatedAt: 1000, endedAt: null, elapsedMs: 0, durationMinutes: 30,
  eventCounts: { reserved: 0, submitted: 0, accepted: 1, settled: 0, uncertain: 0, rejected: 0, aborted: 0 },
  result: { settledPnl: 0, settledCount: 0, wins: 0, losses: 0, pendingCount: 1, uncertainCount: 0 },
};

function mockDb() {
  const rows = new Map<string, any>();
  const query = vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.startsWith('INSERT INTO autobac_dg_usage_records')) {
      const key = params[2];
      if (rows.has(key)) return { rows: [] };
      const row = { platform: params[0], username_key: String(params[1]).toLowerCase(), sequence: params[7], status: params[5],
        elapsed_ms: params[11], client_updated_at_ms: params[9], report_sha256: params[13], server_updated_at: now };
      rows.set(key, row);
      return { rows: [row] };
    }
    if (sql.includes('FROM autobac_dg_settings_records')) return { rows: [{ ok: 1 }] };
    if (sql.includes('FROM autobac_dg_usage_records WHERE run_id=')) return { rows: [rows.get(params[0])].filter(Boolean) };
    return { rows: [] };
  });
  return { db: { query }, rows };
}

describe('DG usage records: server authority and strict report contract', () => {
  let server: Server;
  let origin: string;
  const db = { query: vi.fn() } as any;
  const deps: any = {
    getPool: vi.fn(() => db),
    readRiskTrackerIdentity: vi.fn(async () => ({ platform: 'OFA', username: 'OwnerCase' })),
    recordDgUsageReport: vi.fn(async () => ({ ok: true as const, serverUpdatedAt: now, sequence: 0, status: 'active' })),
  };

  beforeAll(async () => {
    const app = express(); app.use(express.json()); registerDgUsageRoutes(app, deps);
    server = createServer(app); await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${(server.address() as any).port}`;
  });
  afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });
  const post = (body: unknown, headers: Record<string, string> = {}) => fetch(`${origin}/api/dg/usage-records`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
  const payload = (value: unknown = report) => ({ sessionId: 'opaque-session', statementVersion: DG_RISK_STATEMENT.version, report: value });

  it('uses only the original server-resolved identity and refuses body account fields', async () => {
    const result = await post(payload());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true, serverUpdatedAt: now, sequence: 0, status: 'active' });
    expect(deps.recordDgUsageReport.mock.calls.at(-1)[1]).toEqual({ platform: 'OFA', username: 'OwnerCase' });
    expect((await post({ ...payload(), username: 'other' })).status).toBe(400);
  });

  it('rejects mismatched IDs, raw unknown fields, old statements, cross-site input and missing sessions', async () => {
    expect((await post(payload({ ...report, settingsEventId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }))).status).toBe(400);
    expect((await post(payload({ ...report, rawPacket: 'secret' }))).status).toBe(400);
    expect((await post({ ...payload(), statementVersion: 'old' })).status).toBe(409);
    expect((await post(payload(), { Origin: 'https://other.example' })).status).toBe(403);
    deps.readRiskTrackerIdentity.mockResolvedValueOnce(null);
    expect((await post(payload())).status).toBe(401);
  });

  it('accepts interrupted recovery snapshots without an invented stop time or reason', async () => {
    const recovered = { ...report, status: 'interrupted' as const, stopCode: null, endedAt: null };
    expect((await post(payload(recovered))).status).toBe(200);
    expect((await post(payload({ ...recovered, endedAt: 1001 }))).status).toBe(400);
  });
});

describe('DG usage records: additive, idempotent and non-recoverable terminal runs', () => {
  it('creates only the additive usage table and preserves an equal-sequence retry', async () => {
    const { db, rows } = mockDb();
    await Promise.all([ensureDgUsageRecords(db), ensureDgUsageRecords(db)]);
    expect(db.query.mock.calls.filter((call: any[]) => String(call[0]).includes('CREATE TABLE IF NOT EXISTS autobac_dg_usage_records'))).toHaveLength(1);
    const first = await recordDgUsageReport(db, { platform: 'ofa', username: 'OwnerCase' }, 'session', DG_RISK_STATEMENT.version, report);
    const second = await recordDgUsageReport(db, { platform: 'OFA', username: 'ownercase' }, 'session', DG_RISK_STATEMENT.version, report);
    expect(first).toEqual({ ok: true, serverUpdatedAt: now, sequence: 0, status: 'active' });
    expect(second).toEqual(first);
    expect(rows.size).toBe(1);
    const insert = db.query.mock.calls.find((call: any[]) => String(call[0]).startsWith('INSERT INTO autobac_dg_usage_records')) as any[];
    expect(insert[0]).toContain('s.session_id=$15');
    expect(insert[0]).toContain('autobac_dg_settings_records');
    expect(insert[0]).toContain("autobac_dg_usage_records.status IN ('stopped','interrupted') AND EXCLUDED.status='active'");
    expect(db.query.mock.calls.some((call: any[]) => String(call[0]).includes('run_id UUID NOT NULL UNIQUE'))).toBe(true);
  });

  it('rejects cross-account same-run use and reports that settings event/run IDs must match', async () => {
    const { db } = mockDb();
    await recordDgUsageReport(db, { platform: 'OFA', username: 'OwnerCase' }, 'session', DG_RISK_STATEMENT.version, report);
    await expect(recordDgUsageReport(db, { platform: 'TZ', username: 'Other' }, 'session', DG_RISK_STATEMENT.version, report)).rejects.toBeInstanceOf(DgUsageRunOwnershipConflict);
    await expect(recordDgUsageReport(db, { platform: 'OFA', username: 'OwnerCase' }, 'session', DG_RISK_STATEMENT.version, { ...report, settingsEventId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })).rejects.toBeTruthy();
  });

  it('does not accept a changed payload for the same sequence', async () => {
    const { db } = mockDb();
    await recordDgUsageReport(db, { platform: 'OFA', username: 'OwnerCase' }, 'session', DG_RISK_STATEMENT.version, report);
    await expect(recordDgUsageReport(db, { platform: 'OFA', username: 'OwnerCase' }, 'session', DG_RISK_STATEMENT.version, { ...report, elapsedMs: 1, updatedAt: 1001 })).rejects.toBeInstanceOf(DgUsageReportConflict);
  });
});
