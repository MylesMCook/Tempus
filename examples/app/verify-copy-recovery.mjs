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
  baseURL,
  runs: [],
  sourceHashes: Object.fromEntries(
    [
      "examples/app/verify-copy-recovery.mjs",
      "src/features/parser/components/date-picker.tsx",
      "src/features/parser/components/interval-result.tsx",
      "src/features/parser/components/occurrence-result.tsx",
    ].map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]),
  ),
  scope:
    "Injected clipboard denial followed by real write/read of task-created text; desktop Chrome, not physical devices or cross-application paste. Tab navigation begins at the input.",
};
try {
  for (const width of [320, 1280]) {
    for (const [kind, inputText, buttonName, success, fragments] of [
      [
        "point",
        "Call Sam tomorrow at noon",
        "Copy date",
        "Date copied",
        ["Call Sam", "Sunday, September 13, 2026", "12:00 PM", "America/Chicago"],
      ],
      [
        "interval",
        "Call Sam tomorrow at noon for 30 minutes",
        "Copy date range",
        "Date range copied",
        ["Call Sam", "Start:", "End (exclusive):", "12:00 PM", "12:30 PM", "America/Chicago"],
      ],
      [
        "schedule",
        "Call Sam every Monday at noon for 3 occurrences",
        "Copy schedule preview",
        "Schedule preview copied",
        [
          "Call Sam",
          "Upcoming occurrence preview:",
          "Sep 14, 2026",
          "Sep 21, 2026",
          "Sep 28, 2026",
          "America/Chicago",
        ],
      ],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height: 950 },
        timezoneId: "America/Chicago",
        permissions: ["clipboard-read", "clipboard-write"],
      });
      const page = await context.newPage();
      const run = { kind, width, status: "running", errors: [] };
      report.runs.push(run);
      page.on("pageerror", (error) => run.errors.push(String(error)));
      try {
        await page.clock.install({ time: new Date("2026-09-12T16:00:00Z") });
        await page.goto(baseURL);
        await page.evaluate(() => {
          const original = navigator.clipboard.writeText.bind(navigator.clipboard);
          window.__denyCopy = true;
          navigator.clipboard.writeText = (text) =>
            window.__denyCopy
              ? Promise.reject(new DOMException("Injected denial", "NotAllowedError"))
              : original(text);
        });
        const input = page.locator("#date-expression");
        await input.fill(inputText);
        await page.locator("#calculated-date").waitFor();
        const before = await page.locator("#calculated-date").innerText();
        const button = page.getByRole("button", { name: buttonName, exact: true });
        await input.focus();
        let tabs = 0;
        while (!(await button.evaluate((element) => document.activeElement === element))) {
          assert.ok(tabs++ < 50, "Copy control not reachable by Tab");
          await page.keyboard.press("Tab");
        }
        run.tabs = tabs;
        await page.keyboard.press("Enter");
        await page.getByText(/Copy was blocked\./).waitFor();
        assert.equal(await input.inputValue(), inputText);
        assert.ok(!(await page.locator("#calculated-date").innerText()).includes(success));
        assert.equal(await button.isEnabled(), true);
        await page.evaluate(() => {
          window.__denyCopy = false;
        });
        await page.keyboard.press("Enter");
        await page.getByText(success, { exact: true }).waitFor();
        // Read only after the app successfully writes this task's own generated value.
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        for (const fragment of fragments)
          assert.ok(copied.includes(fragment), `${String(kind)}: missing ${fragment}: ${copied}`);
        run.copied = copied;
        assert.equal(await input.inputValue(), inputText);
        await input.fill(inputText.replace("Sam", "Jo"));
        await page.waitForFunction(() =>
          document.getElementById("calculated-date")?.textContent.includes("Jo"),
        );
        assert.ok(!(await page.locator("#calculated-date").innerText()).includes(success));
        assert.equal(
          await page.getByRole("button", { name: buttonName, exact: true }).isEnabled(),
          true,
        );
        await input.fill("invalid text");
        await page.locator("#calculation-error").waitFor();
        assert.equal(await page.getByRole("button", { name: buttonName, exact: true }).count(), 0);
        assert.deepEqual(run.errors, []);
        run.initialResult = before;
        run.status = "passed";
      } catch (error) {
        run.status = "failed";
        run.error = String(error);
        throw error;
      } finally {
        await context.close();
      }
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
