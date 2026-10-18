'use strict';
const fs=require('node:fs');
let pw;try{pw=require('playwright')}catch{pw=require('/tmp/dg-testdeps/node_modules/playwright')}
const {openOfflinePage,stopAndClose}=require('./test-dg-mobile-v329-complete.cjs');
(async()=>{
 const browser=await pw.chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const out='/home/ubuntu/AutoBac-v3.2.21-介面預覽';fs.mkdirSync(out,{recursive:true});
 const page=await openOfflinePage({newPage:opts=>browser.newPage({...opts,deviceScaleFactor:3})},[{id:701,method:'ei'}]);
 try{
  await page.evaluate(()=>{document.body.style.background='#101820';document.querySelector('main')?.remove();});
  for(const [gameNo,pnl] of [['preview-win',95],['preview-loss',-100],['preview-zero',0]]){
   await page.evaluate(({gameNo,pnl})=>{
    const m=window.__offlineMobile;m.socket.sendData({cmd:6,tableId:799,gameNo,bet:{banker6:100}});
    m.emit('RECEIVED_SUCCESS',{cmd:6,codeId:0,tableId:799,gameNo,list:[JSON.stringify({banker6:100})]});
    m.emit('RECEIVED_SUCCESS',{cmd:1007,codeId:0,tableId:799,gameNo,dList:[0,pnl]});
   },{gameNo,pnl});
  }
  await page.waitForTimeout(600);
  await page.evaluate(()=>{const s=document.querySelector('#__dg_singlepage_panel__').shadowRoot;s.getElementById('nav-overview').click();s.getElementById('overview-page').scrollTop=0;});
  const panel=page.locator('#__dg_singlepage_panel__').locator('#panel');
  await panel.screenshot({path:out+'/手機面板-高清.png'});
  await page.locator('#__dg_singlepage_panel__').locator('.stats').screenshot({path:out+'/累積統計列-高清.png'});
  await page.evaluate(()=>{const s=document.querySelector('#__dg_singlepage_panel__').shadowRoot;s.getElementById('nav-settings').click();const input=s.getElementById('stop-loss');input.value='2500';input.dispatchEvent(new Event('input',{bubbles:true}));s.getElementById('settings-page').scrollTop=s.getElementById('settings-page').scrollHeight;});
  await page.waitForTimeout(100);
  await panel.screenshot({path:out+'/馬丁設定-高清.png'});
  console.log(out+'/手機面板-高清.png');console.log(out+'/累積統計列-高清.png');console.log(out+'/馬丁設定-高清.png');
 }finally{await stopAndClose(page);await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
