export const PAGE_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';

// Kept self-contained so the identical behavior runs before the root and vendor
// iframe UIs. No game/auth/socket APIs are touched. OS accessibility zoom and
// browser menu commands are outside a webpage's control.
export const PAGE_ZOOM_LOCK_SCRIPT = `(function(){
  if(window.__AUTOBAC_ZOOM_LOCK__)return;
  window.__AUTOBAC_ZOOM_LOCK__=true;
  var content=${JSON.stringify(PAGE_VIEWPORT_CONTENT)};
  function viewport(){
    var all=document.querySelectorAll('meta[name="viewport"]'),m=all[0];
    if(!m){m=document.createElement('meta');m.name='viewport';(document.head||document.documentElement).appendChild(m);}
    for(var i=1;i<all.length;i++)all[i].remove();
    if(m.content!==content||all.length>1)m.content=content;
  }
  viewport();
  var style=document.createElement('style');style.id='autobac-zoom-lock-style';
  style.textContent='html,body{touch-action:pan-x pan-y;}@media (pointer:coarse){input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):not([type="hidden"]),textarea,select{font-size:16px!important;}}';
  (document.head||document.documentElement).appendChild(style);
  function cancel(event){if(event.cancelable)event.preventDefault();}
  ['gesturestart','gesturechange','gestureend'].forEach(function(name){document.addEventListener(name,cancel,{passive:false});});
  function touch(event){if(event.touches&&event.touches.length>1||typeof event.scale==='number'&&event.scale!==1)cancel(event);}
  document.addEventListener('touchstart',touch,{passive:false});
  document.addEventListener('touchmove',touch,{passive:false});
  document.addEventListener('wheel',function(event){if(event.ctrlKey||event.metaKey)cancel(event);},{passive:false});
  document.addEventListener('keydown',function(event){if((event.ctrlKey||event.metaKey)&&['+','-','=','0'].indexOf(event.key)!==-1)cancel(event);});
  if(window.MutationObserver&&document.head){new MutationObserver(function(changes){
    if(changes.some(function(change){return change.type==='attributes'&&change.target.tagName==='META'&&change.target.name==='viewport'||change.type==='childList'&&Array.from(change.addedNodes).some(function(node){return node.tagName==='META'&&node.name==='viewport';});}))viewport();
  }).observe(document.head,{childList:true,subtree:true,attributes:true,attributeFilter:['content','name']});}
})();`;

/** Apply the lock to our root document or an already-authorized game document. */
export function withPageZoomLock(html: string): string {
  if (html.includes('id="autobac-page-zoom-lock"')) return html;
  const page = html.replace(/<meta\b(?=[^>]*\bname\s*=\s*(?:"viewport"|'viewport'|viewport(?=\s|\/?>)))[^>]*>/gi, '');
  const hook = `<meta name="viewport" content="${PAGE_VIEWPORT_CONTENT}"><script id="autobac-page-zoom-lock">${PAGE_ZOOM_LOCK_SCRIPT}</script>`;
  if (/<head(?:\s[^>]*)?>/i.test(page)) return page.replace(/<head(?:\s[^>]*)?>/i, match => match + hook);
  return hook + page;
}
