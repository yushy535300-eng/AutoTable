// Optional isolated test dependency: npm install --prefix /tmp/autobac-pg-test @electric-sql/pglite@0.3.14
// In-memory PostgreSQL only: never reads DATABASE_URL or connects to a production database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');
const {EventEmitter} = require('node:events');
let PGlite;
try { ({PGlite} = require('@electric-sql/pglite')); }
catch { ({PGlite} = require('/tmp/autobac-pg-test/node_modules/@electric-sql/pglite')); }
const temp = fs.mkdtempSync(path.join(os.tmpdir(),'autobac-audit-sql-'));
for(const name of ['dg-settings-records','dg-usage-records','admin-audit-reader','user-presence']){
 esbuild.buildSync({entryPoints:[path.join(__dirname,'..','server',name+'.ts')],outfile:path.join(temp,name+'.cjs'),bundle:true,platform:'node',format:'cjs'});
}
const {recordDgSettingsSnapshot} = require(path.join(temp,'dg-settings-records.cjs'));
const {recordDgUsageReport} = require(path.join(temp,'dg-usage-records.cjs'));
const {readAdminAuditRecords,adminAuditDetailsPage} = require(path.join(temp,'admin-audit-reader.cjs'));
const {ensureUserPresence,registerUserPresence} = require(path.join(temp,'user-presence.cjs'));
const snapshot = {version:1,gamePlatform:'DG',runMode:'continuous',startMode:'fresh',provider:'combined',tableCount:'1',selectionMode:'auto',selectedTables:[{tableId:'1001',tableName:'S03'}],baseAmount:100,staking:'flat',maxStake:1000,stopLoss:350,takeProfit:200,durationMinutes:30,minSeconds:6,currency:'TWD'};
const runId='00000000-0000-4000-8000-000000000008';
const now=Date.now();
const counts={reserved:0,submitted:0,accepted:0,settled:0,uncertain:0,rejected:0,aborted:0};
const baseline={version:1,runId,settingsEventId:runId,sequence:0,status:'active',stopCode:null,startedAt:now,updatedAt:now,endedAt:null,elapsedMs:0,durationMinutes:30,eventCounts:counts,result:{settledPnl:0,settledCount:0,wins:0,losses:0,pendingCount:0,uncertainCount:0}};
(async()=>{
 const pg=new PGlite();
 const db={query:(sql,params)=>pg.query(sql,params)};
 try {
  await pg.exec(`CREATE TABLE tz_whitelist(id BIGSERIAL PRIMARY KEY,platform VARCHAR(16),username VARCHAR(128),enabled BOOLEAN,expires_at TIMESTAMPTZ);
   CREATE TABLE tracker_sessions(session_id VARCHAR(160) PRIMARY KEY,platform VARCHAR(16),username VARCHAR(128));
   INSERT INTO tz_whitelist(platform,username,enabled) VALUES ('TZ','Alpha',TRUE),('TZ','Beta',TRUE);
   INSERT INTO tracker_sessions VALUES ('local-alpha','TZ','Alpha'),('local-beta','TZ','Beta');`);
  const original=(await pg.query('SELECT * FROM tz_whitelist ORDER BY id')).rows;
  assert.equal((await recordDgSettingsSnapshot(db,{platform:'TZ',username:'Alpha'},runId,'local-alpha','dg-risk-2026-10-16-v5-usage',snapshot)).ok,true);
  assert.equal((await recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',baseline)).sequence,0);
  assert.equal((await recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',baseline)).sequence,0,'same immutable report is idempotent');
  const active={...baseline,sequence:1,updatedAt:now+5000,elapsedMs:5000};
  await recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',active);
  await assert.rejects(()=>recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',baseline),/conflict/);
  const stopped={...active,sequence:2,status:'stopped',stopCode:'manual',endedAt:now+10000,updatedAt:now+10000,elapsedMs:10000,eventCounts:{...counts,accepted:1},result:{...baseline.result,pendingCount:1}};
  await recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',stopped);
  const late={...stopped,sequence:3,updatedAt:now+30000,eventCounts:{...counts,settled:1},result:{settledPnl:100,settledCount:1,wins:1,losses:0,pendingCount:0,uncertainCount:0}};
  await recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',late);
  await assert.rejects(()=>recordDgUsageReport(db,{platform:'TZ',username:'Alpha'},'local-alpha','dg-risk-2026-10-16-v5-usage',{...active,sequence:4,updatedAt:now+40000,elapsedMs:40000}),/conflict/);
  await recordDgSettingsSnapshot(db,{platform:'TZ',username:'Beta'},runId,'local-beta','dg-risk-2026-10-16-v5-usage',snapshot);
  await assert.rejects(()=>recordDgUsageReport(db,{platform:'TZ',username:'Beta'},'local-beta','dg-risk-2026-10-16-v5-usage',{...late,sequence:4}),/ownership_conflict/);
  const report=await readAdminAuditRecords(db,1,1,'usage');
  assert.equal(report.total,1);
  assert.equal(report.rows[0].report.result.settledPnl,100);
  assert.equal(Number(report.rows[0].elapsed_ms),10000,'late settlement never extends finished duration');
  assert.equal(report.rows[0].settings_snapshot.stopLoss,350,'actual settings LEFT JOIN by the same run UUID');
  const html=adminAuditDetailsPage(report,'usage');
  assert(html.includes('00:00:10') && html.includes('本次已結算輸贏：100'));
  assert.deepEqual((await pg.query('SELECT * FROM tz_whitelist ORDER BY id')).rows,original,'audit never changes the whitelist');
  const interruptedId='00000000-0000-4000-8000-000000000009';
  await recordDgSettingsSnapshot(db,{platform:'TZ',username:'Beta'},interruptedId,'local-beta','dg-risk-2026-10-16-v5-usage',snapshot);
  const interrupted={...active,runId:interruptedId,settingsEventId:interruptedId,status:'interrupted',endedAt:null,stopCode:null};
  assert.equal((await recordDgUsageReport(db,{platform:'TZ',username:'Beta'},'local-beta','dg-risk-2026-10-16-v5-usage',interrupted)).status,'interrupted');
  const interruptedLate={...interrupted,sequence:2,updatedAt:now+30000,eventCounts:{...counts,accepted:1,settled:1},result:{...baseline.result,settledPnl:-100,settledCount:1,losses:1}};
  await recordDgUsageReport(db,{platform:'TZ',username:'Beta'},'local-beta','dg-risk-2026-10-16-v5-usage',interruptedLate);
  await assert.rejects(()=>recordDgUsageReport(db,{platform:'TZ',username:'Beta'},'local-beta','dg-risk-2026-10-16-v5-usage',{...interruptedLate,status:'active',sequence:3,updatedAt:now+40000,elapsedMs:10000}),/conflict/);
  const interruptedRead=await readAdminAuditRecords(db,2,1,'usage');
  assert(adminAuditDetailsPage(interruptedRead,'usage').includes('回報中斷 · 保留最後觀測時間'));
  const interruptedRow=interruptedRead.rows.find(row=>row.run_id===interruptedId);
  assert.equal(Number(interruptedRow.elapsed_ms),5000);assert.equal(interruptedRow.client_ended_at_ms,null);
  await ensureUserPresence(db);
  await pg.exec(`INSERT INTO autobac_user_presence(connection_id,platform,username_key,running,app_id,last_seen_at) VALUES
   ('00000000-0000-4000-8000-000000000001','TZ','alpha',TRUE,'autobac',NOW()),
   ('00000000-0000-4000-8000-000000000002','TZ','alpha',FALSE,'autobac',NOW()),
   ('00000000-0000-4000-8000-000000000003','TZ','alpha',FALSE,'baccarat-helper',NOW()),
   ('00000000-0000-4000-8000-000000000004','TZ','beta',FALSE,'scarab-heart',NOW()),
   ('00000000-0000-4000-8000-000000000005','TZ','beta',FALSE,'baccarat-helper',NOW()-INTERVAL '60 seconds');`);
  let handler;
  const registration=registerUserPresence({get:(_path,...handlers)=>{handler=handlers.at(-1);}},new EventEmitter(),(_req,_res,next)=>next(),{db});
  let presence;
  try {await handler({}, {json:value=>{presence=value;},status:()=>({json:value=>{presence=value;}})});}
  finally {registration.close();}
  assert.equal(presence.ok,true);
  assert.equal(presence.onlineAccounts,2,'same account across sites is counted once globally');
  assert.equal(presence.runningAccounts,1);
  assert.deepEqual(presence.applications.map(row=>row.onlineAccounts),[1,1,1],'same-site tabs and expired leases do not add people');
  assert.deepEqual((await pg.query('SELECT * FROM tz_whitelist ORDER BY id')).rows,original);
  console.log('PASS isolated PostgreSQL (PGlite): actual CREATE/INSERT/ON CONFLICT/SELECT/UNION/LEFT JOIN and per-site COUNT DISTINCT SQL; immutable retry, monotonic sequence, stopped lock, late settlement, ownership rejection, cross-site/tab deduplication, expired leases and unchanged whitelist. Not a production database test.');
 } finally {await pg.close();fs.rmSync(temp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
