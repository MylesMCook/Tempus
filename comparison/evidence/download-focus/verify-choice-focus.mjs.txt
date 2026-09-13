import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [playwrightArg, outputArg] = process.argv.slice(2);
assert.ok(playwrightArg && outputArg && process.argv.length === 4);
const baseURL = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
assert.match(baseURL, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
const { chromium } = await import(pathToFileURL(resolve(playwrightArg)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  baseURL,
  rows: [],
  sourceHashes: Object.fromEntries(
    [
      "src/features/parser/components/date-picker.tsx",
      "src/routes/home-page.tsx",
      "examples/app/verify-choice-focus.mjs",
    ].map((p) => [p, createHash("sha256").update(readFileSync(p)).digest("hex")]),
  ),
  scope: "Controlled delayed animation frames in desktop Chrome; not physical-device evidence.",
};
try {
  for (const width of [320, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } });
    await page.goto(baseURL);
    await page.locator("#date-expression").fill("03/04/2027 at noon");
    await page.evaluate(() => {
      window.__frames = [];
      window.requestAnimationFrame = (callback) => {
        window.__frames.push(callback);
        return window.__frames.length;
      };
    });
    await page.getByRole("button", { name: /March 4, 2027/ }).focus();
    await page.keyboard.press("Enter");
    await page.locator("#calculated-date").waitFor();
    assert.equal(await page.evaluate(() => document.activeElement?.id), "calculated-date");
    await page.locator("#calendar-export-toggle").focus();
    const row = await page.evaluate(() => {
      const before = document.activeElement?.id;
      const pending = window.__frames.length;
      for (const callback of window.__frames.splice(0)) callback(performance.now());
      return { before, after: document.activeElement?.id, pending };
    });
    report.rows.push({ width, ...row });
    assert.equal(row.before, "calendar-export-toggle");
    assert.equal(row.after, "calendar-export-toggle");
    await page.close();
  }
  report.status = "passed";
} finally {
  await browser.close();
  writeFileSync(resolve(outputArg), JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
}
console.log(JSON.stringify(report));
