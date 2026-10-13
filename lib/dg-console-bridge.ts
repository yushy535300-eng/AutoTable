import {DG_CONSOLE_SOURCE} from './dg-console-source';
type DgAgent={start:()=>void;stop:()=>void;scan:()=>void;status:()=>{running:boolean;status:string;pending:any[];selected:string[]}};
export function findDgConsoleAgent():DgAgent|null {
  if(typeof window==='undefined'||typeof document==='undefined')return null;
  if(window.__DG_SINGLEPAGE__)return window.__DG_SINGLEPAGE__;
  for(const frame of Array.from(document.querySelectorAll('iframe'))){
    try{const w=frame.contentWindow as any;if(w?.__DG_SINGLEPAGE__)return w.__DG_SINGLEPAGE__;}catch{/* 同源政策不可繞過 */}
  }
  return null;
}
export function installDgSameOrigin():boolean {
  if(typeof window==='undefined'||typeof document==='undefined')return false;
  const targets:Document[]=[document];
  for(const frame of Array.from(document.querySelectorAll('iframe'))){try{if(frame.contentDocument)targets.push(frame.contentDocument);}catch{/* 跨來源：改用 DG 本頁腳本 */}}
  for(const doc of targets){
    try{
      if(!(doc.defaultView as any)?.Laya?.stage)continue;
      const script=doc.createElement('script');script.textContent=DG_CONSOLE_SOURCE;doc.documentElement.appendChild(script);script.remove();
      if((doc.defaultView as any)?.__DG_SINGLEPAGE__)return true;
    }catch{/* CSP 或同源阻擋不能視為安裝成功 */}
  }
  return false;
}
export async function copyDgConsole():Promise<void>{
  if(typeof document==='undefined')throw new Error('請在網頁版複製 DG 腳本');
  if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(DG_CONSOLE_SOURCE);return;}catch{/* 不支援 Clipboard 的瀏覽器走選取複製 */}}
  const node=document.createElement('textarea');node.value=DG_CONSOLE_SOURCE;node.style.position='fixed';node.style.left='-9999px';document.body.appendChild(node);node.select();
  const copied=document.execCommand('copy');node.remove();if(!copied)throw new Error('瀏覽器不允許複製，請開啟 /dg-direct-bet-console.js 手動全選');
}
