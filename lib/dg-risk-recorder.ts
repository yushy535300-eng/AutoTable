import { DG_RISK_STATEMENT, RISK_EVENT_ID, type DgRiskCheck, type DgRiskReceipt } from '../shared/dg-risk-statement';

export function createDgRiskRecorder(sessionId: string, fetcher: typeof fetch = fetch) {
  return async (event: DgRiskCheck): Promise<DgRiskReceipt> => {
    if (!sessionId || event?.checked !== true || !RISK_EVENT_ID.test(event?.eventId || '') || event.statementVersion !== DG_RISK_STATEMENT.version) throw new Error('invalid_acknowledgement');
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let retryable = true;
      try {
        const response = await fetcher('/api/dg/risk-acknowledgements', {
          method: 'POST', credentials: 'same-origin', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, eventId: event.eventId, checked: true, statementVersion: event.statementVersion }),
        });
        retryable = response.status >= 500;
        const data = await response.json();
        if (response.ok && data?.ok === true && typeof data.recordedAt === 'string' && Number.isFinite(Date.parse(data.recordedAt))) return { ok: true, recordedAt: data.recordedAt };
        throw new Error('recording_unavailable');
      } catch {
        if (!retryable || attempt === 2) throw new Error('recording_unavailable');
      } finally { clearTimeout(timer); }
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
    throw new Error('recording_unavailable');
  };
}

type Frame = { contentWindow: any; contentDocument: Document | null };
type Recorder = ReturnType<typeof createDgRiskRecorder>;
const bindings = new WeakMap<object, { checkbox: HTMLInputElement; recorder: Recorder; dispose: () => void }>();
const pending = new WeakMap<object, { document: Document; recorder: Recorder; observer: MutationObserver }>();

/** Credentials and callable recorder remain private to the parent-page closure. */
export function bindDgRiskRecorder(frame: Frame | null, recorder: Recorder): boolean {
  try {
    if (!frame?.contentDocument || frame.contentDocument.location.origin !== window.location.origin || !frame.contentWindow) return false;
    const shadow = frame.contentDocument.querySelector('#__dg_singlepage_panel__')?.shadowRoot;
    const checkbox = shadow?.getElementById('ack') as HTMLInputElement | null;
    const status = shadow?.getElementById('risk-record-state');
    if (!checkbox || checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox' || !status) {
      const previous = pending.get(frame);
      if (previous?.document === frame.contentDocument && previous.recorder === recorder) return false;
      previous?.observer.disconnect();
      const observer = new frame.contentWindow.MutationObserver(() => bindDgRiskRecorder(frame, recorder));
      pending.set(frame, { document: frame.contentDocument, recorder, observer });
      observer.observe(frame.contentDocument, { childList: true, subtree: true });
      return false;
    }
    pending.get(frame)?.observer.disconnect(); pending.delete(frame);
    const previous = bindings.get(frame);
    if (previous?.checkbox === checkbox && previous.recorder === recorder) return true;
    previous?.dispose();
    const win = frame.contentWindow;
    let active = true, generation = 0, trustedActivation = false;
    const update = (ticket: number, text: string) => { if (active && ticket === generation && status.isConnected) status.textContent = text; };
    const onClick = (event: Event) => {
      // HTMLInputElement.click() emits an untrusted click but a UA-generated,
      // trusted change. The actual activation must therefore be checked too.
      trustedActivation = event instanceof win.Event && event.isTrusted && event.target === checkbox;
    };
    const onChange = (event: Event) => {
      const activated = trustedActivation; trustedActivation = false;
      if (!activated || !(event instanceof win.Event) || !event.isTrusted || event.target !== checkbox) return;
      const ticket = ++generation;
      if (!checkbox.checked) { update(ticket, '已取消勾選；先前已記錄的勾選不會抹除'); return; }
      update(ticket, '勾選紀錄同步中…');
      try {
        const check: DgRiskCheck = { eventId: crypto.randomUUID(), checked: true, statementVersion: DG_RISK_STATEMENT.version };
        void recorder(check).then(receipt => { if (checkbox.checked) update(ticket, receipt.ok === true ? '勾選已記錄至管理後台' : '勾選紀錄尚未同步，可取消再勾選重試'); })
          .catch(() => { if (checkbox.checked) update(ticket, '勾選紀錄尚未同步，可取消再勾選重試'); });
      } catch { update(ticket, '勾選紀錄尚未同步，可取消再勾選重試'); }
    };
    checkbox.addEventListener('click', onClick, true);
    checkbox.addEventListener('change', onChange);
    checkbox.dataset.autobacRiskRecording = 'connected';
    const dispose = () => { active = false; generation++; checkbox.removeEventListener('click', onClick, true); checkbox.removeEventListener('change', onChange); delete checkbox.dataset.autobacRiskRecording; };
    bindings.set(frame, { checkbox, recorder, dispose });
    return true;
  } catch { return false; }
}

export function unbindDgRiskRecorder(frame: Frame | null, recorder: Recorder) {
  if (!frame) return;
  const waiting=pending.get(frame);
  if(waiting?.recorder===recorder){waiting.observer.disconnect();pending.delete(frame);}
  const entry = bindings.get(frame);
  if (entry?.recorder !== recorder) return;
  entry.dispose(); bindings.delete(frame);
}
