import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const [playwrightPath, destination, scenario] = process.argv.slice(2);
assert.ok(
  playwrightPath &&
    destination &&
    (scenario === undefined || scenario === "--omitted-month") &&
    process.argv.length <= 5,
  "Usage: node verify-reminder.mjs PLAYWRIGHT-ENTRY NEW-output-directory [--omitted-month]",
);
const omittedMonth = scenario === "--omitted-month";
const expression = omittedMonth
  ? "Call Sam September 30 and October 2 and 4 at noon"
  : "Call Sam December 31 and January 1, 2027 at noon";
const editedExpression = omittedMonth
  ? expression.replace("4 at", "5 at")
  : expression.replace("January 1", "January 2");
const choiceLabels = omittedMonth
  ? ["October 4", "2026", "At noon", "At noon"]
  : ["2026", "At noon"];
const firstChoiceAfterEdit = omittedMonth ? "October 5" : "2026";
const expectedStarts = omittedMonth
  ? ["20260930T170000Z", "20261002T170000Z", "20261004T170000Z"]
  : ["20261231T180000Z", "20270101T180000Z"];
const output = resolve(destination);
mkdirSync(output); // Existing evidence must not be overwritten.
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const root = fileURLToPath(new URL("../../", import.meta.url));
const sourceHashes = Object.fromEntries(
  [
    "examples/app/verify-reminder.mjs",
    ...readdirSync(join(root, "src"), { recursive: true })
      .filter((name) => /\.(ts|tsx)$/.test(name))
      .map((name) => `src/${name}`),
  ]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((name) => [
      name,
      createHash("sha256")
        .update(readFileSync(join(root, name)))
        .digest("hex"),
    ]),
);
const report = {
  sourceHashes,
  scenario: omittedMonth ? "omitted-month" : "item-year",
  status: "running",
  browser: browser.version(),
  runs: [],
  scope:
    "Main-app reminder correction/download/edit at desktop widths. Direct focus/Enter, not full Tab traversal, physical devices or calendar-client import.",
};
try {
  for (const width of [320, 1280]) {
    const run = { width, status: "running" };
    report.runs.push(run);
    let context;
    try {
      context = await browser.newContext({
        viewport: { width, height: 950 },
        timezoneId: "America/Chicago",
        acceptDownloads: true,
      });
      const page = await context.newPage();
      await page.clock.install({ time: new Date("2026-09-12T16:00:00Z") });
      await page.goto("http://127.0.0.1:5174");
      const input = page.locator("#date-expression");
      await input.fill(expression);
      for (const label of choiceLabels) {
        const choice = page.getByRole("button", { name: label, exact: true });
        await choice.waitFor();
        await choice.focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() =>
          ["calculated-date", "calculation-error"].includes(document.activeElement?.id ?? ""),
        );
      }
      await page.locator("#calendar-export-toggle").waitFor();
      assert.equal(await input.inputValue(), expression);
      await page.locator("#calendar-export-toggle").focus();
      await page.keyboard.press("Enter");
      const download = page.getByRole("button", { name: "Download calendar file", exact: true });
      await download.waitFor();
      assert.equal(await download.isDisabled(), false);
      const waiting = page.waitForEvent("download");
      await download.focus();
      await page.keyboard.press("Enter");
      const file = await waiting;
      const path = join(output, `year-${width}.ics`);
      await file.saveAs(path);
      assert.equal(await file.failure(), null);
      const text = readFileSync(path, "utf8");
      assert.equal((text.match(/BEGIN:VEVENT/g) || []).length, expectedStarts.length);
      assert.ok(expectedStarts.every((start) => text.includes(start)));
      const details = page.getByText(/^Interpretation choices/);
      await details.focus();
      await page.keyboard.press("Enter");
      assert.ok(
        (await page.locator("body").innerText()).includes(
          omittedMonth ? "Date 3: October 4" : "Date 1: 2026",
        ),
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await page.screenshot({ path: join(output, `year-${width}.png`), fullPage: true });
      await input.fill(editedExpression);
      await page.getByRole("button", { name: firstChoiceAfterEdit, exact: true }).waitFor();
      assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
      Object.assign(run, {
        status: "passed",
        file: `year-${width}.ics`,
        sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
      });
    } catch (error) {
      run.status = "failed";
      run.error = String(error);
    } finally {
      await context?.close();
    }
  }
  report.status = report.runs.every((run) => run.status === "passed") ? "passed" : "failed";
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}

if (report.status !== "passed") process.exitCode = 1;
console.log(JSON.stringify({ status: report.status, runs: report.runs }));
