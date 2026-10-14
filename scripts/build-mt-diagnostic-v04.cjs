const fs=require('node:fs');
const {createMtTableNavigator}=require('./mt-table-navigator');
const input='/home/ubuntu/AutoBac-MT-Console-完整診斷-v0.3.js';
const output='/home/ubuntu/AutoBac-MT-Console-同頁定位診斷-v0.4.js';
let s=fs.readFileSync(input,'utf8');
function patch(old,next){if(!s.includes(old))throw Error('Missing anchor: '+old.slice(0,100));s=s.replace(old,next);}
patch("  'use strict';", "  'use strict';\n  "+createMtTableNavigator.toString());
patch("version:'MT-DIAG-0.3'", "version:'MT-DIAG-0.4'");
patch('betObservation:observations.report(),sockets:', 'betObservation:observations.report(),tableViewport:{tables:tableNavigator.list(),history:tableNavigator.history()},sockets:');
patch('  const timer=setInterval(', `  const tableNavigator=createMtTableNavigator(W,tableData,()=>disposed);
  async function scrollToTable(id,options={}) {
    root.dataset.mini='true';root.querySelector('.ab-close').textContent='+';
    const result=await tableNavigator.focus(id,options);
    note=result.ok?('已定位 '+result.name+'，未執行下注'):('定位未完成：'+result.reason);render();
    return result;
  }
  const timer=setInterval(`);
patch('clearInterval(timer);document.removeEventListener', 'clearInterval(timer);tableNavigator.cancel();document.removeEventListener');
patch('W.__MT_AUTOBAC_DIAG__={report,dispose};', 'W.__MT_AUTOBAC_DIAG__={report,dispose,scrollToTable,cancelScroll:()=>tableNavigator.cancel()};');
patch('每桌資料與注單關鍵訊息分開保留。只觀察原生操作，不自動點籌碼、下注或確認。', '支援原生多台頁自動定位/捲動。仍是診斷版，不自動下注；不進房、不返回。');
patch("console.log('[AutoBac MT] 一次完整診斷已啟動。會嘗試一次多桌入口，不會點籌碼、下注或確認。請依原方式正常操作一次，打開下注紀錄，最後按「複製完整報告」。不要重整頁面。');", "console.log('[AutoBac MT] 同頁定位與注單核對已啟動，沒有開始自動下注。可呼叫 window.__MT_AUTOBAC_DIAG__.scrollToTable(\"B03\") 測試捲動；cancelScroll() 取消定位；dispose() 移除診斷。');");
fs.writeFileSync(output,s);console.log(output);
