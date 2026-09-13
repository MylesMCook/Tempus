import ICAL from "ical.js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

assert.equal(process.argv.length, 3, "Usage: node utc-conversion-probe.mjs NEW-OUTPUT");
const output = resolve(process.argv[2]);
mkdirSync(output);
// Deliberately independent of Tempus, Temporal and the bundled timezone database.
// This fixture defines only the 2026 season plus its preceding standard offset.
const text = [
  "BEGIN:VTIMEZONE",
  "TZID:Probe/Seasonal",
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
  "",
].join("\r\n");
const checkpoints = [
  ["2026-01-15T18:00:00Z", "2026-01-15T12:00:00", -21600],
  ["2026-03-08T07:59:59Z", "2026-03-08T01:59:59", -21600],
  ["2026-03-08T08:00:00Z", "2026-03-08T03:00:00", -18000],
  ["2026-03-08T08:00:01Z", "2026-03-08T03:00:01", -18000],
  ["2026-07-15T17:00:00Z", "2026-07-15T12:00:00", -18000],
  ["2026-11-01T06:59:59Z", "2026-11-01T01:59:59", -18000],
  ["2026-11-01T07:00:00Z", "2026-11-01T01:00:00", -21600],
  ["2026-11-01T07:00:01Z", "2026-11-01T01:00:01", -21600],
  ["2026-12-15T18:00:00Z", "2026-12-15T12:00:00", -21600],
];
const zone = new ICAL.Timezone({
  component: new ICAL.Component(ICAL.parse(text)),
  tzid: "Probe/Seasonal",
});
const rows = checkpoints.map(([instant, expected, offset]) => {
  const utc = ICAL.Time.fromDateTimeString(instant);
  const converted = utc.convertToZone(zone);
  const observed = converted.toString();
  return {
    instant,
    expected,
    offset,
    observed,
    matches: expected === observed,
    returnedInstant: converted.toJSDate().toISOString(),
    utcControl: utc.convertToZone(ICAL.Timezone.utcTimezone).toString(),
  };
});
const hash = (data) => createHash("sha256").update(data).digest("hex");
const reader = new URL("../../node_modules/ical.js/", import.meta.url);
const report = {
  probe: "authored-utc-to-local-v1",
  reader: "ical.js",
  version: JSON.parse(readFileSync(new URL("package.json", reader))).version,
  readerSourceSha256: hash(readFileSync(new URL("lib/ical/timezone.js", reader))),
  runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  fixtureSha256: hash(text),
  rows,
  conforms: rows.every((row) => row.matches && row.utcControl === row.instant),
  scope:
    "Nine authored clocks in a single finite timezone fixture. No Tempus generator, calendar-client import, general reader certification or independent-user evaluation.",
};
writeFileSync(join(output, "timezone.ics"), text);
writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify({
    conforms: report.conforms,
    matches: rows.filter((r) => r.matches).length,
    total: rows.length,
  }),
);
if (!report.conforms) process.exitCode = 1;
