#!/usr/bin/env node
/*
 * Offline-only Android/mobile site regression.
 *
 * This test routes every request made by Chromium.  It exercises the original
 * access -> TZ -> DGLI -> same-origin foreground pipeline with anonymous fake
 * responses only; it never contacts TZ, DG, or a real device.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const mobileBuilders = require("../tests/fixtures/dg-mobile-v329-builders.cjs");

let playwright;
try { playwright = require("playwright"); }
catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }

const ROOT = path.resolve(__dirname, "..");
const APP_ORIGIN = "http://127.0.0.1:8082";
const WAP_INDEX = "/ddnewwap/V3.2.9/index.html";
const WAP_BUNDLE = "/ddnewwap/V3.2.9/js/bundle.js";
const SCREENSHOT = "/home/ubuntu/dg-mobile-v329-evidence/mobile-site.png";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const NATIVE_TOKEN = "offline-mobile-native-token-never-export";
const NATIVE_SECRET = "offline-mobile-secret-never-export";

function trpcPayload(name, data) {
  return { result: { data: { json: data } } };
}

function fakeMobileBundle() {
  // The methods remain verbatim class methods.  The production source gate uses
  // Function#toString fingerprints and must reject lookalikes/wrappers.
  return `
(() => {
  "use strict";
  const methods = ${JSON.stringify(mobileBuilders)};
  const sent = [], listeners = new Map(), nativeEvents = [];
  const socket = {
    socket: { connected: true },
    on(name, owner, handler) {
      if (typeof owner === "function" && handler === undefined) handler = owner;
      if (typeof handler !== "function") throw new TypeError("offline listener must be a function");
      const list = listeners.get(name) || [];
      list.push({ owner, handler }); listeners.set(name, list);
    },
    off(name, owner, handler) {
      if (typeof owner === "function" && handler === undefined) handler = owner;
      listeners.set(name, (listeners.get(name) || []).filter((x) => x.owner !== owner || x.handler !== handler));
    },
    sendData(message) { sent.push(message); return true; }
  };
  const playerInfo = {
    socketMan: socket,
    limitInfo: { 100: 1 },
    playerName: "offline-mobile-player",
    token: ${JSON.stringify(NATIVE_TOKEN)},
    secretkey: ${JSON.stringify(NATIVE_SECRET)},
    layoutType: "Hot",
    balance: 22626.6
  };
  const m = { MultiBaccaratType: ["Banker", "Player"] };
  const r = { BET_CHIP: "BET_CHIP" };
  // Both factory helpers return anonymous JSON only.  Nothing here encrypts,
  // transmits, or exposes a real credential.
  const g = {
    getVerifyInfo() { return JSON.stringify({ fixture: "anonymous" }); },
    getBetEncryptInfo(_secret, payload) {
      return JSON.stringify({ fixture: "anonymous", payload: typeof payload === "string" ? "json" : "unknown" });
    }
  };
  const md5 = () => JSON.stringify({ fixture: "anonymous" });
  const parentOf = (child, parent) => { child.parent = parent; return child; };
  function card(index) {
    const source = index % 2 ? methods.Ki : methods.ei;
    const NativeCard = Function("m", "g", "r", "md5", "return class NativeCard { " + source + " }")(m, g, r, md5);
    const value = new NativeCard();
    value.tableId = String(70101 + index);
    value.limitId = 1;
    value.playerInfo = playerInfo;
    value.visible = true;
    value.gameInfo = {
      stateId: 1, countDown: 30, starTime: Date.now(), shoeId: 9,
      playId: 40 + index, gameNo: "offline-mobile-" + index, gameId: 100,
      tableName: "RB" + String(index + 1).padStart(2, "0"), goodRoadType: 1,
      roadArray: [{road:[1]}, {road:[5]}, {road:[1]}, {road:[5]}]
    };
    value.baccaratLimit = { bpMin: 100, bpMax: 100000 };
    value.betBtn = {
      Banker: { visible: true, mouseEnabled: true, hideHover() {} },
      Player: { visible: true, mouseEnabled: true, hideHover() {} }
    };
    // Mobile V3.2.9 shape: manager buttons, no desktop card.betFlag/betMan.
    value.betBtnMan = { betFlag: true, visible: false, confirmBtn: { event() {} }, cancelBtn: { event() {} } };
    value.betMoneyTmp = { Banker: 0, Player: 0 };
    value.betMoneyTrue = { Banker: 0, Player: 0 };
    value.event = (event, packet) => { nativeEvents.push({ event, cmd: packet && packet.cmd }); }; // intentionally no send
    return value;
  }
  const lobby = { viewName: "Lobby", visible: true, playerInfo, numChildren: 0, getChildAt(index) { return this._children[index] || null; }, _children: [] };
  const gameCacheMC = { visible: true, parent: null };
  const menu = { visible: true, playerInfo, gameCacheMC, gameArray: [], parent: lobby };
  gameCacheMC.parent = menu;
  const button = {
    buttonName: "Mulit", gameType: 100, visible: true, mouseEnabled: true, parent: gameCacheMC,
    event(kind) {
      if (kind !== "click") throw new Error("expected native Laya click");
      window.__MULTI_NAV_COUNT__ = (window.__MULTI_NAV_COUNT__ || 0) + 1;
      if (lobby.currentLobby && lobby.currentLobby.viewName === "Multi") return;
      const multi = { viewName: "Multi", visible: true, parent: lobby, numChildren: 0, getChildAt(index) { return this._children[index] || null; }, _children: [] };
      multi._children = Array.from({ length: 8 }, (_, index) => parentOf(card(index), multi));
      multi.numChildren = multi._children.length;
      lobby.currentLobby = multi;
      lobby._children = [menu, multi]; lobby.numChildren = lobby._children.length;
    }
  };
  menu.gameArray = [button];
  lobby.selectGameMenu = menu;
  lobby._children = [menu]; lobby.numChildren = lobby._children.length;
  const stage = { visible: true, numChildren: 1, getChildAt(index) { return index === 0 ? lobby : null; }, _children: [lobby] };
  window.Laya = { Event: { CLICK: "click" }, Browser: { now: () => Date.now() }, stage };
  window.__offlineMobile = { sent, listeners, nativeEvents, socket, playerInfo, lobby, emit(name, message) { for (const x of [...(listeners.get(name) || [])]) x.handler(message); } };
})();`;
}

function fakeMobileIndex() {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="${WAP_BUNDLE}"></script></head><body style="margin:0;background:#050708;color:#d8e5df;font:14px sans-serif">Offline DG mobile V3.2.9 fixture</body></html>`;
}

function assertDgliMobileBody(raw) {
  // lib/legacy-platform-screen.tsx:getGameLoginUrlFromPlatform sends the
  // selected device profile as JSON body.device and body.game_device.  Keep a
  // textual Mobile fallback for a legacy/minified request body that lacks keys.
  let parsed = null;
  try { parsed = JSON.parse(raw || ""); } catch {}
  const profile = parsed && (parsed.device ?? parsed.game_device ?? parsed.profile);
  if (profile !== undefined) {
    assert.equal(profile, "Mobile", "DGLI original authorization must request the Mobile profile");
    assert.equal(parsed.game_device, "Mobile", "DGLI original authorization must preserve game_device=Mobile");
  } else {
    assert.match(String(raw), /Mobile/, "DGLI original authorization request text must contain Mobile");
  }
}

(async () => {
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: process.env.DG_TEST_CHROME || "/usr/bin/chromium",
    args: ["--no-sandbox"]
  });
  const context = await browser.newContext({
    userAgent: ANDROID_UA,
    isMobile: true,
    hasTouch: true,
    viewport: { width: 440, height: 894 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const errors = [], externalRoutes = [], continuedExternal = [];
  const requests = [];
  let dgAuthorizationBody = null;
  let loginInputObservation = null;
  page.on("pageerror", (error) => errors.push(error.message));

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const local = url.origin === APP_ORIGIN;
    if (!local) externalRoutes.push(`${request.method()} ${url.origin}${url.pathname}`);

    if (local && url.pathname.startsWith("/api/trpc/")) {
      const names = decodeURIComponent(url.pathname.slice("/api/trpc/".length)).split(",");
      const payloads = names.map((name) => {
        const data = name === "trackerAccess.resolvePlatform" ? { found: true, platform: "TZ" }
          : name === "trackerAccess.login" ? { success: true, sessionId: "offline-mobile-session" }
          : name === "trackerAccess.checkSession" ? { valid: true, reason: "offline" }
          : name === "trackerAccess.logout" ? { success: true }
          : null;
        assert.notEqual(data, null, `unexpected trackerAccess procedure: ${name}`);
        requests.push(`trpc:${name}`);
        return trpcPayload(name, data);
      });
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(url.searchParams.get("batch") ? payloads : payloads[0]) });
    }

    if (url.hostname === "www.tz6868.cc") {
      if (request.method() === "OPTIONS") {
        return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" } });
      }
      if (url.pathname === "/api/v1/login") {
        requests.push("tz-login");
        return route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ code: 200, data: { token: "offline-platform-token" } }) });
      }
      if (url.pathname === "/api/v2/game/DGLI/login") {
        dgAuthorizationBody = request.postData() || "";
        assertDgliMobileBody(dgAuthorizationBody);
        requests.push("dgli-login");
        return route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ code: 200, data: { url: "https://dg-offline.example/ddnewwap/V3.2.9/index.html?token=offline-mobile" } }) });
      }
      throw new Error(`unexpected TZ route: ${request.method()} ${url.pathname}`);
    }

    if (local && url.pathname === "/api/dg/proxy/enter") {
      requests.push("dg-proxy-enter");
      assert.equal(request.method(), "POST", "DG foreground route must be POST");
      return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, url: `${WAP_INDEX}?token=offline-mobile` }) });
    }
    if (local && url.pathname === WAP_INDEX) return route.fulfill({ contentType: "text/html", body: fakeMobileIndex() });
    if (local && url.pathname === WAP_BUNDLE) return route.fulfill({ contentType: "application/javascript", body: fakeMobileBundle() });

    if (!local) {
      // Every non-local route is intercepted and aborted: no platform connection
      // is possible even if an unrelated page asset asks for one.
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });

  try {
    await page.goto(`${APP_ORIGIN}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1800);
    await page.getByTestId("autobac-access-title").waitFor({ timeout: 30000 });
    assert.match(await page.evaluate(() => navigator.userAgent), /Android.*Mobile/i, "real Android Mobile UA is active");
    assert.deepEqual(await page.evaluate(() => ({ width: innerWidth, height: innerHeight })), { width: 440, height: 894 }, "mobile viewport is 440x894");

    // Match the established login-only test: normal keyboard events followed by
    // a Tab blur.  Never inject state, access React fibers, or call handlers.
    const username = page.getByPlaceholder("輸入 TZ 帳號", { exact: true });
    const password = page.getByPlaceholder("輸入密碼", { exact: true });
    await username.pressSequentially("offline-mobile-user", { delay: 30 });
    await password.pressSequentially("offline-mobile-password", { delay: 30 });
    await password.press("Tab");
    // This is read-only evidence for an isMobile/RN-Web incompatibility, should
    // the normal browser interaction fail before platform choice.
    loginInputObservation = await page.locator("input").evaluateAll((nodes) => ({
      inputs: nodes.map((node) => ({
        testId: node.getAttribute("data-testid"), value: node.value,
        directHandlers: ["onbeforeinput", "oninput", "onchange", "onblur", "onkeydown", "onkeyup"].filter((key) => typeof node[key] === "function"),
      })),
      rootDelegationKeys: Object.getOwnPropertyNames(document.getElementById("root") || {}).filter((key) => /react|listen/i.test(key)),
    }));
    // If the run cannot pass login on the current local server, retain a safe,
    // pre-DGLI screenshot of the ordinary mobile UI—not a platform screenshot.
    fs.mkdirSync(path.dirname(SCREENSHOT), { recursive: true });
    await page.screenshot({ path: SCREENSHOT, fullPage: true });
    await page.getByText("安全登入", { exact: true }).click();
    await page.getByTestId("choose-dg").waitFor({ timeout: 30000 });
    assert.equal(requests.includes("dgli-login"), false, "no DGLI authorization before the DG choice");

    await page.getByTestId("choose-dg").click();
    await page.waitForSelector('iframe[title="DG 真人遊戲"]', { timeout: 30000 });
    await page.waitForFunction(() => {
      const w = document.querySelector('iframe[title="DG 真人遊戲"]')?.contentWindow;
      return !!w?.__DG_SINGLEPAGE__ && w.__DG_SINGLEPAGE__.runtimeDiagnostics?.().candidateCount === 8;
    }, { timeout: 30000 });
    const frame = page.frame({ url: /\/ddnewwap\/V3\.2\.9\/index\.html/ });
    assert(frame, "same-origin real mobile WAP iframe was mounted");

    const mobileState = await frame.evaluate(() => {
      const agent = window.__DG_SINGLEPAGE__;
      const diagnostics = agent.runtimeDiagnostics();
      const mobile = agent.mobileDiagnostics();
      const scripts = agent.exportMobilePublicSources();
      const panel = document.querySelector("#__dg_singlepage_panel__")?.shadowRoot;
      return {
        running: agent.status().running,
        selected: agent.status().selected,
        runtime: diagnostics,
        mobile,
        scripts,
        navCount: window.__MULTI_NAV_COUNT__,
        sent: window.__offlineMobile.sent,
        nativeEvents: window.__offlineMobile.nativeEvents,
        noDesktopFields: window.__offlineMobile.lobby.currentLobby._children.every((card) => !Object.hasOwn(card, "betFlag") && !Object.hasOwn(card, "betMan")),
        mobileManager: window.__offlineMobile.lobby.currentLobby._children.every((card) => card.betBtnMan?.betFlag === true && typeof card.betBtnMan?.confirmBtn?.event === "function" && typeof card.betBtnMan?.cancelBtn?.event === "function"),
        wallet: panel?.getElementById("balance")?.textContent,
        strategyCount: panel?.getElementById("provider")?.options.length,
        strategyValues: Array.from(panel?.getElementById("provider")?.options || []).map((option) => option.value)
      };
    });

    assert.equal(requests.filter((name) => name === "dgli-login").length, 1, "exactly one original DGLI authorization");
    assert.equal(requests.filter((name) => name === "dg-proxy-enter").length, 1, "exactly one same-origin DG foreground entry");
    assert.notEqual(dgAuthorizationBody, null, "DGLI original authorization POST was observed");
    assert.equal(mobileState.navCount, 1, "mobile Mulit lobby control was clicked exactly once");
    assert.equal(mobileState.running, false, "full panel installs in stopped state; it never starts a native bet");
    assert.equal(mobileState.mobile.readiness, "compatible", "exact mobile V3.2.9 builder source passed the install gate");
    assert.equal(mobileState.mobile.cardCount, 8, "all eight native mobile cards were discovered");
    assert.equal(mobileState.mobile.rejectedCardCount, 0, "no native V3.2.9 builder was rejected");
    assert.equal(mobileState.runtime.candidateCount, 8, "runtime diagnostics reports eight complete cards");
    assert.equal(mobileState.runtime.walletSynced, true, "runtime diagnostics sees the offline wallet");
    assert(mobileState.runtime.candidates.every((card) => card.profile === "mobile-v329-shaped" && card.missing.length === 0), "all eight cards are complete mobile V3.2.9 shapes with no missing fields");
    assert.equal(mobileState.noDesktopFields, true, "fixture intentionally has no desktop betFlag/betMan fields");
    assert.equal(mobileState.mobileManager, true, "every mobile manager exposes enabled native confirm/cancel event controls");
    assert.equal(mobileState.sent.filter((packet) => Number(packet?.cmd) === 6).length, 0, "stopped installation sends no native cmd 6");
    assert.equal(mobileState.nativeEvents.length, 0, "the fixture card event path did not run during installation");
    assert.equal(Number(String(mobileState.wallet).replace(/,/g, "")), 22626.6, "panel displays the native wallet 22626.6");
    assert.equal(mobileState.strategyCount, 8, "all eight panel strategies are selectable");
    assert.equal(new Set(mobileState.strategyValues).size, 8, "the eight panel strategy choices are distinct");
    assert.equal(mobileState.scripts.status, "ready", "source export is read-only and ready");
    assert.deepEqual(mobileState.scripts.scripts.map((script) => new URL(script.url).pathname), [WAP_BUNDLE], "mobile source manifest exposes only the required V3.2.9 bundle path");

    await page.waitForTimeout(1250);
    const afterIdle = await frame.evaluate(() => ({ navCount: window.__MULTI_NAV_COUNT__, sent: window.__offlineMobile.sent.filter((packet) => Number(packet?.cmd) === 6).length }));
    assert.equal(afterIdle.navCount, 1, "later installer polling cannot click the mobile lobby twice");
    assert.equal(afterIdle.sent, 0, "idle panel remains unable to send cmd 6 without explicit user start/confirmation");

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("header-diagnostics").click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "AutoBac-DG-connection-diagnostic.json", "the header exports a connection diagnostic");
    const stream = await download.createReadStream();
    let diagnostic = "";
    for await (const chunk of stream) diagnostic += chunk;
    assert.match(diagnostic, /"platform":\s*"DG"/, "diagnostic identifies DG without exporting credentials");
    assert.match(diagnostic, /ddnewwap\/V3\.2\.9\/js\/bundle\.js/, "diagnostic includes only the public mobile bundle path");
    for (const forbidden of [NATIVE_TOKEN, NATIVE_SECRET, "offline-mobile"]) assert.equal(diagnostic.includes(forbidden), false, `diagnostic must not export ${forbidden}`);

    fs.mkdirSync(path.dirname(SCREENSHOT), { recursive: true });
    await page.screenshot({ path: SCREENSHOT, fullPage: true });
    assert.equal(continuedExternal.length, 0, "no external request may be continued");
    assert.deepEqual(errors, [], "offline Android flow has no browser runtime errors");
    console.log("PASS offline-only Android 440x894 mobile site: original access/DGLI Mobile authorization, same-origin V3.2.9 WAP foreground, single Mulit click, 8 complete source-gated native cards, stopped panel, wallet/8 strategies, credential-free diagnostics, and zero cmd 6 sends.");
  } catch (error) {
    const frameDebug = await page.evaluate(() => [...document.querySelectorAll("iframe")].map((iframe) => {
      try { return { src: iframe.getAttribute("src"), href: iframe.contentWindow?.location.href, navCount: iframe.contentWindow?.__MULTI_NAV_COUNT__, stage: !!iframe.contentWindow?.Laya?.stage, panel: !!iframe.contentWindow?.__DG_SINGLEPAGE__ }; }
      catch { return { src: iframe.getAttribute("src"), inaccessible: true }; }
    })).catch(() => []);
    console.error("Offline requests:", requests);
    console.error("External routes intercepted:", externalRoutes);
    console.error("Mobile login input observation:", loginInputObservation);
    console.error("Runtime errors:", errors);
    console.error("Frame debug:", frameDebug);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
