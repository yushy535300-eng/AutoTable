#!/usr/bin/env node
"use strict";
// Offline-only: every TZ request is fulfilled with anonymous data; no real login.
const assert = require("node:assert/strict");
const fs = require("node:fs");
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/tmp/dg-testdeps/node_modules/playwright"); }
const APP = "http://127.0.0.1:8082";
const OUT = process.env.AUTOBAC_SCREENSHOT_DIR || "/home/ubuntu/autobac-v325-choice-check";
fs.mkdirSync(OUT, { recursive: true });
const trpc = (data) => ({ result: { data: { json: data } } });

(async () => {
  const browser = await playwright.chromium.launch({ headless: true, executablePath: process.env.DG_TEST_CHROME || "/usr/bin/chromium", args: ["--no-sandbox"] });
  const results = [];
  for (const shot of [
    { name: "choice-mobile-390", viewport: { width: 390, height: 844 }, mobile: true },
    { name: "choice-mobile-320", viewport: { width: 320, height: 700 }, mobile: true },
    { name: "choice-desktop-1440", viewport: { width: 1440, height: 900 }, mobile: false },
  ]) {
    const context = await browser.newContext({ viewport: shot.viewport, isMobile: shot.mobile, hasTouch: shot.mobile, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === APP && url.pathname.startsWith("/api/trpc/")) {
        const names = decodeURIComponent(url.pathname.slice(10)).split(",");
        const payloads = names.map((name) => trpc(name.endsWith("resolvePlatform") ? { found: true, platform: "TZ" } : name.endsWith("login") ? { success: true, sessionId: "offline-choice" } : name.endsWith("checkSession") ? { valid: true } : { success: true }));
        return route.fulfill({ contentType: "application/json", body: JSON.stringify(url.searchParams.get("batch") ? payloads : payloads[0]) });
      }
      if (url.hostname === "www.tz6868.cc") {
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" } });
        return route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ code: 200, data: { token: "offline" } }) });
      }
      if (url.origin !== APP) return route.abort("blockedbyclient");
      return route.continue();
    });
    await page.goto(APP + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1800);
    await page.getByTestId("autobac-access-title").waitFor({ timeout: 30000 });
    await page.getByPlaceholder("輸入 TZ 帳號", { exact: true }).pressSequentially("offline-user", { delay: 20 });
    const password = page.getByPlaceholder("輸入密碼", { exact: true });
    await password.pressSequentially("offline-pass", { delay: 20 });
    await password.press("Tab");
    await page.getByText("安全登入", { exact: true }).click();
    await page.getByTestId("choose-dg").waitFor({ timeout: 30000 });
    await page.waitForTimeout(400);
    const boxes = await Promise.all(["choose-dg", "choose-mt"].map((id) => page.getByTestId(id).boundingBox()));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `${shot.name}: no horizontal overflow`);
    for (const box of boxes) assert(box && box.width >= 44 && box.height >= 44, `${shot.name}: card target >= 44px`);
    if (shot.name === "choice-mobile-390") assert(boxes.every((box) => box.y + box.height <= shot.viewport.height), "390x844: both cards fully visible");
    if (!shot.mobile) assert(Math.abs(boxes[0].y - boxes[1].y) < 1, "desktop: two cards in one row");
    await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: true });
    assert.deepEqual(errors, [], `${shot.name}: no runtime errors`);
    results.push({ name: shot.name, cards: boxes.map((b) => ({ y: Math.round(b.y), h: Math.round(b.height), w: Math.round(b.width) })) });
    await context.close();
  }
  await browser.close();
  console.log("PASS choice page", JSON.stringify(results));
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
