export const DG_MOBILE_LAYOUT_CSS = `
.session-time{display:flex;justify-content:space-between;gap:5px;flex:none;padding:5px 0;font-size:9px;color:#b5c4bd;line-height:1.4;flex-wrap:wrap}.session-time strong{font-variant-numeric:tabular-nums;color:#e8dcc1}.session-time>span:last-child{margin-left:auto}
/* Applied last for both platforms. Content must not disappear behind a fixed footer. */
:host{touch-action:pan-x pan-y}
#overview-page,#settings-page,#logs-page,#rooms-page,.report-scroll,#events{touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#table-strip{touch-action:pan-x;-webkit-overflow-scrolling:touch}
#panel.compact:not(.mini) #overview-page{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#panel.compact.mini{width:210px;height:auto;min-height:228px;max-height:none;padding:9px;overflow:visible}
#panel.compact.mini #overview-page{flex:none;height:auto;min-height:0;overflow:visible;gap:5px}
#panel.compact.mini .hero{height:auto;min-height:0;max-height:none;padding:0;flex:none}
#panel.compact.mini #target-box{height:auto;min-height:0;flex:none}
#panel.compact.mini .mini-context{height:auto;min-height:18px;flex-wrap:wrap;gap:3px;font-size:9px}
#panel.compact.mini .mini-context>span:last-child{margin-left:auto;font-variant-numeric:tabular-nums}
#panel.compact.mini .roomline{height:auto;min-height:17px;flex-wrap:wrap;gap:4px}
#panel.compact.mini .bet-main{height:auto;min-height:39px;margin:3px 0}
#panel.compact.mini .meta{display:block;height:auto;min-height:0;white-space:normal;overflow:visible;line-height:1.35;font-size:9px;margin:3px 0}
#panel.compact.mini #hero-status{display:block;height:auto;min-height:0;max-height:none;overflow:visible;line-height:1.35;font-size:9px;margin:3px 0;overflow-wrap:anywhere}
#panel.compact.mini .turnover-source{display:block;font-size:8px;line-height:11px;margin:2px 0}
#panel.compact.mini .stats{height:auto;min-height:34px;padding:5px;flex:none}
#panel.compact.mini .stats small{white-space:normal;line-height:1.25;font-size:8px}
#panel.compact.mini .stats strong{font-size:10px}
#panel.compact.mini .compact-actions{height:31px;margin:5px 0 0;position:static;flex:none}
#panel.compact.mini .compact-actions button{height:31px;min-width:0;font-size:9px}
#panel.compact.mini .steps,#panel.compact.mini .step-labels,#panel.compact.mini .metrics,
#panel.compact.mini #cards-result,#panel.compact.mini #chart-wrap,#panel.compact.mini #table-strip{display:none}
/* iOS focuses sub-16px controls by zooming the whole viewport. This must live
   inside the shared shadow-root CSS as document styles cannot reach it. */
@media(pointer:coarse){
  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),textarea,select{font-size:16px!important}
}
`;
