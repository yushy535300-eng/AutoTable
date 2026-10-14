const fs=require('node:fs'),path=require('node:path');
let source=fs.readFileSync(path.join(__dirname,'test-mt-navigation-patch.cjs'),'utf8');
source=source.replace("'/home/ubuntu/AutoBac-MT-Console-桌台辨識修補-v0.4.2.js'","'/home/ubuntu/AutoBac-MT-Console-一次安裝與定位-v0.4.2.js'");
source=source.replace("page.route('**/*'","page.route('https://gsa.ofalive99.net/**'");
source=source.replaceAll("await page.addScriptTag({content:source});", "await page.addScriptTag({url:'https://files.manuscdn.com/user_upload_by_module/session_file/310519663914984824/nsIkSthKgfpdcLUE.js'});await page.waitForFunction(()=>window.__MT_NAV_PATCH__?.viewport().history.some(x=>x.ok&&x.tableId==='BAV03'));");
new Function('require','__dirname','__filename',source)(require,__dirname,__filename);
