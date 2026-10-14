const fs=require('fs');
const path=require('path');
const {buildSync}=require('esbuild');
const root=path.resolve(__dirname,'..');
const baseline=process.env.MT_DIAGNOSTIC_BASE||path.join(root,'scripts/mt-diagnostic-base.js');
const patch=path.join(root,'scripts/mt-table-navigator.js');
const installer=path.join(root,'scripts/mt-navigation-patch.js');
const logoLicense=fs.readFileSync(path.join(root,'assets/dg-strategies/LICENSE-Lobe-Icons'),'utf8');
const built=buildSync({entryPoints:[path.join(root,'lib/mt-click-console-entry.ts')],bundle:true,format:'iife',platform:'browser',target:'es2022',write:false}).outputFiles[0].text;
const output=path.join(root,'public/mt-native-click-console.js');
const navigation=fs.readFileSync(patch,'utf8').replace("explicit&&String(explicit.name||'').toUpperCase()===name?explicit.tableId:ids.length===0&&named.length===1?named[0].tableId:null", "explicit&&String(explicit.name||'').toUpperCase()===name?explicit.tableId:null");
if(navigation===fs.readFileSync(patch,'utf8'))throw Error('MT導航嚴格ID修正沒有匹配，停止建置');
const contents=`/* AutoBac MT v0.6.1. Official today/week turnover. Shared DG rules and all panel surfaces. Betting uses MT native DOM clicks.
   Read-only /tables GET refreshes bead data. Installation never starts betting.
   Review source; this script executes with the current MT page's permissions. */
/* Shared provider icon license:
${logoLicense.replace(/\*\//g,'* /')}
*/
if (!window.__MT_AUTOBAC_DIAG__) {
${fs.readFileSync(baseline,'utf8')}
}
${navigation}
${fs.readFileSync(installer,'utf8')}
installMtNavigationPatch(window, createMtTableNavigator);
${built}
`;
fs.writeFileSync(output,contents);
if(process.env.MT_CONSOLE_DELIVERY)fs.copyFileSync(output,process.env.MT_CONSOLE_DELIVERY);
console.log(output);console.log('Bytes:',Buffer.byteLength(contents));
