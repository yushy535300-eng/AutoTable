import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {createMtOfficialTurnover} from '../lib/mt-official-turnover';
import {officialAmount,mtOfficialRange} from '../lib/official-turnover-data';

function fixture(){
 const calls:any[]=[];
 class Socket extends EventTarget {url='wss://a1.ofalive99.net/game/ws';readyState=1;send(raw:string){calls.push(JSON.parse(raw));}}
 const W:any={WebSocket:Socket,setInterval,clearInterval,setTimeout,queueMicrotask};
 const subject=createMtOfficialTurnover(W);const socket=new Socket();
 function respond(msg:any,err=0){const e=new Event('message');Object.assign(e,{data:JSON.stringify({action:{name:'/api/v1/gametype/*/game/*/bet/history',err},msg})});socket.dispatchEvent(e);}
 return{subject,socket,calls,respond};
}
const report=(v:unknown)=>({total:{all:{v,p:999999,n:800000}},bets:[{bet_amount:10000}],pages:{cur:1}});
describe('MT official turnover',()=>{
 beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-14T09:00:00Z'));});
 afterEach(()=>vi.useRealTimers());
 it('uses full official total.all.v, not principal or P&L, with today/week separate',async()=>{
  const t=fixture();t.socket.send(JSON.stringify({action:{name:'/api/v1/ping'}}));await vi.advanceTimersByTimeAsync(0);
  expect(t.calls[1].body.cur).toBe(1);expect(t.calls[1].body.begin_at).toBe('2026-10-14T00:00:00.000Z');
  t.respond(report('1200.50'));expect(t.subject.view().today.value).toBe(1200.5);
  await vi.advanceTimersByTimeAsync(350);expect(t.calls[2].body.begin_at).toBe('2026-10-08T00:00:00.000Z');
  t.respond(report(9000));expect(t.subject.view().week.value).toBe(9000);
  t.respond(report(123));expect(t.subject.view().week.value).toBe(9000); // unsolicited duplicate ignored
  expect(t.calls.every(x=>x.method!=='POST'||!x.action.name.endsWith('/bet'))).toBe(true);t.subject.dispose();
 });
 it.each([null,undefined,'',false,'invalid',-2])('missing/invalid official value %s stays pending',async(v)=>{
  const t=fixture();t.socket.send('{}');await vi.advanceTimersByTimeAsync(0);t.respond(report(v));expect(t.subject.view().today.value).toBeNull();t.subject.dispose();
 });
 it('official zero is valid and stopped scripts still read reports',async()=>{
  const t=fixture();t.socket.send('{}');await vi.advanceTimersByTimeAsync(0);t.respond(report(0));expect(t.subject.view().today.value).toBe(0);t.subject.dispose();
 });
 it('a nonzero success code must not publish totals',async()=>{const t=fixture();t.socket.send('{}');await vi.advanceTimersByTimeAsync(0);t.respond(report(12),21);expect(t.subject.view().today.value).toBeNull();t.subject.dispose();});
 it('timeout blocks further same-socket queries and does not assign late totals to week',async()=>{
  const t=fixture();t.socket.send('{}');await vi.advanceTimersByTimeAsync(13000);t.respond(report(999));expect(t.subject.view().today.value).toBeNull();t.subject.refresh(true);expect(t.calls.length).toBe(2);t.subject.dispose();
 });
 it('overlapping external report invalidates both periods rather than borrowing another date',async()=>{
  const t=fixture();t.socket.send('{}');await vi.advanceTimersByTimeAsync(0);t.socket.send(JSON.stringify({method:'GET',action:{name:'/api/v1/gametype/*/game/*/bet/history'},body:{begin_at:'1999'}}));t.respond(report(555));expect(t.subject.view().today.value).toBeNull();expect(t.subject.view().week.value).toBeNull();t.subject.dispose();
 });
 it('cross-midnight clears data instead of relabeling yesterday as today',async()=>{
  const t=fixture();t.socket.send('{}');await vi.advanceTimersByTimeAsync(0);t.respond(report(88));await vi.advanceTimersByTimeAsync(350);t.respond(report(99));vi.setSystemTime(new Date('2026-10-14T16:01:00Z'));expect(t.subject.view().today.value).toBeNull();t.subject.dispose();
 });
 it('restores original send and removes all report listeners on dispose',async()=>{
  const t=fixture();const wrapped=t.socket.send;t.subject.dispose();expect(t.socket.send).not.toBe(wrapped);t.socket.send('{}');await vi.advanceTimersByTimeAsync(5000);expect(t.calls).toHaveLength(1);
 });
});
describe('official money/range',()=>{
 it('does not convert null or empty to zero',()=>{for(const x of [null,undefined,'',' ',false])expect(officialAmount(x)).toBeNull();expect(officialAmount('0')).toBe(0);expect(officialAmount('12.50')).toBe(12.5);});
 it('uses literal calendar Z and near-seven-day official span',()=>expect(mtOfficialRange('week',Date.parse('2026-10-14T16:01Z')).begin_at).toBe('2026-10-09T00:00:00.000Z'));
});
