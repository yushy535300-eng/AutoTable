import type { DgBet } from './dg-bet-ledger';
import type { OfficialTurnoverView } from './official-turnover-data';
import { renderOfficialTurnover } from './official-turnover-panel';
import { cumulativePoints, chartSummary, periodBets } from './dg-panel-data';
import { installDgButtonFeedback } from './dg-button-feedback';
import { installDgPanelResize } from './dg-panel-resize';
import { installDgProviderMenu } from './dg-provider-menu';
import { DG_PANEL_HTML } from './dg-panel-view';
import type { createMtDomClickRunner } from './mt-dom-click-runner';

type ProviderOption = { key: string; label: string };
type Period = 'today' | 'yesterday' | 'week';
type BetState = 'reserved' | 'submitted' | 'accepted' | 'settled' | 'rejected' | 'aborted' | 'uncertain';
type MtBet = {
  key: string;
  tableName: string;
  shoe: string;
  round: number;
  side: '莊' | '閒';
  amount: number;
  level: number;
  staking: 'flat' | 'martingale' | 'doubling';
  provider: string;
  state: BetState;
  createdAt: number;
  settledAt?: number;
  pnl?: number;
  reason?: string;
};
type Preview = {
  ok: boolean;
  reason?: string | null;
  tableName: string;
  shoe?: string;
  round?: number;
  side?: '莊' | '閒';
  confidence?: number;
  canBet?: boolean;
  count?: number | null;
  roundKey?: string;
  pattern?: { label?: string };
  candidateIds?: string[];
  gameSnById?: Record<string, string>;
  strategyReason?: string;
};
type PanelConfig = {
  rooms: 1 | 3 | 5 | 'all';
  base: number;
  maximum: number;
  provider: string;
  staking: 'flat' | 'martingale' | 'doubling';
  startMode: 'new' | 'resume';
  tableNames: string[];
  takeProfit: number | null;
  stopLoss: number | null;
};
type PanelView = {
  running: boolean;
  busy: boolean;
  message: string;
  config: PanelConfig;
  nextAmount: number;
  pnl: number;
  level: number;
  pending: number;
  bets: MtBet[];
  logs: Array<{ at: number; text: string }>;
  previews: Preview[];
  /** Added by the MT runner.  Optional keeps this panel compatible during upgrades. */
  selectedNames?: string[];
  sessionBets?: MtBet[];
  balance?: number | null;
};
type Draft = {
  rooms: string;
  base: string;
  maximum: string;
  provider: string;
  staking: 'flat' | 'martingale' | 'doubling';
  startMode: 'fresh' | 'resume';
  takeProfit: string;
  stopLoss: string;
};

const PROVIDERS: ProviderOption[] = [
  { key: 'combined', label: 'AI綜合' },
  { key: 'chatgpt', label: 'ChatGPT' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'grok', label: 'Grok' },
  { key: 'meta', label: 'Meta AI' },
  { key: 'road', label: '傳統牌路' },
  { key: 'counting', label: 'V38 四式算牌' },
  { key: 'parity', label: '奇偶策略' },
];

const PENDING_STATES = new Set<BetState>(['reserved', 'submitted', 'accepted', 'uncertain']);
const STATE_LABEL: Record<BetState, string> = {
  reserved: '準備中',
  submitted: '待接受',
  accepted: '待結算',
  settled: '已結算',
  rejected: '平台拒絕',
  aborted: '未送出',
  uncertain: '未確定，請核對',
};

function numberText(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('zh-TW', { maximumFractionDigits: 2 })
    : '—';
}

function signedNumber(value: number): string {
  return `${value > 0 ? '+' : ''}${numberText(value)}`;
}

function providerName(key: string): string {
  return PROVIDERS.find((option) => option.key === key)?.label ?? key;
}

function nameKey(value: string): string {
  return value.trim().toUpperCase();
}

function waitingReason(preview: Preview | undefined): string {
  const reason = preview?.reason || '';
  if (/clock.*(?:shoe|round|缺少)/i.test(reason)) return '等待即時靴號、局號與倒數';
  if (/clock.*(?:過時|時間異常)/i.test(reason)) return '即時資料更新中';
  if (/候選原生 ID/.test(reason)) return '同名桌資料尚未同步，暫不下注';
  if (/bead|完整牌路/.test(reason)) return '等待完整牌路同步';
  return reason || '等待資料';
}

function localTime(value: number): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value);
}

/**
 * MT uses the DG shell only as a view.  No DG runner, DOM selector, socket, or
 * ledger is reused here; all actions below call the supplied MT click runner.
 */
export function mountMtClickPanel(
  W: any,
  runner: ReturnType<typeof createMtDomClickRunner>,
  feed: { refresh: (force?: boolean) => boolean; status: () => string },
  onRemove: () => Promise<void>,
  official?: { view: () => OfficialTurnoverView; refresh?: (force?: boolean) => unknown; subscribe?: (callback: () => void) => (() => void) },
) {
  const existing = W.document.getElementById('__autobac_mt_click__');
  if (existing) existing.remove();

  const host = W.document.createElement('div');
  host.id = '__autobac_mt_click__';
  W.document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  // Keep the DG visual exactly: MT changes only the report's platform option.
  shadow.innerHTML = DG_PANEL_HTML.replace('<option value="DG">DG</option>', '<option value="MT">MT</option>');

  const cleanupFeedback = installDgButtonFeedback(shadow);
  const q = <T extends HTMLElement = HTMLElement>(id: string) => shadow.getElementById(id) as T;
  const panel = q('panel');
  const selectProvider = q<HTMLSelectElement>('provider');
  for (const option of PROVIDERS) {
    const element = W.document.createElement('option');
    element.value = option.key;
    element.textContent = option.label;
    selectProvider.append(element);
  }

  let disposed = false;
  let lastOfficialSettledCount = 0;
  let mini = false;
  let compact = true;
  let miniPreviousCompact = false;
  let userZoom = 1;
  let panelWidth = 280;
  let panelHeight = 560;
  let page: 'overview' | 'settings' | 'logs' | 'rooms' = 'overview';
  let reportPeriod: Period = 'today';
  let reportPage = 0;
  let riskTestOnce = false;
  let riskReturnFocus: HTMLElement | null = null;
  let lastError = '';
  let lastEvents = '';

  const getView = (): PanelView => runner.view() as unknown as PanelView;
  const initial = getView();
  let manualSelection = Boolean(initial.config.tableNames.length);
  let selectedNames = new Map<string, string>();
  for (const name of (initial.selectedNames?.length ? initial.selectedNames : initial.config.tableNames)) {
    if (name.trim()) selectedNames.set(nameKey(name), name);
  }
  const savedStaking = (runner.state() as { config?: { staking?: string } }).config?.staking;
  let singleStakingPreference: 'flat' | 'martingale' | 'doubling' = initial.config.rooms === 1
    ? initial.config.staking
    : savedStaking === 'doubling' ? 'doubling' : savedStaking === 'martingale' ? 'martingale' : 'flat';
  let draft: Draft = draftFor(initial.config);
  draft.staking = singleStakingPreference;

  const providerMenu = installDgProviderMenu(shadow, PROVIDERS);

  function draftFor(config: PanelConfig): Draft {
    return {
      rooms: String(config.rooms),
      base: String(config.base),
      maximum: String(config.maximum),
      provider: config.provider,
      staking: config.staking,
      startMode: config.startMode === 'resume' ? 'resume' : 'fresh',
      takeProfit: config.takeProfit === null ? '' : String(config.takeProfit),
      stopLoss: config.stopLoss === null ? '' : String(config.stopLoss),
    };
  }

  function inputValue(id: string): string {
    return (q<HTMLInputElement | HTMLSelectElement>(id).value ?? '').trim();
  }

  function writeDraft() {
    q<HTMLSelectElement>('parallel-count').value = draft.rooms;
    q<HTMLSelectElement>('count').value = draft.rooms;
    q<HTMLSelectElement>('single-staking').value = draft.rooms === '1' ? singleStakingPreference : 'flat';
    q<HTMLSelectElement>('start-mode').value = draft.startMode;
    selectProvider.value = draft.provider;
    q<HTMLInputElement>('base').value = draft.base;
    q<HTMLInputElement>('cap').value = draft.maximum;
    q<HTMLInputElement>('take-profit').value = draft.takeProfit;
    q<HTMLInputElement>('stop-loss').value = draft.stopLoss;
    providerMenu.sync();
  }

  function readDraft(preserveSingleStaking = false) {
    draft.rooms = inputValue('parallel-count');
    draft.base = inputValue('base');
    draft.maximum = inputValue('cap');
    draft.provider = inputValue('provider');
    if (draft.rooms === '1' && !preserveSingleStaking) singleStakingPreference = inputValue('single-staking') === 'doubling' ? 'doubling' : inputValue('single-staking') === 'martingale' ? 'martingale' : 'flat';
    draft.staking = singleStakingPreference;
    draft.startMode = inputValue('start-mode') === 'resume' ? 'resume' : 'fresh';
    draft.takeProfit = inputValue('take-profit');
    draft.stopLoss = inputValue('stop-loss');
  }

  function parseOptional(value: string, label: string): number | null {
    if (!value) return null;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) throw Error(`${label}請輸入正整數，或留空`);
    return parsed;
  }

  function draftConfig(): PanelConfig {
    const rooms = draft.rooms === 'all' ? 'all' : Number(draft.rooms);
    if (rooms !== 1 && rooms !== 3 && rooms !== 5 && rooms !== 'all') throw Error('同時下注桌數無效');
    const base = Number(draft.base);
    const maximum = Number(draft.maximum);
    if (!Number.isSafeInteger(base) || base <= 0) throw Error('基本單注必須是正整數');
    if (!Number.isSafeInteger(maximum) || maximum < base) throw Error('單筆上限必須是不小於基本單注的正整數');
    if (!PROVIDERS.some((option) => option.key === draft.provider)) throw Error('推薦來源無效');
    const names = manualSelection ? [...selectedNames.values()] : [];
    if (manualSelection && !names.length) throw Error('指定桌模式尚未選桌；先選桌或切回自動找桌');
    return {
      rooms,
      base,
      maximum,
      provider: draft.provider,
      staking: rooms === 1 ? singleStakingPreference : 'flat',
      startMode: draft.startMode === 'resume' ? 'resume' : 'new',
      tableNames: names,
      takeProfit: parseOptional(draft.takeProfit, '止盈'),
      stopLoss: parseOptional(draft.stopLoss, '止損'),
    };
  }

  function sameNames(left: string[], right: string[]) {
    const a = left.map(nameKey).sort();
    const b = right.map(nameKey).sort();
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function changedConfig(next: PanelConfig, current: PanelConfig): Partial<PanelConfig> {
    const changed: Partial<PanelConfig> = {};
    if (next.rooms !== current.rooms) changed.rooms = next.rooms;
    if (next.base !== current.base) changed.base = next.base;
    if (next.maximum !== current.maximum) changed.maximum = next.maximum;
    if (next.provider !== current.provider) changed.provider = next.provider;
    if (next.staking !== current.staking) changed.staking = next.staking;
    if (next.startMode !== current.startMode) changed.startMode = next.startMode;
    if (next.takeProfit !== current.takeProfit) changed.takeProfit = next.takeProfit;
    if (next.stopLoss !== current.stopLoss) changed.stopLoss = next.stopLoss;
    if (!sameNames(next.tableNames, current.tableNames)) changed.tableNames = next.tableNames;
    return changed;
  }

  /** Apply valid stopped-state edits immediately, then let the runner provide the real preview. */
  function syncDraftToRunner(showErrors = true): boolean {
    try {
      const next = draftConfig();
      const changes = changedConfig(next, getView().config);
      if (Object.keys(changes).length) runner.configure(changes);
      lastError = '';
      return true;
    } catch (error) {
      lastError = String((error as Error).message || error);
      if (showErrors) render();
      return false;
    }
  }

  function isLocked(view = getView()) {
    return view.running || view.busy || view.pending > 0;
  }

  function selectedPreviewNames(view: PanelView): string[] {
    if (manualSelection) return [...selectedNames.values()];
    const runnerSelected = (view.selectedNames ?? []).filter(Boolean);
    if (runnerSelected.length) return runnerSelected;
    const limit = draft.rooms === 'all' ? Number.MAX_SAFE_INTEGER : Number(draft.rooms);
    return view.previews.filter((preview) => preview.ok).slice(0, limit).map((preview) => preview.tableName);
  }

  function previewFor(view: PanelView, name: string | undefined): Preview | undefined {
    const key = name ? nameKey(name) : '';
    return view.previews.find((preview) => nameKey(preview.tableName) === key);
  }

  function sessionBets(view: PanelView): MtBet[] {
    if (Array.isArray(view.sessionBets)) return view.sessionBets.slice();
    const state = runner.state() as { sessionStart?: number };
    return view.bets.slice(Math.max(0, state.sessionStart ?? 0));
  }

  /** Exact minimal mapping required by the shared report/chart helpers. */
  function dataBets(bets: MtBet[]): DgBet[] {
    return bets.map((bet) => ({
      key: bet.key,
      tableId: bet.tableName,
      gameNo: `${bet.shoe}|${bet.round}`,
      side: bet.side,
      amount: bet.amount,
      level: bet.level,
      scope: 'table',
      staking: bet.staking,
      provider: bet.provider,
      state: bet.state,
      createdAt: bet.createdAt,
      settledAt: bet.settledAt,
      pnl: bet.pnl,
    }));
  }

  function showPage(next: 'overview' | 'settings' | 'logs' | 'rooms') {
    if (mini && next !== 'overview') setMini(false);
    page = next;
    providerMenu.close();
    for (const name of ['overview', 'settings', 'logs', 'rooms'] as const) q(`${name}-page`).hidden = name !== next;
    for (const name of ['overview', 'settings', 'logs'] as const) q(`nav-${name}`).classList.toggle('active', name === next);
    fitPanel();
  }

  function setMini(value: boolean) {
    if (value === mini) return;
    if (value) {
      miniPreviousCompact = compact;
      compact = true;
      page = 'overview';
    } else {
      compact = miniPreviousCompact;
    }
    mini = value;
    panel.classList.toggle('mini', mini);
    panel.classList.toggle('compact', compact);
    q('mini-label').textContent = mini ? '展開' : '迷你';
    q('zoom-out').setAttribute('aria-label', mini ? '展開完整面板' : '切換迷你面板');
    q('zoom-out').setAttribute('title', mini ? '展開完整面板' : '切換迷你面板');
    const path = q('zoom-out').querySelector('path');
    if (path) path.setAttribute('d', mini ? 'M5 9V5h4 M15 5h4v4 M19 15v4h-4 M9 19H5v-4' : 'M5 12h14');
    showPage('overview');
    render();
  }

  function setZoom(value: number) {
    userZoom = Math.max(0.7, Math.min(1.8, value));
    q<HTMLInputElement>('zoom').value = String(Math.round(userZoom * 100));
    fitPanel();
  }

  function fitPanel() {
    if (disposed) return;
    const top = Math.max(0, host.getBoundingClientRect().top);
    const overlay = !q('risk-dialog').hidden || !q('report-shell').hidden;
    const baseWidth = mini && !overlay ? 210 : panelWidth;
    const widthScale = Math.min(userZoom, Math.max(0.2, (W.innerWidth - 24) / baseWidth));
    const fullHeight = Math.min(panelHeight, Math.max(360, (W.innerHeight - top - 16) / Math.max(0.2, widthScale)));
    const height = mini && !overlay ? Math.max(228, panel.scrollHeight) : fullHeight;
    const scale = Math.max(0.2, Math.min(widthScale, (W.innerHeight - top - 12) / height));
    host.style.setProperty('--full-width', `${panelWidth}px`);
    host.style.setProperty('--full-height', `${fullHeight}px`);
    host.style.setProperty('--fit', String(scale));
    q('zoom-label').textContent = `${Math.round(scale * 100)}%`;
  }

  function reportData(view: PanelView) {
    // The runner ledger is this tool's record only; no platform statement is inferred.
    const source = view.bets;
    const mapped = dataBets(source);
    const byKey = new Map(source.map((bet) => [bet.key, bet]));
    return periodBets(mapped, reportPeriod).map((bet) => byKey.get(bet.key)).filter((bet): bet is MtBet => Boolean(bet));
  }

  function renderReport(view = getView()) {
    const all = reportData(view);
    const lobby = q<HTMLSelectElement>('report-lobby').value;
    const game = q<HTMLSelectElement>('report-game').value;
    const records = (lobby === 'all' || lobby === 'MT') && (game === 'all' || game === 'baccarat') ? all : [];
    const perPage = 6;
    const pages = Math.max(1, Math.ceil(records.length / perPage));
    reportPage = Math.max(0, Math.min(reportPage, pages - 1));
    const body = q('report-body');
    body.replaceChildren();
    for (const bet of records.slice().reverse().slice(reportPage * perPage, (reportPage + 1) * perPage)) {
      const row = W.document.createElement('article');
      row.className = 'report-card';
      const head = W.document.createElement('div');
      head.className = 'report-card-head';
      const title = W.document.createElement('strong');
      title.textContent = `${bet.tableName || '—'} · ${bet.side}`;
      const state = W.document.createElement('span');
      state.className = 'report-state';
      state.textContent = STATE_LABEL[bet.state];
      head.append(title, state);
      const values = W.document.createElement('div');
      values.className = 'report-values';
      const stake = W.document.createElement('span');
      stake.textContent = `下注 ${numberText(bet.amount)}`;
      const pnl = W.document.createElement('strong');
      pnl.textContent = typeof bet.pnl === 'number' && Number.isFinite(bet.pnl) ? `損益 ${signedNumber(bet.pnl)}` : '損益待定';
      if (typeof bet.pnl === 'number' && bet.pnl !== 0) pnl.className = bet.pnl > 0 ? 'green' : 'red';
      values.append(stake, pnl);
      const time = W.document.createElement('div');
      time.className = 'report-card-time';
      time.textContent = `下注 ${localTime(bet.createdAt)}${bet.reason ? ` · ${bet.reason}` : ''}`;
      row.append(head, values, time);
      body.append(row);
    }
    q('report-empty').hidden = records.length > 0;
    q('report-empty').textContent = '此期間尚無本工具下注記錄';
    q('report-note').textContent = '本工具記錄的下注與結果，不代表平台歷史';
    const settled = records.filter((bet) => bet.state === 'settled' && Number.isFinite(bet.pnl));
    const totalPnl = settled.reduce((sum, bet) => sum + (bet.pnl ?? 0), 0);
    q('report-total').textContent = `${records.length} 筆 · 下注 ${numberText(records.reduce((sum, bet) => sum + bet.amount, 0))} · 已結算損益 ${signedNumber(totalPnl)}`;
    q('report-page').textContent = `${reportPage + 1} / ${pages}`;
    for (const period of ['today', 'yesterday', 'week'] as const) q(`report-${period}`).classList.toggle('selected', reportPeriod === period);
  }

  function renderRooms(view: PanelView) {
    const rooms = q('rooms');
    rooms.replaceChildren();
    const locked = isLocked(view);
    const maximum = draft.rooms === 'all' ? Number.MAX_SAFE_INTEGER : Number(draft.rooms);
    const visible = new Map<string, string>();
    for (const preview of view.previews) {
      if (preview.tableName) visible.set(nameKey(preview.tableName), preview.tableName);
    }
    // Preserve a manually specified name even if it temporarily disappears from the live viewport.
    for (const [key, name] of selectedNames) if (!visible.has(key)) visible.set(key, name);
    for (const [key, name] of visible) {
      const selected = selectedNames.has(key);
      const button = W.document.createElement('button');
      button.className = `room${selected ? ' active' : ''}`;
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = locked;
      const title = W.document.createElement('span');
      title.className = 'room-title';
      const strong = W.document.createElement('strong');
      strong.textContent = name;
      const check = W.document.createElement('span');
      check.className = 'room-check';
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      title.append(strong, check);
      const detail = W.document.createElement('span');
      detail.className = 'room-detail';
      const preview = previewFor(view, name);
      detail.textContent = selected
        ? '已選擇 · 僅這些桌台可下注'
        : preview?.ok && preview.canBet
          ? '可下注時加入範圍'
          : '點選加入指定桌台';
      button.append(title, detail);
      button.onclick = () => {
        if (isLocked()) return;
        manualSelection = true;
        if (selectedNames.has(key)) {
          selectedNames.delete(key);
        } else if (selectedNames.size < maximum) {
          selectedNames.set(key, name);
        } else {
          lastError = `同時 ${draft.rooms} 桌已滿，先取消一桌再選其他桌`;
          render();
          return;
        }
        syncDraftToRunner();
        render();
      };
      rooms.append(button);
    }
    q('selection-mode').textContent = manualSelection ? '指定桌台 · 不自動補其他桌' : '自動找桌 · 開放下注就加入';
    q<HTMLButtonElement>('auto-tables').disabled = locked;
    q('auto-tables').classList.toggle('selected', !manualSelection);
    q('auto-tables').textContent = manualSelection ? '切回自動找桌' : '自動找桌中';
    q('rooms-hint').textContent = locked
      ? '待已送出下注完成結算後才能改選。'
      : manualSelection
        ? selectedNames.size ? `已選 ${selectedNames.size} 桌；取消全部仍是指定桌模式。` : '尚未選桌；開始會被拒絕，請選桌或切回自動找桌。'
        : '不選桌即自動找可下注桌。';
  }

  function renderTables(view: PanelView, displayedNames: string[], current: MtBet | undefined) {
    const tables = q('tables');
    const strip = q('table-strip');
    tables.replaceChildren();
    strip.replaceChildren();
    for (const name of displayedNames) {
      const preview = previewFor(view, name);
      const ownPending = view.bets.find((bet) => nameKey(bet.tableName) === nameKey(name) && PENDING_STATES.has(bet.state));
      const row = W.document.createElement('div');
      row.className = 'table-row';
      const badge = W.document.createElement('span');
      badge.className = 'table-badge';
      badge.textContent = ownPending?.side ?? preview?.side ?? '—';
      const info = W.document.createElement('div');
      info.className = 'table-info';
      const title = W.document.createElement('strong');
      title.textContent = name;
      const meta = W.document.createElement('small');
      meta.textContent = preview?.ok
        ? `靴 ${preview.shoe || '—'} · 局 ${preview.round ?? '—'} · ${preview.pattern?.label || '牌路已驗證'}`
        : waitingReason(preview);
      info.append(title, meta);
      const recommendation = W.document.createElement('div');
      recommendation.className = 'table-rec';
      recommendation.textContent = numberText(ownPending?.amount ?? view.nextAmount);
      const status = W.document.createElement('small');
      status.textContent = ownPending
        ? `${STATE_LABEL[ownPending.state]} · ${ownPending.side} ${numberText(ownPending.amount)}`
        : preview?.ok && preview.canBet
          ? `指標 ${preview.confidence ?? '—'} · ${preview.count ?? '—'}s`
          : waitingReason(preview);
      recommendation.append(status);
      row.append(badge, info, recommendation);
      tables.append(row);

      const chip = W.document.createElement('button');
      chip.className = `table-chip${current && nameKey(current.tableName) === nameKey(name) ? ' selected' : ''}`;
      const chipTitle = W.document.createElement('strong');
      chipTitle.textContent = `${name} · ${ownPending?.side ?? preview?.side ?? '—'} ${numberText(ownPending?.amount ?? view.nextAmount)}`;
      const chipStatus = W.document.createElement('small');
      chipStatus.textContent = ownPending ? STATE_LABEL[ownPending.state] : preview?.ok && preview.canBet ? '可下注' : waitingReason(preview);
      chip.append(chipTitle, chipStatus);
      chip.onclick = () => showPage('logs');
      strip.append(chip);
    }
    if (!displayedNames.length) {
      const empty = W.document.createElement('div');
      empty.className = 'empty';
      empty.textContent = manualSelection ? '等待指定桌台資料' : '自動找桌中 · 有可下注桌就加入';
      tables.append(empty);
    }
  }

  function renderEvents(view: PanelView) {
    const events = q('events');
    const feedStatus = (() => {
      try { return feed.status(); } catch { return ''; }
    })();
    const dataIssues = view.previews.filter(preview => !preview.ok || !preview.canBet).map(preview => `${preview.tableName}：${preview.reason || '等待開放下注'}`);
    const signature = `${view.message}\n${feedStatus}\n${dataIssues.join('\n')}\n${view.logs.map((entry) => `${entry.at}|${entry.text}`).join('\n')}`;
    if (signature === lastEvents) return;
    lastEvents = signature;
    events.replaceChildren();
    const append = (at: number | null, text: string) => {
      const article = W.document.createElement('article');
      article.className = 'event-card';
      if (/已接受|正式結算/.test(text)) article.classList.add('accepted');
      if (/拒絕|失敗|不足|逾時|未確定|停止/.test(text)) article.classList.add('warning');
      if (at !== null) {
        const time = W.document.createElement('time');
        time.textContent = new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(at);
        article.append(time);
      }
      const body = W.document.createElement('p');
      body.textContent = text;
      article.append(body);
      events.append(article);
    };
    append(null, view.message || '—');
    for (const p of view.previews) if (p.strategyReason) append(null, `${p.tableName}：${p.strategyReason}`);
    if (feedStatus) append(null, feedStatus);
    for (const issue of dataIssues) append(null, issue);
    for (const log of view.logs.slice().reverse()) append(log.at, log.text);
  }

  function render() {
    if (disposed) return;
    const view = getView();
    renderOfficialTurnover(shadow, official?.view());
    const config = view.config;
    const locked = isLocked(view);
    const current = view.bets.find((bet) => PENDING_STATES.has(bet.state));
    const names = selectedPreviewNames(view);
    const focus = current ? previewFor(view, current.tableName) : previewFor(view, names[0]) ?? view.previews.find((preview) => preview.ok && preview.canBet) ?? view.previews.find((preview) => preview.ok);
    const settled = sessionBets(view).filter((bet) => bet.state === 'settled' && Number.isFinite(bet.pnl));
    if(settled.length!==lastOfficialSettledCount){lastOfficialSettledCount=settled.length;window.setTimeout(()=>{if(!disposed)official?.refresh?.(true);},800);}
    const settledData = dataBets(settled);
    const chart = chartSummary(settledData);
    const roundPnl = settled.reduce((sum, bet) => sum + (bet.pnl ?? 0), 0);
    const wins = settled.filter((bet) => (bet.pnl ?? 0) > 0).length;
    const losses = settled.filter((bet) => (bet.pnl ?? 0) < 0).length;
    const ties = settled.length - wins - losses;
    const amount = current?.amount ?? (Number.isFinite(view.nextAmount) ? view.nextAmount : NaN);
    const shownStaking = current?.staking ?? (draft.rooms === '1' ? singleStakingPreference : 'flat');
    const shownLevel = current?.level ?? (!view.running && !view.pending && draft.startMode === 'fresh' ? 0 : view.level);
    const multiplier = shownStaking === 'doubling' ? 2 ** shownLevel : shownStaking === 'martingale' ? 2 ** (shownLevel + 1) - 1 : 1;

    q('brand-count').textContent = '百家工程師';
    q('balance').textContent = typeof view.balance === 'number' && Number.isFinite(view.balance) ? numberText(view.balance) : '待同步';
    q('mini-balance').textContent = q('balance').textContent;
    q('mini-running').textContent = `${view.running ? '執行中' : view.pending ? '待結算' : '已停止'} · ${manualSelection ? '指定桌' : '自動找桌'}`;
    q('run-pill').textContent = view.running ? '● 自動下注中' : view.pending ? '● 待結算' : '● 已停止';
    q('run-pill').classList.toggle('idle', !view.running);
    q('method').textContent = `${shownStaking === 'doubling' ? '單桌 · 倍投法' : shownStaking === 'martingale' ? '單桌 · 馬丁' : '平注 · 固定金額'}（${draft.rooms === 'all' ? '所有桌' : `${draft.rooms} 桌`}）`;
    q('current-strategy').textContent = providerName(current?.provider ?? draft.provider);
    providerMenu.sync();
    q('focus-table').textContent = current?.tableName ?? focus?.tableName ?? '尋找可下注桌';
    q('focus-phase').textContent = current ? STATE_LABEL[current.state] : focus?.ok && focus.canBet ? '可下注' : '準備中';
    q('amount-label').textContent = current ? (current.state === 'accepted' ? '已接受金額' : '已送出金額') : lastError ? '設定尚未套用' : '下一注預覽';
    q('amount-rule').textContent = `基本 ${numberText(current ? current.amount / multiplier : Number(draft.base))} · ${shownStaking !== 'flat' ? `第${shownLevel + 1}階 ×${multiplier}` : '平注 ×1'}`;
    q('amount').textContent = numberText(amount);
    q('amount').classList.toggle('long-number', q('amount').textContent.length > 7);
    const side = current?.side ?? focus?.side;
    q('side').textContent = side ? `${side} ${current ? '下注' : '推薦'}` : '—';
    q('side').classList.toggle('player', side === '閒');
    q('countdown').textContent = focus?.count == null ? '—' : String(focus.count);
    const seconds = typeof focus?.count === 'number' && Number.isFinite(focus.count) ? focus.count : null;
    q('ring').style.setProperty('--progress', `${seconds === null ? 0 : Math.max(0, Math.min(1, seconds / 20)) * 360}deg`);
    q('focus-meta').title = focus?.strategyReason || '';
    q('focus-meta').textContent = focus?.ok
      ? `靴 ${focus.shoe || '—'} · 局 ${focus.round ?? '—'} · ${focus.pattern?.label || '牌路已驗證'} · ${providerName(current?.provider ?? draft.provider)}`
      : waitingReason(focus);
    const step = current ? current.state === 'accepted' ? 3 : 2 : view.running ? 1 : 0;
    for (let index = 1; index <= 4; index += 1) q(`step-${index}`).classList.toggle('active', index <= step);
    const searching = view.running && !current;
    q('search-box').hidden = compact || !searching;
    q('target-box').hidden = !compact && searching;
    q('hero-status').textContent = lastError || view.message || '尚未送出下注';
    q('hero-pnl').textContent = signedNumber(roundPnl);
    q('round-pnl').textContent = signedNumber(roundPnl);
    for (const id of ['hero-pnl', 'round-pnl']) {
      q(id).classList.toggle('green', roundPnl > 0);
      q(id).classList.toggle('red', roundPnl < 0);
    }
    q('round-wlt').textContent = `${wins}/${losses}/${ties}`;
    q('hit-rate').textContent = wins + losses ? `${(wins / (wins + losses) * 100).toFixed(1)}%` : '—';
    const points = cumulativePoints(settledData);
    q('pnl-line').setAttribute('points', points);
    q('pnl-chart').classList.toggle('red', roundPnl < 0);
    const zero = 39 - (0 - chart.low) / (chart.high - chart.low || 1) * 35;
    const endpoint = points.split(' ').at(-1)?.split(',') ?? ['250', '22'];
    q('chart-zero').setAttribute('y1', String(zero));
    q('chart-zero').setAttribute('y2', String(zero));
    q('chart-dot').setAttribute('cx', endpoint[0]);
    q('chart-dot').setAttribute('cy', endpoint[1]);
    q('chart-area').setAttribute('points', chart.count ? `0,${zero} ${points} 250,${zero}` : '');
    q('chart-empty').hidden = chart.count > 0;
    q('chart-dot').style.opacity = chart.count ? '1' : '0';
    q('pnl-line').style.opacity = chart.count ? '1' : '.2';
    q('chart-last').textContent = chart.count ? signedNumber(roundPnl) : '尚無結算';
    q('chart-low').textContent = chart.count ? `最低 ${signedNumber(chart.low)}` : '最低 —';
    q('chart-high').textContent = chart.count ? `最高 ${signedNumber(chart.high)}` : '最高 —';
    q('chart-count').textContent = `${chart.count} 注`;
    q('pnl-range').hidden = true;
    q('cards-result').hidden = true;

    q<HTMLSelectElement>('parallel-count').value = draft.rooms;
    q<HTMLSelectElement>('count').value = draft.rooms;
    q<HTMLSelectElement>('single-staking').value = draft.rooms === '1' ? singleStakingPreference : 'flat';
    q<HTMLSelectElement>('start-mode').value = draft.startMode;
    q('parallel-count').toggleAttribute('disabled', locked);
    q('count').toggleAttribute('disabled', locked);
    q('choose-tables').toggleAttribute('disabled', locked);
    q('doubling-reminder').hidden=draft.rooms !== '1'||singleStakingPreference !== 'doubling';
    q('single-staking').toggleAttribute('disabled', locked || draft.rooms !== '1');
    // A stopped run with pending records may only move forward to resume; the runner enforces it too.
    q('start-mode').toggleAttribute('disabled', view.running || view.busy || (view.pending > 0 && draft.startMode === 'resume'));
    for (const id of ['provider-trigger', 'base', 'cap', 'stop-loss', 'take-profit']) q(id).toggleAttribute('disabled', locked);
    q('staking-hint').textContent = draft.rooms === '1'
      ? singleStakingPreference !== 'flat'
        ? `單桌${singleStakingPreference === 'doubling' ? '倍投1→2→4→8' : '馬丁1→3→7→15'}：輸升階、贏歸零。${draft.startMode === 'fresh' ? '新開始首筆為基本額。' : '續接沿用上次階級。'}`
        : '單桌平注：每筆固定基本額。'
      : '多桌固定平注，不可更改。';
    q('parallel-summary').textContent = `${manualSelection ? `已指定 ${selectedNames.size}` : '自動找'}桌 · 待接受 ${view.bets.filter((bet) => bet.state === 'submitted').length} · 待結算 ${view.bets.filter((bet) => bet.state === 'accepted').length}`;
    q('stop-now').classList.toggle('live', view.running);
    q('stop-now').textContent = view.running ? '■  停止自動下注' : '▶  開始自動下注';
    q('compact-stop').classList.toggle('live', view.running);
    q('compact-stop').textContent = view.running ? '■ 停止自動下注' : '▶ 開始自動下注';
    renderTables(view, names, current);
    renderRooms(view);
    q('status').textContent = `${view.running ? '執行中' : '已停止'}｜${lastError || view.message || '—'}`;
    renderEvents(view);
    if (!q('report-shell').hidden) renderReport(view);
    fitPanel();
  }

  function updateDraftFromField() {
    if (isLocked()) return;
    const previousRooms = draft.rooms;
    const nextRooms = inputValue('parallel-count');
    readDraft(previousRooms !== '1' && nextRooms === '1');
    const cap = draft.rooms === 'all' ? Number.MAX_SAFE_INTEGER : Number(draft.rooms);
    while (selectedNames.size > cap) selectedNames.delete(selectedNames.keys().next().value as string);
    writeDraft();
    syncDraftToRunner(false);
    render();
  }

  function selectRooms() {
    if (isLocked()) return;
    manualSelection = false;
    selectedNames.clear();
    syncDraftToRunner();
    render();
  }

  function requestStart(testOnce = false) {
    const current = getView();
    if (current.running || current.busy) {
      lastError = '上一個流程尚未停止，請稍候再開始';
      render();
      return;
    }
    readDraft();
    if (current.pending > 0 && draft.startMode !== 'resume') {
      lastError = '仍有待結算下注；請選擇續接上一輪配注階級後再開始';
      render();
      return;
    }
    if (!syncDraftToRunner(false)) {
      render();
      return;
    }
    riskTestOnce = testOnce;
    riskReturnFocus = shadow.activeElement as HTMLElement | null;
    q('risk-stake-summary').hidden = true;
    q('risk-stake-summary').textContent = '';
    q<HTMLInputElement>('ack').checked = false;
    q<HTMLButtonElement>('risk-confirm').disabled = true;
    q('risk-doubling-warning').hidden=draft.rooms !== '1'||singleStakingPreference !== 'doubling';
    q('risk-doubling-warning').textContent=`使用倍投法，請設定止盈與止損。${!draft.takeProfit||!draft.stopLoss?'目前止盈／止損尚未全部設定，請先至設定頁確認。':'請確認目前止盈與止損金額符合你的設定。'}`;
    q('risk-dialog').hidden = false;
    fitPanel();
    q<HTMLInputElement>('ack').focus();
  }

  function cancelRisk() {
    q('risk-dialog').hidden = true;
    fitPanel();
    riskReturnFocus?.focus();
  }

  function startApproved() {
    if (!q<HTMLInputElement>('ack').checked) return;
    q('risk-dialog').hidden = true;
    try {
      // The runner owns the complete MT flow; no panel-side confirmation loop is added.
      runner.start(true, riskTestOnce);
      showPage('overview');
    } catch (error) {
      lastError = String((error as Error).message || error);
    }
    render();
  }

  q('nav-overview').onclick = () => showPage('overview');
  q('nav-settings').onclick = () => showPage('settings');
  q('nav-logs').onclick = () => showPage('logs');
  q('nav-mode').onclick = () => {
    compact = !compact;
    panel.classList.toggle('compact', compact);
    showPage('overview');
    render();
  };
  q('zoom-out').onclick = () => setMini(!mini);
  q('zoom-in').onclick = () => {
    if (mini) setMini(false);
    else setZoom(userZoom + 0.1);
  };
  q('hide').onclick = () => setMini(true);
  q('hide').setAttribute('title', '切換迷你面板');
  q('hide').setAttribute('aria-label', '切換迷你面板');

  q('choose-tables').onclick = () => {
    renderRooms(getView());
    showPage('rooms');
  };
  q('edit-rooms').onclick = q('choose-tables').onclick;
  q('rooms-back').onclick = () => showPage('overview');
  q('auto-tables').onclick = selectRooms;
  q('hero-status').onclick = () => showPage('logs');
  q('hero-status').onkeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showPage('logs');
    }
  };

  q('parallel-count').onchange = () => updateDraftFromField();
  q('count').onchange = () => {
    q<HTMLSelectElement>('parallel-count').value = q<HTMLSelectElement>('count').value;
    updateDraftFromField();
  };
  q('single-staking').onchange = () => updateDraftFromField();
  q('base').oninput = () => updateDraftFromField();
  q('cap').oninput = () => updateDraftFromField();
  q('take-profit').oninput = () => updateDraftFromField();
  q('stop-loss').oninput = () => updateDraftFromField();
  q('provider').onchange = () => updateDraftFromField();
  q('provider').oninput = () => updateDraftFromField();
  q('start-mode').onchange = () => {
    const view = getView();
    readDraft();
    if (!view.running && !view.busy && view.pending > 0 && draft.startMode === 'resume') {
      try {
        runner.configure({ startMode: 'resume' });
        lastError = '';
      } catch (error) {
        lastError = String((error as Error).message || error);
        draft.startMode = view.config.startMode === 'resume' ? 'resume' : 'fresh';
      }
      render();
      return;
    }
    if (isLocked(view)) {
      draft.startMode = view.config.startMode === 'resume' ? 'resume' : 'fresh';
      writeDraft();
      render();
      return;
    }
    syncDraftToRunner(false);
    render();
  };

  q('stop-now').onclick = () => {
    if (getView().running) runner.stop();
    else requestStart();
  };
  q('compact-stop').onclick = () => q<HTMLButtonElement>('stop-now').click();
  q('start').onclick = () => requestStart(false);
  q('once').onclick = () => requestStart(true);
  q('stop').onclick = () => runner.stop();

  q<HTMLInputElement>('ack').onchange = () => {
    q<HTMLButtonElement>('risk-confirm').disabled = !q<HTMLInputElement>('ack').checked;
  };
  q('risk-cancel').onclick = cancelRisk;
  q('risk-confirm').onclick = startApproved;
  q('risk-dialog').onkeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelRisk();
      return;
    }
    if (event.key === 'Tab') {
      const confirm = q<HTMLButtonElement>('risk-confirm');
      const targets: HTMLElement[] = [q('ack'), q('risk-cancel')];
      if (!confirm.disabled) targets.push(confirm);
      const active = targets.indexOf(shadow.activeElement as HTMLElement);
      event.preventDefault();
      targets[(active + (event.shiftKey ? -1 : 1) + targets.length) % targets.length].focus();
    }
  };

  function openReport() {
    q('report-shell').hidden = false;
    renderReport();
    fitPanel();
  }
  q('official-refresh').onclick=()=>official?.refresh?.(true);
  q('open-records').onclick = openReport;
  q('open-report').onclick = openReport;
  q('close-report').onclick = () => {
    q('report-shell').hidden = true;
    showPage('overview');
  };
  for (const period of ['today', 'yesterday', 'week'] as const) {
    q(`report-${period}`).onclick = () => {
      reportPeriod = period;
      reportPage = 0;
      renderReport();
    };
  }
  q('report-bets').onclick = () => {
    reportPage = 0;
    renderReport();
  };
  q('report-transactions').onclick = () => renderReport();
  q('report-prev').onclick = () => {
    reportPage -= 1;
    renderReport();
  };
  q('report-next').onclick = () => {
    reportPage += 1;
    renderReport();
  };
  q('report-lobby').onchange = () => {
    reportPage = 0;
    renderReport();
  };
  q('report-game').onchange = () => {
    reportPage = 0;
    renderReport();
  };
  q('scan').onclick = () => {
    // The MT runner refreshes from its diagnostic loop.  Do not add a second panel scan protocol.
    render();
  };

  let drag: { x: number; y: number; left: number; top: number } | null = null;
  const head = q('head');
  head.onpointerdown = (event: PointerEvent) => {
    if ((event.target as Element).closest('button,input,select')) return;
    const box = host.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, left: box.left, top: box.top };
    head.setPointerCapture?.(event.pointerId);
  };
  head.onpointermove = (event: PointerEvent) => {
    if (!drag) return;
    const fit = Number(host.style.getPropertyValue('--fit')) || 1;
    const width = (mini ? 210 : panelWidth) * fit;
    const left = Math.max(0, Math.min(W.innerWidth - width, drag.left + event.clientX - drag.x));
    const top = Math.max(0, Math.min(W.innerHeight - 50, drag.top + event.clientY - drag.y));
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    host.style.right = 'auto';
    for (const id of ['panel', 'risk-dialog', 'report-shell']) {
      const node = q(id);
      node.style.transformOrigin = 'top left';
      if (id !== 'panel') {
        node.style.left = '0';
        node.style.right = 'auto';
      }
    }
  };
  head.onpointerup = head.onpointercancel = () => { drag = null; };

  const cleanupResize = installDgPanelResize([q('resize-panel'), q('resize-report')], {
    getSize: () => ({
      width: panelWidth,
      height: Math.min(panelHeight, Number(host.style.getPropertyValue('--full-height')) || panelHeight),
      scale: Number(host.style.getPropertyValue('--fit')) || 1,
    }),
    prepare: (target) => {
      const box = target.getBoundingClientRect();
      host.style.left = `${box.left}px`;
      host.style.top = `${box.top}px`;
      host.style.right = 'auto';
      for (const id of ['panel', 'risk-dialog', 'report-shell']) {
        const node = q(id);
        node.style.transformOrigin = 'top left';
        if (id !== 'panel') {
          node.style.left = '0';
          node.style.right = 'auto';
        }
      }
    },
    apply: (width, height) => {
      panelWidth = Math.round(width);
      panelHeight = Math.round(height);
      fitPanel();
    },
  });

  const walletChanged = () => { if (!disposed) render(); };
  W.addEventListener('autobac:mt-wallet-updated', walletChanged);
  const resize = () => fitPanel();
  W.addEventListener('resize', resize);
  const unsubscribeOfficial = official?.subscribe?.(() => { if (!disposed) render(); });
  runner.subscribe(() => {
    try { render(); } catch (error) {
      lastError = String((error as Error).message || error);
      if (!disposed) q('hero-status').textContent = lastError;
    }
  });

  function remove() {
    if (disposed) return;
    disposed = true;
    unsubscribeOfficial?.();
    cleanupFeedback();
    cleanupResize();
    providerMenu.cleanup();
    W.removeEventListener('resize', resize);
    W.removeEventListener('autobac:mt-wallet-updated', walletChanged);
    host.remove();
    // The console entry owns runner/feed disposal and calls this remove method from it.
    // Keep the callback in the public mount signature without re-entering that lifecycle.
    void onRemove;
  }

  writeDraft();
  panel.classList.toggle('compact', compact);
  showPage('overview');
  render();
  return { remove, render, host };
}
