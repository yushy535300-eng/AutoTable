const fs=require('node:fs');
const input='/home/ubuntu/AutoBac-MT-Console-桌台辨識修補-v0.4.3.js';
const output='/home/ubuntu/AutoBac-MT-Console-一次安裝與定位-v0.4.3.js';
const patch=fs.readFileSync(input,'utf8');
const code=`// MT v0.4.3：只定位畫面上的唯一B03桌列；不點籌碼/方向/確認，不以未知ID假報下注。
(async () => {
  'use strict';
  ${patch}
  const d=window.__MT_AUTOBAC_DIAG__;
  if(window.__MT_NAV_PATCH__?.version!=='0.4.3'||!d){
    console.error('[AutoBac MT] 請保留原診斷實例並在MT多台頁執行，不要重整。');
    return null;
  }
  const result=await d.scrollToTable('B03');
  const r=d.report();
  const summary={
    version:r.version,
    result:{ok:result.ok,name:result.name??null,locationSource:result.locationSource??null,betAreaFound:!!result.betArea,confirmFound:!!result.confirm,confirmEnabled:result.confirmEnabled??false,tableId:result.tableId??null,nativeIdVerified:result.identityVerified??false,reason:result.reason??null},
    observedAcceptedCount:r.betObservation?.acceptedCount,
    observedSettledGroupCount:r.betObservation?.settledGroupCount,
    actions:'只定位及捲動，未點籌碼、方向或確認；ok不是下注成功'
  };
  const text=JSON.stringify(summary,null,2);
  console.log('[AutoBac MT B03畫面定位結果]\\n'+text);
  try{await navigator.clipboard.writeText(text);console.log('結果已複製。');}
  catch{console.log('可複製上面的「B03畫面定位結果」。');}
  return summary;
})();
`;
fs.writeFileSync(output,code);console.log(output);
