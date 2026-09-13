import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
const [playwrightArg, outputArg] = process.argv.slice(2);
assert.ok(playwrightArg && outputArg && process.argv.length === 4);
const baseURL = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
assert.match(baseURL, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
const output = resolve(outputArg);
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(playwrightArg)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  runs: [],
  sourceHashes: Object.fromEntries(
    [
      "src/features/parser/components/calendar-export.tsx",
      "examples/app/verify-large-export.mjs",
    ].map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]),
  ),
  scope:
    "Desktop development app, direct focus/Enter, real downloads, Chrome long-task observations; not physical phone, independent users or client import. Reference uses actual app clock.",
};
try {
  for (const width of [320, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 950 },
      timezoneId: "America/Chicago",
    });
    const run = { width, status: "running", errors: [] };
    report.runs.push(run);
    page.on("pageerror", (error) => run.errors.push(error.message));
    try {
      await page.goto(baseURL);
      const input = page.locator("#date-expression");
      const activate = async (locator) => {
        await locator.focus();
        await page.keyboard.press("Enter");
      };
      const expression = "Call Sam every day at noon for 30 minutes for 1000 occurrences";
      await input.fill(expression);
      await page.locator("#calculated-date").waitFor();
      await page.evaluate(() => {
        globalThis.exportLongTasks = [];
        new PerformanceObserver((list) =>
          globalThis.exportLongTasks.push(
            ...list
              .getEntries()
              .map((entry) => ({ start: entry.startTime, duration: entry.duration })),
          ),
        ).observe({ type: "longtask" });
      });
      const start = performance.now();
      await activate(page.locator("#calendar-export-toggle"));
      await page.waitForFunction(() =>
        document.querySelector("#calendar-export-status")?.textContent.includes("1000 occurrences"),
      );
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      run.openThroughPaintMs = performance.now() - start;
      run.openLongTasks = await page.evaluate(() => globalThis.exportLongTasks);
      const list = page.getByRole("list", { name: "Events in this file", exact: true });
      const observed = [];
      for (let index = 0; index < 100; index++) {
        assert.equal(await list.locator("li").count(), 10);
        const labels = await list.locator("li > p:first-child").allTextContents();
        assert.deepEqual(
          labels,
          Array.from({ length: 10 }, (_, offset) => `Event ${index * 10 + offset + 1}`),
        );
        observed.push(...labels);
        if (index < 99)
          await activate(page.getByRole("button", { name: "Next events", exact: true }));
      }
      assert.equal(new Set(observed).size, 1000);
      assert.equal(
        await page.getByRole("button", { name: "Next events", exact: true }).isDisabled(),
        true,
      );
      assert.equal(await input.inputValue(), expression);
      assert.equal(await page.locator("#calendar-title").inputValue(), "Call Sam");
      run.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(run.overflow, false);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        activate(page.getByRole("button", { name: "Download calendar file", exact: true })),
      ]);
      const filename = `large-${width}.ics`;
      await download.saveAs(join(output, filename));
      run.file = {
        filename,
        sha256: createHash("sha256")
          .update(readFileSync(join(output, filename)))
          .digest("hex"),
      };
      assert.equal(
        (readFileSync(join(output, filename), "utf8").match(/BEGIN:VEVENT/g) ?? []).length,
        1000,
      );
      await page.screenshot({ path: join(output, `last-page-${width}.png`) });
      await input.fill("");
      await input.fill("Call Sam every day at noon for 5 occurrences");
      await page.locator("#calculated-date").waitFor();
      await activate(page.locator("#calendar-export-toggle"));
      await page.waitForFunction(() =>
        document.querySelector("#calendar-export-status")?.textContent.includes("5 occurrences"),
      );
      assert.equal(await list.locator("li").count(), 5);
      assert.equal(await page.getByRole("navigation", { name: "Review file events" }).count(), 0);
      assert.ok((await list.innerText()).startsWith("Event 1"));
      assert.deepEqual(run.errors, []);
      run.reviewedEvents = observed.length;
      run.status = "passed";
    } catch (error) {
      run.status = "failed";
      run.error = String(error);
      throw error;
    } finally {
      await page.close();
    }
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  throw error;
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ status: report.status, runs: report.runs.length }));
