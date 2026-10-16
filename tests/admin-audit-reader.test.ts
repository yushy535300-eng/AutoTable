import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import { createServer } from 'node:http';
import {
  adminAuditDetailsPage,
  readAdminAuditRecords,
  registerAdminAuditReader,
} from '../server/admin-audit-reader';

const account = { id: 8, platform: 'OFA', username: 'Owner' };

function relationDb(options: { usage?: boolean; settings?: boolean; acknowledgements?: boolean } = {}) {
  const calls: Array<[string, unknown[] | undefined]> = [];
  const query = vi.fn(async (sql: string, values?: unknown[]) => {
    calls.push([sql, values]);
    if (sql === 'SELECT to_regclass($1) AS relation') {
      const name = String(values?.[0]);
      if (name === 'public.tz_whitelist') return { rows: [{ relation: 'tz_whitelist' }] };
      if (name === 'public.autobac_dg_usage_records') return { rows: [{ relation: options.usage ? 'autobac_dg_usage_records' : null }] };
      if (name === 'public.autobac_dg_settings_records') return { rows: [{ relation: options.settings ? 'autobac_dg_settings_records' : null }] };
      if (name === 'public.autobac_risk_acknowledgements') return { rows: [{ relation: options.acknowledgements ? 'autobac_risk_acknowledgements' : null }] };
    }
    if (sql.includes('FROM tz_whitelist WHERE id=$1')) return { rows: [account] };
    if (sql.includes('COUNT(*)')) return { rows: [{ total: 1 }] };
    if (sql.includes('FROM autobac_dg_usage_records')) {
      return { rows: [{
        record_id: 22, record_source: 'usage', run_id: '00000000-0000-4000-8000-000000000022', settings_event_id: '00000000-0000-4000-8000-000000000022',
        status: 'active', sequence: 3, client_started_at_ms: 1760000000000, client_updated_at_ms: 1760000065000, elapsed_ms: 65000,
        server_updated_at: '2020-01-01T00:00:00Z', report: { result: { settledPnl: 120, pendingCount: 2, uncertainCount: 1 } },
        settings_snapshot: { version: 1, gamePlatform: 'DG', runMode: 'continuous', startMode: 'fresh', provider: 'road', tableCount: '1', selectionMode: 'manual', selectedTables: [], baseAmount: 100, staking: 'flat', maxStake: 100, stopLoss: null, takeProfit: null, durationMinutes: 30, minSeconds: 6, currency: 'TWD' },
      }] };
    }
    if (sql.includes('FROM autobac_dg_settings_records')) {
      return { rows: [{
        recorded_at: '2026-10-16T10:00:00Z', statement_version: 'v4',
        snapshot: { version: 1, gamePlatform: 'DG', runMode: 'continuous', startMode: 'fresh', provider: 'road', tableCount: '1', selectionMode: 'manual', selectedTables: [{ tableId: '1001', tableName: 'S03' }], baseAmount: 100, staking: 'flat', maxStake: 100, stopLoss: null, takeProfit: null, durationMinutes: 0, minSeconds: 6, currency: 'TWD' },
      }] };
    }
    return { rows: [] };
  });
  return { query, calls };
}

describe('shared read-only admin audit reader', () => {
  it('uses only SELECT/to_regclass and labels a missing historical table as not enabled', async () => {
    const db = relationDb();
    const result = await readAdminAuditRecords(db as any, 8, 1, 'settings');
    expect(result).toMatchObject({ account, unavailable: true, total: 0, rows: [] });
    expect(db.calls.some(([sql]) => /\b(?:CREATE|ALTER|INSERT|UPDATE|DELETE|DROP)\b/i.test(sql))).toBe(false);
    expect(db.calls.every(([sql]) => /^SELECT\b/i.test(sql.trim()))).toBe(true);
    const html = adminAuditDetailsPage(result!, 'settings');
    expect(html).toContain('尚未啟用此類審核紀錄');
    expect(html).toContain('不以空白或 0 補造');
  });

  it('renders the full settings fields safely and marks absent old fields as 未回傳 rather than zero', async () => {
    const db = relationDb({ settings: true });
    const result = await readAdminAuditRecords(db as any, 8, 1, 'settings');
    const html = adminAuditDetailsPage(result!, 'settings');
    expect(html).toContain('策略提供者');
    expect(html).toContain('配注方式');
    expect(html).toContain('基本金額');
    expect(html).toContain('桌台數量');
    expect(html).toContain('自動停止時間（分鐘）');
    expect(html).toContain('不限時');
    expect(html).toContain('v3.2.20');
    expect(html).toContain('使用設定');
    expect(html).toContain('免責確認');

    const legacyHtml = adminAuditDetailsPage({
      account, total: 1, page: 1, pages: 1, unavailable: false,
      rows: [{ recorded_at: '2026-10-16T10:00:00Z', snapshot: { provider: '<script>road</script>' }, statement_version: '<img>' }],
    }, 'settings');
    expect(legacyHtml).toContain('未回傳');
    expect(legacyHtml).toContain('&lt;script&gt;road&lt;/script&gt;');
    expect(legacyHtml).not.toContain('<script>road</script>');
    expect(legacyHtml).not.toContain('<img>');
  });

  it('keeps old settings visible in the default two-tab view before any usage table exists', async () => {
    const db = relationDb({ settings: true });
    const result = await readAdminAuditRecords(db as any, 8, 1, 'usage');
    expect(result).toMatchObject({ unavailable: false, total: 1 });
    const html = adminAuditDetailsPage(result!, 'usage');
    expect(html).toContain('此舊設定尚無使用回傳');
    expect(html).toContain('每注額 100');
    expect(html).not.toContain('00:00:00');
    expect(db.calls.every(([sql]) => /^SELECT\b/i.test(sql.trim()))).toBe(true);
  });

  it('escapes acknowledgement content and exposes no unauthenticated read route', async () => {
    const page = adminAuditDetailsPage({
      account: { ...account, username: '<script>owner</script>' }, total: 1, page: 1, pages: 1, unavailable: false,
      rows: [{ recorded_at: '2026-10-16T10:00:00Z', game_platform: 'DG', statement_version: '<img>', statement_text: '<script>unsafe</script>', statement_sha256: '<b>hash</b>' }],
    }, 'acknowledgements');
    expect(page).toContain('&lt;script&gt;unsafe&lt;/script&gt;');
    expect(page).not.toContain('<script>unsafe</script>');
    expect(page).not.toContain('<img>');

    const app = express();
    const server = createServer(app);
    const db = relationDb();
    registerAdminAuditReader(app, ((_req: any, res: any) => res.status(401).end()) as any, { getPool: () => db as any });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const port = (server.address() as any).port;
      const response = await fetch(`http://127.0.0.1:${port}/api/admin/whitelist/8/records`);
      expect(response.status).toBe(401);
      expect(db.query).not.toHaveBeenCalled();
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });

  it('joins usage runId to the matching settings event and never turns absent client results into zero', async () => {
    const db = relationDb({ usage: true, settings: true });
    const result = await readAdminAuditRecords(db as any, 8, 1, 'usage');
    expect(result).toMatchObject({ unavailable: false, total: 1, settingsAvailable: true });
    const read = db.calls.find(([sql]) => sql.includes('LEFT JOIN autobac_dg_settings_records'))![0];
    expect(read).toContain('s.event_id=u.settings_event_id');
    expect(read).toContain("'settings_only'::text");
    expect(db.calls.some(([sql]) => /\b(?:CREATE|ALTER|INSERT|UPDATE|DELETE|DROP)\b/i.test(sql))).toBe(false);
    const html = adminAuditDetailsPage(result!, 'usage');
    expect(html).toContain('實際使用時間：00:01:05');
    expect(html).toContain('本次已結算輸贏：120');
    expect(html).toContain('待結算：2 ／ 歸屬不明：1');
    expect(html).toContain('失聯／最後回傳於');
    expect(html).toContain('資料來源：AutoBac DG 客戶端回報');
    expect(html).toContain('完整設定');

    const missingResult = adminAuditDetailsPage({
      account, total: 1, page: 1, pages: 1, unavailable: false,
      rows: [{ record_source: 'usage', status: 'stopped', elapsed_ms: null, client_started_at_ms: null, client_updated_at_ms: null, server_updated_at: '2026-10-16T10:00:00Z', report: {}, settings_snapshot: null }],
    }, 'usage');
    expect(missingResult).toContain('實際使用時間：未回傳');
    expect(missingResult).toContain('本次已結算輸贏：未回傳');
    expect(missingResult).toContain('待結算：未回傳 ／ 歸屬不明：未回傳');
    expect(missingResult).not.toContain('本次已結算輸贏：0');
    expect(missingResult).not.toContain('1970/');
    expect((html.match(/<a href="[^"]*"[^>]*>/g) || []).filter(tag => !tag.includes('/admin"')).length).toBe(2);
  });
});
