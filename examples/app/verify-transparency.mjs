import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "../../packages/core/dist/sdk.js";

const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(playwrightPath && destination, "Provide Playwright entry and a new output directory.");
const url = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
const output = resolve(destination);
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const reference = "2026-10-15T17:00:00.000Z";
const report = [];
const timestamp = (date) => `${date.local.replace("T", " ").replace(/\.000$/, "")} ${date.offset}`;
async function verifyPanelCopy(page, debug) {
  const copy = debug.getByRole("button", { name: "Copy debug JSON", exact: true });
  await copy.focus();
  await page.keyboard.press("Enter");
  await debug.getByText("Debug JSON copied.", { exact: true }).waitFor();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const rendered = await debug
    .getByRole("region", { name: "Raw calculation JSON", exact: true })
    .textContent();
  assert.deepEqual(JSON.parse(copied), JSON.parse(rendered));
  assert.equal(copied.replace(/\r\n/g, "\n"), rendered);
}
try {
  for (const width of [320, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      timezoneId: "America/Chicago",
      reducedMotion: "reduce",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.clock.install({ time: new Date(reference) });
    await page.clock.setFixedTime(new Date(reference));
    await page.goto(url);
    for (const [expression, elapsed] of [
      ["today plus 2 weeks minus 3 days", null],
      ["January 31 2026 plus 1 month plus 1 month", "671 hours"],
      ["March 7 2026 at noon plus 1 day", "23 hours"],
      ["March 7 2026 at noon plus 24 hours", "24 hours"],
      ["October 31 2026 at noon plus 1 day", "25 hours"],
      ["March 8 2026 at noon minus 1 day", "-23 hours"],
      ["March 7 2026 at noon plus 23.5005 hours", "23 hours 30 minutes 1 second 800 milliseconds"],
      ["January 1 2026 plus 0.5 months", null],
      [`today plus ${"0".repeat(100)}1 milliseconds`, null],
      ["September 14 2026", null],
      ["friday next week", null],
      ["next friday", null],
      ["today", null],
      ["today at midnight", null],
      ["now", null],
    ]) {
      const interpretation = parse(expression, { timezone: "America/Chicago", reference });
      assert.equal(interpretation.status, "resolved");
      assert.equal(interpretation.value.kind, "point");
      const calculation = interpretation.value.calculation;
      await page.locator("#date-expression").fill(expression);
      const summary = page.getByText("Show calculation steps", { exact: true });
      await summary.waitFor();
      const trace = summary.locator("..");
      assert.equal(await trace.getAttribute("open"), null, "Steps start closed.");
      if (expression === "today plus 2 weeks minus 3 days") {
        const directDebug = page.locator("summary").filter({ hasText: /^Debug calculation$/ });
        assert.equal(await directDebug.isVisible(), false, "Debug is behind the steps disclosure.");
      }
      await summary.focus();
      await page.keyboard.press("Enter");
      const ladder = trace.getByRole("list", { name: "Calculation steps", exact: true });
      const checkpoints = trace.locator("time[datetime]");
      assert.deepEqual(
        await checkpoints.evaluateAll((elements) =>
          elements.map((element) => element.getAttribute("datetime")),
        ),
        [
          calculation.reference,
          calculation.anchor.iso,
          ...calculation.steps.map((step) => step.after.iso),
        ],
      );
      const ladderText = await ladder.innerText();
      if (interpretation.value.precision === "date") assert.ok(!ladderText.includes("12:00 AM"));
      if (expression === "today at midnight") assert.ok(ladderText.includes("12:00 AM CDT"));
      assert.ok(!ladderText.includes("From "));
      assert.ok(!ladderText.includes("To "));
      if (calculation.steps.length) assert.match(ladderText, /result/i);
      const debugSummary = page.locator("summary").filter({ hasText: /^Debug calculation$/ });
      const debug = debugSummary.locator("..");
      assert.equal(await debug.getAttribute("open"), null, "Debug starts closed.");
      assert.equal(await trace.locator("details").count(), 1, "Debug is nested inside steps.");
      await debugSummary.focus();
      await page.keyboard.press("Enter");
      const text = `${await trace.innerText()}\n${await debug.innerText()}`;
      assert.deepEqual(
        JSON.parse(
          await debug
            .getByRole("region", { name: "Raw calculation JSON", exact: true })
            .textContent(),
        ),
        calculation,
      );
      assert.equal(
        (await debug.getByRole("status").textContent())?.trim(),
        "",
        "New calculations clear copy feedback.",
      );
      if (expression === "today plus 2 weeks minus 3 days") {
        const copyDebug = debug.getByRole("button", { name: "Copy debug JSON", exact: true });
        await copyDebug.waitFor({ timeout: 2000 });
        await page.evaluate(() => {
          const write = navigator.clipboard.writeText.bind(navigator.clipboard);
          let deny = true;
          navigator.clipboard.writeText = (value) => {
            window.__debugCopyValue = value;
            if (deny) {
              deny = false;
              return Promise.reject(new DOMException("Test denial", "NotAllowedError"));
            }
            return write(value);
          };
        });
        await copyDebug.focus();
        await page.keyboard.press("Enter");
        await debug
          .getByText("Copy was blocked. Select the JSON below and copy it manually.", {
            exact: true,
          })
          .waitFor();
        await copyDebug.focus();
        await page.keyboard.press("Enter");
        await debug.getByText("Debug JSON copied.", { exact: true }).waitFor();
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        assert.deepEqual(JSON.parse(copied), calculation);
        const renderedJson = await debug
          .getByRole("region", { name: "Raw calculation JSON", exact: true })
          .textContent();
        assert.equal(await page.evaluate(() => window.__debugCopyValue), renderedJson);
        // Windows clipboard readback uses CRLF; the write argument above must match exactly.
        assert.equal(copied.replace(/\r\n/g, "\n"), renderedJson);
      }
      const snapshots = debug
        .getByText("Epoch milliseconds", { exact: true })
        .locator("..")
        .locator("..");
      const expectedSnapshots = [
        calculation.anchor,
        ...calculation.steps.flatMap((step) => [step.before, step.after]),
        calculation.result,
      ];
      assert.equal(await snapshots.count(), expectedSnapshots.length);
      for (const [index, snapshot] of expectedSnapshots.entries()) {
        assert.ok(snapshot.iso.endsWith("Z"));
        assert.ok(calculation.reference.endsWith("Z"));
        const fields = await snapshots.nth(index).innerText();
        for (const value of [
          timestamp(snapshot),
          snapshot.iso,
          String(snapshot.timestamp),
          snapshot.offset,
        ])
          assert.ok(fields.includes(value));
        const offsetLines = await snapshots
          .nth(index)
          .getByText(`Local time (${calculation.timezone})`, { exact: true })
          .locator("..")
          .locator("dd")
          .evaluate((element) => {
            const range = document.createRange();
            const length = element.textContent.length;
            range.setStart(element.firstChild, length - 6);
            range.setEnd(element.firstChild, length);
            return range.getClientRects().length;
          });
        assert.equal(offsetLines, 1, "Keep the exact UTC offset on one line.");
      }
      const debugSummaryText = await debug.locator("dl").first().innerText();
      if (calculation.warnings.length)
        for (const warning of calculation.warnings) assert.ok(debugSummaryText.includes(warning));
      else assert.ok(debugSummaryText.includes("None"));
      assert.ok(text.includes("Reference time:"));
      assert.ok(
        (await trace.locator(":scope > div > p").innerText()).includes(calculation.timezone),
      );
      const resultRow = ladder.locator(":scope > li").last();
      if (interpretation.value.precision === "date") {
        assert.ok(
          (await resultRow.innerText()).includes("Date only; no time of day was requested."),
        );
      }
      assert.ok(!ladderText.includes("Date from your phrase"));
      assert.ok(text.includes("Reference used: Oct 15, 2026 12:00:00.000 -05:00"));
      assert.ok(text.includes(calculation.normalized));
      assert.equal(await debug.getByRole("heading", { name: "Read as", exact: true }).count(), 1);
      assert.equal(await trace.getByRole("list", { name: "Recognized parts" }).count(), 0);
      assert.ok(text.includes(timestamp(calculation.anchor)));
      for (const step of calculation.steps) {
        assert.ok(text.includes(timestamp(step.before)));
        assert.ok(text.includes(timestamp(step.after)));
        for (const detail of step.details.filter((value) => !value.startsWith("Calendar change,")))
          assert.ok(text.includes(detail));
      }
      if (elapsed) assert.ok(text.includes(`Elapsed: ${elapsed}`), expression);
      else assert.ok(!text.includes("Elapsed:"), expression);
      if (elapsed) {
        const index = calculation.steps.findIndex(
          (step) => step.before.offset !== step.after.offset,
        );
        const stepGroup = debug
          .getByText(`Step ${index + 1}`, { exact: true })
          .locator("..")
          .locator("..");
        assert.ok((await stepGroup.innerText()).includes(`Elapsed time: ${elapsed}`));
      }
      if (!calculation.steps.length)
        assert.ok((await debug.innerText()).includes("No adjustments recorded."));
      if (expression.includes("plus 1 month plus 1 month")) {
        assert.ok(text.includes("Clamped."));
        assert.ok(text.includes("Starts from step 1's result: Feb 28, 2026."));
        assert.ok(text.includes("2026-03-28"));
      }
      if (calculation.warnings.length) {
        const note = ladder.getByRole("note");
        assert.ok((await note.innerText()).includes("Approximated."));
        for (const warning of calculation.warnings) assert.ok(text.includes(warning));
      }
      if (expression.includes("0".repeat(100))) {
        const jsonRegion = debug.getByRole("region", { name: "Raw calculation JSON", exact: true });
        await jsonRegion.focus();
        assert.ok(await jsonRegion.evaluate((element) => document.activeElement === element));
        await jsonRegion.press("ArrowRight");
        await page.waitForFunction(() => document.activeElement.scrollLeft > 0);
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      const screenshotName =
        expression === "today plus 2 weeks minus 3 days"
          ? "normal"
          : expression === "January 31 2026 plus 1 month plus 1 month"
            ? "clamp"
            : expression === "March 7 2026 at noon plus 1 day"
              ? "clock-change"
              : expression === "friday next week"
                ? "weekday-selection"
                : null;
      if (expression === "friday next week") {
        assert.ok(
          (await trace.innerText()).indexOf("Thu, Oct 15, 2026") <
            (await trace.innerText()).indexOf("Fri, Oct 23, 2026"),
        );
        assert.ok(!ladderText.includes("Select the date"));
        assert.ok(!ladderText.includes("Start at midnight"));
        assert.ok(text.includes("Weeks start on Monday"));
        assert.ok(!ladderText.includes("Starting date"));
      }
      if (screenshotName) {
        await debugSummary.click();
        await trace.screenshot({ path: join(output, `${screenshotName}-${width}.png`) });
        await debugSummary.click();
      }
      if (screenshotName === "normal") {
        await debug.screenshot({ path: join(output, `debug-${width}.png`) });
        await summary.focus();
        await page.keyboard.press("Enter");
        assert.equal(await trace.getAttribute("open"), null);
        assert.equal(await debugSummary.isVisible(), false, "Closing steps hides debug.");
        await summary.focus();
        await page.keyboard.press("Enter");
        assert.equal(await debugSummary.isVisible(), true);
      }
      report.push({
        width,
        expression,
        elapsed,
        exactEndpoints: "passed",
        keyboardDisclosure: "passed",
      });
    }
    await page.clock.setFixedTime(new Date("2026-11-01T06:30:00Z"));
    await page.locator("#date-expression").fill("now plus 1 hour");
    const foldSummary = page.getByText("Show calculation steps", { exact: true });
    await foldSummary.focus();
    await page.keyboard.press("Enter");
    const foldTrace = foldSummary.locator("..");
    const foldLadder = foldTrace.getByRole("list", { name: "Calculation steps", exact: true });
    assert.match(await foldLadder.innerText(), /1:30 AM CDT/);
    assert.match(await foldLadder.innerText(), /1:30 AM CST/);
    assert.match(await foldLadder.innerText(), /Elapsed: 1 hour/);
    await page
      .locator("summary")
      .filter({ hasText: /^Debug calculation$/ })
      .click();
    const foldText = await page
      .locator("summary")
      .filter({ hasText: /^Debug calculation$/ })
      .locator("..")
      .innerText();
    assert.ok(foldText.includes("2026-11-01 01:30:00 -05:00"));
    assert.ok(foldText.includes("2026-11-01 01:30:00 -06:00"));
    report.push({
      width,
      expression: "now plus 1 hour",
      reference: "2026-11-01T06:30:00Z",
      repeatedHour: "passed",
    });
    await page.clock.setFixedTime(new Date(reference));
    await page.locator("#date-expression").fill("tomorrow from 2pm to 4pm");
    await page.getByText("How this range was calculated", { exact: true }).click();
    const summaries = page.getByText("Show calculation steps", { exact: true });
    assert.equal(await summaries.count(), 2);
    const ids = [];
    for (let index = 0; index < 2; index++) {
      await summaries.nth(index).focus();
      await page.keyboard.press("Enter");
      const trace = summaries.nth(index).locator("..");
      assert.ok((await trace.innerText()).includes("Reference time"));
      const debugSummary = page
        .locator("summary")
        .filter({ hasText: /^Debug calculation$/ })
        .nth(index);
      ids.push(await debugSummary.getAttribute("id"));
      await debugSummary.focus();
      await page.keyboard.press("Enter");
      assert.ok((await debugSummary.locator("..").innerText()).includes("Epoch milliseconds"));
      await verifyPanelCopy(page, debugSummary.locator(".."));
    }
    assert.ok(ids.every(Boolean));
    assert.equal(new Set(ids).size, 2);
    await page.locator("#date-expression").fill("every Monday at noon for 5 occurrences");
    await page.getByText("How these dates were calculated", { exact: true }).click();
    const occurrenceSteps = page.getByText("Show calculation steps", { exact: true }).first();
    await occurrenceSteps.focus();
    await page.keyboard.press("Enter");
    assert.ok((await occurrenceSteps.locator("..").innerText()).includes("Reference time"));
    const occurrenceDebug = page
      .locator("summary")
      .filter({ hasText: /^Debug calculation$/ })
      .first();
    await occurrenceDebug.focus();
    await page.keyboard.press("Enter");
    assert.ok((await occurrenceDebug.locator("..").innerText()).includes("Epoch milliseconds"));
    await verifyPanelCopy(page, occurrenceDebug.locator(".."));
    await context.close();
  }
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const context = await browser.newContext({
      reducedMotion,
      viewport: { width: 1280, height: 950 },
    });
    const page = await context.newPage();
    await page.goto(url);
    await page.locator("#date-expression").fill("today plus 2 weeks minus 3 days");
    const summary = page.getByText("Show calculation steps", { exact: true });
    const trace = summary.locator("..");
    const body = trace.locator(":scope > div");
    for (let repeat = 0; repeat < 3; repeat++) {
      await summary.focus();
      await page.keyboard.press(repeat === 1 ? "Space" : "Enter");
      await page.waitForFunction(() =>
        document.querySelector(".group\\/trace")?.classList.contains("is-opening"),
      );
      assert.ok(await body.isVisible());
      const style = await body.evaluate((element) => {
        const style = getComputedStyle(element);
        return { animation: style.animationName, duration: style.animationDuration };
      });
      const chevron = await summary.locator("svg").evaluate((element) => {
        const style = getComputedStyle(element);
        return { duration: style.transitionDuration, property: style.transitionProperty };
      });
      assert.equal(style.animation, reducedMotion === "reduce" ? "none" : "t-trace-reveal");
      if (reducedMotion === "no-preference") {
        assert.equal(style.duration, "0.16s");
        assert.equal(chevron.duration, "0.15s");
      } else assert.equal(chevron.property, "none");
      if (repeat === 0) {
        const debugSummary = trace.locator("summary").filter({ hasText: /^Debug calculation$/ });
        await debugSummary.press("Enter");
        const debugBody = debugSummary.locator("..").locator(":scope > section");
        await page.waitForFunction(() =>
          document.querySelector(".group\\/debug")?.classList.contains("is-opening"),
        );
        const debugMotion = await debugBody.evaluate((element) => {
          const style = getComputedStyle(element);
          return { animation: style.animationName, duration: style.animationDuration };
        });
        assert.equal(debugMotion.animation, reducedMotion === "reduce" ? "none" : "t-trace-reveal");
        if (reducedMotion === "no-preference") assert.equal(debugMotion.duration, "0.16s");
      }
      if (repeat > 0) {
        const debugSummary = trace.locator("summary").filter({ hasText: /^Debug calculation$/ });
        assert.notEqual(await debugSummary.locator("..").getAttribute("open"), null);
        assert.ok(await debugSummary.locator("..").locator(":scope > section").isVisible());
      }
      await body.evaluate(async (element) => {
        await Promise.all(
          element
            .getAnimations({ subtree: true })
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      const settled = await body.evaluate((element) => ({
        opacity: getComputedStyle(element).opacity,
        transform: getComputedStyle(element).transform,
      }));
      assert.deepEqual(settled, { opacity: "1", transform: "none" });
      await summary.press("Enter");
      assert.equal(await trace.getAttribute("open"), null);
      assert.equal(await body.isVisible(), false);
    }
    await page.waitForFunction(
      () => !document.querySelector(".group\\/trace")?.classList.contains("is-opening"),
    );
    const immediateAnimation = await summary.evaluate((element) => {
      element.click();
      const body = element.parentElement.querySelector(":scope > div");
      return getComputedStyle(body).animationName;
    });
    assert.equal(immediateAnimation, reducedMotion === "reduce" ? "none" : "t-trace-reveal");
    await summary.press("Enter");
    report.push({ reducedMotion, repeatedKeyboardDisclosure: "passed", motion: "passed" });
    await context.close();
  }
  writeFileSync(
    join(output, "report.json"),
    JSON.stringify({ status: "passed", url, report }, null, 2),
  );
  console.log(JSON.stringify({ status: "passed", cases: report.length }));
} finally {
  await browser.close();
}
