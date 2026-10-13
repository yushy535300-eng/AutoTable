from pathlib import Path
p=Path(__file__).resolve().parents[1]/'lib/dg-console-entry.ts'
s=p.read_text().replace("import {DG_PANEL_HTML} from './dg-panel-view';", "import {DG_PANEL_HTML} from './dg-panel-view';\nimport {cumulativePoints, periodBets,rangePosition,knownPoker,pokerRank,pokerPoint} from './dg-panel-data';")
s=s.replace('  let persistKey=\'\';',"  let persistKey='';\n  let compact=false,reportPeriod:'today'|'yesterday'|'week'='today',reportPage=0,reportTab:'bets'|'transactions'='bets';")
s=s.replace("    q('pending-count').textContent=`${pending.length} 筆`;",'''    const seeking=running&&!currentBet;
    q('search-box').hidden=!seeking;
    q('target-box').hidden=seeking;
    q('search-title').textContent=compact?'挑選下注單…':'挑選下注桌…';
    q('countdown').textContent=seconds===0&&currentBet?'⊘':seconds!==null?String(seconds):'—';
    q('ring').style.background=seconds===0?'#55525866':`conic-gradient(${seconds!==null&&seconds<=5?'#c8a555':'#73997a'} ${seconds!==null?Math.min(1,seconds/Math.max(1,Number(focus.gameInfo.countDown)))*360:0}deg,#52565344 0)`;
    const low=q('range-min').value,high=q('range-max').value;
    q('range-low').textContent=low!==''?money(Number(low)):'—';q('range-high').textContent=high!==''?(Number(high)>0?'+':'')+money(Number(high)):'—';
    const position=rangePosition(pnl,low,high);q('pnl-range').value=position??50;q('pnl-range').style.opacity=position===null?'.35':'1';
    q('pnl-line').setAttribute('points',cumulativePoints(settled));q('pnl-chart').classList.toggle('red',pnl<0);
    q('cards-result').hidden=true;
    if(focus&&currentBet&&String(focus.gameInfo.gameNo)===currentBet.gameNo){
      const poker=knownPoker(focus.gameInfo.poker);
      if(poker){
        q('cards-result').hidden=false;
        for(const side of ['player','banker'] as const){
          q(side+'-cards').replaceChildren();for(const id of poker[side]){
            const card=document.createElement('span');card.className='playing-card';card.textContent=pokerRank(id);q(side+'-cards').append(card);
          }
          q(side+'-point').textContent=String(pokerPoint(poker[side]));
        }
      }
    }''')
s=s.replace("    q('stake-cap').textContent=money(Number(q('cap').value)||maxStake);\n    q('round-count').textContent=`${settled.length} 注`;",'')
s=s.replace("    fitPanel();\n  }\n  q('scan')", "    q('compact-stop').textContent=running?'■ 停止自動下注':'▶ 開始自動下注';\n    if(!q('report-shell').hidden)renderReport();\n    fitPanel();\n  }\n  q('scan')")
s=s.replace("  q('edit-rooms').onclick=()=>showPage('settings');", "  q('edit-rooms').onclick=()=>showPage('settings');")
s=s.replace("for(const id of ['base','cap','provider','scope'])", "for(const id of ['base','cap','provider','scope','range-min','range-max'])")
a=s.index('  let drag:any=null;')
s=s[:a]+'''  function openReport(){q('report-shell').hidden=false;renderReport();}
  function renderReport(){
    const perPage=10;
    const records=reportTab==='bets'?periodBets(ledger.state.bets,reportPeriod).slice().reverse():[];
    const pages=Math.max(1,Math.ceil(records.length/perPage));reportPage=Math.max(0,Math.min(reportPage,pages-1));
    q('report-body').replaceChildren();
    const fmtTime=(at:number)=>new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(at);
    for(const [i,b] of records.slice(reportPage*perPage,(reportPage+1)*perPage).entries()){
      const card=boards().find(c=>String(c.tableId)===b.tableId);
      const labels:any={reserved:'準備中',submitted:'待接受',accepted:'待結算',rejected:'拒絕',uncertain:'未確定',settled:'已結算',aborted:'未送出'};
      const row=document.createElement('tr');
      const values=[String(reportPage*perPage+i+1),'—','DG',`${card?.gameInfo.tableName??b.tableId} 百家樂`,b.state==='settled'?'時間未提供':fmtTime(b.createdAt),money(b.amount),'—',b.side,b.pnl==null?'—':(b.pnl>0?'+':'')+money(b.pnl),labels[b.state]];
      for(const [j,value]of values.entries()){const td=document.createElement('td');td.textContent=value;if(j===8&&b.pnl)td.className=b.pnl>0?'green':'red';row.append(td);}q('report-body').append(row);
    }
    q('report-empty').hidden=records.length>0;
    q('report-empty').textContent=reportTab==='transactions'?'尚未接入平台存提／轉帳資料，不會用下注紀錄冒充交易記錄':'此期間尚無本脚本下注記錄';
    q('report-note').textContent='僅本腳本記錄；不是平台完整歷史。平台訂單編號、有效下注額及正式結算時間未提供時顯示 —。';
    q('report-total').textContent=`${records.length} 筆 · 下注 ${money(records.reduce((a,b)=>a+b.amount,0))} · 已結算損益 ${money(records.reduce((a,b)=>a+(b.pnl??0),0))}`;
    q('report-page').textContent=`${reportPage+1} / ${pages}`;
    q('report-bets').classList.toggle('selected',reportTab==='bets');q('report-transactions').classList.toggle('selected',reportTab==='transactions');
    for(const period of ['today','yesterday','week'])q('report-'+period).classList.toggle('selected',period===reportPeriod);
  }
  q('nav-mode').onclick=()=>{
    compact=!compact;q('panel').classList.toggle('compact',compact);q('brand-count').textContent=compact?'RoadIQ':`DG · ${boards().length} 桌`;
    showPage('overview');render();
  };
  q('open-records').onclick=q('open-report').onclick=openReport;
  q('compact-stop').onclick=()=>q('stop-now').click();
  q('close-report').onclick=()=>{q('report-shell').hidden=true;showPage('overview');};
  for(const period of ['today','yesterday','week'] as const)q('report-'+period).onclick=()=>{reportPeriod=period;reportPage=0;renderReport();};
  q('report-bets').onclick=()=>{reportTab='bets';reportPage=0;renderReport();};q('report-transactions').onclick=()=>{reportTab='transactions';reportPage=0;renderReport();};
  q('report-prev').onclick=()=>{reportPage--;renderReport();};q('report-next').onclick=()=>{reportPage++;renderReport();};
  q('report-lobby').onchange=q('report-game').onchange=()=>{reportPage=0;renderReport();};
'''+s[a:]
s=s.replace("q('brand-count').textContent=`DG · ${cards.length} 桌`;", "q('brand-count').textContent=compact?'RoadIQ':`DG · ${cards.length} 桌`;")
s=s.replace("version:'2.1.0-video-ui'", "version:'2.2.0-full-video-ui'")
p.write_text(s)
print('Expanded UI data connected')
