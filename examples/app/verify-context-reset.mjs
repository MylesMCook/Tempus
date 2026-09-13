import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
const [playwrightArg, outputArg] = process.argv.slice(2);
assert.ok(
  playwrightArg && outputArg && process.argv.length === 4,
  "Usage: node verify-context-reset.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const output = resolve(outputArg);
const base = new URL(process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174");
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Use a local app");
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(playwrightArg)).href);
const browser = await chromium.launch({ channel: "chrome" });
const sourceHashes = Object.fromEntries(
  [
    "examples/app/verify-context-reset.mjs",
    "src/routes/home-page.tsx",
    "src/features/parser/components/date-picker.tsx",
    "src/features/parser/components/calendar-export.tsx",
  ].map((name) => [
    name,
    createHash("sha256")
      .update(readFileSync(new URL(`../../${name}`, import.meta.url)))
      .digest("hex"),
  ]),
);
const report = {
  scenario: "context-utc",
  status: "running",
  browser: browser.version(),
  sourceHashes,
  runs: [],
  scope:
    "Desktop context-edit recovery with direct focus/Enter. Downloads the corrected UTC file; no calendar write, physical device or screen-reader claim.",
};
try {
  for (const width of [320, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      timezoneId: "America/Chicago",
    });
    const run = { width, status: "running" };
    report.runs.push(run);
    try {
      const page = await context.newPage();
      await page.clock.install({ time: new Date("2026-09-12T16:00:00Z") });
      await page.goto(base.href);
      const input = page.locator("#date-expression");
      const expression = "Call Sam September 30 and October 2 and 4 at noon";
      await input.fill(expression);
      const activate = async (locator) => {
        await locator.focus();
        await page.keyboard.press("Enter");
      };
      const resolveChoices = async () => {
        for (const label of ["October 4", "2026", "At noon", "At noon"]) {
          await activate(page.getByRole("button", { name: label, exact: true }));
          await page.waitForFunction(() =>
            ["calculated-date", "calculation-error"].includes(document.activeElement?.id ?? ""),
          );
        }
        await page.locator("#calculated-date").waitFor();
      };
      const unresolved = async () => {
        await page.locator("#calculation-error").waitFor();
        assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
        assert.equal(await input.inputValue(), expression);
      };
      await resolveChoices();
      await activate(page.locator("#calendar-export-toggle"));
      await page.locator("#calendar-title").fill("Old reviewed title");
      await activate(page.getByText("Change timezone or format", { exact: true }));
      const timezone = page.locator("#calculation-timezone");
      await timezone.fill("UTC");
      await unresolved();
      await resolveChoices();
      const summary = await page.locator("#calculated-date").innerText();
      assert.ok(summary.includes("UTC"), summary);
      await activate(page.locator("#calendar-export-toggle"));
      assert.equal(await page.locator("#calendar-title").inputValue(), "Call Sam");
      const waiting = page.waitForEvent("download");
      await activate(page.getByRole("button", { name: "Download calendar file", exact: true }));
      const download = await waiting;
      const filename = `year-${width}.ics`;
      await download.saveAs(join(output, filename));
      assert.equal(await download.failure(), null);
      const bytes = readFileSync(join(output, filename));
      const file = bytes.toString("utf8");
      assert.equal((file.match(/BEGIN:VEVENT/g) ?? []).length, 3);
      for (const date of ["20260930", "20261002", "20261004"])
        assert.ok(file.includes(`DTSTART:${date}T120000Z`));
      Object.assign(run, {
        file: filename,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      });

      await timezone.fill("Invalid/Timezone");
      await unresolved();
      await timezone.fill("America/Chicago");
      await resolveChoices();
      await page.clock.setFixedTime(new Date("2026-09-13T16:00:00Z"));
      await activate(page.getByRole("button", { name: "Refresh now", exact: true }));
      await unresolved();
      await page.getByRole("button", { name: "October 4", exact: true }).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      run.status = "passed";
    } catch (error) {
      run.status = "failed";
      run.error = String(error);
    } finally {
      await context.close();
    }
  }
  report.status = report.runs.every((run) => run.status === "passed") ? "passed" : "failed";
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
if (report.status !== "passed") process.exitCode = 1;
console.log(JSON.stringify(report));
