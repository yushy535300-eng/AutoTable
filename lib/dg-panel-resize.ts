type Size = {width:number;height:number;scale:number};
type ResizeOptions = {
  getSize:(target:HTMLElement)=>Size;
  prepare:(target:HTMLElement)=>void;
  apply:(width:number,height:number)=>void;
};
export function installDgPanelResize(handles:HTMLElement[],options:ResizeOptions):()=>void {
  const cleanups:Array<()=>void>=[];
  for(const handle of handles){
    let active:{id:number;x:number;y:number;size:Size}|null=null;
    function down(e:PointerEvent){
      if(e.button!==0&&e.pointerType==='mouse')return;
      e.preventDefault();e.stopPropagation();
      const target=handle.parentElement!;
      const size=options.getSize(target);
      options.prepare(target);
      active={id:e.pointerId,x:e.clientX,y:e.clientY,size};
      try{handle.setPointerCapture?.(e.pointerId);}catch{/* synthetic pointer or unsupported browser */}
      handle.dataset.resizing='true';
    }
    function move(e:PointerEvent){
      if(!active||active.id!==e.pointerId)return;
      e.preventDefault();
      const fit=Math.max(.2,active.size.scale);
      options.apply(
        Math.max(260,Math.min(520,active.size.width+(e.clientX-active.x)/fit)),
        Math.max(360,Math.min(900,active.size.height+(e.clientY-active.y)/fit)),
      );
    }
    function end(e:PointerEvent){
      if(!active||active.id!==e.pointerId)return;
      if(handle.hasPointerCapture?.(e.pointerId))handle.releasePointerCapture(e.pointerId);
      active=null;delete handle.dataset.resizing;
    }
    function key(e:KeyboardEvent){
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
      e.preventDefault();
      const size=options.getSize(handle.parentElement!);
      options.prepare(handle.parentElement!);
      const delta=e.shiftKey?30:10;
      options.apply(
        Math.max(260,Math.min(520,size.width+(e.key==='ArrowRight'?delta:e.key==='ArrowLeft'?-delta:0))),
        Math.max(360,Math.min(900,size.height+(e.key==='ArrowDown'?delta:e.key==='ArrowUp'?-delta:0))),
      );
    }
    handle.addEventListener('pointerdown',down);
    handle.addEventListener('pointermove',move);
    handle.addEventListener('pointerup',end);
    handle.addEventListener('pointercancel',end);
    function lost(){active=null;delete handle.dataset.resizing;}
    handle.addEventListener('lostpointercapture',lost);
    handle.addEventListener('keydown',key);
    cleanups.push(()=>{
      active=null;delete handle.dataset.resizing;
      handle.removeEventListener('pointerdown',down);
      handle.removeEventListener('pointermove',move);
      handle.removeEventListener('pointerup',end);
      handle.removeEventListener('pointercancel',end);
      handle.removeEventListener('keydown',key);
      handle.removeEventListener('lostpointercapture',lost);
    });
  }
  return ()=>cleanups.forEach(cleanup=>cleanup());
}
