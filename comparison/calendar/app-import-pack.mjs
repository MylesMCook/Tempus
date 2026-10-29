import ICAL from "ical.js";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { parse } from "../../packages/core/dist/sdk.js";
import { prepareCalendar } from "../../packages/core/dist/sdk-calendar.js";

// Builds the files the app downloads today, for a manual calendar-client import check.
// Files only: this script never opens a client, signs in or writes a calendar.
const directory = new URL("../results/calendar/app-import-pack/", import.meta.url);
const context = { reference: "2026-10-29T15:00:00Z", timezone: "America/Chicago" };
// Expected values are written by hand from the date rules, then checked against the file.
const cases = [
  {
    id: "01-start-only",
    phrase: "tomorrow at noon",
    pointMode: "instant",
    expect: "Fri Oct 30, 2026, 12:00 PM CDT. No end time (zero length). Note what the app shows.",
    events: [["2026-10-30T17:00:00Z", "2026-10-30T17:00:00Z"]],
  },
  {
    id: "02-thirty-minutes",
    phrase: "tomorrow at noon",
    pointMode: "instant",
    pointLengthMinutes: 30,
    expect: "Fri Oct 30, 2026, 12:00–12:30 PM CDT.",
    events: [["2026-10-30T17:00:00Z", "2026-10-30T17:30:00Z"]],
  },
  {
    id: "03-hour-across-clock-change",
    phrase: "March 14, 2027 at 1:30am",
    pointMode: "instant",
    pointLengthMinutes: 60,
    expect: "Sun Mar 14, 2027, 1:30 AM CST to 3:30 AM CDT: one elapsed hour.",
    events: [["2027-03-14T07:30:00Z", "2027-03-14T08:30:00Z"]],
  },
  {
    id: "04-timed-range",
    phrase: "November 3, 2026 from 9 am to 11 am",
    expect: "Tue Nov 3, 2026, 9:00–11:00 AM CST.",
    events: [["2026-11-03T15:00:00Z", "2026-11-03T17:00:00Z"]],
  },
  {
    id: "05-all-day-date",
    phrase: "tomorrow",
    pointMode: "date",
    expect: "All day on Fri Oct 30, 2026 only.",
    events: [["2026-10-30", "2026-10-31"]],
  },
  {
    id: "06-all-day-range",
    phrase: "for 3 days from 2026-11-02",
    expect: "All day Mon Nov 2 through Wed Nov 4, 2026 (three days, not Nov 5).",
    events: [["2026-11-02", "2026-11-05"]],
  },
  {
    id: "07-date-list",
    phrase: "November 2, 2026 at noon and November 4, 2026 at noon",
    expect: "Two separate events: Mon Nov 2 and Wed Nov 4, 2026, each at 12:00 PM CST, no end.",
    events: [
      ["2026-11-02T18:00:00Z", "2026-11-02T18:00:00Z"],
      ["2026-11-04T18:00:00Z", "2026-11-04T18:00:00Z"],
    ],
  },
  {
    id: "08-weekly-ongoing",
    phrase: "every Monday at 9am for 30 minutes",
    expect:
      "One repeating series, every Monday 9:00–9:30 AM local time, no end date. Check Nov 2 2026 (CST) and a date after Mar 14 2027 (CDT) both show 9:00 AM.",
    events: [
      ["2026-11-02T15:00:00Z", "2026-11-02T15:30:00Z"],
      ["2026-11-09T15:00:00Z", "2026-11-09T15:30:00Z"],
    ],
  },
  {
    id: "09-weekly-three-times",
    phrase: "every Monday at 9am for 30 minutes for 3 occurrences",
    expect: "Exactly three Mondays: Nov 2, 9 and 16, 2026, 9:00–9:30 AM CST. Nothing after.",
    events: [
      ["2026-11-02T15:00:00Z", "2026-11-02T15:30:00Z"],
      ["2026-11-09T15:00:00Z", "2026-11-09T15:30:00Z"],
      ["2026-11-16T15:00:00Z", "2026-11-16T15:30:00Z"],
    ],
  },
  {
    id: "10-monthly-ongoing",
    phrase: "every month on the first at noon",
    expect: "One repeating series on the 1st of each month at 12:00 PM local time, no end date.",
    events: [
      ["2026-11-01T18:00:00Z", "2026-11-01T18:00:00Z"],
      ["2026-12-01T18:00:00Z", "2026-12-01T18:00:00Z"],
    ],
  },
];

function read(text, count) {
  const component = new ICAL.Component(ICAL.parse(text));
  const values = [];
  for (const vevent of component.getAllSubcomponents("vevent")) {
    const event = new ICAL.Event(vevent);
    const iterator = event.iterator();
    for (let next = iterator.next(); next && values.length < count; next = iterator.next()) {
      const { startDate, endDate } = event.getOccurrenceDetails(next);
      const format = (time) =>
        time.isDate ? time.toString() : time.toJSDate().toISOString().replace(".000", "");
      values.push([format(startDate), format(endDate)]);
    }
  }
  return values;
}

mkdirSync(directory, { recursive: true }); // Deterministic output: rerunning rewrites identical files.
const manifest = {
  context,
  generatedFrom: "packages/core/dist (run pnpm build:sdk first)",
  files: [],
};
for (const [index, item] of cases.entries()) {
  const result = parse(item.phrase, context);
  assert.equal(result.status, "resolved", item.phrase);
  const title = `Tempus test ${item.id}`;
  const prepared = prepareCalendar(result, {
    file: {
      uid: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      stamp: context.reference,
      title,
      ...(item.pointMode ? { pointMode: item.pointMode } : {}),
      ...(item.pointLengthMinutes ? { pointLengthMinutes: item.pointLengthMinutes } : {}),
    },
  });
  assert.equal(prepared.status, "ready", item.phrase);
  assert.ok(prepared.file?.ok, prepared.file?.reason ?? item.phrase);
  const text = prepared.file.text;
  // Independent check with ical.js; known DST reader failures are not exercised by these cases.
  assert.deepEqual(read(text, item.events.length), item.events, item.id);
  const name = `${item.id}.ics`;
  writeFileSync(new URL(name, directory), text);
  manifest.files.push({
    file: name,
    title,
    phrase: item.phrase,
    ...(item.pointLengthMinutes ? { lengthChosenAtDownload: item.pointLengthMinutes } : {}),
    expect: item.expect,
    firstEventsUtc: item.events,
    ongoing: prepared.ongoing,
    sha256: createHash("sha256").update(text).digest("hex"),
  });
}
writeFileSync(new URL("manifest.json", directory), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${cases.length} files to ${directory.pathname}`);
