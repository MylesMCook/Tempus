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
const engines = await import(pathToFileURL(resolve(playwrightArg)).href);
const report = {
  status: "running",
  runs: [],
  sourceHashes: Object.fromEntries(
    [
      "src/features/parser/calendar-preparation.worker.ts",
      "src/features/parser/use-calendar-preparation.ts",
      "src/features/parser/components/calendar-export.tsx",
      "src/shared/recurring-calendar-file.ts",
      "examples/app/verify-worker-preparation.mjs",
    ].map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]),
  ),
  scope:
    "Real desktop workers, direct focus/Enter and files. Harness delays actual message delivery and simulates unavailable Worker construction for cancellation/stale-response/failure tests. Not physical device or production-server evidence.",
};
try {
  for (const name of ["chromium", "firefox", "webkit"]) {
    const browser = await engines[name].launch(name === "chromium" ? { channel: "chrome" } : {});
    const page = await browser.newPage({
      viewport: { width: 320, height: 950 },
      timezoneId: "America/Chicago",
    });
    const run = {
      browser: name,
      version: browser.version(),
      status: "running",
      errors: [],
      files: [],
    };
    report.runs.push(run);
    page.on("pageerror", (error) => run.errors.push(error.message));
    try {
      await page.addInitScript(() => {
        const NativeWorker = globalThis.Worker;
        globalThis.testWorkerDelay = 0;
        globalThis.testBlockWorker = false;
        globalThis.pendingWorkerMessages = 0;
        globalThis.liveWorkers = new Set();
        globalThis.Worker = class extends NativeWorker {
          constructor(...args) {
            if (globalThis.testBlockWorker) throw new Error("Simulated unavailable worker");
            super(...args);
            globalThis.liveWorkers.add(this);
          }
          set onmessage(handler) {
            super.onmessage = (event) => {
              globalThis.pendingWorkerMessages++;
              setTimeout(() => {
                globalThis.pendingWorkerMessages--;
                handler.call(this, event);
              }, globalThis.testWorkerDelay);
            };
          }
          get onmessage() {
            return super.onmessage;
          }
          terminate() {
            globalThis.liveWorkers.delete(this);
            super.terminate();
          }
        };
      });
      await page.goto(baseURL);
      const input = page.locator("#date-expression");
      const download = page.getByRole("button", { name: "Download calendar file", exact: true });
      const activate = async (locator) => {
        await locator.focus();
        await page.keyboard.press("Enter");
      };
      const ready = () =>
        page.waitForFunction(() =>
          [...document.querySelectorAll("button")].some(
            (b) => b.textContent.trim() === "Download calendar file" && !b.disabled,
          ),
        );
      const open = async (text) => {
        await input.fill("");
        await input.fill(text);
        await page.locator("#calculated-date").waitFor();
        await activate(page.locator("#calendar-export-toggle"));
      };
      const save = async (id) => {
        await ready();
        const [file] = await Promise.all([page.waitForEvent("download"), activate(download)]);
        const filename = `${name}-${id}.ics`;
        await file.saveAs(join(output, filename));
        const bytes = readFileSync(join(output, filename));
        run.files.push({ filename, sha256: createHash("sha256").update(bytes).digest("hex") });
        return bytes.toString();
      };
      // A delivered native message remains queued in the harness even after cancellation.
      await page.evaluate(() => {
        globalThis.testWorkerDelay = 900;
      });
      await open("Call Sam every day at noon for 5 occurrences");
      await page.waitForFunction(() => globalThis.pendingWorkerMessages > 0);
      await activate(page.getByRole("button", { name: "Cancel preparation", exact: true }));
      await page.waitForFunction(
        () => globalThis.pendingWorkerMessages === 0 && globalThis.liveWorkers.size === 0,
      );
      assert.ok(
        (await page.locator("#calendar-export-status").innerText()).includes(
          "Preparation cancelled",
        ),
      );
      assert.equal(await download.isDisabled(), true);
      await page.evaluate(() => {
        globalThis.testWorkerDelay = 0;
      });
      await activate(page.getByRole("button", { name: "Try preparing again", exact: true }));
      assert.equal(((await save("retry")).match(/BEGIN:VEVENT/g) ?? []).length, 5);
      // New title must invalidate a previously downloadable file immediately.
      await page.evaluate(() => {
        globalThis.testWorkerDelay = 900;
      });
      await page.locator("#calendar-title").fill("Updated title");
      assert.equal(await download.isDisabled(), true);
      await page.waitForFunction(() => globalThis.pendingWorkerMessages > 0);
      // Replace the interpretation while its old title response is queued.
      await page.evaluate(() => {
        globalThis.testWorkerDelay = 0;
      });
      await open("Call Jo every day at noon for 3 occurrences");
      await ready();
      await page.waitForFunction(() => globalThis.pendingWorkerMessages === 0);
      const changed = await save("edited");
      assert.equal((changed.match(/BEGIN:VEVENT/g) ?? []).length, 3);
      assert.ok(changed.includes("SUMMARY:Call Jo"));
      assert.ok(!changed.includes("Updated title"));
      // Unavailable worker never falls back to blocking preparation or an old file.
      await page.evaluate(() => {
        globalThis.testBlockWorker = true;
      });
      await page.locator("#calendar-title").fill("Final title");
      await page.getByRole("button", { name: "Try preparing again", exact: true }).waitFor();
      assert.equal(await download.isDisabled(), true);
      await page.evaluate(() => {
        globalThis.testBlockWorker = false;
      });
      await activate(page.getByRole("button", { name: "Try preparing again", exact: true }));
      assert.ok((await save("title")).includes("SUMMARY:Final title"));
      // Restarting after cancellation clears the answered clock and resumes preparation.
      await open("Call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08");
      const lateClock = page
        .locator("#calendar-export-status")
        .getByRole("button", { name: /UTC-06:00/ });
      await lateClock.waitFor();
      await page.evaluate(() => {
        globalThis.testWorkerDelay = 900;
      });
      await activate(lateClock);
      await page.waitForFunction(() => globalThis.pendingWorkerMessages > 0);
      await activate(page.getByRole("button", { name: "Cancel preparation", exact: true }));
      await page.evaluate(() => {
        globalThis.testWorkerDelay = 0;
      });
      await activate(page.getByRole("button", { name: "Restart export choices", exact: true }));
      await lateClock.waitFor();
      await page.waitForFunction(() => globalThis.pendingWorkerMessages === 0);
      assert.equal(await download.isDisabled(), true);
      await activate(lateClock);
      await ready();
      await activate(page.locator("#calendar-export-toggle"));
      await page.waitForFunction(() => globalThis.liveWorkers.size === 0);
      assert.deepEqual(run.errors, []);
      run.status = "passed";
    } catch (error) {
      run.status = "failed";
      run.error = String(error);
      throw error;
    } finally {
      await browser.close();
    }
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  throw error;
} finally {
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ status: report.status, runs: report.runs.length }));
