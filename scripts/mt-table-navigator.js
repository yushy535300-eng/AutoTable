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
      const tableId=explicit&&String(explicit.name||'').toUpperCase()===name?explicit.tableId:ids.length===0&&named.length===1?named[0].tableId:null;
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
