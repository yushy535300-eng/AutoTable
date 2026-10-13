from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'lib/dg-console-entry.ts'
s=p.read_text()
s=s.replace("import {localProviderDecision,getPatternInfo,providerAnalysisText,AI_PROVIDER_OPTIONS} from './dg-original-ai';", "import {localProviderDecision,getPatternInfo,providerAnalysisText,AI_PROVIDER_OPTIONS} from './dg-original-ai';\nimport {DG_PANEL_HTML} from './dg-panel-view';")
a=s.index('  shadow.innerHTML=')
b=s.index('  const q=',a)
s=s[:a]+"  shadow.innerHTML=DG_PANEL_HTML;\n  const mountedAt=Date.now();\n"+s[b:]
a=s.index('  function render(){')
b=s.index('  function visibility()',a)
s=s[:a]+'''  function showPage(name:'overview'|'settings'|'logs'){
    for(const page of ['overview','settings','logs'])q(page+'-page').hidden=page!==name;
    fitPanel();
  }
  function fitPanel(){
    const landscape=window.innerWidth>window.innerHeight;
    const scale=Math.min(1,(window.innerWidth-24)/290,(window.innerHeight*(landscape?0.80:0.92))/570);
    host.style.setProperty('--fit',String(Math.max(.45,scale)));
  }
  function render(){
    if(disposed)return;
    q('status').textContent=`${running?'執行中':'已停止'}｜${status}`;
    q('hero-status').textContent=status;
    q('events').textContent=logs.join('\\n');
    const cards=boards(),chosen=cards.filter(c=>selected.has(String(c.tableId))),pending=ledger.pending();
    const currentBet=pending[0];
    const focus=chosen.find(c=>String(c.tableId)===currentBet?.tableId)??chosen.find(ready)??chosen[0];
    const previewBase=!running&&!pending.length&&Number(q('base').value)>0?Number(q('base').value):base;
    const previewProvider=!running&&!pending.length?q('provider').value:provider;
    const previewScope=!running&&!pending.length?q('scope').value:scope;
    const settled=ledger.state.bets.filter(b=>b.state==='settled'&&b.createdAt>=mountedAt);
    const pnl=settled.reduce((sum,b)=>sum+(b.pnl??0),0);
    const wins=settled.filter(b=>(b.pnl??0)>0).length,losses=settled.filter(b=>(b.pnl??0)<0).length,ties=settled.length-wins-losses;
    q('brand-count').textContent=`DG · ${cards.length} 桌`;
    q('balance').textContent=account&&Number.isFinite(Number(account.balance))?money(Number(account.balance)):'—';
    q('run-pill').textContent=running?'● 自動下注中':pending.length?'● 待結算':'● 已停止';
    q('run-pill').classList.toggle('idle',!running);
    q('method').textContent=`策略 · 馬丁／${previewScope==='global'?'共用':'逐桌'}（${selected.size} 桌）`;
    const rec=focus&&roads(focus).length>=3?localProviderDecision(previewProvider,roads(focus)):null;
    q('focus-table').textContent=focus?(focus.gameInfo.tableName||String(focus.tableId)):'等待桌台';
    q('focus-phase').textContent=currentBet?(currentBet.state==='accepted'?'等待結算':currentBet.state==='uncertain'?'回覆未確定':'等待接受'):focus&&ready(focus)?'可下注':'準備中';
    q('amount').textContent=money(currentBet?.amount??martingaleAmount(previewBase,focus?ledger.level(String(focus.tableId),previewScope):0));
    const side=currentBet?.side??rec?.side;
    q('side').textContent=side?`${side} ${currentBet?'下注':'推薦'}`:'—';q('side').classList.toggle('player',side==='閒');
    const seconds=focus?Math.floor(remaining(focus)):null;
    q('countdown').textContent=seconds!==null?String(seconds):'—';
    q('ring').style.setProperty('--progress',`${seconds!==null?Math.min(1,seconds/Math.max(1,Number(focus.gameInfo.countDown)))*360:0}deg`);
    q('focus-meta').textContent=focus?`靴 ${focus.gameInfo.shoeId??'—'} · 局 ${focus.gameInfo.playId??'—'} · ${getPatternInfo(roads(focus)).label} · ${AI_PROVIDER_OPTIONS.find(x=>x.key===previewProvider)?.label??'本地策略'}`:'等候真實牌路與倒數';
    const stage=currentBet?(currentBet.state==='accepted'?3:2):running?1:0;
    for(let i=1;i<=4;i++)q('step-'+i).classList.toggle('active',i<=stage);
    q('pending-count').textContent=`${pending.length} 筆`;
    for(const id of ['hero-pnl','round-pnl']){q(id).textContent=(pnl>0?'+':'')+money(pnl);q(id).classList.toggle('green',pnl>0);q(id).classList.toggle('red',pnl<0);}
    q('stake-cap').textContent=money(Number(q('cap').value)||maxStake);
    q('round-count').textContent=`${settled.length} 注`;
    q('round-wlt').textContent=`${wins}/${losses}/${ties}`;
    q('hit-rate').textContent=wins+losses?`${(wins/(wins+losses)*100).toFixed(1)}%`:'—';
    q('stop-now').classList.toggle('live',running);
    q('stop-now').textContent=running?'■  停止自動下注':'▶  開始自動下注';
    q('tables').replaceChildren();
    for(const c of chosen){
      const results=roads(c),r=results.length>=3?localProviderDecision(previewProvider,results):null;
      const row=document.createElement('div');row.className='table-row';
      const badge=document.createElement('span');badge.className='table-badge';badge.textContent=r?.side??'—';
      const info=document.createElement('div');info.className='table-info';
      const title=document.createElement('strong');title.textContent=c.gameInfo.tableName||String(c.tableId);
      const meta=document.createElement('small');meta.textContent=`靴 ${c.gameInfo.shoeId??'—'} · 局 ${c.gameInfo.playId??'—'} · ${getPatternInfo(results).label}`;
      info.append(title,meta);
      const amount=document.createElement('div');amount.className='table-rec';amount.textContent=money(martingaleAmount(previewBase,ledger.level(String(c.tableId),previewScope)));
      const detail=document.createElement('small');detail.textContent=r?`指標 ${r.confidence} · ${Math.floor(remaining(c))}s`:'等待資料';amount.append(detail);
      row.append(badge,info,amount);q('tables').append(row);
    }
    if(!chosen.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='尚未選擇桌台 · 右上設定可掃描';q('tables').append(empty);}
  }
  q('scan').onclick=scan;q('count').onchange=()=>{roomCount=q('count').value;scan();};
  q('start').onclick=()=>{start();if(running)showPage('overview');};q('once').onclick=()=>{start(true);if(running)showPage('overview');};q('stop').onclick=()=>stop();
  q('stop-now').onclick=()=>{if(running)stop();else if(!q('ack').checked)showPage('settings');else start();};
  q('nav-overview').onclick=()=>showPage('overview');q('nav-settings').onclick=()=>showPage('settings');q('nav-logs').onclick=()=>showPage('logs');q('edit-rooms').onclick=()=>showPage('settings');
  for(const id of ['base','cap','provider','scope'])q(id).oninput=render;
  q('hide').onclick=()=>{q('panel').hidden=true;q('orb').hidden=false;};q('orb').onclick=()=>{q('panel').hidden=false;q('orb').hidden=true;};
  let drag:any=null;
  const head=q('head');
  head.onpointerdown=(e:PointerEvent)=>{
    if((e.target as Element).closest('button'))return;
    const box=host.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:box.left,top:box.top};head.setPointerCapture?.(e.pointerId);
  };
  head.onpointermove=(e:PointerEvent)=>{
    if(!drag)return;
    const fit=parseFloat(host.style.getPropertyValue('--fit'))||1;
    const left=Math.max(0,Math.min(window.innerWidth-290*fit,drag.left+e.clientX-drag.x));
    const top=Math.max(0,Math.min(window.innerHeight-50,drag.top+e.clientY-drag.y));
    host.style.left=left+'px';host.style.top=top+'px';host.style.right='auto';q('panel').style.transformOrigin='top left';
  };
  head.onpointerup=head.onpointercancel=()=>{drag=null;};
  window.addEventListener('resize',fitPanel);fitPanel();
'''+s[b:]
s=s.replace("version:'2.0.0-direct'", "version:'2.1.0-video-ui'")
s=s.replace("document.removeEventListener('visibilitychange',visibility);persist();host.remove();", "document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',fitPanel);persist();host.remove();")
p.write_text(s)
print('DG video-style UI integrated; message transport unchanged')
