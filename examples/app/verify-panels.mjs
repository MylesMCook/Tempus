import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ICAL from "ical.js";
import { parse } from "../../packages/core/dist/sdk.js";

const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(playwrightPath && destination, "Provide Playwright and a new output directory.");
const url = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
const output = resolve(destination);
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const reference = "2026-10-15T17:00:00.000Z";
const timezone = "America/Chicago";
const report = [];

async function activate(locator) {
  await locator.focus();
  await locator.press("Enter");
}
async function open(summary) {
  if (!(await summary.locator("..").evaluate((element) => element.open))) await activate(summary);
}
async function fits(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
async function copied(page, button) {
  await page.evaluate(() => (window.__panelCopy = null));
  await activate(button);
  await page.waitForFunction(() => typeof window.__panelCopy === "string");
  // Read only after the successful write initiated by this test.
  const actual = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(actual.replace(/\r\n/g, "\n"), await page.evaluate(() => window.__panelCopy));
  return actual;
}

try {
  for (const width of [320, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      timezoneId: timezone,
      reducedMotion: "reduce",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.clock.install({ time: new Date(reference) });
    await page.clock.setFixedTime(new Date(reference));
    const requests = [];
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/parse") requests.push(request.url());
    });
    await page.goto(url);
    await page.evaluate(() => {
      const write = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async (value) => {
        await write(value);
        window.__panelCopy = value;
      };
    });
    const input = page.locator("#date-expression");
    const typo = "no plus 2 weeks minus 3 days + 5 hours";
    const corrected = typo.replace(/^no/, "now");
    const correctionButton = page.getByRole("button", { name: `Use “${corrected}”`, exact: true });
    await input.fill(typo);
    await correctionButton.waitFor();
    assert.equal(await page.locator("#calculated-date").count(), 0);
    assert.equal(await page.getByRole("button", { name: "Use “no plus”", exact: true }).count(), 0);
    await fits(page);
    await page
      .locator("#calculation-error")
      .screenshot({ path: join(output, `correction-${width}.png`) });
    await activate(correctionButton);
    await page.locator("#calculated-date").waitFor();
    assert.equal(await input.inputValue(), typo);
    await open(page.getByText("Show calculation steps", { exact: true }));
    const debugSummary = page.locator("summary").filter({ hasText: /^Debug calculation$/ });
    await open(debugSummary);
    const debug = debugSummary.locator("..");
    const expected = parse(corrected, { reference, timezone });
    assert.equal(expected.status, "resolved");
    assert.deepEqual(
      JSON.parse(await debug.getByRole("region", { name: "Raw calculation JSON" }).textContent()),
      expected.value.calculation,
    );
    await input.fill(`${typo} `);
    await correctionButton.waitFor();
    assert.equal(await page.locator("#calculated-date").count(), 0);
    await activate(correctionButton);
    await page.clock.setFixedTime(new Date("2026-10-15T18:00:00Z"));
    await activate(page.getByRole("button", { name: "Refresh now", exact: true }));
    await correctionButton.waitFor();
    assert.equal(await page.locator("#calculated-date").count(), 0);
    await input.fill("Dentist appointment tomorrow at noon");
    await page.getByRole("button", { name: "Use “Dentist appointment”", exact: true }).waitFor();
    await page.clock.setFixedTime(new Date(reference));

    const phrase = "jan 31 2026 plus 1 month plus 1 month";
    await input.fill(phrase);
    const interpretation = parse(phrase, { reference, timezone });
    assert.equal(interpretation.status, "resolved");
    const calculation = interpretation.value.calculation;
    await open(page.getByText("Show calculation steps", { exact: true }));
    await open(debugSummary);
    assert.deepEqual(
      JSON.parse(await debug.getByRole("region", { name: "Raw calculation JSON" }).textContent()),
      calculation,
    );
    assert.deepEqual(
      JSON.parse(
        await copied(page, debug.getByRole("button", { name: "Copy debug JSON", exact: true })),
      ),
      calculation,
    );
    await debug.screenshot({ path: join(output, `debug-${width}.png`) });
    await fits(page);

    const developerSummary = page.locator("summary").filter({ hasText: /^Developer tools$/ });
    await open(developerSummary);
    const developer = developerSummary.locator("..");
    await developer.screenshot({ path: join(output, `developer-${width}.png`) });
    const local = page.getByRole("region", { name: "Calculation details", exact: true });
    assert.equal(
      await copied(page, local.getByRole("button", { name: "Copy ISO", exact: true })),
      calculation.result.iso,
    );
    assert.equal(
      await copied(page, local.getByRole("button", { name: "Copy timestamp", exact: true })),
      String(calculation.result.timestamp),
    );
    const parserResponse = JSON.parse(
      await copied(
        page,
        local.getByRole("button", { name: "Copy parser response JSON", exact: true }),
      ),
    );
    assert.deepEqual(parserResponse.interpretation, interpretation);
    assert.equal(parserResponse.reference, reference);
    assert.equal(parserResponse.expression, phrase);
    const api = page.getByRole("region", { name: "Compare with the API", exact: true });
    const requestUrl = new URL(
      await copied(page, api.getByRole("button", { name: "Copy request URL", exact: true })),
    );
    assert.equal(requestUrl.pathname, "/api/parse");
    for (const [name, value] of Object.entries({ expression: phrase, timezone, reference }))
      assert.equal(requestUrl.searchParams.get(name), value);
    assert.equal(requests.length, 0, "Opening panels and copying stays local.");
    const responsePending = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/parse",
    );
    await activate(api.getByRole("button", { name: "Check API result", exact: true }));
    const response = await responsePending;
    assert.equal(response.status(), 200);
    assert.equal((await response.json()).timestamp, calculation.result.timestamp);
    await api.getByText("Same date as your calculator", { exact: true }).waitFor();
    await input.fill("January 30 2026 plus 1 month");
    await api
      .getByText("Inputs changed. Check again for an updated result.", { exact: true })
      .waitFor();
    await page.route("**/api/parse?**", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "Test rate limit" }),
      }),
    );
    await activate(api.getByRole("button", { name: "Check API result", exact: true }));
    await api.getByText("Too many requests. Try again in a minute.", { exact: true }).waitFor();
    await page.unroute("**/api/parse?**");
    await context.setOffline(true);
    await activate(api.getByRole("button", { name: "Check API result", exact: true }));
    await api.getByRole("alert").waitFor();
    await context.setOffline(false);
    await activate(api.getByRole("button", { name: "Check API result", exact: true }));
    await api.getByText("Same date as your calculator", { exact: true }).waitFor();
    await fits(page);

    for (const [name, expression, count, allDay] of [
      ["all-day", phrase, 1, true],
      ["range", "tomorrow from 2pm to 4pm", 1, false],
      ["recurrence", "every Monday at noon for 5 occurrences", 5, false],
    ]) {
      await input.fill(expression);
      await open(page.locator("#calendar-export-toggle"));
      const calendar = page.locator("#calendar-export-toggle").locator("..");
      const download = calendar.getByRole("button", {
        name: "Download calendar file",
        exact: true,
      });
      await page.waitForFunction(() =>
        [...document.querySelectorAll("button")].some(
          (button) => button.textContent.trim() === "Download calendar file" && !button.disabled,
        ),
      );
      await calendar
        .getByRole("textbox", { name: "Event title", exact: true })
        .fill("Panel verification");
      await page.waitForFunction(() =>
        [...document.querySelectorAll("button")].some(
          (button) => button.textContent.trim() === "Download calendar file" && !button.disabled,
        ),
      );
      if (name === "range") {
        assert.ok((await calendar.innerText()).includes("End · not included"));
        assert.equal(
          await api.getByRole("button", { name: "Check API result", exact: true }).count(),
          0,
        );
      }
      await fits(page);
      await calendar.screenshot({ path: join(output, `calendar-${name}-${width}.png`) });
      const pendingDownload = page.waitForEvent("download");
      await activate(download);
      const file = join(output, `${name}-${width}.ics`);
      await (await pendingDownload).saveAs(file);
      const events = new ICAL.Component(ICAL.parse(readFileSync(file, "utf8"))).getAllSubcomponents(
        "vevent",
      );
      assert.equal(events.length, count);
      for (const component of events) {
        const event = new ICAL.Event(component);
        assert.equal(event.summary, "Panel verification");
        assert.equal(event.startDate.isDate, allDay);
        if (name === "all-day") assert.equal(event.startDate.toString(), "2026-03-28");
        if (name === "range")
          assert.equal(event.endDate.toUnixTime() - event.startDate.toUnixTime(), 7200);
      }
      await calendar.getByRole("status").filter({ hasText: "Download requested." }).waitFor();
    }
    report.push({
      width,
      typoConfirmation: "passed",
      exactDebugAndLocalCopies: "passed",
      explicitApiRequest: "passed",
      apiFailureAndRecovery: "passed",
      calendarFiles: "passed",
    });
    await context.close();
  }
  writeFileSync(
    join(output, "report.json"),
    JSON.stringify({ status: "passed", url, report }, null, 2),
  );
  console.log(JSON.stringify({ status: "passed", widths: report.length }));
} finally {
  await browser.close();
}
