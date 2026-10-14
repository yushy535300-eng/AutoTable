const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),child=require('node:child_process');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/tmp/dg-testdeps/node_modules/playwright'));}
const {createMtTableNavigator}=require('./mt-table-navigator');
const root=path.resolve(__dirname,'..');
const bundle=path.join(os.tmpdir(),`autobac-mt-mobile-runner-${process.pid}.js`);
child.execFileSync('npx',['esbuild','lib/mt-dom-click-runner.ts','--bundle','--platform=browser','--format=iife','--global-name=MtRunnerModule','--target=es2022',`--outfile=${bundle}`],{cwd:root,stdio:'ignore'});
const runnerCode=fs.readFileSync(bundle,'utf8');
const navigatorFactory=createMtTableNavigator.toString();
const html=`<!doctype html><meta charset="utf-8"><style>
body{margin:0;font:14px sans-serif}.multiple#mulitScroll{height:260px;width:390px;overflow-y:auto}.gameDesk{height:200px;border-bottom:1px solid #aaa}.gameDesk_title{height:25px}.gameDesk_title_r .countdown{display:block;width:20px;height:20px}.gameDesk_bet_section{display:block}.gameDesk_bet_section ul{display:flex;margin:0;padding:0}.gameDesk_bet_section li{display:block;width:120px;min-height:100px}.chip-group,.chip-100,.multiple_footer{display:block;width:44px;height:35px}.chip-group{background:#cad8e3}.btn{width:24px;height:24px}.btn-money{width:60px}.multiple_footer{position:fixed;bottom:0;width:390px;height:48px;background:#eee}.multiple_footer>.chip-group{width:auto;height:40px}.multiple_footer .chip-100{background:#aaa}
</style><div class="multiple" id="mulitScroll"><div class="gameDesk"><div class="gameDesk_title"><div class="gameDesk_tag">百家樂 B05</div><div class="gameDesk_title_r"><div class="countdown" data-value="9"></div></div></div><div class="gameDesk_bet_section" data-state="classic"><ul><li data-state="free"><div class="chip-group"><div class="chip-100">DISPLAY-CHIP-NOT-TOTAL</div></div><div class="native-actions" style="display:none"><button class="btn van-button--danger">×</button><button class="btn van-button--warning">↪</button><button class="btn van-button--success">✓</button></div><button class="btn btn-money" style="display:none">0</button></li><li data-state="zhuang"><div class="chip-group"><div class="chip-500">DISPLAY-CHIP-NOT-TOTAL</div></div><div class="native-actions" style="display:none"><button class="btn van-button--danger">×</button><button class="btn van-button--warning">↪</button><button class="btn van-button--success">✓</button></div><button class="btn btn-money" style="display:none">0</button></li></ul></div></div><div class="multiple_footer"><div class="chip-group"><div class="chip-100">100</div><div class="chip-500">500</div></div></div></div>`;
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:480,height:600}});await page.setContent(html);await page.addScriptTag({content:runnerCode});
  const result=await page.evaluate(async factory=>{
   const card=document.querySelector('.gameDesk'),events=[];
   const state={BAV05:{immediatelyOrderType:false}};
   card.__vueParentComponent={setupState:{MulitGameData:state}};
   const live=[{tableId:'BAV05',name:'B05',clock:{gameSn:'SN-5',count:9}}];
   const nav=eval('('+factory+')')(window,()=>live);
   window.__MT_AUTOBAC_DIAG__={
    report:()=>({liveTables:live,tableViewport:{tables:nav.list()},betObservation:{records:[],groups:[]}}),
    scrollToTable:(name,options)=>nav.focus(name,options),cancelScroll:()=>nav.cancel(),
   };
   let selected=0;
   document.querySelector('.multiple_footer .chip-100').onclick=()=>{selected=100;events.push('footer-chip:100');};
   for(const li of document.querySelectorAll('.gameDesk_bet_section[data-state="classic"] li')){
    const side=li.getAttribute('data-state');
    li.querySelector('.chip-group').onclick=()=>{
     events.push('side:'+side);const total=li.querySelector('.btn-money');total.textContent=String(Number(total.textContent)+selected);total.style.display='block';li.querySelector('.native-actions').style.display='block';
    };
    li.querySelector('.van-button--success').onclick=()=>events.push('confirm:'+side);
    li.querySelector('.van-button--danger').onclick=()=>{events.push('cancel:'+side);li.querySelector('.btn-money').textContent='0';li.querySelector('.btn-money').style.display='none';li.querySelector('.native-actions').style.display='none';};
   }
   const preview=(_report,name)=>({ok:true,tableName:name,provider:'combined',side:'閒',confidence:1,shoe:'777',round:4,roundKey:'777|4',count:9,canBet:true,reason:null,candidateIds:['BAV05'],gameSnById:{BAV05:'SN-5'},results:['閒','莊','閒'],dataSource:'exact-native-id',pattern:{label:'offline'}});
   const directNav=await nav.focus('B05',{control:'side',side:'閒',identity:'display',expectedGameSn:'SN-5'});
   const directShape={ok:directNav.ok,mobile:directNav.mobile,count:directNav.nativeCountdown,mode:directNav.nativeOrderMode,targetClass:directNav.target?.className,confirmClass:directNav.confirm?.className};
   state.BAV05.immediatelyOrderType=true;
   const directRunner=MtRunnerModule.createMtDomClickRunner(window,preview);directRunner.start(true);await new Promise(resolve=>setTimeout(resolve,180));const direct={events:events.slice(),message:directRunner.view().message,bet:directRunner.view().bets[0]};await directRunner.dispose();
   state.BAV05.immediatelyOrderType=false;events.length=0;document.querySelector('.countdown').setAttribute('data-value','8');
   const mismatchRunner=MtRunnerModule.createMtDomClickRunner(window,preview);mismatchRunner.start(true);await new Promise(resolve=>setTimeout(resolve,180));const mismatch={events:events.slice(),message:mismatchRunner.view().message,bet:mismatchRunner.view().bets[0]};await mismatchRunner.dispose();
   events.length=0;document.querySelector('.countdown').setAttribute('data-value','9');document.querySelector('li[data-state="free"]').classList.add('disable');
   const disabledRunner=MtRunnerModule.createMtDomClickRunner(window,preview);disabledRunner.start(true);await new Promise(resolve=>setTimeout(resolve,180));const disabled={events:events.slice(),message:disabledRunner.view().message,bet:disabledRunner.view().bets[0]};await disabledRunner.dispose();
   events.length=0;document.querySelector('li[data-state="free"]').classList.remove('disable');document.querySelector('.gameDesk_bet_section').style.display='none';
   const hiddenRunner=MtRunnerModule.createMtDomClickRunner(window,preview);hiddenRunner.start(true);await new Promise(resolve=>setTimeout(resolve,180));const hidden={events:events.slice(),message:hiddenRunner.view().message,bet:hiddenRunner.view().bets[0]};await hiddenRunner.dispose();
   events.length=0;document.querySelector('.gameDesk_bet_section').style.display='block';
   const runner=MtRunnerModule.createMtDomClickRunner(window,preview);runner.start(true);await new Promise(resolve=>setTimeout(resolve,280));const staged={events:events.slice(),bet:runner.view().bets[0],money:document.querySelector('li[data-state="free"] .btn-money').textContent,displayChip:document.querySelector('li[data-state="free"] .chip-100').textContent};await runner.dispose();
   return {directShape,direct,mismatch,disabled,hidden,staged};
  },navigatorFactory);
  assert.deepEqual(result.directShape,{ok:true,mobile:true,count:9,mode:'staged',targetClass:'chip-group',confirmClass:'btn van-button--success'});
  assert.equal(result.direct.events.length,0,'direct immediateOrderType must block before footer chip or side click');assert.match(result.direct.message,/直接下注模式/);assert.equal(result.direct.bet,undefined,'direct mode must refuse before reserving a bet');
  assert.equal(result.mismatch.events.length,0,'DOM counter disagreement must block before footer chip or side click');assert.match(result.mismatch.message,/倒數與已觀察 native wait count 不一致/);assert.equal(result.mismatch.bet,undefined);
  assert.equal(result.disabled.events.length,0,'disabled native side must block before footer chip or side click');assert.match(result.disabled.message,/已禁用或隱藏/);assert.equal(result.disabled.bet,undefined);
  assert.equal(result.hidden.events.length,0,'hidden native side must block before footer chip or side click');assert.match(result.hidden.message,/native-side-not-unique/);assert.equal(result.hidden.bet,undefined);
  assert.deepEqual(result.staged.events,['footer-chip:100','side:free','confirm:free']);assert.equal(result.staged.money,'100');assert.equal(result.staged.displayChip,'DISPLAY-CHIP-NOT-TOTAL');assert.equal(result.staged.bet.amount,100);assert.equal(result.staged.bet.state,'submitted');
  console.log('PASS MT mobile native offline: #mulitScroll table scope, data-value countdown, explicit immediatelyOrderType refusal, footer chip only, btn-money queue total, native Vant success confirm. No login, game endpoint, or betting packet.');
  await page.close();
 }finally{await browser.close();fs.rmSync(bundle,{force:true});}
})().catch(error=>{console.error(error);fs.rmSync(bundle,{force:true});process.exitCode=1;});
