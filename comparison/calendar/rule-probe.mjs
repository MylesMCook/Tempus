import ICAL from "ical.js";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Authored 2026 transition fixture, not an unbounded timezone definition.
const text = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VTIMEZONE",
  "TZID:America/Chicago",
  "BEGIN:STANDARD",
  "DTSTART:20251102T020000",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0600",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:20260308T020000",
  "TZOFFSETFROM:-0600",
  "TZOFFSETTO:-0500",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "DTSTART:20261101T020000",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0600",
  "END:STANDARD",
  "END:VTIMEZONE",
  "BEGIN:VEVENT",
  "UID:duration-probe@tempus.invalid",
  "DTSTAMP:20260101T000000Z",
  "DTSTART;TZID=America/Chicago:20260301T010000",
  "DTEND;TZID=America/Chicago:20260301T030000",
  "RRULE:FREQ=WEEKLY;BYDAY=SU;COUNT=3",
  "END:VEVENT",
  "END:VCALENDAR",
  "",
].join("\r\n");
// RFC 5545 3.8.5.3: DTEND gives the same exact duration to every recurrence.
// March 1 01:00–03:00 CST is two hours; March 8 must therefore end at 04:00 CDT.
const expected = [
  ["2026-03-01T07:00:00.000Z", "2026-03-01T09:00:00.000Z"],
  ["2026-03-08T07:00:00.000Z", "2026-03-08T09:00:00.000Z"],
  ["2026-03-15T06:00:00.000Z", "2026-03-15T08:00:00.000Z"],
];
const calendar = new ICAL.Component(ICAL.parse(text));
const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent"));
const iterator = event.iterator();
const observed = [];
for (let next = iterator.next(); next; next = iterator.next()) {
  if (observed.length >= 10) throw new Error("Unexpected unbounded expansion.");
  const row = event.getOccurrenceDetails(next);
  observed.push([row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()]);
}
const conforms = JSON.stringify(observed) === JSON.stringify(expected);
const readerVersion = JSON.parse(
  readFileSync(new URL("../../node_modules/ical.js/package.json", import.meta.url)),
).version;
const report = {
  probe: "dtend-recurrence-exact-duration-v1",
  reader: "ical.js",
  readerVersion,
  node: process.version,
  source: "https://www.rfc-editor.org/rfc/rfc5545.html#section-3.8.5.3",
  fixtureSha256: createHash("sha256").update(text).digest("hex"),
  declaredDurationSeconds: event.duration.toSeconds(),
  expected,
  observed,
  conforms,
  limitations: [
    "One authored rule fixture; not calendar-client import or general reader certification.",
    "This is a diagnostic probe; a nonconforming result is recorded, never counted as an export pass.",
  ],
};
const directory = new URL("../results/calendar/", import.meta.url);
mkdirSync(directory, { recursive: true });
writeFileSync(new URL("dtend-duration.ics", directory), text);
writeFileSync(new URL("rule-probe.json", directory), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
// Opt-in gate for a future release validator; exploratory runs retain evidence without failing unrelated tests.
if (process.argv.includes("--require-conformance") && !conforms) process.exitCode = 1;
