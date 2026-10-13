// 全介面設計層，欄位ID及下注執行器不變。
export const DG_SURFACES_CSS = `
:host { --ui-border: #47617140; --ui-card: #1b2932; --ui-label: #a9bdc9; --ui-accent: #a0dcc4; }
#panel, .report-shell { font-variant-numeric: tabular-nums; }
.surface-heading { display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 9px; }
#panel:not(.mini) .surface-heading .page-title {margin:0;font-size:21px;line-height:1.4;}
.surface-kicker { font-size:9px;color:#84b19f;letter-spacing:1.1px;margin:0 0 5px; }
.surface-note {font-size:11px;color:var(--ui-label);line-height:1.8;margin:0 0 18px;}
.surface-icon {display:grid;place-items:center;width:36px;height:36px;border:1px solid #82ab9840;background:#243b34;border-radius:10px;color:#b7e6d2;flex:none;}
.surface-icon svg {width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
#panel:not(.mini) .form-section {border:1px solid var(--ui-border);border-radius:11px;background:#1a272f;padding:14px;margin-bottom:14px;}
.form-section-head {font-size:11px;font-weight:600;color:#d3e1e8;display:flex;align-items:center;gap:8px;margin:0 0 11px;}
.form-section-head i {font-style:normal;font-size:9px;color:#a4d6c0;border:1px solid #7baa9538;border-radius:5px;padding:3px 5px;background:#263c33;}
#panel:not(.mini) .form-section label {font-size:11px;margin:12px 0 7px;color:#b4c8d2;}
#panel:not(.mini) .form-section select,#panel:not(.mini) .form-section input:not([type=checkbox]) {height:39px;background:#111e26;border-color:#536e7e55;font-size:12px;border-radius:7px;}
#panel:not(.mini) .form-section .settings-added {font-size:10px;color:#94b0bf!important;margin:10px 0 0;line-height:1.7;}
.form-section .form-row {gap:10px;}
.form-section .field-note {font-size:10px;color:#91a9b7;line-height:1.7;margin:11px 0 0;}
#panel:not(.mini) #rooms-page {display:flex;flex-direction:column;overflow:hidden;}
#panel:not(.mini) #rooms {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;overflow-y:auto;min-height:0;align-content:start;flex:1;}
#panel:not(.mini) #rooms .room {min-height:77px;padding:12px;display:flex;flex-direction:column;gap:9px;align-items:stretch;text-align:left;background:#1b2932;border:1px solid #4e6c7b55;border-radius:10px;}
.room-title {display:flex;justify-content:space-between;align-items:center;gap:8px;}
.room-title strong {font-size:14px;color:#edf6f3;font-weight:650;}
.room-check {width:18px;height:18px;border:1px solid #78909b66;border-radius:50%;display:grid;place-items:center;font-size:10px;color:transparent;}
.room-detail {font-size:10px;font-weight:400;color:#adc1cc;line-height:1.5;}
#panel:not(.mini) #rooms .room.active {background:#243d33;border-color:#90caae88;box-shadow:inset 0 1px 0 #b6e8cc12;}
.room.active .room-check {color:#16271f;border-color:#a3dec4;background:#a3dec4;}
.room:disabled {opacity:.6;}
#panel:not(.mini) .rooms-back {flex:none;margin-top:15px;height:42px;background:#386c56;border-color:#78ac96;}
#panel:not(.mini) #logs-page {display:flex;flex-direction:column;overflow:hidden;}
#panel:not(.mini) .log-status {font-size:11px;background:#223830;border:1px solid #709c8847;border-radius:10px;padding:13px;margin:0 0 16px;color:#cce4d7!important;}
.log-label {display:block;font-size:9px;color:#8ebfa9;margin-bottom:7px;letter-spacing:.4px;}
#panel:not(.mini) #events {flex:1;min-height:0;max-height:none;overflow-y:auto;white-space:normal;padding:0 0 8px;}
.event-card {position:relative;padding:0 0 16px 16px;border-left:1px solid #7893883b;margin-left:4px;}
.event-card::before {content:'';position:absolute;width:6px;height:6px;border-radius:50%;background:#8daaa0;left:-3.5px;top:5px;}
.event-card time {font-size:9px;line-height:1.5;color:#8fa7b5;display:block;margin-bottom:5px;}
.event-card p {font-size:11px;line-height:1.8;color:#d3e1e8;margin:0;overflow-wrap:anywhere;}
.event-card.accepted::before {background:#9edbbd;}
.event-card.warning::before {background:#e1b680;}
#panel:not(.mini) .statusline {border-left:2px solid #719b87;padding-left:8px;}
#panel:not(.mini) .mini-context {color:#aec2cb;}
#panel:not(.mini) .side {border-radius:5px;}
#panel:not(.mini) #table-strip {gap:8px;}
#panel:not(.mini) .table-chip.selected {border-color:#a2d5bd90;background:#293f36;}
.report-shell {background:#141f27;color:#d6e6ee;}
.report-head {padding:0 0 16px;border-bottom:1px solid #5a738144;gap:10px;flex:none;}
.report-head h2 {font-size:21px;line-height:1.4;letter-spacing:.1px;}
.report-head button {border:1px solid #69879755;background:#243841;color:#cde2ec;border-radius:7px;min-height:34px;}
.report-filter {display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px 8px;padding:14px 0;margin:0;flex:none;}
.report-filter label {grid-column:span 3;display:flex;flex-direction:column;gap:7px;font-size:10px;color:#aabfcc;}
.report-filter select {width:100%;height:35px;background:#1b2c37;border-color:#5c7b8c55;border-radius:7px;padding:6px 9px;color:#dcebf2;font-size:11px;}
.report-filter>button {grid-column:span 2;height:34px;border:1px solid #4f6a7a66;border-radius:7px;font-size:11px;color:#b8ccd5;background:#1c2d36;}
.report-filter>button.selected {background:#2c493b;border-color:#92c7ad88;color:#c3e9d4;}
.report-tabs {margin:0;border-color:#5c778044;gap:12px;flex:none;}
.report-tabs button {font-size:11px;padding:8px 0 10px;}
.report-tabs button.selected {color:#b4e3cf;border-bottom-color:#98d6b8;}
.report-note {font-size:10px;color:#96b0c0;margin:10px 0 14px;flex:none;}
.report-card {background:#1c2d37;border:1px solid #526e7d50;border-radius:10px;padding:13px;margin-bottom:12px;}
.report-card-head {margin:0 0 10px;}
.report-card-head strong {font-size:13px;letter-spacing:.1px;}
.report-state {font-size:9px;background:#2e443b;color:#bbd9c8;border-radius:5px;padding:4px 6px;}
.report-values {font-size:11px;color:#b8d0dc;margin:0;padding:9px 0;border-top:1px solid #7c9da02b;}
.report-values strong {font-size:13px;}
.report-card-time {font-size:9px;margin-top:4px;color:#8eabba;line-height:1.6;}
.report-footer {flex-direction:column;align-items:stretch;gap:13px;margin:12px 0 0;padding:13px 0 0;border-top:1px solid #607c8838;color:#b7cdd7;flex:none;}
.report-footer #report-total {font-size:10px;line-height:1.8;width:100%;}
.report-footer>span:last-child {display:flex;align-items:center;justify-content:space-between;gap:10px;}
.report-footer button {height:33px;min-width:73px;font-size:10px;border-color:#6b879855;border-radius:7px;}
.report-empty {font-size:12px;line-height:1.8;padding:38px 16px!important;color:#a7bfcd;}
.risk-overlay {background:#0a141cde;backdrop-filter:blur(7px);}
.risk-card {background:#1c2b34;border:1px solid #a58d5977;border-radius:15px;padding:24px 20px 20px;text-align:left;box-shadow:0 15px 38px #0007;}
.risk-emblem {width:76px;height:76px;background:#ad8d4020;border:1px solid #c8a56038;display:grid;place-items:center;margin:0 auto 20px;border-radius:20px;}
.risk-triangle {width:48px;height:45px;margin:0;filter:none;}
.risk-card h2 {font-size:20px;color:#f0dcac;margin:0 0 16px;text-align:center;font-weight:650;}
.risk-copy {font-size:12px;line-height:2;color:#d5e0e6;margin:0 0 20px;}
.risk-ack {padding:12px 10px;border:1px solid #6281744d;background:#233b30;border-radius:8px;font-size:11px;line-height:1.7;gap:9px;margin:0 0 18px;color:#c6e3d3;}
.risk-ack input {width:18px;height:18px;accent-color:#9fcbb3;}
.risk-actions {gap:10px;}
.risk-actions button {height:42px;border-radius:8px;font-size:12px;font-weight:600;}
.risk-actions #risk-cancel {background:#263842;border-color:#74919e70;color:#d0e2ec;}
.risk-actions #risk-confirm {background:#40785e;border-color:#91cbb0;color:#ebfff3;}
#panel.compact.mini {background:#141f27;border-color:#607c8c70;border-radius:13px;box-shadow:0 14px 30px #0007;}
.compact.mini .brand {color:#e4eee9;font-weight:650;font-size:12px;}
.compact.mini .tools #zoom-out {background:#253c46;border-color:#7b9aaa66;border-radius:7px;color:#dcecf2;}
.compact.mini .mini-context {color:#98b5c5;font-size:10px;}
.compact.mini #mini-running {color:#afd6c3;}
.compact.mini .roomline {color:#ebf2f5;}
.compact.mini .ring-inner {background:#182831;}
.compact.mini .stats {background:#20323c;border-color:#607c8c40;border-radius:7px;}
.compact.mini .stats small {color:#a2becb;}
.compact.mini .stats strong {color:#d6e8ef;}
.compact.mini .compact-actions {background:none;}
.compact.mini .compact-actions #open-report {background:#283e49;border-color:#7c99a955;font-size:10px;}
.compact.mini .compact-actions #compact-stop {background:#3a785e;border-color:#8ec6ab88;font-size:10px;}
.compact.mini .compact-actions #compact-stop.live {background:#804b45;border-color:#c78d8377;}

#panel:not(.mini),#panel.compact:not(.mini),.report-shell,.risk-overlay {width:var(--full-width,336px);}
#panel:not(.mini) .topline {grid-template-columns:repeat(6,minmax(0,1fr));}
#panel:not(.mini) .brand {grid-column:1/5;}
#panel:not(.mini) .tools #zoom-in {display:none;}
#panel:not(.mini) .tools #zoom-out {grid-column:5/7;display:flex;gap:7px;align-items:center;justify-content:center;width:100%;height:34px;font-size:11px;color:#cce8dc;background:#2a4139;border:1px solid #80b79e66;}
#panel:not(.mini) .tools #zoom-out svg {width:14px;height:14px;}
#panel.compact.mini {width:210px;}
.compact.mini .tools {width:45px;}
.compact.mini .tools #zoom-out {display:flex;align-items:center;justify-content:center;width:45px;height:28px;font-size:9px;padding:0;}
.compact.mini .tools #zoom-out svg {display:none;}
.resize-grip {position:absolute;right:1px;bottom:1px;width:25px;height:25px;display:grid;place-items:center;color:#7898a7;cursor:nwse-resize;touch-action:none;z-index:2;border-radius:0 0 15px 0;background:none;}
.resize-grip svg {width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;}
.resize-grip:hover,.resize-grip[data-resizing=true] {color:#c0e5d0;background:#72a48b22;}
#panel.mini .resize-grip {display:none;}
#panel:not(.mini)> .compact-actions {margin-bottom:7px;}
.report-shell {padding-bottom:26px;}
#panel:not(.mini) #settings-page {overflow-y:auto;}
#panel:not(.mini) #settings-page .form-body {padding:0;}
#panel:not(.mini) #logs-page .surface-note,#panel:not(.mini) #rooms-page .surface-note {flex:none;}
#panel:not(.mini) .surface-heading {flex:none;}
#panel:not(.mini) .cards-result {height:auto;min-height:40px;padding:7px 9px;background:#20313b;border:1px solid #54718444;border-radius:8px;}
#panel:not(.mini) .cards-side small {font-size:9px;}
#panel:not(.mini) .playing-card {width:18px;height:26px;font-size:10px;}

.selection-control {display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid #5c7d7040;background:#23372e;border-radius:10px;margin:4px 0 14px;flex:none;}
.selection-control span {font-size:11px;color:#c0decf;line-height:1.7;}
.selection-control button {height:33px;border-radius:7px;background:#293e45;border:1px solid #7da79355;font-size:11px;}
.selection-control button.selected {background:#38674f;color:#daf6e6;}

.strategy-preview {display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#8faebb;margin:0 0 8px;}
.strategy-preview strong {color:#c4e5d5;font-size:10px;font-weight:500;border:1px solid #87b49a40;background:#243b302e;border-radius:5px;padding:3px 7px;}
.compact.mini .strategy-preview {display:none;}
#panel:not(.mini) .hero {min-height:145px;}
#panel:not(.mini) .statusline {margin-top:0;}

.provider-picker {position:relative;}
#provider-trigger {width:100%;display:flex;gap:10px;align-items:center;height:40px;border:1px solid #65889966;border-radius:8px;background:#13212b;padding:0 11px;color:#dfedf4;font-size:12px;}
.provider-logo {display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex:none;color:#e1f4ec;}
.provider-logo svg {height:20px;width:20px;fill:inherit;}
.provider-logo svg[fill="currentColor"] {fill:currentColor;}
.provider-arrow {width:13px;height:13px;margin-left:auto;fill:none;stroke:currentColor;stroke-width:1.8;}
#provider-trigger[aria-expanded=true] {border-color:#9bccb3;}
#provider-trigger[aria-expanded=true] .provider-arrow {transform:rotate(180deg);}
#provider-menu {position:absolute;left:0;right:0;top:46px;z-index:5;background:#1e2f3a;border:1px solid #75998a88;border-radius:11px;padding:5px;box-shadow:0 14px 28px #0007;}
.provider-option {width:100%;min-height:39px;display:flex;align-items:center;gap:10px;border-radius:7px;padding:7px 9px;font-size:12px;color:#d3e4ed;text-align:left;}
.provider-option:hover {background:#304b42;}
.provider-option.selected {background:#355444;color:#e7fff0;}
.provider-check {margin-left:auto;font-size:11px;color:transparent;}
.provider-option.selected .provider-check {color:#b3e3c9;}
.strategy-badge {display:inline-flex;align-items:center;gap:6px;border:1px solid #87b49a40;background:#243b302e;border-radius:6px;padding:3px 7px;}
.strategy-badge .provider-logo {width:14px;height:14px;}
.strategy-badge .provider-logo svg {width:14px;height:14px;}
.strategy-preview .strategy-badge strong {padding:0;border:0;background:none;}

.amount-explainer{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:10px;color:#9eb7c1;margin:8px 0 2px;font-variant-numeric:tabular-nums}.amount-explainer span:last-child{text-align:right}.risk-stake-summary{border:1px solid #7eae9550;background:#28413360;border-radius:8px;padding:10px;color:#bfe6d0;font-size:11px;line-height:1.6;margin:12px 0}.compact.mini .amount-explainer{font-size:9px;margin:2px 0 1px}.compact.mini #amount-rule{display:none}.compact.mini .hero{height:83px}.compact.mini #hero-status{display:none}
`;
