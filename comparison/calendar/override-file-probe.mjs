import ICAL from "ical.js";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const directory = "comparison/results/calendar/override-coverage";
const bytes = readFileSync(`${directory}/chicago.ics`);
const manifest = JSON.parse(readFileSync(`${directory}/report.json`));
assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.fileSha256);
const started = performance.now();
const components = new ICAL.Component(ICAL.parse(bytes.toString())).getAllSubcomponents("vevent");
const master = components.find((component) => !component.hasProperty("recurrence-id"));
const event = new ICAL.Event(master, {
  exceptions: components
    .filter((component) => component !== master)
    .map((component) => new ICAL.Event(component)),
});
const iterator = event.iterator();
const end = Date.parse("9999-12-31T23:59:59Z");
let count = 0;
let expectedCivil = Date.parse("2026-03-01T00:00:00Z");
const samples = [];
for (let next = iterator.next(); next; next = iterator.next()) {
  if (next.year > 9999) break;
  if (new Date(expectedCivil).toISOString().startsWith("2026-03-08"))
    expectedCivil += 7 * 86400_000;
  const civil = new Date(expectedCivil);
  assert(expectedCivil <= end, "Unexpected extra occurrence");
  const year = civil.getUTCFullYear();
  const secondSundayMarch = 1 + ((7 - new Date(Date.UTC(year, 2, 1)).getUTCDay()) % 7) + 7;
  const firstSundayNovember = 1 + ((7 - new Date(Date.UTC(year, 10, 1)).getUTCDay()) % 7);
  // Midnight precedes that Sunday's 2 AM change in both seasons.
  const daylight =
    expectedCivil > Date.UTC(year, 2, secondSundayMarch) &&
    expectedCivil <= Date.UTC(year, 10, firstSundayNovember);
  const expectedStart = expectedCivil + (daylight ? 5 : 6) * 3600_000;
  const row = event.getOccurrenceDetails(next);
  assert.equal(row.startDate.toJSDate().getTime(), expectedStart);
  assert.equal(row.endDate.toJSDate().getTime(), expectedStart + 4 * 3600_000);
  if (year === 9999 || count < 3)
    samples.push([row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()]);
  expectedCivil += 7 * 86400_000;
  count++;
  if (count > 500_000) throw Error("Unexpected occurrence limit");
}
assert(expectedCivil > end, "Series stopped early");
writeFileSync(
  `${directory}/ical-reader.json`,
  JSON.stringify(
    {
      scope:
        "Every supported-year occurrence in the actual candidate file, independently specified modern Chicago midnight rule",
      fileSha256: manifest.fileSha256,
      reader: "ical.js 2.2.1",
      count,
      elapsedMilliseconds: performance.now() - started,
      samples,
      calendarImport: false,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ count, elapsedMilliseconds: performance.now() - started }));
