import ICAL from "ical.js";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

// Diagnostic files only. This script never opens a client or writes a calendar.
const directory = new URL("../results/calendar/client-import-pack/", import.meta.url);
const controlPath = new URL("./chicago-policy-control.ics", import.meta.url);
const timezone = readFileSync(controlPath, "utf8").trim().split(/\r?\n/);
const zone = "Tempus/Chicago-control";
const exact = [
  ["2026-03-01T07:00:00.000Z", "2026-03-01T09:00:00.000Z"],
  ["2026-03-08T07:00:00.000Z", "2026-03-08T09:00:00.000Z"],
  ["2026-03-15T06:00:00.000Z", "2026-03-15T08:00:00.000Z"],
];
const cases = [
  {
    id: "utc-control",
    title: "Tempus test - exact UTC control",
    expected: exact,
    properties: [
      "DTSTART:20260301T070000Z",
      "DTEND:20260301T090000Z",
      "RDATE:20260301T070000Z,20260308T070000Z,20260315T060000Z",
    ],
    reason:
      "Explicit UTC starts and two-hour duration; baseline for inspecting imported instants. RDATE repeats DTSTART intentionally: this reader otherwise omits the initial value during iteration.",
  },
  {
    id: "dtend-duration",
    title: "Tempus test - two elapsed hours",
    expected: exact,
    properties: [
      `DTSTART;TZID=${zone}:20260301T010000`,
      `DTEND;TZID=${zone}:20260301T030000`,
      "RRULE:FREQ=WEEKLY;BYDAY=SU;COUNT=3",
    ],
    reason:
      "RFC 5545 3.8.5.3: DTEND preserves the master's exact two-hour duration. March 8 ends at 04:00 CDT.",
  },
  {
    id: "repeat-first",
    title: "Tempus test - first repeated clock",
    expected: [
      "2026-10-25T06:30:00.000Z",
      "2026-11-01T06:30:00.000Z",
      "2026-11-08T07:30:00.000Z",
    ].map((date) => [date, date]),
    properties: [`DTSTART;TZID=${zone}:20261025T013000`, "RRULE:FREQ=WEEKLY;BYDAY=SU;COUNT=3"],
    reason: "RFC 5545 3.3.5: the repeated November 1 clock means the first 01:30, at UTC-05:00.",
  },
  {
    id: "gap-offset",
    title: "Tempus test - pre-gap offset",
    expected: [
      "2026-03-01T08:30:00.000Z",
      "2026-03-08T08:30:00.000Z",
      "2026-03-15T07:30:00.000Z",
    ].map((date) => [date, date]),
    properties: [`DTSTART;TZID=${zone}:20260301T023000`, "RRULE:FREQ=WEEKLY;BYDAY=SU;COUNT=3"],
    reason:
      "RFC 5545 verified erratum 4271 and 3.3.5: generated March 8 02:30 uses the pre-gap offset, yielding 08:30Z (03:30 CDT).",
  },
];
mkdirSync(directory, { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const records = cases.map((entry) => {
  const uid = `tempus-client-diagnostic-v2-${entry.id}@tempus.invalid`;
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tempus//Client diagnostic v2//EN",
    ...(entry.id === "utc-control" ? [] : timezone),
    "BEGIN:VEVENT",
    `UID:${uid}`,
    "DTSTAMP:20260101T000000Z",
    `SUMMARY:${entry.title}`,
    ...entry.properties,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  assert(!/^(?:BEGIN:VALARM|ATTENDEE|ORGANIZER|URL|ATTACH|METHOD)[:;]/m.test(text));
  assert(text.split("\r\n").every((line) => Buffer.byteLength(line) <= 75));
  ICAL.TimezoneService.reset();
  const calendar = new ICAL.Component(ICAL.parse(text));
  for (const component of calendar.getAllSubcomponents("vtimezone"))
    ICAL.TimezoneService.register(new ICAL.Timezone(component));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent"));
  const iterator = event.iterator();
  const observed = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    if (observed.length >= 4) throw new Error("Diagnostic did not terminate at three occurrences");
    const row = event.getOccurrenceDetails(next);
    observed.push([row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()]);
  }
  assert.equal(observed.length, 3, JSON.stringify({ id: entry.id, observed }));
  writeFileSync(new URL(`${entry.id}.ics`, directory), text);
  return {
    ...entry,
    uid,
    file: `${entry.id}.ics`,
    sha256: hash(text),
    bytes: Buffer.byteLength(text),
    observed,
    fileReaderMatches: JSON.stringify(observed) === JSON.stringify(entry.expected),
    clientImport: "not-run",
  };
});
assert(records[0].fileReaderMatches, "Exact UTC control must pass before the pack is usable");
const report = {
  version: 2,
  generatorSha256: hash(readFileSync(new URL(import.meta.url))),
  timezoneSha256: hash(readFileSync(controlPath)),
  reader: "ical.js",
  readerVersion: JSON.parse(
    readFileSync(new URL("../../node_modules/ical.js/package.json", import.meta.url)),
  ).version,
  node: process.version,
  records,
  clientResults: null,
  authorization: "No import authorized",
  purpose: "Finite client diagnostics, not production export or an unbounded-rule guarantee",
};
writeFileSync(new URL("manifest.json", directory), JSON.stringify(report, null, 2) + "\n");
writeFileSync(
  new URL("REVIEW.md", directory),
  [
    "# Calendar-client diagnostic pack",
    "",
    "Not imported. Four synthetic series, three expected occurrences each. No alarms, attendees, organizer, attachments, remote URLs or scheduling METHOD. Client defaults may still add notifications; inspect them before any approved import.",
    "",
    "These deliberately finite diagnostic files isolate UTC handling, exact duration, repeated clocks and missing clocks. They do not truncate a user schedule or change the product contract. The timezone is an authored modern-US control, not the app's pinned provider.",
    "",
    "| File | Expected UTC intervals | File-reader match |",
    "| --- | --- | --- |",
    ...records.map(
      (r) =>
        `| ${r.file} | ${r.expected.map(([a, b]) => (a === b ? a : `${a} to ${b}`)).join("; ")} | ${r.fileReaderMatches} |`,
    ),
    "",
    ...records.map((r) => `- **${r.file}:** ${r.reason}`),
    "",
    "The two point cases omit an end. Equal endpoints in the manifest mean unspecified duration; record any duration the client invents separately.",
    "",
    "After explicit authorization, use a named disposable local calendar and import each file once. Record client/OS versions, displayed timezone, imported UIDs, all starts/ends, recurrence count, missing/extra instances, default alarms and whether the series remains one editable series. Check March 1/8/15/22 and October 25/November 1/8, 2026. A file-reader match is not a client-import result. Do not import into an existing personal or shared calendar.",
    "",
    "Record original observations before judging pass/fail. Keep the exact file hashes from manifest.json. If the UTC control fails, resolve import/timezone inspection first. If a DST case differs, compare against the separately retained reader output; do not rewrite expectations to match the client. Cleanup requires separate authorization unless included in the import approval.",
    "",
    "Semantics: [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545), sections 3.3.5, 3.3.10 and 3.8.5.3, with [verified erratum 4271](https://www.rfc-editor.org/errata/eid4271). Version 1 incorrectly expected generated missing clocks to be skipped; its unchanged evidence is retained in ../history/before-erratum-4271/. No client compatibility or Tempus accuracy claim follows from this pack.",
    "",
  ].join("\n"),
);
console.log(
  JSON.stringify({
    files: records.length,
    totalBytes: records.reduce((n, r) => n + r.bytes, 0),
    fileReaderMatches: records.filter((r) => r.fileReaderMatches).map((r) => r.id),
    clientImport: "not-run",
  }),
);
