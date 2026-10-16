import { describe, expect, it, vi } from 'vitest';
import { createDgUsageRecorder } from '../lib/dg-usage-recorder';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import type { DgUsageReport } from '../shared/dg-usage-report';

const runId = '12345678-1234-4234-8234-123456789abc';
const report: DgUsageReport = {
  version: 1, runId, settingsEventId: runId, sequence: 0, status: 'active', stopCode: null,
  startedAt: 1000, updatedAt: 1000, endedAt: null, elapsedMs: 0, durationMinutes: 30,
  eventCounts: { reserved: 0, submitted: 0, accepted: 0, settled: 0, uncertain: 0, rejected: 0, aborted: 0 },
  result: { settledPnl: 0, settledCount: 0, wins: 0, losses: 0, pendingCount: 0, uncertainCount: 0 },
};
const receipt = { ok: true, serverUpdatedAt: '2026-10-16T10:00:00.000Z', sequence: 0, status: 'active' };
const response = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('DG usage recorder bounded transport', () => {
  it('keeps the session in the body and sends only a strict aggregate report', async () => {
    const fetcher = vi.fn(async () => response(200, receipt));
    await expect(createDgUsageRecorder('opaque-session', fetcher as typeof fetch)(report)).resolves.toEqual(receipt);
    const [url, options] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/dg/usage-records');
    expect(options.credentials).toBe('same-origin');
    expect(JSON.parse(String(options.body))).toEqual({ sessionId: 'opaque-session', statementVersion: DG_RISK_STATEMENT.version, report });
    expect(String(url)).not.toContain('opaque-session');
  });

  it('does not retry terminal authentication or conflict responses', async () => {
    for (const status of [401, 403, 409]) {
      const fetcher = vi.fn(async () => response(status, { ok: false, error: 'usage_report_conflict' }));
      await expect(createDgUsageRecorder('opaque-session', fetcher as typeof fetch)(report)).rejects.toThrow('usage_recording_unavailable');
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });

  it('allows one keepalive attempt only and never posts a malformed/mismatched run', async () => {
    const fetcher = vi.fn(async () => response(503, { ok: false }));
    await expect(createDgUsageRecorder('opaque-session', fetcher as typeof fetch)(report, { keepalive: true })).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
    await expect(createDgUsageRecorder('', fetcher as typeof fetch)(report)).rejects.toThrow();
    await expect(createDgUsageRecorder('opaque-session', fetcher as typeof fetch)({ ...report, settingsEventId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })).rejects.toThrow();
    await expect(createDgUsageRecorder('opaque-session', fetcher as typeof fetch)({ ...report, stopCode: 'manual' })).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('accepts the server receipt for a non-running interrupted recovery report', async () => {
    const interrupted = { ...report, status: 'interrupted' as const };
    const fetcher = vi.fn(async () => response(200, { ...receipt, status: 'interrupted' }));
    await expect(createDgUsageRecorder('opaque-session', fetcher as typeof fetch)(interrupted)).resolves.toMatchObject({ status: 'interrupted' });
  });
});
