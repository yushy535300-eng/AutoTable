import {DG_PROVIDER_LOGOS} from './dg-provider-logos';
type ProviderOption={key:string;label:string};
export function installDgProviderMenu(shadow:ShadowRoot,options:ProviderOption[]){
  const select=shadow.getElementById('provider') as HTMLSelectElement;
  const trigger=shadow.getElementById('provider-trigger') as HTMLButtonElement;
  const menu=shadow.getElementById('provider-menu')!;
  const currentLogo=shadow.getElementById('provider-selected-logo')!;
  const currentName=shadow.getElementById('provider-selected-name')!;
  const mainLogo=shadow.getElementById('main-strategy-logo')!;
  let last='';
  const buttons:HTMLButtonElement[]=[];
  function logo(key:string,prefix:string){
    // Prefix IDs so gradients cannot reference another instance of the same icon.
    return (DG_PROVIDER_LOGOS[key]??DG_PROVIDER_LOGOS.road).replace(/id="([^"]+)"/g,`id="${prefix}-$1"`).replace(/url\(#([^\)]+)\)/g,`url(#${prefix}-$1)`);
  }
  function close(){menu.hidden=true;trigger.setAttribute('aria-expanded','false');}
  function sync(){
    const key=select.value;
    if(key===last)return;
    last=key;
    currentLogo.innerHTML=logo(key,'trigger');mainLogo.innerHTML=logo(key,'main');
    currentName.textContent=options.find(x=>x.key===key)?.label??key;
    for(const b of buttons){const active=b.dataset.value===key;b.classList.toggle('selected',active);b.setAttribute('aria-selected',String(active));}
  }
  function open(){
    if(trigger.disabled)return;
    menu.hidden=false;trigger.setAttribute('aria-expanded','true');
    const triggerBox=trigger.getBoundingClientRect();
    const surface=shadow.getElementById('settings-page')!.getBoundingClientRect();
    const scale=trigger.offsetHeight?triggerBox.height/trigger.offsetHeight:1;
    const below=Math.max(0,(surface.bottom-triggerBox.bottom)/Math.max(.2,scale)-10);
    const above=Math.max(0,(triggerBox.top-surface.top)/Math.max(.2,scale)-10);
    const up=below<252&&above>below;
    menu.style.top=up?'auto':'46px';menu.style.bottom=up?'46px':'auto';
    menu.style.maxHeight=Math.min(260,Math.max(84,up?above:below))+'px';
    menu.style.overflowY='auto';
  }
  trigger.onclick=()=>{sync();if(menu.hidden)open();else close();};
  trigger.onkeydown=(e:KeyboardEvent)=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open();(buttons.find(b=>b.dataset.value===select.value)??buttons[0]).focus();}
  };
  for(const option of options){
    const b=document.createElement('button');b.type='button';b.dataset.value=option.key;b.className='provider-option';b.setAttribute('role','option');b.setAttribute('aria-label',option.label);
    const mark=document.createElement('span');mark.className='provider-logo';mark.setAttribute('aria-hidden','true');mark.innerHTML=logo(option.key,'option-'+option.key);
    const label=document.createElement('span');label.textContent=option.label;
    const check=document.createElement('span');check.className='provider-check';check.textContent='✓';check.setAttribute('aria-hidden','true');
    b.append(mark,label,check);b.onclick=()=>{select.value=option.key;select.dispatchEvent(new Event('change',{bubbles:true}));sync();close();trigger.focus();};
    b.onkeydown=(e:KeyboardEvent)=>{
      const index=buttons.indexOf(b);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus();}
      if(e.key==='Home'||e.key==='End'){e.preventDefault();buttons[e.key==='Home'?0:buttons.length-1].focus();}
      if(e.key==='Escape'){e.preventDefault();close();trigger.focus();}
    };
    buttons.push(b);menu.append(b);
  }
  function outside(e:Event){if(!(e.target as Element)?.closest('.provider-picker'))close();}
  function escape(e:KeyboardEvent){if(e.key==='Escape')close();}
  shadow.addEventListener('pointerdown',outside);
  shadow.addEventListener('keydown',escape as EventListener);
  select.addEventListener('change',sync);
  sync();
  return {sync,close,cleanup:()=>{shadow.removeEventListener('pointerdown',outside);shadow.removeEventListener('keydown',escape as EventListener);select.removeEventListener('change',sync);trigger.onclick=trigger.onkeydown=null;for(const b of buttons)b.onclick=b.onkeydown=null;}};
}
