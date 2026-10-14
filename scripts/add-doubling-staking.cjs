const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
function change(file,fn){const p=path.join(root,file);const old=fs.readFileSync(p,'utf8'),s=fn(old);if(s===old)throw Error('Unchanged '+file);fs.writeFileSync(p,s);}
function rep(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,100));return s.replace(a,b);}
change('lib/dg-bet-ledger.ts',s=>{
 s=s.replace(/'martingale' \| 'flat'/g,"'martingale' | 'flat' | 'doubling'").replace(/'martingale'\|'flat'/g,"'martingale'|'flat'|'doubling'");
 s=rep(s,'export class DgBetLedger {',`/** Classic doubling: 1, 2, 4, 8; unlike the existing 1, 3, 7, 15 Martingale. */
export function doublingAmount(base:number, level:number):number {
  if(!Number.isSafeInteger(base)||base<=0||!Number.isInteger(level)||level<0||level>30)throw Error('基本金額／階級無效');
  const amount=base*2**level;
  if(!Number.isSafeInteger(amount))throw Error('倍投金額超出整數範圍');
  return amount;
}
export function stakingAmount(base:number,level:number,staking:'flat'|'martingale'|'doubling'):number {
  return staking==='doubling'?doublingAmount(base,level):martingaleAmount(base,staking==='flat'?0:level);
}
export class DgBetLedger {`);
 return rep(s,"const amount=martingaleAmount(base,staking==='flat'?0:level);","const amount=stakingAmount(base,level,staking);");
});
change('lib/mt-dom-click-runner.ts',s=>{
 s=s.replace('chipPlan, martingaleAmount','chipPlan, stakingAmount').replace(/'flat'\|'martingale'/g,"'flat'|'martingale'|'doubling'");
 s=rep(s,"return martingaleAmount(state.config.base,mode()==='martingale'?state.level:0)","return stakingAmount(state.config.base,state.level,mode())");
 s=rep(s,"['flat','martingale'].includes(c.staking)","['flat','martingale','doubling'].includes(c.staking)");
 s=rep(s,"if(bet.staking==='martingale')state.level=","if(bet.staking!=='flat')state.level=");
 s=rep(s,"level:mode()==='martingale'?state.level:0","level:mode()!=='flat'?state.level:0");
 return rep(s,"if(mode()==='martingale'&&pending().length)","if(mode()!=='flat'&&pending().length)");
});
change('lib/dg-panel-view.ts',s=>rep(s,'</option></select><label for="start-mode">','</option><option value="doubling">倍投法 · 1→2→4→8，輸後加倍、贏重置</option></select><label for="start-mode">'));
change('lib/dg-console-entry.ts',s=>{
 s=rep(s,'DgBetLedger, martingaleAmount','DgBetLedger, stakingAmount');s=s.replace(/'martingale'\|'flat'/g,"'martingale'|'flat'|'doubling'");
 s=rep(s,"roomCount==='1'&&singleStaking==='martingale'","roomCount==='1'&&singleStaking!=='flat'");
 s=rep(s,'return martingaleAmount(amount,amountLevel(tableId,mode))','return stakingAmount(amount,amountLevel(tableId,mode),stakingMode())');
 s=rep(s,"roomCount==='1'&&stakingMode()==='martingale'?'同時 1 桌啟動：跨房间接續共用馬丁，結算後才找下一桌'","roomCount==='1'&&stakingMode()!=='flat'?`同時 1 桌啟動：跨房間接續${stakingMode()==='doubling'?'倍投法':'馬丁'}，結算後才找下一桌`");
 s=rep(s,"stakingMode()==='flat'?'平注 · 金額固定':'單桌共用馬丁 · 換房接續 1→3→7→15'","stakingMode()==='flat'?'平注 · 金額固定':stakingMode()==='doubling'?'單桌共用倍投 · 換房接續 1→2→4→8':'單桌共用馬丁 · 換房接續 1→3→7→15'");
 s=rep(s,'`跨房間接續馬丁：輸升階、贏重置、和維持。','`跨房間接續${singleStaking===\'doubling\'?\'倍投1→2→4→8\':\'馬丁1→3→7→15\'}：輸升階、贏重置、和維持。');
 s=rep(s,"stakingMode()==='flat'?'平注 · 固定金額':'單桌 · 馬丁'","stakingMode()==='flat'?'平注 · 固定金額':stakingMode()==='doubling'?'單桌 · 倍投法':'單桌 · 馬丁'");
 s=rep(s,"shownStaking==='flat'?1:2**(shownLevel+1)-1","shownStaking==='flat'?1:shownStaking==='doubling'?2**shownLevel:2**(shownLevel+1)-1");
 s=rep(s,"stakingMode()==='flat'?'平注':`馬丁 1→3→7→15`","stakingMode()==='flat'?'平注':stakingMode()==='doubling'?'倍投 1→2→4→8':`馬丁 1→3→7→15`");
 return rep(s,"if(value!=='flat'&&value!=='martingale')return;","if(value!=='flat'&&value!=='martingale'&&value!=='doubling')return;");
});
change('lib/mt-click-panel.ts',s=>{
 s=s.replace(/'flat' \| 'martingale'/g,"'flat' | 'martingale' | 'doubling'");
 s=rep(s,"savedStaking === 'martingale' ? 'martingale' : 'flat'","savedStaking === 'doubling' ? 'doubling' : savedStaking === 'martingale' ? 'martingale' : 'flat'");
 s=rep(s,"singleStakingPreference = inputValue('single-staking') === 'martingale' ? 'martingale' : 'flat'","singleStakingPreference = inputValue('single-staking') === 'doubling' ? 'doubling' : inputValue('single-staking') === 'martingale' ? 'martingale' : 'flat'");
 s=rep(s,"shownStaking === 'martingale' ? 2 ** (shownLevel + 1) - 1 : 1","shownStaking === 'doubling' ? 2 ** shownLevel : shownStaking === 'martingale' ? 2 ** (shownLevel + 1) - 1 : 1");
 s=rep(s,"shownStaking === 'martingale' ? '單桌 · 馬丁' : '平注 · 固定金額'","shownStaking === 'doubling' ? '單桌 · 倍投法' : shownStaking === 'martingale' ? '單桌 · 馬丁' : '平注 · 固定金額'");
 s=rep(s,"shownStaking === 'martingale' ? `第${shownLevel + 1}階 ×${multiplier}` : '平注 ×1'","shownStaking !== 'flat' ? `第${shownLevel + 1}階 ×${multiplier}` : '平注 ×1'");
 s=rep(s,"? singleStakingPreference === 'martingale'\n        ? `單桌馬丁", "? singleStakingPreference !== 'flat'\n        ? `單桌${singleStakingPreference === 'doubling' ? '倍投1→2→4→8' : '馬丁1→3→7→15'}");
 return s;
});
console.log('DG and MT: flat, existing Martingale, classic doubling. Multi-table remains flat-only.');
