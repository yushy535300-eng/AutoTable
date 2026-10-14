const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
function patch(file,pairs){const p=path.join(root,file);let s=fs.readFileSync(p,'utf8');for(const[a,b]of pairs){if(!s.includes(a))throw Error(file+' missing '+a.slice(0,60));s=s.replace(a,b);}fs.writeFileSync(p,s);}
patch('lib/dg-panel-view.ts',[
 ['<div id="staking-hint" class="settings-added"></div>','<div id="staking-hint" class="settings-added"></div><p id="doubling-reminder" class="doubling-reminder" hidden>使用倍投法，請設定止盈與止損；連續虧損會使下一注加倍。</p>'],
 ['<div id="risk-stake-summary" class="risk-stake-summary" hidden></div>','<div id="risk-stake-summary" class="risk-stake-summary" hidden></div><p id="risk-doubling-warning" class="doubling-reminder" hidden></p>'],
 ['${OFFICIAL_TURNOVER_CSS}\n</style>','${OFFICIAL_TURNOVER_CSS}\n.doubling-reminder{border-left:3px solid #cba86a;border-radius:5px;padding:8px 9px;background:#a4793324;color:#e6c995;font-size:10px;line-height:1.6;margin:8px 0;}\n</style>'],
]);
patch('lib/dg-console-entry.ts',[
 ["q('single-staking').value=stakingMode();","q('doubling-reminder').hidden=stakingMode()!=='doubling';\n    q('single-staking').value=stakingMode();"],
 ["q('risk-stake-summary').textContent=", "q('risk-doubling-warning').hidden=stakingMode()!=='doubling';\n    q('risk-doubling-warning').textContent=`使用倍投法，請設定止盈與止損。${!q('take-profit').value||!q('stop-loss').value?'目前止盈／止損尚未全部設定，請先至設定頁確認。':'請確認目前止盈與止損金額符合你的設定。'}`;\n    q('risk-stake-summary').textContent="],
]);
patch('lib/mt-click-panel.ts',[
 ["q('single-staking').toggleAttribute('disabled', locked || draft.rooms !== '1');", "q('doubling-reminder').hidden=draft.rooms !== '1'||singleStakingPreference !== 'doubling';\n    q('single-staking').toggleAttribute('disabled', locked || draft.rooms !== '1');"],
 ["q('risk-dialog').hidden = false;", "q('risk-doubling-warning').hidden=draft.rooms !== '1'||singleStakingPreference !== 'doubling';\n    q('risk-doubling-warning').textContent=`使用倍投法，請設定止盈與止損。${!draft.takeProfit||!draft.stopLoss?'目前止盈／止損尚未全部設定，請先至設定頁確認。':'請確認目前止盈與止損金額符合你的設定。'}`;\n    q('risk-dialog').hidden = false;"],
]);
console.log('Doubling stop-loss/take-profit reminders added to both platforms');
