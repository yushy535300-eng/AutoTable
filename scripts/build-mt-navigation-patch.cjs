const fs=require('node:fs');
const {createMtTableNavigator}=require('./mt-table-navigator');
const {installMtNavigationPatch}=require('./mt-navigation-patch');
const output='/home/ubuntu/AutoBac-MT-Console-桌台辨識修補-v0.4.3.js';
const source=`// AutoBac MT v0.4.3：定位修補，需已載入v0.4。不下注、不重載、不重啟WS觀察。\n(() => {\n  'use strict';\n  ${createMtTableNavigator.toString()}\n  ${installMtNavigationPatch.toString()}\n  installMtNavigationPatch(window,createMtTableNavigator);\n})();\n`;
fs.writeFileSync(output,source);console.log(output);
