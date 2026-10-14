import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { isDgMultiLobbyCard, getDgBetControls, hasDgVerifiedMobilePacketBuilder, inspectDgMobileNativeSurface, dgNativeBetEnabled, dgBuilderSourceFingerprint } from '../lib/dg-mobile-native';
import { describeDgScene } from '../lib/dg-scene';
import { createDgOperationCapture, captureDgViewport } from '../lib/dg-operation-capture';
import { ensureDgMultiHall } from '../lib/dg-auto-multihall';
import { dgFrameInstallMode } from '../lib/dg-frame-installer';
import { DgBetLedger } from '../lib/dg-bet-ledger';
const nativeSources = createRequire(import.meta.url)('./fixtures/dg-mobile-v329-builders.cjs');
function card(name='ei') {
  const Native = Function('m','g','r','md5', `return class Native { ${nativeSources[name]} }`)(
    {MultiBaccaratType:['Banker','Player']}, {getVerifyInfo:()=>'', getBetEncryptInfo:()=>''}, {BET_CHIP:'BET_CHIP'}, ()=>'',
  );
  const value = new Native();
  Object.assign(value, { tableId:60102, gameInfo:{stateId:1,gameNo:'round-test',tableName:'RB02',roadArray:[],countDown:20},
    betBtn:{Banker:{event:vi.fn()},Player:{event:vi.fn()}},
    betBtnMan:{betFlag:true,confirmBtn:{event:vi.fn()},cancelBtn:{event:vi.fn()}},
    betMoneyTmp:{Banker:0,Player:0},betMoneyTrue:{Banker:0,Player:0},
    playerInfo:{balance:22626.6,selectChip:100,socketMan:{sendData:vi.fn(),socket:{connected:true}}},
  });return value;
}
describe('DG actual mobile V3.2.9 integration',()=>{
  it.each([['ei','1517:2faa00b2'],['Ki','1443:b3416a14']])('recognizes the exact public %s method and real manager-owned controls', (name,fingerprint)=>{
    const value=card(name);
    expect(value.betFlag).toBeUndefined();expect(value.betMan).toBeUndefined();
    expect(isDgMultiLobbyCard(value)).toBe(true);
    expect(getDgBetControls(value)).toMatchObject({profile:'mobile-v329',confirm:value.betBtnMan.confirmBtn});
    expect(dgBuilderSourceFingerprint(value.confirmBet)).toBe(fingerprint);
    expect(hasDgVerifiedMobilePacketBuilder(value)).toBe(true);expect(dgNativeBetEnabled(value)).toBe(true);
    value.betBtnMan.betFlag=false;expect(dgNativeBetEnabled(value)).toBe(false);
  });
  it('does not whitelist a same-shaped unknown builder or single-room control manager',()=>{
    const value=card();value.confirmBet=function(){return 'unknown';};
    expect(hasDgVerifiedMobilePacketBuilder(value)).toBe(false);expect(dgNativeBetEnabled(value)).toBe(false);
    delete value.betBtn;expect(isDgMultiLobbyCard(value)).toBe(false);
  });
  it('does not resolve a mixed manual packet by a later tool-sized acknowledgement',()=>{
    const ledger=new DgBetLedger(),bet=ledger.reserve('60102','r','莊',100,'global','doubling');ledger.submit(bet);
    bet.attributionUncertain=true;bet.state='uncertain';
    expect(ledger.receipt({cmd:6,codeId:0,tableId:60102,gameNo:'r',list:['{"banker":100}']})?.accepted).toBe(false);
    expect(ledger.settle({cmd:1007,codeId:0,tableId:60102,gameNo:'r',dList:[0,-100]})).toBeNull();
    expect(bet.state).toBe('uncertain');expect(ledger.level('60102','global')).toBe(0);expect(ledger.pending()).toHaveLength(1);
  });
  it('reads eight actual-shaped mobile cards without clicking or sending',()=>{
    const cards=Array.from({length:8},()=>card());
    const W={innerWidth:440,innerHeight:759,Laya:{stage:{numChildren:8,getChildAt:(i:number)=>cards[i]}}};
    expect(inspectDgMobileNativeSurface(W)).toEqual({readiness:'compatible',portrait:true,cardCount:8,rejectedCardCount:0});
    expect(describeDgScene(cards).candidates.every(candidate=>!candidate.missing.length&&candidate.betFlag)).toBe(true);
    for(const value of cards){expect(value.playerInfo.socketMan.sendData).not.toHaveBeenCalled();expect(value.betBtnMan.confirmBtn.event).not.toHaveBeenCalled();}
  });
  it('diagnostic records mobile confirmation click and keeps last observed connection after stop',()=>{
    const value=card(), clickHandlers:any[]=[];
    value.playerInfo.socketMan.on=vi.fn();value.playerInfo.socketMan.off=vi.fn();
    const W:any={Laya:{Event:{CLICK:'click'},stage:{numChildren:1,getChildAt:()=>value,on:(_event:any,_owner:any,fn:any)=>clickHandlers.push(fn),off:vi.fn()}},document:{location:{href:'https://example.com/ddnewwap/',origin:'https://example.com'},scripts:[]}};
    const recorder=createDgOperationCapture(W,{setInterval:()=>1,clearInterval:vi.fn()});
    clickHandlers[0]({target:value.betBtnMan.confirmBtn});
    expect(recorder.status()).toMatchObject({completeCards:1,cardCandidates:1,confirmClick:true,sent:0,accepted:0,settled:0,socketDetected:true});
    recorder.stop();expect(recorder.report().summary.socketDetected).toBe(true);
    expect(value.playerInfo.socketMan.sendData).not.toHaveBeenCalled();
  });
  it('reports the actual stage canvas rather than the first 300×150 helper canvas',()=>{
    const helper={id:'',width:300,height:150,getBoundingClientRect:()=>({width:300,height:150,left:0,top:0})};
    const stage={id:'layaCanvas',width:1320,height:2277,getBoundingClientRect:()=>({width:440,height:759,left:0,top:0})};
    const report=captureDgViewport({document:{querySelectorAll:()=>[helper,stage]}});
    expect(report).toMatchObject({canvas:{width:440,height:759},canvasBitmap:{width:1320,height:2277}});
  });
  function navigation(layout='Hot'){
    const player={layoutType:layout}, button:any={buttonName:'Mulit',gameType:100,lobbyId:100,event:vi.fn()}, box:any={_children:[button]};button.parent=box;
    const menu:any={playerInfo:player,gameCacheMC:box,gameArray:[button],lobbyArray:[button],_children:[box]};box.parent=menu;
    const lobby:any={viewName:'Lobby',playerInfo:player,selectGameMenu:menu,selectLobbyMan:menu,_children:[menu]};menu.parent=lobby;
    const stage={getChildAt:()=>lobby,numChildren:1}, doc:any={location:{origin:'https://offline.test',href:'https://offline.test/ddnewwap/V3.2.9/index.html',pathname:'/ddnewwap/V3.2.9/index.html'},scripts:[{src:'https://offline.test/ddnewwap/V3.2.9/js/bundle.js'}]};
    const W:any={Laya:{stage,Event:{CLICK:'click'}}};
    return {frame:{contentWindow:W,contentDocument:doc},button,lobby,menu,box,W,doc};
  }
  it.each(['Hot','Class'])('clicks the evidenced %s lobby Mulit node once, without calling any betting control', layout=>{
    vi.stubGlobal('window',{location:{origin:'https://offline.test'}});
    try{
      const setup=navigation(layout);
      expect(ensureDgMultiHall(setup.frame,'mobile')).toBe('requested');expect(setup.button.event).toHaveBeenCalledWith('click');
      expect(ensureDgMultiHall(setup.frame,'mobile')).toBe('requested');expect(setup.button.event).toHaveBeenCalledTimes(1);
      expect(dgFrameInstallMode(setup.frame,'desktop')).toBe('mobile');
    }finally{vi.unstubAllGlobals();}
  });
  it('does not navigate an active single game, recording session, unknown version, disabled or ambiguous menu',()=>{
    vi.stubGlobal('window',{location:{origin:'https://offline.test'}});
    try{
      for(const mutation of [
        (s:any)=>s.lobby.viewName='Game',
        (s:any)=>s.W.__DG_MANUAL_CAPTURE_ACTIVE__=true,
        (s:any)=>s.doc.scripts[0].src='https://offline.test/ddnewwap/V9/js/bundle.js',
        (s:any)=>s.button.mouseEnabled=false,
        (s:any)=>s.menu.gameArray.push({...s.button,event:vi.fn()}),
        (s:any)=>s.button.parent={},
      ]){
        const setup=navigation();mutation(setup);
        expect(ensureDgMultiHall(setup.frame,'mobile')).toBe('waiting');expect(setup.button.event).not.toHaveBeenCalled();
      }
    }finally{vi.unstubAllGlobals();}
  });
});
