import { DG_RISK_STATEMENT, RISK_EVENT_ID, type DgRiskReceipt } from '../shared/dg-risk-statement';
import { DG_SETTINGS_EVENT, DG_SETTINGS_SYNC_EVENT, dgSettingsSnapshotSchema, type DgSettingsSnapshot } from '../shared/dg-settings-snapshot';

type StartSnapshot={eventId:string;settings:DgSettingsSnapshot};
export function createDgSettingsRecorder(sessionId:string,fetcher:typeof fetch=fetch){
  return async(event:StartSnapshot):Promise<DgRiskReceipt>=>{
    const settings=dgSettingsSnapshotSchema.parse(event.settings);
    if(!sessionId||!RISK_EVENT_ID.test(event.eventId))throw new Error('invalid_settings_record');
    for(let attempt=0;attempt<3;attempt++){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
      let retryable=true;
      try{
        const response=await fetcher('/api/dg/settings-records',{
          method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'Content-Type':'application/json'},
          body:JSON.stringify({sessionId,eventId:event.eventId,statementVersion:DG_RISK_STATEMENT.version,settings}),
        });
        retryable=response.status>=500;
        const result=await response.json();
        if(response.ok&&result?.ok===true&&typeof result.recordedAt==='string'&&Number.isFinite(Date.parse(result.recordedAt)))return {ok:true,recordedAt:result.recordedAt};
        throw new Error('settings_recording_unavailable');
      }catch{if(!retryable||attempt===2)throw new Error('settings_recording_unavailable');}
      finally{clearTimeout(timer);}
      await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
    }
    throw new Error('settings_recording_unavailable');
  };
}

type Frame={contentWindow:any;contentDocument:Document|null};
type Recorder=ReturnType<typeof createDgSettingsRecorder>;
const bindings=new WeakMap<object,{button:HTMLElement;recorder:Recorder;dispose:()=>void}>();
const waiting=new WeakMap<object,{document:Document;recorder:Recorder;observer:MutationObserver}>();
export function bindDgSettingsRecorder(frame:Frame|null,recorder:Recorder):boolean{
  try{
    if(!frame?.contentDocument||!frame.contentWindow||frame.contentDocument.location.origin!==window.location.origin)return false;
    const win=frame.contentWindow,shadow=frame.contentDocument.querySelector('#__dg_singlepage_panel__')?.shadowRoot;
    const button=shadow?.getElementById('risk-confirm'),checkbox=shadow?.getElementById('ack') as HTMLInputElement|null;
    if(!button||!checkbox){
      const old=waiting.get(frame);if(old?.document===frame.contentDocument&&old.recorder===recorder)return false;
      old?.observer.disconnect();
      const observer=new win.MutationObserver(()=>bindDgSettingsRecorder(frame,recorder));
      waiting.set(frame,{document:frame.contentDocument,recorder,observer});observer.observe(frame.contentDocument,{childList:true,subtree:true});return false;
    }
    waiting.get(frame)?.observer.disconnect();waiting.delete(frame);
    const old=bindings.get(frame);if(old?.button===button&&old.recorder===recorder)return true;old?.dispose();
    let active=true,permit=false;let permitTimer:ReturnType<typeof setTimeout>|null=null;
    const onConfirm=(event:Event)=>{
      permit=event instanceof win.Event&&event.isTrusted&&event.currentTarget===button&&checkbox.checked&&!(button as HTMLButtonElement).disabled;
      if(permitTimer!==null)clearTimeout(permitTimer);
      permitTimer=setTimeout(()=>{permit=false;permitTimer=null;},0);
    };
    const notify=(eventId:string,state:'synced'|'failed')=>{
      if(active)win.dispatchEvent(new win.CustomEvent(DG_SETTINGS_SYNC_EVENT,{detail:{eventId,state}}));
    };
    const onStarted=(event:any)=>{
      if(!active||!permit||!(event instanceof win.CustomEvent)||event.target!==win)return;
      permit=false;
      const parsed=dgSettingsSnapshotSchema.safeParse(event.detail?.settings),eventId=String(event.detail?.eventId||'');
      if(!parsed.success||!RISK_EVENT_ID.test(eventId)){notify(eventId,'failed');return;}
      // Session capability stays in this parent closure, never in the game API.
      void recorder({eventId,settings:parsed.data}).then(()=>notify(eventId,'synced')).catch(()=>notify(eventId,'failed'));
    };
    button.addEventListener('click',onConfirm,true);win.addEventListener(DG_SETTINGS_EVENT,onStarted);
    const dispose=()=>{active=false;permit=false;if(permitTimer!==null)clearTimeout(permitTimer);button.removeEventListener('click',onConfirm,true);win.removeEventListener(DG_SETTINGS_EVENT,onStarted);};
    bindings.set(frame,{button,recorder,dispose});return true;
  }catch{return false;}
}
export function unbindDgSettingsRecorder(frame:Frame|null,recorder:Recorder){
  if(!frame)return;
  const pending=waiting.get(frame);if(pending?.recorder===recorder){pending.observer.disconnect();waiting.delete(frame);}
  const entry=bindings.get(frame);if(entry?.recorder===recorder){entry.dispose();bindings.delete(frame);}
}
