const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function update(file,changes){let s=fs.readFileSync(path.join(root,file),'utf8');for(const [a,b]of changes){if(!s.includes(a))throw Error(file+' missing '+a.slice(0,80));s=s.replace(a,b);}fs.writeFileSync(path.join(root,file),s);}
update('lib/dg-panel-view.ts',[
 ["import {DG_SMALL_CSS} from './dg-panel-small';","import {DG_SMALL_CSS} from './dg-panel-small';\nimport { OFFICIAL_TURNOVER_HTML, OFFICIAL_TURNOVER_REPORT_HTML, OFFICIAL_TURNOVER_CSS } from './official-turnover-panel';"],
 ['${DG_SMALL_CSS}\n</style>','${DG_SMALL_CSS}\n${OFFICIAL_TURNOVER_CSS}\n</style>'],
 ['</div></div><div id="chart-wrap" class="chart-wrap">','</div></div>${OFFICIAL_TURNOVER_HTML}<div id="chart-wrap" class="chart-wrap">'],
 ['<div class="report-scroll"><div id="report-body"','${OFFICIAL_TURNOVER_REPORT_HTML}<div class="report-scroll"><div id="report-body"'],
]);
update('lib/mt-click-console-entry.ts',[
 ["import {mountMtClickPanel} from './mt-click-panel';","import {mountMtClickPanel} from './mt-click-panel';\nimport {createMtOfficialTurnover} from './mt-official-turnover';"],
 ['const adapter=createMtRecommendationAdapter();','const official=createMtOfficialTurnover(W,()=>!runner?.isBusy());\n    const adapter=createMtRecommendationAdapter();'],
 ['await runner!.dispose();feed.dispose();panel?.remove();disposed=true;','await runner!.dispose();official.dispose();feed.dispose();panel?.remove();disposed=true;'],
 ['panel=mountMtClickPanel(W,runner,feed,dispose);','panel=mountMtClickPanel(W,runner,feed,dispose,official);'],
 ["version:'0.6'","version:'0.6.1-official-turnover'"],
 ['refreshRoad:()=>feed.refresh(true)','officialTurnover:official.view,refreshOfficialTurnover:()=>official.refresh(true),refreshRoad:()=>feed.refresh(true)'],
 ['v0.6 DG同規則／全介面共用版','v0.6.1 官方今日／本週流水版'],
]);
update('lib/mt-click-panel.ts',[
 ["import type { DgBet } from './dg-bet-ledger';","import type { DgBet } from './dg-bet-ledger';\nimport type { OfficialTurnoverView } from './official-turnover-data';\nimport { renderOfficialTurnover } from './official-turnover-panel';"],
 ['onRemove: () => Promise<void>,\n)', 'onRemove: () => Promise<void>,\n  official?: { view: () => OfficialTurnoverView },\n)'],
 ['const view = getView();\n    const config = view.config;','const view = getView();\n    renderOfficialTurnover(shadow, official?.view());\n    const config = view.config;'],
]);
update('lib/dg-console-entry.ts',[
 ["import {installDgProviderMenu} from './dg-provider-menu';","import {installDgProviderMenu} from './dg-provider-menu';\nimport {createDgOfficialTurnover} from './dg-official-turnover';\nimport {renderOfficialTurnover} from './official-turnover-panel';"],
 ["const providerMenu=installDgProviderMenu(shadow,AI_PROVIDER_OPTIONS);","const providerMenu=installDgProviderMenu(shadow,AI_PROVIDER_OPTIONS);\n  const official=createDgOfficialTurnover(window,()=>account,()=>!busy);"],
 ["q('status').textContent=`${running?'執行中':'已停止'}｜${userStatus(status)}`;","renderOfficialTurnover(shadow,official.view());\n    q('status').textContent=`${running?'執行中':'已停止'}｜${userStatus(status)}`;"],
 ["version:'2.8.5-single-selectable-staking'","version:'2.8.6-official-turnover'"],
 ['stakeDiagnostics,\n    status:', 'stakeDiagnostics,officialTurnover:official.view,refreshOfficialTurnover:()=>official.refresh(true),\n    status:'],
 ['clearInterval(timer);cleanupFeedback();cleanupResize();','clearInterval(timer);official.dispose();cleanupFeedback();cleanupResize();'],
]);
update('scripts/build-mt-click-console.cjs', [['AutoBac MT v0.6. Shared DG rules','AutoBac MT v0.6.1. Official today/week turnover. Shared DG rules']]);
console.log('Official turnover wired for DG and MT; wager/core files untouched');
