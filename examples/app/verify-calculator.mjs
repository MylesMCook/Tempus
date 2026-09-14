import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(
  playwrightPath && destination && process.argv.length === 4,
  "Usage: node verify-calculator.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const output = resolve(destination);
mkdirSync(output); // Preserve earlier runs.
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  runs: [],
  scope:
    "Local main-app calculator, real clipboard readback of values just copied, strict API replay. Desktop widths, not physical devices or cross-application paste. Keyboard activation uses focus/Enter, not full Tab traversal.",
};
try {
  for (const width of [320, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      timezoneId: "America/Chicago",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-09-12T16:00:00Z") });
    await page.goto("http://127.0.0.1:5174");
    const input = page.locator("#date-expression");
    for (const [expression, iso, visible, clock, steps] of [
      [
        "2026-01-31 plus 1 month minus 1 day",
        "2026-02-27T06:00:00.000Z",
        "Friday, February 27, 2026",
        "Date only · no time specified",
        ["2026-02-28T06:00:00.000Z", "2026-02-27T06:00:00.000Z"],
      ],
      [
        "2026-01-31 minus 1 day plus 1 month",
        "2026-02-28T06:00:00.000Z",
        "Saturday, February 28, 2026",
        "Date only · no time specified",
        ["2026-01-30T06:00:00.000Z", "2026-02-28T06:00:00.000Z"],
      ],
      [
        "2026-09-12 at noon plus 0.5 seconds",
        "2026-09-12T17:00:00.500Z",
        "Saturday, September 12, 2026",
        "12:00:00.500 PM",
        ["2026-09-12T17:00:00.500Z"],
      ],
    ]) {
      await input.fill(expression);
      const copy = page.getByRole("button", { name: "Copy result", exact: true });
      await copy.waitFor();
      const shown = await page.locator("#calculated-date").innerText();
      assert.ok(shown.includes(visible) && shown.includes(clock), shown);
      await copy.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: "Result copied", exact: true }).waitFor();
      // Never inspect pre-existing clipboard content; read only after our successful write.
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      assert.ok(
        copied.includes(visible) && copied.includes(clock) && copied.includes("America/Chicago"),
      );
      const developer = page.getByText("Developer tools", { exact: true });
      const details = page.locator("details").filter({ has: developer });
      if (!(await details.evaluate((el) => el.open))) {
        await developer.focus();
        await page.keyboard.press("Enter");
      }
      const replay = page.getByRole("button", { name: "Check API result", exact: true });
      const responsePromise = page.waitForResponse(
        (res) => new URL(res.url()).pathname === "/api/parse",
      );
      await replay.focus();
      await page.keyboard.press("Enter");
      const response = await responsePromise;
      const api = await response.json();
      assert.equal(response.status(), 200);
      assert.equal(api.engineVersion, 2);
      assert.equal(api.result.iso, iso);
      assert.deepEqual(
        api.steps.map((step) => step.after.iso),
        steps,
      );
      const traceSummary = page.getByText("Show calculation steps", { exact: true });
      if (!(await traceSummary.locator("..").evaluate((el) => el.open))) {
        await traceSummary.focus();
        await page.keyboard.press("Enter");
      }
      const trace = await page
        .getByRole("list", { name: "Calculation steps", exact: true })
        .innerText();
      for (const step of api.steps) {
        assert.ok(trace.includes(step.source));
        for (const endpoint of [step.before, step.after])
          assert.ok(
            trace.includes(
              endpoint.local.replace("T", " ").replace(/\.000$/, "") + " " + endpoint.offset,
            ),
          );
      }
      assert.equal(await input.inputValue(), expression);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await input.fill("February 30, 2026");
      await page.locator("#calculation-error").waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Result copied", exact: true }).count(),
        0,
      );
      assert.equal(await page.getByRole("button", { name: "Copy result", exact: true }).count(), 0);
      report.runs.push({ width, expression, iso, copied, steps, status: "passed" });
    }
    await context.close();
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(
  JSON.stringify({ status: report.status, runs: report.runs.length, error: report.error }),
);
