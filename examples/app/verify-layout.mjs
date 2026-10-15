import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(playwrightPath && destination, "Provide Playwright entry and a new output directory.");
const output = resolve(destination);
mkdirSync(output);
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = [];
try {
  for (const width of [320, 390, 768, 1054, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      timezoneId: "America/Chicago",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:5174");
    const input = page.locator("#date-expression");
    await input.waitFor();
    await page.waitForFunction(() => !document.getElementById("date-expression").disabled);
    const examples = page.getByRole("group", { name: "Try a phrase", exact: true });
    await examples.getByRole("button").first().waitFor();
    const inputBox = await input.boundingBox();
    const examplesBox = await examples.boundingBox();
    const settings = page.locator("#timezone-settings");
    const settingsBox = await settings.boundingBox();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    if (width >= 1024) {
      assert.ok(examplesBox.x > inputBox.x + inputBox.width, "Output is beside the input.");
      assert.ok(
        settingsBox.x < examplesBox.x && settingsBox.y > inputBox.y,
        "Settings stay on the left.",
      );
    } else {
      assert.ok(examplesBox.y >= inputBox.y + inputBox.height, "Output stacks below input.");
      assert.ok(
        settingsBox.y > examplesBox.y + examplesBox.height,
        "Mobile settings follow output.",
      );
    }
    await page.screenshot({ path: join(output, `empty-${width}.png`), fullPage: true });
    await examples.getByRole("button").first().click();
    await page.locator("#calculated-date").waitFor();
    assert.equal(await examples.count(), 0);
    assert.equal(await input.evaluate((el) => el === document.activeElement), true);
    for (const [state, phrase, target] of [
      ["point", "2026-01-31 plus 1 month minus 1 day", "#calculated-date"],
      ["interval", "tomorrow from 2pm to 4pm", "[aria-label='Calculated interval']"],
      ["recurrence", "every Monday at noon for 5 occurrences", "[aria-label='Recurring schedule']"],
      ["clarification", "03/04/2027", "#calculation-error"],
      ["error", "tomorrow plus bananas", "#calculation-error"],
    ]) {
      await input.fill(phrase);
      await page.locator(target).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${state} fits ${width}px`,
      );
      if (state === "clarification") {
        await page.getByRole("button", { name: "March 4, 2027", exact: true }).click();
        assert.equal(await page.evaluate(() => document.activeElement.id), "calculated-date");
      }
      if (state === "point")
        await page.screenshot({ path: join(output, `result-${width}.png`), fullPage: true });
    }
    report.push({
      width,
      layout: "passed",
      states: "point, interval, recurrence, clarification, error",
      overflow: false,
    });
    await context.close();
  }
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
