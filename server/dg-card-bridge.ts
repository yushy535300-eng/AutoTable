import { decodeDgCardFrame } from "../shared/dg-card-frame";

/**
 * Runs inside the already-injected DG proxy page. The surrounding proxy owns
 * transport mirroring and calls __dgCardReceive(buf) after it has normalized a
 * binary message into an ArrayBuffer. This bridge neither opens nor changes a
 * transport and retains only sanitized per-table metadata/card candidates.
 */
export const DG_CARD_BRIDGE_SCRIPT = `
const __dgDecodeDgCardFrame=${decodeDgCardFrame.toString()};
let __dgCardFeedReceive=function(){};
function __dgCardReceive(value){
  try{
    const decoded=__dgDecodeDgCardFrame(value);
    if(!decoded)return null;
    return __dgCardFeedReceive(decoded);
  }catch(_){return null;}
}
(function(){
  "use strict";
  const __dgHost=typeof window==="object"&&window?window:null;
  if(!__dgHost||__dgHost.__AUTOBAC_DG_CARD_FEED__)return;
  const __dgMaxTables=256;
  const __dgRows=new Map();
  const __dgListeners=[];
  let __dgSequence=0;
  const __dgOwn=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const __dgSafeInteger=value=>typeof value==="number"&&Number.isSafeInteger(value);
  const __dgCopyRow=row=>{
    if(!row||!__dgSafeInteger(row.tableId))return null;
    const copy={tableId:row.tableId};
    for(const key of ["shoeId","playId","state"]){
      if(__dgOwn(row,key)&&__dgSafeInteger(row[key]))copy[key]=row[key];
    }
    if(__dgOwn(row,"poker")&&typeof row.poker==="string")copy.poker=row.poker;
    return copy;
  };
  const __dgMetadata=row=>{
    const copy=__dgCopyRow(row);
    if(copy)delete copy.poker;
    return copy;
  };
  const __dgCopyFrame=frame=>({
    cmd:__dgSafeInteger(frame&&frame.cmd)?frame.cmd:0,
    codeId:__dgSafeInteger(frame&&frame.codeId)?frame.codeId:0,
    table:Array.isArray(frame&&frame.table)?frame.table.map(__dgCopyRow).filter(Boolean):[]
  });
  const __dgTouch=(id,entry)=>{
    entry.touched=++__dgSequence;
    __dgRows.delete(id);
    __dgRows.set(id,entry);
  };
  const __dgPrune=()=>{
    while(__dgRows.size>__dgMaxTables){
      const first=__dgRows.keys().next();
      if(first.done)break;
      __dgRows.delete(first.value);
    }
  };
  const __dgLatestPlay=entry=>{
    let latest;
    for(const row of [entry.metadata,entry.complete]){
      if(row&&__dgOwn(row,"playId")&&__dgSafeInteger(row.playId)&&(latest===undefined||row.playId>latest))latest=row.playId;
    }
    return latest;
  };
  const __dgAccept=row=>{
    const incoming=__dgCopyRow(row);if(!incoming)return false;
    const id=incoming.tableId;__dgPrune();let entry=__dgRows.get(id);
    const rawHasShoe=__dgOwn(incoming,"shoeId");
    let retired=entry&&entry.retiredShoes||new Set();
    if(entry&&rawHasShoe&&entry.shoeId!==undefined&&incoming.shoeId!==entry.shoeId){
      if(retired.has(incoming.shoeId))return false;
      retired.add(entry.shoeId);__dgRows.delete(id);entry=undefined;
    }
    // Partial updates bind only to an exact already-identified native round.
    if(entry&&!rawHasShoe&&entry.shoeId!==undefined&&
       [entry.metadata,entry.complete].some(r=>r&&r.playId===incoming.playId&&r.shoeId===entry.shoeId))incoming.shoeId=entry.shoeId;
    const hasShoe=__dgOwn(incoming,"shoeId");let delayedComplete=false;
    if(entry){
      const latestPlay=__dgLatestPlay(entry);
      if(__dgOwn(incoming,"playId")&&latestPlay!==undefined&&incoming.playId<latestPlay){
        if(incoming.playId===1&&incoming.state===1&&rawHasShoe&&incoming.shoeId===0){entry.complete=undefined;entry.conflictComplete=undefined;}
        else if((incoming.playId===latestPlay-1||entry.complete&&incoming.playId===entry.complete.playId)&&incoming.state===5&&typeof incoming.poker==="string")delayedComplete=true;
        else return false;
      }
    }
    if(!entry)entry={metadata:undefined,complete:undefined,conflictComplete:undefined,shoeId:undefined,touched:0,retiredShoes:retired};
    if(hasShoe)entry.shoeId=incoming.shoeId;
    if(!delayedComplete)entry.metadata=__dgMetadata(incoming);
    // A repeated previous result must still reach the tracker, particularly
    // if it conflicts. Preserve both candidates for safe console replay.
    if(incoming.state===5&&typeof incoming.poker==="string"){
      const current=entry.complete;
      if(!current||incoming.playId>current.playId){entry.complete=__dgCopyRow(incoming);entry.conflictComplete=undefined;}
      else if(incoming.playId===current.playId&&incoming.poker!==current.poker)entry.conflictComplete=__dgCopyRow(incoming);
    }
    __dgTouch(id,entry);__dgPrune();return __dgRows.has(id);
  };
  const __dgSnapshot=()=>{
    __dgPrune();
    const entries=Array.from(__dgRows.values()).sort((a,b)=>b.touched-a.touched);
    const table=[];
    for(const entry of entries){if(entry.complete){const copy=__dgCopyRow(entry.complete);if(copy)table.push(copy);}}
    for(const entry of entries){if(entry.conflictComplete){const copy=__dgCopyRow(entry.conflictComplete);if(copy)table.push(copy);}}
    for(const entry of entries){if(entry.metadata){const copy=__dgMetadata(entry.metadata);if(copy)table.push(copy);}}
    return {cmd:0,codeId:0,table};
  };
  const __dgEmit=frame=>{
    for(const listener of __dgListeners.slice()){
      try{listener(__dgCopyFrame(frame));}catch(_){}
    }
  };
  __dgCardFeedReceive=frame=>{
    const safe=__dgCopyFrame(frame);
    // DG's non-zero codeId is an error response, never room-card evidence.
    // Reject before touching cache or listeners.
    if(safe.codeId!==0)return null;
    const accepted=[];
    for(const row of safe.table){
      if(__dgAccept(row))accepted.push(__dgCopyRow(row));
    }
    if(!accepted.length)return null;
    const emitted={cmd:safe.cmd,codeId:safe.codeId,table:accepted.filter(Boolean)};
    __dgEmit(emitted);
    return emitted;
  };
  const feed={
    subscribe(fn){
      if(typeof fn!=="function")return function(){};
      __dgListeners.push(fn);
      try{fn(__dgSnapshot());}catch(_){}
      let active=true;
      return function(){
        if(!active)return;
        active=false;
        const index=__dgListeners.indexOf(fn);
        if(index>=0)__dgListeners.splice(index,1);
      };
    },
    snapshot(){return __dgSnapshot();}
  };
  try{Object.defineProperty(__dgHost,"__AUTOBAC_DG_CARD_FEED__",{value:feed,writable:false,configurable:false});}
  catch(_){__dgHost.__AUTOBAC_DG_CARD_FEED__=feed;}
})();
`;
