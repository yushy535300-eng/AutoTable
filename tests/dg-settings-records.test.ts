import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import { dgSettingsSnapshotSchema, type DgSettingsSnapshot } from '../shared/dg-settings-snapshot';
import { adminPage } from '../server/admin-page';
import { dgSettingsDetailsPage, registerDgSettingsRoutes } from '../server/dg-settings-routes';
import { registerAdminAuditReader } from '../server/admin-audit-reader';
import {
  DgSettingsEventConflict,
  ensureDgSettingsRecords,
  recordDgSettingsSnapshot,
} from '../server/dg-settings-records';
import { readRiskTrackerIdentity } from '../server/risk-acknowledgements';

const eventId = '962dce43-9f2d-4c7d-a347-bcbffbc054fa';
const recordedAt = '2026-10-16T10:00:00.000Z';
const snapshot: DgSettingsSnapshot = {
  version: 1,
  gamePlatform: 'DG',
  runMode: 'continuous',
  startMode: 'fresh',
  provider: 'combined',
  tableCount: '1',
  selectionMode: 'manual',
  selectedTables: [{ tableId: '1001', tableName: 'RB04' }],
  baseAmount: 100,
  staking: 'flat',
  maxStake: 1000,
  stopLoss: null,
  takeProfit: 600,
  durationMinutes: 30,
  minSeconds: 6,
  currency: 'TWD',
};

function mockDb() {
  const events = new Map<string, { recorded_at: string; snapshot_sha256: string; params: any[] }>();
  const query = vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.startsWith('INSERT INTO autobac_dg_settings_records')) {
      const key = `${params[0]}:${String(params[1]).toLowerCase()}:${params[2]}`;
      if (!events.has(key)) events.set(key, { recorded_at: recordedAt, snapshot_sha256: params[5], params });
      return { rows: [] };
    }
    if (sql.startsWith('SELECT recorded_at, snapshot_sha256')) {
      const key = `${params[0]}:${String(params[1]).toLowerCase()}:${params[2]}`;
      return { rows: [events.get(key)].filter(Boolean) };
    }
    return { rows: [] };
  });
  return { db: { query }, events };
}

describe('DG settings records: HTTP authority and strict snapshot contract', () => {
  let server: Server;
  let origin: string;
  const db = { query: vi.fn() } as any;
  const deps: any = {
    getPool: vi.fn(() => db),
    readRiskTrackerIdentity: vi.fn(async () => ({ platform: 'OFA', username: 'OwnerCase' })),
    recordDgSettingsSnapshot: vi.fn(async () => ({ ok: true as const, recordedAt })),
    listDgSettingsRecords: vi.fn(async () => ({
      account: { id: 8, platform: 'OFA', username: 'OwnerCase' }, rows: [], total: 0, page: 1, pages: 1,
    })),
  };
  const auditDb = {
    query: vi.fn(async (sql: string, params: any[] = []) => {
      if (sql === 'SELECT to_regclass($1) AS relation') {
        const relation = params[0] === 'public.tz_whitelist' || params[0] === 'public.autobac_dg_settings_records'
          ? String(params[0]).replace('public.', '') : null;
        return { rows: [{ relation }] };
      }
      if (sql.includes('FROM tz_whitelist WHERE id=$1')) return { rows: [{ id: 8, platform: 'OFA', username: 'OwnerCase' }] };
      if (sql.includes('COUNT(*)')) return { rows: [{ total: 0 }] };
      return { rows: [] };
    }),
  };

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    const requireAdmin = (req: any, res: any, next: any) => req.get('X-Admin-Token') === 'anonymous-admin' ? next() : res.status(401).end();
    registerDgSettingsRoutes(app, requireAdmin, deps as any);
    registerAdminAuditReader(app, requireAdmin, { getPool: () => auditDb as any });
    server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${(server.address() as any).port}`;
  });
  afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });

  const post = (body: any, headers: Record<string, string> = {}) => fetch(`${origin}/api/dg/settings-records`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
  const payload = (settings: unknown = snapshot) => ({ sessionId: 'opaque-session', eventId, statementVersion: DG_RISK_STATEMENT.version, settings });

  it('uses only server-resolved account identity, never a body account field', async () => {
    deps.recordDgSettingsSnapshot.mockClear();
    const result = await post(payload());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true, recordedAt });
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(deps.recordDgSettingsSnapshot.mock.calls[0][1]).toEqual({ platform: 'OFA', username: 'OwnerCase' });

    expect((await post({ ...payload(), username: 'another-account' })).status).toBe(400);
    expect((await post({ ...payload(), platform: 'MT' })).status).toBe(400);
  });

  it('rejects MT, unknown keys, non-DG provider, unsafe staking and malformed settings', async () => {
    expect((await post(payload({ ...snapshot, gamePlatform: 'MT' }))).status).toBe(400);
    expect((await post(payload({ ...snapshot, provider: 'not-an-existing-provider' }))).status).toBe(400);
    expect((await post(payload({ ...snapshot, unexpected: true }))).status).toBe(400);
    expect((await post(payload({ ...snapshot, maxStake: 99 }))).status).toBe(400);
    expect((await post(payload({ ...snapshot, tableCount: '3', staking: 'martingale' }))).status).toBe(400);
    expect((await post(payload({ ...snapshot, tableCount: '1', staking: 'martingale', stopLoss: null }))).status).toBe(400);
    expect((await post(payload({ ...snapshot, tableCount: '1', staking: 'martingale', stopLoss: 2599 }))).status).toBe(400);
    expect(dgSettingsSnapshotSchema.safeParse({ ...snapshot, tableCount: '1', staking: 'martingale', stopLoss: 2600 }).success).toBe(true);
  });

  it('rejects unavailable sessions, cross-site input, old statements, and missing database', async () => {
    deps.readRiskTrackerIdentity.mockResolvedValueOnce(null);
    expect((await post(payload())).status).toBe(401);
    expect((await post(payload(), { Origin: 'https://different.example' })).status).toBe(403);
    expect((await post(payload(), { 'Sec-Fetch-Site': 'cross-site' })).status).toBe(403);
    expect((await post({ ...payload(), statementVersion: 'old-version' })).status).toBe(409);
    deps.getPool.mockReturnValueOnce(null);
    expect((await post(payload())).status).toBe(503);
  });

  it('returns 409 when a retry UUID has an already-recorded, different canonical snapshot', async () => {
    deps.recordDgSettingsSnapshot.mockRejectedValueOnce(new DgSettingsEventConflict());
    const result = await post(payload({ ...snapshot, maxStake: 1200 }));
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ ok: false, error: 'settings_event_conflict' });
  });

  it('gates settings history with the administrator middleware', async () => {
    expect((await fetch(`${origin}/api/admin/whitelist/8/settings`)).status).toBe(401);
    expect((await fetch(`${origin}/api/admin/whitelist/8/settings?page=-1`, { headers: { 'X-Admin-Token': 'anonymous-admin' } })).status).toBe(400);
    const result = await fetch(`${origin}/api/admin/whitelist/8/settings`, { headers: { 'X-Admin-Token': 'anonymous-admin' } });
    expect(result.status).toBe(200);
    expect(result.headers.get('referrer-policy')).toBe('no-referrer');
    expect(await result.text()).toContain('OwnerCase');
  });
});

describe('DG settings records: append-only persistence and safe admin rendering', () => {
  it('reads current session/whitelist identity from original tables only', async () => {
    const db = { query: vi.fn(async (_sql?: string) => ({ rows: [{ platform: 'OFA', username: 'OwnerCase' }] })) };
    expect(await readRiskTrackerIdentity(db, 'opaque-session')).toEqual({ platform: 'OFA', username: 'OwnerCase' });
    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain('tracker_sessions');
    expect(sql).toContain('tz_whitelist');
    expect(sql).toContain('w.enabled=TRUE');
    expect(sql).toContain('w.expires_at>NOW()');
    expect(sql).not.toMatch(/CREATE|ALTER|UPDATE|DELETE|INSERT|DROP/i);
  });

  it('creates only an additive records table, preserves first retry time, and detects changed UUID payloads', async () => {
    const { db, events } = mockDb();
    await Promise.all([ensureDgSettingsRecords(db), ensureDgSettingsRecords(db)]);
    expect(db.query.mock.calls.filter((call: any[]) => String(call[0]).includes('CREATE TABLE'))).toHaveLength(1);

    const first = await recordDgSettingsSnapshot(db, { platform: 'ofa', username: 'OwnerCase' }, eventId, 'opaque-session', DG_RISK_STATEMENT.version, snapshot);
    const second = await recordDgSettingsSnapshot(db, { platform: 'OFA', username: 'ownercase' }, eventId, 'opaque-session', DG_RISK_STATEMENT.version, { ...snapshot, selectedTables: [{ tableName: 'RB04', tableId: '1001' }] });
    expect(first).toEqual({ ok: true, recordedAt });
    expect(second).toEqual(first);
    expect(events.size).toBe(1);
    await expect(recordDgSettingsSnapshot(db, { platform: 'OFA', username: 'OwnerCase' }, eventId, 'opaque-session', DG_RISK_STATEMENT.version, { ...snapshot, maxStake: 1200 })).rejects.toBeInstanceOf(DgSettingsEventConflict);

    const insert = db.query.mock.calls.find((call: any[]) => String(call[0]).startsWith('INSERT INTO autobac_dg_settings_records'));
    expect(insert).toBeDefined();
    const recordInsert = insert as any[];
    expect(recordInsert[0]).toContain('w.enabled=TRUE');
    expect(recordInsert[0]).toContain('w.expires_at>NOW()');
    expect(recordInsert[0]).toContain('s.session_id=$7');
    expect(recordInsert[0]).toContain('DO NOTHING');
    expect(recordInsert[1][4]).toContain('"baseAmount":100');
    expect(db.query.mock.calls.some((call: any[]) => /ALTER TABLE tz_whitelist|UPDATE tz_whitelist|DELETE FROM tz_whitelist/i.test(String(call[0])))).toBe(false);
  });

  it('escapes hostile stored content, labels settings in Chinese, and keeps the link inside the disclaimer cell', () => {
    const page = dgSettingsDetailsPage({
      account: { id: 8, platform: 'OFA', username: '<script>account</script>' }, total: 1, page: 1, pages: 1,
      rows: [{ recorded_at: recordedAt, statement_version: '<img src=x>', snapshot: { ...snapshot, selectedTables: [{ tableId: '1001', tableName: '<script>alert(1)</script>' }] } }],
    } as any);
    expect(page).not.toContain('<script>');
    expect(page).toContain('&lt;script&gt;');
    expect(page).toContain('不表示已開始下注');

    const readable = dgSettingsDetailsPage({
      account: { id: 8, platform: 'OFA', username: 'Owner' }, total: 1, page: 1, pages: 1,
      rows: [{ recorded_at: recordedAt, statement_version: DG_RISK_STATEMENT.version, snapshot }],
    } as any);
    expect(readable).toContain('策略提供者');
    expect(readable).toContain('基本金額');
    expect(readable).toContain('台北時間');
    const dashboard = adminPage(true, '', [{ id: 8, platform: 'OFA', username: 'Owner', enabled: true }]);
    expect(dashboard).toContain('/api/admin/whitelist/8/records');
    expect(dashboard).toContain('使用紀錄');
  });
});
