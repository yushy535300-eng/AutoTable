/**
 * Read-only DG official turnover reader.
 *
 * DG's native SocketMan.sendData serializes a PublicBean itself (it calls
 * protoRoot.lookup("PublicBean").encode(...)), so this module deliberately
 * sends only the same plain object the native report view builds.  It does not
 * create a protobuf root, open the native report UI, navigate, or place bets.
 */
export type DgOfficialTurnoverValue = {
  value: number | null;
  status: string;
  updatedAt: number | null;
  range: string;
  scope: string;
};

/** Structurally compatible with OfficialTurnoverView in official-turnover-data. */
export type DgOfficialTurnoverView = {
  platform: "DG";
  today: DgOfficialTurnoverValue;
  week: DgOfficialTurnoverValue;
};

export type DgOfficialTurnover = {
  view(): DgOfficialTurnoverView;
  refresh(force?: boolean): void;
  dispose(): void;
};

export const DG_OFFICIAL_REFRESH_MS = 60_000;
export const DG_OFFICIAL_TIMEOUT_MS = 10_000;

type Period = "today" | "week";
type AnyRecord = Record<string, unknown>;
type SocketLike = {
  sendData?: (bean: unknown) => unknown;
  on?: (...args: unknown[]) => unknown;
  off?: (...args: unknown[]) => unknown;
  socket?: { connected?: unknown };
};
type PlayerInfo = { token?: unknown; socketMan?: SocketLike };
type OwnRequest = {
  id: number;
  period: Period;
  account: string;
  taipeiDay: string;
  sentAt: number;
  expired: boolean;
  cancelled: boolean;
};
type RequestBinding = {
  own: OwnRequest | null;
  type: number | null;
  span: string | null;
  unfilteredFirstPage: boolean;
};

type Runtime = { playerInfo: PlayerInfo; socket: SocketLike };

const EMPTY_STATUS = "待同步官方報表";
const SCOPE = "DG 官方有效額（dList[1]）";
const EVENT_RECEIVED_SUCCESS = "RECEIVED_SUCCESS";

function taipeiDay(now = Date.now()): string {
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function rangeFor(period: Period, day: string): string {
  return period === "today"
    ? `${day}（DG 官方今日，timeSpan=1）`
    : "DG 官方近7日（timeSpan=7；以平台定義為準）";
}

function emptyValue(period: Period, day: string, status = EMPTY_STATUS): DgOfficialTurnoverValue {
  return { value: null, status, updatedAt: null, range: rangeFor(period, day), scope: SCOPE };
}

function isObject(value: unknown): value is AnyRecord {
  return !!value && typeof value === "object";
}

function numberOrNull(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function zeroOrMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "" || value === 0 || value === "0";
}

function accountIdentity(account: unknown, objectIds: WeakMap<object, number>, nextObjectId: () => number): string {
  if (account === null || account === undefined) return "none";
  if (typeof account === "string" || typeof account === "number" || typeof account === "boolean") {
    return `${typeof account}:${String(account)}`;
  }
  if (!isObject(account)) return typeof account;
  // Do not derive identity from a token or serialize arbitrary account details.
  for (const key of ["id", "accountId", "account", "username", "userName", "uid", "playerId", "memberId"]) {
    const value = account[key];
    if (typeof value === "string" || typeof value === "number") return `${key}:${String(value)}`;
  }
  const object = account as object;
  let id = objectIds.get(object);
  if (id === undefined) {
    id = nextObjectId();
    objectIds.set(object, id);
  }
  return `object:${id}`;
}

function candidatePlayerInfo(value: unknown): PlayerInfo | null {
  if (!isObject(value)) return null;
  const direct = value as PlayerInfo;
  if (direct.socketMan && typeof direct.socketMan.sendData === "function") return direct;
  const playerInfo = value.playerInfo;
  if (isObject(playerInfo)) {
    const player = playerInfo as PlayerInfo;
    if (player.socketMan && typeof player.socketMan.sendData === "function") return player;
  }
  return null;
}

/** Locate live scene components only; lexical bundle state and protobuf globals are never invented. */
function findRuntime(W: unknown): Runtime | null {
  if (!isObject(W)) return null;
  const laya = isObject(W.Laya) ? W.Laya : null;
  const stage = laya && laya.stage;
  const roots: unknown[] = [];
  if (stage) roots.push(stage);
  // Useful for minimal hosts/tests, while real DG is found through Laya.stage above.
  roots.push(W);
  const seen = new Set<object>();
  let inspected = 0;
  while (roots.length && inspected++ < 2_000) {
    const node = roots.shift();
    if (!isObject(node)) continue;
    if (seen.has(node)) continue;
    seen.add(node);
    const playerInfo = candidatePlayerInfo(node);
    if (playerInfo?.socketMan && typeof playerInfo.socketMan.sendData === "function") {
      return { playerInfo, socket: playerInfo.socketMan };
    }
    const count = numberOrNull(node.numChildren);
    if (count !== null && count >= 0 && typeof node.getChildAt === "function") {
      for (let i = 0; i < Math.min(count, 500); i++) {
        try { roots.push((node.getChildAt as (index: number) => unknown)(i)); } catch { /* detached child */ }
      }
    }
    const children = node._children;
    if (Array.isArray(children)) roots.push(...children.slice(0, 500));
  }
  return null;
}

function readRequestBinding(bean: unknown, ownRequests: WeakMap<object, OwnRequest>): RequestBinding | null {
  if (!isObject(bean) || Number(bean.cmd) !== 13) return null;
  const list = Array.isArray(bean.list) ? bean.list : [];
  const type = Number.isFinite(Number(bean.type)) ? Number(bean.type) : null;
  const span = typeof bean.object === "string" || typeof bean.object === "number" ? String(bean.object) : null;
  const unfilteredFirstPage = type === 1 && (span === "1" || span === "7") &&
    list.length === 4 && list[0] === "" && list[1] === "" &&
    String(list[2]) === "12" && String(list[3]) === "1" &&
    zeroOrMissing(bean.lobbyId) && zeroOrMissing(bean.tableId);
  return { own: ownRequests.get(bean as object) ?? null, type, span, unfilteredFirstPage };
}

function parseReportObject(raw: unknown): AnyRecord | null {
  if (typeof raw === "string") {
    if (!raw.trim()) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isObject(parsed) ? parsed : null;
    } catch { return null; }
  }
  return isObject(raw) ? raw : null;
}

/** DG's native total view does Number(dList[1]).toFixed(2); retain zero but reject absent/blank/non-finite data. */
function officialValidAmount(raw: unknown): number | null {
  if (typeof raw !== "number" && typeof raw !== "string") return null;
  if (typeof raw === "string" && !raw.trim()) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER / 100 ? value : null;
}

function responseLooksLikeUnfilteredBetReport(bean: AnyRecord, binding: RequestBinding): boolean {
  if (Number(bean.cmd) !== 13 || Number(bean.type) !== 1 || binding.type !== 1 || !binding.unfilteredFirstPage) return false;
  if (!zeroOrMissing(bean.lobbyId) || !zeroOrMissing(bean.tableId)) return false;
  if (Array.isArray(bean.list)) {
    const list = bean.list;
    if (list.length !== 4 || list[0] !== "" || list[1] !== "" || String(list[2]) !== "12" || String(list[3]) !== "1") return false;
  }
  return true;
}

function parseOfficialReply(bean: AnyRecord): number | null {
  if (bean.codeId === null || bean.codeId === undefined || bean.codeId === '' || Number(bean.codeId) !== 0) return null;
  const report = parseReportObject(bean.object);
  if (!report || !Array.isArray(report.records)) return null;
  for (const key of ["pageNow", "pageCount", "pageSize", "rowCount"]) {
    const value = Number(report[key]);
    if (!Number.isFinite(value) || value < 0) return null;
  }
  if (!Array.isArray(bean.dList) || bean.dList.length !== 3) return null;
  return officialValidAmount(bean.dList[1]);
}

export function createDgOfficialTurnover(
  W: unknown,
  getAccount: () => unknown,
  canRefresh: () => boolean = () => true,
): DgOfficialTurnover {
  let disposed = false;
  let objectId = 0;
  const objectIds = new WeakMap<object, number>();
  const ownRequests = new WeakMap<object, OwnRequest>();
  let requestId = 0;
  let currentDay = taipeiDay();
  let currentAccount = safeAccountIdentity();
  let today = emptyValue("today", currentDay);
  let week = emptyValue("week", currentDay);
  let socket: SocketLike | null = null;
  let originalSend: ((bean: unknown) => unknown) | null = null;
  let sendObserver: ((bean: unknown) => unknown) | null = null;
  let listenerAttached = false;
  let listenerMode: "laya" | "emitter" | null = null;
  const listenerOwner = {};
  const bindings: RequestBinding[] = [];
  let pending: OwnRequest | null = null;
  let remaining: Period[] = [];
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCycleAt = 0;
  let reconciliationRequired = false;

  const interval = setInterval(() => refresh(false), DG_OFFICIAL_REFRESH_MS);

  function safeAccountIdentity(): string {
    let account: unknown = null;
    try { account = getAccount(); } catch { return "unavailable"; }
    return accountIdentity(account, objectIds, () => ++objectId);
  }

  function update(period: Period, patch: Partial<DgOfficialTurnoverValue>): void {
    const previous = period === "today" ? today : week;
    const next = { ...previous, ...patch, range: rangeFor(period, currentDay), scope: SCOPE };
    if (period === "today") today = next; else week = next;
  }

  function clearTimeoutForPending(): void {
    if (timeout !== null) clearTimeout(timeout);
    timeout = null;
  }

  function markCurrentCancelled(): void {
    if (!pending) return;
    pending.cancelled = true;
    pending = null;
    clearTimeoutForPending();
  }

  function resetValues(status = EMPTY_STATUS): void {
    markCurrentCancelled();
    remaining = [];
    today = emptyValue("today", currentDay, status);
    week = emptyValue("week", currentDay, status);
  }

  function ensureFreshIdentity(): void {
    const day = taipeiDay();
    const account = safeAccountIdentity();
    if (day === currentDay && account === currentAccount) return;
    currentDay = day;
    currentAccount = account;
    // Existing request bindings are deliberately retained to absorb late replies,
    // but their values can no longer be shown for a new account/day.
    resetValues();
    reconciliationRequired = false;
  }

  function detachSocket(): void {
    if (!socket) return;
    if (listenerAttached && typeof socket.off === "function") {
      try {
        if (listenerMode === "emitter") socket.off(EVENT_RECEIVED_SUCCESS, receivedHandler);
        else socket.off(EVENT_RECEIVED_SUCCESS, listenerOwner, receivedHandler);
      } catch { /* a scene may already have destroyed its dispatcher */ }
    }
    if (sendObserver && socket.sendData === sendObserver && originalSend) socket.sendData = originalSend;
    listenerAttached = false;
    listenerMode = null;
    originalSend = null;
    sendObserver = null;
    socket = null;
  }

  function attach(runtime: Runtime): boolean {
    if (socket === runtime.socket && sendObserver && listenerAttached) return true;
    detachSocket();
    if (typeof runtime.socket.sendData !== "function" || typeof runtime.socket.on !== "function" || typeof runtime.socket.off !== "function") return false;
    socket = runtime.socket;
    const previousSend = runtime.socket.sendData;
    originalSend = previousSend;
    sendObserver = function observedSend(this: unknown, bean: unknown): unknown {
      if (!disposed && socket === runtime.socket) observeOutgoing(bean);
      // Keep this local reference: another observer may wrap us and continue to
      // call this function after our dispose() has cleared module state.
      return previousSend.call(this, bean);
    };
    runtime.socket.sendData = sendObserver;
    try {
      // Native DG SocketMan is a Laya EventDispatcher: on(type, caller, listener).
      runtime.socket.on(EVENT_RECEIVED_SUCCESS, listenerOwner, receivedHandler);
      listenerMode = "laya";
      listenerAttached = true;
    } catch {
      try {
        runtime.socket.on(EVENT_RECEIVED_SUCCESS, receivedHandler);
        listenerMode = "emitter";
        listenerAttached = true;
      } catch {
        if (runtime.socket.sendData === sendObserver) runtime.socket.sendData = originalSend;
        socket = null;
        originalSend = null;
        sendObserver = null;
        return false;
      }
    }
    return true;
  }

  function observeOutgoing(bean: unknown): void {
    const binding = readRequestBinding(bean, ownRequests);
    if (!binding) return;
    bindings.push(binding);
    if (!binding.own && pending) {
      resetValues("官方報表請求重疊，待同步");
      reconciliationRequired = true;
      return;
    }
    // An ever-growing uncorrelated cmd=13 sequence cannot safely be guessed.
    if (bindings.length > 64) failClosed("官方報表請求無法對應，待手動同步");
  }

  function finishPeriod(request: OwnRequest, value: number | null, status: string): void {
    if (pending?.id !== request.id) return;
    clearTimeoutForPending();
    pending = null;
    if (!request.cancelled && request.account === currentAccount && request.taipeiDay === currentDay) {
      update(request.period, { value, status, updatedAt: value === null ? null : Date.now() });
    }
    sendNext();
  }

  function failClosed(status: string): void {
    clearTimeoutForPending();
    if (pending && !pending.cancelled && pending.account === currentAccount && pending.taipeiDay === currentDay) {
      update(pending.period, { value: null, status, updatedAt: null });
    }
    if (pending) pending.expired = true;
    pending = null;
    remaining = [];
    reconciliationRequired = true;
  }

  function receivedHandler(bean: unknown): void {
    if (disposed || !isObject(bean) || Number(bean.cmd) !== 13) return;
    const binding = bindings.shift();
    if (!binding) {
      // A cmd=13 reply that was not observed on send could be a late report from
      // before installation; never attach it to our currently visible period.
      if (pending) failClosed("官方報表回覆無法對應，待手動同步");
      return;
    }
    if (!binding.own) return; // Native/manual report; it is not our statistic.
    const request = binding.own;
    if (request.expired || request.cancelled || pending?.id !== request.id) {
      // This is a known late/cancelled reply. It proves its own binding but is never displayed.
      if (!pending) reconciliationRequired = false;
      return;
    }
    if (!responseLooksLikeUnfilteredBetReport(bean, binding)) {
      failClosed("官方報表回覆不符，待手動同步");
      return;
    }
    const amount = parseOfficialReply(bean);
    finishPeriod(request, amount, amount === null ? "官方報表回覆無效" : "已同步官方報表");
  }

  function requestPeriod(period: Period): void {
    ensureFreshIdentity();
    if (disposed) return;
    const runtime = findRuntime(W);
    if (!runtime || !attach(runtime)) {
      update(period, { value: null, status: "待DG官方報表就緒", updatedAt: null });
      remaining = [];
      return;
    }
    let suppliedAccount: unknown;
    try { suppliedAccount = getAccount(); } catch { suppliedAccount = null; }
    if (isObject(suppliedAccount) && suppliedAccount !== runtime.playerInfo) {
      resetValues("DG工作階段已變更，待重新安裝核對");
      reconciliationRequired = true;
      return;
    }
    if (runtime.socket.socket?.connected === false) {
      update(period, { value: null, status: "待DG官方報表連線", updatedAt: null });
      remaining = [];
      return;
    }
    if (runtime.playerInfo.token === undefined || runtime.playerInfo.token === null || runtime.playerInfo.token === "") {
      update(period, { value: null, status: "待DG官方帳號就緒", updatedAt: null });
      remaining = [];
      return;
    }
    const request: OwnRequest = {
      id: ++requestId, period, account: currentAccount, taipeiDay: currentDay,
      sentAt: Date.now(), expired: false, cancelled: false,
    };
    const bean = { cmd: 13, type: 1, token: runtime.playerInfo.token, object: period === "today" ? "1" : "7", list: ["", "", "12", "1"] };
    ownRequests.set(bean, request);
    pending = request;
    update(period, { status: "讀取DG官方報表中" });
    try {
      runtime.socket.sendData!(bean);
    } catch {
      if (pending?.id === request.id) finishPeriod(request, null, "DG官方報表請求失敗");
      return;
    }
    if (!bindings.some(binding => binding.own?.id === request.id)) {
      // A third-party wrapper replaced ours while dispatching. The packet may have
      // been sent, but it cannot be proven on receipt.
      failClosed("DG官方報表請求無法驗證，待手動同步");
      return;
    }
    timeout = setTimeout(() => {
      if (disposed || pending?.id !== request.id) return;
      request.expired = true;
      failClosed("DG官方報表逾時，待手動同步");
    }, DG_OFFICIAL_TIMEOUT_MS);
  }

  function sendNext(): void {
    if (disposed || pending || reconciliationRequired) return;
    const period = remaining.shift();
    if (period) requestPeriod(period);
  }

  function refresh(force = false): void {
    if (disposed) return;
    ensureFreshIdentity();
    // A wager's short critical section is not loss of the official data source.
    if (!canRefresh()) return;
    if (pending) return;
    // Do not issue a second report when an old response could still be in flight.
    if (reconciliationRequired || bindings.length) return;
    const now = Date.now();
    if (!force && now - lastCycleAt < DG_OFFICIAL_REFRESH_MS) return;
    lastCycleAt = now;
    remaining = ["today", "week"];
    sendNext();
  }

  function view(): DgOfficialTurnoverView {
    ensureFreshIdentity();
    return { platform: "DG", today: { ...today }, week: { ...week } };
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    clearInterval(interval);
    clearTimeoutForPending();
    markCurrentCancelled();
    remaining = [];
    detachSocket();
  }

  return { view, refresh, dispose };
}
