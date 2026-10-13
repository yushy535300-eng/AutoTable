// v2.7：完整模式改為336px寬、彈性高度；不把更多資料擠進小框。
export const DG_SPACIOUS_CSS = `
#panel:not(.mini), #panel.compact:not(.mini) {
  width: 336px;
  height: var(--full-height, 710px);
  padding: 18px;
  gap: 14px;
  border-radius: 18px;
  background: #141c22;
  border-color: #53697555;
  box-shadow: 0 22px 56px #0008, inset 0 1px 0 #ffffff08;
}
#panel:not(.mini) #head { height: 82px; }
#panel:not(.mini) .topline {
  width: 100%; height: 82px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 32px 38px;
  gap: 10px 6px;
  align-items: center;
}
#panel:not(.mini) .brand { grid-column: 1 / 5; grid-row: 1; font-size: 16px; line-height: 1.4; }
#panel:not(.mini) .dot { width: 6px; height: 6px; margin-right: 3px; }
#panel:not(.mini) .tools { display: contents; }
#panel:not(.mini) .tools #nav-mode, #panel:not(.mini) .tools #hide { display: none; }
#panel:not(.mini) .tools #zoom-in { grid-column: 5; grid-row: 1; }
#panel:not(.mini) .tools #zoom-out { grid-column: 6; grid-row: 1; }
#panel:not(.mini) .tools #nav-overview { grid-column: 1 / 3; grid-row: 2; }
#panel:not(.mini) .tools #nav-settings { grid-column: 3 / 5; grid-row: 2; }
#panel:not(.mini) .tools #nav-logs { grid-column: 5 / 7; grid-row: 2; }
#panel:not(.mini) .tools button { width: 100%; height: 32px; border-radius: 7px; border-color: #52687355; background: #202d35; }
#panel:not(.mini) .tools #nav-overview, #panel:not(.mini) .tools #nav-settings, #panel:not(.mini) .tools #nav-logs {
  height: 38px; font-size: 12px; font-weight: 500; display: flex;
  border: 0; border-bottom: 2px solid transparent; border-radius: 0;
  background: none; color: #b6c4cb; box-shadow: none;
}
#panel:not(.mini) .tools button.active { color: #b0e6d0 !important; border-bottom-color: #8bd1b2 !important; box-shadow: none; }
#panel:not(.mini) #overview-page {
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; overflow-x: hidden; padding-right: 1px;
  flex: 1; min-height: 0;
}
#panel:not(.mini) .parallel-control { height: 38px; gap: 10px; margin: 0; }
#panel:not(.mini) .parallel-control label { font-size: 11px; }
#panel:not(.mini) .parallel-control select { height: 38px; font-size: 12px; border-radius: 8px; }
#panel:not(.mini) .choose-tables { height: 38px; font-size: 11px; padding: 0 10px; }
#panel:not(.mini) .parallel-summary { display: none; }
#panel:not(.mini) .mini-context { height: 20px; font-size: 11px; color: #a6bac5; flex: none; }
#panel:not(.mini) .mini-context strong { font-size: 13px; color: #e3edf2; }
#panel:not(.mini) .hero {
  height: auto; min-height: 120px; flex: none; padding: 0;
  background: none; display: flex; gap: 10px;
}
#panel:not(.mini) .hero #target-box { height: auto; min-height: 90px; }
#panel:not(.mini) .roomline { height: 22px; font-size: 13px; gap: 9px; margin: 0; }
#panel:not(.mini) .roomline .subtle { font-size: 10px; }
#panel:not(.mini) .bet-main { height: 50px; margin: 7px 0; flex-direction: row; justify-content: space-between; gap: 10px; }
#panel:not(.mini) .bet-value { flex: 1; gap: 10px; }
#panel:not(.mini) .amount { font-size: 38px; line-height: 1; letter-spacing: -1px; }
#panel:not(.mini) .amount.long-number { font-size: 29px; }
#panel:not(.mini) .side { font-size: 10px; padding: 5px 7px; border-radius: 6px; }
#panel:not(.mini) .ring { height: 43px; width: 43px; }
#panel:not(.mini) .ring-inner { font-size: 14px; }
#panel:not(.mini) .meta { height: auto; min-height: 17px; font-size: 10px; line-height: 1.6; white-space: normal; }
#panel:not(.mini) .steps, #panel:not(.mini) .step-labels, #panel:not(.mini) .metrics { display: none; }
#panel:not(.mini) .statusline {
  height: auto; min-height: 17px; max-height: 34px;
  font-size: 11px; line-height: 17px; margin: 0;
  color: #adbec7; -webkit-line-clamp: 2;
}
#panel:not(.mini) .stats {
  height: 64px; padding: 12px 10px; flex: none;
  border-radius: 9px; background: #1c2a32; border-color: #607b8838;
}
#panel:not(.mini) .stats small { font-size: 10px; margin-bottom: 8px; font-weight: 400; color: #a4b7c3; }
#panel:not(.mini) .stats strong { font-size: 16px; font-weight: 600; }
#panel:not(.mini) .stats > div + div { padding-left: 12px; border-color: #637c8733; }
#panel:not(.mini) .chart-wrap { height: 94px; padding: 11px 10px 8px; margin: 0; flex: none; background: #18232b; border-radius: 9px; }
#panel:not(.mini) .chart-head { height: 13px; font-size: 10px; }
#panel:not(.mini) .chart-head strong { font-size: 11px; }
#panel:not(.mini) .chart { height: 43px; margin: 7px 0 4px; }
#panel:not(.mini) .chart-foot { height: 12px; font-size: 9px; margin: 0; color: #9cb3c0; }
#panel:not(.mini) .chart-empty { top: 42px; font-size: 10px; }
#panel:not(.mini) #table-strip { display: flex; height: 48px; min-height: 48px; gap: 7px; overflow-x: auto; flex: none; }
#panel:not(.mini) .table-chip { min-width: 112px; max-width: 138px; padding: 7px 9px; border-radius: 8px; background: #1c2a33; }
#panel:not(.mini) .table-chip strong { font-size: 11px; line-height: 15px; font-weight: 600; }
#panel:not(.mini) .table-chip small { font-size: 10px; line-height: 15px; font-weight: 400; }
#panel:not(.mini) > .compact-actions { height: 44px; min-height: 44px; margin: 0; padding: 0; display: flex; gap: 9px; flex: none; border-top: 1px solid #59717b33; }
#panel:not(.mini) > .compact-actions button { height: 44px; font-size: 12px; font-weight: 600; border-radius: 8px; }
#panel:not(.mini) > .compact-actions #open-report { flex: .75; background: #263841; border-color: #78909c55; }
#panel:not(.mini):has(#overview-page[hidden]) > .compact-actions { display: none; }
#panel.mini { gap: 4px; }
#panel.mini > .compact-actions { height: 30px; min-height: 30px; flex: none; margin: 0; padding: 0; }
#panel.mini #overview-page { overflow-y: auto; }
#panel:not(.mini) .page-title { font-size: 20px; margin: 4px 0 18px; font-weight: 650; }
#panel:not(.mini) .form-body label { font-size: 12px; margin: 18px 0 9px; }
#panel:not(.mini) .form-body select, #panel:not(.mini) .form-body input:not([type=checkbox]) { height: 42px; font-size: 13px; padding: 9px 11px; border-radius: 8px; }
#panel:not(.mini) .form-row { gap: 12px; }
#panel:not(.mini) .settings-added { font-size: 11px; line-height: 1.7; margin: 12px 0; }
#panel:not(.mini) .page-caption { font-size: 11px; line-height: 1.7; margin: 0 0 16px; }
#panel:not(.mini) #events { font-size: 11px; line-height: 1.9; }
#panel:not(.mini) .log-status { padding: 13px; margin: 0 0 16px; line-height: 1.8; }
#panel:not(.mini) #rooms { gap: 8px; }
#panel:not(.mini) #rooms .room { min-height: 38px; font-size: 12px; padding: 8px 12px; }
#panel:not(.mini) .rooms-back { height: 40px; margin-top: 18px; font-size: 12px; }
.risk-overlay, .report-shell { width: 336px; height: var(--full-height, 710px); }
.risk-overlay { padding: 20px; border-radius: 18px; }
.risk-card { padding: 22px 18px 18px; border-radius: 13px; }
.risk-triangle { width: 70px; height: 65px; margin-bottom: 16px; }
.risk-copy { font-size: 13px; line-height: 1.9; margin-bottom: 22px; }
.risk-ack { font-size: 12px; margin-bottom: 20px; }
.risk-actions button { height: 42px; font-size: 13px; }
.report-shell { padding: 18px; border-radius: 18px; }
.report-head h2 { font-size: 18px; }
.report-head button { font-size: 11px; padding: 8px 10px; }
.report-filter { gap: 8px; margin: 16px 0; }
.report-filter label, .report-filter select, .report-filter button { font-size: 10px; }
.report-card { padding: 12px; margin-bottom: 10px; border-radius: 8px; }
.report-card-head strong { font-size: 13px; }
.report-values { font-size: 12px; margin: 9px 0; }
.report-card-time { font-size: 10px; }
.report-footer { gap: 9px; padding-top: 9px; }

/* 柔和呼吸指示：只表示工具存在，不代表下注成功或連線正常。 */
.dot { position: relative; flex: none; animation: dg-dot-breathe 2600ms ease-in-out infinite; }
.dot::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1px solid #8dd8b480; animation: dg-dot-halo 2600ms ease-in-out infinite; pointer-events: none; }
@keyframes dg-dot-breathe { 0%,100% { opacity: .65; box-shadow: 0 0 3px #83d6b133; } 50% { opacity: 1; box-shadow: 0 0 10px #83d6b188; } }
@keyframes dg-dot-halo { 0%,100% { transform: scale(.75); opacity: .15; } 50% { transform: scale(1.2); opacity: .65; } }
.risk-overlay { overflow-y: auto; align-items: safe center; }
.risk-card { flex: none; max-width: 100%; }
#panel:not(.mini) .headline, #panel:not(.mini) .hero-head, #panel:not(.mini) .main-action, #panel:not(.mini) .section-head, #panel:not(.mini) #tables, #panel:not(.mini) .footer { display: none; }
@media (prefers-reduced-motion:reduce) { .dot,.dot::after { animation: none; opacity: 1; } }
`;
