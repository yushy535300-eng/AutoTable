import { emptyTurnover, mtOfficialRange, officialAmount, taipeiDay, type OfficialTurnoverView, type TurnoverPeriod } from './official-turnover-data';

const HISTORY = '/api/v1/gametype/*/game/*/bet/history';
const isHistory = (p: any) => /\/bet\/history$/.test(typeof p?.action === 'string' ? p.action : p?.action?.name || '');

/** Read-only queries on the current native socket. Never interprets wager/P&L as turnover. */
export function createMtOfficialTurnover(W: any, canRefresh: () => boolean = () => true) {
  let data = emptyTurnover('MT', 'MT官方百家樂報表（room_id=1、全部桌台）');
  let socket: any = null, disposed = false, ownSending = false;
  let day = taipeiDay(), lastCycle = 0;
  let queue: TurnoverPeriod[] = [];
  let active: { period: TurnoverPeriod; day: string; sentAt: number; collision: boolean } | null = null;
  let blocked = false;
  let nativeRequests = 0;
  const listeners = new Map<any, { message: (event: any) => void; close: () => void }>();
  const previousSend = W.WebSocket.prototype.send;
  const now = () => Date.now();
  const copy = (): OfficialTurnoverView => JSON.parse(JSON.stringify(data));

  function setUnknown(status: string) {
    for (const p of ['today', 'week'] as const) {
      data[p].value = null; data[p].updatedAt = null; data[p].status = status;
    }
  }
  function newDay() {
    const current = taipeiDay(now());
    if (current === day) return;
    day = current;
    data = emptyTurnover('MT', data.today.scope);
    // A response without echoed dates cannot be safely assigned across midnight.
    if (active || nativeRequests) { blocked = true; queue = []; }
    else lastCycle = 0;
  }
  function consume(packet: any, source: any) {
    if (disposed || source !== socket || !isHistory(packet)) return;
    newDay();
    if (blocked) return;
    if (nativeRequests) { nativeRequests--; return; }
    if (!active) return; // Duplicates and unsolicited reports do not increment totals.
    const current = active;
    active = null;
    if (current.collision || current.day !== day) {
      queue = []; blocked = true; setUnknown('報表請求混合，等待重新連線'); return;
    }
    const code = typeof packet.action === 'object' ? packet.action.err ?? packet.err : packet.err;
    const value = code === 0 ? officialAmount(packet.msg?.total?.all?.v) : null;
    data[current.period] = {
      ...data[current.period], value, updatedAt: value === null ? null : now(),
      range: mtOfficialRange(current.period, current.sentAt).label,
      status: value === null ? (code === 0 ? '官方回覆缺少有效下注總計' : '官方報表未成功，待同步') : '官方已同步',
    };
    W.setTimeout(() => pump(), 300);
  }
  function attach(s: any) {
    try {
      const url = new URL(s.url);
      if (!/(^|\.)ofalive99\.net$/i.test(url.hostname) || !/^\/game\/ws\/?$/.test(url.pathname)) return;
    } catch { return; }
    if (socket !== s) {
      socket = s; blocked = false; nativeRequests = 0; active = null; queue = []; lastCycle = 0;
      data = emptyTurnover('MT', data.today.scope); day = taipeiDay();
    }
    if (listeners.has(s)) return;
    const message = (event: any) => {
      // Platform game messages are text. No async Blob conversion that could reorder ACKs.
      if (disposed || typeof event.data !== 'string' || event.data.length > 5_000_000) return;
      try { consume(JSON.parse(event.data), s); } catch { /* non-report frames */ }
    };
    const close = () => {
      if (s !== socket || disposed) return;
      active = null; queue = []; blocked = true; setUnknown('原生連線中斷，待同步');
    };
    listeners.set(s, { message, close });
    s.addEventListener('message', message); s.addEventListener('close', close);
    W.queueMicrotask(() => refresh());
  }
  function send(this: any, raw: any) {
    if (!disposed) {
      attach(this);
      if (this === socket && typeof raw === 'string') {
        try {
          const p = JSON.parse(raw);
          const action = typeof p.action === 'string' ? p.action : p.action?.name || '';
          if (/authenticate/i.test(action)) {
            blocked = !!active || nativeRequests > 0;
            active = null; queue = []; lastCycle = 0;
            setUnknown('登入工作階段更新，待同步');
          }
          if (!ownSending && isHistory(p)) {
            // Native reports share an action and have no request ID in their response.
            if (active) {
              active.collision = true; blocked = true; queue = [];
              setUnknown('官方報表請求重疊，等待重新連線');
            } else nativeRequests++;
          }
        } catch { /* No parsing changes to original send */ }
      }
    }
    return Reflect.apply(previousSend, this, [raw]);
  }
  W.WebSocket.prototype.send = send;

  function pump() {
    if (disposed || blocked || active || nativeRequests || !socket || socket.readyState !== 1 || !canRefresh()) return false;
    newDay();
    if (blocked || !queue.length) return false;
    const period = queue.shift()!;
    const at = now(), range = mtOfficialRange(period, at);
    active = { period, day, sentAt: at, collision: false };
    data[period].status = '同步官方報表中';
    ownSending = true;
    try {
      socket.send(JSON.stringify({
        method: 'GET',
        action: { game_id: 1, gametype_id: 3, name: HISTORY, path: '/api/v1/gametype/3/game/1/bet/history' },
        body: { begin_at: range.begin_at, end_at: range.end_at, cur: 1, room_id: 1, s: 8, table_id: 0 },
      }));
    } catch {
      active = null; queue = []; blocked = true; setUnknown('官方報表讀取失敗，等待重新連線');
    } finally { ownSending = false; }
    return true;
  }
  function refresh(force = false) {
    if (disposed) return false;
    newDay();
    if (active && now() - active.sentAt > 12_000) {
      active = null; queue = []; blocked = true;
      setUnknown('官方報表逾時，等待重新連線');
    }
    if (blocked || !socket || socket.readyState !== 1) return false;
    if (!active && !queue.length && !nativeRequests && (force || now() - lastCycle >= 60_000)) {
      lastCycle = now(); queue = ['today', 'week'];
    }
    return pump();
  }
  const timer = W.setInterval(() => refresh(), 1000);
  function dispose() {
    if (disposed) return;
    disposed = true; W.clearInterval(timer); active = null; queue = [];
    for (const [s, l] of listeners) { s.removeEventListener('message', l.message); s.removeEventListener('close', l.close); }
    listeners.clear();
    if (W.WebSocket.prototype.send === send) W.WebSocket.prototype.send = previousSend;
  }
  return { view: () => { newDay(); return copy(); }, refresh, dispose };
}
