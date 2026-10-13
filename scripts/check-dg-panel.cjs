const fs=require('node:fs');
const {chromium}=require('/tmp/dg-testdeps/node_modules/playwright');
const source=fs.readFileSync(require('node:path').join(__dirname,'../public/dg-direct-bet-console.js'),'utf8');
const fixture=()=>{
 class Node{constructor(){this.visible=true;this.mouseEnabled=true;this.alpha=1;this.children=[];this.handlers={};}get numChildren(){return this.children.length;}getChildAt(i){return this.children[i];}add(n){n.parent=this;this.children.push(n);return n;}on(e,o,f){this.handlers[e]=f;}off(e){delete this.handlers[e];}hasListener(){return true;}event(){throw Error('視覺檢查不得下注');}}
 const stage=new Node(),socket=new Node();socket.socket={connected:true};socket.sendData=()=>{throw Error('視覺檢查不得下注');};
 const player={mid:'preview-only',currency:'TEST',socketMan:socket,balance:50000};
 for(const [i,name]of ['RB02','RB03','S01','S02','S03','S05','S09','S10'].entries()){
  const c=stage.add(new Node());c.tableId=60102+i;c.playerInfo=player;c.gameInfo={tableName:name,stateId:1,countDown:24,starTime:Date.now(),shoeId:14,playId:40+i,gameNo:'visual-fixture-'+i,roadArray:[1,1,1,1,5,5,1,5,1].map(v=>({road:[v]}))};
  c.baccaratLimit={bpMin:100,bpMax:100000};c.betFlag=true;c.betMoneyTmp={Banker:0,Player:0};c.betMoneyTrue={Banker:0,Player:0};c.betBtn={Banker:c.add(new Node()),Player:c.add(new Node())};c.betMan=c.add(new Node());c.betMan.confirm=c.betMan.add(new Node());c.betMan.cancel=c.betMan.add(new Node());c.betMan.visible=false;
 }
 window.Laya={stage,Event:class {static CLICK='click';},Browser:{now:()=>Date.now()}};
};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const [name,width,height]of [['portrait',390,844],['landscape',1920,880],['small',319,779],['mobile-landscape',844,390]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   await page.setContent('<body style="margin:0;background:#090a0c"></body>');await page.evaluate(fixture);await page.addScriptTag({content:source});
   const panel=page.locator('#__dg_singlepage_panel__').locator('#panel');
   if(!(await panel.getAttribute('class')).includes('compact'))throw Error('初始不是RoadIQ小窗');
   if((await page.evaluate(()=>window.__DG_SINGLEPAGE__.status())).selected.length!==1)throw Error('初始不是單桌');
   const fit=await page.evaluate(()=>{const s=document.getElementById('__dg_singlepage_panel__').shadowRoot,o=s.getElementById('overview-page');return {overflow:o.scrollHeight>o.clientHeight+1,button:s.getElementById('compact-stop').getBoundingClientRect().bottom<=s.getElementById('panel').getBoundingClientRect().bottom+1};});if(!fit.button)throw Error('操作列沒有固定在可視底部');
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/default-single-${name}.png`});
   await page.locator('#__dg_singlepage_panel__').locator('#parallel-count').selectOption('3');
   if(await page.locator('#__dg_singlepage_panel__').locator('#count').inputValue()!=='3')throw Error('兩處選單不同步');
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/revised-${name}.png`});
   const natural=await page.evaluate(()=>{const p=document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('panel');return [p.offsetWidth,p.offsetHeight];});if(natural[0]!==280||natural[1]>561||natural[1]<280)throw Error('留白版自適應尺寸不符');
   await page.locator('#__dg_singlepage_panel__').locator('#nav-settings').click();
   if(!await page.locator('#__dg_singlepage_panel__').locator('#settings-page').isVisible())throw Error('設定分頁未開啟');
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/settings-${name}.png`});
   const hostUI=page.locator('#__dg_singlepage_panel__');
   await hostUI.locator('#provider-trigger').click();
   if(await hostUI.locator('.provider-option').count()!==6)throw Error('缺少策略Logo選項');
   if(await hostUI.locator('.provider-option svg').count()!==6)throw Error('所有策略沒有自己的Logo');
   const menuBounds=await hostUI.locator('#provider-menu').boundingBox(),panelBounds=await panel.boundingBox();if(menuBounds.y<panelBounds.y||menuBounds.y+menuBounds.height>panelBounds.y+panelBounds.height)throw Error('策略選單超出面板');
   await page.mouse.move(0,0);await hostUI.locator('#provider-trigger').evaluate(n=>n.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/provider-menu-${name}.png`});
   await hostUI.locator('.provider-option[data-value="gemini"]').click();
   if(await hostUI.locator('#current-strategy').textContent()!=='Gemini')throw Error('策略未同步');
   await hostUI.locator('#nav-overview').click();
   if(!await hostUI.locator('#zoom-out').isVisible())throw Error('迷你按鈕消失');
   if(await hostUI.locator('#mini-label').textContent()!=='迷你')throw Error('縮小沒有文字');
   await hostUI.locator('#choose-tables').click();
   if(!await hostUI.locator('#rooms-page').isVisible())throw Error('選桌未開啟');
   if(await hostUI.locator('.room-title').count()!==8)throw Error('選桌卡片不完整');
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/rooms-${name}.png`});
   await hostUI.locator('#rooms-back').click();
   await hostUI.locator('#nav-logs').click();
   if(await hostUI.locator('.event-card').count()<1)throw Error('紀錄時間軸沒有資料');
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/logs-${name}.png`});
   await hostUI.locator('#nav-overview').click();
   if(name==='landscape'){
     const before=await panel.boundingBox(),grip=await hostUI.locator('#resize-panel').boundingBox();
     await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);await page.mouse.down();await page.mouse.move(grip.x+grip.width/2+90,grip.y+grip.height/2+35,{steps:8});await page.mouse.up();
     const after=await panel.boundingBox();if(after.width<before.width+60||after.height<before.height+20)throw Error('拖動伸縮沒有實際改長寬');
     const size=await page.evaluate(()=>window.__DG_SINGLEPAGE__.status().panelSize);
     await hostUI.locator('#zoom-out').click();await hostUI.locator('#zoom-out').click();
     if((await page.evaluate(()=>window.__DG_SINGLEPAGE__.status().panelSize.width))!==size.width)throw Error('迷你還原丟失伸縮尺寸');
     await panel.screenshot({path:'/home/ubuntu/dg_ui_reference/resize-expanded.png'});
   }
   if(name==='portrait'){
     const h=hostUI.locator('#resize-panel');await h.dispatchEvent('pointerdown',{pointerId:88,pointerType:'touch',clientX:320,clientY:670});await h.dispatchEvent('pointermove',{pointerId:88,pointerType:'touch',clientX:300,clientY:645});await h.dispatchEvent('pointerup',{pointerId:88,pointerType:'touch',clientX:300,clientY:645});
     if((await page.evaluate(()=>window.__DG_SINGLEPAGE__.status().panelSize.width))>=280)throw Error('觸控伸縮未生效');
   }
   await hostUI.locator('#zoom-out').click();
   if(!(await panel.getAttribute('class')).includes('mini'))throw Error('收合未出現迷你介面');
   if(await page.locator('#__dg_singlepage_panel__').locator('#orb').count())throw Error('不應保留小球');
   if(!await panel.isVisible())throw Error('收合把面板隱藏');
   await page.locator('#__dg_singlepage_panel__').locator('#zoom-out').click();
   if(!await panel.isVisible())throw Error('展開面板失敗');
   const overflow=await page.evaluate(()=>{const p=document.getElementById('__dg_singlepage_panel__').shadowRoot.getElementById('panel');return p.scrollWidth>p.clientWidth;});
   if(overflow)throw Error('面板水平溢出');
   const bounds=await panel.boundingBox();if(bounds.y+bounds.height>height+2)throw Error('面板超出螢幕底部');
   const compact=await panel.getAttribute('class');if(!compact.includes('compact'))throw Error('完整資訊模式被更動');
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/compact-${name}.png`});
   await page.locator('#__dg_singlepage_panel__').locator('#open-report').click();
   const report=page.locator('#__dg_singlepage_panel__').locator('#report-shell');
   if(!await report.isVisible())throw Error('戰績報表未開啟');
   await page.mouse.move(0,0);await report.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await report.screenshot({path:`/home/ubuntu/dg_ui_reference/report-${name}.png`});
   if(await page.locator('#__dg_singlepage_panel__').locator('#report-transactions').isVisible())throw Error('未接入交易入口不應顯示');
   await page.locator('#__dg_singlepage_panel__').locator('#close-report').click();
   if(await report.isVisible())throw Error('報表返回失敗');
   const mh=page.locator('#__dg_singlepage_panel__');await mh.locator('#zoom-out').click();
   const miniSize=await panel.evaluate(n=>[n.offsetWidth,n.offsetHeight]);if(miniSize[0]!==210||miniSize[1]!==228)throw Error('不是真正210×228迷你模式');
   const miniOverflow=await panel.evaluate(n=>{const o=n.querySelector('#overview-page');return o.scrollHeight>o.clientHeight+1||n.scrollWidth>n.clientWidth;});if(miniOverflow)throw Error('迷你資訊被截斷 '+JSON.stringify(await panel.evaluate(n=>{const o=n.querySelector('#overview-page');return {size:[n.clientWidth,n.scrollWidth,o.clientHeight,o.scrollHeight],children:[...o.children].filter(e=>getComputedStyle(e).display!=='none').map(e=>[e.className||e.id,e.offsetHeight])};})));
   await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:`/home/ubuntu/dg_ui_reference/mini-${name}.png`});
   if(name==='portrait'){
     const dot=mh.locator('.dot');if(!await dot.evaluate(n=>getComputedStyle(n).animationName.includes('dg-dot-breathe')))throw Error('綠點未接呼吸動畫');
     await page.emulateMedia({reducedMotion:'reduce'});if(await dot.evaluate(n=>getComputedStyle(n).animationName)!=='none')throw Error('減少動態效果未生效');await page.emulateMedia({reducedMotion:'no-preference'});
     const btn=mh.locator('#zoom-out');await btn.dispatchEvent('pointerdown',{pointerType:'touch'});if(await btn.getAttribute('data-pressed')!=='true')throw Error('觸控反饋未顯示');
     await page.waitForTimeout(120);await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:'/home/ubuntu/dg_ui_reference/mini-pressed.png'});await btn.dispatchEvent('pointerup');
   }
await mh.locator('#compact-stop').click();if(!(await mh.locator('#risk-dialog').isVisible()))throw Error('迷你開始未顯示風險');await mh.locator('#risk-cancel').click();
   if(!(await panel.getAttribute('class')).includes('mini'))throw Error('取消風險後未保留迷你模式');await mh.locator('#zoom-out').click();
   if((await panel.getAttribute('class')).includes('mini'))throw Error('還原失敗');
   console.log('PASS UI',name,width,height,'分頁／收合／展開／無水平溢出');await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await page.setContent('<body style="margin:0;background:#090a0c"></body>');await page.evaluate(fixture);
  await page.evaluate(()=>{const at=Date.now()+1000;window.__DG_LEDGER_STATE__={version:1,levels:{},bets:Array.from({length:5},(_,i)=>({key:(60102+i)+':record-'+i,tableId:String(60102+i),gameNo:'record-'+i,side:i%2?'閒':'莊',amount:1000,level:0,scope:'table',staking:'flat',state:'settled',createdAt:at+i,settledAt:at+i,pnl:i%2?-1000:1000}))};});
  await page.addScriptTag({content:source});
  await page.locator('#__dg_singlepage_panel__').locator('#parallel-count').selectOption('all');
  await page.locator('#__dg_singlepage_panel__').locator('#nav-settings').click();
  await page.locator('#__dg_singlepage_panel__').locator('#base').fill('1000');
  await page.locator('#__dg_singlepage_panel__').locator('#nav-overview').click();
  const panel=page.locator('#__dg_singlepage_panel__').locator('#panel');
  await page.mouse.move(0,0);await panel.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await panel.screenshot({path:'/home/ubuntu/dg_ui_reference/dense-all-records.png'});
  const sizeBefore=await panel.boundingBox();
  await page.locator('#__dg_singlepage_panel__').locator('#zoom-out').click();
  const sizeAfter=await panel.boundingBox();if(sizeAfter.width>=sizeBefore.width)throw Error('縮小按鈕未生效');
  await page.locator('#__dg_singlepage_panel__').locator('#zoom-out').click();
  await page.locator('#__dg_singlepage_panel__').locator('#open-report').click();
  const report=page.locator('#__dg_singlepage_panel__').locator('#report-shell');
  const cards=await page.locator('#__dg_singlepage_panel__').locator('.report-card').count();if(cards!==5)throw Error('戰績卡不完整');
  const text=await report.textContent();if(!text.includes('下注 1,000')||!text.includes('損益 +1,000')||text.includes('訂單編號'))throw Error('金額損益沒有直接顯示');
  const horiz=await page.evaluate(()=>{const n=document.getElementById('__dg_singlepage_panel__').shadowRoot.querySelector('.report-scroll');return n.scrollWidth>n.clientWidth;});if(horiz)throw Error('戰績仍要橫向滑動');
  await page.mouse.move(0,0);await report.evaluate(n=>n.getRootNode().activeElement?.blur());await page.waitForTimeout(180);await report.screenshot({path:'/home/ubuntu/dg_ui_reference/report-five-records.png'});await page.close();
  const warningPage=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await warningPage.setContent('<body style="margin:0;background:#090a0c"></body>');await warningPage.evaluate(fixture);await warningPage.addScriptTag({content:source});
  const wh=warningPage.locator('#__dg_singlepage_panel__');await wh.locator('#compact-stop').click();if(!(await wh.locator('#risk-dialog').isVisible()))throw Error('開始未出風險視窗');if(!(await wh.locator('#risk-confirm').isDisabled()))throw Error('沒勾選可確認');
  await wh.locator('#risk-dialog').screenshot({path:'/home/ubuntu/dg_ui_reference/risk-dialog.png'});await wh.locator('#ack').check();if(await wh.locator('#risk-confirm').isDisabled())throw Error('勾選後確認未解鎖');await wh.locator('#risk-cancel').click();await wh.locator('#compact-stop').click();if(await wh.locator('#ack').isChecked())throw Error('重開記住勾選');await warningPage.close();
  console.log('PASS UI 有資料五筆卡片／金額方向損益可見／主資訊無捲動');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
