import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ICAL from "ical.js";

const [fixture, directory] = process.argv.slice(2);
assert.ok(
  fixture && directory,
  "Provide the historical dtend-duration.ics and a new output directory.",
);
const original = readFileSync(fixture, "utf8");
const hash = (text) => createHash("sha256").update(text).digest("hex");
assert.equal(hash(original), "9dc0d47ea92d4d7c61dfe861ecb14912fab037d28bce5e019b7f79b1c1e90b8e");
mkdirSync(directory);
const expected = [
  ["2026-03-01T07:00:00.000Z", "2026-03-01T09:00:00.000Z"],
  ["2026-03-08T07:00:00.000Z", "2026-03-08T09:00:00.000Z"],
  ["2026-03-15T06:00:00.000Z", "2026-03-15T08:00:00.000Z"],
];
const reports = [];
for (const [name, text] of [
  ["historical", original],
  [
    "with-prodid",
    original.replace(
      "VERSION:2.0\r\n",
      "VERSION:2.0\r\nPRODID:-//Tempus//Duration conformance control//EN\r\n",
    ),
  ],
]) {
  const calendar = new ICAL.Component(ICAL.parse(text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent"));
  const iterator = event.iterator();
  const observed = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    assert.ok(observed.length < 10, "Unexpected expansion size");
    const row = event.getOccurrenceDetails(next);
    observed.push([row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()]);
  }
  writeFileSync(join(directory, `${name}.ics`), text);
  reports.push({
    name,
    sha256: hash(text),
    prodid: calendar.getFirstPropertyValue("prodid"),
    expected,
    observed,
    conforms: JSON.stringify(observed) === JSON.stringify(expected),
  });
}
const report = {
  reader: "ical.js",
  version: JSON.parse(
    readFileSync(new URL("../../node_modules/ical.js/package.json", import.meta.url)),
  ).version,
  source: "https://www.rfc-editor.org/rfc/rfc5545.html#section-3.8.5.3",
  sourceSha256: hash(readFileSync(new URL(import.meta.url))),
  reports,
  scope: "Two versions of one authored duration fixture. Not an exporter or calendar-client test.",
};
writeFileSync(join(directory, "ical-js.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(reports.map(({ name, conforms }) => ({ name, conforms }))));
if (reports.some((report) => !report.conforms)) process.exitCode = 1;
