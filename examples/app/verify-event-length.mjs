import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(
  playwrightPath && destination && process.argv.length === 4,
  "Usage: node verify-event-length.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const output = resolve(destination);
mkdirSync(output); // Existing evidence must not be overwritten.
const appUrl = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const choices = ["Start time only", "15 minutes", "30 minutes", "1 hour"];
const report = {
  status: "running",
  browser: browser.version(),
  appUrl,
  reference: "2026-10-29T15:00:00Z America/Chicago",
  runs: [],
  scope:
    "Approved phase 1 length-at-download scenarios in Chrome at 320/1280px. Not physical devices or calendar-client import.",
};

async function enter(page, phrase) {
  await page.locator("#date-expression").fill(phrase);
  const toggle = page.locator("#calendar-export-toggle");
  await toggle.waitFor();
  // Events use the Add to calendar button; plain dates use the quiet disclosure.
  const open = await toggle.evaluate(
    (t) => t.getAttribute("aria-expanded") === "true" || t.closest("details")?.open === true,
  );
  if (!open) await toggle.click();
  await page.getByRole("button", { name: "Download calendar file", exact: true }).waitFor();
}
const lengthGroup = (page) => page.getByRole("group", { name: "How long is this event?" });
async function checked(page) {
  return Promise.all(choices.map((name) => page.getByRole("radio", { name }).isChecked()));
}
async function download(page, run, name) {
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download calendar file", exact: true }).click();
  const file = await waiting;
  const path = join(output, `${name}-${run.width}.ics`);
  await file.saveAs(path);
  assert.equal(await file.failure(), null);
  run.files[name] = createHash("sha256").update(readFileSync(path)).digest("hex");
  // Unfold content lines before matching (RFC 5545 section 3.1).
  return readFileSync(path, "utf8").replace(/\r\n[ \t]/g, "");
}

try {
  for (const width of [320, 1280]) {
    const run = { width, status: "running", scenarios: [], files: {} };
    report.runs.push(run);
    let context;
    try {
      context = await browser.newContext({
        viewport: { width, height: 950 },
        timezoneId: "America/Chicago",
        acceptDownloads: true,
      });
      const page = await context.newPage();
      await page.clock.install({ time: new Date("2026-10-29T15:00:00Z") });
      await page.goto(appUrl);
      const button = page.getByRole("button", { name: "Download calendar file", exact: true });

      await enter(page, "Call Sam tomorrow at noon");
      await lengthGroup(page).waitFor();
      for (const name of choices) assert.ok(await page.getByRole("radio", { name }).isVisible());
      assert.deepEqual(await checked(page), [false, false, false, false]);
      assert.equal(await button.isDisabled(), true);
      run.scenarios.push("asks for a length with nothing selected");

      await page.getByRole("radio", { name: "30 minutes" }).check();
      let text = await download(page, run, "thirty-minutes");
      assert.ok(text.includes("DTSTART:20261030T170000Z\r\n"));
      assert.ok(text.includes("DTEND:20261030T173000Z\r\n"));
      assert.ok(text.includes("Length chosen at download: 30 minutes"));
      assert.ok(text.includes("Tempus sets no alert or reminder."));
      assert.ok(!text.includes("BEGIN:VALARM"));
      run.scenarios.push("chosen length becomes the end");

      await page.getByRole("radio", { name: "Start time only" }).check();
      await page.getByText("No end time. Your calendar may pick its own length.").waitFor();
      text = await download(page, run, "start-only");
      assert.ok(text.includes("DTSTART:20261030T170000Z\r\n"));
      assert.ok(!text.includes("DTEND") && !text.includes("DURATION"));
      assert.ok(!text.includes("Length chosen at download"));
      run.scenarios.push("start time only keeps the old file");

      await enter(page, "Call Sam March 14, 2027 at 1:30am");
      await page.getByRole("radio", { name: "1 hour" }).check();
      text = await download(page, run, "clock-change");
      assert.ok(text.includes("DTSTART:20270314T073000Z\r\n"));
      assert.ok(text.includes("DTEND:20270314T083000Z\r\n")); // 3:30 AM CDT
      run.scenarios.push("length across a clock change counts elapsed time");

      for (const phrase of ["Call Sam tomorrow at noon for 30 minutes", "Call Sam tomorrow"]) {
        await enter(page, phrase);
        assert.equal(await lengthGroup(page).count(), 0, phrase);
        assert.equal(await button.isDisabled(), false, phrase);
      }
      run.scenarios.push("phrases with an end or no time are not asked");

      await enter(page, "Call Sam tomorrow at noon");
      await page.getByRole("radio", { name: "30 minutes" }).check();
      await enter(page, "Call Sam Friday at noon");
      await lengthGroup(page).waitFor();
      assert.deepEqual(await checked(page), [false, false, false, false]);
      assert.equal(await button.isDisabled(), true);
      run.scenarios.push("changing the phrase clears the length");

      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await lengthGroup(page).scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(output, `length-${width}.png`) });
      run.status = "passed";
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
