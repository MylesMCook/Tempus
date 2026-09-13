import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout } from "node:timers/promises";

// Requires an already-running, loopback-only packed example and installed Playwright.
const [installationArg, outputArg, playwrightArg, ...flags] = process.argv.slice(2);
assert.ok(
  flags.every((flag) => ["--webkit-option-tab", "--offline-after-load"].includes(flag)) &&
    new Set(flags).size === flags.length,
  "Unknown or repeated browser verification option",
);
const keyboardMode = flags.includes("--webkit-option-tab");
const offlineAfterLoad = flags.includes("--offline-after-load");
assert.ok(
  installationArg && outputArg && playwrightArg,
  "Usage: node verify-browser.mjs PACKED-INSTALL NEW-OUTPUT PLAYWRIGHT-ENTRY [--webkit-option-tab] [--offline-after-load]",
);
const installation = resolve(installationArg);
const output = resolve(outputArg);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const root = fileURLToPath(new URL("../../", import.meta.url));
const packed = JSON.parse(readFileSync(join(installation, "verification.json"), "utf8"));
assert.equal(packed.status, "passed");
for (const [name, expected] of Object.entries(packed.installedFileHashes)) {
  assert.equal(
    hash(readFileSync(join(installation, "node_modules/@tempus-date/core", name))),
    expected,
  );
}
const sourceHashes = {};
for (const name of ["calendar.html", "calendar-browser.ts", "vite.config.mjs"]) {
  const bytes = readFileSync(join(installation, name));
  assert.equal(hash(bytes), hash(readFileSync(join(root, "examples/sdk", name))));
  sourceHashes[name] = hash(bytes);
}
assert.equal(
  sourceHashes["calendar-browser.ts"],
  packed.exampleSourceHashes["calendar-browser.ts"],
);
mkdirSync(output); // Refuse an existing evidence directory.
const report = {
  status: "running",
  offlineAfterLoad,
  journeyVersion: 2,
  webkitNavigation: keyboardMode ? "Option-Tab / Shift-Option-Tab" : "Tab / Shift-Tab",
  archiveSha256: packed.archiveSha256,
  sourceHashes,
  runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  runs: [],
  downloadPacingMs: 1100,
  scope:
    "Authored packed SDK browser journeys. Desktop viewport resizing is not physical-device testing. Downloads are not calendar-client imports.",
};
const origin = "http://127.0.0.1:5184";
const weekly = "Call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08";
const list = "Call Sam September 30 and October 2 and 4 at noon";
try {
  const playwright = await import(pathToFileURL(resolve(playwrightArg)).href);
  for (const name of ["chromium", "firefox", "webkit"]) {
    const browser = await playwright[name].launch(name === "chromium" ? { channel: "chrome" } : {});
    try {
      for (const width of [320, 1280]) {
        const run = {
          browser: name,
          version: browser.version(),
          width,
          status: "running",
          files: [],
          errors: [],
          keyboard: [],
          externalRequests: [],
          navigations: [],
          offlineRequests: [],
        };
        report.runs.push(run);
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          acceptDownloads: true,
        });
        try {
          await context.route("**/*", async (route) => {
            if (new URL(route.request().url()).origin !== origin) {
              run.externalRequests.push(route.request().url());
              await route.abort();
            } else await route.continue();
          });
          const page = await context.newPage();
          page.on("pageerror", (error) => run.errors.push(String(error)));
          page.on("framenavigated", (frame) => {
            if (frame === page.mainFrame())
              run.navigations.push({ url: frame.url(), at: new Date().toISOString() });
          });
          await page.goto(`${origin}/calendar.html`);
          await page.waitForFunction(() => Boolean(document.querySelector("#result")?.textContent));
          if (offlineAfterLoad) {
            const control = `${origin}/calendar.html?offline-control=1`;
            page.on("request", (request) => run.offlineRequests.push(request.url()));
            await context.setOffline(true);
            await page.waitForFunction(() => navigator.onLine === false);
            run.offlineControlFailed = await page.evaluate(async (url) => {
              try {
                await fetch(url, { cache: "no-store" });
                return false;
              } catch {
                return true;
              }
            }, control);
            assert.equal(run.offlineControlFailed, true, "Offline control fetch must fail");
            run.offlineControlUrl = control;
          }
          const input = page.locator("#phrase");
          const download = page.locator("#download");
          const state = async () => JSON.parse(await page.locator("#result").textContent());
          const reach = async (locator, key = "Tab") => {
            if (name === "webkit" && keyboardMode) {
              key = key === "Tab" ? "Alt+Tab" : "Shift+Alt+Tab";
            }
            const step = {
              target: await locator.evaluate((el) => el.id || el.textContent),
              tabs: 0,
              key,
              focus: [],
            };
            run.keyboard.push(step);
            while (!(await locator.evaluate((el) => document.activeElement === el))) {
              assert.ok(step.tabs < 20, `Control not reachable: ${step.target}`);
              await page.keyboard.press(key);
              step.tabs++;
              step.focus.push(
                await page.evaluate(() => ({
                  tag: document.activeElement?.tagName,
                  id: document.activeElement?.id,
                  documentFocused: document.hasFocus(),
                })),
              );
            }
          };
          const enter = async (locator, key = "Tab") => {
            await reach(locator, key);
            await page.keyboard.press("Enter");
          };
          const replaceInput = async (text) => {
            await reach(
              input,
              (await page.evaluate(() => document.activeElement === document.body))
                ? "Tab"
                : "Shift+Tab",
            );
            await page.keyboard.press("ControlOrMeta+A");
            await page.keyboard.insertText(text);
            assert.equal(await input.inputValue(), text);
          };
          const choose = async (id) => {
            const current = await state();
            const prompt = current.result.clarification ?? current.completeExportPlan?.clockPrompt;
            const choice = prompt?.choices.find((choice) => choice.id === id);
            assert.ok(choice, `Missing authored choice ${id}`);
            await enter(page.getByRole("button", { name: choice.label, exact: true }));
            assert.equal(
              await page
                .locator("#interpretation-summary")
                .evaluate((el) => document.activeElement === el),
              true,
            );
          };
          const save = async (kind, expectedCount, title = "Call Sam") => {
            assert.equal(await download.isDisabled(), false);
            // Keep an automated burst of downloads separate from a user's paced actions.
            // This runner measures correctness, not download throughput.
            await setTimeout(report.downloadPacingMs);
            const [file] = await Promise.all([page.waitForEvent("download"), enter(download)]);
            assert.equal(await file.failure(), null);
            const filename = `${name}-${width}-${kind}.ics`;
            await file.saveAs(join(output, filename));
            const text = readFileSync(join(output, filename), "utf8");
            assert.equal((text.match(/BEGIN:VEVENT/g) ?? []).length, expectedCount);
            assert.equal(text.split(`SUMMARY:${title}\r\n`).length - 1, expectedCount);
            run.files.push({
              filename,
              sha256: hash(readFileSync(join(output, filename))),
              events: expectedCount,
            });
            return text;
          };
          for (const [text, id, label, kind, start, end] of [
            [
              "Call Sam Friday at noon, actually Saturday instead",
              "replace",
              "Use September 12, 2026 (date only)",
              "date-point",
              "20260912",
              null,
            ],
            [
              "Call Sam tomorrow for 2 days or Friday at midnight for 2 days",
              "alternative:first",
              "Use September 13, 2026 to September 15, 2026 (all day; exclusive end)",
              "all-day-range",
              "20260913",
              "20260915",
            ],
          ]) {
            await replaceInput(text);
            assert.equal(await download.isDisabled(), true);
            assert.equal(
              (await state()).result.clarification.choices.find((choice) => choice.id === id)
                ?.label,
              label,
            );
            await choose(id);
            assert.equal(await input.inputValue(), text);
            const file = await save(kind, 1);
            assert.ok(file.includes(`DTSTART;VALUE=DATE:${start}`));
            if (end) assert.ok(file.includes(`DTEND;VALUE=DATE:${end}`));
            await replaceInput(text.replace("Sam", "Jo"));
            assert.equal(await download.isDisabled(), true);
            assert.equal((await state()).result.status, "needs-clarification");
          }
          for (const [kind, text, ids] of [
            [
              "range-exclusive",
              "Call Sam from 2026-09-13 to 2026-09-18",
              ["interval:end:boundary:exclusive"],
            ],
            [
              "range-inclusive",
              "Call Sam from 2026-09-13 to 2026-09-18",
              ["interval:end:boundary:inclusive"],
            ],
            [
              "range-mixed",
              "Call Sam from 11/01/2026 until 2026-11-02 at 1:30am",
              [
                "interval:start:date:2026-11-01",
                "interval:start:time:written",
                "interval:start:2026-11-01T07:30:00Z",
              ],
            ],
          ]) {
            await replaceInput(text);
            for (const id of ids) {
              assert.equal(await download.isDisabled(), true);
              await choose(id);
            }
            assert.equal(await input.inputValue(), text);
            assert.equal((await state()).result.status, "resolved");
            await save(kind, 1);
            await replaceInput(text.replace("Sam", "Jo"));
            assert.equal(await download.isDisabled(), true);
            assert.equal((await state()).result.status, "needs-clarification");
          }
          for (const [kind, text, total, policy] of [
            ["count-weekly", "Call Sam every Monday at noon for 5 occurrences", 5, null],
            [
              "count-monthly",
              "Call Sam every month on the 31st at noon for 3 occurrences",
              3,
              "monthly:last-day",
            ],
            [
              "count-past-consume",
              "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07",
              2,
              "count:past:consume",
            ],
            [
              "count-past-upcoming",
              "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07",
              3,
              "count:past:upcoming",
            ],
            [
              "count-excluded-consume",
              "Call Sam every Monday at noon for 3 occurrences except 2026-09-21",
              2,
              "count:exclusions:consume",
            ],
            [
              "count-excluded-replace",
              "Call Sam every Monday at noon for 3 occurrences except 2026-09-21",
              3,
              "count:exclusions:replace",
            ],
          ]) {
            await replaceInput(text);
            if (policy) {
              assert.equal(await download.isDisabled(), true);
              await choose(policy);
            }
            const current = await state();
            assert.equal(current.result.value.rule.count, kind === "count-weekly" ? 5 : 3);
            assert.equal(current.completeExportPlan.occurrences.length, total);
            assert.equal(await input.inputValue(), text);
            const file = await save(kind, total);
            assert.ok(!file.includes("RRULE:"));
            await replaceInput(
              text.replace(
                `${kind === "count-weekly" ? 5 : 3} occurrences`,
                kind === "count-monthly" ? "4 occurrences" : "0 occurrences",
              ),
            );
            assert.equal(await download.isDisabled(), true);
          }
          const range = "Call Sam from 11/01/2026 at 1:30am until 2026-11-02 at noon";
          await replaceInput(range);
          assert.equal(await download.isDisabled(), true);
          await choose("interval:start:date:2026-11-01");
          assert.equal(await download.isDisabled(), true);
          await choose("interval:start:2026-11-01T07:30:00Z");
          const rangeFile = await save("range", 1);
          assert.ok(
            rangeFile.includes("DTSTART:20261101T073000Z") &&
              rangeFile.includes("DTEND:20261102T180000Z"),
          );
          assert.equal(await input.inputValue(), range);
          await replaceInput(range.replace("11-02", "11-03"));
          assert.equal(await download.isDisabled(), true);
          assert.equal((await state()).result.status, "needs-clarification");
          await replaceInput(weekly);
          assert.equal(await download.isDisabled(), true);
          await choose("recurrence:2026-11-01:start:2026-11-01T07:30:00Z");
          assert.equal(await input.inputValue(), weekly);
          const weeklyFile = await save("weekly", 9);
          assert.ok(weeklyFile.includes("20261101T073000Z"));
          assert.ok(weeklyFile.includes("20261108T080000Z"));
          await enter(page.locator("#restart"), "Shift+Tab");
          assert.equal(await download.isDisabled(), true);
          assert.equal(await input.inputValue(), weekly);
          await replaceInput(list);
          assert.equal(await download.isDisabled(), true);
          await choose("list:2:month:october");
          await choose("list:year:2026");
          assert.equal(await download.isDisabled(), true);
          await choose("list:0:time:0");
          await choose("list:1:time:0");
          assert.equal(await input.inputValue(), list);
          const listFile = await save("list", 3);
          assert.equal(await page.locator("#diagnostics").getAttribute("open"), null);
          const readable = await page.locator("#interpretation-summary").innerText();
          assert.ok(
            readable.includes("Call Sam") && readable.includes("3 events in the complete file."),
          );
          assert.ok(
            readable.includes("2026-09-30 at 12:00:00") &&
              readable.includes("2026-10-02 at 12:00:00") &&
              readable.includes("2026-10-04 at 12:00:00"),
          );
          await enter(page.locator("#diagnostics summary"));
          assert.notEqual(await page.locator("#diagnostics").getAttribute("open"), null);
          await page.keyboard.press("Enter");
          assert.ok(
            ["20260930T170000Z", "20261002T170000Z", "20261004T170000Z"].every((start) =>
              listFile.includes(start),
            ),
          );
          assert.equal(/DTEND|DURATION/.test(listFile), false);
          await page.screenshot({ path: join(output, `${name}-${width}.png`), fullPage: true });
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
          );
          await replaceInput(list.replace("4 at", "5 at"));
          assert.equal(await download.isDisabled(), true);
          assert.equal((await state()).result.status, "needs-clarification");
          await replaceInput("Call Sam every Sunday at 1:30am");
          assert.equal(await download.isDisabled(), true);
          assert.equal((await state()).completeExportPlan.ok, false);
          await replaceInput("tomorrow");
          assert.equal(await download.isDisabled(), false);
          assert.ok(
            (await page.locator("#interpretation-summary").innerText()).includes(
              "2026-09-13 · all day",
            ),
          );
          await replaceInput("for 3 days from today");
          assert.equal(await download.isDisabled(), false);
          const interval = await page.locator("#interpretation-summary").innerText();
          assert.ok(
            interval.includes("2026-09-12 · all day") && interval.includes("2026-09-15 · all day"),
          );
          assert.ok(interval.includes("end not included"));
          const reminder = "Buy apples for mom at 1:30am on 11/01/2026";
          await replaceInput(reminder);
          for (const id of ["event:title", "2026-11-01", "2026-11-01T07:30:00Z"]) {
            assert.equal(await download.isDisabled(), true);
            await choose(id);
          }
          const interpreted = (await state()).result;
          assert.equal(interpreted.input, reminder);
          assert.equal(interpreted.event.text, "Buy apples for mom");
          for (const source of [interpreted.event, interpreted.source]) {
            assert.equal(reminder.slice(source.span.start, source.span.end), source.text);
          }
          assert.equal(interpreted.value.calculation.result.iso, "2026-11-01T07:30:00.000Z");
          await save("recipient-lowercase", 1, "Buy apples for mom");
          await replaceInput(reminder.replace("mom", "dad"));
          assert.equal(await download.isDisabled(), true);
          assert.equal((await state()).result.status, "needs-clarification");
          for (const qualifier of ["pending", "assuming", "provided"]) {
            const conditional = `Buy apples for mom ${qualifier} tomorrow at noon`;
            await replaceInput(conditional);
            const unresolved = (await state()).result;
            assert.notEqual(unresolved.status, "resolved");
            assert.equal(unresolved.clarification, undefined);
            assert.equal(unresolved.input, conditional);
            assert.equal(await download.isDisabled(), true);
          }
          await replaceInput("invalid text");
          assert.equal(await download.isDisabled(), true);
          assert.notEqual((await state()).result.status, "resolved");
          assert.equal(await page.locator("#feedback").innerText(), "");
          assert.deepEqual(run.errors, []);
          assert.deepEqual(run.externalRequests, []);
          if (offlineAfterLoad) {
            assert.equal(await page.evaluate(() => navigator.onLine), false);
            assert.deepEqual(run.offlineRequests, [run.offlineControlUrl]);
          }
          run.status = "passed";
        } catch (error) {
          run.status = "failed";
          run.error = String(error);
          run.stack = error instanceof Error ? error.stack : undefined;
          const failedPage = context.pages()[0];
          if (failedPage && !failedPage.isClosed()) {
            try {
              writeFileSync(
                join(output, `${name}-${width}-failed.html`),
                await failedPage.content(),
              );
              await failedPage.screenshot({
                path: join(output, `${name}-${width}-failed.png`),
                fullPage: true,
              });
            } catch (captureError) {
              run.captureError = String(captureError);
            }
          }
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
  report.status = report.runs.every((run) => run.status === "passed") ? "passed" : "failed";
  if (report.status === "failed") process.exitCode = 1;
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(
  JSON.stringify({ status: report.status, runs: report.runs.length, error: report.error }),
);
