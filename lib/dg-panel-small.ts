// v2.8.2：較小完整面板；不改注碼、狀態、送單或帳本。
export const DG_SMALL_CSS = `
#panel:not(.mini),#panel.compact:not(.mini){width:var(--full-width,280px);height:var(--full-height,560px);padding:14px;gap:8px;border-radius:15px;}
#panel:not(.mini) #head{height:64px;}
#panel:not(.mini) .topline{height:64px;grid-template-rows:28px 30px;gap:6px;}
#panel:not(.mini) .brand{font-size:14px;}
#panel:not(.mini) .tools #zoom-out{height:28px;font-size:10px;}
#panel:not(.mini) .tools #nav-overview,#panel:not(.mini) .tools #nav-settings,#panel:not(.mini) .tools #nav-logs{height:30px;font-size:11px;}
#panel:not(.mini) #overview-page{gap:7px;}
#panel:not(.mini) .parallel-control{height:30px;gap:8px;}
#panel:not(.mini) .parallel-control label{font-size:10px;}
#panel:not(.mini) .parallel-control select,#panel:not(.mini) .choose-tables{height:30px;font-size:11px;}
#panel:not(.mini) .mini-context{height:18px;font-size:10px;}
#panel:not(.mini) .mini-context strong{font-size:12px;}
#panel:not(.mini) .hero{min-height:0;gap:6px;}
#panel:not(.mini) .strategy-preview{margin-bottom:4px;}
#panel:not(.mini) .roomline{height:19px;font-size:12px;}
#panel:not(.mini) .amount-explainer{margin:5px 0 2px;font-size:9px;}
#panel:not(.mini) .bet-main{height:43px;margin:5px 0;gap:8px;}
#panel:not(.mini) .amount{font-size:32px;}
#panel:not(.mini) .amount.long-number{font-size:25px;}
#panel:not(.mini) .side{font-size:9px;padding:4px 5px;}
#panel:not(.mini) .ring{width:37px;height:37px;}
#panel:not(.mini) .ring-inner{font-size:12px;}
#panel:not(.mini) .meta{font-size:9px;min-height:15px;line-height:1.6;}
#panel:not(.mini) .statusline{font-size:10px;line-height:15px;max-height:30px;min-height:15px;}
#panel:not(.mini) .stats{height:50px;padding:9px 8px;}
#panel:not(.mini) .stats small{font-size:9px;margin-bottom:5px;}
#panel:not(.mini) .stats strong{font-size:14px;}
#panel:not(.mini) .stats>div+div{padding-left:7px;}
#panel:not(.mini) .chart-wrap{height:76px;padding:8px 8px 6px;}
#panel:not(.mini) .chart-head{font-size:9px;height:12px;}
#panel:not(.mini) .chart-head strong{font-size:10px;}
#panel:not(.mini) .chart{height:31px;margin:5px 0 3px;}
#panel:not(.mini) .chart-foot{font-size:8px;height:11px;}
#panel:not(.mini) .chart-empty{top:32px;font-size:9px;}
#panel:not(.mini) #table-strip{height:43px;min-height:43px;gap:6px;}
#panel:not(.mini) .table-chip{padding:6px 8px;min-width:104px;max-width:124px;}
#panel:not(.mini) .table-chip strong{font-size:10px;line-height:14px;}
#panel:not(.mini) .table-chip small{font-size:9px;line-height:14px;}
#panel:not(.mini)>.compact-actions{height:36px;min-height:36px;margin:0 0 5px;gap:8px;}
#panel:not(.mini)>.compact-actions button{height:36px;font-size:11px;}
#panel:not(.mini) .surface-heading .page-title{font-size:18px;}
#panel:not(.mini) .surface-heading{margin-bottom:7px;}
#panel:not(.mini) .surface-note{font-size:10px;margin-bottom:12px;}
#panel:not(.mini) .form-section{padding:11px;margin-bottom:10px;}
#panel:not(.mini) .form-section label{margin:10px 0 6px;font-size:10px;}
#panel:not(.mini) .form-section select,#panel:not(.mini) .form-section input:not([type=checkbox]){height:34px;font-size:11px;}
#panel:not(.mini) #provider-trigger{height:35px;font-size:11px;}
#panel:not(.mini) #rooms{gap:8px;}
#panel:not(.mini) #rooms .room{min-height:65px;padding:10px;gap:7px;}
#panel:not(.mini) .room-title strong{font-size:12px;}
#panel:not(.mini) .room-detail{font-size:9px;}
#panel:not(.mini) .selection-control{padding:10px;gap:7px;margin-bottom:10px;}
#panel:not(.mini) .rooms-back{height:35px;font-size:11px;margin-top:10px;}
.report-shell,.risk-overlay{width:var(--full-width,280px);height:var(--full-height,560px);padding:14px;}
.report-head{padding-bottom:10px;}
.report-head h2{font-size:18px;}
.report-filter{gap:7px;padding:10px 0;}
.report-filter select{height:30px;}
.report-filter>button{height:29px;}
.report-note{margin:7px 0 10px;}
.report-card{padding:10px;margin-bottom:9px;}
.report-footer{gap:8px;padding-top:9px;margin-top:8px;}
.report-footer button{height:30px;min-width:65px;}
.risk-card{padding:18px 14px 14px;}
.risk-emblem{width:62px;height:62px;border-radius:16px;margin-bottom:14px;}
.risk-card h2{font-size:18px;margin-bottom:12px;}
.risk-copy{font-size:11px;line-height:1.9;margin-bottom:14px;}
.risk-stake-summary{padding:8px;font-size:10px;margin:10px 0;}
.risk-ack{padding:10px 8px;font-size:10px;margin-bottom:14px;}
.risk-actions button{height:36px;font-size:11px;}
`;
