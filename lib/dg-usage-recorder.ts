import {
  DG_USAGE_REPORT_EVENT,
  DG_USAGE_SYNC_EVENT,
  dgUsageReportSchema,
  type DgUsageReceipt,
  type DgUsageReport,
  type DgUsageSyncState,
} from '../shared/dg-usage-report';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';

type RecordOptions = { keepalive?: boolean };

/** Session capability stays in the outer-page closure and is never attached to the game window. */
export function createDgUsageRecorder(sessionId: string, fetcher: typeof fetch = fetch) {
  return async (report: DgUsageReport, options: RecordOptions = {}): Promise<DgUsageReceipt> => {
    const parsed = dgUsageReportSchema.parse(report);
    if (!sessionId) throw new Error('invalid_usage_report');
    const body = JSON.stringify({ sessionId, statementVersion: DG_RISK_STATEMENT.version, report: parsed });
    // The settings writer has three 8-second attempts. Only its explicit 409 race signal gets
    // this longer (but still finite) window, so a zero-second baseline is not discarded.
    const attempts = options.keepalive ? 1 : 12;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const controller = options.keepalive ? null : new AbortController();
      const timer = controller ? setTimeout(() => controller.abort(), 8000) : null;
      let retryable = true;
      let settingsNotReady = false;
      try {
        const response = await fetcher('/api/dg/usage-records', {
          method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
          body, keepalive: options.keepalive === true, signal: controller?.signal,
        });
        let result: any = null;
        try { result = await response.json(); } catch { /* response below determines retry policy */ }
        settingsNotReady = response.status === 409 && result?.error === 'settings_not_ready';
        retryable = response.status >= 500 || settingsNotReady;
        if (response.ok && result?.ok === true && typeof result.serverUpdatedAt === 'string' &&
            Number.isFinite(Date.parse(result.serverUpdatedAt)) && result.sequence === parsed.sequence &&
            (result.status === 'active' || result.status === 'stopped' || result.status === 'interrupted')) {
          return result as DgUsageReceipt;
        }
        throw new Error('usage_recording_unavailable');
      } catch {
        // Ordinary transport/server failures remain bounded to three sends; only the known
        // settings-first race may use all twelve immutable same-sequence attempts.
        if (!retryable || (!settingsNotReady && attempt >= 2) || attempt === attempts - 1) throw new Error('usage_recording_unavailable');
      } finally {
        if (timer !== null) clearTimeout(timer);
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(4000, 500 * (attempt + 1))));
    }
    throw new Error('usage_recording_unavailable');
  };
}

type Frame = { contentWindow: any; contentDocument: Document | null };
type Recorder = ReturnType<typeof createDgUsageRecorder>;
type Binding = { recorder: Recorder; dispose: () => void };
const bindings = new WeakMap<object, Binding>();

/** Binds only the same-origin game frame and serializes normal reports per run to retain sequence order. */
export function bindDgUsageRecorder(frame: Frame | null, recorder: Recorder): boolean {
  try {
    if (!frame?.contentDocument || !frame.contentWindow || frame.contentDocument.location.origin !== window.location.origin) return false;
    const old = bindings.get(frame);
    if (old?.recorder === recorder) return true;
    old?.dispose();
    const win = frame.contentWindow;
    let active = true;
    const queues = new Map<string, Promise<void>>();
    const notify = (report: DgUsageReport, state: DgUsageSyncState) => {
      if (active) win.dispatchEvent(new win.CustomEvent(DG_USAGE_SYNC_EVENT, {
        detail: { runId: report.runId, sequence: report.sequence, state },
      }));
    };
    const send = (report: DgUsageReport, keepalive: boolean) => {
      const job = () => recorder(report, { keepalive }).then(() => notify(report, 'synced')).catch(() => notify(report, 'failed'));
      if (keepalive) { void job(); return; }
      const previous = queues.get(report.runId) ?? Promise.resolve();
      const queued = previous.catch(() => undefined).then(job);
      let tracked: Promise<void>;
      tracked = queued.finally(() => {
        if (queues.get(report.runId) === tracked) queues.delete(report.runId);
      });
      queues.set(report.runId, tracked);
    };
    const onReport = (event: any) => {
      if (!active || !(event instanceof win.CustomEvent) || event.target !== win) return;
      const parsed = dgUsageReportSchema.safeParse(event.detail?.report);
      if (!parsed.success) return;
      send(parsed.data, event.detail?.keepalive === true);
    };
    win.addEventListener(DG_USAGE_REPORT_EVENT, onReport);
    const dispose = () => { active = false; queues.clear(); win.removeEventListener(DG_USAGE_REPORT_EVENT, onReport); };
    bindings.set(frame, { recorder, dispose });
    return true;
  } catch { return false; }
}

export function unbindDgUsageRecorder(frame: Frame | null, recorder: Recorder) {
  if (!frame) return;
  const entry = bindings.get(frame);
  if (entry?.recorder !== recorder) return;
  entry.dispose();
  bindings.delete(frame);
}
