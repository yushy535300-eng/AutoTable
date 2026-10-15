import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { createHash } from 'node:crypto';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import { registerRiskAcknowledgementRoutes, acknowledgementDetailsPage } from '../server/risk-acknowledgement-routes';
import { ensureRiskAcknowledgements, recordRiskAcknowledgement, withRiskAcknowledgementSummaries, readRiskTrackerIdentity } from '../server/risk-acknowledgements';
import { createDgRiskRecorder, bindDgRiskRecorder, unbindDgRiskRecorder } from '../lib/dg-risk-recorder';
import { adminPage } from '../server/admin-page';

const eventId = '962dce43-9f2d-4c7d-a347-bcbffbc054fa';
const event = { eventId, checked: true as const, statementVersion: DG_RISK_STATEMENT.version };
const recordedAt = '2026-10-15T13:00:00.000Z';
afterEach(() => vi.unstubAllGlobals());

describe('acknowledgement route: only original session identity can be recorded', () => {
  let server: Server, origin: string;
  const deps = {
    getPool: vi.fn(() => ({ query: vi.fn() }) as any),
    readRiskTrackerIdentity: vi.fn(async () => ({ platform: 'OFA', username: 'OwnerCase' })),
    recordRiskAcknowledgement: vi.fn(async (..._args: any[]) => ({ ok: true as const, recordedAt })),
    listRiskAcknowledgements: vi.fn(async () => ({ account: { id: 8, platform: 'OFA', username: 'OwnerCase' }, rows: [], total: 0, page: 1, pages: 1 })),
  };
  beforeAll(async () => {
    const app = express(); app.use(express.json());
    registerRiskAcknowledgementRoutes(app, (req, res, next) => req.get('X-Admin-Token') === 'anonymous-admin' ? next() : res.status(401).end(), deps as any);
    server = createServer(app); await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${(server.address() as any).port}`;
  });
  afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });
  const post = (data: any, headers = {}) => fetch(`${origin}/api/dg/risk-acknowledgements`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) });
  it('records checked event using SERVER identity; no client account or game credential', async () => {
    deps.recordRiskAcknowledgement.mockClear();
    const r = await post({ sessionId: 'opaque-test', ...event }); expect(r.status).toBe(200); expect(await r.json()).toEqual({ ok: true, recordedAt });
    expect(deps.recordRiskAcknowledgement.mock.calls[0][1]).toEqual({ platform: 'OFA', username: 'OwnerCase' });
    expect(r.headers.get('cache-control')).toBe('no-store');
  });
  it('rejects forged account, unchecked event, malformed ID and wrong statement version', async () => {
    expect((await post({ sessionId: 'opaque-test', ...event, username: 'someone-else' })).status).toBe(400);
    expect((await post({ sessionId: 'opaque-test', ...event, checked: false })).status).toBe(400);
    expect((await post({ sessionId: 'opaque-test', ...event, eventId: 'bad' })).status).toBe(400);
    expect((await post({ sessionId: 'opaque-test', ...event, statementVersion: 'old-version' })).status).toBe(409);
  });
  it('rejects invalid session or revoked whitelist without writing', async () => {
    deps.recordRiskAcknowledgement.mockClear(); deps.readRiskTrackerIdentity.mockResolvedValueOnce(null as any);
    expect((await post({ sessionId: 'invalid', ...event })).status).toBe(401);
    deps.readRiskTrackerIdentity.mockResolvedValueOnce(null as any);
    expect((await post({ sessionId: 'opaque-test', ...event })).status).toBe(401);
    expect(deps.recordRiskAcknowledgement).not.toHaveBeenCalled();
  });
  it('rejects cross-origin and cross-site requests', async () => {
    expect((await post({ sessionId: 'opaque-test', ...event }, { Origin: 'https://different.example' })).status).toBe(403);
    expect((await post({ sessionId: 'opaque-test', ...event }, { 'Sec-Fetch-Site': 'cross-site' })).status).toBe(403);
  });
  it('never reports recorded when persistence fails', async () => {
    deps.recordRiskAcknowledgement.mockRejectedValueOnce(new Error('private-db-details'));
    const r = await post({ sessionId: 'opaque-test', ...event }); expect(r.status).toBe(503); expect(await r.text()).not.toContain('private-db-details');
  });
  it('protects all history from non-admins and validates pagination', async () => {
    expect((await fetch(`${origin}/api/admin/whitelist/8/acknowledgements`)).status).toBe(401);
    expect((await fetch(`${origin}/api/admin/whitelist/8/acknowledgements?page=-1`, { headers: { 'X-Admin-Token': 'anonymous-admin' } })).status).toBe(400);
    const r = await fetch(`${origin}/api/admin/whitelist/8/acknowledgements`, { headers: { 'X-Admin-Token': 'anonymous-admin' } }); expect(r.status).toBe(200); expect(await r.text()).toContain('OwnerCase');
  });
});

describe('append-only acknowledgement persistence', () => {
  it('reads valid session + whitelist without running legacy initializer or modifying old data', async () => {
    const db={query:vi.fn(async()=>({rows:[{platform:'OFA',username:'OwnerCase'}]}))};
    expect(await readRiskTrackerIdentity(db,'opaque-test')).toEqual({platform:'OFA',username:'OwnerCase'});
    const sql=(db.query.mock.calls as any)[0][0];
    expect(sql).toContain('s.session_id=$1');expect(sql).toContain('w.enabled=TRUE');expect(sql).toContain('w.expires_at>NOW()');
    expect(sql).not.toMatch(/CREATE|ALTER|UPDATE|DELETE|INSERT|DROP/i);
  });

  it('adds schema once, binds platform/account, hashes snapshot, duplicates retain first server time', async () => {
    const events = new Map<string, any>();
    const query = vi.fn(async (sql: string, params?: any[]) => {
      if (sql.startsWith('INSERT INTO autobac_risk_acknowledgements')) {
        expect(sql).toContain('w.enabled=TRUE'); expect(sql).toContain('w.expires_at>NOW()'); expect(sql).toContain('DO NOTHING'); expect(sql).toContain('s.session_id=$7');
        const key = `${params![0]}:${params![1].toLowerCase()}:${params![2]}`;
        if (!events.has(key)) events.set(key, { recorded_at: recordedAt, values: params });
      }
      if (sql.startsWith('SELECT recorded_at')) return { rows: [events.get(`${params![0]}:${params![1].toLowerCase()}:${params![2]}`)].filter(Boolean) };
      return { rows: [] };
    });
    const db = { query }; await Promise.all([ensureRiskAcknowledgements(db), ensureRiskAcknowledgements(db)]);
    expect(query.mock.calls.filter(call => call[0].includes('CREATE TABLE'))).toHaveLength(1);
    const first = await recordRiskAcknowledgement(db, { platform: 'ofa', username: 'OwnerCase' }, eventId, 'opaque-test');
    const second = await recordRiskAcknowledgement(db, { platform: 'OFA', username: 'ownercase' }, eventId, 'opaque-test');
    expect(first).toEqual(second); expect(events.size).toBe(1);
    const values = [...events.values()][0].values; expect(values[3]).toBe(DG_RISK_STATEMENT.version);
    expect(values[4]).toContain(DG_RISK_STATEMENT.text); expect(values[5]).toBe(createHash('sha256').update(values[4]).digest('hex'));
    expect(query.mock.calls.some(call => /DELETE|UPDATE tz_whitelist|ALTER TABLE tz_whitelist/i.test(call[0]))).toBe(false);
  });
  it('whitelist summaries are account AND platform isolated and preserve note/authorization', async () => {
    const db = { query: vi.fn(async (sql: string) => ({ rows: sql.startsWith('SELECT platform') ? [{ platform: 'OFA', username_key: 'same', acknowledgement_count: 2, acknowledgement_latest: recordedAt }] : [] })) };
    const rows = await withRiskAcknowledgementSummaries(db, [{ platform: 'OFA', username: 'Same', note: 'keep', enabled: true }, { platform: 'TZ', username: 'same', note: 'other', enabled: false }]);
    expect(rows[0].acknowledgement_count).toBe(2); expect(rows[0].note).toBe('keep'); expect(rows[1].acknowledgement_count).toBe(0); expect(rows[1].enabled).toBe(false);
  });
  it('escapes stored statement text and never marks historical checkbox as wager success', () => {
    const details = acknowledgementDetailsPage({ account: { id: 8, platform: 'OFA', username: '<script>' }, total: 1, page: 1, pages: 1, rows: [{ recorded_at: recordedAt, statement_version: 'v1', game_platform: 'DG', statement_text: '<script>alert(1)</script>', statement_sha256: 'hash' }] });
    expect(details).not.toContain('<script>'); expect(details).toContain('&lt;script&gt;'); expect(details).toContain('不表示已開始下注');
    const page = adminPage(true, '', [{ id: 8, platform: 'OFA', username: 'Owner', enabled: true, note: 'keep', acknowledgement_count: 2, acknowledgement_latest: recordedAt }]);
    expect(page).toContain('已勾選 · 2 次'); expect(page).toContain('/api/admin/whitelist/8/acknowledgements');
  });
});

describe('client recording is asynchronous, bounded and no credential leaks into frame', () => {
  it('retries same event ID, no duplicate client event and no game token', async () => {
    const calls: any[] = [];
    const fetcher = vi.fn(async (_url: any, options: any) => { calls.push(JSON.parse(options.body)); return new Response(JSON.stringify(calls.length === 1 ? { ok: false } : { ok: true, recordedAt }), { status: calls.length === 1 ? 503 : 200 }); }) as any;
    const recorder = createDgRiskRecorder('opaque-test', fetcher); expect(await recorder(event)).toEqual({ ok: true, recordedAt });
    expect(calls).toHaveLength(2); expect(calls[0]).toEqual(calls[1]); expect(Object.keys(calls[0]).sort()).toEqual(['checked', 'eventId', 'sessionId', 'statementVersion']);
  });
  it('does not retry authorization rejection and never returns false-success', async () => {
    const fetcher = vi.fn(async () => new Response('{"ok":false}', { status: 401 })) as any;
    await expect(createDgRiskRecorder('opaque-test', fetcher)(event)).rejects.toThrow('recording_unavailable'); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('keeps recorder private, rejects scripted change events and unbinds cleanly', () => {
    vi.stubGlobal('window', { location: { origin: 'https://local.example' } });
    const recorder = vi.fn(async () => ({ok:true as const, recordedAt}));
    const checkbox = Object.assign(new EventTarget(), {tagName:'INPUT',type:'checkbox',checked:true,dataset:{} as any});
    const status = {isConnected:true,textContent:''};
    const win:any={Event};
    const frame:any={contentWindow:win,contentDocument:{location:{origin:'https://local.example'},querySelector:()=>({shadowRoot:{getElementById:(id:string)=>id==='ack'?checkbox:status}})}};
    expect(bindDgRiskRecorder(frame,recorder)).toBe(true);
    expect(Object.keys(win)).toEqual(['Event']);
    checkbox.dispatchEvent(new Event('change'));
    expect(recorder).not.toHaveBeenCalled();
    expect(bindDgRiskRecorder(frame,recorder)).toBe(true);
    unbindDgRiskRecorder(frame,recorder);expect(checkbox.dataset.autobacRiskRecording).toBeUndefined();
    expect(bindDgRiskRecorder({...frame,contentDocument:{location:{origin:'https://foreign.example'}}},recorder)).toBe(false);
  });
});
