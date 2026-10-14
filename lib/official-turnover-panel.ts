import type { OfficialTurnoverView } from './official-turnover-data';

export const OFFICIAL_TURNOVER_HTML = `<section class="official-turnover" aria-label="平台官方有效下注流水">
  <div class="turnover-values"><div><small>今日流水</small><strong id="official-today">待同步</strong></div><div><small>近7日流水</small><strong id="official-week">待同步</strong></div></div>
  <div class="turnover-footer"><span class="turnover-source" id="official-source">官方有效下注額 · 非本工具注額估算</span><button id="official-refresh" type="button" aria-label="更新平台官方有效流水">更新</button></div>
</section>`;
export const OFFICIAL_TURNOVER_REPORT_HTML = `<div class="report-official-turnover"><small>平台官方有效下注流水</small><div><span>今日 <strong id="report-official-today">待同步</strong></span><span>近7日 <strong id="report-official-week">待同步</strong></span></div><p id="report-official-source">與下方本工具下注紀錄分開統計</p></div>`;
export const OFFICIAL_TURNOVER_CSS = `
.official-turnover{flex:none;border:1px solid #637f8c38;border-radius:8px;background:#172b34;padding:7px 9px;margin:0;min-width:0;}
.turnover-values{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;}
.turnover-values small{display:block;font-size:9px;color:#aac1cb;margin-bottom:3px;}
.turnover-values strong{display:block;font-size:13px;line-height:17px;color:#d6ece4;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}
.turnover-values>div+div{border-left:1px solid #607f8738;padding-left:12px;}
.turnover-footer{display:flex;align-items:center;gap:5px}.turnover-footer .turnover-source{flex:1;min-width:0}#official-refresh{flex:none;min-width:32px;min-height:26px;font-size:9px;border:1px solid #8cabb344;border-radius:5px;padding:3px 5px;background:#263f44;color:#c9e4df}.turnover-source{display:block;font-size:8px;line-height:12px;color:#98adb8;margin-top:4px;}
#panel.compact:not(.mini) .official-turnover{padding:6px 8px;}
#panel.compact:not(.mini) .chart-wrap{height:66px;}
#panel.compact:not(.mini) .chart{height:25px;margin:3px 0;}
#panel.compact:not(.mini) #table-strip{height:34px;min-height:34px;}
#panel.compact:not(.mini) .table-chip{padding:3px 6px;}
#panel.compact:not(.mini) #overview-page{overflow-y:auto!important;overscroll-behavior:contain;}
#panel.compact:not(.mini) .official-turnover{padding:4px 8px;}
#panel.compact:not(.mini) .turnover-values small{font-size:8px;line-height:9px;margin-bottom:2px;}
#panel.compact:not(.mini) .turnover-values strong{font-size:12px;line-height:15px;}
#panel.compact:not(.mini) .turnover-source{font-size:8px;line-height:9px;margin-top:2px;}
#panel.compact:not(.mini) .chart-summary{padding:5px 8px!important;}
#panel.compact:not(.mini) .chart{height:18px!important;margin:2px 0!important;}
#panel.compact:not(.mini) .hero{height:131px;min-height:131px;}
#panel.compact.mini .official-turnover{padding:3px 5px;border-radius:5px;background:transparent;border-color:#70899630;}
#panel.compact.mini .turnover-values{gap:6px;}
#panel.compact.mini .turnover-values>div+div{padding-left:6px;}
#panel.compact.mini .turnover-values small{font-size:8px;display:inline;margin-right:4px;}
#panel.compact.mini .turnover-values strong{display:inline;font-size:10px;line-height:14px;}
#panel.compact.mini .turnover-source{display:none;}
#panel.compact.mini .hero{height:92px;}
#panel.compact.mini .statusline{max-height:14px;min-height:14px;font-size:9px;line-height:14px;}
#panel.compact.mini #overview-page{gap:3px;}
#panel.compact.mini .mini-context{height:13px;min-height:13px;font-size:9px;}
#panel.compact.mini .hero{height:67px;min-height:67px;max-height:67px;}
#panel.compact.mini .stats{height:25px;min-height:25px;padding:3px 5px;}
#panel.compact.mini .stats small{font-size:7px;line-height:8px;margin-bottom:1px;}
#panel.compact.mini .stats strong{font-size:10px;line-height:11px;}
#panel.compact.mini .official-turnover{padding:2px 5px;min-height:25px;}
#panel.compact.mini .turnover-values small{display:block;font-size:7px;line-height:8px;margin:0;}
#panel.compact.mini .turnover-values strong{display:block;font-size:10px;line-height:11px;}
.report-official-turnover{flex:none;background:#172b34;border:1px solid #637f8c38;border-radius:8px;padding:8px 10px;margin:6px 0;}
.report-official-turnover>small{font-size:10px;color:#adc4cd;}
.report-official-turnover>div{display:flex;gap:14px;margin-top:5px;flex-wrap:wrap;font-size:10px;}
.report-official-turnover strong{font-size:12px;color:#d6ece4;font-variant-numeric:tabular-nums;}
.report-official-turnover p{font-size:9px;line-height:14px;color:#9eb7c3;margin:5px 0 0;}
`;

export function renderOfficialTurnover(shadow: ShadowRoot, view?: OfficialTurnoverView) {
  const q = (id: string) => shadow.getElementById(id);
  for (const period of ['today', 'week'] as const) {
    const item = view?.[period];
    const known = item?.value !== null && item?.value !== undefined && Number.isFinite(item.value);
    const text = known ? item!.value!.toLocaleString('zh-TW', { maximumFractionDigits: 2 }) : '待同步';
    const title = item ? `${item.scope}｜${item.range}｜${item.status}${item.updatedAt ? `｜更新 ${new Date(item.updatedAt).toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })}` : ''}` : '待同步官方報表，不以本工具本金推算';
    for (const id of [`official-${period}`, `report-official-${period}`]) {
      const element = q(id);
      if (element) { element.textContent = text; element.title = title; }
    }
  }
  const source = q('official-source');
  const note = q('report-official-source');
  if (source) { const pending = view && (view.today.value === null || view.week.value === null); source.textContent = pending ? view.today.status === view.week.status ? view.today.status : `今日：${view.today.status}｜近7日：${view.week.status}` : '官方有效下注額 · 非本工具注額估算'; source.title = view ? `${view.today.scope}；${view.today.status}；${view.week.status}` : '等待官方來源'; }
  if (note) note.textContent = `${view?.today.scope ?? '官方報表'}；近7日依平台期間，與本工具下注紀錄分開統計。`;
}
