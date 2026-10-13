// 視覺與互動狀態覆蓋，不改動下注、帳本或桌台選擇。
export const DG_PRO_CSS = `
:host {
  --pro-bg: #11171c;
  --pro-surface: #1b242b;
  --pro-line: #34434c;
  --pro-text: #ecf3f5;
  --pro-muted: #a5b6bf;
  --pro-accent: #8ed8bf;
  -webkit-font-smoothing: antialiased;
}
#panel, #panel.compact, #panel.compact.mini {
  background: linear-gradient(150deg, #1a242b 0%, #121a20 65%, #10171c);
  border-color: #6e89994d;
  box-shadow: 0 14px 36px #0009, inset 0 1px 0 #ffffff0b;
}
.brand, .compact .brand {
  color: #f2eee1;
  letter-spacing: .2px;
  font-weight: 750;
}
.dot { background: #8ed8bf; box-shadow: 0 0 0 3px #8ed8bf12; }
.tools button, .compact .tools button {
  background: #233039;
  border-color: #4c636f99;
  color: #dbe8ee;
  box-shadow: inset 0 1px 0 #ffffff0b;
}
.tools button.active, .compact .tools button.active {
  background: #304940;
  border-color: #8ed8bfbb;
  color: #c9f3e7;
  box-shadow: inset 0 -2px 0 #8ed8bf66;
}
.compact .tools #hide, .compact.mini .tools #zoom-out {
  background: #26343e;
  border-color: #7695a5aa;
  color: #e1edf3;
}
.parallel-control label, .compact .parallel-control label { color: #d6e2e7; }
.parallel-control select, .form-body select, .form-body input:not([type=checkbox]) {
  background: #1c2932;
  border-color: #4d64706b;
  color: #f2f6f8;
  border-radius: 6px;
  box-shadow: inset 0 1px 3px #0002;
}
.parallel-control select:focus, .form-body select:focus, .form-body input:focus {
  border-color: #8ed8bf;
  box-shadow: 0 0 0 2px #8ed8bf22;
}
.choose-tables { background: #283a43; border-color: #5b7b8b99; color: #d4e9f3; }
.compact .parallel-summary { color: #a5b8c3; }
.compact .mini-context, .compact .meta, .compact .subtle { color: #b5c5ce; }
.compact #mini-running { color: #b9dacd; }
.compact .amount { color: #f4f8f9; text-shadow: none; }
.side { color: #f8b6a8; background: #7d484047; border: 1px solid #b47c6c33; }
.side.player { color: #b0d9ff; background: #3b5f8b44; border-color: #729ac633; }
.ring-inner { background: #18242b; color: #e1eee8; }
.compact .roomline { color: #f0f6f8; }
.compact .statusline { color: #b5c6d0; }
.compact .stats {
  background: linear-gradient(120deg, #24323a, #1d2a31);
  border-color: #607c8b40;
  border-radius: 7px;
}
.compact .stats small { color: #b8cad4; }
.compact .stats > div + div { padding-left: 5px; border-left: 1px solid #7a929d26; }
.compact .chart-wrap { background: #151f26; border-color: #60778335; }
.compact .chart-head, .compact .chart-foot { color: #b7c8d2; }
.compact .chart-head strong { color: #b7e5d2; }
.green { color: #a0e6c9 !important; }
.red { color: #f5b0a6 !important; }
.table-chip { background: #1e2b34; border-color: #607a873f; border-radius: 6px; }
.table-chip.selected { background: #2b4139; border-color: #8cc7b399; }
.compact .table-chip strong { color: #e7f2ee; }
.compact .table-chip small { color: #b9ccd6; }
.compact .compact-actions button {
  background: #293b46;
  border-color: #7594a477;
  color: #e3eff5;
  font-weight: 650;
  border-radius: 7px;
}
.compact .compact-actions #compact-stop {
  background: linear-gradient(120deg, #367d65, #29644f);
  border-color: #85d1b69c;
  color: #f0fff7;
}
.compact .compact-actions #compact-stop.live {
  background: linear-gradient(120deg, #894b44, #6e3e38);
  border-color: #d59b8ea0;
  color: #fff1ea;
}
.page-title, .report-head h2 { color: #edf4f6; letter-spacing: .2px; }
.form-body label { color: #dce7ed; }
.settings-added, .page-caption { color: #b6c7cf !important; }
.room { background: #24343d; color: #d1e2ea; border-color: #64829180; }
.room.active { background: #304b40; color: #d3f3e2; border-color: #8bc9aa; }
.rooms-back { background: #315d4e; color: #e1f5e8; border: 1px solid #7aad8d; }
.log-status { background: #1d3139; border-color: #6e9dac50; color: #cee4ec !important; }
#events { color: #c2d3dc; }
.report-shell { background: #131e25; border-color: #718d9b80; }
.report-head { border-color: #536e7c55; }
.report-card { background: #22343d; border-color: #64849455; }
.report-card-head strong { color: #e8f3f4; }
.report-state, .report-note, .report-card-time { color: #bfd1da; }
.report-head button, .report-footer button { background: #2d4350; border-color: #86a5b488; color: #e1eff6; }
.report-filter select, .report-filter button { background: #21343e; border-color: #68879677; color: #d9eaf2; }
.report-filter button.selected, .report-tabs button.selected { color: #b4ebd3; border-color: #8ed8bf; }
.report-tabs { border-color: #6a849344; }
.risk-overlay { background: #0a141de6; }
.risk-card { background: linear-gradient(155deg, #263039, #16212a); border-color: #bfa76fbb; }
.risk-copy { color: #e4edf2; }
.risk-ack { color: #d6e6ef; }
.risk-actions button { background: #2c3f4b; border-color: #809dad88; color: #e8f1f6; }
.risk-actions #risk-confirm { background: #3b775f; border-color: #93d3b7; color: #f1fff6; }
.risk-actions #risk-confirm:disabled { background: #2b383d; opacity: .45; }
/* 所有按鈕：觸控按壓、滑鼠懸停、鍵盤焦點及點擊後高亮。 */
button, [role=button] {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 100ms ease, filter 120ms ease, box-shadow 120ms ease,
    background-color 120ms ease, border-color 120ms ease;
}
button:not(:disabled):active, button[data-pressed=true]:not(:disabled),
[role=button]:active, [role=button][data-pressed=true] {
  transform: translateY(1px) scale(.97);
  filter: brightness(1.24);
  box-shadow: inset 0 0 0 2px #c2efdf88, inset 0 2px 5px #0004 !important;
}
@media (hover:hover) {
  button:not(:disabled):hover, [role=button]:hover {
    filter: brightness(1.16);
    box-shadow: 0 0 0 1px #a3cbbf66;
  }
}
button:focus-visible, [role=button]:focus-visible {
  outline: 2px solid #a8e4ce;
  outline-offset: 2px;
}
button:disabled { filter: saturate(.45); cursor: not-allowed; }
@media (prefers-reduced-motion:reduce) {
  button, [role=button] { transition: none; }
  button:active, button[data-pressed=true], [role=button]:active { transform: none; }
}
`;
