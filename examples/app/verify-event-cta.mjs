import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(
  playwrightPath && destination && process.argv.length === 4,
  "Usage: node verify-event-cta.mjs PLAYWRIGHT-ENTRY NEW-output-directory",
);
const output = resolve(destination);
mkdirSync(output); // Existing evidence must not be overwritten.
const appUrl = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  status: "running",
  browser: browser.version(),
  appUrl,
  reference: "2026-10-29T15:00:00Z America/Chicago",
  runs: [],
  scope:
    "Approved Add to calendar mockup: event results lead with the button, plain dates keep the quiet link. Chrome 320/1280px; not devices or calendar import.",
};

try {
  for (const width of [320, 1280]) {
    const run = { width, status: "running", scenarios: [] };
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
      const input = page.locator("#date-expression");
      const add = page.getByRole("button", { name: "Add to calendar", exact: true });
      const panel = page.getByRole("region", { name: "Add to calendar" });
      const download = page.getByRole("button", { name: "Download calendar file", exact: true });
      const save = async (name) => {
        const waiting = page.waitForEvent("download");
        await download.click();
        const file = await waiting;
        const path = join(output, `${name}-${width}.ics`);
        await file.saveAs(path);
        assert.equal(await file.failure(), null);
        return readFileSync(path, "utf8").replace(/\r\n[ \t]/g, "");
      };

      // Single event: button leads, panel opens in place with title first and focus moved.
      await input.fill("Call Sam tomorrow at noon");
      await add.waitFor();
      assert.equal(await add.getAttribute("aria-expanded"), "false");
      assert.equal(await page.getByText("Download as calendar file").count(), 0);
      const copy = page.getByRole("button", { name: "Copy result", exact: true });
      assert.ok(await copy.isVisible());
      assert.ok(
        await add.evaluate((a) =>
          Boolean(
            a.compareDocumentPosition(
              [...document.querySelectorAll("summary")].find((s) =>
                s.textContent.includes("Show calculation steps"),
              ),
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        ),
        "Add to calendar comes before the calculation steps",
      );
      await add.click();
      await panel.waitFor();
      assert.equal(await add.getAttribute("aria-expanded"), "true");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "calendar-panel-heading");
      assert.equal(await page.locator("#calendar-title").inputValue(), "Call Sam");
      const titleFirst = await page
        .locator("#calendar-title")
        .evaluate((title) =>
          Boolean(
            title.compareDocumentPosition(document.querySelector("input[name='calendar-length']")) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        );
      assert.ok(titleFirst, "title comes before the length question");
      await page.getByRole("radio", { name: "30 minutes" }).check();
      let text = await save("single");
      assert.ok(text.includes("DTEND:20261030T173000Z\r\n"));
      await page.screenshot({ path: join(output, `open-${width}.png`) });
      await panel.getByRole("button", { name: "Close", exact: true }).click();
      assert.equal(await panel.count(), 0);
      assert.equal(await add.getAttribute("aria-expanded"), "false");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "calendar-export-toggle");
      run.scenarios.push("single event leads with Add to calendar; Close returns focus");

      // Range with an event title.
      await input.fill("Call Sam tomorrow at noon for 30 minutes");
      await add.waitFor();
      assert.ok(await page.getByRole("button", { name: "Copy date range" }).isVisible());
      await add.click();
      text = await save("range");
      assert.ok(text.includes("DTEND:20261030T173000Z\r\n"));
      run.scenarios.push("range with an event downloads from the button");

      // Repeat with an event title.
      await input.fill("Call Sam every Monday at noon for 3 occurrences");
      await add.waitFor();
      await add.click();
      await page.getByText("3 events in the file.").waitFor();
      text = await save("repeat");
      assert.ok(text.includes("SUMMARY:Call Sam"));
      run.scenarios.push("repeat with an event downloads from the button");

      // Plain date calculation keeps the quiet link and no button.
      await input.fill("tomorrow at noon");
      await page.locator("#calendar-export-toggle").waitFor();
      assert.equal(await add.count(), 0);
      assert.ok(await page.getByText("Download as calendar file").isVisible());
      run.scenarios.push("plain dates keep the quiet link");

      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
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
