import { describe, expect, it, vi } from 'vitest';
import { createDgSettingsRecorder } from '../lib/dg-settings-recorder';
import { DG_RISK_STATEMENT } from '../shared/dg-risk-statement';
import type { DgSettingsSnapshot } from '../shared/dg-settings-snapshot';
const snapshot:DgSettingsSnapshot={version:1,gamePlatform:'DG',runMode:'continuous',startMode:'fresh',provider:'combined',tableCount:'1',selectionMode:'auto',selectedTables:[{tableId:'201',tableName:'RB02'}],baseAmount:100,staking:'martingale',maxStake:100000,stopLoss:2600,takeProfit:null,durationMinutes:30,minSeconds:6,currency:'TWD'};
const event={eventId:'12345678-1234-4234-8234-123456789abc',settings:snapshot};
const receipt={ok:true,recordedAt:'2026-10-16T09:00:00.000Z'};
const response=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
describe('settings recorder bounded transport',()=>{
  it('sends the actual strict snapshot and session only in the request body',async()=>{
    const fetcher=vi.fn(async()=>response(200,receipt));
    await expect(createDgSettingsRecorder('offline-session',fetcher as typeof fetch)(event)).resolves.toEqual(receipt);
    const [url,options]=fetcher.mock.calls[0] as unknown as [string,RequestInit];
    expect(url).toBe('/api/dg/settings-records');expect(options.credentials).toBe('same-origin');
    expect(JSON.parse(String(options.body))).toEqual({sessionId:'offline-session',eventId:event.eventId,statementVersion:DG_RISK_STATEMENT.version,settings:snapshot});
    expect(String(url)).not.toContain('offline-session');
  });
  it('uses the same event and snapshot for all retry attempts',async()=>{
    const bodies:string[]=[];const fetcher=vi.fn(async(_url:any,options:any)=>{bodies.push(options.body);return response(503,{ok:false});});
    await expect(createDgSettingsRecorder('offline-session',fetcher as typeof fetch)(event)).rejects.toThrow('settings_recording_unavailable');
    expect(fetcher).toHaveBeenCalledTimes(3);expect(new Set(bodies).size).toBe(1);
  });
  it('does not retry authentication or conflict failures',async()=>{
    for(const status of [401,403,409]){
      const fetcher=vi.fn(async()=>response(status,{ok:false}));
      await expect(createDgSettingsRecorder('offline-session',fetcher as typeof fetch)(event)).rejects.toThrow();
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });
  it('never sends a malformed configuration or a blank session',async()=>{
    const fetcher=vi.fn();
    await expect(createDgSettingsRecorder('offline-session',fetcher as typeof fetch)({...event,settings:{...snapshot,stopLoss:2599}})).rejects.toThrow();
    await expect(createDgSettingsRecorder('',fetcher as typeof fetch)(event)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
