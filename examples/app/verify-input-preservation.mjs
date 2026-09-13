import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const [playwrightEntry, outputArg] = process.argv.slice(2);
assert.ok(
  playwrightEntry && outputArg,
  "Usage: node verify-input-preservation.mjs PLAYWRIGHT-ENTRY NEW-OUTPUT",
);
const base = new URL(process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5175");
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Use a local app");
const output = resolve(outputArg);
mkdirSync(output);
const playwright = await import(pathToFileURL(resolve(playwrightEntry)).href);
const complete = "Call Sam tomorrow at noon";
// Boundary fixture: a meaningful qualifier must survive insertion beyond the supported length.
const original = complete.padEnd(200, " ") + "except on holidays";
const report = {
  status: "running",
  runnerSha256: createHash("sha256")
    .update(readFileSync(fileURLToPath(import.meta.url)))
    .digest("hex"),
  original,
  runs: [],
  scope:
    "Authored desktop text insertion and explicit editing; not physical-device, native clipboard, calendar import or independent-user evidence.",
};
try {
  for (const name of ["chromium", "firefox", "webkit"]) {
    const browser = await playwright[name].launch(name === "chromium" ? { channel: "chrome" } : {});
    try {
      for (const width of [320, 1280]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const run = {
          browser: name,
          version: browser.version(),
          width,
          status: "running",
          errors: [],
        };
        report.runs.push(run);
        page.on("pageerror", (error) => run.errors.push(error.message));
        try {
          await page.goto(base.href);
          const input = page.locator("#date-expression");
          const replace = async (text) => {
            await input.focus();
            await page.keyboard.press("ControlOrMeta+A");
            await page.keyboard.insertText(text);
            assert.equal(await input.inputValue(), text, "Keep all inserted text");
          };
          const unresolved = async () => {
            assert.equal(
              await page.getByRole("button", { name: "Copy date", exact: true }).count(),
              0,
            );
            assert.equal(await page.locator("#calendar-export-toggle").count(), 0);
            assert.equal(await input.getAttribute("aria-invalid"), "true");
          };
          await replace(original);
          await page.locator("#calculation-error").waitFor();
          assert.match(await page.locator("#calculation-error").innerText(), /too long/i);
          assert.match(await page.locator("#calculation-error").innerText(), /200/);
          await unresolved();
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false,
          );
          await page.screenshot({
            path: join(output, `${name}-${width}-length-error.png`),
            fullPage: true,
          });
          // Removing padding does not remove the qualifier or make it supported.
          await replace(`${complete} except on holidays`);
          await unresolved();
          assert.doesNotMatch(await page.locator("#calculation-error").innerText(), /too long/i);
          // The user explicitly replaces the whole request; no automatic shortening occurs.
          await replace(complete);
          await page.getByRole("button", { name: "Copy date", exact: true }).waitFor();
          assert.equal(await input.getAttribute("aria-invalid"), "false");
          assert.equal(await page.locator("#calendar-export-toggle").count(), 1);
          assert.deepEqual(run.errors, []);
          run.status = "passed";
        } catch (error) {
          run.status = "failed";
          run.failure = String(error);
          await page.screenshot({
            path: join(output, `${name}-${width}-failure.png`),
            fullPage: true,
          });
          throw error;
        } finally {
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.failure = String(error);
  throw error;
} finally {
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ status: report.status, runs: report.runs.length }));
