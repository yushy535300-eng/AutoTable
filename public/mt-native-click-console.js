/* AutoBac MT v0.6.1. Official today/week turnover. Shared DG rules and all panel surfaces. Betting uses MT native DOM clicks.
   Read-only /tables GET refreshes bead data. Installation never starts betting.
   Review source; this script executes with the current MT page's permissions. */
/* Shared provider icon license:
MIT License

Copyright (c) 2023 LobeHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
if (!window.__MT_AUTOBAC_DIAG__) {
(() => {
  'use strict';
  function createMtTableNavigator(W, getTables, isDisposed = () => false) {
  const D=W.document, log=[];
  let generation=0;
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const tableName=card=>clean(card.querySelector('.gameDesk_tag,.gameDesk_tag_live')?.textContent).match(/\bB\d{2}[A-Z]?(?:-L)?\b/i)?.[0]?.toUpperCase()||null;
  function componentIds(card,row) {
    const ids=new Set();
    for(const e of [card,row])for(const key of ['data-table-id','data-table_id','table-id']){
      const id=e?.getAttribute(key);if(id)ids.add(id);
    }
    if(ids.size)return [...ids];
    // Vue's own row props may expose the exact table_id. Read only that field;
    // do not serialize the component, account, tokens or private session state.
    let component=card.__vueParentComponent||row?.__vueParentComponent;
    for(let parent=0;component&&parent<3;parent++,component=component.parent){
      const found=new Set(),seen=new WeakSet();
      function scan(v,depth=0){
        if(!v||typeof v!=='object'||depth>3||seen.has(v))return;seen.add(v);
        if(typeof v.table_id==='string'&&/^(BAV|BAG|SBG)[A-Z0-9_]+$/.test(v.table_id))found.add(v.table_id);
        for(const [key,value]of Object.entries(v).slice(0,50)){
          if(/token|pass|user|member|auth|cookie|session/i.test(key))continue;
          if(value&&typeof value==='object')scan(value,depth+1);
        }
      }
      try{scan(component.props);}catch{}
      // A parent holding all rows does not identify this row.
      if(found.size===1)return [...found];
      if(found.size>1)return [];
    }
    return [];
  }
  function list() {
    const pane=D.querySelector('.ant-tabs-tabpane-active.multiple');
    if(!pane)return [];
    const tables=getTables();
    return [...pane.querySelectorAll('.gameDesk')].map(card=>{
      const possible=card.closest('.gameDesk_wrap');
      const row=possible&&possible.querySelectorAll('.gameDesk').length===1?possible:card;
      const name=tableName(card),ids=componentIds(card,row);
      const named=tables.filter(t=>String(t.name||'').toUpperCase()===name);
      const explicit=ids.length===1?tables.find(t=>t.tableId===ids[0]):null;
      const tableId=explicit&&String(explicit.name||'').toUpperCase()===name?explicit.tableId:ids.length===0&&named.length===1?named[0].tableId:null;
      return {name,tableId,card,row,betArea:row.querySelector('.gameDesk_bet'),candidateIds:named.map(t=>t.tableId)};
    });
  }
  function resolve(requested) {
    const key=String(requested||'').toUpperCase();
    const tables=getTables(),byId=tables.find(t=>t.tableId.toUpperCase()===key);
    const matches=list().filter(r=>byId?r.tableId===byId.tableId:r.name===key&&r.tableId);
    if(matches.length===1)return {row:matches[0],key:matches[0].tableId};
    if(matches.length>1)return {error:'duplicate-dom-row'};
    const ambiguous=list().some(r=>byId?r.name===String(byId.name||'').toUpperCase()&&!r.tableId:r.name===key&&!r.tableId);
    return {error:ambiguous?'ambiguous-table-id':'not-mounted'};
  }
  function ancestors(node) {const out=[];for(let n=node?.parentElement;n;n=n.parentElement)out.push(n);return out;}
  function clipBounds(node) {
    let bounds={left:0,top:0,right:W.innerWidth,bottom:W.innerHeight};
    for(const p of ancestors(node)) {
      const style=W.getComputedStyle(p),r=p.getBoundingClientRect();
      if(/auto|scroll|hidden|clip/.test(style.overflowY)){bounds.top=Math.max(bounds.top,r.top);bounds.bottom=Math.min(bounds.bottom,r.bottom);}
      if(/auto|scroll|hidden|clip/.test(style.overflowX)){bounds.left=Math.max(bounds.left,r.left);bounds.right=Math.min(bounds.right,r.right);}
    }
    return bounds;
  }
  function inView(node) {
    if(!node?.isConnected)return false;
    const r=node.getBoundingClientRect(),b=clipBounds(node),s=W.getComputedStyle(node);
    return r.width>0&&r.height>0&&s.visibility!=='hidden'&&r.left>=b.left-1&&r.top>=b.top-1&&r.right<=b.right+1&&r.bottom<=b.bottom+1;
  }
  function targetOf(row,options) {
    if(options.control==='side') {
      if(!['莊','閒'].includes(options.side))return null;
      const li=[...row.row.querySelectorAll('.gameDesk_bet li')].find(e=>clean(e.querySelector('.caption')?.textContent)===options.side);
      return li?.querySelector('.chip-group')||li||null;
    }
    return row.row.querySelector('.gameDesk_bet .btn-check')||row.betArea||null;
  }
  const pause=()=>new Promise(resolve=>W.setTimeout(resolve,35));
  async function focus(requested,options={}) {
    const run=++generation,deadline=Date.now()+Math.max(100,Math.min(10000,Number(options.timeoutMs)||4000));
    const cancel=()=>run!==generation||isDisposed()||options.signal?.aborted;
    const fail=reason=>{const result={ok:false,requested:String(requested),reason};log.push({...result,at:new Date().toISOString()});if(log.length>40)log.shift();return result;};
    if(!D.querySelector('.ant-tabs-tabpane-active.multiple'))return fail('not-in-multiple-page');
    let searches=0,aligned=false;
    while(Date.now()<deadline){
      if(cancel())return fail('cancelled');
      const match=resolve(requested);
      if(match.error==='ambiguous-table-id'||match.error==='duplicate-dom-row')return fail(match.error);
      if(match.row){
        const meta=getTables().find(t=>t.tableId===match.key);
        if(options.expectedGameSn&&meta?.clock?.gameSn!==options.expectedGameSn)return fail('round-changed');
        const target=targetOf(match.row,options);
        if(!target)return fail('bet-control-not-mounted');
        if(inView(target)&&aligned){
          const fresh=resolve(match.key);if(!fresh.row||fresh.row.row!==match.row.row)return fail('row-changed');
          const confirm=fresh.row.row.querySelector('.gameDesk_bet .btn-check');
          const result={ok:true,tableId:match.key,name:match.row.name,row:fresh.row.row,betArea:fresh.row.betArea,target,confirm,confirmEnabled:!!confirm&&!confirm.disabled&&confirm.getAttribute('aria-disabled')!=='true'};
          log.push({at:new Date().toISOString(),ok:true,tableId:match.key,name:match.row.name,confirmEnabled:result.confirmEnabled});if(log.length>40)log.shift();return result;
        }
        if(!aligned||!inView(target))target.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});
        aligned=true;await pause();continue;
      }
      // Off-screen rows are usually already mounted. For lazy/virtualized rows,
      // walk only the active multi-table scroll ancestor with a hard deadline.
      const pane=D.querySelector('.ant-tabs-tabpane-active.multiple');
      if(!pane)return fail('multiple-page-left');
      const scroller=[pane,...ancestors(pane)].find(e=>e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(W.getComputedStyle(e).overflowY))||D.scrollingElement;
      if(!scroller||++searches>24)return fail('table-not-found');
      const before=scroller.scrollTop,max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
      scroller.scrollTop=before>=max-2?0:Math.min(max,before+Math.max(80,scroller.clientHeight*.75));
      if(scroller.scrollTop===before&&searches>2)return fail('table-not-found');
      await pause();
    }
    return fail('scroll-timeout');
  }
  return {focus,cancel:()=>{generation++;},list:()=>list().map(r=>({name:r.name,tableId:r.tableId,candidateIds:[...r.candidateIds],betAreaPresent:!!r.betArea})),history:()=>log.map(x=>({...x})),inView};
}
  const W = window, ID = '__autobac_mt_diag__';
  const marker=W.__AUTOBAC_MT_FOREGROUND__,markerDescriptor=Object.getOwnPropertyDescriptor(W,'__AUTOBAC_MT_FOREGROUND__');
  let sameOriginParent=false;try{sameOriginParent=W.parent!==W&&W.parent.location.origin===location.origin;}catch{}
  const verifiedForeground=!!marker&&Object.isFrozen(marker)&&markerDescriptor?.value===marker&&!markerDescriptor.writable&&!markerDescriptor.configurable&&marker.kind==='autobac-mt-foreground-v1'&&marker.version===1&&marker.pathPrefix==='/mt-game'&&(location.pathname==='/mt-game'||location.pathname.startsWith('/mt-game/'))&&sameOriginParent;
  const nativeConsole=location.protocol==='https:'&&['gsa.ofalive99.net','gsb.ofalive99.net','gs1.ofalive99.net'].includes(location.hostname);
  if (!verifiedForeground&&!nativeConsole) {
    console.warn('[AutoBac MT] 請在MT原生遊戲頁或已確認的本站前景執行；未安裝診斷或面板。'); return;
  }
  const previous = typeof W.__MT_AUTOBAC_DIAG__?.report === 'function' ? W.__MT_AUTOBAC_DIAG__.report() : null;
  if (typeof W.__MT_AUTOBAC_DIAG__?.dispose === 'function') W.__MT_AUTOBAC_DIAG__.dispose();
  const oldSend = WebSocket.prototype.send, oldFetch = W.fetch, oldOpen = XMLHttpRequest.prototype.open, oldXHRSend = XMLHttpRequest.prototype.send;
  const sockets = new Map(), xhrInfo = new WeakMap(), xhrListeners = new Map();
  const network = [], important = [], clicks = [], snapshots = [], liveTables = new Map();
  let memberBalance = null, memberBalanceAt = 0;
  function officialBalance(packet) {
    const keys = ['balance','available_balance','availableBalance','wallet_balance','walletBalance'];
    const seen = new WeakSet();
    function walk(value, depth = 0) {
      if (!value || typeof value !== 'object' || depth > 5 || seen.has(value)) return null;
      seen.add(value);
      for (const key of keys) {
        const n = typeof value[key] === 'number' ? value[key] : Number(value[key]);
        if (Number.isFinite(n) && n >= 0) return n;
      }
      for (const child of Object.values(value)) {
        const found = walk(child, depth + 1);
        if (found !== null) return found;
      }
      return null;
    }
    return walk(packet);
  }
  function createMtNativeObserver() {
  const records = [], groups = new Map(), unmatched = [];
  let serial = 0;
  const actionOf = packet => typeof packet?.action === 'string' ? packet.action : packet?.action?.name || '';
  const codeOf = packet => typeof packet?.action === 'object' ? packet.action.err ?? packet.err : packet?.err;
  const groupKey = r => r.tableId && r.shoe != null && r.round != null ? `${r.tableId}|${r.shoe}|${r.round}` : null;
  function addGroup(record) {
    const key=groupKey(record); if (!key) return;
    if (!groups.has(key)) groups.set(key,{tableId:record.tableId,shoe:record.shoe,round:record.round,recordIds:[],settlement:null});
    const group=groups.get(key);if(!group.recordIds.includes(record.id))group.recordIds.push(record.id);
  }
  function consume(entry, lookup) {
    const packet=entry.data,name=actionOf(packet);
    if(entry.direction==='receive'&&name==='/api/v1/member/me/balance'&&codeOf(packet)===0) {
      const value=officialBalance(packet.msg??packet.body??packet.data??packet);
      if(value!==null){memberBalance=value;memberBalanceAt=Date.now();}
    }
    if(entry.direction==='send'&&name.endsWith('/bet')&&packet.method==='POST') {
      const body=packet.body||{},tableId=String(packet.action?.data?.table_id||''),slips=body.order?.slips;
      if(!tableId||!body.game_sn||!Array.isArray(slips)||!slips.length)return;
      const amount=slips.reduce((sum,s)=>sum+Number(s.amount),0);
      if(!Number.isFinite(amount)||amount<=0)return;
      const live=lookup(tableId);
      const identity=live?.clock?.gameSn===body.game_sn?live.clock:live?.snapshot?.gameSn===body.game_sn?live.snapshot:null;
      const row={id:++serial,at:entry.at,tableId,gameSn:String(body.game_sn),requestRoomContext:packet.action?.data?.room_id,shoe:identity?.shoe||null,round:Number.isFinite(identity?.round)?identity.round:null,amount,slips:slips.map(s=>({playId:String(s.play_id),amount:Number(s.amount)})),state:'sent',source:'observed-native-client'};
      records.push(row);addGroup(row);return;
    }
    if(entry.direction==='receive'&&name.endsWith('/bet')) {
      const tableId=String(packet.msg?.table||'');
      if(!tableId)return;
      const candidates=records.filter(r=>r.tableId===tableId&&r.state==='sent'&&Date.parse(entry.at)>=Date.parse(r.at)&&Date.parse(entry.at)-Date.parse(r.at)<15000);
      // The actual MT acknowledgement has only msg.table, not game_sn/order id.
      // Never guess an amount when multiple sends for that table are unresolved.
      if(candidates.length!==1){if(candidates.length>1)for(const r of candidates)r.reviewReason='同桌有多筆未回覆，ACK未提供game_sn，無法唯一歸屬';return;}
      const row=candidates[0],code=codeOf(packet);
      if(code===0){row.state='accepted';row.acceptedAt=entry.at;}
      else if(typeof code==='number'){row.state='rejected';row.error=code;row.repliedAt=entry.at;}
      else row.reviewReason='回覆缺少明確err成功碼';
      return;
    }
    if(entry.direction==='receive'&&name==='/api/v1/member/me/win'&&codeOf(packet)===0) {
      const span=packet.msg?.span,points=span?.points;
      if(!span?.table_id||span.shoe==null||span.round==null||typeof points!=='number'||!Number.isFinite(points))return;
      const key=`${span.table_id}|${span.shoe}|${Number(span.round)}`,group=groups.get(key);
      if(!group||!records.some(r=>group.recordIds.includes(r.id)&&r.state==='accepted')){
        if(!unmatched.some(x=>x.key===key&&x.points===points))unmatched.push({key,points,at:entry.at,reason:'未找到本次觀察到的同桌同靴同局已接受下注'});
        return;
      }
      group.settlement={points,at:entry.at,source:'/api/v1/member/me/win',scope:'個人本桌本局合計，不是每筆加注各自的損益'};
    }
  }
  function report() {
    const rows=records.map(r=>({...r,slips:r.slips.map(s=>({...s}))}));
    const grouped=[...groups.values()].map(g=>{
      const rs=records.filter(r=>g.recordIds.includes(r.id));
      return {...g,recordIds:[...g.recordIds],acceptedAmount:rs.filter(r=>r.state==='accepted').reduce((s,r)=>s+r.amount,0),unresolved:rs.filter(r=>r.state==='sent').length,settlement:g.settlement?{...g.settlement}:null};
    });
    return {records:rows,groups:grouped,unmatchedSettlements:[...unmatched],acceptedCount:records.filter(r=>r.state==='accepted').length,settledGroupCount:grouped.filter(g=>g.settlement).length,observedGroupPoints:grouped.reduce((s,g)=>s+(g.settlement?.points||0),0),memberBalance:typeof memberBalance==='number'&&Date.now()-memberBalanceAt<120000?memberBalance:null,memberBalanceAt,limits:'只核對已觀察到的原生操作；同桌多筆並行未回覆不猜ACK歸屬；個人win按桌/靴/局合計且去重，不使用全桌betinfo或show_win推算個人損益。'};
  }
  return {consume,report};
}
  const observations = createMtNativeObserver();
  const stats = {total:0, ordinaryDropped:0, importantDropped:0};
  const importantAction = name => (!/\/betinfo$/.test(name) || /\/member\/me\//.test(name)) && /(?:bet|order|slip|history|member\/me\/win)/i.test(name);
  const roadResult = n => ({1:'閒',2:'莊',3:'和'})[Number(n)] || null;
  function bead(raw) {
    if (Array.isArray(raw)) return raw.map(x=>roadResult(x?.winner??x?.result??x)).filter(Boolean);
    if (typeof raw !== 'string') return [];
    const digits=raw.replace(/[^0-9]/g,'');const result=[];
    for(let i=1;i<digits.length;i+=2){const r=roadResult(digits[i]);if(r)result.push(r);}
    return result;
  }
  function nativeTables(packet, at) {
    const name=typeof packet?.action==='string'?packet.action:packet?.action?.name || '';
    const collection=packet?.msg?.tables;
    const list=Array.isArray(collection)?collection:Array.isArray(collection?.tables)?collection.tables:[];
    if (/\/(?:tables|tablesvg)$/.test(name)) {
      for(const item of list) {
        if (!item?.table_id || (item.table_type && !['BAC','BACCARAT','BAS'].includes(String(item.table_type).toUpperCase()))) continue;
        const id=String(item.table_id),old=liveTables.get(id)||{tableId:id};
        const t=item.trend||{};
        const raw=t.bead_plate2??t.bead_plate;
        const snapshot={at,shoe:String(t.current_shoe??item.shoe??''),round:Number(t.current_round??item.round??0),gameSn:item.game_sn??item.game_id??null};
        if (raw != null) {snapshot.rawRoad=raw;snapshot.results=bead(raw);snapshot.roadVerifiedAgainstTotals=Number(t.total_round||snapshot.results.length)===snapshot.results.length;}
        else if(old.snapshot){snapshot.rawRoad=old.snapshot.rawRoad;snapshot.results=old.snapshot.results;snapshot.roadSourceAt=old.snapshot.roadSourceAt||old.snapshot.at;}
        liveTables.set(id,{...old,name:item.table_name??old.name??id,roomId:String(item.room_id??old.roomId??''),snapshot});
      }
    }
    const body=packet?.body;
    if(!body?.table_id)return;
    const id=String(body.table_id),old=liveTables.get(id)||{tableId:id};
    if (/\/(wait|ready|end)$/.test(name)) {
      const phase=name.split('/').pop();
      liveTables.set(id,{...old,roomId:String(body.room_id??old.roomId??''),clock:{at,phase,shoe:String(body.shoe??''),round:Number(body.round),gameSn:body.game_sn??null,count:phase==='wait'&&Number.isFinite(Number(body.count))?Number(body.count):null}});
    } else if(name.endsWith('/show_win')) {
      liveTables.set(id,{...old,lastTableResult:{at,shoe:String(body.shoe??''),round:Number(body.round),winner:body.winner,result:roadResult(body.winner)},clock:old.clock?{...old.clock,at,phase:'show_win',count:null}:null});
    }
  }
  function tableData() {
    return [...liveTables.values()].map(t=>({...t,countdown:t.clock?.phase==='wait'&&Date.now()-Date.parse(t.clock.at)<3500?t.clock.count:null,snapshotMatchesClock:t.snapshot&&t.clock?t.snapshot.shoe===t.clock.shoe&&t.snapshot.round===t.clock.round:null}));
  }
  function structure(element,depth=0,budget={count:0}) {
    if(!element || depth>9 || ++budget.count>220)return null;
    if(['SCRIPT','STYLE'].includes(element.tagName))return null;
    const out={tag:element.tagName,class:clean(element.className).slice(0,180),id:element.id||'',role:element.getAttribute('role')||'',state:element.getAttribute('data-state'),disabled:!!element.disabled||element.getAttribute('aria-disabled')==='true'};
    if(element.tagName==='SVG'||element.tagName==='svg'||/road/i.test(String(element.className||'')))return {...out,subtree:'已略過圖形/牌路，保留網路原始牌路'};
    out.text=[...element.childNodes].filter(n=>n.nodeType===3).map(n=>clean(n.textContent)).join(' ').slice(0,100);
    out.children=[...element.children].map(n=>structure(n,depth+1,budget)).filter(Boolean);
    return out;
  }
  function scopedCards() {
    return [...document.querySelectorAll('.gameDesk')].slice(0,100).map(card=>{
      const row=card.closest('.gameDesk_wrap');
      const scope=row&&row.querySelectorAll('.gameDesk').length===1?row:card;
      const label=clean(card.querySelector('.gameDesk_tag,.gameDesk_tag_live')?.textContent);
      const name=label.match(/\bB\d{2}[A-Z]?(?:-L)?\b/i)?.[0]||null;
      const candidates=tableData().filter(t=>t.name===name);
      return {label,name,exactTableId:candidates.length===1?candidates[0].tableId:null,candidateTableIds:candidates.map(t=>t.tableId),controls:[...scope.querySelectorAll('button')].map(element),structure:structure(scope)};
    });
  }
  function retain(entry) {
    stats.total++;network.push(entry);
    if(network.length>300){network.shift();stats.ordinaryDropped++;}
    if(entry.direction==='receive')nativeTables(entry.data,entry.at);
    observations.consume(entry,id=>liveTables.get(id));
    if(entry.actions.some(importantAction)){
      important.push(entry);
      if(important.length>500){important.shift();stats.importantDropped++;}
    }
  }
  if(previous){
    for(const entry of previous.network||[])retain(entry);
    for(const entry of previous.importantNetwork||[]){if(!important.some(x=>x.at===entry.at&&x.direction===entry.direction))important.push(entry);}
  }
  // The same-origin proxy installs a getter-backed observer before the vendor
  // app. Replay only its bounded, real received socket data; it never fakes
  // authentication handlers or sends a packet.
  for(const entry of W.__AUTOBAC_MT_EARLY_WS__?.records||[]){
    if(entry?.direction==='receive'&&typeof entry.data==='string')void capture('receive','WebSocket',entry.endpoint,entry.data);
  }
  const started = Date.now(), nav = {state:'waiting',target:null,requestedAt:null};
  let disposed = false, seq = 0, lastSnapshot = '', note = '一次收集：畫面、入口、牌路及原生注單回覆';
  const root = document.createElement('section'), css = document.createElement('style'); root.id = ID;
  css.textContent = `#${ID}{position:fixed;right:14px;top:80px;z-index:2147483647;width:290px;max-width:calc(100vw - 24px);padding:14px;border:1px solid #546b4c;border-radius:13px;background:#12231ef5;color:#e9efdf;font:12px/1.5 system-ui;box-shadow:0 14px 35px #0008}#${ID} *{box-sizing:border-box}#${ID} header{display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:move;touch-action:none}#${ID} b{font-size:14px}#${ID} small{color:#9cb197}#${ID} .ab-tag{font-size:9px;color:#c9dcb6;background:#28402c;border-radius:5px;padding:3px 6px}#${ID} .ab-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#${ID} .ab-grid div{background:#1c3227;border:1px solid #344d36;border-radius:7px;padding:8px}#${ID} .ab-grid span{display:block;font-size:15px;font-weight:650}#${ID} .ab-state{margin-top:9px;font-size:10px;color:#b1c4a9;white-space:pre-wrap;overflow-wrap:anywhere}#${ID} button{border:1px solid #526c44;background:#314a32;border-radius:6px;padding:8px;color:#e2ecd5;font:inherit;cursor:pointer}#${ID} button:active{opacity:.7;transform:translateY(1px)}#${ID} .ab-close{margin-left:auto;padding:4px 7px;border:0;background:none}#${ID} .ab-buttons{display:flex;gap:7px;margin-top:11px}#${ID} .ab-buttons button{flex:1}#${ID}[data-mini=true] .ab-body{display:none}`;
  root.innerHTML = `<header><b>AutoBac · MT</b><span class="ab-tag">一次完整診斷</span><button class="ab-close">−</button></header><div class="ab-body"><div class="ab-grid"><div><small>桌台</small><span data-v="table">—</span></div><div><small>倒數</small><span data-v="count">—</span></div><div><small>靴號</small><span data-v="shoe">—</span></div><div><small>局號</small><span data-v="round">—</span></div></div><div class="ab-state" data-v="state"></div><div class="ab-buttons"><button data-v="copy">複製完整報告</button><button data-v="remove">移除</button></div><div class="ab-state">支援原生多台頁自動定位/捲動。仍是診斷版，不自動下注；不進房、不返回。</div></div>`;
  document.head.append(css); document.body.append(root);
  const clean = v => String(v ?? '').replace(/\s+/g,' ').trim();
  const sensitive = /pass|token|authorization|cookie|session|secret|signature|username|nickname|user_id|member_id|realname|avatar|email|phone|address|jwt/i;
  function safeURL(value) { try { const u = new URL(value,location.href); return u.origin + u.pathname; } catch { return '[未知來源]'; } }
  function redact(value,depth=0,path='') {
    if (depth>12) return '[深度限制]';
    if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.slice(0,300).map(v=>redact(v,depth+1,path));
    if (typeof value === 'object') {
      const out={}; for(const [key,v] of Object.entries(value).slice(0,300)) out[key]=sensitive.test(key)?'[已遮罩]':redact(v,depth+1,`${path}.${key}`);
      return out;
    }
    const str=String(value);
    if (/^\s*[\[{]/.test(str)) { try{return redact(JSON.parse(str),depth+1,path);}catch{} }
    if (/^https?:\/\//i.test(str)||/^wss?:\/\//i.test(str)) return safeURL(str);
    if (!/road|bead|trend/i.test(path) && /^[A-Za-z0-9+/=_-]{100,}$/.test(str)) return '[不透明長字串已遮罩]';
    return str.slice(0,5000);
  }
  function visible(e) {
    if(!e || root.contains(e))return false;
    const r=e.getBoundingClientRect(),s=getComputedStyle(e);
    return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';
  }
  function element(e) {
    const r=e.getBoundingClientRect();
    return {tag:e.tagName,id:e.id||'',class:clean(e.className).slice(0,200),text:clean(e.innerText||e.textContent).slice(0,200),aria:e.getAttribute('aria-label')||'',title:e.getAttribute('title')||'',role:e.getAttribute('role')||'',selected:e.getAttribute('aria-selected'),disabled:!!e.disabled||e.getAttribute('aria-disabled')==='true',x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)};
  }
  const read = selector => clean(document.querySelector(selector)?.textContent);
  function room() {
    const anchor=read('.anchorInfo'),tableInfo=read('.changeTable_info'),count=read('#videoRange .reciprocal span');
    return {table:tableInfo.match(/\bB\d{2}[A-Z]?(?:-L)?\b/i)?.[0]||null,shoe:anchor.match(/靴\s*(\d+)/)?.[1]||null,round:anchor.match(/局\s*(\d+)/)?.[1]||null,countdown:/^\d+$/.test(count)?Number(count):null,alert:read('.bet_section_center .alert-wrap').slice(0,160),anchor,tableInfo};
  }
  function inspect() {
    return {at:new Date().toISOString(),room:room(),buttons:[...document.querySelectorAll('button,[role=tab],.ant-tabs-tab-btn')].filter(visible).slice(0,100).map(element),chips:[...document.querySelectorAll('[class]')].filter(e=>/(?:^|\s)chip-\d+(?=\s|$)/.test(String(e.className||''))&&visible(e)).map(element),betAreas:[...document.querySelectorAll('.bet_section_center li')].filter(visible).map(e=>({caption:clean(e.querySelector('.caption')?.textContent),state:e.getAttribute('data-state'),target:element(e),chipTarget:e.querySelector('.chip-')?element(e.querySelector('.chip-')):null})),tables:[...document.querySelectorAll('.gameDesk')].slice(0,100).map(e=>({card:element(e),tag:clean(e.querySelector('.gameDesk_tag,.gameDesk_tag_live')?.textContent),state:e.getAttribute('data-state'),roadContainers:[...e.querySelectorAll('[class*=road]')].slice(0,12).map(n=>({class:clean(n.className),children:n.children.length,canvases:n.querySelectorAll('canvas').length}))})),canvas:[...document.querySelectorAll('canvas')].map(element),inputs:[...document.querySelectorAll('input,select')].filter(visible).map(e=>({tag:e.tagName,type:e.type,id:e.id,name:e.name,placeholder:e.getAttribute('placeholder')||''})),frames:document.querySelectorAll('iframe').length};
  }
  function snapshot(force=false) {
    const r=room(),key=JSON.stringify([r.table,r.shoe,r.round,r.alert,document.querySelectorAll('.gameDesk').length]);
    if(force||key!==lastSnapshot){lastSnapshot=key;snapshots.push(inspect());if(snapshots.length>35)snapshots.shift();}
  }
  function actions(packet) {
    const out=[];function walk(v,d=0){if(d>5||v==null)return;if(typeof v==='object'){for(const [k,x] of Object.entries(v)){if(sensitive.test(k))continue;if(['name','action','path','api','event'].includes(k)&&typeof x==='string'&&/^\//.test(x))out.push(x);if(typeof x==='object')walk(x,d+1);}}}walk(packet);return [...new Set(out)];
  }
  async function capture(direction,transport,endpoint,body) {
    if(disposed)return;
    try {
      let raw=typeof body==='string'?body:body instanceof Blob?await body.text():body instanceof ArrayBuffer||ArrayBuffer.isView(body)?new TextDecoder().decode(body):null;
      const packet=raw==null?(typeof body==='object'?body:null):raw.length<=5000000?JSON.parse(raw):null;
      if(!packet||disposed)return;
      const names=actions(packet);
      if(names.some(a=>/authenticate|\/ping$|\/member\/me$|\/member\/me\/balance$/.test(a)))return;
      const entry={at:new Date().toISOString(),direction,transport,endpoint:safeURL(endpoint),actions:names,data:redact(packet)};
      retain(entry);
      note=`已觀察 ${stats.total} 份訊息 · 注單關鍵 ${important.length} 份`;
      // Do not label any packet as an accepted bet until its schema is verified.
    } catch { /* Non-JSON/media/proprietary binary is not falsely presented as decoded data. */ }
  }
  function attach(socket) {
    if(disposed||sockets.has(socket))return;
    try{const u=new URL(socket.url);if(!/(^|\.)ofalive99\.net$/i.test(u.hostname)||!/^\/game\/ws\/?$/.test(u.pathname))return;}catch{return;}
    const message=e=>void capture('receive','WebSocket',socket.url,e.data),close=()=>{note='原生遊戲連線已關閉；診斷不會重連。';};
    socket.addEventListener('message',message);socket.addEventListener('close',close);
    sockets.set(socket,{id:++seq,message,close});
  }
  function send(data) { const result=Reflect.apply(oldSend,this,[data]);try{attach(this);void capture('send','WebSocket',this.url,data);}catch{}return result; }
  WebSocket.prototype.send=send;
  function relevant(url) { try{const u=new URL(url,location.href);return /(^|\.)ofalive99\.net$/i.test(u.hostname)&&/bet|table|road|game|member\/me\/win/i.test(u.pathname)&&!(/\.(?:js|css|flv|mp4|ts|png|jpg|svg|woff2?)$/i.test(u.pathname));}catch{return false;} }
  function fetchWrap(...args) {
    const p=Reflect.apply(oldFetch,this,args),url=typeof args[0]==='string'?args[0]:args[0]?.url;
    if(relevant(url))void p.then(response=>response.clone().json().then(data=>capture('receive','fetch',url,data))).catch(()=>{});
    return p;
  }
  if(typeof oldFetch==='function')W.fetch=fetchWrap;
  function open(method,url,...rest){const result=Reflect.apply(oldOpen,this,[method,url,...rest]);xhrInfo.set(this,{method,url});return result;}
  function xhrSend(...args){const info=xhrInfo.get(this);if(info&&relevant(info.url)&&!xhrListeners.has(this)){const handler=()=>{try{void capture('receive','XHR',info.url,this.responseType==='json'?this.response:this.responseText);}catch{}};this.addEventListener('load',handler);xhrListeners.set(this,handler);}return Reflect.apply(oldXHRSend,this,args);}
  XMLHttpRequest.prototype.open=open;XMLHttpRequest.prototype.send=xhrSend;
  function click(e) {
    if(root.contains(e.target))return;
    const chain=[];let n=e.target;
    for(let i=0;i<6&&n?.getBoundingClientRect;i++,n=n.parentElement)chain.push(element(n));
    clicks.push({at:new Date().toISOString(),trusted:e.isTrusted,x:Math.round(e.clientX),y:Math.round(e.clientY),chain});if(clicks.length>80)clicks.shift();
    snapshot(true);
  }
  document.addEventListener('click',click,true);
  function enterMulti() {
    if(nav.state==='verified'||nav.state==='unavailable'||nav.state==='ambiguous')return;
    const tabs=[...document.querySelectorAll('[role=tab]')].filter(visible);
    if(tabs.some(e=>/^(多台|多桌|多桌廳|多台廳)$/.test(clean(e.textContent))&&e.getAttribute('aria-selected')==='true')){nav.state='verified';return;}
    if(nav.requestedAt){if(Date.now()-nav.requestedAt>15000)nav.state='clicked-unverified';return;}
    if(Date.now()-started>25000){nav.state='unavailable';return;}
    const candidates=[...new Set([...document.querySelectorAll('button,[role=tab],.ant-tabs-tab-btn')].filter(e=>visible(e)&&/^(多台|多桌|多桌廳|多台廳)$/.test(clean(e.textContent))).map(e=>e.closest('[role=tab]')||e))].filter(e=>!e.disabled&&e.getAttribute('aria-disabled')!=='true');
    if(candidates.length>1){nav.state='ambiguous';return;}
    if(candidates.length===1){nav.target=element(candidates[0]);nav.state='clicked';nav.requestedAt=Date.now();candidates[0].click();snapshot(true);}
  }
  function report(){snapshot(true);return {version:'MT-DIAG-0.4',started:new Date(started).toISOString(),origin:location.origin,context:{isTop:W===W.top,title:document.title.slice(0,80)},navigation:{...nav},current:inspect(),snapshots:[...snapshots],clicks:[...clicks],network:[...network],importantNetwork:[...important],captureStats:{...stats},liveTables:tableData(),scopedCards:scopedCards(),betObservation:observations.report(),tableViewport:{tables:tableNavigator.list(),history:tableNavigator.history()},sockets:[...sockets.entries()].map(([socket,v])=>({id:v.id,endpoint:safeURL(socket.url),readyState:socket.readyState})),limits:'只記錄已觀察到的原生訊息。普通訊息保留最近300份；注單關鍵獨立保留500份，超限數量見captureStats。可承接前版仍保留的資料，不能恢復已丟失訊息。桌台勝方不代表個人獲利；不含登入Token/密碼/Cookie，不推算下注成功。'};}
  function render(){const r=room();for(const[k,v]of Object.entries({table:r.table,count:r.countdown,shoe:r.shoe,round:r.round}))root.querySelector(`[data-v="${k}"]`).textContent=v==null?'—':String(v);root.querySelector('[data-v="state"]').textContent=`${r.alert||'觀察原生遊戲畫面'}\n多桌入口：${nav.state} · 各桌 ${liveTables.size} 桌\n${note}`;}
  const tableNavigator=createMtTableNavigator(W,tableData,()=>disposed);
  async function scrollToTable(id,options={}) {
    root.dataset.mini='true';root.querySelector('.ab-close').textContent='+';
    const result=await tableNavigator.focus(id,options);
    note=result.ok?('已定位 '+result.name+'，未執行下注'):('定位未完成：'+result.reason);render();
    return result;
  }
  const timer=setInterval(()=>{enterMulti();snapshot();render();},1000);snapshot(true);render();
  root.querySelector('.ab-close').onclick=()=>{const mini=root.dataset.mini!=='true';root.dataset.mini=String(mini);root.querySelector('.ab-close').textContent=mini?'+':'−';};
  root.querySelector('[data-v="copy"]').onclick=async()=>{const value=JSON.stringify(report(),null,2);console.log('[AutoBac MT 完整報告]',value);try{await navigator.clipboard.writeText(value);note='完整報告已複製，可一次貼回來核對。';}catch{note='瀏覽器未允許剪貼簿；請在Console複製「完整報告」。';}render();};
  let drag=null;const header=root.querySelector('header');
  header.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=root.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};header.setPointerCapture(e.pointerId);});
  header.addEventListener('pointermove',e=>{if(!drag)return;root.style.right='auto';root.style.left=Math.max(0,Math.min(innerWidth-root.offsetWidth,drag.left+e.clientX-drag.x))+'px';root.style.top=Math.max(0,Math.min(innerHeight-40,drag.top+e.clientY-drag.y))+'px';});
  header.addEventListener('pointerup',()=>drag=null);header.addEventListener('pointercancel',()=>drag=null);
  function dispose(){if(disposed)return;disposed=true;clearInterval(timer);tableNavigator.cancel();document.removeEventListener('click',click,true);if(WebSocket.prototype.send===send)WebSocket.prototype.send=oldSend;if(W.fetch===fetchWrap)W.fetch=oldFetch;if(XMLHttpRequest.prototype.open===open)XMLHttpRequest.prototype.open=oldOpen;if(XMLHttpRequest.prototype.send===xhrSend)XMLHttpRequest.prototype.send=oldXHRSend;for(const[socket,v]of sockets){socket.removeEventListener('message',v.message);socket.removeEventListener('close',v.close);}for(const[xhr,handler]of xhrListeners)xhr.removeEventListener('load',handler);sockets.clear();xhrListeners.clear();root.remove();css.remove();if(W.__MT_AUTOBAC_DIAG__?.dispose===dispose)delete W.__MT_AUTOBAC_DIAG__;}
  root.querySelector('[data-v="remove"]').onclick=dispose;W.__MT_AUTOBAC_DIAG__={report,dispose,scrollToTable,cancelScroll:()=>tableNavigator.cancel()};
  console.log('[AutoBac MT] 同頁定位與注單核對已啟動，沒有開始自動下注。可呼叫 window.__MT_AUTOBAC_DIAG__.scrollToTable("B03") 測試捲動；cancelScroll() 取消定位；dispose() 移除診斷。');
})();

}
function createMtTableNavigator(W, getTables, isDisposed = () => false) {
  const D=W.document, log=[];
  let generation=0;
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const tableName=card=>clean(card.querySelector('.gameDesk_tag,.gameDesk_tag_live')?.textContent).match(/\bB\d{2}[A-Z]?(?:-L)?\b/i)?.[0]?.toUpperCase()||null;
  function componentIds(card,row,tables) {
    const ids=new Set(),sources=new Set(),validId=id=>typeof id==='string'&&/^(BAV|BAG|SBG)[A-Z0-9_]+$/.test(id);
    const knownIds=new Set(tables.map(t=>t.tableId).filter(validId)),frameworks=new Set(),propKeys=new Set();
    const sensitive=key=>/token|pass|user|member|auth|cookie|session|secret|signature/i.test(key);
    let scannedFibers=0,boundaryStops=0;
    const result=()=>({ids:[...ids],sources:[...sources],inspection:{frameworks:[...frameworks],propKeys:[...propKeys].slice(0,30),scannedFibers,boundaryStops}});
    for(const e of [card,row])for(const key of ['data-table-id','data-table_id','table-id']){
      const id=e?.getAttribute(key);if(validId(id)){ids.add(id);sources.add('dom-attribute');}
    }
    if(ids.size)return result();
    // Only inspect bounded, row-scoped plain props. Never call handlers/getters,
    // traverse React element children/owners, or export account/session fields.
    function scan(root,source) {
      const seen=new WeakSet();let budget=0;
      function walk(value,depth=0){
        if(!value||typeof value!=='object'||depth>6||++budget>240||seen.has(value))return;
        seen.add(value);
        if(value.nodeType||value===W)return;
        let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return;}
        for(const [key,descriptor]of Object.entries(descriptors).slice(0,100)){
          if(sensitive(key))continue;
          if(depth===0&&!/^\d+$/.test(key)&&propKeys.size<30)propKeys.add(key);
          if(!('value' in descriptor))continue;
          const v=descriptor.value;
          const explicitKey=['table_id','tableId','data-table-id','data-table_id'].includes(key);
          if(explicitKey&&validId(v)){ids.add(v);sources.add(source);}
          if(['children','_owner','_store','ref','parent','return','stateNode'].includes(key))continue;
          // A field alias counts only when its entire value is an ID that the
          // current native stream actually announced; never extract from text.
          if(!explicitKey&&typeof v==='string'&&knownIds.has(v)){ids.add(v);sources.add(source+'-known-id');}
          if(v&&typeof v==='object')walk(v,depth+1);
        }
      }
      walk(root);
    }
    const anchors=[...new Set([card,row,card.querySelector('.gameDesk_tag,.gameDesk_tag_live'),row.querySelector('.gameDesk_bet'),row.querySelector('.gameDesk_bet .btn-check')].filter(Boolean))];
    for(const anchor of anchors){
      let keys=[];try{keys=Object.getOwnPropertyNames(anchor);}catch{}
      for(const key of keys.filter(k=>k.startsWith('__reactProps$'))){
        frameworks.add('react-dom-props');
        try{scan(anchor[key],'react-dom-props');}catch{}
      }
      for(const key of keys.filter(k=>k.startsWith('__reactFiber$')||k.startsWith('__reactInternalInstance$'))){
        frameworks.add('react-fiber');
        let fiber;try{fiber=anchor[key];}catch{continue;}
        for(let depth=0;fiber&&depth<10;depth++,fiber=fiber.return){
          const host=fiber.stateNode;
          if(host?.nodeType===1&&host!==row&&!row.contains(host)){boundaryStops++;break;}
          scannedFibers++;
          if(typeof fiber.key==='string'&&knownIds.has(fiber.key)){ids.add(fiber.key);sources.add('react-row-key');}
          try{scan(fiber.memoizedProps,'react-row-props');}catch{}
        }
      }
    }
    if(ids.size)return result();
    let component=card.__vueParentComponent||row?.__vueParentComponent;
    for(let depth=0;component&&depth<3;depth++,component=component.parent){
      frameworks.add('vue-row');
      const host=component.vnode?.el;
      if(host?.nodeType===1&&host!==row&&!row.contains(host)){boundaryStops++;break;}
      if(typeof component.vnode?.key==='string'&&knownIds.has(component.vnode.key)){ids.add(component.vnode.key);sources.add('vue-row-key');}
      try{scan(component.props,'vue-row-props');}catch{}
      if(ids.size)return result();
    }
    return result();
  }
  const rendered=e=>{
    if(!e?.isConnected)return false;
    for(let n=e;n;n=n.parentElement){const s=W.getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||n.hidden)return false;}
    return true;
  };
  const mobilePane=()=>D.querySelector('.multiple#mulitScroll');
  const desktopPane=()=>D.querySelector('.ant-tabs-tabpane-active.multiple');
  const activePane=()=>mobilePane()||desktopPane();
  const isMobileCard=card=>card?.closest('.multiple#mulitScroll')===mobilePane();
  const directValue=(object,key)=>{
    if(!object||typeof object!=='object')return undefined;
    try{const descriptor=Object.getOwnPropertyDescriptor(object,key);return descriptor&&'value' in descriptor?descriptor.value:undefined;}catch{return undefined;}
  };
  const unwrapRef=value=>directValue(value,'value')??directValue(value,'_value')??directValue(value,'_rawValue')??value;
  function nativeOrderMode(card,tableId,name) {
    // The public multipleLobby source keeps this per-table flag in
    // MulitGameData[table_id].immediatelyOrderType.  Do not infer a safe mode
    // from button visibility: no readable false flag means no side click.
    const components=[];
    for(const anchor of [card,...card.querySelectorAll('.gameDesk_bet_section,.gameDesk_title')]){
      let component;try{component=anchor.__vueParentComponent;}catch{}
      for(let depth=0;component&&depth<6;depth++,component=component.parent)components.push(component);
    }
    const seen=new Set();
    for(const component of components){
      if(!component||seen.has(component))continue;seen.add(component);
      for(const root of [component, directValue(component,'setupState'),directValue(component,'data'),directValue(component,'ctx'),directValue(component,'props')]){
        for(const key of ['MulitGameData','mulitGameData']){
          const data=unwrapRef(directValue(root,key));
          for(const id of [tableId,name].filter(Boolean)){
            const entry=unwrapRef(directValue(data,id));
            const flag=directValue(entry,'immediatelyOrderType');
            if(flag===true)return 'direct';if(flag===false)return 'staged';
          }
        }
      }
    }
    // In the shipped source, the table's native /wait transition writes
    // immediatelyOrderType=false and its own MulitGameData count drives this
    // data-value.  This is deliberately only a UI-state cross-check; runner
    // eligibility still requires a fresh observed native clock/road.
    return nativeCountdown(card)>=6?'staged-wait-countdown':'unverified';
  }
  function nativeCountdown(card) {
    const values=[...card.querySelectorAll('.gameDesk_title_r .countdown,.countdown')].map(e=>Number(e.getAttribute('data-value'))).filter(n=>Number.isSafeInteger(n)&&n>=0);
    return values.length===1?values[0]:null;
  }
  function nativeSide(card,side) {
    const state=side==='莊'?'zhuang':side==='閒'?'free':null;if(!state)return {error:'invalid-side'};
    const sections=[...card.querySelectorAll('.gameDesk_bet_section[data-state="classic"]')].filter(rendered);
    const slots=sections.flatMap(section=>[...section.querySelectorAll(':scope > ul > li[data-state]')].filter(rendered));
    const matches=slots.filter(li=>li.getAttribute('data-state')===state);
    if(matches.length!==1)return {error:'native-side-not-unique'};
    const li=matches[0],groups=[...li.children].filter(e=>e.classList?.contains('chip-group')&&rendered(e));
    if(groups.length!==1)return {error:'native-side-control-not-unique'};
    const buttons=kind=>[...li.querySelectorAll(`button.btn.van-button--${kind}`)].filter(e=>e.isConnected);
    const cancel=buttons('danger'),repeat=buttons('warning'),confirm=buttons('success');
    return {target:groups[0],li,cancel:cancel.length===1?cancel[0]:null,repeat:repeat.length===1?repeat[0]:null,confirm:confirm.length===1?confirm[0]:null};
  }
  function controlsOf(row,options) {
    if(row.mobile){
      const selected=options.control==='side'?nativeSide(row.card,options.side):null;
      return selected||{error:'native-control-not-mounted'};
    }
    if(options.control==='side') {
      if(!['莊','閒'].includes(options.side))return {error:'invalid-side'};
      const li=[...row.row.querySelectorAll('.gameDesk_bet li')].filter(e=>clean(e.querySelector('.caption')?.textContent)===options.side);
      if(li.length!==1)return {error:'desktop-side-not-unique'};
      const target=li[0].querySelector('.chip-group')||li[0];
      return {target,li:li[0],cancel:row.row.querySelector('.gameDesk_bet .btn-cancel'),confirm:row.row.querySelector('.gameDesk_bet .btn-check')};
    }
    return {target:row.row.querySelector('.gameDesk_bet .btn-check')||row.betArea,cancel:row.row.querySelector('.gameDesk_bet .btn-cancel'),confirm:row.row.querySelector('.gameDesk_bet .btn-check')};
  }
  function list() {
    const pane=activePane();
    if(!pane)return [];
    const mobile=pane===mobilePane(),tables=getTables();
    return [...pane.querySelectorAll('.gameDesk')].filter(card=>mobile?card.closest('.multiple#mulitScroll')===pane:true).map(card=>{
      const possible=mobile?null:card.closest('.gameDesk_wrap');
      const row=possible&&possible.querySelectorAll('.gameDesk').length===1?possible:card;
      const name=tableName(card),evidence=componentIds(card,row,tables),ids=evidence.ids;
      const named=tables.filter(t=>String(t.name||'').toUpperCase()===name);
      const explicit=ids.length===1?tables.find(t=>t.tableId===ids[0]):null;
      const tableId=explicit&&String(explicit.name||'').toUpperCase()===name?explicit.tableId:null;
      const identitySource=tableId?(explicit?evidence.sources.join('+'):'unique-network-name'):'unresolved';
      const betArea=mobile?card.querySelector('.gameDesk_bet_section[data-state="classic"]'):row.querySelector('.gameDesk_bet');
      return {name,tableId,card,row,betArea,mobile,candidateIds:named.map(t=>t.tableId),identitySource,nativeIds:ids,identityInspection:evidence.inspection,nativeCountdown:mobile?nativeCountdown(card):null,nativeOrderMode:mobile?nativeOrderMode(card,tableId,name):'not-applicable'};
    });
  }
  function resolve(requested,options={}) {
    const key=String(requested||'').toUpperCase();
    const tables=getTables(),byId=tables.find(t=>t.tableId.toUpperCase()===key);
    const rows=list();
    // Locating a unique displayed row is independent of verifying a protocol
    // ID. This explicit mode never treats BAV03/BAV03_LIVE as interchangeable.
    if(options.identity==='display'&&!byId){
      const displayed=rows.filter(r=>r.name===key);
      if(displayed.length>1)return {error:'duplicate-dom-row'};
      if(displayed.length===1)return {row:displayed[0],key:displayed[0].tableId,lookupKey:key};
      return {error:'not-mounted'};
    }
    const matches=rows.filter(r=>byId?r.tableId===byId.tableId:r.name===key&&r.tableId);
    if(matches.length===1)return {row:matches[0],key:matches[0].tableId,lookupKey:matches[0].tableId};
    if(matches.length>1)return {error:'duplicate-dom-row'};
    const ambiguous=rows.some(r=>byId?r.name===String(byId.name||'').toUpperCase()&&!r.tableId:r.name===key&&!r.tableId);
    return {error:ambiguous?'ambiguous-table-id':'not-mounted'};
  }
  function ancestors(node) {const out=[];for(let n=node?.parentElement;n;n=n.parentElement)out.push(n);return out;}
  function clipBounds(node) {
    let bounds={left:0,top:0,right:W.innerWidth,bottom:W.innerHeight};
    for(const p of ancestors(node)) {
      const style=W.getComputedStyle(p),r=p.getBoundingClientRect();
      if(/auto|scroll|hidden|clip/.test(style.overflowY)){bounds.top=Math.max(bounds.top,r.top);bounds.bottom=Math.min(bounds.bottom,r.bottom);}
      if(/auto|scroll|hidden|clip/.test(style.overflowX)){bounds.left=Math.max(bounds.left,r.left);bounds.right=Math.min(bounds.right,r.right);}
    }
    return bounds;
  }
  function inView(node) {
    if(!node?.isConnected)return false;
    const r=node.getBoundingClientRect(),b=clipBounds(node),s=W.getComputedStyle(node);
    return r.width>0&&r.height>0&&s.visibility!=='hidden'&&r.left>=b.left-1&&r.top>=b.top-1&&r.right<=b.right+1&&r.bottom<=b.bottom+1;
  }
  const pause=()=>new Promise(resolve=>W.setTimeout(resolve,35));
  async function focus(requested,options={}) {
    const run=++generation,deadline=Date.now()+Math.max(100,Math.min(10000,Number(options.timeoutMs)||4000));
    const cancel=()=>run!==generation||isDisposed()||options.signal?.aborted;
    const fail=reason=>{const result={ok:false,requested:String(requested),reason};log.push({...result,at:new Date().toISOString()});if(log.length>40)log.shift();return result;};
    if(!activePane())return fail('not-in-multiple-page');
    let searches=0,aligned=false;
    while(Date.now()<deadline){
      if(cancel())return fail('cancelled');
      const match=resolve(requested,options);
      if(match.error==='ambiguous-table-id'||match.error==='duplicate-dom-row')return fail(match.error);
      if(match.row){
        const metas=match.key?[getTables().find(t=>t.tableId===match.key)].filter(Boolean):getTables().filter(t=>String(t.name||'').toUpperCase()===match.row.name);
        const meta=metas.length===1?metas[0]:null;
        if(options.expectedGameSn&&!meta)return fail('round-unverified');
        if(options.expectedGameSn&&meta?.clock?.gameSn!==options.expectedGameSn)return fail('round-changed');
        const controls=controlsOf(match.row,options),target=controls.target;
        if(!target)return fail(controls.error||'bet-control-not-mounted');
        if(inView(target)&&aligned){
          const fresh=resolve(match.lookupKey,options);if(!fresh.row||fresh.row.row!==match.row.row)return fail('row-changed');
          if(fresh.key!==match.key)return fail('identity-changed');
          const freshControls=controlsOf(fresh.row,options),confirm=freshControls.confirm;
          if(!freshControls.target)return fail(freshControls.error||'bet-control-not-mounted');
          const result={ok:true,tableId:match.key??null,name:match.row.name,identityVerified:!!match.key,locationSource:options.identity==='display'?'unique-dom-name':'verified-table-id',row:fresh.row.row,betArea:fresh.row.betArea,target:freshControls.target,confirm,cancel:freshControls.cancel,mobile:fresh.row.mobile,nativeCountdown:fresh.row.nativeCountdown,nativeOrderMode:fresh.row.nativeOrderMode,readNativeCountdown:()=>fresh.row.mobile?nativeCountdown(fresh.row.card):null,readNativeOrderMode:()=>fresh.row.mobile?nativeOrderMode(fresh.row.card,fresh.row.tableId,fresh.row.name):'not-applicable',confirmEnabled:!!confirm&&!confirm.disabled&&confirm.getAttribute('aria-disabled')!=='true'};
          log.push({at:new Date().toISOString(),ok:true,tableId:result.tableId,name:match.row.name,identityVerified:result.identityVerified,locationSource:result.locationSource,confirmEnabled:result.confirmEnabled});if(log.length>40)log.shift();return result;
        }
        if(!aligned||!inView(target))target.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});
        aligned=true;await pause();continue;
      }
      // Off-screen rows are usually already mounted. For lazy/virtualized rows,
      // walk only the active multi-table scroll ancestor with a hard deadline.
      const pane=activePane();
      if(!pane)return fail('multiple-page-left');
      const scroller=pane===mobilePane()?pane:[pane,...ancestors(pane)].find(e=>e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(W.getComputedStyle(e).overflowY))||D.scrollingElement;
      if(!scroller||++searches>24)return fail('table-not-found');
      const before=scroller.scrollTop,max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
      scroller.scrollTop=before>=max-2?0:Math.min(max,before+Math.max(80,scroller.clientHeight*.75));
      if(scroller.scrollTop===before&&searches>2)return fail('table-not-found');
      await pause();
    }
    return fail('scroll-timeout');
  }
  return {focus,cancel:()=>{generation++;},list:()=>list().map(r=>({name:r.name,tableId:r.tableId,candidateIds:[...r.candidateIds],betAreaPresent:!!r.betArea,identitySource:r.identitySource,nativeIds:[...r.nativeIds],identityInspection:r.identityInspection,mobile:r.mobile,nativeCountdown:r.nativeCountdown,nativeOrderMode:r.nativeOrderMode})),history:()=>log.map(x=>({...x})),inView};
}
if(typeof module!=='undefined')module.exports={createMtTableNavigator};

function installMtNavigationPatch(W, makeNavigator) {
  if(!/(^|\.)ofalive99\.net$/i.test(W.location.hostname)){
    W.console.error('[AutoBac MT] 請在MT頁面本身執行定位修補。');return null;
  }
  const D=W.document,diag=W.__MT_AUTOBAC_DIAG__;
  if(!diag||typeof diag.report!=='function'||typeof diag.dispose!=='function'||!D.getElementById('__autobac_mt_diag__')){
    W.console.error('[AutoBac MT] 請先載入v0.4診斷版；此檔是定位修補，不是獨立下注程式。');return null;
  }
  if(typeof W.__MT_NAV_PATCH__?.undo==='function')W.__MT_NAV_PATCH__.undo();
  const original={report:diag.report,scrollToTable:diag.scrollToTable,cancelScroll:diag.cancelScroll,dispose:diag.dispose};
  const root=D.getElementById('__autobac_mt_diag__'),badge=root.querySelector('.ab-tag'),copyButton=root.querySelector('[data-v="copy"]'),removeButton=root.querySelector('[data-v="remove"]');
  const saved={badge:badge?.textContent,copy:copyButton?.onclick,remove:removeButton?.onclick};
  const past=original.report.call(diag).tableViewport?.history||[];
  let removed=false;
  const readTables=()=>original.report.call(diag).liveTables||[];
  const nav=makeNavigator(W,readTables,()=>removed||W.__MT_AUTOBAC_DIAG__!==diag||!root.isConnected);
  original.cancelScroll?.call(diag);
  function report(){
    const r=original.report.call(diag);
    return {...r,version:'MT-DIAG-0.4.3',tableViewport:{tables:nav.list(),history:[...past,...nav.history()].slice(-40)},navigationPatch:{version:'0.4.3',readOnly:true,preserveNativeObservation:true}};
  }
  async function scrollToTable(id,options={}){
    if(removed)return {ok:false,reason:'patch-removed'};
    root.dataset.mini='true';const close=root.querySelector('.ab-close');if(close)close.textContent='+';
    const identity=options.identity||(/^B\d{2}[A-Z]?(?:-L)?$/i.test(String(id))?'display':'verified');
    const result=await nav.focus(id,{...options,identity});
    W.console.log('[AutoBac MT 定位]',{ok:result.ok,tableId:result.tableId||null,name:result.name||null,identityVerified:result.identityVerified??false,locationSource:result.locationSource??null,reason:result.reason||null,confirmEnabled:result.confirmEnabled??null});
    return result;
  }
  const cancelScroll=()=>{nav.cancel();original.cancelScroll?.call(diag);};
  function undo(){
    if(removed)return;removed=true;cancelScroll();
    if(diag.report===report)diag.report=original.report;
    if(diag.scrollToTable===scrollToTable)diag.scrollToTable=original.scrollToTable;
    if(diag.cancelScroll===cancelScroll)diag.cancelScroll=original.cancelScroll;
    if(diag.dispose===dispose)diag.dispose=original.dispose;
    if(badge)badge.textContent=saved.badge||'';
    if(copyButton?.onclick===copyReport)copyButton.onclick=saved.copy;
    if(removeButton?.onclick===dispose)removeButton.onclick=saved.remove;
    if(W.__MT_NAV_PATCH__===api)delete W.__MT_NAV_PATCH__;
  }
  function dispose(){undo();original.dispose.call(diag);}
  async function copyReport(){
    const value=JSON.stringify(report(),null,2);W.console.log('[AutoBac MT 完整報告]',value);
    try{await W.navigator.clipboard.writeText(value);}catch{W.console.log('請用Console的copy(JSON.stringify(window.__MT_AUTOBAC_DIAG__.report(),null,2))複製。');}
  }
  const api={version:'0.4.3',undo,viewport:()=>({tables:nav.list(),history:nav.history()})};
  diag.report=report;diag.scrollToTable=scrollToTable;diag.cancelScroll=cancelScroll;diag.dispose=dispose;
  if(badge)badge.textContent='桌台辨識 0.4.3';
  if(copyButton)copyButton.onclick=copyReport;
  if(removeButton)removeButton.onclick=dispose;
  W.__MT_NAV_PATCH__=api;
  W.console.table(nav.list().map(r=>({table:r.name,screenRow:'已找到',betArea:r.betAreaPresent?'已找到':'尚未載入',nativeId:r.tableId||'待核對'})));
  W.console.log('[AutoBac MT] 畫面定位修補已載入。唯一B03名稱即可定位，不再因原生ID未知擋住捲動；沒有開始下注，原生觀察紀錄保留。');
  return api;
}
if(typeof module!=='undefined')module.exports={installMtNavigationPatch};

installMtNavigationPatch(window, createMtTableNavigator);
"use strict";
(() => {
  // lib/poker-strategies.ts
  var rankNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  function cardRank(value) {
    if (typeof value === "string" && rankNames.includes(value.toUpperCase().trim())) return value.toUpperCase().trim();
    if (typeof value !== "number" && typeof value !== "string") return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 52 ? rankNames[(n - 1) % 13] : null;
  }
  function baccaratValue(card) {
    const n = rankNames.indexOf(card) + 1;
    return n > 0 && n < 10 ? n : 0;
  }
  function handPoint(cards) {
    return cards.reduce((sum, c) => sum + baccaratValue(c), 0) % 10;
  }
  function completePoker(hand) {
    const { player: p, banker: b } = hand;
    if (p.length < 2 || p.length > 3 || b.length < 2 || b.length > 3 || ![...p, ...b].every((c) => rankNames.includes(c))) return false;
    const pp = handPoint(p.slice(0, 2)), bp = handPoint(b.slice(0, 2));
    if (pp >= 8 || bp >= 8) return p.length === 2 && b.length === 2;
    const pd = pp <= 5;
    if (p.length !== (pd ? 3 : 2)) return false;
    const third = pd ? baccaratValue(p[2]) : -1;
    const bd = !pd ? bp <= 5 : bp <= 2 || bp === 3 && third !== 8 || bp === 4 && third >= 2 && third <= 7 || bp === 5 && third >= 4 && third <= 7 || bp === 6 && (third === 6 || third === 7);
    return b.length === (bd ? 3 : 2);
  }
  function mtPokerHand(raw) {
    if (!Array.isArray(raw) || raw.length < 4 || raw.length > 10) return null;
    const values = raw.map((v) => typeof v === "number" ? v : NaN);
    if (values.slice(0, 6).some((v) => !Number.isInteger(v) || v < 0 || v > 52)) return null;
    const read = (indexes) => indexes.map((i) => values[i] ?? 0).filter((v) => v !== 0).map(cardRank);
    const p = read([0, 2, 4]), b = read([1, 3, 5]);
    if (!p.every((v) => v !== null) || !b.every((v) => v !== null)) return null;
    const hand = { player: p, banker: b };
    if (!completePoker(hand)) return null;
    if (values.length >= 10 && (values[8] !== handPoint(p) || values[9] !== handPoint(b))) return null;
    return hand;
  }
  function pokerDecision(strategy, hand) {
    if (!hand || !completePoker(hand)) return { ok: false, reason: "\u7B49\u5F85\u540C\u684C\u540C\u9774\u4E0A\u4E00\u5C40\u5B8C\u6574\u5BE6\u969B\u724C\u5F35\uFF1B\u4E0D\u4EE5\u724C\u8DEF\u6216\u9EDE\u6578\u4EE3\u66FF" };
    const all = [...hand.player, ...hand.banker];
    if (strategy === "parity") {
      const values = all.map((c) => rankNames.indexOf(c) + 1), total = values.reduce((a, b) => a + b, 0);
      const first = Math.floor(total / 10) + total % 10, terminal = first >= 10 ? first % 10 : first;
      const side = terminal % 2 === 0 ? "\u838A" : "\u9592";
      return { ok: true, side, confidence: 0, reason: `\u7D42\u503C\u5947\u5076\uFF1A${all.join("\u3001")}\uFF1B\u724C\u9762\u7E3D\u548C ${total} \u2192 ${first} \u2192 ${terminal}\uFF1B${terminal % 2 === 0 ? "\u5076\u838A" : "\u5947\u9592"}\uFF08\u539F\u516C\u5F0F\uFF0C\u975E\u52DD\u7387\uFF09` };
    }
    const sum = all.reduce((n, c) => n + baccaratValue(c), 0), pb = handPoint(hand.banker), pp = handPoint(hand.player);
    const votes = [sum % 3 === 0 ? "\u838A" : "\u9592", sum % 2 === 0 ? "\u838A" : "\u9592", pb * pp % 2 === 0 ? "\u838A" : "\u9592", (pb + pp) % 2 === 0 ? "\u838A" : "\u9592"];
    const bankers = votes.filter((v) => v === "\u838A").length;
    const reason = `V38\u56DB\u5F0F\uFF1AA ${votes[0]}\uFF0FB ${votes[1]}\uFF0F\u4E58 ${votes[2]}\uFF0F\u52A0 ${votes[3]}\uFF1B\u838A ${bankers}\uFF1A\u9592 ${4 - bankers}\uFF08\u539F\u516C\u5F0F\uFF0C\u975E\u5269\u724C\u6A5F\u7387\uFF09`;
    if (bankers === 2) return { ok: false, reason: reason + "\uFF1B\u540C\u7968\u89C0\u671B\uFF0C\u4E0D\u4E0B\u6CE8" };
    return { ok: true, side: bankers > 2 ? "\u838A" : "\u9592", confidence: Math.max(bankers, 4 - bankers) * 25, reason };
  }
  function mtPreviousPoker(table, shoe, nextRound) {
    const p = table?.lastPoker;
    if (!p || p.tableId !== table.tableId || p.shoe !== shoe || p.round !== nextRound - 1 || p.conflict) return null;
    return mtPokerHand(p.slots);
  }

  // lib/road-render.ts
  var cellKey = (col, row) => `${col}:${row}`;
  function buildBigRoadState(results) {
    const marks = [];
    const columns = [];
    const occupied = /* @__PURE__ */ new Set();
    let previous = null;
    let logicalCol = -1;
    let baseDisplayCol = -1;
    let last = null;
    let turned = false;
    let tailRow = 0;
    let pendingTies = 0;
    for (const raw of results) {
      if (raw === "\u548C") {
        if (last) last.tieCount = (last.tieCount ?? 0) + 1;
        else pendingTies += 1;
        continue;
      }
      const result2 = raw;
      const newColumn = result2 !== previous;
      let row = 0;
      let col = 0;
      let logicalRow = 0;
      if (newColumn) {
        logicalCol += 1;
        logicalRow = 0;
        columns[logicalCol] = { result: result2, length: 1 };
        baseDisplayCol += 1;
        while (occupied.has(cellKey(baseDisplayCol, 0))) baseDisplayCol += 1;
        col = baseDisplayCol;
        row = 0;
        turned = false;
        tailRow = 0;
      } else {
        logicalRow = columns[logicalCol]?.length ?? 1;
        columns[logicalCol].length = logicalRow + 1;
        if (!last) {
          col = Math.max(0, baseDisplayCol);
          row = 0;
        } else if (turned) {
          row = tailRow;
          col = last.col + 1;
          while (occupied.has(cellKey(col, row))) col += 1;
        } else {
          const downRow = last.row + 1;
          if (downRow <= 5 && !occupied.has(cellKey(last.col, downRow))) {
            col = last.col;
            row = downRow;
          } else {
            turned = true;
            tailRow = last.row;
            row = tailRow;
            col = last.col + 1;
            while (occupied.has(cellKey(col, row))) col += 1;
          }
        }
      }
      const mark = {
        row,
        col,
        result: result2,
        logicalCol,
        logicalRow,
        isNewColumn: newColumn
      };
      if (pendingTies) {
        mark.tieCount = pendingTies;
        pendingTies = 0;
      }
      marks.push(mark);
      occupied.add(cellKey(col, row));
      last = mark;
      previous = result2;
    }
    return { marks, columns };
  }
  function placeDerived(sequence, filled) {
    const marks = [];
    const occupied = /* @__PURE__ */ new Set();
    let previous = null;
    let baseCol = -1;
    let last = null;
    let turned = false;
    let tailRow = 0;
    for (const result2 of sequence) {
      if (!last || result2 !== previous) {
        baseCol += 1;
        while (occupied.has(cellKey(baseCol, 0))) baseCol += 1;
        const m2 = { row: 0, col: baseCol, result: result2, filled };
        marks.push(m2);
        occupied.add(cellKey(m2.col, m2.row));
        last = m2;
        previous = result2;
        turned = false;
        tailRow = 0;
        continue;
      }
      let row, col;
      if (turned) {
        row = tailRow;
        col = last.col + 1;
        while (occupied.has(cellKey(col, row))) col += 1;
      } else {
        const down = last.row + 1;
        if (down <= 5 && !occupied.has(cellKey(last.col, down))) {
          row = down;
          col = last.col;
        } else {
          turned = true;
          tailRow = last.row;
          row = tailRow;
          col = last.col + 1;
          while (occupied.has(cellKey(col, row))) col += 1;
        }
      }
      const m = { row, col, result: result2, filled };
      marks.push(m);
      occupied.add(cellKey(col, row));
      last = m;
    }
    return marks;
  }
  function buildDerivedRoad(results, offset, filled) {
    const { marks, columns } = buildBigRoadState(results);
    const colors = [];
    for (const mark of marks) {
      const c = mark.logicalCol ?? 0;
      const r = mark.logicalRow ?? 0;
      let color = null;
      if (r === 0) {
        const a = c - 1;
        const b = c - offset - 1;
        if (b >= 0) color = columns[a]?.length === columns[b]?.length ? "\u838A" : "\u9592";
      } else {
        const ref = c - offset;
        if (ref >= 0) {
          const len = columns[ref]?.length ?? 0;
          const sameRowOccupied = len > r;
          const aboveOccupied = len > r - 1;
          color = sameRowOccupied === aboveOccupied ? "\u838A" : "\u9592";
        }
      }
      if (color) colors.push(color);
    }
    return placeDerived(colors, filled);
  }
  function nextDerivedColor(results, outcome, offset, filled) {
    const before = buildDerivedRoad(results, offset, filled);
    const after = buildDerivedRoad([...results, outcome], offset, filled);
    return after.length > before.length ? after.at(-1)?.result ?? null : null;
  }
  function buildAskRoad(results) {
    const predict = (outcome) => ({
      bigEye: nextDerivedColor(results, outcome, 1, false),
      small: nextDerivedColor(results, outcome, 2, true),
      cockroach: nextDerivedColor(results, outcome, 3, false)
    });
    return { banker: predict("\u838A"), player: predict("\u9592") };
  }

  // lib/dg-original-ai.ts
  function roadSides(results) {
    return results.filter((r) => r === "\u838A" || r === "\u9592");
  }
  function columnRuns(results) {
    const seq = roadSides(results);
    const runs = [];
    for (const side of seq) {
      const last = runs[runs.length - 1];
      if (last?.side === side) last.length += 1;
      else runs.push({ side, length: 1 });
    }
    return runs;
  }
  function tailAlternating(runs, size, len) {
    if (runs.length < size) return false;
    const x = runs.slice(-size);
    return x.every((r) => r.length === len) && x.every((r, i) => i === 0 || r.side !== x[i - 1].side);
  }
  function getPatternInfo(results) {
    const seq = roadSides(results);
    const runs = columnRuns(results);
    if (seq.length < 3 || !runs.length)
      return { type: "\u8CC7\u6599\u7D2F\u7A4D\u4E2D", label: "\u8CC7\u6599\u7D2F\u7A4D\u4E2D" };
    const lastRun = runs[runs.length - 1];
    if (lastRun.length >= 4)
      return {
        type: "\u9023\u9F8D",
        label: `${lastRun.side}\u9F8D${lastRun.length}\u9846`,
        side: lastRun.side,
        run: lastRun.length
      };
    if (tailAlternating(runs, 4, 1))
      return { type: "\u55AE\u8DF3", label: "\u55AE\u8DF3", side: lastRun.side };
    if (tailAlternating(runs, 3, 2))
      return { type: "\u96D9\u8DF3", label: "\u96D9\u8DF3", side: lastRun.side };
    if (runs.length >= 6) {
      const x = runs.slice(-6);
      const twoPlayerOneBanker = x[0].side === "\u9592" && x[0].length === 2 && x[1].side === "\u838A" && x[1].length === 1 && x[2].side === "\u9592" && x[2].length === 2 && x[3].side === "\u838A" && x[3].length === 1 && x[4].side === "\u9592" && x[4].length === 2 && x[5].side === "\u838A" && x[5].length === 1;
      const twoBankerOnePlayer = x[0].side === "\u838A" && x[0].length === 2 && x[1].side === "\u9592" && x[1].length === 1 && x[2].side === "\u838A" && x[2].length === 2 && x[3].side === "\u9592" && x[3].length === 1 && x[4].side === "\u838A" && x[4].length === 2 && x[5].side === "\u9592" && x[5].length === 1;
      if (twoPlayerOneBanker)
        return { type: "\u4E00\u623F\u5169\u5EF3", label: "\u5169\u9592\u4E00\u838A", side: "\u9592" };
      if (twoBankerOnePlayer)
        return { type: "\u4E00\u623F\u5169\u5EF3", label: "\u5169\u838A\u4E00\u9592", side: "\u838A" };
    }
    if (lastRun.length >= 2)
      return {
        type: "\u4E00\u822C\u9023",
        label: `${lastRun.side}\u9023${lastRun.length}`,
        side: lastRun.side,
        run: lastRun.length
      };
    return { type: "\u6DF7\u5408", label: "\u8F49\u578B\uFF0F\u6DF7\u5408\u8DEF", side: lastRun.side };
  }
  function derivedTailPreference(results, offset) {
    const marks = buildDerivedRoad(results, offset, offset === 2);
    if (!marks.length) return null;
    const seq = marks.map((m) => m.result).filter((r) => r === "\u838A" || r === "\u9592");
    if (!seq.length) return null;
    const last = seq[seq.length - 1];
    let run = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) run++;
    if (run >= 2) return last;
    if (seq.length >= 4) {
      const x = seq.slice(-4);
      if (x[0] !== x[1] && x[1] !== x[2] && x[2] !== x[3])
        return last === "\u838A" ? "\u9592" : "\u838A";
    }
    const tail = seq.slice(-8);
    let same = 0, change = 0;
    for (let i = 1; i < tail.length; i++)
      tail[i] === tail[i - 1] ? same++ : change++;
    return change > same ? last === "\u838A" ? "\u9592" : "\u838A" : last;
  }
  function roadDecision(results) {
    const seq = roadSides(results);
    if (!seq.length)
      return {
        side: "\u838A",
        scoreBanker: 0,
        scorePlayer: 0,
        reason: "\u7B49\u5F85\u724C\u8DEF\u8CC7\u6599"
      };
    const info = getPatternInfo(results);
    const ask = buildAskRoad(results);
    const prefs = [
      derivedTailPreference(results, 1),
      derivedTailPreference(results, 2),
      derivedTailPreference(results, 3)
    ];
    const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
    const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];
    let b = 0, p = 0;
    prefs.forEach((pref, i) => {
      if (!pref) return;
      if (bankerAsk[i] === pref) b += 2;
      if (playerAsk[i] === pref) p += 2;
    });
    const runs = columnRuns(results);
    const last = seq[seq.length - 1];
    if (info.type === "\u9023\u9F8D") {
      if (last === "\u838A") b += 4;
      else p += 4;
    } else if (info.type === "\u55AE\u8DF3") {
      if (last === "\u838A") p += 4;
      else b += 4;
    } else if (info.type === "\u96D9\u8DF3") {
      if (last === "\u838A") b += 4;
      else p += 4;
    } else if (info.type === "\u4E00\u623F\u5169\u5EF3" && info.side) {
      if (info.side === "\u838A") b += 3;
      else p += 3;
    } else if (info.type === "\u4E00\u822C\u9023") {
      if (last === "\u838A") b += 2;
      else p += 2;
    }
    const recentRuns = runs.slice(-10);
    const bankerDepth = recentRuns.filter((r) => r.side === "\u838A").reduce((s, r) => s + r.length, 0);
    const playerDepth = recentRuns.filter((r) => r.side === "\u9592").reduce((s, r) => s + r.length, 0);
    if (bankerDepth > playerDepth) b += 0.5;
    else if (playerDepth > bankerDepth) p += 0.5;
    const side = b === p ? last === "\u838A" ? "\u9592" : "\u838A" : b > p ? "\u838A" : "\u9592";
    const fmt = (x) => x === "\u838A" ? "\u7D05" : x === "\u9592" ? "\u85CD" : "\u2014";
    return {
      side,
      scoreBanker: b,
      scorePlayer: p,
      reason: `${info.label}\uFF5C\u838A\u554F\u8DEF ${bankerAsk.map(fmt).join("\u30FB")}\uFF5C\u9592\u554F\u8DEF ${playerAsk.map(fmt).join("\u30FB")}\uFF5C\u4E09\u8DEF\u7D9C\u5408 ${b.toFixed(1)}:${p.toFixed(1)}`
    };
  }
  function confidencePercent(scoreBanker, scorePlayer) {
    const gap = Math.abs(scoreBanker - scorePlayer);
    return Math.max(0, Math.min(100, Math.round(gap / 6 * 100)));
  }
  function roadBasedConfidence(results, recommendedSide, originalConfidence = 60) {
    const seq = roadSides(results);
    if (seq.length < 3) return 40;
    const recent = seq.slice(-10);
    const recent6 = seq.slice(-6);
    const last = seq[seq.length - 1];
    let streak = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) streak += 1;
    let changes = 0;
    for (let i = 1; i < recent6.length; i++) if (recent6[i] !== recent6[i - 1]) changes += 1;
    const altRate = recent6.length > 1 ? changes / (recent6.length - 1) : 0.5;
    const info = getPatternInfo(results);
    let score = 52;
    if (info.type === "\u9023\u9F8D") score += 15;
    else if (info.type === "\u55AE\u8DF3") score += 14;
    else if (info.type === "\u96D9\u8DF3") score += 13;
    else if (info.type === "\u4E00\u623F\u5169\u5EF3") score += 10;
    else if (info.type === "\u4E00\u822C\u9023") score += 6;
    else score -= 8;
    if (altRate >= 0.82 || altRate <= 0.18) score += 9;
    else if (altRate >= 0.35 && altRate <= 0.65) score -= 7;
    if (streak >= 5) score += 9;
    else if (streak >= 3) score += 5;
    const prefs = [
      derivedTailPreference(results, 1),
      derivedTailPreference(results, 2),
      derivedTailPreference(results, 3)
    ].filter((x) => x === "\u838A" || x === "\u9592");
    if (prefs.length >= 2) {
      const bankerVotes = prefs.filter((x) => x === "\u838A").length;
      const playerVotes = prefs.length - bankerVotes;
      const majority = bankerVotes === playerVotes ? null : bankerVotes > playerVotes ? "\u838A" : "\u9592";
      if (bankerVotes === prefs.length || playerVotes === prefs.length) score += 8;
      else if (majority) score += 3;
      else score -= 4;
      if (majority === recommendedSide) score += 5;
      else if (majority) score -= 4;
    }
    const roadSide = roadDecision(results).side;
    score += roadSide === recommendedSide ? 6 : -5;
    score += Math.round((Math.max(35, Math.min(95, originalConfidence)) - 60) * 0.22);
    const b = recent.filter((x) => x === "\u838A").length;
    const p = recent.length - b;
    if (recent.length >= 8 && Math.abs(b - p) <= 1 && altRate > 0.2 && altRate < 0.8) score -= 5;
    return Math.max(35, Math.min(95, Math.round(score)));
  }
  function localProviderDecision(provider, results) {
    const road = roadSides(results);
    const base = roadDecision(results);
    const fallback = base.side;
    const value = (x) => x === "\u838A" ? 1 : x === "\u9592" ? -1 : 0;
    const weighted = (take) => {
      const arr = road.slice(-take);
      return arr.reduce((sum, x, i) => sum + value(x) * (1 + i / Math.max(1, arr.length - 1) * 1.7), 0);
    };
    const distribution = (take) => road.slice(-take).reduce((sum, x) => sum + value(x), 0);
    const alternation = (take) => {
      const arr = road.slice(-take);
      if (arr.length < 2) return 0;
      let changes = 0;
      for (let i = 1; i < arr.length; i += 1) if (arr[i] !== arr[i - 1]) changes += 1;
      return changes / (arr.length - 1);
    };
    const last = road.at(-1);
    const opposite = (x) => x === "\u838A" ? "\u9592" : "\u838A";
    let streak = 0;
    if (last) {
      for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
    }
    const pick = (score, tie) => Math.abs(score) < 0.5 ? tie : score > 0 ? "\u838A" : "\u9592";
    const finalize = (side2, rawConfidence2) => ({
      side: side2,
      confidence: roadBasedConfidence(results, side2, rawConfidence2)
    });
    if (provider === "road") {
      return finalize(base.side, confidencePercent(base.scoreBanker, base.scorePlayer));
    }
    if (provider === "chatgpt") {
      const score = weighted(12) * 0.34 + (streak >= 2 ? value(last) * Math.min(2, streak * 0.5) : 0) + (alternation(10) >= 0.78 ? -value(last) * 0.75 : 0);
      return finalize(pick(score, fallback), Math.max(45, Math.min(92, 58 + Math.round(Math.abs(score) * 4))));
    }
    if (provider === "gemini") {
      let score = (1 - alternation(6)) * distribution(14) * 0.2;
      if (last && alternation(6) >= 0.72) score += -value(last) * 1.55;
      if (streak === 2 || streak === 3) score += value(last) * 0.9;
      if (streak >= 5) score -= value(last) * 0.55;
      const tie = last && alternation(6) >= 0.67 ? opposite(last) : fallback;
      return finalize(pick(score, tie), Math.max(44, Math.min(90, 56 + Math.round(Math.abs(score) * 5))));
    }
    if (provider === "grok") {
      let score = weighted(5) * 0.7 + weighted(3) * 0.38;
      if (streak >= 2) score += value(last) * Math.min(1.45, streak * 0.42);
      if (last && alternation(5) >= 0.8) score -= value(last) * 0.55;
      return finalize(pick(score, weighted(4) >= 0 ? "\u838A" : "\u9592"), Math.max(46, Math.min(93, 60 + Math.round(Math.abs(score) * 3))));
    }
    if (provider === "meta") {
      const longDist = distribution(18), shortDist = distribution(8);
      let score = -longDist * 0.2 - shortDist * 0.28;
      if (Math.abs(longDist) <= 2) score += shortDist * 0.12;
      if (streak >= 4) score -= value(last) * 1.25;
      const tie = Math.abs(distribution(12)) >= 2 ? distribution(12) > 0 ? "\u9592" : "\u838A" : opposite(last);
      return finalize(pick(score, tie), Math.max(43, Math.min(88, 55 + Math.round(Math.abs(score) * 4))));
    }
    const parts = ["chatgpt", "gemini", "grok", "meta"].map((x) => localProviderDecision(x, results));
    const banker = parts.filter((x) => x.side === "\u838A");
    const player = parts.filter((x) => x.side === "\u9592");
    const bWeight = banker.reduce((s, x) => s + x.confidence, 0);
    const pWeight = player.reduce((s, x) => s + x.confidence, 0);
    const side = banker.length === player.length ? bWeight >= pWeight ? "\u838A" : "\u9592" : banker.length > player.length ? "\u838A" : "\u9592";
    const winners = parts.filter((x) => x.side === side);
    const rawConfidence = Math.round(winners.reduce((s, x) => s + x.confidence, 0) / Math.max(1, winners.length));
    return finalize(side, rawConfidence);
  }

  // lib/mt-recommendation-adapter.ts
  var PROVIDERS = [
    "chatgpt",
    "gemini",
    "grok",
    "meta",
    "combined",
    "road",
    "counting",
    "parity"
  ];
  function asRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
  }
  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }
  function usableText(value) {
    const valueText = text(value);
    return valueText && !/^(?:-|—|null|undefined)$/i.test(valueText) ? valueText : "";
  }
  function wholeNumber(value) {
    const numberValue = typeof value === "number" ? value : Number(value);
    return Number.isSafeInteger(numberValue) && numberValue >= 1 ? numberValue : null;
  }
  function finiteNumber(value) {
    if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) return null;
    const numberValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
  function timestamp(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string" || !value.trim()) return null;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function isResult(value) {
    return value === "\u838A" || value === "\u9592" || value === "\u548C";
  }
  function resultsFrom(value) {
    if (!Array.isArray(value) || !value.every(isResult)) return null;
    return value.slice();
  }
  function sameResults(left, right) {
    return left.length === right.length && left.every((result2, index) => result2 === right[index]);
  }
  function startsWithResults(value, prefix) {
    return value.length >= prefix.length && prefix.every((result2, index) => result2 === value[index]);
  }
  function hasNativeRoad(value) {
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }
  function winnerToResult(value) {
    if (isResult(value)) return value;
    const normalized = typeof value === "string" ? value.trim().toUpperCase() : value;
    if (normalized === 1 || normalized === "1" || normalized === "PLAYER")
      return "\u9592";
    if (normalized === 2 || normalized === "2" || normalized === "BANKER")
      return "\u838A";
    if (normalized === 3 || normalized === "3" || normalized === "TIE")
      return "\u548C";
    return null;
  }
  function sourceRoad(table) {
    const snapshot = asRecord(table.snapshot);
    if (!snapshot || !hasNativeRoad(snapshot.rawRoad)) return { kind: "absent" };
    if (snapshot.roadVerifiedAgainstTotals !== true) {
      return { kind: "invalid", reason: "\u539F\u751F bead \u724C\u8DEF\u672A\u901A\u904E totals \u9A57\u8B49" };
    }
    const shoe = usableText(snapshot.shoe);
    const round = wholeNumber(snapshot.round);
    const results = resultsFrom(snapshot.results);
    if (!shoe || !round || !results) {
      return { kind: "invalid", reason: "\u539F\u751F bead \u5FEB\u7167\u6B04\u4F4D\u4E0D\u5B8C\u6574" };
    }
    if (results.length !== round - 1) {
      return {
        kind: "invalid",
        reason: "\u539F\u751F bead \u724C\u8DEF\u8207 snapshot.round \u4E0D\u4E00\u81F4"
      };
    }
    return { kind: "road", state: { shoe, round, results } };
  }
  function validClock(table) {
    const clock = asRecord(table.clock);
    const shoe = usableText(clock?.shoe);
    const round = wholeNumber(clock?.round);
    if (!clock || !shoe || !round)
      return { ok: false, reason: "\u76EE\u524D clock \u7F3A\u5C11\u6709\u6548 shoe/round" };
    return { ok: true, clock, shoe, round };
  }
  function gameSnFor(table) {
    const snapshot = asRecord(table.snapshot);
    const clock = asRecord(table.clock);
    const snapshotGameSn = usableText(snapshot?.gameSn);
    const clockGameSn = usableText(clock?.gameSn);
    const sameRound = snapshot?.shoe === clock?.shoe && snapshot?.round === clock?.round;
    return {
      gameSn: clockGameSn || (sameRound ? snapshotGameSn : ""),
      mismatch: Boolean(
        sameRound && snapshotGameSn && clockGameSn && snapshotGameSn !== clockGameSn
      )
    };
  }
  function incrementFromLastResult(previous, table, clockShoe, clockRound) {
    if (previous.shoe !== clockShoe || clockRound !== previous.round + 1)
      return null;
    const last = asRecord(table.lastTableResult);
    if (!last) return null;
    const shoe = usableText(last.shoe);
    const round = wholeNumber(last.round);
    const result2 = winnerToResult(last.result) ?? winnerToResult(last.winner);
    const at = timestamp(last.at);
    const key = shoe && round ? `${shoe}|${round}` : "";
    if (!shoe || shoe !== previous.shoe || !round || round !== previous.round || !result2 || at === null || !key || previous.lastResultKey === key || previous.lastResultAt !== void 0 && at < previous.lastResultAt) {
      return null;
    }
    return {
      shoe: previous.shoe,
      round: clockRound,
      results: [...previous.results, result2],
      lastResultKey: key,
      lastResultAt: at
    };
  }
  function roadMatchesClock(state, clockShoe, clockRound) {
    return state.shoe === clockShoe && state.round === clockRound;
  }
  function roadError(reason) {
    return { ok: false, reason };
  }
  function createMtRecommendationAdapter() {
    const roads = /* @__PURE__ */ new Map();
    function resolveRoad(table) {
      const tableId = usableText(table.tableId);
      if (!tableId) return roadError("liveTables \u7F3A\u5C11\u539F\u751F tableId");
      const currentClock = validClock(table);
      if (!currentClock.ok) return roadError(currentClock.reason);
      const source = sourceRoad(table);
      const cached = roads.get(tableId);
      if (source.kind === "invalid" && (!cached || source.reason !== "\u539F\u751F bead \u724C\u8DEF\u8207 snapshot.round \u4E0D\u4E00\u81F4")) {
        return roadError(source.reason);
      }
      let state = cached;
      if (source.kind === "road") {
        const native = source.state;
        if (!cached) {
          state = native;
        } else if (native.shoe === cached.shoe) {
          if (native.round < cached.round) {
            if (!startsWithResults(cached.results, native.results)) {
              return roadError("\u820A\u539F\u751F bead \u5FEB\u7167\u8207\u5DF2\u9A57\u8B49\u724C\u8DEF\u885D\u7A81");
            }
            state = cached;
          } else if (native.round === cached.round) {
            if (!sameResults(native.results, cached.results)) {
              return roadError("\u540C\u4E00\u5C40\u539F\u751F bead \u724C\u8DEF\u885D\u7A81");
            }
            state = native;
          } else {
            if (!startsWithResults(native.results, cached.results)) {
              return roadError("\u539F\u751F bead \u724C\u8DEF\u4E0D\u662F\u9023\u7E8C\u5EF6\u4F38");
            }
            state = native;
          }
        } else {
          state = native;
        }
        roads.set(tableId, state);
      }
      if (!state) return roadError("\u6C92\u6709\u5B8C\u6574\u4E14\u5DF2\u9A57\u8B49\u7684\u539F\u751F bead \u724C\u8DEF");
      if (!roadMatchesClock(state, currentClock.shoe, currentClock.round)) {
        const incremented = incrementFromLastResult(
          state,
          table,
          currentClock.shoe,
          currentClock.round
        );
        if (incremented) {
          state = incremented;
          roads.set(tableId, state);
        }
      }
      const clockInSync = roadMatchesClock(
        state,
        currentClock.shoe,
        currentClock.round
      );
      if (!clockInSync) {
        if (state.shoe !== currentClock.shoe) {
          return roadError("clock \u8207\u5DF2\u9A57\u8B49\u724C\u8DEF\u8DE8\u9774\uFF0C\u4E0D\u80FD\u63A8\u7B97\u724C\u8DEF");
        }
        if (currentClock.round > state.round) {
          return roadError("clock \u5DF2\u524D\u9032\u4F46\u6C92\u6709\u9023\u7E8C\u7684\u5DF2\u9A57\u8B49\u7D50\u679C");
        }
      }
      if (state.results.length === 0)
        return roadError("\u6C92\u6709\u5DF2\u5B8C\u6210\u7D50\u679C\uFF0C\u4E0D\u80FD\u9810\u8A2D\u63A8\u85A6\u838A");
      const gameSn = gameSnFor(table);
      return {
        ok: true,
        value: {
          state,
          clock: currentClock.clock,
          clockShoe: currentClock.shoe,
          clockRound: currentClock.round,
          clockInSync,
          gameSn: gameSn.gameSn,
          gameSnMismatch: gameSn.mismatch,
          tableId
        }
      };
    }
    function preview(report, tableName, provider, now = Date.now()) {
      if (!PROVIDERS.includes(provider)) {
        return { ok: false, reason: "\u4E0D\u652F\u63F4\u7684\u63A8\u85A6 provider", tableName };
      }
      const root = asRecord(report);
      const viewport = asRecord(root?.tableViewport);
      const viewportTables = Array.isArray(viewport?.tables) ? viewport.tables.map(asRecord).filter(Boolean) : [];
      const normalizedName = text(tableName);
      const viewportMatches = viewportTables.filter(
        (entry) => text(entry.name) === normalizedName
      );
      if (viewportMatches.length !== 1) {
        return {
          ok: false,
          reason: viewportMatches.length > 1 ? "viewport \u51FA\u73FE\u91CD\u8907 DOM table name" : "viewport \u627E\u4E0D\u5230\u6307\u5B9A DOM table name",
          tableName
        };
      }
      const liveTables = Array.isArray(root?.liveTables) ? root.liveTables.map(asRecord).filter(Boolean) : [];
      const byId = /* @__PURE__ */ new Map();
      for (const table of liveTables) {
        const id = usableText(table.tableId);
        if (!id) continue;
        const key = id.toUpperCase();
        if (byId.has(key))
          return {
            ok: false,
            reason: "liveTables \u6709\u91CD\u8907\u539F\u751F tableId",
            tableName
          };
        byId.set(key, table);
      }
      const viewportTable = viewportMatches[0];
      const confirmedId = usableText(viewportTable.tableId);
      let selected;
      let dataSource;
      if (confirmedId) {
        const exact = byId.get(confirmedId.toUpperCase());
        if (!exact)
          return {
            ok: false,
            reason: "\u5DF2\u78BA\u8A8D\u7684\u539F\u751F tableId \u6C92\u6709 live \u8CC7\u6599",
            tableName
          };
        selected = [exact];
        dataSource = "exact-native-id";
      } else {
        const candidateValues = Array.isArray(viewportTable.candidateIds) ? viewportTable.candidateIds : [];
        const candidateKeys = candidateValues.map(usableText).filter(Boolean).map((id) => id.toUpperCase());
        if (!candidateKeys.length)
          return {
            ok: false,
            reason: "\u672A\u78BA\u8A8D\u539F\u751F tableId \u4E14\u6C92\u6709\u5019\u9078 ID",
            tableName
          };
        if (new Set(candidateKeys).size !== candidateKeys.length) {
          return { ok: false, reason: "\u5019\u9078\u539F\u751F tableId \u91CD\u8907", tableName };
        }
        selected = [];
        for (const key of candidateKeys) {
          const candidate = byId.get(key);
          if (!candidate)
            return {
              ok: false,
              reason: "\u5019\u9078\u539F\u751F tableId \u6C92\u6709 live \u8CC7\u6599",
              tableName
            };
          if (text(candidate.name) !== normalizedName) {
            return {
              ok: false,
              reason: "\u5019\u9078\u539F\u751F ID \u8207 DOM table name \u4E0D\u4E00\u81F4",
              tableName
            };
          }
          selected.push(candidate);
        }
        dataSource = "candidate-consensus";
      }
      const resolved = [];
      for (const table of selected) {
        const result2 = resolveRoad(table);
        if (!result2.ok) return { ok: false, reason: result2.reason, tableName };
        resolved.push(result2.value);
      }
      const first = resolved[0];
      if (!first) return { ok: false, reason: "\u6C92\u6709\u53EF\u7528\u7684\u539F\u751F\u684C\u8CC7\u6599", tableName };
      if (dataSource === "candidate-consensus") {
        const consensus = resolved.every(
          (entry) => entry.clockInSync && entry.state.shoe === first.state.shoe && entry.state.round === first.state.round && sameResults(entry.state.results, first.state.results)
        );
        if (!consensus) {
          return {
            ok: false,
            reason: "\u5019\u9078\u539F\u751F ID \u7684\u5B8C\u6574\u724C\u8DEF\u3001shoe \u6216 round \u4E0D\u4E00\u81F4",
            tableName
          };
        }
      }
      const candidateIds = resolved.map((entry) => entry.tableId);
      const gameSnById = Object.fromEntries(
        resolved.map((entry) => [entry.tableId, entry.gameSn])
      );
      const counts = resolved.map((entry) => finiteNumber(entry.clock.count));
      const count = counts.every((value) => value !== null) ? Math.min(...counts) : null;
      const betIssues = [];
      for (const entry of resolved) {
        if (!entry.clockInSync) betIssues.push("clock \u8207\u724C\u8DEF\u672A\u540C\u6B65");
        if (entry.clock.phase !== "wait") betIssues.push("\u76EE\u524D\u4E0D\u662F wait \u968E\u6BB5");
        const at = timestamp(entry.clock.at);
        if (at === null || now < at || now - at > 3500)
          betIssues.push("clock \u5DF2\u904E\u6642\u6216\u6642\u9593\u7570\u5E38");
        const candidateCount = finiteNumber(entry.clock.count);
        if (candidateCount === null || candidateCount <= 0)
          betIssues.push("\u5012\u6578 count \u4E0D\u53EF\u4E0B\u6CE8");
        if (!entry.gameSn || entry.gameSnMismatch)
          betIssues.push("gameSn \u7121\u6548\u6216\u672A\u540C\u6B65");
      }
      let decision;
      let strategyReason;
      if (provider === "counting" || provider === "parity") {
        const hands = selected.map((table) => mtPreviousPoker(table, first.state.shoe, first.state.round));
        if (hands.some((hand) => !hand)) return { ok: false, tableName, reason: "\u7B49\u5F85\u540C\u684C\u540C\u9774\u4E0A\u4E00\u5C40\u5B8C\u6574 show_poker\uFF1B\u4E0D\u4EE5\u724C\u8DEF\u6216\u9EDE\u6578\u4EE3\u66FF" };
        if (!hands.every((hand) => JSON.stringify(hand) === JSON.stringify(hands[0]))) return { ok: false, tableName, reason: "\u5019\u9078\u539F\u751F\u684C\u7684\u5BE6\u969B\u724C\u5F35\u4E0D\u4E00\u81F4\uFF0C\u4E0D\u80FD\u4F7F\u7528\u5947\u5076\uFF0F\u7B97\u724C" };
        const calculated = pokerDecision(provider, hands[0]);
        if (!calculated.ok) return { ok: false, tableName, reason: calculated.reason };
        decision = calculated;
        strategyReason = calculated.reason;
      } else decision = localProviderDecision(provider, first.state.results);
      return {
        ok: true,
        tableName,
        provider,
        strategyReason,
        side: decision.side,
        confidence: decision.confidence,
        shoe: first.state.shoe,
        round: first.state.round,
        roundKey: `${first.state.shoe}|${first.state.round}`,
        count,
        canBet: betIssues.length === 0,
        reason: betIssues.length ? [...new Set(betIssues)].join("\uFF1B") : null,
        candidateIds,
        gameSnById,
        results: first.state.results.slice(),
        dataSource,
        pattern: { label: getPatternInfo(first.state.results).label }
      };
    }
    return { preview };
  }

  // lib/dg-bet-ledger.ts
  function martingaleAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw new Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * (2 ** (level + 1) - 1);
    if (!Number.isSafeInteger(amount)) throw new Error("\u99AC\u4E01\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  function doublingAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * 2 ** level;
    if (!Number.isSafeInteger(amount)) throw Error("\u500D\u6295\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  function stakingAmount(base, level, staking) {
    return staking === "doubling" ? doublingAmount(base, level) : martingaleAmount(base, staking === "flat" ? 0 : level);
  }
  function chipPlan(amount, denominations, limit = 120) {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("\u91D1\u984D\u7121\u6548");
    const ds = [...new Set(denominations.filter((d) => Number.isSafeInteger(d) && d > 0))].sort((a, b) => b - a);
    let frontier = /* @__PURE__ */ new Map([[0, []]]);
    const visited = /* @__PURE__ */ new Set([0]);
    for (let n = 0; n < limit; n++) {
      const next = /* @__PURE__ */ new Map();
      for (const [sum, path] of frontier) for (const d of ds) {
        const value = sum + d;
        if (value > amount || visited.has(value)) continue;
        const p = [...path, d];
        if (value === amount) return p;
        visited.add(value);
        next.set(value, p);
        if (visited.size > 5e4) throw new Error("\u7C4C\u78BC\u7D44\u5408\u904E\u591A\uFF0C\u8ACB\u8A2D\u5B9A\u5408\u9069\u7C4C\u78BC");
      }
      frontier = next;
      if (!frontier.size) break;
    }
    throw new Error("\u76EE\u524D\u7C4C\u78BC\u4E0D\u80FD\u7CBE\u78BA\u7D44\u6210\u91D1\u984D\uFF0C\u6216\u9EDE\u64CA\u6B21\u6578\u8D85\u51FA\u9650\u5236");
  }

  // lib/mt-dom-click-runner.ts
  var defaults = { rooms: 1, base: 100, maximum: 1e5, provider: "combined", staking: "martingale", startMode: "new", tableNames: [], takeProfit: null, stopLoss: null };
  var pendingStates = /* @__PURE__ */ new Set(["reserved", "submitted", "accepted", "uncertain"]);
  var copy = (value) => JSON.parse(JSON.stringify(value));
  var clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
  function createMtDomClickRunner(W, preview, saved, readReport) {
    const D = W.document;
    const state = saved?.version === 1 ? copy(saved) : { version: 1, config: copy(defaults), bets: [], level: 0, sessionStart: 0 };
    let running = false, disposed = false, generation = 0, active = null, testOnce = false;
    let message = "\u5DF2\u505C\u6B62\uFF1B\u5B89\u88DD\u4E0D\u6703\u4E0B\u6CE8", stage = null;
    let onChange = () => {
    };
    const logs = [];
    const report = () => readReport ? readReport() : W.__MT_AUTOBAC_DIAG__?.report?.();
    const previousSocketSend = W.WebSocket?.prototype?.send;
    function nativeSend(raw) {
      if (stage?.nativeClickInProgress && typeof raw === "string") {
        try {
          const packet = JSON.parse(raw), slips = packet.body?.order?.slips, id = String(packet.action?.data?.table_id ?? ""), bet = stage.bet;
          if (packet.method === "POST" && packet.action?.name?.endsWith("/bet") && bet.candidateIds.includes(id) && packet.body?.game_sn === bet.gameSnById[id] && slips?.length === 1 && Number(slips[0].amount) === bet.amount && slips[0].play_id != null) {
            if (bet.nativeProof) {
              delete bet.nativeProof;
              stage.interference = true;
              stop("\u540C\u6B21\u539F\u751F\u78BA\u8A8D\u9001\u51FA\u591A\u7B46\u6CE8\u55AE\uFF0C\u7121\u6CD5\u552F\u4E00\u6838\u5C0D");
            } else bet.nativeProof = { tableId: id, gameSn: String(packet.body.game_sn), playId: String(slips[0].play_id), at: Date.now() };
          }
        } catch {
        }
      }
      return Reflect.apply(previousSocketSend, this, [raw]);
    }
    if (previousSocketSend) W.WebSocket.prototype.send = nativeSend;
    const pending = () => state.bets.filter((b) => pendingStates.has(b.state));
    const mode = () => state.config.rooms === 1 ? state.config.staking : "flat";
    const pnl = () => state.bets.slice(state.sessionStart).filter((b) => b.state === "settled").reduce((s, b) => s + (b.pnl ?? 0), 0);
    function note(text2) {
      message = text2;
      logs.push({ at: Date.now(), text: text2 });
      if (logs.length > 80) logs.shift();
      W.console.log("[AutoBac MT \u9EDE\u64CA]", text2);
      onChange();
    }
    function amount() {
      return stakingAmount(state.config.base, state.level, mode());
    }
    function previewAmount() {
      return !running && !pending().length && state.config.startMode === "new" ? state.config.base : amount();
    }
    function isEligible(p) {
      return p.ok && p.canBet && (p.count ?? 0) >= 6 && p.results?.filter((x) => x !== "\u548C").length >= 3;
    }
    function selectedNames(r) {
      const rows = r?.tableViewport?.tables || [], limit = state.config.rooms === "all" ? rows.length : state.config.rooms;
      if (state.config.tableNames.length) return [...state.config.tableNames];
      const names = [...new Set(pending().map((b) => b.tableName))];
      const unoperated = (p) => !state.bets.some((b) => b.key === `${p.tableName}|${p.roundKey}`) && !existingNative(r, p);
      const previews = rows.map((x) => preview(r, x.name, state.config.provider, Date.now()));
      const eligible = previews.filter((p) => isEligible(p) && unoperated(p));
      const pool = running ? eligible : [...eligible, ...previews];
      for (const p of pool) {
        if (names.length >= limit) break;
        if (!names.includes(p.tableName)) names.push(p.tableName);
      }
      return names;
    }
    function configure(values) {
      if (running || active || pending().length && Object.keys(values).some((k) => k !== "startMode")) throw Error("\u8ACB\u5148\u505C\u6B62\u4E26\u7B49\u5F85\u5DF2\u9001\u51FA\u4E0B\u6CE8\u7D50\u7B97\uFF0C\u624D\u80FD\u6539\u8A2D\u5B9A");
      const c = { ...state.config, ...values };
      if (![1, 3, 5, "all"].includes(c.rooms)) throw Error("\u684C\u6578\u7121\u6548");
      if (!Number.isSafeInteger(c.base) || c.base <= 0 || !Number.isSafeInteger(c.maximum) || c.maximum < c.base) throw Error("\u57FA\u672C\u91D1\u984D/\u55AE\u7B46\u4E0A\u9650\u7121\u6548");
      if (!["combined", "chatgpt", "gemini", "grok", "meta", "road", "counting", "parity"].includes(c.provider)) throw Error("\u63A8\u85A6\u4F86\u6E90\u7121\u6548");
      if (!["flat", "martingale", "doubling"].includes(c.staking) || !["new", "resume"].includes(c.startMode)) throw Error("\u914D\u6CE8/\u958B\u59CB\u65B9\u5F0F\u7121\u6548");
      for (const v of [c.takeProfit, c.stopLoss]) if (v !== null && (!Number.isFinite(v) || v <= 0)) throw Error("\u6B62\u76C8\u6B62\u640D\u8ACB\u8F38\u5165\u6B63\u91D1\u984D\uFF0C\u6216\u7559\u7A7A");
      c.tableNames = [...new Set(c.tableNames.map((n) => clean(n).toUpperCase()))];
      if (c.rooms !== "all" && c.tableNames.length > c.rooms) throw Error(`\u6700\u591A\u53EA\u80FD\u6307\u5B9A${c.rooms}\u684C`);
      state.config = c;
      onChange();
      return copy(c);
    }
    function start(approved = false, once = false) {
      if (!approved) throw Error("\u5FC5\u9808\u5148\u78BA\u8A8D\u672C\u6B21\u8A2D\u5B9A\u8207\u98A8\u96AA");
      if (disposed || running || active) throw Error("\u76EE\u524D\u4E0D\u80FD\u958B\u59CB");
      const r = report();
      if (!r?.tableViewport?.tables?.length) throw Error("\u8ACB\u5728MT\u539F\u751F\u591A\u53F0\u9801\u958B\u59CB");
      const unresolved = pending();
      if (unresolved.some((b) => b.state === "uncertain")) throw Error("\u4ECD\u6709\u672A\u78BA\u5B9A\u4E0B\u6CE8\uFF1B\u4FDD\u7559\u9396\u5B9A\uFF0C\u4E0D\u91CD\u9001");
      if (unresolved.length && state.config.startMode === "new") throw Error("\u65B0\u958B\u59CB\u9808\u7B49\u6240\u6709\u4E0B\u6CE8\u7D50\u7B97\uFF1B\u53EF\u6539\u70BA\u7E8C\u63A5\uFF0C\u4F46\u4E0D\u6E05\u9664\u5F85\u7D50\u7B97\u55AE");
      const p = pnl();
      if (state.config.takeProfit !== null && p >= state.config.takeProfit || state.config.stopLoss !== null && p <= -state.config.stopLoss) throw Error("\u672C\u8F2A\u5DF2\u9054\u6B62\u76C8/\u6B62\u640D\uFF0C\u4E0D\u80FD\u7E8C\u63A5");
      if (state.config.startMode === "new") state.level = 0;
      testOnce = once;
      running = true;
      generation++;
      note("\u57F7\u884C\u4E2D\uFF1A\u9078\u7C4C\u78BC \u2192 \u63A8\u85A6\u65B9\u5411 \u2192 \u78BA\u8A8D \u2192 \u5E73\u53F0\u56DE\u8986");
      void tick();
    }
    function stop(reason = "\u5DF2\u505C\u6B62\u65B0\u589E\u64CD\u4F5C\uFF1B\u5DF2\u9001\u51FA\u7684\u4E0B\u6CE8\u7E7C\u7E8C\u6838\u5C0D\u7D50\u7B97") {
      running = false;
      testOnce = false;
      generation++;
      W.__MT_AUTOBAC_DIAG__?.cancelScroll?.();
      note(reason);
    }
    function visible(e) {
      if (!e?.isConnected) return false;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      for (let n = e; n; n = n.parentElement) {
        const s = W.getComputedStyle(n);
        if (s.display === "none" || s.visibility === "hidden" || n.hidden) return false;
      }
      return true;
    }
    function usable(e) {
      if (!visible(e) || e.disabled || e.getAttribute("aria-disabled") === "true" || e.closest?.(".gameDesk_bet_section li.disable")) return false;
      for (let n = e.parentElement; n; n = n.parentElement) if (n.disabled || n.getAttribute("aria-disabled") === "true") return false;
      return true;
    }
    function nativeMobile(row) {
      return row.classList.contains("gameDesk") && row.closest(".multiple#mulitScroll") !== null;
    }
    function numericText(value) {
      const match = clean(value).match(/^(?:(?:TWD|NT\$|\$)\s*)?(\d[\d,]*(?:\.\d+)?)$/i);
      if (!match) return null;
      const number = Number(match[1].replace(/,/g, ""));
      return Number.isFinite(number) ? number : null;
    }
    function nativeSections(row) {
      return Array.from(row.querySelectorAll(".gameDesk_bet_section")).filter(visible);
    }
    function nativeSide(row, side) {
      const wanted = side === "\u838A" ? "zhuang" : side === "\u9592" ? "free" : null;
      if (!wanted) return null;
      const matches = nativeSections(row).filter((section) => section.getAttribute("data-state") === "classic").flatMap((section) => Array.from(section.querySelectorAll(":scope > ul > li[data-state]")).filter(visible)).filter((li) => li.getAttribute("data-state") === wanted);
      return matches.length === 1 ? matches[0] : null;
    }
    function nativeQueued(row) {
      return nativeSections(row).flatMap((section) => Array.from(section.querySelectorAll(".btn.btn-money")).filter(visible)).map((button) => ({ button, value: numericText(button.textContent), side: button.closest("li[data-state]")?.getAttribute("data-state") || null }));
    }
    function money(li) {
      if (nativeMobile(li.closest(".gameDesk") || li)) {
        const values = Array.from(li.querySelectorAll(".btn.btn-money")).filter(visible).map((e) => numericText(e.textContent)).filter((value) => value !== null);
        if (!values.length) return null;
        if (new Set(values).size !== 1) throw Error("\u756B\u9762\u5F85\u78BA\u8A8D\u91D1\u984D\u986F\u793A\u4E0D\u4E00\u81F4");
        return values[0];
      }
      const found = [];
      for (const e of Array.from(li.querySelectorAll(".value .money span,.value .money"))) {
        if (!visible(e)) continue;
        const n = numericText(e.textContent);
        if (n !== null) found.push(n);
      }
      if (!found.length) return null;
      if (new Set(found).size !== 1) throw Error("\u756B\u9762\u5F85\u78BA\u8A8D\u91D1\u984D\u986F\u793A\u4E0D\u4E00\u81F4");
      return found[0];
    }
    function sides(row) {
      if (nativeMobile(row)) return ["\u838A", "\u9592"].map((side) => nativeSide(row, side)).filter((li) => !!li);
      return Array.from(row.querySelectorAll(".gameDesk_bet li")).filter((li) => ["\u838A", "\u9592"].includes(clean(li.querySelector(".caption")?.textContent)));
    }
    function hasPending(row) {
      if (nativeMobile(row)) return nativeQueued(row).some((entry) => (entry.value ?? 0) > 0);
      const confirm = row.querySelector(".gameDesk_bet .btn-check");
      if (usable(confirm)) return true;
      return Array.from(row.querySelectorAll(".gameDesk_bet li")).some((li) => (money(li) ?? 0) > 0);
    }
    function stagedTotal(row, side, expected) {
      if (nativeMobile(row)) {
        const own = nativeSide(row, side);
        if (!own) throw Error("\u540C\u684C\u539F\u751F\u63A8\u85A6\u4E0B\u6CE8\u5340\u4E0D\u5B58\u5728\u6216\u4E0D\u552F\u4E00");
        const entries = nativeQueued(row), ownState = side === "\u838A" ? "zhuang" : "free";
        const ownValues = entries.filter((entry) => entry.side === ownState).map((entry) => entry.value);
        if (ownValues.length !== 1 || ownValues[0] !== expected) throw Error(`\u5F85\u78BA\u8A8D\u91D1\u984D\u672A\u6838\u5BE6\uFF1A\u9810\u671F${side} ${expected}\uFF0C\u756B\u9762${ownValues[0] ?? "\u8B80\u4E0D\u5230"}`);
        if (entries.some((entry) => entry.side !== ownState && (entry.value ?? 0) > 0)) throw Error("\u5176\u4ED6\u4E0B\u6CE8\u5340\u5DF2\u6709\u91D1\u984D\uFF0C\u4E0D\u9001\u51FA\u6DF7\u5408\u6295\u6CE8");
        return;
      }
      let target = false;
      for (const li of Array.from(row.querySelectorAll(".gameDesk_bet li"))) {
        const caption = clean(li.querySelector(".caption")?.textContent), value = money(li);
        if (caption === side) {
          target = true;
          if (value === null || value !== expected) throw Error(`\u5F85\u78BA\u8A8D\u91D1\u984D\u672A\u6838\u5BE6\uFF1A\u9810\u671F${side} ${expected}\uFF0C\u756B\u9762${value ?? "\u8B80\u4E0D\u5230"}`);
        } else if ((value ?? 0) > 0) throw Error("\u5176\u4ED6\u4E0B\u6CE8\u5340\u5DF2\u6709\u91D1\u984D\uFF0C\u4E0D\u9001\u51FA\u6DF7\u5408\u6295\u6CE8");
      }
      if (!target) throw Error("\u540C\u684C\u4E0B\u6CE8\u65B9\u5411\u4E0D\u5B58\u5728");
    }
    function rowStillCurrent(row, name) {
      const mobile = nativeMobile(row), pane = mobile ? D.querySelector(".multiple#mulitScroll") : D.querySelector(".ant-tabs-tabpane-active.multiple");
      if (!pane || !row.isConnected || !pane.contains(row)) return false;
      const cards = Array.from(pane.querySelectorAll(".gameDesk")).filter((c) => clean(c.querySelector(".gameDesk_tag,.gameDesk_tag_live")?.textContent).match(/\bB\d{2}[A-Z]?(?:-L)?\b/i)?.[0]?.toUpperCase() === name);
      return cards.length === 1 && (mobile ? cards[0] === row : row.contains(cards[0]));
    }
    const pause = (ms = 40) => new Promise((resolve) => W.setTimeout(resolve, ms));
    function chips() {
      const choices = /* @__PURE__ */ new Map();
      const mobilePane = D.querySelector(".multiple#mulitScroll");
      const candidates = mobilePane ? Array.from(mobilePane.querySelectorAll(':scope > .multiple_footer > .chip-group > [class*="chip-"]')) : Array.from(D.querySelectorAll('[class*="chip-"]'));
      for (const e of candidates) {
        if (!mobilePane && e.closest(".gameDesk_bet,.gameDesk_bet_section,.bet_section_center") || !visible(e)) continue;
        const token = Array.from(e.classList).find((x) => /^chip-\d+$/.test(x));
        if (!token) continue;
        const n = Number(token.slice(5));
        if (n <= 0) continue;
        const a = choices.get(n) || [];
        a.push(e);
        choices.set(n, a);
      }
      const out = /* @__PURE__ */ new Map();
      for (const [n, a] of choices) if (a.length === 1) out.set(n, a[0]);
      return out;
    }
    function existingNative(r, p) {
      return (r.betObservation?.records || []).some((b) => p.candidateIds.includes(b.tableId) && (b.gameSn === p.gameSnById[b.tableId] || String(b.shoe) === p.shoe && Number(b.round) === p.round));
    }
    function nativeMatches(bet, records) {
      const proof = bet.nativeProof;
      if (!proof) return [];
      return records.filter((x) => Number(x.id) > (bet.baselineRecordId ?? 0) && Date.parse(x.at) >= bet.createdAt - 5 && Date.parse(x.at) <= bet.createdAt + 15e3 && x.tableId === proof.tableId && x.gameSn === proof.gameSn && x.amount === bet.amount && String(x.shoe) === bet.shoe && Number(x.round) === bet.round && x.slips?.length === 1 && x.slips[0].amount === bet.amount && String(x.slips[0].playId) === proof.playId);
    }
    function status(r) {
      const records = r?.betObservation?.records || [], groups = r?.betObservation?.groups || [];
      for (const bet of state.bets) {
        if (!["submitted", "accepted", "uncertain"].includes(bet.state)) continue;
        if (bet.state === "uncertain" && bet.nativeRecordId) continue;
        if (!bet.nativeRecordId) {
          const candidates = nativeMatches(bet, records);
          if (candidates.length === 1) {
            const match = candidates[0];
            bet.nativeRecordId = match.id;
            bet.nativeTableId = match.tableId;
            bet.gameSn = match.gameSn;
            bet.playId = match.slips[0].playId;
            bet.reason = void 0;
          } else {
            if (Date.now() - (bet.submittedAt ?? bet.createdAt) > 12e3) {
              bet.state = "uncertain";
              bet.reason = "\u78BA\u8A8D\u5DF2\u9EDE\u4F4612\u79D2\u5167\u672A\u53D6\u5F97\u552F\u4E00\u539F\u751F\u9001\u55AE\uFF1B\u4E0D\u91CD\u9001";
              if (running) stop(bet.reason);
            }
            continue;
          }
        }
        const rec = records.find((x) => x.id === bet.nativeRecordId);
        if (!rec || rec.tableId !== bet.nativeTableId || rec.gameSn !== bet.gameSn || rec.amount !== bet.amount || String(rec.shoe) !== bet.shoe || Number(rec.round) !== bet.round) {
          bet.state = "uncertain";
          bet.reason = "\u539F\u751F\u6CE8\u55AE\u6B04\u4F4D\u7121\u6CD5\u6301\u7E8C\u6838\u5C0D";
          if (running) stop(bet.reason);
          continue;
        }
        if (rec.state === "rejected") {
          bet.state = "rejected";
          bet.reason = `\u5E73\u53F0\u62D2\u7D55\uFF1A${rec.error}`;
          stop(`${bet.tableName} ${bet.reason}`);
          continue;
        }
        if (rec.reviewReason) {
          bet.state = "uncertain";
          bet.reason = rec.reviewReason;
          if (running) stop(`\u9700\u6838\u5C0D\uFF1A${rec.reviewReason}`);
          continue;
        }
        if (rec.state === "accepted" && bet.state !== "accepted") {
          bet.state = "accepted";
          bet.acceptedAt = Date.parse(rec.acceptedAt) || Date.now();
          note(`${bet.tableName} \u5E73\u53F0\u5DF2\u63A5\u53D7 ${bet.side} ${bet.amount}\uFF08${bet.nativeTableId}\uFF09`);
          if (testOnce) stop("\u6E2C\u8A66\u4E00\u7B46\u5DF2\u63A5\u53D7\uFF1B\u505C\u6B62\u65B0\u589E\u64CD\u4F5C\uFF0C\u7E7C\u7E8C\u6838\u5C0D\u7D50\u7B97");
        }
        if (bet.state === "accepted") {
          const group = groups.find((g) => g.tableId === bet.nativeTableId && String(g.shoe) === bet.shoe && Number(g.round) === bet.round);
          if (group?.settlement) {
            const accepted = group.recordIds.filter((id) => records.some((x) => x.id === id && x.state === "accepted"));
            if (group.unresolved || group.acceptedAmount !== bet.amount || accepted.length !== 1 || accepted[0] !== bet.nativeRecordId) {
              bet.state = "uncertain";
              bet.reason = "\u672C\u684C\u672C\u5C40\u6DF7\u6709\u5176\u4ED6\u6295\u6CE8\uFF0C\u4E0D\u80FD\u5C07\u5408\u8A08\u640D\u76CA\u7576\u6210\u672C\u7B46";
              if (running) stop(bet.reason);
              continue;
            }
            const value = group.settlement.points;
            if (typeof value !== "number" || !Number.isFinite(value)) continue;
            if (value < -bet.amount || value > bet.amount) {
              bet.state = "uncertain";
              bet.reason = "\u6703\u54E1\u672C\u5C40\u5408\u8A08\u8D85\u51FA\u6B64\u7B46\u91D1\u984D\uFF0C\u53EF\u80FD\u542B\u5176\u4ED6\u6295\u6CE8\uFF0C\u4E0D\u80FD\u6539\u914D\u6CE8";
              if (running) stop(bet.reason);
              continue;
            }
            bet.state = "settled";
            bet.pnl = value;
            bet.settledAt = Date.now();
            if (bet.staking !== "flat") state.level = value > 0 ? 0 : value < 0 ? bet.level + 1 : bet.level;
            note(`${bet.tableName} \u5DF2\u6B63\u5F0F\u7D50\u7B97 ${value >= 0 ? "+" : ""}${value}\uFF1B\u4E0B\u4E00\u6CE8${amount()}`);
            const p = pnl();
            if (running && (state.config.takeProfit !== null && p >= state.config.takeProfit || state.config.stopLoss !== null && p <= -state.config.stopLoss)) stop("\u5DF2\u9054\u672C\u8F2A\u6B62\u76C8/\u6B62\u640D\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8");
          }
        }
        if (["submitted", "uncertain"].includes(bet.state) && Date.now() - (bet.submittedAt ?? bet.createdAt) > 12e3) {
          bet.state = "uncertain";
          bet.reason = "\u672A\u53D6\u5F97\u53EF\u552F\u4E00\u6838\u5C0D\u7684\u6210\u529F\u56DE\u8986";
          if (running) stop(bet.reason);
        }
        if (bet.state === "accepted" && running && Date.now() - (bet.acceptedAt ?? bet.createdAt) > 18e4) stop("\u5E73\u53F0\u7D50\u7B97\u903E\u6642\uFF1B\u5DF2\u505C\u6B62\uFF0C\u4FDD\u7559\u5F85\u7D50\u7B97\u5E33\u672C");
      }
    }
    async function clearOwnStage() {
      if (!stage || !stage.owned || stage.confirmed || stage.interference) return;
      if (rowStillCurrent(stage.row, stage.name)) {
        try {
          stagedTotal(stage.row, stage.bet.side, stage.ownedAmount);
        } catch {
          stage.bet.state = "uncertain";
          stage.bet.reason = "\u5F85\u78BA\u8A8D\u91D1\u984D\u5DF2\u975E\u672C\u5DE5\u5177\u552F\u4E00\u9810\u5099\u91D1\u984D\uFF0C\u4E0D\u81EA\u52D5\u53D6\u6D88";
          note(stage.bet.reason);
          return;
        }
        const cancel = stage.cancel || stage.row.querySelector(".gameDesk_bet .btn-cancel");
        if (usable(cancel)) {
          cancel.click();
          await pause();
        }
        if (hasPending(stage.row)) {
          stage.bet.state = "uncertain";
          stage.bet.reason = "\u5DF2\u505C\u6B62\uFF0C\u4F46\u672C\u684C\u4ECD\u6709\u5F85\u78BA\u8A8D\u91D1\u984D\uFF0C\u8ACB\u624B\u52D5\u53D6\u6D88";
          note(stage.bet.reason);
        }
      } else {
        stage.bet.state = "uncertain";
        stage.bet.reason = "\u684C\u5217\u6D88\u5931\uFF0C\u672A\u78BA\u8A8D\u91D1\u984D\u9700\u624B\u52D5\u6838\u5C0D";
        note(stage.bet.reason);
      }
    }
    async function execute(p, r, run) {
      const value = amount();
      if (value > state.config.maximum) {
        stop(`\u4E0B\u4E00\u6CE8${value}\u8D85\u904E\u8A2D\u5B9A\u55AE\u7B46\u4E0A\u9650${state.config.maximum}`);
        return;
      }
      const available = chips(), plan = chipPlan(value, [...available.keys()], 40);
      if ((p.count ?? 0) < Math.max(6, Math.ceil(plan.length * 0.15) + 3)) return;
      const gameSns = [...new Set(Object.values(p.gameSnById || {}).map(String).filter(Boolean))];
      const focused = await W.__MT_AUTOBAC_DIAG__.scrollToTable(p.tableName, { control: "side", side: p.side, identity: "display", ...gameSns.length === 1 ? { expectedGameSn: gameSns[0] } : {} });
      if (!focused.ok) throw Error(`\u5B9A\u4F4D\u5931\u6557\uFF1A${focused.reason}`);
      const row = focused.row;
      const nativeStaged = () => {
        if (!focused.mobile) return;
        const orderMode = typeof focused.readNativeOrderMode === "function" ? focused.readNativeOrderMode() : focused.nativeOrderMode;
        if (orderMode === "direct") throw Error("\u539F\u751F immediatelyOrderType \u76F4\u63A5\u4E0B\u6CE8\u6A21\u5F0F\u555F\u7528\uFF1B\u4E0D\u9EDE\u4E0B\u6CE8\u5340");
        if (orderMode !== "staged" && orderMode !== "staged-wait-countdown") throw Error("\u7121\u6CD5\u8B80\u53D6\u539F\u751F immediatelyOrderType\uFF1B\u4FDD\u5B88\u4E0D\u9EDE\u4E0B\u6CE8\u5340");
        const countdown = typeof focused.readNativeCountdown === "function" ? focused.readNativeCountdown() : focused.nativeCountdown;
        const fresh = preview(report(), p.tableName, p.provider || state.config.provider, Date.now());
        if (!fresh.ok || !fresh.canBet || fresh.roundKey !== p.roundKey || JSON.stringify(fresh.gameSnById) !== JSON.stringify(p.gameSnById)) throw Error("\u539F\u751F\u624B\u6A5F\u5012\u6578\u66F4\u65B0\u6642\u5DF2\u63DB\u5C40\u6216\u5373\u6642\u8CC7\u6599\u672A\u6838\u5C0D\uFF1B\u4E0D\u9EDE\u4E0B\u6CE8\u5340");
        if (!Number.isSafeInteger(countdown) || countdown < 6) throw Error("\u539F\u751F data-value \u5012\u6578\u4E0D\u8DB36\u79D2\uFF1B\u4E0D\u9EDE\u4E0B\u6CE8\u5340");
        if (countdown !== fresh.count) throw Error("\u539F\u751F data-value \u5012\u6578\u8207\u5DF2\u89C0\u5BDF native wait count \u4E0D\u4E00\u81F4\uFF1B\u4E0D\u9EDE\u4E0B\u6CE8\u5340");
        if (!usable(focused.target)) throw Error("\u540C\u684C\u539F\u751F\u4E0B\u6CE8\u5340\u5DF2\u7981\u7528\u6216\u96B1\u85CF\uFF1B\u4E0D\u9EDE\u7C4C\u78BC");
      };
      nativeStaged();
      if (hasPending(row)) throw Error(`${p.tableName} \u5DF2\u6709\u672A\u78BA\u8A8D/\u5DF2\u986F\u793A\u6295\u6CE8\uFF0C\u4E0D\u8986\u84CB`);
      const baseline = Math.max(0, ...(report()?.betObservation?.records || []).map((x) => Number(x.id) || 0));
      const bet = { key: `${p.tableName}|${p.roundKey}`, tableName: p.tableName, shoe: p.shoe, round: p.round, side: p.side, amount: value, level: mode() !== "flat" ? state.level : 0, staking: mode(), provider: state.config.provider, candidateIds: [...p.candidateIds], gameSnById: { ...p.gameSnById }, createdAt: Date.now(), state: "reserved" };
      bet.baselineRecordId = baseline;
      state.bets.push(bet);
      stage = { row, name: p.tableName, owned: false, ownedAmount: 0, confirmed: false, interference: false, cancel: focused.cancel, confirm: focused.confirm, bet };
      function guard() {
        if (disposed || !running || run !== generation || stage?.interference || D.hidden) throw Error("\u5DF2\u505C\u6B62/\u6709\u624B\u52D5\u64CD\u4F5C/\u9801\u9762\u975E\u524D\u666F");
        if (!rowStillCurrent(row, p.tableName)) throw Error("\u684C\u5217\u5DF2\u8B8A\u52D5");
        const fresh = preview(report(), p.tableName, bet.provider, Date.now());
        if (!fresh.ok || !fresh.canBet || fresh.roundKey !== p.roundKey || (fresh.count ?? 0) < 6 || JSON.stringify(fresh.gameSnById) !== JSON.stringify(bet.gameSnById)) throw Error("\u5DF2\u63DB\u5C40/\u5C01\u76E4/\u5373\u6642\u8CC7\u6599\u4E0D\u8DB3");
      }
      try {
        for (const denomination of plan) {
          guard();
          nativeStaged();
          const chip = chips().get(denomination);
          if (!chip || !usable(chip)) throw Error("\u6307\u5B9A\u7C4C\u78BC\u4E0D\u53EF\u7528");
          chip.click();
          await pause();
          guard();
          nativeStaged();
          const target = focused.target;
          if (!target || !usable(target)) throw Error("\u540C\u684C\u63A8\u85A6\u4E0B\u6CE8\u5340\u4E0D\u53EF\u7528");
          stage.owned = true;
          target.click();
          stage.ownedAmount += denomination;
          await pause();
          stagedTotal(row, p.side, stage.ownedAmount);
        }
        guard();
        stagedTotal(row, p.side, value);
        const confirm = focused.confirm || row.querySelector(".gameDesk_bet .btn-check");
        if (!usable(confirm)) throw Error("\u756B\u9762\u78BA\u8A8D\u9215\u4ECD\u4E0D\u53EF\u7528\uFF0C\u672A\u9001\u51FA");
        guard();
        stage.confirmed = true;
        bet.state = "submitted";
        bet.submittedAt = Date.now();
        note(`${p.tableName} \u9EDE\u64CA\u78BA\u8A8D ${p.side} ${value}\uFF1B\u7B49\u5F85\u539F\u751F\u9001\u55AE\u8B49\u64DA`);
        stage.nativeClickInProgress = true;
        try {
          confirm.click();
        } finally {
          stage.nativeClickInProgress = false;
        }
        await pause();
        status(report());
      } catch (error) {
        if (!stage?.confirmed) {
          bet.state = "aborted";
          bet.reason = String(error.message || error);
          await clearOwnStage();
        } else {
          bet.state = "uncertain";
          bet.reason = String(error.message || error);
        }
        stop(`${p.tableName} ${bet.reason}`);
      } finally {
        stage = null;
      }
    }
    async function wave() {
      const run = generation, r = report();
      if (!r) throw Error("MT\u539F\u751F\u89C0\u5BDF\u6A21\u7D44\u5DF2\u79FB\u9664");
      status(r);
      if (!running) return;
      if (!r.tableViewport?.tables?.length) {
        stop("\u5DF2\u96E2\u958B\u591A\u53F0\u9801\uFF0C\u505C\u6B62\u65B0\u589E\u64CD\u4F5C");
        return;
      }
      const rows = r.tableViewport.tables;
      const wanted = new Set(selectedNames(r));
      const candidates = rows.filter((x) => wanted.has(x.name)).map((x) => preview(r, x.name, state.config.provider, Date.now()));
      const limit = state.config.rooms === "all" ? rows.length : state.config.rooms;
      const busyNames = new Set(pending().map((b) => b.tableName));
      for (const p of candidates) {
        if (!running || run !== generation || pending().length >= limit) break;
        if (!isEligible(p) || busyNames.has(p.tableName) || state.bets.some((b) => b.key === `${p.tableName}|${p.roundKey}`) || existingNative(r, p)) continue;
        if (mode() !== "flat" && pending().length) break;
        await execute(p, r, run);
        busyNames.add(p.tableName);
        if (testOnce && pending().length) break;
      }
      if (running) message = pending().length ? `\u57F7\u884C\u4E2D\uFF5C\u5F85\u63A5\u53D7/\u5F85\u7D50\u7B97 ${pending().length} \u684C` : "\u57F7\u884C\u4E2D\uFF5C\u7B49\u5F85\u6709\u5B8C\u6574\u724C\u8DEF\u7684\u53EF\u4E0B\u6CE8\u684C";
    }
    async function tick() {
      if (disposed || active) return;
      const operation = (async () => {
        try {
          if (running) await wave();
          else status(report());
        } catch (e) {
          stop(String(e.message || e));
        }
      })();
      active = operation;
      try {
        await operation;
      } finally {
        if (active === operation) active = null;
        onChange();
      }
    }
    const interference = (event) => {
      if (!stage || !event.isTrusted) return;
      const e = event.target;
      if (e?.closest('.gameDesk_bet,.gameDesk_bet_section,[class*="chip-"]')) {
        stage.interference = true;
        stop("\u5075\u6E2C\u5230\u624B\u52D5\u4E0B\u6CE8\u64CD\u4F5C\uFF0C\u4FDD\u7559\u756B\u9762\u4E26\u505C\u6B62\u81EA\u52D5\u64CD\u4F5C");
      }
    };
    const visibility = () => {
      if (D.hidden && running) stop("\u9801\u9762\u9032\u5165\u80CC\u666F\uFF1B\u505C\u6B62\u65B0\u589E\u64CD\u4F5C\uFF0C\u8FD4\u56DE\u5F8C\u9700\u624B\u52D5\u958B\u59CB");
    };
    D.addEventListener("pointerdown", interference, true);
    D.addEventListener("visibilitychange", visibility);
    const timer = W.setInterval(() => void tick(), 600);
    async function halt() {
      stop();
      if (active) await active;
    }
    async function dispose() {
      await halt();
      disposed = true;
      W.clearInterval(timer);
      D.removeEventListener("pointerdown", interference, true);
      D.removeEventListener("visibilitychange", visibility);
      if (previousSocketSend && W.WebSocket.prototype.send === nativeSend) W.WebSocket.prototype.send = previousSocketSend;
    }
    function view() {
      const r = report(), rows = r?.tableViewport?.tables || [];
      const current = pending()[0];
      return { running, busy: !!active, message, config: { ...copy(state.config), staking: mode() }, nextAmount: current?.amount ?? previewAmount(), pnl: pnl(), level: state.level, pending: pending().length, bets: copy(state.bets), sessionBets: copy(state.bets.slice(state.sessionStart)), selectedNames: selectedNames(r), balance: typeof r?.memberBalance === "number" ? r.memberBalance : null, logs: copy(logs), previews: rows.map((x) => preview(r, x.name, state.config.provider, Date.now())) };
    }
    return { configure, start, stop, halt, dispose, tick, view, state: () => copy(state), subscribe: (fn) => {
      onChange = fn;
    }, isBusy: () => !!active, money };
  }

  // lib/mt-road-feed.ts
  var TABLES = "/api/v1/gametype/*/game/*/room/*/tables";
  var result = (v) => v === 1 || v === "1" ? "\u9592" : v === 2 || v === "2" ? "\u838A" : v === 3 || v === "3" ? "\u548C" : null;
  function createMtRoadFeed(W, diagnosticReport, canRefresh = () => true, seed = []) {
    const snapshots = new Map(seed.map((s) => [s.tableId, s.snapshot]));
    const live = new Map(seed.map((s) => [s.tableId, { tableId: s.tableId, name: s.name, roomId: s.roomId, clock: s.clock, lastTableResult: s.lastTableResult }]));
    let disposed = false, socket = null, lastRequest = 0, note = "\u7B49\u5F85\u539F\u751F\u9023\u7DDA\uFF1B\u4E0B\u6CE8\u8A0A\u606F\u4E0D\u7531\u672C\u6A21\u7D44\u767C\u9001";
    const listeners = /* @__PURE__ */ new Map();
    const previousSend = W.WebSocket.prototype.send;
    function adoptSnapshot(tableId, s) {
      const old = snapshots.get(tableId);
      if (!s?.shoe || s.roadVerifiedAgainstTotals !== true || s.rawRoad == null || !Array.isArray(s.results) || s.results.length !== s.round - 1 || !Number.isFinite(Date.parse(s.at))) return;
      if (!old || !Number.isFinite(Date.parse(old.at)) || Date.parse(s.at) >= Date.parse(old.at)) snapshots.set(tableId, { ...s });
    }
    function consume(packet, at) {
      const action = typeof packet?.action === "string" ? packet.action : packet?.action?.name;
      const body = packet?.body;
      if (body?.table_id && typeof action === "string") {
        const id = String(body.table_id), old = live.get(id) || { tableId: id };
        if (/\/(wait|ready|end)$/.test(action)) {
          const phase = action.split("/").pop();
          live.set(id, { ...old, roomId: String(body.room_id ?? old.roomId ?? ""), clock: { at, phase, shoe: String(body.shoe ?? ""), round: Number(body.round), gameSn: body.game_sn ?? null, count: phase === "wait" && body.count != null && Number.isFinite(Number(body.count)) ? Number(body.count) : null } });
        } else if (action.endsWith("/show_win")) {
          live.set(id, { ...old, lastTableResult: { at, shoe: String(body.shoe ?? ""), round: Number(body.round), winner: body.winner, result: result(body.winner) }, clock: old.clock ? { ...old.clock, at, phase: "show_win", count: null } : void 0 });
        }
      }
      if (![TABLES, TABLES.replace(/tables$/, "tablesvg")].includes(action)) return;
      const collection = packet?.msg?.tables;
      const tables = Array.isArray(collection) ? collection : Array.isArray(collection?.tables) ? collection.tables : [];
      for (const t of tables) {
        if (!t?.table_id) continue;
        const tableId = String(t.table_id), metadata = live.get(tableId) || { tableId };
        live.set(tableId, { ...metadata, name: t.table_name ?? metadata.name, roomId: String(t.room_id ?? metadata.roomId ?? "") });
        const trend = t.trend || {}, raw = trend.bead_plate2 ?? trend.bead_plate;
        if (raw === void 0 || raw === null) continue;
        let results = [];
        if (typeof raw === "string") {
          const digits = raw.replace(/[^0-9]/g, "");
          if (digits.length % 2) continue;
          for (let i = 1; i < digits.length; i += 2) {
            const r = result(digits[i]);
            if (r) results.push(r);
          }
        } else if (Array.isArray(raw)) results = raw.map((x) => result(x?.winner ?? x?.result ?? x)).filter(Boolean);
        else continue;
        const round = Number(trend.current_round ?? t.round), shoe = String(trend.current_shoe ?? t.shoe ?? "");
        if (!shoe || !Number.isSafeInteger(round) || round < 1 || results.length !== round - 1 || Number(trend.total_round) !== results.length) continue;
        const id = String(t.table_id), old = snapshots.get(id);
        if (old && Date.parse(old.at) > Date.parse(at)) continue;
        snapshots.set(id, { at, shoe, round, rawRoad: raw, results, gameSn: t.game_sn ?? t.game_id ?? null, roadVerifiedAgainstTotals: true });
        note = `\u5DF2\u4FDD\u7559${snapshots.size}\u684C\u5B8C\u6574\u539F\u751Fbead\u724C\u8DEF`;
      }
    }
    const initial = diagnosticReport();
    for (const t of initial?.liveTables || []) live.set(t.tableId, { ...t });
    for (const e of initial?.network || []) if (e.direction === "receive") consume(e.data, e.at);
    for (const t of initial?.liveTables || []) adoptSnapshot(t.tableId, t.snapshot);
    function refresh(force = false) {
      if (disposed || !socket || socket.readyState !== 1 || !canRefresh()) return false;
      if (!force && Date.now() - lastRequest < 2e4) return false;
      lastRequest = Date.now();
      socket.send(JSON.stringify({ method: "GET", action: { name: TABLES, data: { gametype_id: 3, game_id: 1, room_id: 1 } } }));
      note = "\u5DF2\u7528\u539F\u751FGET\u8B80\u53D6\u5B8C\u6574\u724C\u8DEF\uFF08\u4E0D\u662F\u4E0B\u6CE8\uFF09";
      return true;
    }
    function attach(s) {
      try {
        const u = new URL(s.url);
        if (!/(^|\.)ofalive99\.net$/i.test(u.hostname) || u.pathname !== "/game/ws") return;
      } catch {
        return;
      }
      socket = s;
      if (listeners.has(s)) return;
      const handler = async (event) => {
        if (disposed) return;
        try {
          const data = typeof event.data === "string" ? event.data : event.data instanceof W.Blob ? await event.data.text() : null;
          if (data && data.length < 5e6) consume(JSON.parse(data), (/* @__PURE__ */ new Date()).toISOString());
        } catch {
        }
      };
      listeners.set(s, handler);
      s.addEventListener("message", handler);
      W.queueMicrotask(() => refresh());
    }
    function send(data) {
      const out = Reflect.apply(previousSend, this, [data]);
      try {
        attach(this);
      } catch {
      }
      return out;
    }
    W.WebSocket.prototype.send = send;
    const timer = W.setInterval(() => refresh(), 2e3);
    function merge(report) {
      if (!report) return report;
      const ids = /* @__PURE__ */ new Set([...(report.liveTables || []).map((t) => t.tableId), ...live.keys()]);
      const newest = (a, b) => !b ? a : !a ? b : Date.parse(b.at) > Date.parse(a.at) ? b : a;
      return { ...report, liveTables: [...ids].map((id) => {
        const original = (report.liveTables || []).find((t) => t.tableId === id) || { tableId: id }, own = live.get(id) || {};
        adoptSnapshot(id, original.snapshot);
        return { ...own, ...original, name: original.name ?? own.name, roomId: original.roomId ?? own.roomId, snapshot: snapshots.get(id) || original.snapshot, clock: newest(original.clock, own.clock), lastTableResult: newest(original.lastTableResult, own.lastTableResult) };
      }) };
    }
    function dispose() {
      disposed = true;
      W.clearInterval(timer);
      for (const [s, h] of listeners) s.removeEventListener("message", h);
      listeners.clear();
      if (W.WebSocket.prototype.send === send) W.WebSocket.prototype.send = previousSend;
    }
    return { merge, refresh, dispose, status: () => `${note}\uFF1B\u5373\u6642\u9774\u5C40/\u5012\u6578 ${[...live.values()].filter((t) => t.clock?.phase === "wait" && Date.now() - Date.parse(t.clock.at) < 3500).length} \u684C`, export: () => [...snapshots].map(([tableId, snapshot]) => ({ ...live.get(tableId), tableId, snapshot: { ...snapshot } })) };
  }

  // lib/official-turnover-panel.ts
  var OFFICIAL_TURNOVER_HTML = `<section class="official-turnover" aria-label="\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u6D41\u6C34">
  <div class="turnover-values"><div><small>\u4ECA\u65E5\u6D41\u6C34</small><strong id="official-today">\u5F85\u540C\u6B65</strong></div><div><small>\u8FD17\u65E5\u6D41\u6C34</small><strong id="official-week">\u5F85\u540C\u6B65</strong></div></div>
  <span class="turnover-source" id="official-source">\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u984D \xB7 \u975E\u672C\u5DE5\u5177\u6CE8\u984D\u4F30\u7B97</span>
</section>`;
  var OFFICIAL_TURNOVER_REPORT_HTML = `<div class="report-official-turnover"><small>\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u6D41\u6C34</small><div><span>\u4ECA\u65E5 <strong id="report-official-today">\u5F85\u540C\u6B65</strong></span><span>\u8FD17\u65E5 <strong id="report-official-week">\u5F85\u540C\u6B65</strong></span></div><p id="report-official-source">\u8207\u4E0B\u65B9\u672C\u5DE5\u5177\u4E0B\u6CE8\u7D00\u9304\u5206\u958B\u7D71\u8A08</p></div>`;
  var OFFICIAL_TURNOVER_CSS = `
.official-turnover{flex:none;border:1px solid #637f8c38;border-radius:8px;background:#172b34;padding:7px 9px;margin:0;min-width:0;}
.turnover-values{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;}
.turnover-values small{display:block;font-size:9px;color:#aac1cb;margin-bottom:3px;}
.turnover-values strong{display:block;font-size:13px;line-height:17px;color:#d6ece4;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}
.turnover-values>div+div{border-left:1px solid #607f8738;padding-left:12px;}
.turnover-source{display:block;font-size:8px;line-height:12px;color:#98adb8;margin-top:4px;}
#panel.compact:not(.mini) .official-turnover{padding:6px 8px;}
#panel.compact:not(.mini) .chart-wrap{height:66px;}
#panel.compact:not(.mini) .chart{height:25px;margin:3px 0;}
#panel.compact:not(.mini) #table-strip{height:34px;min-height:34px;}
#panel.compact:not(.mini) .table-chip{padding:3px 6px;}
#panel.compact:not(.mini) #overview-page{overflow-y:auto!important;overscroll-behavior:contain;}
#panel.compact:not(.mini) .official-turnover{padding:4px 8px;}
#panel.compact:not(.mini) .turnover-values small{font-size:8px;line-height:9px;margin-bottom:2px;}
#panel.compact:not(.mini) .turnover-values strong{font-size:12px;line-height:15px;}
#panel.compact:not(.mini) .turnover-source{font-size:8px;line-height:9px;margin-top:2px;}
#panel.compact:not(.mini) .chart-summary{padding:5px 8px!important;}
#panel.compact:not(.mini) .chart{height:18px!important;margin:2px 0!important;}
#panel.compact:not(.mini) .hero{height:131px;min-height:131px;}
#panel.compact.mini .official-turnover{padding:3px 5px;border-radius:5px;background:transparent;border-color:#70899630;}
#panel.compact.mini .turnover-values{gap:6px;}
#panel.compact.mini .turnover-values>div+div{padding-left:6px;}
#panel.compact.mini .turnover-values small{font-size:8px;display:inline;margin-right:4px;}
#panel.compact.mini .turnover-values strong{display:inline;font-size:10px;line-height:14px;}
#panel.compact.mini .turnover-source{display:none;}
#panel.compact.mini .hero{height:92px;}
#panel.compact.mini .statusline{max-height:14px;min-height:14px;font-size:9px;line-height:14px;}
#panel.compact.mini #overview-page{gap:3px;}
#panel.compact.mini .mini-context{height:13px;min-height:13px;font-size:9px;}
#panel.compact.mini .hero{height:67px;min-height:67px;max-height:67px;}
#panel.compact.mini .stats{height:25px;min-height:25px;padding:3px 5px;}
#panel.compact.mini .stats small{font-size:7px;line-height:8px;margin-bottom:1px;}
#panel.compact.mini .stats strong{font-size:10px;line-height:11px;}
#panel.compact.mini .official-turnover{padding:2px 5px;min-height:25px;}
#panel.compact.mini .turnover-values small{display:block;font-size:7px;line-height:8px;margin:0;}
#panel.compact.mini .turnover-values strong{display:block;font-size:10px;line-height:11px;}
.report-official-turnover{flex:none;background:#172b34;border:1px solid #637f8c38;border-radius:8px;padding:8px 10px;margin:6px 0;}
.report-official-turnover>small{font-size:10px;color:#adc4cd;}
.report-official-turnover>div{display:flex;gap:14px;margin-top:5px;flex-wrap:wrap;font-size:10px;}
.report-official-turnover strong{font-size:12px;color:#d6ece4;font-variant-numeric:tabular-nums;}
.report-official-turnover p{font-size:9px;line-height:14px;color:#9eb7c3;margin:5px 0 0;}
`;
  function renderOfficialTurnover(shadow, view) {
    const q = (id) => shadow.getElementById(id);
    for (const period of ["today", "week"]) {
      const item = view?.[period];
      const known = item?.value !== null && item?.value !== void 0 && Number.isFinite(item.value);
      const text2 = known ? item.value.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : "\u5F85\u540C\u6B65";
      const title = item ? `${item.scope}\uFF5C${item.range}\uFF5C${item.status}${item.updatedAt ? `\uFF5C\u66F4\u65B0 ${new Date(item.updatedAt).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}` : ""}` : "\u5F85\u540C\u6B65\u5B98\u65B9\u5831\u8868\uFF0C\u4E0D\u4EE5\u672C\u5DE5\u5177\u672C\u91D1\u63A8\u7B97";
      for (const id of [`official-${period}`, `report-official-${period}`]) {
        const element = q(id);
        if (element) {
          element.textContent = text2;
          element.title = title;
        }
      }
    }
    const source = q("official-source");
    const note = q("report-official-source");
    if (source) {
      source.textContent = "\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u984D \xB7 \u975E\u672C\u5DE5\u5177\u6CE8\u984D\u4F30\u7B97";
      source.title = view ? `${view.today.scope}\uFF1B${view.today.status}\uFF1B${view.week.status}` : "\u7B49\u5F85\u5B98\u65B9\u4F86\u6E90";
    }
    if (note) note.textContent = `${view?.today.scope ?? "\u5B98\u65B9\u5831\u8868"}\uFF1B\u8FD17\u65E5\u4F9D\u5E73\u53F0\u671F\u9593\uFF0C\u8207\u672C\u5DE5\u5177\u4E0B\u6CE8\u7D00\u9304\u5206\u958B\u7D71\u8A08\u3002`;
  }

  // lib/dg-panel-data.ts
  function cumulativePoints(bets, width = 250, height = 43) {
    const ordered = bets.filter((b) => b.state === "settled" && Number.isFinite(b.pnl)).slice().sort((a, b) => (a.settledAt ?? a.acceptedAt ?? a.createdAt) - (b.settledAt ?? b.acceptedAt ?? b.createdAt));
    if (!ordered.length) return `0,${height / 2} ${width},${height / 2}`;
    let sum = 0;
    const values = [0, ...ordered.map((b) => sum += b.pnl ?? 0)];
    const low = Math.min(...values), high = Math.max(...values), span = high - low || 1;
    return values.map((v, i) => `${(i / Math.max(1, values.length - 1) * width).toFixed(1)},${(height - 4 - (v - low) / span * (height - 8)).toFixed(1)}`).join(" ");
  }
  function chartSummary(bets) {
    const ordered = bets.filter((b) => b.state === "settled" && Number.isFinite(b.pnl)).slice().sort((a, b) => (a.settledAt ?? a.acceptedAt ?? a.createdAt) - (b.settledAt ?? b.acceptedAt ?? b.createdAt));
    let total = 0;
    const values = [0, ...ordered.map((b) => total += b.pnl ?? 0)];
    return { count: ordered.length, total, low: Math.min(...values), high: Math.max(...values) };
  }
  function periodBets(bets, period, now = Date.now()) {
    const day = 864e5, offset = 288e5, start = Math.floor((now + offset) / day) * day - offset;
    const from = period === "yesterday" ? start - day : period === "week" ? start - 6 * day : start;
    const until = period === "yesterday" ? start : start + day;
    return bets.filter((b) => b.createdAt >= from && b.createdAt < until && ["submitted", "accepted", "rejected", "uncertain", "settled"].includes(b.state));
  }

  // lib/dg-button-feedback.ts
  function installDgButtonFeedback(root) {
    const timers = /* @__PURE__ */ new Map();
    let held = null;
    function button(event) {
      const node = event.target instanceof Element ? event.target.closest('button,[role="button"]') : null;
      return node && !(node instanceof HTMLButtonElement && node.disabled) ? node : null;
    }
    function clear(node) {
      const timer = timers.get(node);
      if (timer) clearTimeout(timer);
      timers.delete(node);
      node.removeAttribute("data-pressed");
    }
    function release() {
      if (held) clear(held);
      held = null;
    }
    function press(event) {
      release();
      held = button(event);
      if (held) held.dataset.pressed = "true";
    }
    function keydown(event) {
      const e = event;
      if (e.key === "Enter" || e.key === " ") press(e);
    }
    function keyup(event) {
      const e = event;
      if (e.key === "Enter" || e.key === " ") release();
    }
    function click(event) {
      const node = button(event);
      if (!node) return;
      clear(node);
      node.dataset.pressed = "true";
      timers.set(node, setTimeout(() => clear(node), 160));
    }
    root.addEventListener("pointerdown", press, true);
    root.addEventListener("pointerup", release, true);
    root.addEventListener("pointercancel", release, true);
    root.addEventListener("pointerout", release, true);
    root.addEventListener("keydown", keydown, true);
    root.addEventListener("keyup", keyup, true);
    root.addEventListener("click", click, true);
    return () => {
      release();
      for (const node of [...timers.keys()]) clear(node);
      root.removeEventListener("pointerdown", press, true);
      root.removeEventListener("pointerup", release, true);
      root.removeEventListener("pointercancel", release, true);
      root.removeEventListener("pointerout", release, true);
      root.removeEventListener("keydown", keydown, true);
      root.removeEventListener("keyup", keyup, true);
      root.removeEventListener("click", click, true);
    };
  }

  // lib/dg-panel-resize.ts
  function installDgPanelResize(handles, options) {
    const cleanups = [];
    for (const handle of handles) {
      let down2 = function(e) {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault();
        e.stopPropagation();
        const target = handle.parentElement;
        const size = options.getSize(target);
        options.prepare(target);
        active = { id: e.pointerId, x: e.clientX, y: e.clientY, size };
        try {
          handle.setPointerCapture?.(e.pointerId);
        } catch {
        }
        handle.dataset.resizing = "true";
      }, move2 = function(e) {
        if (!active || active.id !== e.pointerId) return;
        e.preventDefault();
        const fit = Math.max(0.2, active.size.scale);
        options.apply(
          Math.max(260, Math.min(520, active.size.width + (e.clientX - active.x) / fit)),
          Math.max(360, Math.min(900, active.size.height + (e.clientY - active.y) / fit))
        );
      }, end2 = function(e) {
        if (!active || active.id !== e.pointerId) return;
        if (handle.hasPointerCapture?.(e.pointerId)) handle.releasePointerCapture(e.pointerId);
        active = null;
        delete handle.dataset.resizing;
      }, key2 = function(e) {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        const size = options.getSize(handle.parentElement);
        options.prepare(handle.parentElement);
        const delta = e.shiftKey ? 30 : 10;
        options.apply(
          Math.max(260, Math.min(520, size.width + (e.key === "ArrowRight" ? delta : e.key === "ArrowLeft" ? -delta : 0))),
          Math.max(360, Math.min(900, size.height + (e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0)))
        );
      }, lost2 = function() {
        active = null;
        delete handle.dataset.resizing;
      };
      var down = down2, move = move2, end = end2, key = key2, lost = lost2;
      let active = null;
      handle.addEventListener("pointerdown", down2);
      handle.addEventListener("pointermove", move2);
      handle.addEventListener("pointerup", end2);
      handle.addEventListener("pointercancel", end2);
      handle.addEventListener("lostpointercapture", lost2);
      handle.addEventListener("keydown", key2);
      cleanups.push(() => {
        active = null;
        delete handle.dataset.resizing;
        handle.removeEventListener("pointerdown", down2);
        handle.removeEventListener("pointermove", move2);
        handle.removeEventListener("pointerup", end2);
        handle.removeEventListener("pointercancel", end2);
        handle.removeEventListener("keydown", key2);
        handle.removeEventListener("lostpointercapture", lost2);
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }

  // lib/dg-provider-logos.ts
  var DG_PROVIDER_LOGOS = { "chatgpt": '<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"></path></svg>', "gemini": '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Gemini</title><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-0-_R_0_)"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-1-_R_0_)"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-2-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-0-_R_0_" x1="7" x2="11" y1="15.5" y2="12"><stop stop-color="#08B962"></stop><stop offset="1" stop-color="#08B962" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-1-_R_0_" x1="8" x2="11.5" y1="5.5" y2="11"><stop stop-color="#F94543"></stop><stop offset="1" stop-color="#F94543" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-2-_R_0_" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stop-color="#FABC12"></stop><stop offset=".46" stop-color="#FABC12" stop-opacity="0"></stop></linearGradient></defs></svg>', "grok": '<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Grok</title><path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"></path></svg>', "meta": '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>MetaAI</title><path d="M10.547.232c.776-.086 1.543.244 2.152.712.784.598 1.375 1.434 1.757 2.347.19.444.3.92.345 1.402.01.384.024.781-.108 1.148-.126.406-.362.795-.728 1.017-.352.236-.786.3-1.199.288-.84-.073-1.613-.52-2.212-1.106-.15-.1-.236-.263-.368-.38-.801-.97-1.394-2.203-1.324-3.496.048-.698.38-1.44 1.03-1.75.206-.1.428-.164.655-.182z" fill="url(#lobe-icons-meta-ai-0-_R_0_)"></path><path d="M18.595 3.077c.52-.045 1.032.186 1.4.551.402.434.625 1.006.736 1.584.096.605.09 1.233-.048 1.83a5.97 5.97 0 01-.907 2.19c-.198.25-.382.519-.633.719-.493.45-1.181.725-1.848.598-.42-.08-.819-.306-1.085-.646-.514-.591-.687-1.403-.714-2.17a6.11 6.11 0 011.03-3.285c.237-.314.49-.62.797-.867.375-.27.805-.486 1.272-.504z" fill="url(#lobe-icons-meta-ai-1-_R_0_)"></path><path d="M5.038 4.172c.618-.045 1.238.067 1.832.235.871.28 1.741.78 2.182 1.624.177.383.256.826.152 1.242-.097.442-.375.816-.71 1.105-.724.59-1.664.84-2.577.887a5.356 5.356 0 01-2.881-.675c-.39-.248-.765-.539-1.025-.93a1.9 1.9 0 01-.327-1.283c.067-.507.357-.968.741-1.289.723-.62 1.684-.873 2.613-.916z" fill="url(#lobe-icons-meta-ai-2-_R_0_)"></path><path d="M4.87 10.369c.69-.06 1.465.223 1.811.866.213.349.278.763.29 1.166.006.528-.136 1.046-.34 1.529-.34.793-.893 1.478-1.538 2.036-.64.538-1.42.951-2.26 1.015a2.031 2.031 0 01-1.467-.398c-.353-.281-.578-.707-.662-1.15-.156-.8.077-1.62.445-2.327.196-.377.444-.724.72-1.044.767-.886 1.814-1.608 3.001-1.693z" fill="url(#lobe-icons-meta-ai-3-_R_0_)"></path><path d="M20.391 11.05c.881-.087 1.872.116 2.477.822.473.58.534 1.425.239 2.102-.118.317-.32.59-.527.852-.877.962-2.11 1.553-3.379 1.744-.818.123-1.723.036-2.406-.477-.2-.161-.386-.346-.514-.573-.277-.436-.321-.994-.216-1.492.224-.904.92-1.594 1.676-2.073a5.874 5.874 0 012.65-.905z" fill="url(#lobe-icons-meta-ai-4-_R_0_)"></path><path d="M7.553 15.523c.381-.052.775.004 1.118.184.344.154.613.427.866.702.866 1.097 1.267 2.549 1.146 3.944a4.476 4.476 0 01-.497 1.61c-.273.469-.663.91-1.187 1.08-.35.103-.731.118-1.077-.005a2.53 2.53 0 01-.959-.612c-.798-.859-1.236-2.02-1.343-3.185-.055-.646-.006-1.31.21-1.923.146-.471.384-.92.738-1.265.261-.277.62-.452.985-.53z" fill="url(#lobe-icons-meta-ai-5-_R_0_)"></path><path d="M13.637 16.5a4.237 4.237 0 011.82.219c.795.286 1.542.724 2.148 1.323.535.504.963 1.162 1.099 1.899.055.379.038.785-.122 1.138-.19.465-.599.807-1.051.996-.883.364-1.887.253-2.76-.082a5.568 5.568 0 01-2.343-1.685c-.347-.445-.616-.968-.697-1.534-.042-.382-.036-.788.13-1.142.194-.418.55-.76.978-.925.25-.119.525-.174.798-.207z" fill="url(#lobe-icons-meta-ai-6-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-0-_R_0_" x1="9.789" x2="13" y1="0" y2="7.5"><stop stop-color="#C65EFF"></stop><stop offset=".5" stop-color="#EA4FFF"></stop><stop offset="1" stop-color="#9553FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-1-_R_0_" x1="19" x2="17" y1="3" y2="10.5"><stop stop-color="#CF72FF"></stop><stop offset=".5" stop-color="#E541FF"></stop><stop offset="1" stop-color="#944DFF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-2-_R_0_" x1="9" x2="2.5" y1="6.5" y2="8"><stop stop-color="#A555FF"></stop><stop offset=".5" stop-color="#DE67FF"></stop><stop offset="1" stop-color="#E581FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-3-_R_0_" x1="1" x2="6" y1="12" y2="16"><stop stop-color="#6C48FF"></stop><stop offset=".309" stop-color="#AA5AFF"></stop><stop offset="1" stop-color="#5145FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-4-_R_0_" x1="19" x2="21" y1="11.5" y2="16.5"><stop stop-color="#CA3EFF"></stop><stop offset=".5" stop-color="#AB5CFF"></stop><stop offset="1" stop-color="#5042FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-5-_R_0_" x1="6" x2="11" y1="20.5" y2="19"><stop stop-color="#5041FF"></stop><stop offset=".26" stop-color="#734FFF"></stop><stop offset=".75" stop-color="#6A4CFF"></stop><stop offset="1" stop-color="#483FFF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-6-_R_0_" x1="12" x2="18.5" y1="17.5" y2="21.5"><stop stop-color="#7B51FF"></stop><stop offset=".475" stop-color="#6049FF"></stop><stop offset="1" stop-color="#8466FF"></stop></linearGradient></defs></svg>', "combined": '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M10 3v5M14 3v5M10 16v5M14 16v5M3 10h5M3 14h5M16 10h5M16 14h5"/><circle cx="12" cy="12" r="1.5"/></svg>', "road": '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="5" r="2"/><circle cx="14" cy="12" r="2"/><path d="M18 18h3M20 16v4"/></svg>' };

  // lib/dg-provider-menu.ts
  function installDgProviderMenu(shadow, options) {
    const select = shadow.getElementById("provider");
    const trigger = shadow.getElementById("provider-trigger");
    const menu = shadow.getElementById("provider-menu");
    const currentLogo = shadow.getElementById("provider-selected-logo");
    const currentName = shadow.getElementById("provider-selected-name");
    const mainLogo = shadow.getElementById("main-strategy-logo");
    let last = "";
    const buttons = [];
    function logo(key, prefix) {
      return (DG_PROVIDER_LOGOS[key] ?? DG_PROVIDER_LOGOS.road).replace(/id="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^\)]+)\)/g, `url(#${prefix}-$1)`);
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    function sync() {
      const key = select.value;
      if (key === last) return;
      last = key;
      currentLogo.innerHTML = logo(key, "trigger");
      mainLogo.innerHTML = logo(key, "main");
      currentName.textContent = options.find((x) => x.key === key)?.label ?? key;
      for (const b of buttons) {
        const active = b.dataset.value === key;
        b.classList.toggle("selected", active);
        b.setAttribute("aria-selected", String(active));
      }
    }
    function open() {
      if (trigger.disabled) return;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const triggerBox = trigger.getBoundingClientRect();
      const surface = shadow.getElementById("settings-page").getBoundingClientRect();
      const scale = trigger.offsetHeight ? triggerBox.height / trigger.offsetHeight : 1;
      const below = Math.max(0, (surface.bottom - triggerBox.bottom) / Math.max(0.2, scale) - 10);
      const above = Math.max(0, (triggerBox.top - surface.top) / Math.max(0.2, scale) - 10);
      const up = below < 252 && above > below;
      menu.style.top = up ? "auto" : "46px";
      menu.style.bottom = up ? "46px" : "auto";
      menu.style.maxHeight = Math.min(260, Math.max(84, up ? above : below)) + "px";
      menu.style.overflowY = "auto";
    }
    trigger.onclick = () => {
      sync();
      if (menu.hidden) open();
      else close();
    };
    trigger.onkeydown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open();
        (buttons.find((b) => b.dataset.value === select.value) ?? buttons[0]).focus();
      }
    };
    for (const option of options) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.value = option.key;
      b.className = "provider-option";
      b.setAttribute("role", "option");
      b.setAttribute("aria-label", option.label);
      const mark = document.createElement("span");
      mark.className = "provider-logo";
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = logo(option.key, "option-" + option.key);
      const label = document.createElement("span");
      label.textContent = option.label;
      const check = document.createElement("span");
      check.className = "provider-check";
      check.textContent = "\u2713";
      check.setAttribute("aria-hidden", "true");
      b.append(mark, label, check);
      b.onclick = () => {
        select.value = option.key;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
        trigger.focus();
      };
      b.onkeydown = (e) => {
        const index = buttons.indexOf(b);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          buttons[(index + (e.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length].focus();
        }
        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          buttons[e.key === "Home" ? 0 : buttons.length - 1].focus();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          close();
          trigger.focus();
        }
      };
      buttons.push(b);
      menu.append(b);
    }
    function outside(e) {
      if (!e.target?.closest(".provider-picker")) close();
    }
    function escape(e) {
      if (e.key === "Escape") close();
    }
    shadow.addEventListener("pointerdown", outside);
    shadow.addEventListener("keydown", escape);
    select.addEventListener("change", sync);
    sync();
    return { sync, close, cleanup: () => {
      shadow.removeEventListener("pointerdown", outside);
      shadow.removeEventListener("keydown", escape);
      select.removeEventListener("change", sync);
      trigger.onclick = trigger.onkeydown = null;
      for (const b of buttons) b.onclick = b.onkeydown = null;
    } };
  }

  // lib/dg-panel-density.ts
  var DG_DENSITY_CSS = "/* \u56FA\u5B9A\u5916\u6846\u8CC7\u8A0A\u5BC6\u5EA6\u7248\uFF1B\u4E0D\u5F71\u97FF\u9001\u55AE\u6216\u5E33\u672C\u3002 */\n#panel.compact{padding:9px 10px;gap:0}\n.compact #head{height:25px}\n.compact #overview-page{display:flex;flex-direction:column;overflow:hidden;gap:3px}\n.compact .parallel-control{height:27px;flex:none;margin:0;gap:8px}\n.compact .parallel-control label{font-size:10px}\n.compact .parallel-control select{height:27px;font-size:11px}\n.compact .parallel-summary{height:13px;flex:none;margin:0;font-size:9px;color:#b1aab9;white-space:nowrap}\n.compact .mini-context{display:flex;align-items:center;justify-content:space-between;height:16px;flex:none;font-size:9px;color:#bbb2c5;gap:5px}\n.compact .mini-context strong{color:#e5e2e8;font-size:10px;font-variant-numeric:tabular-nums}\n.compact #mini-running{white-space:nowrap}\n.compact .hero{padding:0;flex:none;height:144px;display:flex;flex-direction:column;min-width:0;gap:0}\n.compact #target-box{height:87px;flex:none;min-width:0}\n.compact .roomline{margin:0;height:17px;gap:6px;font-size:11px}\n.compact .roomline .subtle{font-size:9px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.compact .bet-main{height:40px;margin:1px 0;gap:8px}\n.compact .ring{height:36px;width:36px}\n.compact .ring-inner{font-size:12px}\n.compact .bet-value{min-width:0;gap:5px}\n.compact .amount{font-size:28px;letter-spacing:-.8px;min-width:0;font-variant-numeric:tabular-nums;white-space:nowrap}\n.compact .amount.long-number{font-size:22px}\n.compact .side{font-size:9px;padding:3px 4px}\n.compact .meta{height:13px;font-size:9px;line-height:13px;color:#ada4b5;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.compact .steps{margin:3px 0 0;height:2px}\n.compact .step{height:2px}\n.compact .step-labels{margin:2px 0 0;font-size:8px}\n.compact .metrics{margin:2px 0 0;height:24px;flex:none}\n.compact .metrics small{font-size:8px;margin:0 0 2px;color:#a99ead}\n.compact .metrics strong{font-size:11px}\n.compact .range-view{height:8px;flex:none;margin:1px 0 2px}\n.compact .statusline{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:3px 0 0;font-size:9px;line-height:12px;color:#b8a9ba;min-height:0;height:24px;flex:none;cursor:pointer;overflow-wrap:anywhere}\n.compact .cards-result{height:19px;padding:0;margin:1px 0;flex:none;border-radius:4px;align-items:center;gap:8px}\n.compact:has(#cards-result:not([hidden])) #target-box{height:68px}\n.compact:has(#cards-result:not([hidden])) .steps,.compact:has(#cards-result:not([hidden])) .step-labels{display:none}\n.compact .cards-side{display:flex;align-items:center;gap:4px}\n.compact .cards-side>small{font-size:8px;white-space:nowrap}\n.compact .cards-side>strong{font-size:9px;float:none}\n.compact .cards-line{margin:0;gap:2px}\n.compact .playing-card{width:12px;height:16px;border-radius:2px;font-size:9px}\n.compact .stats{height:40px;flex:none;margin:0;padding:6px 8px;gap:4px}\n.compact .stats small{font-size:8px;margin-bottom:3px;white-space:nowrap}\n.compact .stats strong{font-size:11px;white-space:nowrap}\n.compact .chart-wrap{height:64px;flex:none;padding:5px 7px 3px;margin:0}\n.compact .chart-head{font-size:8px;height:11px}\n.compact .chart-head strong{font-size:9px}\n.compact .chart{height:32px;margin:3px 0 0}\n.compact .chart-empty{font-size:9px;top:30px}\n.compact .chart-foot{font-size:8px;height:10px;margin-top:2px}\n.mini-context,#table-strip{display:none}\n.compact #table-strip{display:flex;height:32px;flex:none;gap:4px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#55495d transparent}\n.table-chip{flex:none;min-width:72px;max-width:105px;padding:3px 5px;text-align:left;border:1px solid #453d4c;border-radius:5px;background:#252129;font-size:9px;line-height:12px;overflow:hidden}\n.table-chip.selected{border-color:#8aab8c;background:#2e3a31}\n.table-chip strong,.table-chip small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.table-chip strong{font-size:9px;font-weight:600}\n.table-chip small{font-size:8px;color:#b8abba}\n.compact .compact-actions{height:31px;flex:none;margin:0;padding:0;position:static;gap:6px}\n.compact .compact-actions button{height:31px;font-size:10px;border:1px solid #ffffff08}\n.compact .search-box{min-height:0;height:87px;padding:2px 0}\n.compact .search-box strong{font-size:17px}\n.compact .search-note{font-size:9px}\n#hero-status:focus-visible{outline:1px solid #93ac93}\n.form-body label{font-size:10px;margin:8px 0 4px}\n.form-body select,.form-body input:not([type=checkbox]){height:29px;font-size:11px}\n#settings-page .page-title,#logs-page .page-title{font-size:16px;margin:8px 0 6px}\n#settings-page .page-caption,#logs-page .page-caption{font-size:10px;margin-bottom:8px}\n#settings-page .settings-added{font-size:9px}\n\n.report-scroll{overflow-x:hidden}.report-card{border:1px solid #4a3b24;background:#211b13;border-radius:6px;padding:8px;margin-bottom:7px}.report-card-head{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11px;margin-bottom:5px}.report-card-head strong{font-size:11px}.report-state{color:#baaa8b;font-size:9px}.report-values{display:flex;justify-content:space-between;gap:5px;font-size:10px;font-variant-numeric:tabular-nums}.report-card-time{font-size:8px;color:#a08f72;margin-top:5px;overflow-wrap:anywhere}.report-footer{display:flex;flex-wrap:wrap;gap:7px}.report-footer>span:first-child{width:100%;font-size:10px;line-height:1.5}.report-scroll .report-empty{padding:16px 8px}.report-note{font-size:9px}\n\n.compact .tools{gap:1px}.compact .tools button{width:21px;height:23px;font-size:13px}.compact .brand{font-size:11px}.compact .parallel-summary{color:#c8bfce}.compact .mini-context{font-size:10px;color:#c9c2d1}.compact .subtle,.compact .meta{font-size:10px;color:#c3bacb}.compact .step-labels{font-size:9px;color:#ada4b5}.compact .metrics small,.compact .stats small{font-size:9px;color:#c0b4c8}.compact .chart-head,.compact .chart-foot{font-size:9px;color:#c3b8cc}.compact .chart-empty{color:#b9adc3}.compact .table-chip small{font-size:9px;color:#cec3d5}.compact .table-chip strong{font-size:10px}.compact .chart-wrap{height:65px}.form-body #zoom{height:20px;padding:0;accent-color:#8ead95}.page-caption,.settings-added,.fineprint{color:#c1b5ca!important;font-size:10px!important}.form-body label{color:#e0d6e7}.ack{font-size:10px!important}.report-note,.report-card-time,.report-state{font-size:10px;color:#c9b794}.report-values{font-size:11px}.report-card-head strong{font-size:12px}\n\n*{scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important;width:0;height:0}#overview-page,#settings-page,#logs-page,.report-scroll,#events,#table-strip{scrollbar-width:none!important;-ms-overflow-style:none}#table-strip{overscroll-behavior-x:contain}\n\n.choose-tables{height:27px;font-size:10px;padding:0 6px;border:1px solid #544c5c;border-radius:6px;background:#28222e;flex:none}.rooms-back{width:100%;height:32px;margin-top:14px;border-radius:7px;background:#34473a;font-size:11px}#rooms-page{flex:1;min-height:0;overflow:auto}#rooms-page .room{font-size:11px;min-height:31px;padding:7px 10px}#rooms-page .page-title{font-size:16px;margin:10px 0}\n\n:host{--gold:#d5b779;--mint:#9bd0af;--muted:#b4bec2;color:#f1f5f3;-webkit-font-smoothing:antialiased}\n#panel,#panel.compact{background:radial-gradient(ellipse at 100% 0,#33423b40,transparent 50%),linear-gradient(165deg,#171e1e,#111718 75%);border:1px solid #84968a38;box-shadow:0 14px 38px #0008,inset 0 1px 0 #ffffff0c}\n.compact .brand{color:#ecdfbe;font-weight:700;letter-spacing:.1px}.dot{background:#a5d4b1;box-shadow:0 0 8px #a5d4b155}\n.tools button{background:#25302f;border:1px solid #90a29320;color:#b8c7c2;display:grid;place-items:center}.tools button svg{width:13px;height:13px;stroke:currentColor;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round}.tools button:hover{background:#34443e;color:#f2e3bb}.tools button.active{color:#e8c890;border-color:#d5b77988;background:#50432e}\nbutton{transition:background .12s,border-color .12s,color .12s}button:disabled{cursor:default;opacity:.6}select,input:not([type=checkbox]){outline:none}.parallel-control select,.form-body select,.form-body input:not([type=checkbox]){background:#232d2d;border-color:#82938b44;color:#f0f5f1;border-radius:7px}.parallel-control select:focus,.form-body select:focus,.form-body input:focus{border-color:#d5b779;box-shadow:0 0 0 2px #d5b77917}\n.choose-tables{background:#38372a;border-color:#b49a6355;color:#ead7ac}.compact .parallel-summary{color:#acbab4}.compact .mini-context{color:#a7b7af}.compact #mini-running{color:#d2c49e}.compact .roomline{color:#edf5ef}.compact .meta,.compact .subtle{color:#becbc4}.compact .amount{color:#f5f8f3;text-shadow:0 2px 12px #b8d1b211}.side{background:#623d354d;color:#f4a38c}.side.player{background:#324b6455;color:#aad4ff}.ring-inner{background:#1b2623;color:#d8e9db}\n.compact .stats{background:linear-gradient(115deg,#28352f,#222c2b);border:1px solid #93aa9726;border-radius:8px}.compact .stats small,.compact .metrics small{color:#bec9c1}.green{color:#a1d8b2!important}.red{color:#eeac9c!important}\n.compact .chart-wrap{background:#14201d;border-color:#92a99924;border-radius:8px}.compact .chart-head{color:#c1ccbf}.compact .chart-head strong{color:#d7bf8e}.compact .chart-foot{color:#b1bdb1}.chart polyline{stroke:#9ac9a7}.chart .chart-dot{fill:#cde2af}.chart .chart-area{fill:#9ac9a722}\n.table-chip{background:#24302e;border-color:#84988a33;border-radius:7px}.table-chip.selected{background:linear-gradient(120deg,#3b4738,#2a3930);border-color:#c2b58288}.compact .table-chip strong{color:#f0ebda}.compact .table-chip small{color:#b8c9bc}\n.compact .compact-actions button{background:#293634;border-color:#90a79835;color:#e3ede5;font-weight:600;border-radius:8px}.compact .compact-actions #compact-stop{background:linear-gradient(120deg,#3c644d,#2d523d);color:#ddf1df;border-color:#8ec09755}.compact .compact-actions #compact-stop.live{background:linear-gradient(120deg,#733f36,#58342e);color:#ffe1d4;border-color:#d68d7655}\n.form-body label{color:#d9e1d8}.settings-added{color:#b8c9bd!important}.ack{color:#c9d4cb!important}.ack input{accent-color:#bba675}.setting-actions #start,.rooms-back{background:#3b614d;color:#e9f4e8}.setting-actions #once{background:#4a4935;color:#e7dcbd}.setting-actions #stop{background:#673b32;color:#f7d5c9}.room{background:#25322d;border-color:#87998c44;color:#d4dfd5}.room.active{background:#494734;border-color:#c5ae73;color:#f4e1b7}\n.page-title{color:#f1e5c7}.log-status{background:#26342e;border:1px solid #8ba78e30;color:#e2e7d5!important}#events{font-size:10px;color:#c5d2c8}.report-shell{background:linear-gradient(155deg,#19201b,#131a17);border-color:#a893654d}.report-card{background:linear-gradient(120deg,#29332a,#222d25);border-color:#b19c6636;border-radius:8px}.report-card-head strong{color:#f3e4c1}.report-state,.report-note,.report-card-time{color:#bfccb7}.report-filter select,.report-filter button{background:#263428;border-color:#97a58355}.report-head button,.report-footer button{background:#3a4434;border-color:#98a68355}.report-head h2{color:#e7d3a2}.report-tabs button.selected{color:#e7c784;border-color:#d0b571}\n\n.compact #head{height:50px;flex:none}.compact .topline{height:48px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px}.compact .brand{font-size:13px;line-height:15px}.compact .tools{width:100%;gap:3px;justify-content:space-between}.compact .tools button{height:28px;width:25px;min-width:25px;border-radius:6px;background:#304039;border-color:#a4bbab66;color:#e2eade;box-shadow:inset 0 1px 0 #ffffff12}.compact .tools #nav-overview,.compact .tools #nav-settings,.compact .tools #nav-logs{width:43px;display:flex;gap:3px;justify-content:center;font-size:10px}.compact .tools button svg{width:15px;height:15px}.compact .tools #nav-overview svg,.compact .tools #nav-settings svg,.compact .tools #nav-logs svg{width:12px;height:12px}.compact .tools button.active{background:#6a5931;border-color:#dbc584;color:#fff0bf;box-shadow:0 0 7px #dcc48220}.compact .tools #hide{color:#e9b6a5;background:#533a33;border-color:#c7947766}.compact .hero{height:119px}.compact .metrics{display:none}.compact .statusline{margin-top:5px}.compact .hero #target-box{height:87px}.compact:has(#cards-result:not([hidden])) .hero #target-box{height:68px}.compact .bet-main{margin-top:2px}.compact #overview-page{gap:3px}\n\n#head{height:50px;flex:none}.topline{height:48px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px}.brand{font-size:13px;line-height:15px}.tools{width:100%;gap:3px;justify-content:space-between}.tools button,.compact .tools button{flex:none;padding:0}.tools #nav-overview,.tools #nav-settings,.tools #nav-logs{width:43px;display:flex;gap:3px;justify-content:center;font-size:10px}.tools #nav-overview svg,.tools #nav-settings svg,.tools #nav-logs svg{display:none}.tools span{white-space:nowrap;line-height:1;flex:none}.tools button{height:28px;width:25px;border-radius:6px}.tools button.active{background:#6a5931;border-color:#dbc584;color:#fff0bf}.brand{color:#ecdfbe;font-weight:700}\n\n.risk-overlay{position:absolute;right:0;top:0;width:276px;height:448px;z-index:10;display:grid;place-items:center;background:#08110ed9;backdrop-filter:blur(4px);border-radius:15px;transform:scale(var(--fit));transform-origin:top right;padding:12px}.risk-card{width:100%;padding:16px 12px 14px;border:1px solid #b7a06888;border-radius:12px;background:linear-gradient(155deg,#2c3123,#19221b);box-shadow:0 10px 25px #0007;text-align:center}.risk-triangle{width:74px;height:67px;margin:0 auto 8px;display:block;filter:drop-shadow(0 0 9px #d7b96b33)}.risk-triangle>path:first-child{fill:#e4c274;stroke:#f4dfa4;stroke-width:2;stroke-linejoin:round}.risk-mark{fill:none;stroke:#3a2a15;stroke-width:6;stroke-linecap:round}.risk-point{fill:#3a2a15}.risk-card h2{font-size:18px;color:#f2dfae;margin:0 0 13px}.risk-copy{font-size:13px;line-height:1.9;text-align:left;color:#eee8d7;margin:0 0 17px;overflow-wrap:anywhere}.risk-ack{display:flex;align-items:center;gap:7px;text-align:left;font-size:11px;line-height:1.6;color:#d3e3d5;margin:0 0 16px}.risk-ack input{margin:0;width:17px;height:17px;accent-color:#c6ad6a;flex:none}.risk-actions{display:flex;gap:8px}.risk-actions button{flex:1;height:35px;border:1px solid #84988555;border-radius:7px;background:#303d34;font-size:12px;font-weight:600;color:#e8eee8}.risk-actions #risk-confirm{background:#546d40;border-color:#b1c38588;color:#f4f3dd}.risk-actions #risk-confirm:disabled{background:#303b2b;opacity:.45;cursor:not-allowed}\n\n#panel.compact.mini{width:210px;height:228px;padding:9px;border-radius:12px}\n.compact.mini #head{height:29px}.compact.mini .topline{height:27px;flex-direction:row;align-items:center;gap:4px}.compact.mini .brand{font-size:12px;white-space:nowrap}.compact.mini .tools{width:auto;gap:0}.compact.mini .tools button{display:none}.compact.mini .tools #zoom-out{display:grid;width:31px;height:27px;color:#f7e7bc;border-color:#c5ae7366}.compact.mini .tools #zoom-out svg{width:17px;height:17px}\n.compact.mini .parallel-control,.compact.mini .parallel-summary,.compact.mini .chart-wrap,.compact.mini #table-strip{display:none}\n.compact.mini #overview-page{gap:5px}.compact.mini .mini-context{height:18px;font-size:10px}.compact.mini .hero{height:86px;padding:0}.compact.mini #target-box,.compact.mini:has(#cards-result:not([hidden])) .hero #target-box{height:60px}.compact.mini .roomline{height:16px;font-size:11px}.compact.mini .bet-main{height:39px;margin:2px 0 0;gap:6px}.compact.mini .amount{font-size:25px}.compact.mini .amount.long-number{font-size:19px}.compact.mini .ring{width:32px;height:32px}.compact.mini .bet-value{gap:4px}.compact.mini .side{font-size:9px;padding:3px}.compact.mini .meta,.compact.mini .steps,.compact.mini .step-labels,.compact.mini .cards-result{display:none}.compact.mini .statusline{font-size:10px;line-height:12px;height:24px;margin-top:2px}.compact.mini .stats{height:34px;padding:4px 6px;border-radius:6px}.compact.mini .stats small{font-size:9px;margin-bottom:2px}.compact.mini .stats strong{font-size:11px}.compact.mini .compact-actions{height:30px;gap:5px}.compact.mini .compact-actions button{height:30px;font-size:10px}.compact.mini .compact-actions #open-report{flex:.75}\n\n.compact.mini #overview-page{gap:4px}.compact.mini .hero{height:80px}.compact.mini .statusline{height:20px;line-height:10px}.compact.mini .stats{height:32px}.compact.mini .stats small{font-size:8px}\n\n.compact.mini .tools #nav-overview,.compact.mini .tools #nav-settings,.compact.mini .tools #nav-logs,.compact.mini .tools #nav-mode,.compact.mini .tools #zoom-in,.compact.mini .tools #hide{display:none}.compact.mini .bet-value{min-width:0}.compact.mini .stats>div{min-width:0}\n\n.compact.mini .topline{width:100%;justify-content:space-between}.compact.mini .tools{flex:none;width:31px}\n";

  // lib/dg-panel-pro.ts
  var DG_PRO_CSS = `
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
/* \u6240\u6709\u6309\u9215\uFF1A\u89F8\u63A7\u6309\u58D3\u3001\u6ED1\u9F20\u61F8\u505C\u3001\u9375\u76E4\u7126\u9EDE\u53CA\u9EDE\u64CA\u5F8C\u9AD8\u4EAE\u3002 */
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

  // lib/dg-panel-spacious.ts
  var DG_SPACIOUS_CSS = `
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

/* \u67D4\u548C\u547C\u5438\u6307\u793A\uFF1A\u53EA\u8868\u793A\u5DE5\u5177\u5B58\u5728\uFF0C\u4E0D\u4EE3\u8868\u4E0B\u6CE8\u6210\u529F\u6216\u9023\u7DDA\u6B63\u5E38\u3002 */
.dot { position: relative; flex: none; animation: dg-dot-breathe 2600ms ease-in-out infinite; }
.dot::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1px solid #8dd8b480; animation: dg-dot-halo 2600ms ease-in-out infinite; pointer-events: none; }
@keyframes dg-dot-breathe { 0%,100% { opacity: .65; box-shadow: 0 0 3px #83d6b133; } 50% { opacity: 1; box-shadow: 0 0 10px #83d6b188; } }
@keyframes dg-dot-halo { 0%,100% { transform: scale(.75); opacity: .15; } 50% { transform: scale(1.2); opacity: .65; } }
.risk-overlay { overflow-y: auto; align-items: safe center; }
.risk-card { flex: none; max-width: 100%; }
#panel:not(.mini) .headline, #panel:not(.mini) .hero-head, #panel:not(.mini) .main-action, #panel:not(.mini) .section-head, #panel:not(.mini) #tables, #panel:not(.mini) .footer { display: none; }
@media (prefers-reduced-motion:reduce) { .dot,.dot::after { animation: none; opacity: 1; } }
`;

  // lib/dg-panel-surfaces.ts
  var DG_SURFACES_CSS = `
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

  // lib/dg-panel-small.ts
  var DG_SMALL_CSS = `
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

  // lib/dg-panel-view.ts
  var DG_PANEL_HTML = `<style>
:host{--fit:1;position:fixed;right:24px;top:24px;z-index:2147483647;color:#f4f3f5;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;color-scheme:dark}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #9fb68f;outline-offset:2px}button{border:0;background:none;color:inherit}[hidden]{display:none!important}#panel{width:290px;border-radius:22px;background:linear-gradient(155deg,#171619,#19171b 68%,#19191c);padding:13px 13px 16px;box-shadow:0 8px 28px #0005;transform:scale(var(--fit));transform-origin:top right;border:1px solid #ffffff08}#head{touch-action:none;cursor:grab;user-select:none}#head:active{cursor:grabbing}.topline{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#989899;height:20px}.brand{display:flex;align-items:center;gap:5px}.dot{width:5px;height:5px;background:#6ca578;border-radius:50%;box-shadow:0 0 7px #72b78066}.tools{display:flex;gap:2px}.tools button{font-size:14px;width:25px;height:24px;background:#252327;border-radius:50%;color:#9d9296}.tools #hide{color:#b36157}.headline{display:flex;align-items:center;justify-content:space-between;margin:10px 0 14px}.title{font-size:21px;font-weight:760;letter-spacing:-.8px;margin:0}.balance{text-align:right}.balance small{display:block;color:#8a858d;font-size:8px;margin-bottom:3px}.balance strong{font-size:12px;font-variant-numeric:tabular-nums}.hero{padding:12px 12px 9px;background:radial-gradient(ellipse at 80% 8%,#28312a77,transparent 60%),linear-gradient(135deg,#262529,#242225);border-radius:15px}.hero-head{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:11px}.pill{font-size:9px;background:#294e3540;color:#6dac7c;padding:4px 6px;border-radius:15px;white-space:nowrap}.pill.idle{background:#414047;color:#a9a5ae}.method{font-size:8px;color:#aba5ae;text-align:right}.roomline{font-weight:650;font-size:10px;display:flex;gap:7px;align-items:center}.subtle{font-size:8px;color:#8b858e;font-weight:400}.bet-main{display:flex;align-items:center;justify-content:space-between;gap:7px;margin:6px 0 4px}.bet-value{display:flex;align-items:center;gap:7px}.amount{font-size:31px;font-weight:800;line-height:1.2;letter-spacing:-1px;font-variant-numeric:tabular-nums}.side{color:#ee6e56;background:#783d3244;border-radius:7px;font-size:9px;padding:4px 5px;white-space:nowrap}.side.player{color:#84a5e9;background:#354d8244}.ring{--progress:0deg;width:49px;height:49px;flex:none;border-radius:50%;background:conic-gradient(#73997a var(--progress),#52565344 0);padding:2px;display:grid;place-items:center}.ring-inner{width:100%;height:100%;border-radius:50%;background:#292a29;display:grid;place-items:center;color:#afbab1;font-size:12px}.meta{color:#9d929f;font-size:8px;line-height:1.6;min-height:12px}.steps{display:flex;gap:4px;margin-top:12px}.step{flex:1;height:3px;background:#514a52}.step.active{background:#629d6e;box-shadow:0 0 5px #6c996633}.step-labels{display:flex;justify-content:space-between;color:#87828b;font-size:8px;margin:5px 0 16px}.step-labels b{color:#e1dddF;font-weight:600}.metrics{display:flex;justify-content:space-between;gap:5px}.metrics>div{flex:1}.metrics>div:nth-child(2){text-align:center}.metrics>div:last-child{text-align:right}.metrics small{font-size:8px;color:#a9a0aa;display:block;margin-bottom:4px}.metrics strong{font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.meter{height:2px;background:#655a6244;margin:12px 0 11px;position:relative}.meter:after{content:"";position:absolute;left:50%;top:-2px;width:6px;height:6px;border-radius:50%;background:#a6a0a5}.main-action{width:100%;height:32px;border-radius:8px;font-weight:650;font-size:10px;background:#365140;color:#b7d3bd}.main-action.live{background:#5c302c;color:#d46b55}.action-mark{font-size:8px;margin-right:5px}.statusline{font-size:8px;line-height:1.5;color:#9e919f;margin-top:12px;min-height:14px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.section-head{display:flex;align-items:center;justify-content:space-between;margin:19px 0 8px;font-size:11px;font-weight:700}.gold{color:#bfa568;font-size:8px;font-weight:400}.stats{background:#242226;border-radius:11px;padding:12px;display:flex;justify-content:space-between;gap:5px}.stats>div{flex:1}.stats small{font-size:8px;color:#8f8794;display:block;margin-bottom:5px}.stats strong{font-size:12px;font-variant-numeric:tabular-nums}.green{color:#70b486!important}.red{color:#db7569!important}#tables{max-height:126px;overflow:auto;scrollbar-width:none}.table-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #ffffff07}.table-row:last-child{border-bottom:0}.table-badge{width:27px;height:27px;flex:none;border-radius:50%;background:#333138;color:#9fb29f;display:grid;place-items:center;font-size:9px}.table-info{flex:1;min-width:0}.table-info strong{font-size:9px}.table-info small{font-size:8px;color:#8b8391;display:block;margin-top:3px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.table-rec{text-align:right;white-space:nowrap;font-size:9px}.table-rec small{display:block;margin-top:3px;color:#8d8592;font-size:8px}.empty{padding:13px 0;color:#8b8490;font-size:9px}.footer{margin-top:10px;text-align:center;font-size:8px;color:#6f6876}.page-title{font-size:18px;margin:14px 0 5px}.page-caption{font-size:9px;color:#a49aa8;line-height:1.6;margin-bottom:13px}.form-body{max-height:460px;overflow:auto;scrollbar-width:thin;padding-right:2px}.form-body label{display:block;font-size:10px;color:#beb4c3;margin:12px 0 6px}.form-body select,.form-body input:not([type=checkbox]){width:100%;height:32px;background:#2b272e;border:1px solid #48404d;color:#e4dbe9;border-radius:7px;padding:6px 8px}.form-row{display:flex;gap:9px}.form-row>div{flex:1;min-width:0}.form-body .secondary{height:29px;border:1px solid #514657;border-radius:7px;font-size:10px;width:100%;color:#c3b7ce;background:#29232f}.scan-row{display:flex;gap:7px;align-items:center;margin:10px 0}.scan-row select{flex:1}.scan-row button{width:92px!important}#rooms{display:flex;flex-wrap:wrap;gap:5px}.room{border:1px solid #4f4459;border-radius:5px;font-size:9px;padding:5px 7px;background:#29232f}.room.active{border-color:#aa925c;background:#453b27;color:#e8daba}.ack{display:flex!important;align-items:flex-start;gap:5px;font-size:9px!important;line-height:1.6;margin:13px 0!important}.ack input{flex:none;margin:2px 0 0}.setting-actions{display:flex;gap:7px;margin-top:12px}.setting-actions button{flex:1;border-radius:7px;background:#35463a;height:31px;font-size:10px}.setting-actions #stop{background:#54312d;color:#db8277}.fineprint{font-size:8px;color:#8a7e94;line-height:1.6;margin-top:12px}.log-status{font-size:10px;color:#bcb29f;line-height:1.6;background:#252027;border-radius:9px;padding:10px;margin:12px 0}#events{white-space:pre-wrap;font-size:9px;color:#b0a5ba;line-height:1.8;max-height:430px;overflow:auto;overflow-wrap:anywhere;scrollbar-width:thin}#orb{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#f7f7f6;color:#999;box-shadow:0 0 0 4px #ffffff30,0 0 0 9px #ffffff17;font-size:10px;font-weight:700}#orb[hidden]{display:none}.titlebar{display:flex;align-items:center;gap:10px}.drag-mark{font-size:18px;color:#c1b8c5}.metrics .meter-value{font-size:10px}.range-view{width:100%;height:12px;accent-color:#70a87c;margin:6px 0 9px;cursor:default;pointer-events:none}.chart{width:100%;height:43px;display:block;margin-top:8px}.chart polyline{fill:none;stroke:#70b486;stroke-width:1.7;stroke-linejoin:round}.chart.red polyline{stroke:#da7569}.search-box{display:flex;justify-content:space-between;align-items:center;min-height:100px}.search-box strong{font-size:20px;letter-spacing:-.5px}.search-icon{width:48px;height:48px;border:2px solid #787d78;border-radius:50%;display:grid;place-items:center;color:#b4b7b4;font-size:22px}.search-note{font-size:8px;color:#928a98;line-height:1.7}.compact-actions{display:none;gap:8px;margin-top:10px}.compact-actions button{flex:1;background:#2c2930;border-radius:9px;height:33px;font-size:10px}.compact-actions #compact-stop{background:#512c29;color:#d77560}#panel.compact{width:276px;border-radius:15px;padding:10px 12px;background:#151518}.compact .headline,.compact .hero-head,.compact .main-action,.compact .section-head,.compact #tables,.compact .footer{display:none}.compact .hero{background:none;padding:7px 0 0;border-radius:0}.compact .bet-main{flex-direction:row-reverse;justify-content:flex-end;gap:12px}.compact .ring{width:44px;height:44px}.compact .bet-value{flex:1}.compact .amount{font-size:29px}.compact .steps{margin-top:10px}.compact .step-labels{margin-bottom:12px}.compact .meter{margin-top:9px}.compact .metrics{margin-top:11px}.compact .stats{border-radius:7px;margin-top:8px;padding:9px}.compact .stats small{font-size:7px}.compact .stats strong{font-size:11px}.compact .compact-actions{display:flex}.compact .chart{height:27px}.compact #hero-status{margin-top:6px}.compact .topline{height:24px}.compact .brand{color:#eee;font-weight:700;font-size:10px}.cards-result{margin:8px 0;padding:8px 5px;background:#17191b;border-radius:8px;display:flex;gap:8px}.cards-side{flex:1;min-width:0}.cards-side>small{font-size:8px;color:#96b1dc}.cards-side:last-child>small{color:#df8c84}.cards-side>strong{float:right;font-size:11px}.cards-line{display:flex;gap:4px;margin-top:6px}.playing-card{width:26px;height:36px;background:#e9e6e9;border-radius:3px;color:#222;font-size:10px;display:grid;place-items:center;background-position:center;background-size:contain;background-repeat:no-repeat}.cards-hint{font-size:7px;color:#8f8795;margin-top:4px}.report-shell{position:fixed;inset:6vh 5vw;z-index:2147483647;background:#141211;border:1px solid #645133;border-radius:11px;box-shadow:0 8px 40px #000b;color:#e6dcc8;display:flex;flex-direction:column;padding:18px;font-size:12px}.report-head{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #594626;padding-bottom:12px}.report-head h2{font-size:18px;margin:0}.report-head button{background:#403320;border-radius:5px;padding:7px 14px}.report-filter{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:15px 0}.report-filter label{font-size:11px}.report-filter select,.report-filter button{background:#292419;border:1px solid #594b31;border-radius:4px;padding:6px;color:#ddd2b7}.report-filter button.selected,.report-tabs button.selected{color:#e6bd67;border-color:#c89d42}.report-tabs{display:flex;gap:18px;border-bottom:1px solid #5d472c;margin-bottom:9px}.report-tabs button{padding:8px 0;font-size:12px;border-bottom:2px solid transparent;color:#9d9079}.report-note{font-size:10px;color:#9d9485;line-height:1.7;margin:5px 0 10px}.report-scroll{overflow:auto;flex:1;min-height:0}.report-grid{border-collapse:collapse;min-width:1040px;width:100%;font-size:11px}.report-grid th{background:#292013;color:#d9c89f;font-weight:500;white-space:nowrap;padding:10px 12px;text-align:left}.report-grid td{padding:10px 12px;border-bottom:1px solid #332a1d;white-space:nowrap}.report-footer{display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-top:12px;color:#ae9a70}.report-footer button{padding:5px 10px;border:1px solid #655232;border-radius:5px}.report-empty{padding:40px;text-align:center;color:#ad9c86}.settings-added{font-size:9px;color:#a296a9;line-height:1.6;margin:8px 0}#settings-not-in-video{color:#b89c69}.back-report{font-size:10px}.compact #settings-page,.compact #logs-page{font-size:11px}#orb svg{width:20px;height:20px}#status{color:#a9a0b0}#stop-now{width:100%}@media(max-width:500px) and (orientation:portrait){:host{right:12px;top:20px}}
.chart-wrap{margin-top:10px;background:#19171d;border:1px solid #ffffff07;border-radius:8px;padding:8px 8px 5px;position:relative}.chart-head{display:flex;justify-content:space-between;font-size:8px;color:#93889e;gap:8px}.chart-head strong{font-size:9px;color:#b3a8bf}.chart{height:64px;margin-top:7px;overflow:visible}.chart .chart-grid{stroke:#ffffff0c;stroke-width:.6}.chart .chart-zero{stroke:#ffffff20;stroke-dasharray:3 3;stroke-width:.6}.chart .chart-area{fill:#6dba8526}.chart.red .chart-area{fill:#dd727526}.chart polyline{stroke-width:1.7;stroke-linecap:round}.chart .chart-dot{fill:#89c99b}.chart.red .chart-dot{fill:#df8a81}.chart-empty{font-size:9px;color:#8f849a;text-align:center;position:absolute;left:0;right:0;top:48px}.chart-foot{display:flex;justify-content:space-between;color:#756b7f;font-size:7px;margin-top:3px}.compact .chart{height:44px}.compact .chart-wrap{padding-top:6px}.compact .chart-empty{top:38px}
.parallel-control{display:flex;align-items:center;gap:10px;margin:0 0 10px}.parallel-control label{font-size:10px;color:#c5bcca;white-space:nowrap}.parallel-control select{flex:1;min-width:0;height:30px;border:1px solid #514658;border-radius:7px;padding:4px 7px;background:#2b272e;color:#f0e8f5;font-size:10px}.parallel-summary{color:#a69baa;font-size:8px;margin:-4px 0 10px}select:disabled{opacity:.65}.compact .parallel-control{margin-top:8px}.compact .parallel-summary{font-size:8px}
#panel,#panel.compact{width:276px;height:448px;padding:10px 12px;display:flex;flex-direction:column;overflow:hidden;border-radius:15px}#head{flex:none}#overview-page,#settings-page,#logs-page{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#514658 transparent}.form-body{max-height:none;overflow:visible}.compact .parallel-control{margin:3px 0 5px;gap:8px}.compact .parallel-control label{font-size:8px}.compact .parallel-control select{height:24px;font-size:9px}.compact .parallel-summary{margin:0 0 3px;font-size:7px}.compact .roomline{margin-top:2px}.compact .hero{padding:4px 0 0}.compact .bet-main{margin:4px 0 2px}.compact .steps{margin-top:7px}.compact .step-labels{margin:4px 0 9px}.compact .metrics{margin-top:4px}.compact .range-view{margin:3px 0 4px;height:9px}.compact .statusline{margin-top:5px;min-height:12px;font-size:7px}.compact .stats{padding:8px;margin-top:6px}.compact .chart-wrap{padding:6px 7px 4px;margin-top:6px}.compact .chart{height:39px;margin-top:5px}.compact .chart-foot{font-size:6px}.compact .compact-actions{margin-top:6px;position:sticky;bottom:0;background:#151518;padding-top:4px;padding-bottom:1px}.compact .compact-actions button{height:31px}.mini #overview-page{overflow:hidden}.mini .headline,.mini .metrics,.mini #pnl-range,.mini #chart-wrap,.mini .steps,.mini .step-labels,.mini .statusline,.mini #cards-result,.mini .section-head,.mini #tables,.mini #table-strip,.mini .footer,.mini .range-view{display:none}.mini .parallel-control{margin:3px 0 5px}.mini .parallel-summary{margin:0 0 4px}.mini .mini-context{margin:3px 0 5px}.mini .hero{padding:4px 0 0}.mini .bet-main{margin:4px 0 5px}.mini .compact-actions{display:flex;margin-top:5px;position:static}.mini .compact-actions button{height:31px}.report-shell{position:absolute;inset:auto;right:0;top:0;width:276px;height:448px;padding:10px;transform:scale(var(--fit));transform-origin:top right;border-radius:15px}.report-head h2{font-size:15px}.report-head button{padding:5px 8px;font-size:9px}.report-filter{gap:5px;margin:8px 0}.report-filter label{font-size:8px}.report-filter select,.report-filter button{padding:4px;font-size:8px}.report-tabs{gap:12px}.report-tabs button{font-size:10px}.report-note{font-size:8px}.report-footer{font-size:8px;gap:5px}.report-footer button{padding:4px;font-size:8px}.report-empty{padding:20px 8px}.report-grid{font-size:9px}.report-grid th,.report-grid td{padding:7px 8px}
${DG_DENSITY_CSS}
${DG_PRO_CSS}
${DG_SPACIOUS_CSS}
${DG_SURFACES_CSS}
${DG_SMALL_CSS}
${OFFICIAL_TURNOVER_CSS}
.doubling-reminder{border-left:3px solid #cba86a;border-radius:5px;padding:8px 9px;background:#a4793324;color:#e6c995;font-size:10px;line-height:1.6;margin:8px 0;}
</style>

<section id="panel">
<header id="head"><div class="topline"><span class="brand"><i class="dot"></i><span id="brand-count">\u767E\u5BB6\u5DE5\u7A0B\u5E2B</span></span><div class="tools"><button id="nav-mode" aria-label="\u5207\u63DB\u7E3D\u89BD\u8207\u5C0F\u7A97" title="\u5207\u63DB\u7E3D\u89BD\uFF0F\u767E\u5BB6\u5DE5\u7A0B\u5E2B"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16"/></svg></button><button id="nav-overview" aria-label="\u7E3D\u89BD" title="\u7E3D\u89BD"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z M9 20v-7h6v7"/></svg><span>\u7E3D\u89BD</span></button><button id="nav-settings" aria-label="\u8A2D\u5B9A" title="\u8A2D\u5B9A"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2 3 3-1 2 3-2 3 2 3-2 3-3-1-2 3-2-3-3 1-2-3 2-3-2-3 2-3 3 1z"/><circle cx="12" cy="11" r="3"/></svg><span>\u8A2D\u5B9A</span></button><button id="nav-logs" aria-label="\u7D00\u9304" title="\u7D00\u9304"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14 M5 12h14 M5 18h14"/></svg><span>\u7D00\u9304</span></button><button id="zoom-out" aria-label="\u5207\u63DB\u8FF7\u4F60\u9762\u677F" title="\u5207\u63DB\u8FF7\u4F60\u9762\u677F"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg><span id="mini-label">\u8FF7\u4F60</span></button><button id="zoom-in" aria-label="\u653E\u5927\u9762\u677F" title="\u653E\u5927"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14 M12 5v14"/></svg></button><button id="hide" aria-label="\u6536\u5408" title="\u6536\u5408"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div></div></header>
<div id="overview-page"><div class="headline"><div class="titlebar"><h1 class="title">\u7E3D\u89BD</h1><span class="drag-mark">\u2725</span></div><div class="balance"><small>\u5E73\u53F0\u9918\u984D</small><strong id="balance">\u2014</strong></div></div>
<div class="parallel-control"><label for="parallel-count">\u540C\u6642\u4E0B\u6CE8</label><select id="parallel-count" aria-label="\u540C\u6642\u4E0B\u6CE8\u684C\u6578"><option value="1" selected>1 \u684C</option><option value="3">3 \u684C</option><option value="5">5 \u684C</option><option value="all">\u6240\u6709\u5DF2\u8F09\u5165\u684C</option></select><button id="choose-tables" class="choose-tables">\u9078\u684C</button></div><div id="parallel-summary" class="parallel-summary">\u9010\u684C\u7368\u7ACB \xB7 \u4E0D\u7B49\u5176\u4ED6\u684C\u7D50\u7B97</div><div class="mini-context"><span id="mini-running">\u5DF2\u505C\u6B62</span><span>\u9918\u984D <strong id="mini-balance">\u2014</strong></span></div><div class="hero"><div class="hero-head"><span id="run-pill" class="pill idle">\u25CF \u5DF2\u505C\u6B62</span><span id="method" class="method">\u7B56\u7565 \xB7 \u99AC\u4E01</span></div><div id="search-box" class="search-box" hidden><div><strong id="search-title">\u6311\u9078\u4E0B\u6CE8\u684C\u2026</strong><div class="search-note">\u7B49\u5F85\u9078\u5B9A\u684C\u53F0\u958B\u653E\u4E0B\u6CE8</div></div><span class="search-icon">\u2315</span></div><div id="target-box"><div class="strategy-preview"><span>\u7B56\u7565</span><span class="strategy-badge"><i id="main-strategy-logo" class="provider-logo" aria-hidden="true"></i><strong id="current-strategy">AI\u7D9C\u5408</strong></span></div><div class="roomline"><span id="focus-table">\u7B49\u5F85\u684C\u53F0</span><span id="focus-phase" class="subtle">\u6E96\u5099\u4E2D</span></div><div class="amount-explainer"><span id="amount-label">\u4E0B\u4E00\u6CE8\u9810\u89BD</span><span id="amount-rule">\u57FA\u672C 100 \xB7 \u7B2C1\u968E \xD71</span></div><div class="bet-main"><div class="bet-value"><strong id="amount" class="amount">100</strong><span id="side" class="side">\u2014</span></div><div id="ring" class="ring"><span id="countdown" class="ring-inner">\u2014</span></div></div><div id="focus-meta" class="meta">\u7B49\u5019\u771F\u5BE6\u724C\u8DEF\u8207\u5012\u6578</div><div class="steps"><i id="step-1" class="step"></i><i id="step-2" class="step"></i><i id="step-3" class="step"></i><i id="step-4" class="step"></i></div><div class="step-labels"><span>\u8B80\u53D6</span><span>\u7B49\u5F85\u63A5\u53D7</span><b>\u7D50\u7B97</b><span>\u7E8C\u6CE8</span></div></div><div id="cards-result" class="cards-result" hidden><div class="cards-side"><small>\u9592 PLAYER</small><strong id="player-point">\u2014</strong><div id="player-cards" class="cards-line"></div></div><div class="cards-side"><small>\u838A BANKER</small><strong id="banker-point">\u2014</strong><div id="banker-cards" class="cards-line"></div></div></div><div class="metrics"><div><small>\u7D2F\u8A08\u6700\u4F4E</small><strong id="range-low" class="meter-value">\u2014</strong></div><div><small>\u672C\u8F2A\u640D\u76CA</small><strong id="hero-pnl">0</strong></div><div><small>\u7D2F\u8A08\u6700\u9AD8</small><strong id="range-high" class="meter-value">\u2014</strong></div></div><input id="pnl-range" class="range-view" type="range" min="0" max="100" value="50" tabindex="-1" aria-label="\u672C\u8F2A\u7D50\u7B97\u5728\u986F\u793A\u7BC4\u570D\u5167\u7684\u4F4D\u7F6E" aria-readonly="true"><button id="stop-now" class="main-action"><span class="action-mark">\u25B6</span>\u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8</button><div id="hero-status" class="statusline" role="button" tabindex="0" aria-label="\u67E5\u770B\u5B8C\u6574\u72C0\u614B">\u5C1A\u672A\u9001\u51FA\u4E0B\u6CE8</div></div>
<div class="section-head"><span>\u672C\u8F2A</span><button id="open-records" class="gold">\u8A18\u9304</button></div><div class="stats"><div><small>\u672C\u8F2A\u640D\u76CA</small><strong id="round-pnl">0</strong></div><div><small>\u8D0F\uFF0F\u8F38\uFF0F\u548C</small><strong id="round-wlt">0/0/0</strong></div><div><small>\u5BE6\u969B\u547D\u4E2D\u7387</small><strong id="hit-rate">\u2014</strong></div></div>${OFFICIAL_TURNOVER_HTML}<div id="chart-wrap" class="chart-wrap"><div class="chart-head"><span>\u7D2F\u8A08\u640D\u76CA\u8D70\u52E2</span><strong id="chart-last">\u2014</strong></div><svg id="pnl-chart" class="chart" viewBox="0 0 250 43" preserveAspectRatio="none" aria-label="\u672C\u8F2A\u5DF2\u7D50\u7B97\u640D\u76CA\u66F2\u7DDA"><path class="chart-grid" d="M0 4H250 M0 14H250 M0 25H250 M0 39H250 M0 4V39 M62 4V39 M125 4V39 M188 4V39 M250 4V39"/><line id="chart-zero" class="chart-zero" x1="0" x2="250" y1="22" y2="22"/><polygon id="chart-area" class="chart-area" points=""/><polyline id="pnl-line" points="0,22 250,22"/><circle id="chart-dot" class="chart-dot" cx="250" cy="22" r="1.6"/></svg><div id="chart-empty" class="chart-empty">\u7B49\u5F85\u9996\u7B46\u7D50\u7B97</div><div class="chart-foot"><span id="chart-low">\u6700\u4F4E \u2014</span><span id="chart-count">0 \u6CE8</span><span id="chart-high">\u6700\u9AD8 \u2014</span></div></div><div class="section-head"><span>\u5DF2\u9078\u684C\u53F0</span><button id="edit-rooms" class="gold">\u5168\u90E8</button></div><div id="tables"></div><div id="table-strip" aria-label="\u5DF2\u9078\u684C\u53F0"></div><div class="footer">\u63A8\u85A6\u50C5\u4F9B\u53C3\u8003</div></div>
<div id="settings-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u57F7\u884C\u53C3\u6578</div><h2 class="page-title">\u7B56\u7565\u8A2D\u5B9A</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg></span></div><p class="surface-note">\u8A2D\u5B9A\u65B9\u5411\u4F86\u6E90\u3001\u55AE\u6CE8\u91D1\u984D\u8207\u505C\u6B62\u689D\u4EF6\u3002</p><div class="form-body">
<section class="form-section"><h3 class="form-section-head"><i>01</i>\u63A8\u85A6\u8207\u914D\u6CE8</h3><label for="single-staking">\u914D\u6CE8\u65B9\u5F0F</label><select id="single-staking"><option value="flat">\u5E73\u6CE8 \xB7 \u6BCF\u7B46\u56FA\u5B9A\u91D1\u984D</option><option value="martingale" selected>\u99AC\u4E01 \xB7 \u8DE8\u623F\u63A5\u7E8C\uFF0C\u8F38\u5347\u968E\u3001\u8D0F\u91CD\u7F6E</option><option value="doubling">\u500D\u6295\u6CD5 \xB7 1\u21922\u21924\u21928\uFF0C\u8F38\u5F8C\u52A0\u500D\u3001\u8D0F\u91CD\u7F6E</option></select><label for="start-mode">\u958B\u59CB\u65B9\u5F0F</label><select id="start-mode"><option value="fresh" selected>\u65B0\u958B\u59CB \xB7 \u9996\u7B46\u57FA\u672C\u55AE\u6CE8</option><option value="resume">\u7E8C\u63A5 \xB7 \u6CBF\u7528\u914D\u6CE8\u968E\u7D1A</option></select><div id="staking-hint" class="settings-added"></div><p id="doubling-reminder" class="doubling-reminder" hidden>\u4F7F\u7528\u500D\u6295\u6CD5\uFF0C\u8ACB\u8A2D\u5B9A\u6B62\u76C8\u8207\u6B62\u640D\uFF1B\u9023\u7E8C\u8667\u640D\u6703\u4F7F\u4E0B\u4E00\u6CE8\u52A0\u500D\u3002</p><label id="provider-label" for="provider-trigger">\u63A8\u85A6\u4F86\u6E90</label><div class="provider-picker"><select id="provider" hidden></select><button id="provider-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="provider-menu" aria-labelledby="provider-label provider-selected-name"><span id="provider-selected-logo" class="provider-logo" aria-hidden="true"></span><span id="provider-selected-name">AI\u7D9C\u5408</span><svg class="provider-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="provider-menu" role="listbox" aria-label="\u63A8\u85A6\u4F86\u6E90" hidden></div></div></section>
<section class="form-section"><h3 class="form-section-head"><i>02</i>\u6295\u6CE8\u91D1\u984D</h3><div class="form-row"><div><label for="base">\u57FA\u672C\u55AE\u6CE8</label><input id="base" type="number" min="1" value="100"></div><div><label for="cap">\u55AE\u7B46\u4E0A\u9650</label><input id="cap" type="number" min="1" value="100000"></div></div></section>
<section class="form-section"><h3 class="form-section-head"><i>03</i>\u6B62\u640D\u8207\u6B62\u76C8</h3><div class="form-row"><div><label for="stop-loss">\u6B62\u640D\u91D1\u984D</label><input id="stop-loss" type="number" min="1" placeholder="\u672A\u8A2D\u5B9A"></div><div><label for="take-profit">\u6B62\u76C8\u91D1\u984D</label><input id="take-profit" type="number" min="1" placeholder="\u672A\u8A2D\u5B9A"></div></div><p class="field-note">\u9054\u5230\u672C\u8F2A\u5DF2\u7D50\u7B97\u640D\u76CA\u9580\u6ABB\u5F8C\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\u3002</p></section>
<span id="zoom-label" hidden>100%</span><input id="zoom" type="range" min="70" max="180" step="10" value="100" hidden><input id="range-min" hidden value=""><input id="range-max" hidden value=""><select id="scope" hidden disabled><option value="table" selected>\u9010\u684C\u7368\u7ACB</option></select><select id="count" hidden><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="all">all</option></select><button id="scan" hidden></button><div hidden><button id="start"></button><button id="once"></button><button id="stop"></button></div></div></div>
<div id="rooms-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u4E0B\u6CE8\u7BC4\u570D</div><h2 class="page-title">\u9078\u64C7\u684C\u53F0</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span></div><div class="selection-control"><span id="selection-mode">\u81EA\u52D5\u627E\u684C \xB7 \u958B\u653E\u4E0B\u6CE8\u5C31\u52A0\u5165</span><button id="auto-tables">\u81EA\u52D5\u627E\u684C\u4E2D</button></div><div id="rooms-hint" class="surface-note page-caption">\u5148\u53D6\u6D88\u4E00\u684C\uFF0C\u518D\u9078\u5176\u4ED6\u684C\u3002</div><div id="rooms"></div><button id="rooms-back" class="rooms-back">\u5B8C\u6210\u9078\u64C7\uFF0C\u56DE\u5230\u7E3D\u89BD</button></div><div id="logs-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u72C0\u614B\u8207\u7D50\u7B97</div><h2 class="page-title">\u57F7\u884C\u7D00\u9304</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7zM10 8h4M10 12h4M10 16h4"/></svg></span></div><p class="surface-note">\u4F9D\u5E8F\u67E5\u770B\u9001\u51FA\u3001\u63A5\u53D7\u53CA\u7D50\u7B97\u4E8B\u4EF6\u3002</p><div class="log-status"><span class="log-label">\u76EE\u524D\u72C0\u614B</span><div id="status"></div></div><div id="events" aria-label="\u64CD\u4F5C\u4E8B\u4EF6\u6642\u9593\u8EF8"></div></div>
<div class="compact-actions"><button id="open-report">\u6253\u958B\u6230\u7E3E</button><button id="compact-stop">\u505C\u6B62</button></div><button id="resize-panel" class="resize-grip" aria-label="\u62D6\u66F3\u8ABF\u6574\u9762\u677F\u5C3A\u5BF8" title="\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F\uFF1B\u65B9\u5411\u9375\u5FAE\u8ABF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button></section><section id="risk-dialog" class="risk-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-title" hidden><div class="risk-card"><div class="risk-emblem"><svg class="risk-triangle" viewBox="0 0 80 72" aria-hidden="true"><path d="M40 5 75 65H5Z"/><path class="risk-mark" d="M40 24v20"/><circle class="risk-point" cx="40" cy="54" r="3"/></svg></div><h2 id="risk-title">\u4F7F\u7528\u98A8\u96AA\u8072\u660E</h2><p class="risk-copy">\u81EA\u884C\u6C7A\u5B9A\u958B\u555F,\u6240\u6709\u98A8\u96AA\u81EA\u884C\u627F\u64D4,\u4E0D\u4FDD\u8B49\u7A69\u5B9A\u7372\u5229,\u7A0B\u5F0F\u4E0D\u8CA0\u76F8\u95DC\u8CAC\u4EFB</p><div id="risk-stake-summary" class="risk-stake-summary" hidden></div><p id="risk-doubling-warning" class="doubling-reminder" hidden></p><label class="risk-ack"><input id="ack" type="checkbox"><span>\u6211\u5DF2\u95B1\u8B80\u4E26\u4E86\u89E3\u4E0A\u8FF0\u98A8\u96AA</span></label><div class="risk-actions"><button id="risk-cancel">\u53D6\u6D88</button><button id="risk-confirm" disabled>\u78BA\u8A8D\u958B\u59CB</button></div></div></section><section id="report-shell" class="report-shell" hidden><header class="report-head"><div><div class="surface-kicker">\u672C\u5DE5\u5177\u8A18\u9304</div><h2>\u4E0B\u6CE8\u6230\u7E3E</h2></div><button id="close-report">\u8FD4\u56DE\u7E3D\u89BD</button></header><div class="report-filter"><label>\u904A\u6232\u5927\u5EF3 <select id="report-lobby"><option value="all">\u5168\u90E8</option><option value="DG">DG</option></select></label><label>\u904A\u6232\u985E\u578B <select id="report-game"><option value="all">\u5168\u90E8</option><option value="baccarat">\u767E\u5BB6\u6A02</option></select></label><button id="report-today" class="selected">\u4ECA\u65E5</button><button id="report-yesterday">\u6628\u65E5</button><button id="report-week">\u4E03\u65E5</button></div><div class="report-tabs"><button id="report-bets" class="selected">\u6295\u6CE8\u8A18\u9304</button><button id="report-transactions" hidden>\u4EA4\u6613\u8A18\u9304</button></div><div id="report-note" class="report-note">\u672C\u5DE5\u5177\u8A18\u9304\u7684\u4E0B\u6CE8\u8207\u7D50\u679C</div>${OFFICIAL_TURNOVER_REPORT_HTML}<div class="report-scroll"><div id="report-body" class="report-cards"></div><div id="report-empty" class="report-empty" hidden>\u5C1A\u7121\u8A18\u9304</div></div><footer class="report-footer"><span id="report-total">\u5408\u8A08 \u2014</span><span><button id="report-prev">\u4E0A\u4E00\u9801</button> <span id="report-page">1 / 1</span> <button id="report-next">\u4E0B\u4E00\u9801</button></span></footer><button id="resize-report" class="resize-grip" aria-label="\u62D6\u66F3\u8ABF\u6574\u9762\u677F\u5C3A\u5BF8" title="\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F\uFF1B\u65B9\u5411\u9375\u5FAE\u8ABF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button></section>`;

  // lib/mt-click-panel.ts
  var PROVIDERS2 = [
    { key: "combined", label: "AI\u7D9C\u5408" },
    { key: "chatgpt", label: "ChatGPT" },
    { key: "gemini", label: "Gemini" },
    { key: "grok", label: "Grok" },
    { key: "meta", label: "Meta AI" },
    { key: "road", label: "\u50B3\u7D71\u724C\u8DEF" },
    { key: "counting", label: "V38 \u56DB\u5F0F\u7B97\u724C" },
    { key: "parity", label: "\u5947\u5076\u7B56\u7565" }
  ];
  var PENDING_STATES = /* @__PURE__ */ new Set(["reserved", "submitted", "accepted", "uncertain"]);
  var STATE_LABEL = {
    reserved: "\u6E96\u5099\u4E2D",
    submitted: "\u5F85\u63A5\u53D7",
    accepted: "\u5F85\u7D50\u7B97",
    settled: "\u5DF2\u7D50\u7B97",
    rejected: "\u5E73\u53F0\u62D2\u7D55",
    aborted: "\u672A\u9001\u51FA",
    uncertain: "\u672A\u78BA\u5B9A\uFF0C\u8ACB\u6838\u5C0D"
  };
  function numberText(value) {
    return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : "\u2014";
  }
  function signedNumber(value) {
    return `${value > 0 ? "+" : ""}${numberText(value)}`;
  }
  function providerName(key) {
    return PROVIDERS2.find((option) => option.key === key)?.label ?? key;
  }
  function nameKey(value) {
    return value.trim().toUpperCase();
  }
  function waitingReason(preview) {
    const reason = preview?.reason || "";
    if (/clock.*(?:shoe|round|缺少)/i.test(reason)) return "\u7B49\u5F85\u5373\u6642\u9774\u865F\u3001\u5C40\u865F\u8207\u5012\u6578";
    if (/clock.*(?:過時|時間異常)/i.test(reason)) return "\u5373\u6642\u8CC7\u6599\u66F4\u65B0\u4E2D";
    if (/候選原生 ID/.test(reason)) return "\u540C\u540D\u684C\u8CC7\u6599\u5C1A\u672A\u540C\u6B65\uFF0C\u66AB\u4E0D\u4E0B\u6CE8";
    if (/bead|完整牌路/.test(reason)) return "\u7B49\u5F85\u5B8C\u6574\u724C\u8DEF\u540C\u6B65";
    return reason || "\u7B49\u5F85\u8CC7\u6599";
  }
  function localTime(value) {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(value);
  }
  function mountMtClickPanel(W, runner, feed, onRemove, official) {
    const existing = W.document.getElementById("__autobac_mt_click__");
    if (existing) existing.remove();
    const host = W.document.createElement("div");
    host.id = "__autobac_mt_click__";
    W.document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = DG_PANEL_HTML.replace('<option value="DG">DG</option>', '<option value="MT">MT</option>');
    const cleanupFeedback = installDgButtonFeedback(shadow);
    const q = (id) => shadow.getElementById(id);
    const panel = q("panel");
    const selectProvider = q("provider");
    for (const option of PROVIDERS2) {
      const element = W.document.createElement("option");
      element.value = option.key;
      element.textContent = option.label;
      selectProvider.append(element);
    }
    let disposed = false;
    let mini = false;
    let compact = true;
    let miniPreviousCompact = false;
    let userZoom = 1;
    let panelWidth = 280;
    let panelHeight = 560;
    let page = "overview";
    let reportPeriod = "today";
    let reportPage = 0;
    let riskTestOnce = false;
    let riskReturnFocus = null;
    let lastError = "";
    let lastEvents = "";
    const getView = () => runner.view();
    const initial = getView();
    let manualSelection = Boolean(initial.config.tableNames.length);
    let selectedNames = /* @__PURE__ */ new Map();
    for (const name of initial.selectedNames?.length ? initial.selectedNames : initial.config.tableNames) {
      if (name.trim()) selectedNames.set(nameKey(name), name);
    }
    const savedStaking = runner.state().config?.staking;
    let singleStakingPreference = initial.config.rooms === 1 ? initial.config.staking : savedStaking === "doubling" ? "doubling" : savedStaking === "martingale" ? "martingale" : "flat";
    let draft = draftFor(initial.config);
    draft.staking = singleStakingPreference;
    const providerMenu = installDgProviderMenu(shadow, PROVIDERS2);
    function draftFor(config) {
      return {
        rooms: String(config.rooms),
        base: String(config.base),
        maximum: String(config.maximum),
        provider: config.provider,
        staking: config.staking,
        startMode: config.startMode === "resume" ? "resume" : "fresh",
        takeProfit: config.takeProfit === null ? "" : String(config.takeProfit),
        stopLoss: config.stopLoss === null ? "" : String(config.stopLoss)
      };
    }
    function inputValue(id) {
      return (q(id).value ?? "").trim();
    }
    function writeDraft() {
      q("parallel-count").value = draft.rooms;
      q("count").value = draft.rooms;
      q("single-staking").value = draft.rooms === "1" ? singleStakingPreference : "flat";
      q("start-mode").value = draft.startMode;
      selectProvider.value = draft.provider;
      q("base").value = draft.base;
      q("cap").value = draft.maximum;
      q("take-profit").value = draft.takeProfit;
      q("stop-loss").value = draft.stopLoss;
      providerMenu.sync();
    }
    function readDraft(preserveSingleStaking = false) {
      draft.rooms = inputValue("parallel-count");
      draft.base = inputValue("base");
      draft.maximum = inputValue("cap");
      draft.provider = inputValue("provider");
      if (draft.rooms === "1" && !preserveSingleStaking) singleStakingPreference = inputValue("single-staking") === "doubling" ? "doubling" : inputValue("single-staking") === "martingale" ? "martingale" : "flat";
      draft.staking = singleStakingPreference;
      draft.startMode = inputValue("start-mode") === "resume" ? "resume" : "fresh";
      draft.takeProfit = inputValue("take-profit");
      draft.stopLoss = inputValue("stop-loss");
    }
    function parseOptional(value, label) {
      if (!value) return null;
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed) || parsed <= 0) throw Error(`${label}\u8ACB\u8F38\u5165\u6B63\u6574\u6578\uFF0C\u6216\u7559\u7A7A`);
      return parsed;
    }
    function draftConfig() {
      const rooms = draft.rooms === "all" ? "all" : Number(draft.rooms);
      if (rooms !== 1 && rooms !== 3 && rooms !== 5 && rooms !== "all") throw Error("\u540C\u6642\u4E0B\u6CE8\u684C\u6578\u7121\u6548");
      const base = Number(draft.base);
      const maximum = Number(draft.maximum);
      if (!Number.isSafeInteger(base) || base <= 0) throw Error("\u57FA\u672C\u55AE\u6CE8\u5FC5\u9808\u662F\u6B63\u6574\u6578");
      if (!Number.isSafeInteger(maximum) || maximum < base) throw Error("\u55AE\u7B46\u4E0A\u9650\u5FC5\u9808\u662F\u4E0D\u5C0F\u65BC\u57FA\u672C\u55AE\u6CE8\u7684\u6B63\u6574\u6578");
      if (!PROVIDERS2.some((option) => option.key === draft.provider)) throw Error("\u63A8\u85A6\u4F86\u6E90\u7121\u6548");
      const names = manualSelection ? [...selectedNames.values()] : [];
      if (manualSelection && !names.length) throw Error("\u6307\u5B9A\u684C\u6A21\u5F0F\u5C1A\u672A\u9078\u684C\uFF1B\u5148\u9078\u684C\u6216\u5207\u56DE\u81EA\u52D5\u627E\u684C");
      return {
        rooms,
        base,
        maximum,
        provider: draft.provider,
        staking: rooms === 1 ? singleStakingPreference : "flat",
        startMode: draft.startMode === "resume" ? "resume" : "new",
        tableNames: names,
        takeProfit: parseOptional(draft.takeProfit, "\u6B62\u76C8"),
        stopLoss: parseOptional(draft.stopLoss, "\u6B62\u640D")
      };
    }
    function sameNames(left, right) {
      const a = left.map(nameKey).sort();
      const b = right.map(nameKey).sort();
      return a.length === b.length && a.every((value, index) => value === b[index]);
    }
    function changedConfig(next, current) {
      const changed = {};
      if (next.rooms !== current.rooms) changed.rooms = next.rooms;
      if (next.base !== current.base) changed.base = next.base;
      if (next.maximum !== current.maximum) changed.maximum = next.maximum;
      if (next.provider !== current.provider) changed.provider = next.provider;
      if (next.staking !== current.staking) changed.staking = next.staking;
      if (next.startMode !== current.startMode) changed.startMode = next.startMode;
      if (next.takeProfit !== current.takeProfit) changed.takeProfit = next.takeProfit;
      if (next.stopLoss !== current.stopLoss) changed.stopLoss = next.stopLoss;
      if (!sameNames(next.tableNames, current.tableNames)) changed.tableNames = next.tableNames;
      return changed;
    }
    function syncDraftToRunner(showErrors = true) {
      try {
        const next = draftConfig();
        const changes = changedConfig(next, getView().config);
        if (Object.keys(changes).length) runner.configure(changes);
        lastError = "";
        return true;
      } catch (error) {
        lastError = String(error.message || error);
        if (showErrors) render();
        return false;
      }
    }
    function isLocked(view = getView()) {
      return view.running || view.busy || view.pending > 0;
    }
    function selectedPreviewNames(view) {
      if (manualSelection) return [...selectedNames.values()];
      const runnerSelected = (view.selectedNames ?? []).filter(Boolean);
      if (runnerSelected.length) return runnerSelected;
      const limit = draft.rooms === "all" ? Number.MAX_SAFE_INTEGER : Number(draft.rooms);
      return view.previews.filter((preview) => preview.ok).slice(0, limit).map((preview) => preview.tableName);
    }
    function previewFor(view, name) {
      const key = name ? nameKey(name) : "";
      return view.previews.find((preview) => nameKey(preview.tableName) === key);
    }
    function sessionBets(view) {
      if (Array.isArray(view.sessionBets)) return view.sessionBets.slice();
      const state = runner.state();
      return view.bets.slice(Math.max(0, state.sessionStart ?? 0));
    }
    function dataBets(bets) {
      return bets.map((bet) => ({
        key: bet.key,
        tableId: bet.tableName,
        gameNo: `${bet.shoe}|${bet.round}`,
        side: bet.side,
        amount: bet.amount,
        level: bet.level,
        scope: "table",
        staking: bet.staking,
        provider: bet.provider,
        state: bet.state,
        createdAt: bet.createdAt,
        settledAt: bet.settledAt,
        pnl: bet.pnl
      }));
    }
    function showPage(next) {
      if (mini && next !== "overview") setMini(false);
      page = next;
      providerMenu.close();
      for (const name of ["overview", "settings", "logs", "rooms"]) q(`${name}-page`).hidden = name !== next;
      for (const name of ["overview", "settings", "logs"]) q(`nav-${name}`).classList.toggle("active", name === next);
      fitPanel();
    }
    function setMini(value) {
      if (value === mini) return;
      if (value) {
        miniPreviousCompact = compact;
        compact = true;
        page = "overview";
      } else {
        compact = miniPreviousCompact;
      }
      mini = value;
      panel.classList.toggle("mini", mini);
      panel.classList.toggle("compact", compact);
      q("mini-label").textContent = mini ? "\u5C55\u958B" : "\u8FF7\u4F60";
      q("zoom-out").setAttribute("aria-label", mini ? "\u5C55\u958B\u5B8C\u6574\u9762\u677F" : "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
      q("zoom-out").setAttribute("title", mini ? "\u5C55\u958B\u5B8C\u6574\u9762\u677F" : "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
      const path = q("zoom-out").querySelector("path");
      if (path) path.setAttribute("d", mini ? "M5 9V5h4 M15 5h4v4 M19 15v4h-4 M9 19H5v-4" : "M5 12h14");
      showPage("overview");
      render();
    }
    function setZoom(value) {
      userZoom = Math.max(0.7, Math.min(1.8, value));
      q("zoom").value = String(Math.round(userZoom * 100));
      fitPanel();
    }
    function fitPanel() {
      if (disposed) return;
      const top = Math.max(0, host.getBoundingClientRect().top);
      const overlay = !q("risk-dialog").hidden || !q("report-shell").hidden;
      const baseWidth = mini && !overlay ? 210 : panelWidth;
      const widthScale = Math.min(userZoom, Math.max(0.2, (W.innerWidth - 24) / baseWidth));
      const fullHeight = Math.min(panelHeight, Math.max(360, (W.innerHeight - top - 16) / Math.max(0.2, widthScale)));
      const height = mini && !overlay ? 228 : fullHeight;
      const scale = Math.max(0.2, Math.min(widthScale, (W.innerHeight - top - 12) / height));
      host.style.setProperty("--full-width", `${panelWidth}px`);
      host.style.setProperty("--full-height", `${fullHeight}px`);
      host.style.setProperty("--fit", String(scale));
      q("zoom-label").textContent = `${Math.round(scale * 100)}%`;
    }
    function reportData(view) {
      const source = view.bets;
      const mapped = dataBets(source);
      const byKey = new Map(source.map((bet) => [bet.key, bet]));
      return periodBets(mapped, reportPeriod).map((bet) => byKey.get(bet.key)).filter((bet) => Boolean(bet));
    }
    function renderReport(view = getView()) {
      const all = reportData(view);
      const lobby = q("report-lobby").value;
      const game = q("report-game").value;
      const records = (lobby === "all" || lobby === "MT") && (game === "all" || game === "baccarat") ? all : [];
      const perPage = 6;
      const pages = Math.max(1, Math.ceil(records.length / perPage));
      reportPage = Math.max(0, Math.min(reportPage, pages - 1));
      const body = q("report-body");
      body.replaceChildren();
      for (const bet of records.slice().reverse().slice(reportPage * perPage, (reportPage + 1) * perPage)) {
        const row = W.document.createElement("article");
        row.className = "report-card";
        const head2 = W.document.createElement("div");
        head2.className = "report-card-head";
        const title = W.document.createElement("strong");
        title.textContent = `${bet.tableName || "\u2014"} \xB7 ${bet.side}`;
        const state = W.document.createElement("span");
        state.className = "report-state";
        state.textContent = STATE_LABEL[bet.state];
        head2.append(title, state);
        const values = W.document.createElement("div");
        values.className = "report-values";
        const stake = W.document.createElement("span");
        stake.textContent = `\u4E0B\u6CE8 ${numberText(bet.amount)}`;
        const pnl = W.document.createElement("strong");
        pnl.textContent = typeof bet.pnl === "number" && Number.isFinite(bet.pnl) ? `\u640D\u76CA ${signedNumber(bet.pnl)}` : "\u640D\u76CA\u5F85\u5B9A";
        if (typeof bet.pnl === "number" && bet.pnl !== 0) pnl.className = bet.pnl > 0 ? "green" : "red";
        values.append(stake, pnl);
        const time = W.document.createElement("div");
        time.className = "report-card-time";
        time.textContent = `\u4E0B\u6CE8 ${localTime(bet.createdAt)}${bet.reason ? ` \xB7 ${bet.reason}` : ""}`;
        row.append(head2, values, time);
        body.append(row);
      }
      q("report-empty").hidden = records.length > 0;
      q("report-empty").textContent = "\u6B64\u671F\u9593\u5C1A\u7121\u672C\u5DE5\u5177\u4E0B\u6CE8\u8A18\u9304";
      q("report-note").textContent = "\u672C\u5DE5\u5177\u8A18\u9304\u7684\u4E0B\u6CE8\u8207\u7D50\u679C\uFF0C\u4E0D\u4EE3\u8868\u5E73\u53F0\u6B77\u53F2";
      const settled = records.filter((bet) => bet.state === "settled" && Number.isFinite(bet.pnl));
      const totalPnl = settled.reduce((sum, bet) => sum + (bet.pnl ?? 0), 0);
      q("report-total").textContent = `${records.length} \u7B46 \xB7 \u4E0B\u6CE8 ${numberText(records.reduce((sum, bet) => sum + bet.amount, 0))} \xB7 \u5DF2\u7D50\u7B97\u640D\u76CA ${signedNumber(totalPnl)}`;
      q("report-page").textContent = `${reportPage + 1} / ${pages}`;
      for (const period of ["today", "yesterday", "week"]) q(`report-${period}`).classList.toggle("selected", reportPeriod === period);
    }
    function renderRooms(view) {
      const rooms = q("rooms");
      rooms.replaceChildren();
      const locked = isLocked(view);
      const maximum = draft.rooms === "all" ? Number.MAX_SAFE_INTEGER : Number(draft.rooms);
      const visible = /* @__PURE__ */ new Map();
      for (const preview of view.previews) {
        if (preview.tableName) visible.set(nameKey(preview.tableName), preview.tableName);
      }
      for (const [key, name] of selectedNames) if (!visible.has(key)) visible.set(key, name);
      for (const [key, name] of visible) {
        const selected = selectedNames.has(key);
        const button = W.document.createElement("button");
        button.className = `room${selected ? " active" : ""}`;
        button.setAttribute("aria-pressed", String(selected));
        button.disabled = locked;
        const title = W.document.createElement("span");
        title.className = "room-title";
        const strong = W.document.createElement("strong");
        strong.textContent = name;
        const check = W.document.createElement("span");
        check.className = "room-check";
        check.textContent = "\u2713";
        check.setAttribute("aria-hidden", "true");
        title.append(strong, check);
        const detail = W.document.createElement("span");
        detail.className = "room-detail";
        const preview = previewFor(view, name);
        detail.textContent = selected ? "\u5DF2\u9078\u64C7 \xB7 \u50C5\u9019\u4E9B\u684C\u53F0\u53EF\u4E0B\u6CE8" : preview?.ok && preview.canBet ? "\u53EF\u4E0B\u6CE8\u6642\u52A0\u5165\u7BC4\u570D" : "\u9EDE\u9078\u52A0\u5165\u6307\u5B9A\u684C\u53F0";
        button.append(title, detail);
        button.onclick = () => {
          if (isLocked()) return;
          manualSelection = true;
          if (selectedNames.has(key)) {
            selectedNames.delete(key);
          } else if (selectedNames.size < maximum) {
            selectedNames.set(key, name);
          } else {
            lastError = `\u540C\u6642 ${draft.rooms} \u684C\u5DF2\u6EFF\uFF0C\u5148\u53D6\u6D88\u4E00\u684C\u518D\u9078\u5176\u4ED6\u684C`;
            render();
            return;
          }
          syncDraftToRunner();
          render();
        };
        rooms.append(button);
      }
      q("selection-mode").textContent = manualSelection ? "\u6307\u5B9A\u684C\u53F0 \xB7 \u4E0D\u81EA\u52D5\u88DC\u5176\u4ED6\u684C" : "\u81EA\u52D5\u627E\u684C \xB7 \u958B\u653E\u4E0B\u6CE8\u5C31\u52A0\u5165";
      q("auto-tables").disabled = locked;
      q("auto-tables").classList.toggle("selected", !manualSelection);
      q("auto-tables").textContent = manualSelection ? "\u5207\u56DE\u81EA\u52D5\u627E\u684C" : "\u81EA\u52D5\u627E\u684C\u4E2D";
      q("rooms-hint").textContent = locked ? "\u5F85\u5DF2\u9001\u51FA\u4E0B\u6CE8\u5B8C\u6210\u7D50\u7B97\u5F8C\u624D\u80FD\u6539\u9078\u3002" : manualSelection ? selectedNames.size ? `\u5DF2\u9078 ${selectedNames.size} \u684C\uFF1B\u53D6\u6D88\u5168\u90E8\u4ECD\u662F\u6307\u5B9A\u684C\u6A21\u5F0F\u3002` : "\u5C1A\u672A\u9078\u684C\uFF1B\u958B\u59CB\u6703\u88AB\u62D2\u7D55\uFF0C\u8ACB\u9078\u684C\u6216\u5207\u56DE\u81EA\u52D5\u627E\u684C\u3002" : "\u4E0D\u9078\u684C\u5373\u81EA\u52D5\u627E\u53EF\u4E0B\u6CE8\u684C\u3002";
    }
    function renderTables(view, displayedNames, current) {
      const tables = q("tables");
      const strip = q("table-strip");
      tables.replaceChildren();
      strip.replaceChildren();
      for (const name of displayedNames) {
        const preview = previewFor(view, name);
        const ownPending = view.bets.find((bet) => nameKey(bet.tableName) === nameKey(name) && PENDING_STATES.has(bet.state));
        const row = W.document.createElement("div");
        row.className = "table-row";
        const badge = W.document.createElement("span");
        badge.className = "table-badge";
        badge.textContent = ownPending?.side ?? preview?.side ?? "\u2014";
        const info = W.document.createElement("div");
        info.className = "table-info";
        const title = W.document.createElement("strong");
        title.textContent = name;
        const meta = W.document.createElement("small");
        meta.textContent = preview?.ok ? `\u9774 ${preview.shoe || "\u2014"} \xB7 \u5C40 ${preview.round ?? "\u2014"} \xB7 ${preview.pattern?.label || "\u724C\u8DEF\u5DF2\u9A57\u8B49"}` : waitingReason(preview);
        info.append(title, meta);
        const recommendation = W.document.createElement("div");
        recommendation.className = "table-rec";
        recommendation.textContent = numberText(ownPending?.amount ?? view.nextAmount);
        const status = W.document.createElement("small");
        status.textContent = ownPending ? `${STATE_LABEL[ownPending.state]} \xB7 ${ownPending.side} ${numberText(ownPending.amount)}` : preview?.ok && preview.canBet ? `\u6307\u6A19 ${preview.confidence ?? "\u2014"} \xB7 ${preview.count ?? "\u2014"}s` : waitingReason(preview);
        recommendation.append(status);
        row.append(badge, info, recommendation);
        tables.append(row);
        const chip = W.document.createElement("button");
        chip.className = `table-chip${current && nameKey(current.tableName) === nameKey(name) ? " selected" : ""}`;
        const chipTitle = W.document.createElement("strong");
        chipTitle.textContent = `${name} \xB7 ${ownPending?.side ?? preview?.side ?? "\u2014"} ${numberText(ownPending?.amount ?? view.nextAmount)}`;
        const chipStatus = W.document.createElement("small");
        chipStatus.textContent = ownPending ? STATE_LABEL[ownPending.state] : preview?.ok && preview.canBet ? "\u53EF\u4E0B\u6CE8" : waitingReason(preview);
        chip.append(chipTitle, chipStatus);
        chip.onclick = () => showPage("logs");
        strip.append(chip);
      }
      if (!displayedNames.length) {
        const empty = W.document.createElement("div");
        empty.className = "empty";
        empty.textContent = manualSelection ? "\u7B49\u5F85\u6307\u5B9A\u684C\u53F0\u8CC7\u6599" : "\u81EA\u52D5\u627E\u684C\u4E2D \xB7 \u6709\u53EF\u4E0B\u6CE8\u684C\u5C31\u52A0\u5165";
        tables.append(empty);
      }
    }
    function renderEvents(view) {
      const events = q("events");
      const feedStatus = (() => {
        try {
          return feed.status();
        } catch {
          return "";
        }
      })();
      const dataIssues = view.previews.filter((preview) => !preview.ok || !preview.canBet).map((preview) => `${preview.tableName}\uFF1A${preview.reason || "\u7B49\u5F85\u958B\u653E\u4E0B\u6CE8"}`);
      const signature = `${view.message}
${feedStatus}
${dataIssues.join("\n")}
${view.logs.map((entry) => `${entry.at}|${entry.text}`).join("\n")}`;
      if (signature === lastEvents) return;
      lastEvents = signature;
      events.replaceChildren();
      const append = (at, text2) => {
        const article = W.document.createElement("article");
        article.className = "event-card";
        if (/已接受|正式結算/.test(text2)) article.classList.add("accepted");
        if (/拒絕|失敗|不足|逾時|未確定|停止/.test(text2)) article.classList.add("warning");
        if (at !== null) {
          const time = W.document.createElement("time");
          time.textContent = new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(at);
          article.append(time);
        }
        const body = W.document.createElement("p");
        body.textContent = text2;
        article.append(body);
        events.append(article);
      };
      append(null, view.message || "\u2014");
      for (const p of view.previews) if (p.strategyReason) append(null, `${p.tableName}\uFF1A${p.strategyReason}`);
      if (feedStatus) append(null, feedStatus);
      for (const issue of dataIssues) append(null, issue);
      for (const log of view.logs.slice().reverse()) append(log.at, log.text);
    }
    function render() {
      if (disposed) return;
      const view = getView();
      renderOfficialTurnover(shadow, official?.view());
      const config = view.config;
      const locked = isLocked(view);
      const current = view.bets.find((bet) => PENDING_STATES.has(bet.state));
      const names = selectedPreviewNames(view);
      const focus = current ? previewFor(view, current.tableName) : previewFor(view, names[0]) ?? view.previews.find((preview) => preview.ok && preview.canBet) ?? view.previews.find((preview) => preview.ok);
      const settled = sessionBets(view).filter((bet) => bet.state === "settled" && Number.isFinite(bet.pnl));
      const settledData = dataBets(settled);
      const chart = chartSummary(settledData);
      const roundPnl = settled.reduce((sum, bet) => sum + (bet.pnl ?? 0), 0);
      const wins = settled.filter((bet) => (bet.pnl ?? 0) > 0).length;
      const losses = settled.filter((bet) => (bet.pnl ?? 0) < 0).length;
      const ties = settled.length - wins - losses;
      const amount = current?.amount ?? (Number.isFinite(view.nextAmount) ? view.nextAmount : NaN);
      const shownStaking = current?.staking ?? (draft.rooms === "1" ? singleStakingPreference : "flat");
      const shownLevel = current?.level ?? (!view.running && !view.pending && draft.startMode === "fresh" ? 0 : view.level);
      const multiplier = shownStaking === "doubling" ? 2 ** shownLevel : shownStaking === "martingale" ? 2 ** (shownLevel + 1) - 1 : 1;
      q("brand-count").textContent = "\u767E\u5BB6\u5DE5\u7A0B\u5E2B";
      q("balance").textContent = numberText(view.balance);
      q("mini-balance").textContent = q("balance").textContent;
      q("mini-running").textContent = `${view.running ? "\u57F7\u884C\u4E2D" : view.pending ? "\u5F85\u7D50\u7B97" : "\u5DF2\u505C\u6B62"} \xB7 ${manualSelection ? "\u6307\u5B9A\u684C" : "\u81EA\u52D5\u627E\u684C"}`;
      q("run-pill").textContent = view.running ? "\u25CF \u81EA\u52D5\u4E0B\u6CE8\u4E2D" : view.pending ? "\u25CF \u5F85\u7D50\u7B97" : "\u25CF \u5DF2\u505C\u6B62";
      q("run-pill").classList.toggle("idle", !view.running);
      q("method").textContent = `${shownStaking === "doubling" ? "\u55AE\u684C \xB7 \u500D\u6295\u6CD5" : shownStaking === "martingale" ? "\u55AE\u684C \xB7 \u99AC\u4E01" : "\u5E73\u6CE8 \xB7 \u56FA\u5B9A\u91D1\u984D"}\uFF08${draft.rooms === "all" ? "\u6240\u6709\u684C" : `${draft.rooms} \u684C`}\uFF09`;
      q("current-strategy").textContent = providerName(current?.provider ?? draft.provider);
      providerMenu.sync();
      q("focus-table").textContent = current?.tableName ?? focus?.tableName ?? "\u5C0B\u627E\u53EF\u4E0B\u6CE8\u684C";
      q("focus-phase").textContent = current ? STATE_LABEL[current.state] : focus?.ok && focus.canBet ? "\u53EF\u4E0B\u6CE8" : "\u6E96\u5099\u4E2D";
      q("amount-label").textContent = current ? current.state === "accepted" ? "\u5DF2\u63A5\u53D7\u91D1\u984D" : "\u5DF2\u9001\u51FA\u91D1\u984D" : lastError ? "\u8A2D\u5B9A\u5C1A\u672A\u5957\u7528" : "\u4E0B\u4E00\u6CE8\u9810\u89BD";
      q("amount-rule").textContent = `\u57FA\u672C ${numberText(current ? current.amount / multiplier : Number(draft.base))} \xB7 ${shownStaking !== "flat" ? `\u7B2C${shownLevel + 1}\u968E \xD7${multiplier}` : "\u5E73\u6CE8 \xD71"}`;
      q("amount").textContent = numberText(amount);
      q("amount").classList.toggle("long-number", q("amount").textContent.length > 7);
      const side = current?.side ?? focus?.side;
      q("side").textContent = side ? `${side} ${current ? "\u4E0B\u6CE8" : "\u63A8\u85A6"}` : "\u2014";
      q("side").classList.toggle("player", side === "\u9592");
      q("countdown").textContent = focus?.count == null ? "\u2014" : String(focus.count);
      const seconds = typeof focus?.count === "number" && Number.isFinite(focus.count) ? focus.count : null;
      q("ring").style.setProperty("--progress", `${seconds === null ? 0 : Math.max(0, Math.min(1, seconds / 20)) * 360}deg`);
      q("focus-meta").title = focus?.strategyReason || "";
      q("focus-meta").textContent = focus?.ok ? `\u9774 ${focus.shoe || "\u2014"} \xB7 \u5C40 ${focus.round ?? "\u2014"} \xB7 ${focus.pattern?.label || "\u724C\u8DEF\u5DF2\u9A57\u8B49"} \xB7 ${providerName(current?.provider ?? draft.provider)}` : waitingReason(focus);
      const step = current ? current.state === "accepted" ? 3 : 2 : view.running ? 1 : 0;
      for (let index = 1; index <= 4; index += 1) q(`step-${index}`).classList.toggle("active", index <= step);
      const searching = view.running && !current;
      q("search-box").hidden = compact || !searching;
      q("target-box").hidden = !compact && searching;
      q("hero-status").textContent = lastError || view.message || "\u5C1A\u672A\u9001\u51FA\u4E0B\u6CE8";
      q("hero-pnl").textContent = signedNumber(roundPnl);
      q("round-pnl").textContent = signedNumber(roundPnl);
      for (const id of ["hero-pnl", "round-pnl"]) {
        q(id).classList.toggle("green", roundPnl > 0);
        q(id).classList.toggle("red", roundPnl < 0);
      }
      q("round-wlt").textContent = `${wins}/${losses}/${ties}`;
      q("hit-rate").textContent = wins + losses ? `${(wins / (wins + losses) * 100).toFixed(1)}%` : "\u2014";
      const points = cumulativePoints(settledData);
      q("pnl-line").setAttribute("points", points);
      q("pnl-chart").classList.toggle("red", roundPnl < 0);
      const zero = 39 - (0 - chart.low) / (chart.high - chart.low || 1) * 35;
      const endpoint = points.split(" ").at(-1)?.split(",") ?? ["250", "22"];
      q("chart-zero").setAttribute("y1", String(zero));
      q("chart-zero").setAttribute("y2", String(zero));
      q("chart-dot").setAttribute("cx", endpoint[0]);
      q("chart-dot").setAttribute("cy", endpoint[1]);
      q("chart-area").setAttribute("points", chart.count ? `0,${zero} ${points} 250,${zero}` : "");
      q("chart-empty").hidden = chart.count > 0;
      q("chart-dot").style.opacity = chart.count ? "1" : "0";
      q("pnl-line").style.opacity = chart.count ? "1" : ".2";
      q("chart-last").textContent = chart.count ? signedNumber(roundPnl) : "\u5C1A\u7121\u7D50\u7B97";
      q("chart-low").textContent = chart.count ? `\u6700\u4F4E ${signedNumber(chart.low)}` : "\u6700\u4F4E \u2014";
      q("chart-high").textContent = chart.count ? `\u6700\u9AD8 ${signedNumber(chart.high)}` : "\u6700\u9AD8 \u2014";
      q("chart-count").textContent = `${chart.count} \u6CE8`;
      q("pnl-range").hidden = true;
      q("cards-result").hidden = true;
      q("parallel-count").value = draft.rooms;
      q("count").value = draft.rooms;
      q("single-staking").value = draft.rooms === "1" ? singleStakingPreference : "flat";
      q("start-mode").value = draft.startMode;
      q("parallel-count").toggleAttribute("disabled", locked);
      q("count").toggleAttribute("disabled", locked);
      q("choose-tables").toggleAttribute("disabled", locked);
      q("doubling-reminder").hidden = draft.rooms !== "1" || singleStakingPreference !== "doubling";
      q("single-staking").toggleAttribute("disabled", locked || draft.rooms !== "1");
      q("start-mode").toggleAttribute("disabled", view.running || view.busy || view.pending > 0 && draft.startMode === "resume");
      for (const id of ["provider-trigger", "base", "cap", "stop-loss", "take-profit"]) q(id).toggleAttribute("disabled", locked);
      q("staking-hint").textContent = draft.rooms === "1" ? singleStakingPreference !== "flat" ? `\u55AE\u684C${singleStakingPreference === "doubling" ? "\u500D\u62951\u21922\u21924\u21928" : "\u99AC\u4E011\u21923\u21927\u219215"}\uFF1A\u8F38\u5347\u968E\u3001\u8D0F\u6B78\u96F6\u3002${draft.startMode === "fresh" ? "\u65B0\u958B\u59CB\u9996\u7B46\u70BA\u57FA\u672C\u984D\u3002" : "\u7E8C\u63A5\u6CBF\u7528\u4E0A\u6B21\u968E\u7D1A\u3002"}` : "\u55AE\u684C\u5E73\u6CE8\uFF1A\u6BCF\u7B46\u56FA\u5B9A\u57FA\u672C\u984D\u3002" : "\u591A\u684C\u56FA\u5B9A\u5E73\u6CE8\uFF0C\u4E0D\u53EF\u66F4\u6539\u3002";
      q("parallel-summary").textContent = `${manualSelection ? `\u5DF2\u6307\u5B9A ${selectedNames.size}` : "\u81EA\u52D5\u627E"}\u684C \xB7 \u5F85\u63A5\u53D7 ${view.bets.filter((bet) => bet.state === "submitted").length} \xB7 \u5F85\u7D50\u7B97 ${view.bets.filter((bet) => bet.state === "accepted").length}`;
      q("stop-now").classList.toggle("live", view.running);
      q("stop-now").textContent = view.running ? "\u25A0  \u505C\u6B62\u81EA\u52D5\u4E0B\u6CE8" : "\u25B6  \u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8";
      q("compact-stop").classList.toggle("live", view.running);
      q("compact-stop").textContent = view.running ? "\u25A0 \u505C\u6B62\u81EA\u52D5\u4E0B\u6CE8" : "\u25B6 \u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8";
      renderTables(view, names, current);
      renderRooms(view);
      q("status").textContent = `${view.running ? "\u57F7\u884C\u4E2D" : "\u5DF2\u505C\u6B62"}\uFF5C${lastError || view.message || "\u2014"}`;
      renderEvents(view);
      if (!q("report-shell").hidden) renderReport(view);
      fitPanel();
    }
    function updateDraftFromField() {
      if (isLocked()) return;
      const previousRooms = draft.rooms;
      const nextRooms = inputValue("parallel-count");
      readDraft(previousRooms !== "1" && nextRooms === "1");
      const cap = draft.rooms === "all" ? Number.MAX_SAFE_INTEGER : Number(draft.rooms);
      while (selectedNames.size > cap) selectedNames.delete(selectedNames.keys().next().value);
      writeDraft();
      syncDraftToRunner(false);
      render();
    }
    function selectRooms() {
      if (isLocked()) return;
      manualSelection = false;
      selectedNames.clear();
      syncDraftToRunner();
      render();
    }
    function requestStart(testOnce = false) {
      const current = getView();
      if (current.running || current.busy) {
        lastError = "\u4E0A\u4E00\u500B\u6D41\u7A0B\u5C1A\u672A\u505C\u6B62\uFF0C\u8ACB\u7A0D\u5019\u518D\u958B\u59CB";
        render();
        return;
      }
      readDraft();
      if (current.pending > 0 && draft.startMode !== "resume") {
        lastError = "\u4ECD\u6709\u5F85\u7D50\u7B97\u4E0B\u6CE8\uFF1B\u8ACB\u9078\u64C7\u7E8C\u63A5\u4E0A\u4E00\u8F2A\u914D\u6CE8\u968E\u7D1A\u5F8C\u518D\u958B\u59CB";
        render();
        return;
      }
      if (!syncDraftToRunner(false)) {
        render();
        return;
      }
      riskTestOnce = testOnce;
      riskReturnFocus = shadow.activeElement;
      q("risk-stake-summary").hidden = true;
      q("risk-stake-summary").textContent = "";
      q("ack").checked = false;
      q("risk-confirm").disabled = true;
      q("risk-doubling-warning").hidden = draft.rooms !== "1" || singleStakingPreference !== "doubling";
      q("risk-doubling-warning").textContent = `\u4F7F\u7528\u500D\u6295\u6CD5\uFF0C\u8ACB\u8A2D\u5B9A\u6B62\u76C8\u8207\u6B62\u640D\u3002${!draft.takeProfit || !draft.stopLoss ? "\u76EE\u524D\u6B62\u76C8\uFF0F\u6B62\u640D\u5C1A\u672A\u5168\u90E8\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u81F3\u8A2D\u5B9A\u9801\u78BA\u8A8D\u3002" : "\u8ACB\u78BA\u8A8D\u76EE\u524D\u6B62\u76C8\u8207\u6B62\u640D\u91D1\u984D\u7B26\u5408\u4F60\u7684\u8A2D\u5B9A\u3002"}`;
      q("risk-dialog").hidden = false;
      fitPanel();
      q("ack").focus();
    }
    function cancelRisk() {
      q("risk-dialog").hidden = true;
      fitPanel();
      riskReturnFocus?.focus();
    }
    function startApproved() {
      if (!q("ack").checked) return;
      q("risk-dialog").hidden = true;
      try {
        runner.start(true, riskTestOnce);
        showPage("overview");
      } catch (error) {
        lastError = String(error.message || error);
      }
      render();
    }
    q("nav-overview").onclick = () => showPage("overview");
    q("nav-settings").onclick = () => showPage("settings");
    q("nav-logs").onclick = () => showPage("logs");
    q("nav-mode").onclick = () => {
      compact = !compact;
      panel.classList.toggle("compact", compact);
      showPage("overview");
      render();
    };
    q("zoom-out").onclick = () => setMini(!mini);
    q("zoom-in").onclick = () => {
      if (mini) setMini(false);
      else setZoom(userZoom + 0.1);
    };
    q("hide").onclick = () => setMini(true);
    q("hide").setAttribute("title", "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
    q("hide").setAttribute("aria-label", "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
    q("choose-tables").onclick = () => {
      renderRooms(getView());
      showPage("rooms");
    };
    q("edit-rooms").onclick = q("choose-tables").onclick;
    q("rooms-back").onclick = () => showPage("overview");
    q("auto-tables").onclick = selectRooms;
    q("hero-status").onclick = () => showPage("logs");
    q("hero-status").onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPage("logs");
      }
    };
    q("parallel-count").onchange = () => updateDraftFromField();
    q("count").onchange = () => {
      q("parallel-count").value = q("count").value;
      updateDraftFromField();
    };
    q("single-staking").onchange = () => updateDraftFromField();
    q("base").oninput = () => updateDraftFromField();
    q("cap").oninput = () => updateDraftFromField();
    q("take-profit").oninput = () => updateDraftFromField();
    q("stop-loss").oninput = () => updateDraftFromField();
    q("provider").onchange = () => updateDraftFromField();
    q("provider").oninput = () => updateDraftFromField();
    q("start-mode").onchange = () => {
      const view = getView();
      readDraft();
      if (!view.running && !view.busy && view.pending > 0 && draft.startMode === "resume") {
        try {
          runner.configure({ startMode: "resume" });
          lastError = "";
        } catch (error) {
          lastError = String(error.message || error);
          draft.startMode = view.config.startMode === "resume" ? "resume" : "fresh";
        }
        render();
        return;
      }
      if (isLocked(view)) {
        draft.startMode = view.config.startMode === "resume" ? "resume" : "fresh";
        writeDraft();
        render();
        return;
      }
      syncDraftToRunner(false);
      render();
    };
    q("stop-now").onclick = () => {
      if (getView().running) runner.stop();
      else requestStart();
    };
    q("compact-stop").onclick = () => q("stop-now").click();
    q("start").onclick = () => requestStart(false);
    q("once").onclick = () => requestStart(true);
    q("stop").onclick = () => runner.stop();
    q("ack").onchange = () => {
      q("risk-confirm").disabled = !q("ack").checked;
    };
    q("risk-cancel").onclick = cancelRisk;
    q("risk-confirm").onclick = startApproved;
    q("risk-dialog").onkeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelRisk();
        return;
      }
      if (event.key === "Tab") {
        const confirm = q("risk-confirm");
        const targets = [q("ack"), q("risk-cancel")];
        if (!confirm.disabled) targets.push(confirm);
        const active = targets.indexOf(shadow.activeElement);
        event.preventDefault();
        targets[(active + (event.shiftKey ? -1 : 1) + targets.length) % targets.length].focus();
      }
    };
    function openReport() {
      q("report-shell").hidden = false;
      renderReport();
      fitPanel();
    }
    q("open-records").onclick = openReport;
    q("open-report").onclick = openReport;
    q("close-report").onclick = () => {
      q("report-shell").hidden = true;
      showPage("overview");
    };
    for (const period of ["today", "yesterday", "week"]) {
      q(`report-${period}`).onclick = () => {
        reportPeriod = period;
        reportPage = 0;
        renderReport();
      };
    }
    q("report-bets").onclick = () => {
      reportPage = 0;
      renderReport();
    };
    q("report-transactions").onclick = () => renderReport();
    q("report-prev").onclick = () => {
      reportPage -= 1;
      renderReport();
    };
    q("report-next").onclick = () => {
      reportPage += 1;
      renderReport();
    };
    q("report-lobby").onchange = () => {
      reportPage = 0;
      renderReport();
    };
    q("report-game").onchange = () => {
      reportPage = 0;
      renderReport();
    };
    q("scan").onclick = () => {
      render();
    };
    let drag = null;
    const head = q("head");
    head.onpointerdown = (event) => {
      if (event.target.closest("button,input,select")) return;
      const box = host.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, left: box.left, top: box.top };
      head.setPointerCapture?.(event.pointerId);
    };
    head.onpointermove = (event) => {
      if (!drag) return;
      const fit = Number(host.style.getPropertyValue("--fit")) || 1;
      const width = (mini ? 210 : panelWidth) * fit;
      const left = Math.max(0, Math.min(W.innerWidth - width, drag.left + event.clientX - drag.x));
      const top = Math.max(0, Math.min(W.innerHeight - 50, drag.top + event.clientY - drag.y));
      host.style.left = `${left}px`;
      host.style.top = `${top}px`;
      host.style.right = "auto";
      for (const id of ["panel", "risk-dialog", "report-shell"]) {
        const node = q(id);
        node.style.transformOrigin = "top left";
        if (id !== "panel") {
          node.style.left = "0";
          node.style.right = "auto";
        }
      }
    };
    head.onpointerup = head.onpointercancel = () => {
      drag = null;
    };
    const cleanupResize = installDgPanelResize([q("resize-panel"), q("resize-report")], {
      getSize: () => ({
        width: panelWidth,
        height: Math.min(panelHeight, Number(host.style.getPropertyValue("--full-height")) || panelHeight),
        scale: Number(host.style.getPropertyValue("--fit")) || 1
      }),
      prepare: (target) => {
        const box = target.getBoundingClientRect();
        host.style.left = `${box.left}px`;
        host.style.top = `${box.top}px`;
        host.style.right = "auto";
        for (const id of ["panel", "risk-dialog", "report-shell"]) {
          const node = q(id);
          node.style.transformOrigin = "top left";
          if (id !== "panel") {
            node.style.left = "0";
            node.style.right = "auto";
          }
        }
      },
      apply: (width, height) => {
        panelWidth = Math.round(width);
        panelHeight = Math.round(height);
        fitPanel();
      }
    });
    const resize = () => fitPanel();
    W.addEventListener("resize", resize);
    runner.subscribe(() => {
      try {
        render();
      } catch (error) {
        lastError = String(error.message || error);
        if (!disposed) q("hero-status").textContent = lastError;
      }
    });
    function remove() {
      if (disposed) return;
      disposed = true;
      cleanupFeedback();
      cleanupResize();
      providerMenu.cleanup();
      W.removeEventListener("resize", resize);
      host.remove();
      void onRemove;
    }
    writeDraft();
    panel.classList.toggle("compact", compact);
    showPage("overview");
    render();
    return { remove, render, host };
  }

  // lib/official-turnover-data.ts
  function officialAmount(raw) {
    if (typeof raw !== "number" && typeof raw !== "string") return null;
    if (typeof raw === "string" && !/^\d+(?:\.\d{1,2})?$/.test(raw.trim())) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > Number.MAX_SAFE_INTEGER / 100) return null;
    return n;
  }
  function taipeiDay(now = Date.now()) {
    return new Date(now + 8 * 36e5).toISOString().slice(0, 10);
  }
  function mtOfficialRange(period, now = Date.now()) {
    const day = taipeiDay(now);
    const first = period === "today" ? day : taipeiDay(now - 6 * 864e5);
    return {
      begin_at: `${first}T00:00:00.000Z`,
      end_at: `${day}T23:59:59.000Z`,
      label: `${first} \uFF5E ${day}${period === "week" ? "\uFF08\u542B\u4ECA\u65E5\u8FD17\u65E5\uFF09" : "\uFF08\u53F0\u5317\uFF09"}`
    };
  }
  function emptyTurnover(platform, scope) {
    const make = (period) => ({
      value: null,
      status: "\u5F85\u540C\u6B65\u5B98\u65B9\u5831\u8868",
      updatedAt: null,
      range: mtOfficialRange(period).label,
      scope
    });
    return { platform, today: make("today"), week: make("week") };
  }

  // lib/mt-official-turnover.ts
  var HISTORY = "/api/v1/gametype/*/game/*/bet/history";
  var isHistory = (p) => /\/bet\/history$/.test(typeof p?.action === "string" ? p.action : p?.action?.name || "");
  function createMtOfficialTurnover(W, canRefresh = () => true) {
    let data = emptyTurnover("MT", "MT\u5B98\u65B9\u767E\u5BB6\u6A02\u5831\u8868\uFF08room_id=1\u3001\u5168\u90E8\u684C\u53F0\uFF09");
    let socket = null, disposed = false, ownSending = false;
    let day = taipeiDay(), lastCycle = 0;
    let queue = [];
    let active = null;
    let blocked = false;
    let nativeRequests = 0;
    const listeners = /* @__PURE__ */ new Map();
    const previousSend = W.WebSocket.prototype.send;
    const now = () => Date.now();
    const copy2 = () => JSON.parse(JSON.stringify(data));
    function setUnknown(status) {
      for (const p of ["today", "week"]) {
        data[p].value = null;
        data[p].updatedAt = null;
        data[p].status = status;
      }
    }
    function newDay() {
      const current = taipeiDay(now());
      if (current === day) return;
      day = current;
      data = emptyTurnover("MT", data.today.scope);
      if (active || nativeRequests) {
        blocked = true;
        queue = [];
      } else lastCycle = 0;
    }
    function consume(packet, source) {
      if (disposed || source !== socket || !isHistory(packet)) return;
      newDay();
      if (blocked) return;
      if (nativeRequests) {
        nativeRequests--;
        return;
      }
      if (!active) return;
      const current = active;
      active = null;
      if (current.collision || current.day !== day) {
        queue = [];
        blocked = true;
        setUnknown("\u5831\u8868\u8ACB\u6C42\u6DF7\u5408\uFF0C\u7B49\u5F85\u91CD\u65B0\u9023\u7DDA");
        return;
      }
      const code = typeof packet.action === "object" ? packet.action.err ?? packet.err : packet.err;
      const value = code === 0 ? officialAmount(packet.msg?.total?.all?.v) : null;
      data[current.period] = {
        ...data[current.period],
        value,
        updatedAt: value === null ? null : now(),
        range: mtOfficialRange(current.period, current.sentAt).label,
        status: value === null ? code === 0 ? "\u5B98\u65B9\u56DE\u8986\u7F3A\u5C11\u6709\u6548\u4E0B\u6CE8\u7E3D\u8A08" : "\u5B98\u65B9\u5831\u8868\u672A\u6210\u529F\uFF0C\u5F85\u540C\u6B65" : "\u5B98\u65B9\u5DF2\u540C\u6B65"
      };
      W.setTimeout(() => pump(), 300);
    }
    function attach(s) {
      try {
        const url = new URL(s.url);
        if (!/(^|\.)ofalive99\.net$/i.test(url.hostname) || !/^\/game\/ws\/?$/.test(url.pathname)) return;
      } catch {
        return;
      }
      if (socket !== s) {
        socket = s;
        blocked = false;
        nativeRequests = 0;
        active = null;
        queue = [];
        lastCycle = 0;
        data = emptyTurnover("MT", data.today.scope);
        day = taipeiDay();
      }
      if (listeners.has(s)) return;
      const message = (event) => {
        if (disposed || typeof event.data !== "string" || event.data.length > 5e6) return;
        try {
          consume(JSON.parse(event.data), s);
        } catch {
        }
      };
      const close = () => {
        if (s !== socket || disposed) return;
        active = null;
        queue = [];
        blocked = true;
        setUnknown("\u539F\u751F\u9023\u7DDA\u4E2D\u65B7\uFF0C\u5F85\u540C\u6B65");
      };
      listeners.set(s, { message, close });
      s.addEventListener("message", message);
      s.addEventListener("close", close);
      W.queueMicrotask(() => refresh());
    }
    function send(raw) {
      if (!disposed) {
        attach(this);
        if (this === socket && typeof raw === "string") {
          try {
            const p = JSON.parse(raw);
            const action = typeof p.action === "string" ? p.action : p.action?.name || "";
            if (/authenticate/i.test(action)) {
              blocked = !!active || nativeRequests > 0;
              active = null;
              queue = [];
              lastCycle = 0;
              setUnknown("\u767B\u5165\u5DE5\u4F5C\u968E\u6BB5\u66F4\u65B0\uFF0C\u5F85\u540C\u6B65");
            }
            if (!ownSending && isHistory(p)) {
              if (active) {
                active.collision = true;
                blocked = true;
                queue = [];
                setUnknown("\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u91CD\u758A\uFF0C\u7B49\u5F85\u91CD\u65B0\u9023\u7DDA");
              } else nativeRequests++;
            }
          } catch {
          }
        }
      }
      return Reflect.apply(previousSend, this, [raw]);
    }
    W.WebSocket.prototype.send = send;
    function pump() {
      if (disposed || blocked || active || nativeRequests || !socket || socket.readyState !== 1 || !canRefresh()) return false;
      newDay();
      if (blocked || !queue.length) return false;
      const period = queue.shift();
      const at = now(), range = mtOfficialRange(period, at);
      active = { period, day, sentAt: at, collision: false };
      data[period].status = "\u540C\u6B65\u5B98\u65B9\u5831\u8868\u4E2D";
      ownSending = true;
      try {
        socket.send(JSON.stringify({
          method: "GET",
          action: { game_id: 1, gametype_id: 3, name: HISTORY, path: "/api/v1/gametype/3/game/1/bet/history" },
          body: { begin_at: range.begin_at, end_at: range.end_at, cur: 1, room_id: 1, s: 8, table_id: 0 }
        }));
      } catch {
        active = null;
        queue = [];
        blocked = true;
        setUnknown("\u5B98\u65B9\u5831\u8868\u8B80\u53D6\u5931\u6557\uFF0C\u7B49\u5F85\u91CD\u65B0\u9023\u7DDA");
      } finally {
        ownSending = false;
      }
      return true;
    }
    function refresh(force = false) {
      if (disposed) return false;
      newDay();
      if (active && now() - active.sentAt > 12e3) {
        active = null;
        queue = [];
        blocked = true;
        setUnknown("\u5B98\u65B9\u5831\u8868\u903E\u6642\uFF0C\u7B49\u5F85\u91CD\u65B0\u9023\u7DDA");
      }
      if (blocked || !socket || socket.readyState !== 1) return false;
      if (!active && !queue.length && !nativeRequests && (force || now() - lastCycle >= 6e4)) {
        lastCycle = now();
        queue = ["today", "week"];
      }
      return pump();
    }
    const timer = W.setInterval(() => refresh(), 1e3);
    function dispose() {
      if (disposed) return;
      disposed = true;
      W.clearInterval(timer);
      active = null;
      queue = [];
      for (const [s, l] of listeners) {
        s.removeEventListener("message", l.message);
        s.removeEventListener("close", l.close);
      }
      listeners.clear();
      if (W.WebSocket.prototype.send === send) W.WebSocket.prototype.send = previousSend;
    }
    return { view: () => {
      newDay();
      return copy2();
    }, refresh, dispose };
  }

  // lib/mt-click-console-entry.ts
  (async () => {
    const W = window;
    try {
      const marker = W.__AUTOBAC_MT_FOREGROUND__;
      const markerDescriptor = Object.getOwnPropertyDescriptor(W, "__AUTOBAC_MT_FOREGROUND__");
      const immutableMarker = !!markerDescriptor && markerDescriptor.value === marker && !markerDescriptor.writable && !markerDescriptor.configurable;
      const foreground = !!marker && Object.isFrozen(marker) && immutableMarker && marker.kind === "autobac-mt-foreground-v1" && marker.version === 1 && marker.pathPrefix === "/mt-game" && (location.pathname === "/mt-game" || location.pathname.startsWith("/mt-game/")) && W.parent !== W;
      let sameOriginParent = false;
      try {
        sameOriginParent = foreground && W.parent.location.origin === location.origin;
      } catch {
      }
      const nativeConsole = location.protocol === "https:" && ["gsa.ofalive99.net", "gsb.ofalive99.net", "gs1.ofalive99.net"].includes(location.hostname);
      if (!sameOriginParent && !nativeConsole) throw Error("\u8ACB\u5728MT\u539F\u751F\u904A\u6232\u9801\u6216\u5DF2\u78BA\u8A8D\u7684 /mt-game \u540C\u6E90\u524D\u666F\u5165\u53E3\u57F7\u884C");
      if (!W.__MT_AUTOBAC_DIAG__?.report || !W.__MT_AUTOBAC_DIAG__?.scrollToTable) throw Error("\u8ACB\u5728MT\u904A\u6232\u9801\u5B89\u88DD\u5B8C\u6574\u7248\u672C\uFF0C\u4E0D\u8981\u9078\u4E3B\u7DB2\u7AD9Console\u4E0A\u4E0B\u6587");
      for (const name of ["__MT_MULTIROOM_CLEANUP__", "__MT_COMBINED_CLEANUP__"]) if (typeof W[name] === "function") W[name]();
      let saved = W.__MT_NATIVE_CLICK_SAVED__;
      const ledgerKey = typeof marker?.ledgerKey === "string" && /^mt\.session\.[a-f0-9]{32}$/.test(marker.ledgerKey) ? marker.ledgerKey : null;
      if (!saved && ledgerKey) try {
        saved = JSON.parse(W.sessionStorage?.getItem(ledgerKey) || "null");
      } catch {
      }
      const previous = W.__MT_NATIVE_CLICK__;
      if (previous) {
        await previous.halt();
        saved = previous.state();
        await previous.dispose();
      }
      const originalReport = W.__MT_AUTOBAC_DIAG__.report;
      let runner;
      const feed = createMtRoadFeed(W, originalReport, () => !runner?.isBusy(), saved?.roads || []);
      const official = createMtOfficialTurnover(W, () => !runner?.isBusy());
      const adapter = createMtRecommendationAdapter();
      runner = createMtDomClickRunner(W, (report, name, provider, now) => adapter.preview(report, name, provider, now), saved, () => feed.merge(originalReport()));
      const diagRoot = window.document.getElementById("__autobac_mt_diag__");
      if (diagRoot) diagRoot.style.display = "none";
      let panel = null, disposed = false;
      const state = () => ({ ...runner.state(), roads: feed.export() });
      async function dispose() {
        if (disposed) return;
        await runner.halt();
        W.__MT_NATIVE_CLICK_SAVED__ = state();
        if (ledgerKey) try {
          W.sessionStorage.setItem(ledgerKey, JSON.stringify(W.__MT_NATIVE_CLICK_SAVED__));
        } catch {
        }
        await runner.dispose();
        official.dispose();
        feed.dispose();
        panel?.remove();
        disposed = true;
        if (W.__MT_NATIVE_CLICK__?.dispose === dispose) delete W.__MT_NATIVE_CLICK__;
        console.log("[AutoBac MT] \u9762\u677F\u5DF2\u79FB\u9664\uFF1B\u539F\u751F\u6CE8\u55AE\u89C0\u5BDF\u4ECD\u4FDD\u7559\uFF0C\u4E0D\u91CD\u9001\u4EFB\u4F55\u672A\u78BA\u5B9A\u4E0B\u6CE8");
      }
      panel = mountMtClickPanel(W, runner, feed, dispose, official);
      W.__MT_NATIVE_CLICK__ = { version: "0.6.1-official-turnover", configure: runner.configure, start: runner.start, stop: runner.stop, halt: runner.halt, dispose, state, view: runner.view, officialTurnover: official.view, refreshOfficialTurnover: () => official.refresh(true), refreshRoad: () => feed.refresh(true) };
      console.log("[AutoBac MT] v0.6.1 \u5B98\u65B9\u4ECA\u65E5\uFF0F\u8FD17\u65E5\u6D41\u6C34\u7248\u5DF2\u8F09\u5165\uFF0C\u6C92\u6709\u958B\u59CB\u4E0B\u6CE8\u3002\u5148\u8A2D\u5B9A\u91D1\u984D\u53CA\u684C\u6578\uFF0C\u958B\u59CB\u6642\u52FE\u9078\u78BA\u8A8D\u3002");
      console.log("[AutoBac MT] \u4E0B\u6CE8\u53EA\u7531\u539F\u751F\u756B\u9762\u9EDE\u64CA\u9001\u51FA\uFF1B\u539F\u751FGET\u7528\u65BC\u91CD\u65B0\u53D6\u5F97\u5B8C\u6574\u724C\u8DEF\u3002\u505C\u6B62\uFF1Awindow.__MT_NATIVE_CLICK__.stop()\uFF1B\u79FB\u9664\uFF1Awindow.__MT_NATIVE_CLICK__.dispose()");
    } catch (e) {
      W.__AUTOBAC_MT_CONSOLE_ERROR__ = "install_failed";
      console.error("[AutoBac MT \u5B89\u88DD\u5931\u6557]", e);
    }
  })();
})();

