#!/usr/bin/env node
/* Offline only: no DG URL, credentials, login, or real wagering are used. */
const assert = require("node:assert/strict"), fs = require("node:fs");
const { chromium } = require("/tmp/dg-testdeps/node_modules/playwright");
const root = require('node:path').resolve(__dirname, '..');
// Public vendor method captured verbatim; standalone anonymous fixture, no live credentials.
const officialConfirmBet = "function confirmBet(){\nvar e=new Object(),i=function(s,h){\nreturn s^h;}\n(286603,286603);if((1)==this.gameInfo.stateId){\nfor(var a=0;a<c.MultiBaccaratType.length;a++){\n(function(){\nvar _0x1bc3d792=88;var _0x7022fb92=function(s,h){\nreturn s^h;}\n(996443,996443);_0x1bc3d792=94;for(var i=function(s,h){\nreturn s^h;}\n(450300,450300);i<(2);i++){\n_0x1bc3d792=\"grh\";}\nreturn 93;}\n)();var h=function(s,h){\nreturn s-h;}\n(this.betMoneyTmp[c.MultiBaccaratType[a]],this.betMoneyTrue[c.MultiBaccaratType[a]]);if(h>(0))switch(c.MultiBaccaratType[a]){\ncase\"Banker\":this.playerInfo.commFlag?e.banker6=h:e.banker=h;break;case\"Player\":e.player=h;break;case\"Tie\":e.tie=h;break;case\"Bpair\":e.bPair=h;break;case\"Ppair\":e.pPair=h;}\ni+=h;}\nif(i>(0)&&this.betFlag){\nvar _0xe34;(function(){\nvar _0xf1656f92=function(s,h){\nreturn s^h;}\n(109335,109341);var _0xbf6g1292=39;_0xbf6g1292=42;if(_0xf1656f92){\n_0xbf6g1292=!![];}\nreturn 96;}\n)();let i={betType:1};_0xe34=(3)+(4);(0)!=this.gameInfo.goodRoadType&&(i.roadType=this.gameInfo.goodRoadType),e.info=JSON.stringify(i);var n=[this.tableId,this.gameInfo.gameNo,this.playerInfo.playerName,t.random.slice(8,16),this.limitId.toString(),t.encrypt(JSON.stringify(e)),this.playerInfo.token,1],o=demo(n);if(!o)return void this.showBetFailed();this.betFlag=!(1),this.showBetMan(!(1)),this.event(s.BET_CHIP,o);}\n}}";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
(async () => {
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const page = await browser.newPage();
  await page.route("**/*", route => route.abort()); // all browser network is forbidden
  await page.addInitScript(() => { window.fetch = () => Promise.reject(Error("offline test")); window.WebSocket = class { constructor() { throw Error("offline test"); } }; });
  await page.setContent("<!doctype html><body></body>");
  await page.evaluate(({ source }) => {
    const sent = [], listeners = new Map(), socket = { socket: { connected: true }, on: (n, o, f) => listeners.set(n, [...(listeners.get(n) || []), {o, f}]), off: (n, o, f) => listeners.set(n, (listeners.get(n)||[]).filter(x => x.o!==o||x.f!==f)), sendData: m => sent.push(m) };
    const playerInfo = { balance: 20811.60, playerName: "offline", token: "offline", socketMan: socket };
    const stage = { numChildren: 1, getChildAt(i) { return i ? null : this.controller; }, controller: { playerInfo } }; // wallet controller has no tableId
    const make = id => { const c = { tableId: String(id), limitId: 1, playerInfo, betFlag: true, visible: true, gameInfo: { tableName: `T${id}`, gameNo: `g${id}`, playId: `p${id}`, stateId: 1, countDown: 20, starTime: Date.now(), goodRoadType: 1, roadArray: [{ road: [1] }, { road: [1] }, { road: [1] }], baccaratLimit: { bpMin: 100, bpMax: 10000 } }, baccaratLimit: { bpMin: 100, bpMax: 10000 }, betBtn: { Banker: { visible: true, mouseEnabled: true }, Player: { visible: true, mouseEnabled: true } }, betMan: { confirm: { event() {} }, cancel: { event() {} } }, betMoneyTmp: { Banker: 0, Player: 0, Tie: 0, Bpair: 0, Ppair: 0 }, betMoneyTrue: { Banker: 0, Player: 0, Tie: 0, Bpair: 0, Ppair: 0 } }; c.confirmBet = Function("c", "t", "s", "demo", `return (${source})`)({ MultiBaccaratType: ["Banker", "Player", "Tie", "Bpair", "Ppair"] }, { random: "0123456789abcdef", encrypt: x => x }, { BET_CHIP: "BET_CHIP" }, n => ({ cmd: 6, tableId: n[0], gameNo: n[1], list: [n[5]] })); return c; };
    window.Laya = { stage }; window.__offline = { sent, socket, listeners, stage, make, playerInfo };
  }, { source: officialConfirmBet });
  await page.addScriptTag({ path: `${root}/public/dg-direct-bet-console.js` });
  const approve = () => page.evaluate(() => { const s = document.querySelector("#__dg_singlepage_panel__").shadowRoot; s.querySelector("#ack").click(); s.querySelector("#risk-confirm").click(); });
  assert.equal(await page.evaluate(() => document.querySelector('#__dg_singlepage_panel__').shadowRoot.getElementById('balance').textContent), '20,811.6', 'controller wallet displays without requiring any card');
  await page.evaluate(() => window.__DG_SINGLEPAGE__.start()); await approve(); await sleep(80);
  assert.equal(await page.evaluate(() => window.__DG_SINGLEPAGE__.status().running), false, "no-table controller must not report running");
  await page.evaluate(() => { const o = window.__offline, cards = [o.make(1), o.make(2), o.make(3)]; o.stage.numChildren = 4; o.stage.getChildAt = i => i ? cards[i - 1] : o.stage.controller; const s = document.querySelector("#__dg_singlepage_panel__").shadowRoot; s.querySelector("#count").value = "3"; s.querySelector("#count").onchange(); });
  await page.evaluate(() => window.__DG_SINGLEPAGE__.start()); await approve(); await sleep(120);
  let state = await page.evaluate(() => ({ sent: window.__offline.sent.filter(x=>x.cmd===6), ledger: window.__DG_SINGLEPAGE__.exportLedger() }));
  assert.equal(state.sent.length, 3, "three-table flat staking must send exactly once per table"); assert(state.sent.every(x => x.cmd === 6), "only native cmd 6 packets"); assert(state.ledger.bets.every(b => b.amount === 100 && b.state === "submitted"), "first stake is 100, never stale 7000");
  await page.evaluate(() => { const o = window.__offline; for (const m of o.sent.filter(x=>x.cmd===6)) for(const h of o.listeners.get("RECEIVED_SUCCESS")||[]) h.f({ cmd: 6, tableId: m.tableId, gameNo: m.gameNo, codeId: 0, list: m.list }); }); await sleep(30);
  assert((await page.evaluate(() => window.__DG_SINGLEPAGE__.exportLedger())).bets.every(b => b.state === "accepted"), "only matching cmd 6 receipt accepts");
  await page.evaluate(() => { const o = window.__offline; for (const m of o.sent.filter(x=>x.cmd===6)) for(const h of o.listeners.get("RECEIVED_SUCCESS")||[]) h.f({ cmd: 1007, tableId: m.tableId, gameNo: m.gameNo, codeId: 0, dList: [0, -100] }); }); await sleep(30);
  state = await page.evaluate(() => window.__DG_SINGLEPAGE__.exportLedger()); assert(state.bets.every(b => b.state === "settled" && b.pnl === -100 && b.level === 0), "only accepted settlement advances each completed round");
  await page.evaluate(() => { const o = window.__offline; for (let i = 1; i < 4; i++) o.stage.getChildAt(i).gameInfo.gameNo = `next-${i}`; }); await sleep(650);
  state = await page.evaluate(() => ({ sent: window.__offline.sent.filter(x=>x.cmd===6), ledger: window.__DG_SINGLEPAGE__.exportLedger() })); assert.equal(state.sent.length, 6, "new round progresses once per table"); assert(state.ledger.bets.slice(-3).every(b => b.amount === 100 && b.state === "submitted"), "three-table mode remains flat after losses");
  await page.evaluate(() => window.__DG_SINGLEPAGE__.stop()); const before = await page.evaluate(() => window.__offline.sent.filter(x=>x.cmd===6).length); await sleep(650);
  assert.equal(await page.evaluate(() => window.__offline.sent.filter(x=>x.cmd===6).length), before, "stop prevents duplicate/new sends");
  await page.evaluate(() => window.__DG_SINGLEPAGE__.dispose()); await browser.close(); console.log("PASS offline DG native reserve→cmd6→accepted→settled lifecycle (not a production-environment result)");
})().catch(async error => { await browser?.close(); console.error(error.stack || error); process.exitCode = 1; });
