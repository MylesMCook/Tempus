import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import ICAL from "ical.js";

const [consumerArg, archiveArg, playwrightArg, outputArg] = process.argv.slice(2);
assert.ok(consumerArg && archiveArg && playwrightArg && outputArg && process.argv.length === 6);
const consumer = resolve(consumerArg),
  archive = resolve(archiveArg),
  output = resolve(outputArg);
const baseURL = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5175";
assert.match(baseURL, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
mkdirSync(output);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const files = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).trim().split("\n");
for (const file of files.filter((name) => !name.endsWith("/"))) {
  assert.ok(file.startsWith("package/") && !file.split("/").includes(".."));
  assert.equal(
    hash(execFileSync("tar", ["-xOzf", archive, file])),
    hash(readFileSync(join(consumer, "node_modules/@tempus-date/core", file.slice(8)))),
    file,
  );
}
const entry = join(consumer, "contract-entries.mjs");
writeFileSync(
  entry,
  'export * as sdk from "@tempus-date/core";\nexport * as calendar from "@tempus-date/core/calendar";\n',
);
const { sdk, calendar } = await import(pathToFileURL(entry).href);
const engines = await import(pathToFileURL(resolve(playwrightArg)).href);
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00.000Z" };
const sourceFiles = readdirSync("src", { recursive: true }).filter((name) =>
  /\.(ts|tsx)$/.test(name),
);
const report = {
  status: "running",
  archiveSha256: hash(readFileSync(archive)),
  runs: [],
  sourceHashes: Object.fromEntries(
    sourceFiles.map((name) => [name, hash(readFileSync(join("src", name)))]),
  ),
  scope:
    "Installed public package entries versus production playground. Authored fixed-reference journeys. Chrome uses real clipboard readback after its own writes; Firefox/WebKit capture clipboard writes. Separate ical.js file parsing and exact semantic file comparison, not calendar-client imports, physical devices or independent usability.",
};
const save = (name, data) =>
  writeFileSync(
    join(output, name),
    typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n",
  );
const normalizeFile = (text) =>
  text
    .replace(/\r\n[ \t]/g, "")
    .split(/\r?\n/)
    .filter((line) => !/^(UID|DTSTAMP):/.test(line))
    .join("\n");
try {
  for (const name of ["chromium", "firefox", "webkit"]) {
    const browser = await engines[name].launch(name === "chromium" ? { channel: "chrome" } : {});
    try {
      const page = await browser.newPage({
        timezoneId: context.timezone,
        viewport: { width: 390, height: 950 },
        ...(name === "chromium" ? { permissions: ["clipboard-read", "clipboard-write"] } : {}),
      });
      await page.clock.setFixedTime(new Date(context.reference));
      if (name !== "chromium")
        await page.addInitScript(() => {
          Object.defineProperty(navigator.clipboard, "writeText", {
            value: async (text) => {
              globalThis.copiedText = text;
            },
          });
        });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(baseURL);
      const input = page.locator("#date-expression");
      const activate = async (locator) => {
        await locator.focus();
        await page.keyboard.press("Enter");
      };
      const clipboard = () =>
        page.evaluate(
          (real) => (real ? navigator.clipboard.readText() : globalThis.copiedText),
          name === "chromium",
        );
      const inspect = async () => {
        const details = page
          .locator("details")
          .filter({ has: page.getByText("Developer tools", { exact: true }) });
        if (!(await details.evaluate((el) => el.open)))
          await activate(details.locator("summary").first());
        await activate(
          page.getByRole("button", { name: "Copy parser response JSON", exact: true }),
        );
        return JSON.parse(await clipboard()).interpretation;
      };
      const arithmetic = "What date is 2026-01-31 plus 1 month minus 1 day?";
      const calculated = sdk.parse(arithmetic, context);
      assert.equal(calculated.value.precision, "date");
      assert.deepEqual(
        calculated.value.calculation.steps.map((step) => step.after.iso),
        ["2026-02-28T06:00:00.000Z", "2026-02-27T06:00:00.000Z"],
      );
      await input.fill(arithmetic);
      await page.getByRole("button", { name: "Copy result", exact: true }).waitFor();
      assert.deepEqual(await inspect(), calculated);
      const traceSummary = page.getByText("Show calculation steps", { exact: true });
      if (!(await traceSummary.evaluate((node) => node.parentElement.open)))
        await activate(traceSummary);
      const trace = await page
        .getByRole("list", { name: "Calculation steps", exact: true })
        .innerText();
      for (const step of calculated.value.calculation.steps) assert.ok(trace.includes(step.source));

      const ambiguous = "Call Sam 03/04/2027";
      const first = sdk.parse(ambiguous, context);
      const choice = first.clarification.choices.find((item) => item.id === "2027-03-04");
      const selection = sdk.appendSelection(undefined, {
        contextKey: first.clarification.contextKey,
        id: choice.id,
      });
      const corrected = sdk.parse(ambiguous, { ...context, selection });
      assert.equal(corrected.value.calculation.result.iso, "2027-03-04T06:00:00.000Z");
      assert.equal(corrected.event.text, "Call Sam");
      await input.fill(ambiguous);
      await activate(page.getByRole("button", { name: choice.label, exact: true }));
      assert.deepEqual(await inspect(), corrected);
      await input.fill("Call Sam 04/05/2027");
      await page.locator("#calculation-error").waitFor();
      assert.equal(
        sdk.parse("Call Sam 04/05/2027", { ...context, selection }).status,
        "needs-clarification",
      );

      const phrase = "Call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08";
      const parsed = sdk.parse(phrase, context);
      const question = calendar.prepareCalendar(parsed);
      assert.equal(question.status, "needs-clarification");
      const answer = question.clarification.choices.find(
        (item) => item.id === "recurrence:2026-11-01:start:2026-11-01T07:30:00Z",
      );
      const scheduleSelection = sdk.appendSelection(undefined, {
        contextKey: question.clarification.contextKey,
        id: answer.id,
      });
      const prepared = calendar.prepareCalendar(parsed, {
        selection: scheduleSelection,
        file: {
          uid: "11111111-2222-4333-8444-555555555555",
          stamp: context.reference,
          title: "Call Sam",
        },
      });
      assert.equal(prepared.status, "ready");
      assert.equal(prepared.schedule.occurrences.length, 9);
      assert.equal(prepared.schedule.truncated, false);
      const expectedStarts = [
        "09-13",
        "09-20",
        "09-27",
        "10-04",
        "10-11",
        "10-18",
        "10-25",
        "11-01",
        "11-08",
      ].map((date, index) => `2026-${date}T${index < 7 ? "06" : "07"}:30:00.000Z`);
      assert.deepEqual(
        prepared.schedule.occurrences.map((row) => row.start.result.iso),
        expectedStarts,
      );
      for (const row of prepared.schedule.occurrences)
        assert.equal(row.end.result.timestamp - row.start.result.timestamp, 1800000);
      await input.fill(phrase);
      await activate(page.getByRole("button", { name: answer.label, exact: true }));
      await page.getByRole("button", { name: "Copy all 9 dates", exact: true }).waitFor();
      await page.locator("#schedule-copy-format").selectOption("json");
      const preview = await page.getByRole("region", { name: "Complete copy output" }).innerText();
      const dataset = JSON.parse(preview);
      assert.equal(dataset.input, phrase);
      assert.equal(dataset.reference, context.reference);
      assert.equal(dataset.occurrencesComplete, true);
      assert.deepEqual(dataset.source, parsed.source);
      assert.deepEqual(dataset.event, parsed.event);
      assert.deepEqual(dataset.rule, prepared.schedule.rule);
      assert.deepEqual(dataset.occurrences, prepared.schedule.occurrences);
      await activate(page.getByRole("button", { name: "Copy all 9 dates", exact: true }));
      assert.equal(await clipboard(), preview);
      await activate(page.locator("#calendar-export-toggle"));
      const download = page.getByRole("button", { name: "Download calendar file", exact: true });
      await page.waitForFunction(() =>
        [...document.querySelectorAll("button")].some(
          (el) => el.textContent.trim() === "Download calendar file" && !el.disabled,
        ),
      );
      const pending = page.waitForEvent("download");
      await activate(download);
      await (await pending).saveAs(join(output, `${name}.ics`));
      const actualFile = readFileSync(join(output, `${name}.ics`), "utf8");
      assert.equal(normalizeFile(actualFile), normalizeFile(prepared.file.text));
      const components = new ICAL.Component(ICAL.parse(actualFile)).getAllSubcomponents("vevent");
      const master = components.find((item) => !item.hasProperty("recurrence-id"));
      const event = new ICAL.Event(master, {
        exceptions: components.filter((item) => item !== master),
      });
      const iterator = event.iterator();
      const expanded = [];
      for (let i = 0; i < 10; i++) {
        const next = iterator.next();
        if (!next) break;
        const detail = event.getOccurrenceDetails(next);
        expanded.push(detail.startDate.toJSDate().toISOString());
        assert.equal(detail.endDate.toUnixTime() - detail.startDate.toUnixTime(), 1800);
      }
      assert.deepEqual(expanded, expectedStarts);
      save(`${name}-sdk.ics`, prepared.file.text);
      save(`${name}-dataset.json`, dataset);
      const edited = phrase.replace("1:30am", "1:15am");
      assert.equal(
        calendar.prepareCalendar(sdk.parse(edited, context), { selection: scheduleSelection })
          .status,
        "blocked",
      );
      await input.fill(edited);
      const editedQuestion = calendar.prepareCalendar(sdk.parse(edited, context));
      await page
        .getByRole("group", { name: editedQuestion.clarification.question, exact: true })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Copy all 9 dates", exact: true }).count(),
        0,
      );
      for (const wording of [
        "do not call Sam tomorrow",
        "cancel the meeting tomorrow",
        "What time will it be 2 hours ago?",
        "What time was it minus 2 hours ago?",
        "every so often",
      ]) {
        const unresolved = sdk.parse(wording, context);
        assert.notEqual(unresolved.status, "resolved");
        await input.fill(wording);
        await page.locator("#calculation-error").waitFor();
        assert.equal(
          await page.getByRole("button", { name: "Download calendar file", exact: true }).count(),
          0,
        );
        assert.deepEqual(await inspect(), unresolved);
      }
      assert.deepEqual(errors, []);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      report.runs.push({
        browser: name,
        version: browser.version(),
        status: "passed",
        expectedStarts,
      });
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
  save("report.json", report);
}
console.log(
  JSON.stringify({ status: report.status, runs: report.runs.length, error: report.error }),
);
