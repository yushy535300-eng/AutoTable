import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';

const source=readFileSync(new URL('../scripts/mt-navigation-patch.js',import.meta.url),'utf8');
function fixture(mode='proxy') {
  const root:any={isConnected:true,dataset:{},querySelector:()=>null};
  const diag:any={report:()=>({liveTables:[],tableViewport:{history:[]}}),dispose:vi.fn(),scrollToTable:vi.fn()};
  const W:any={location:{protocol:'https:',hostname:mode==='native'?'gsb.ofalive99.net':'autotable-o6a2.onrender.com',origin:'https://autotable-o6a2.onrender.com',pathname:'/mt-game/'},parent:{location:{origin:'https://autotable-o6a2.onrender.com'}},document:{getElementById:()=>root},console:{log:vi.fn(),error:vi.fn(),table:vi.fn()},__MT_AUTOBAC_DIAG__:diag};
  const marker=Object.freeze({kind:'autobac-mt-foreground-v1',version:1,pathPrefix:'/mt-game'});
  if(mode==='proxy')Object.defineProperty(W,'__AUTOBAC_MT_FOREGROUND__',{value:marker,writable:false,configurable:false});
  if(mode==='mutable')W.__AUTOBAC_MT_FOREGROUND__=marker;
  const nav={list:()=>[{name:'B05',tableId:'BAV05',betAreaFound:true}],history:()=>[],focus:vi.fn().mockResolvedValue({ok:true,name:'B05'}),cancel:vi.fn()};
  const module:any={exports:{}};runInNewContext(source,{module});
  return {W,nav,diag,install:()=>module.exports.installMtNavigationPatch(W,()=>nav)};
}
describe('MT marked same-origin mobile navigator installation',()=>{
  it('installs the enhanced navigator on the exact verified Render iframe and focuses without betting',async()=>{
    const f=fixture();expect(f.install()).not.toBeNull();
    expect(f.W.__MT_NAV_PATCH__).toBeTruthy();
    expect(f.diag.report().tableViewport.tables).toEqual(f.nav.list());
    await f.diag.scrollToTable('B05');expect(f.nav.focus).toHaveBeenCalledWith('B05',{identity:'display'});
  });
  it('preserves official native console support',()=>{expect(fixture('native').install()).not.toBeNull();});
  it('rejects missing or mutable foreground markers',()=>{
    expect(fixture('absent').install()).toBeNull();expect(fixture('mutable').install()).toBeNull();
  });
  it('rejects unrelated paths, parent origin mismatches, and top-level pages',()=>{
    const path=fixture();path.W.location.pathname='/';expect(path.install()).toBeNull();
    const parent=fixture();parent.W.parent.location.origin='https://untrusted.example';expect(parent.install()).toBeNull();
    const self=fixture();self.W.parent=self.W;expect(self.install()).toBeNull();
  });
});
