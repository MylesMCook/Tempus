import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
const [entry, directory] = process.argv.slice(2);
assert.ok(
  entry && directory && process.argv.length === 4,
  "Usage: node verify-excluded-clock.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const out = resolve(directory);
mkdirSync(out);
const { chromium } = await import(pathToFileURL(resolve(entry)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  runs: [],
  sourceHashes: {},
  scope:
    "Desktop Chrome direct focus/Enter, excluded-clock count clarification, download and edit invalidation. Not full keyboard traversal, physical devices or calendar-client imports.",
};
for (const file of [
  "src/shared/interpret-recurrence.ts",
  "src/shared/interpret-date.ts",
  "src/shared/clarify-numeric-date.ts",
  "src/shared/recurring-calendar-file.ts",
  "examples/app/verify-excluded-clock.mjs",
])
  report.sourceHashes[file] = createHash("sha256").update(readFileSync(file)).digest("hex");
try {
  for (const width of [320, 1280])
    for (const [id, reference, clock, date, offset, total] of [
      ["fold-earlier", "2026-11-01T07:00:00Z", "1:30am", "2026-11-01", "UTC-05:00", 3],
      ["fold-later", "2026-11-01T07:00:00Z", "1:30am", "2026-11-01", "UTC-06:00", 2],
      ["gap-earlier", "2026-03-08T08:00:00Z", "2:30am", "2026-03-08", "UTC-06:00", 3],
      ["gap-later", "2026-03-08T08:00:00Z", "2:30am", "2026-03-08", "UTC-05:00", 2],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height: 950 },
        timezoneId: "America/Chicago",
      });
      try {
        const page = await context.newPage();
        await page.clock.install({ time: new Date(reference) });
        await page.goto("http://127.0.0.1:5174");
        const text = `Call Sam every Sunday at ${clock} for 3 occurrences except ${date}`;
        const input = page.locator("#date-expression");
        await input.fill(text);
        const activate = async (locator) => {
          await locator.focus();
          await page.keyboard.press("Enter");
        };
        assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
        await activate(page.getByRole("button", { name: /^Count excluded dates;/ }));
        await page.waitForFunction(() => document.activeElement?.id === "calculation-error");
        await page
          .getByText(`Excluded date ${date}: which clock determines its count slot?`, {
            exact: true,
          })
          .waitFor();
        assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
        await activate(page.getByRole("button", { name: new RegExp(offset) }));
        await page.waitForFunction(() => document.activeElement?.id === "calculated-date");
        assert.equal(await input.inputValue(), text);
        await activate(page.locator("#calendar-export-toggle"));
        await page
          .getByText(`${total} occurrences in the complete file.`, { exact: true })
          .waitFor();
        await page.waitForFunction(() =>
          Array.from(document.querySelectorAll("button")).some(
            (button) => button.textContent?.trim() === "Download calendar file" && !button.disabled,
          ),
        );
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          activate(page.getByRole("button", { name: "Download calendar file", exact: true })),
        ]);
        const file = `${id}-${width}.ics`;
        await download.saveAs(join(out, file));
        assert.equal(await download.failure(), null);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await input.fill(text.replace("3 occurrences", "4 occurrences"));
        await page.locator("#calculation-error").waitFor();
        assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
        report.runs.push({
          id,
          width,
          status: "passed",
          file,
          sha256: createHash("sha256")
            .update(readFileSync(join(out, file)))
            .digest("hex"),
        });
      } catch (error) {
        const page = context.pages()[0];
        if (page) {
          await page.screenshot({ path: join(out, `${id}-${width}-failure.png`) });
          writeFileSync(
            join(out, `${id}-${width}-failure.txt`),
            await page.locator("body").innerText(),
          );
        }
        throw error;
      } finally {
        await context.close();
      }
    }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = error instanceof Error ? error.stack : String(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report));
