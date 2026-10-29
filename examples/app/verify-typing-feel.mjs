import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const [playwrightPath, destination] = process.argv.slice(2);
assert.ok(playwrightPath && destination, "Provide Playwright entry and a new output directory.");
const output = resolve(destination);
mkdirSync(output);
const appUrl = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5174";
const { chromium } = await import(pathToFileURL(resolve(playwrightPath)).href);
const browser = await chromium.launch({ channel: "chrome" });
const report = [];

// What the answer pane shows, whether an animation is still running inside it, and where the
// settings row below it sits.
const observe = (page) =>
  page.evaluate(() => {
    const input = document.getElementById("date-expression");
    const pane = input.closest("section[aria-label='Date calculator']").children[1];
    const kind = document.getElementById("calculated-date")
      ? "result"
      : document.getElementById("calculation-error")
        ? "message"
        : "other";
    const animating = document
      .getAnimations()
      .some((a) => a.playState === "running" && pane.contains(a.effect?.target ?? null));
    return {
      kind,
      animating,
      settingsTop: document.getElementById("timezone-settings").getBoundingClientRect().top,
    };
  });

async function open(options) {
  const context = await browser.newContext({ timezoneId: "America/Chicago", ...options });
  const page = await context.newPage();
  await page.goto(appUrl);
  await page.waitForFunction(() => !document.getElementById("date-expression").disabled);
  return { context, page, input: page.locator("#date-expression") };
}

async function typeSlowly(page, input, phrase) {
  await input.click();
  const steps = [];
  for (const key of phrase) {
    await input.press(key === " " ? "Space" : key);
    await page.waitForTimeout(120);
    steps.push({ value: await input.inputValue(), ...(await observe(page)) });
  }
  return steps;
}

try {
  for (const width of [320, 1280]) {
    const { context, page, input } = await open({ viewport: { width, height: 900 } });
    const steps = await typeSlowly(page, input, "today plus 2 weeks");

    // The pane settles while typing: no animation replays when the kind of answer stays the same.
    const replayed = steps.filter(
      (step, i) => i > 0 && steps[i - 1].kind === step.kind && step.animating,
    );
    assert.deepEqual(
      replayed.map((step) => step.value),
      [],
      `${width}px: pane re-animates while typing`,
    );

    // Rows below the pane move less than 90px per keystroke.
    const jumps = steps
      .slice(1)
      .map((step, i) => Math.abs(step.settingsTop - steps[i].settingsTop));
    assert.ok(Math.max(...jumps) < 90, `${width}px: settings row jumped ${Math.max(...jumps)}px`);

    // A phrase that is not understood stays quiet while typing, then turns into an alert.
    await input.fill("");
    await typeSlowly(page, input, "tomorrow plus bananas");
    const error = page.locator("#calculation-error");
    assert.equal(await input.getAttribute("aria-invalid"), "false", "quiet while typing");
    assert.equal(await error.getAttribute("role"), null, "no alert while typing");
    await page.waitForFunction(
      () => document.getElementById("date-expression").getAttribute("aria-invalid") === "true",
      null,
      { timeout: 1500 },
    );
    assert.equal(await error.getAttribute("role"), "alert");

    // Leaving the field shows the error straight away.
    await input.press("x");
    assert.equal(await input.getAttribute("aria-invalid"), "false");
    await input.blur();
    assert.equal(
      await input.getAttribute("aria-invalid"),
      "true",
      "error shown on leaving the field",
    );
    assert.equal(await error.getAttribute("role"), "alert");

    // Clicking an example keeps the page still and the caret in the field.
    await input.fill("");
    const chip = page
      .getByRole("group", { name: "Try a phrase", exact: true })
      .getByRole("button", { name: "2 weeks after dec 25", exact: true });
    await chip.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => scrollY);
    await chip.click();
    await page.locator("#calculated-date").waitFor();
    await page.waitForTimeout(500);
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - scrollBefore) <= 2,
      "page stayed put",
    );
    assert.deepEqual(
      await input.evaluate((el) => [
        el === document.activeElement,
        el.selectionStart,
        el.value.length,
      ]),
      [true, 20, 20],
    );
    await page.screenshot({ path: join(output, `example-${width}.png`) });
    report.push({ width, typing: steps.length, maxJump: Math.max(...jumps), example: "still" });
    await context.close();
  }

  // On a touch phone, tapping an example neither scrolls nor opens the keyboard.
  {
    const { context, page, input } = await open({
      viewport: { width: 390, height: 664 },
      isMobile: true,
      hasTouch: true,
    });
    const chip = page
      .getByRole("group", { name: "Try a phrase", exact: true })
      .getByRole("button", { name: "2 weeks after dec 25", exact: true });
    await chip.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => scrollY);
    await chip.tap();
    await page.locator("#calculated-date").waitFor();
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ({
      scrollY,
      focused: document.activeElement?.id ?? null,
      resultTop: document.querySelector("#calculated-date h2").getBoundingClientRect().top,
    }));
    assert.equal(await input.inputValue(), "2 weeks after dec 25");
    assert.ok(
      Math.abs(after.scrollY - scrollBefore) <= 2,
      `touch tap scrolled ${scrollBefore}->${after.scrollY}`,
    );
    assert.notEqual(after.focused, "date-expression", "touch tap opens the keyboard");
    assert.ok(after.resultTop >= 0 && after.resultTop < 664, "result is on screen");
    await page.screenshot({ path: join(output, "example-touch-390.png") });
    report.push({ width: 390, touch: true, example: "still, no keyboard" });
    await context.close();
  }

  // Reduced motion: no animation in the pane at any point.
  {
    const { context, page, input } = await open({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    const steps = await typeSlowly(page, input, "today plus 2 weeks");
    assert.deepEqual(
      steps.filter((step) => step.animating).map((step) => step.value),
      [],
    );
    report.push({ width: 1280, reducedMotion: true, animations: 0 });
    await context.close();
  }

  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
