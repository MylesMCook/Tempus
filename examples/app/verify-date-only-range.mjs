import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
const [playwrightArg, outputArg] = process.argv.slice(2);
assert.ok(
  playwrightArg && outputArg && process.argv.length === 4,
  "Usage: node verify-date-only-range.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const output = resolve(outputArg);
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(playwrightArg)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  sourceHashes: Object.fromEntries(
    [
      "src/shared/interpret-interval.ts",
      "src/shared/interpret-date.ts",
      "src/shared/clarify-numeric-date.ts",
      "examples/app/verify-date-only-range.mjs",
    ].map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]),
  ),
  runs: [],
  scope:
    "Desktop direct focus/Enter and actual downloads, not full Tab traversal, devices or calendar import.",
};
try {
  for (const width of [320, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      timezoneId: "America/Chicago",
    });
    try {
      const page = await context.newPage();
      await page.clock.install({ time: new Date("2026-09-12T16:00:00Z") });
      await page.goto("http://127.0.0.1:5174");
      const input = page.locator("#date-expression");
      const activate = async (locator) => {
        await locator.focus();
        await page.keyboard.press("Enter");
      };
      for (const [
        id,
        expression,
        choices,
        expected,
      ] of /** @type {Array<[string, string, string[], string[]]>} */ ([
        [
          "exclusive",
          "Time off from 2026-09-13 to 2026-09-18",
          ["Use “Time off”", "End before 2026-09-18 begins"],
          ["20260913", "20260918"],
        ],
        [
          "inclusive",
          "Time off from 2026-09-13 to 2026-09-18",
          ["Use “Time off”", "Include all of 2026-09-18"],
          ["20260913", "20260919"],
        ],
      ])) {
        const run = { width, id, status: "running" };
        report.runs.push(run);
        try {
          await input.fill("");
          await input.fill(expression);
          for (const label of choices) {
            assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
            await activate(page.getByRole("button", { name: label, exact: true }));
            await page.waitForFunction(() =>
              ["calculated-date", "calculation-error"].includes(document.activeElement?.id ?? ""),
            );
          }
          await page.locator("#calculated-date").waitFor();
          assert.ok((await page.locator("#calculated-date").innerText()).includes("Time off"));
          await activate(page.locator("#calendar-export-toggle"));
          await page.waitForFunction(() =>
            [...document.querySelectorAll("button")].some(
              (button) =>
                button.textContent?.trim() === "Download calendar file" && !button.disabled,
            ),
          );
          const [download] = await Promise.all([
            page.waitForEvent("download"),
            activate(page.getByRole("button", { name: "Download calendar file", exact: true })),
          ]);
          const file = `${id}-${width}.ics`;
          await download.saveAs(join(output, file));
          assert.equal(await download.failure(), null);
          const bytes = readFileSync(join(output, file));
          const text = bytes.toString();
          assert.equal((text.match(/BEGIN:VEVENT/g) ?? []).length, 1);
          assert.ok(
            text.includes(`DTSTART;VALUE=DATE:${expected[0]}`) &&
              text.includes(`DTEND;VALUE=DATE:${expected[1]}`),
          );
          assert.equal(await input.inputValue(), expression);
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
          );
          await input.fill(expression.replace("09-18", "09-20"));
          await page.locator("#calculation-error").waitFor();
          assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
          Object.assign(run, {
            status: "passed",
            file,
            sha256: createHash("sha256").update(bytes).digest("hex"),
          });
        } catch (error) {
          run.status = "failed";
          run.error = String(error);
        }
      }
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
