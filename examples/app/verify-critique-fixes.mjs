import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [playwrightPath, outputPath] = process.argv.slice(2);
assert.ok(playwrightPath && outputPath);
const engines = await import(pathToFileURL(resolve(playwrightPath)).href);
const url = process.env.TEMPUS_APP_URL ?? "http://127.0.0.1:5175";
assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
const report = {
  scope: "Authored desktop browser checks, not assistive-technology or physical-device evidence.",
  runs: [],
};
for (const name of ["chromium", "firefox", "webkit"]) {
  const browser = await engines[name].launch(name === "chromium" ? { channel: "chrome" } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.goto(url);
    const input = page.locator("#date-expression");
    await input.fill("03/04/2027");
    const choice = page.getByRole("button", { name: "March 4, 2027", exact: true });
    await choice.waitFor();
    assert.equal(await page.locator("#calculation-error").getAttribute("role"), "status");
    assert.equal(await input.getAttribute("aria-invalid"), "false");
    await choice.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.id), "calculated-date");
    await page.getByText("Change timezone or format", { exact: true }).click();
    await page.locator("#date-format").selectOption("custom");
    const format = page.locator("#custom-format");
    await format.fill("yyyy-MM-dd INVALID");
    await page.locator("#custom-format-error").waitFor();
    assert.match(await format.getAttribute("aria-describedby"), /custom-format-error/);
    assert.equal(
      await page.getByRole("button", { name: "Copy result", exact: true }).isEnabled(),
      false,
    );
    assert.equal(await input.inputValue(), "03/04/2027");
    await format.fill("yyyy-MM-dd");
    assert.equal(await page.locator("#custom-format-error").count(), 0);
    assert.equal(
      await page.getByRole("button", { name: "Copy result", exact: true }).isEnabled(),
      true,
    );
    assert.equal(await input.inputValue(), "03/04/2027");
    await input.fill("tomorrow plus bananas");
    await page.locator("#calculation-error").waitFor();
    assert.equal(await page.locator("#calculation-error").getAttribute("role"), "alert");
    assert.equal(await input.getAttribute("aria-invalid"), "true");
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    report.runs.push({
      name,
      version: browser.version(),
      clarification: "passed",
      keyboardFocus: "passed",
      formatCorrection: "passed",
      unsupportedInput: "passed",
    });
  } finally {
    await browser.close();
  }
}
writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(report));
