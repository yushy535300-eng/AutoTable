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
    // MT's original client reads msg.user.points (not a recursively guessed balance).
    const envelopes=[packet.msg,packet.body,packet.data].filter(value=>value&&typeof value==='object');
    const candidates=envelopes.flatMap(value=>[value.user?.points,value.points,value.balance]);
    for(const value of candidates){
      if(typeof value!=='number'&&!(typeof value==='string'&&/^\d+(?:\.\d+)?$/.test(value.trim())))continue;
      const n=Number(value);if(Number.isFinite(n)&&n>=0)return n;
    }
    return null;
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
      const value=officialBalance(packet);
      memberBalance=value;
      memberBalanceAt=value===null?0:Date.now();
      if(typeof W.CustomEvent==='function')W.dispatchEvent?.(new W.CustomEvent('autobac:mt-wallet-updated'));
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
      if(names.includes('/api/v1/member/me/balance')){
        // Consume only the official numeric wallet value; never retain the member profile.
        observations.consume({at:new Date().toISOString(),direction,data:packet},id=>liveTables.get(id));
        return;
      }
      if(names.some(a=>/authenticate|\/ping$|\/member\/me$/.test(a)))return;
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
