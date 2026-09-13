import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
const [entry, dir] = process.argv.slice(2);
assert.ok(
  entry && dir && process.argv.length === 4,
  "Usage: node verify-count.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const output = resolve(dir);
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(entry)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  scope:
    "Desktop Chrome, direct focus/Enter, count preview, monthly correction, actual file download and edit invalidation. Not physical-device or calendar-client import evidence.",
  runs: [],
  sourceHashes: {},
};
for (const file of [
  "src/shared/interpret-recurrence.ts",
  "src/shared/interpret-date.ts",
  "src/shared/clarify-numeric-date.ts",
  "src/shared/recurring-calendar-file.ts",
  "src/features/parser/components/occurrence-result.tsx",
  "src/features/parser/components/calendar-export.tsx",
  "examples/app/verify-count.mjs",
])
  report.sourceHashes[file] = createHash("sha256").update(readFileSync(file)).digest("hex");
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
      for (const [id, text, count] of [
        ["weekly", "Call Sam every Monday at noon for 5 occurrences", 5],
        ["monthly", "Call Sam every month on the 31st at noon for 3 occurrences", 3],
        ["consume", "Call Sam every Monday at noon for 3 occurrences except 2026-09-21", 2],
        ["replace", "Call Sam every Monday at noon for 3 occurrences except 2026-09-21", 3],
        ["past-consume", "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07", 2],
        ["past-upcoming", "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07", 3],
      ]) {
        await input.fill(text);
        if (id === "monthly") {
          assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
          await activate(
            page.getByRole("button", { name: "Use the last day of that month", exact: true }),
          );
        }
        if (id === "consume" || id === "replace") {
          assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
          const choice = page.getByRole("button", {
            name: id === "consume" ? /^Count excluded dates;/ : /^Replace excluded dates to keep/,
          });
          const label = await choice.innerText();
          assert.ok(label.includes("2026-09-14") && label.includes("2026-09-28"));
          assert.equal(label.includes("2026-10-05"), id === "replace");
          await activate(choice);
        }
        if (id === "past-consume" || id === "past-upcoming") {
          assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
          const choice = page.getByRole("button", {
            name:
              id === "past-consume" ? /^Count from the written start,/ : /^Count upcoming starts;/,
          });
          const label = await choice.innerText();
          assert.ok(label.includes("2026-09-14") && label.includes("2026-09-21"));
          assert.equal(label.includes("2026-09-28"), id === "past-upcoming");
          await activate(choice);
        }
        if (id !== "weekly")
          await page.waitForFunction(() => document.activeElement?.id === "calculated-date");
        await page.locator("#calculated-date").waitFor();
        assert.ok(
          (await page.locator("#calculated-date").innerText()).includes(
            id === "past-consume"
              ? "3 scheduled dates from the written start."
              : id === "consume"
                ? "3 scheduled dates before exclusions."
                : `${count} occurrences in total.`,
          ),
        );
        assert.equal(await input.inputValue(), text);
        await activate(page.locator("#calendar-export-toggle"));
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
        await download.saveAs(join(output, file));
        assert.equal(await download.failure(), null);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await input.fill(
          id === "monthly"
            ? text.replace("3 occurrences", "4 occurrences")
            : id === "consume" || id === "replace"
              ? text.replace("09-21", "09-28")
              : id === "past-consume" || id === "past-upcoming"
                ? text.replace("09-07", "09-06")
                : text.replace("5 occurrences", "0 occurrences"),
        );
        await page.locator("#calculation-error").waitFor();
        assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
        report.runs.push({
          id,
          width,
          status: "passed",
          file,
          sha256: createHash("sha256")
            .update(readFileSync(join(output, file)))
            .digest("hex"),
        });
      }
    } finally {
      await context.close();
    }
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
console.log(JSON.stringify(report));
