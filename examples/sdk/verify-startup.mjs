import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const [buildArg, outputArg, playwrightArg, scenario] = process.argv.slice(2);
assert.ok(scenario === undefined || scenario === "--quantity-title");
assert.ok(
  buildArg && outputArg && playwrightArg,
  "Usage: node verify-startup.mjs STATIC-BUILD NEW-OUTPUT PLAYWRIGHT-ENTRY",
);
const build = resolve(buildArg);
const output = resolve(outputArg);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const identity = JSON.parse(readFileSync(join(build, "build.json"), "utf8"));
assert.equal(hash(readFileSync(join(build, "calendar-browser.js"))), identity.bundleSha256);
mkdirSync(output);
const report = {
  status: "running",
  scenario: scenario ?? "numeric-identifier",
  build: identity,
  runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  runs: [],
  scope:
    "Artificially delayed module delivery to a static packed example. Input preservation and correction checks, not a startup performance or physical-device measurement.",
};
const origin = "http://127.0.0.1:5184";
try {
  const playwright = await import(pathToFileURL(resolve(playwrightArg)).href);
  for (const name of ["chromium", "firefox", "webkit"]) {
    const browser = await playwright[name].launch(name === "chromium" ? { channel: "chrome" } : {});
    try {
      for (let trial = 0; trial < 3; trial++) {
        const run = {
          browser: name,
          version: browser.version(),
          trial,
          status: "running",
          errors: [],
          navigations: [],
        };
        report.runs.push(run);
        const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
        let release;
        const gate = new Promise((resolveGate) => {
          release = resolveGate;
        });
        try {
          await context.route("**/*", async (route) => {
            const url = new URL(route.request().url());
            if (url.origin !== origin) {
              run.errors.push(`Unexpected origin: ${url.origin}`);
              return route.abort();
            }
            if (url.pathname === "/calendar-browser.js") {
              const response = await route.fetch();
              const bytes = await response.body();
              assert.equal(hash(bytes), identity.bundleSha256);
              await gate;
              return route.fulfill({ response, body: bytes });
            }
            return route.continue();
          });
          const page = await context.newPage();
          page.on("pageerror", (error) => run.errors.push(error.message));
          page.on("framenavigated", (frame) => {
            if (frame === page.mainFrame()) run.navigations.push(frame.url());
          });
          await page.goto(`${origin}/calendar.html`, { waitUntil: "commit" });
          const input = page.locator("#phrase");
          const title = scenario ? "Buy 3 apples" : "Pay invoice #123";
          const text = `${title} on 11/01/2026 at 1:30am for 30 minutes`;
          await input.fill(text);
          assert.equal(await page.locator("#result").textContent(), "");
          assert.equal(await page.locator("#download").isDisabled(), true);
          release();
          await page.waitForFunction(() => Boolean(document.querySelector("#result")?.textContent));
          const state = async () => JSON.parse(await page.locator("#result").textContent()).result;
          for (const id of [
            ...(scenario ? ["event:title"] : []),
            "2026-11-01",
            "interval:start:2026-11-01T07:30:00Z",
          ]) {
            const question = await state();
            assert.equal(question.status, "needs-clarification");
            assert.equal(await page.locator("#download").isDisabled(), true);
            const choice = question.clarification.choices.find((item) => item.id === id);
            assert.ok(choice);
            await page.getByRole("button", { name: choice.label, exact: true }).click();
          }
          const result = await state();
          assert.equal(result.status, "resolved");
          assert.equal(result.event.text, title);
          assert.equal(result.value.start.result.iso, "2026-11-01T07:30:00.000Z");
          assert.equal(result.value.end.result.iso, "2026-11-01T08:00:00.000Z");
          assert.equal(await input.inputValue(), text);
          assert.equal(await page.locator("#download").isDisabled(), false);
          await input.fill(
            scenario ? text.replace("3 apples", "4 apples") : text.replace("#123", "#124"),
          );
          assert.equal((await state()).status, "needs-clarification");
          assert.equal(await page.locator("#download").isDisabled(), true);
          assert.deepEqual(run.errors, []);
          assert.equal(run.navigations.length, 1);
          run.status = "passed";
        } catch (error) {
          run.status = "failed";
          run.error = String(error);
          throw error;
        } finally {
          release();
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ status: report.status, runs: report.runs.length }));
