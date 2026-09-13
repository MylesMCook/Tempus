import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const [playwrightEntry, reportPath] = process.argv.slice(2);
assert.ok(
  playwrightEntry && reportPath,
  "Usage: node verify-webkit-controls.mjs PLAYWRIGHT-ENTRY NEW-REPORT",
);
const { webkit } = await import(pathToFileURL(resolve(playwrightEntry)).href);
import { writeFileSync } from "node:fs";
const browser = await webkit.launch();
const report = { browser: browser.version(), runs: [] };
try {
  for (const key of ["Tab", "Alt+Tab"]) {
    const page = await browser.newPage();
    await page.setContent(
      '<label for="input">Text</label><input id="input"><button id="first">First</button><button id="second">Second</button><a id="link" href="#input">Link</a>',
    );
    const steps = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(key);
      steps.push(
        await page.evaluate(() => ({
          id: document.activeElement.id,
          tag: document.activeElement.tagName,
          focused: document.hasFocus(),
        })),
      );
    }
    report.runs.push({ key, steps });
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(report));
