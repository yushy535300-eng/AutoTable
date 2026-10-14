const fs = require('node:fs');
const source = '/home/ubuntu/AutoBac-MT-Console-一次完整診斷-v0.2.js';
const output = '/home/ubuntu/AutoBac-MT-Console-完整診斷-v0.3.js';
const {createMtNativeObserver} = require('./mt-native-observer');
let s = fs.readFileSync(source,'utf8');
function replace(old, value) { if (!s.includes(old)) throw Error('Missing build anchor: '+old.slice(0,100)); s = s.replace(old,value); }
replace("  if (typeof W.__MT_AUTOBAC_DIAG__?.dispose === 'function') W.__MT_AUTOBAC_DIAG__.dispose();", `  const previous = typeof W.__MT_AUTOBAC_DIAG__?.report === 'function' ? W.__MT_AUTOBAC_DIAG__.report() : null;
  if (typeof W.__MT_AUTOBAC_DIAG__?.dispose === 'function') W.__MT_AUTOBAC_DIAG__.dispose();`);
replace("  const network = [], clicks = [], snapshots = [];", `  const network = [], important = [], clicks = [], snapshots = [], liveTables = new Map();
  ${createMtNativeObserver.toString()}
  const observations = createMtNativeObserver();
  const stats = {total:0, ordinaryDropped:0, importantDropped:0};
  const importantAction = name => (!/\\/betinfo$/.test(name) || /\\/member\\/me\\//.test(name)) && /(?:bet|order|slip|history|member\\/me\\/win)/i.test(name);
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
    if (/\\/(?:tables|tablesvg)$/.test(name)) {
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
    if (/\\/(wait|ready|end)$/.test(name)) {
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
      const name=label.match(/\\bB\\d{2}[A-Z]?(?:-L)?\\b/i)?.[0]||null;
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
  }`);
replace("      network.push(entry);if(network.length>250)network.shift();", "      retain(entry);");
replace("note=`已記錄 ${network.length} 份原生訊息 · 點擊 ${clicks.length} 次`;", "note=`已觀察 ${stats.total} 份訊息 · 注單關鍵 ${important.length} 份`;");
replace("version:'MT-DIAG-0.2'", "version:'MT-DIAG-0.3'");
replace("network:[...network],sockets:", "network:[...network],importantNetwork:[...important],captureStats:{...stats},liveTables:tableData(),scopedCards:scopedCards(),betObservation:observations.report(),sockets:");
replace("limits:'只記錄已觀察到的原生訊息；不含登入Token/密碼/Cookie；不推算下注成功，不解碼非JSON資料。'", "limits:'只記錄已觀察到的原生訊息。普通訊息保留最近300份；注單關鍵獨立保留500份，超限數量見captureStats。可承接前版仍保留的資料，不能恢復已丟失訊息。桌台勝方不代表個人獲利；不含登入Token/密碼/Cookie，不推算下注成功。'");
replace("root.querySelector('[data-v=\"state\"]').textContent=`${r.alert||'觀察原生遊戲畫面'}\\n多桌入口：${nav.state}\\n${note}`;", "root.querySelector('[data-v=\"state\"]').textContent=`${r.alert||'觀察原生遊戲畫面'}\\n多桌入口：${nav.state} · 各桌 ${liveTables.size} 桌\\n${note}`;");
replace("只會嘗試一次「多台／多桌」入口。籌碼、下注與確認都不自動點擊；不新增連線或自訂封包。", "每桌資料與注單關鍵訊息分開保留。只觀察原生操作，不自動點籌碼、下注或確認。");
fs.writeFileSync(output,s);
console.log(output);
