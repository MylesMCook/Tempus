import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import ICAL from "ical.js";
import { Temporal } from "@js-temporal/polyfill";
import { calendarTimezoneOngoing } from "../../packages/core/dist/calendar-timezone-ongoing.js";

// Diagnostic only: two separately editable series are not a drop-in single-series export.
const output = resolve(process.argv[2] ?? "");
assert.ok(process.argv[2], "Provide a NEW output directory.");
mkdirSync(output);
const report = {
  reader: "ical.js 2.2.1",
  scope: "Two-series monthly clamp, 400 years, noon/30 minutes; no calendar import",
  cases: [],
};
for (const timezone of ["UTC", "America/Chicago"]) {
  for (const day of [29, 30]) {
    const name = `${timezone === "UTC" ? "utc" : "chicago"}-day-${day}`;
    const exceptions = ["2028-02-29", `2027-03-${day}`];
    const expected = [];
    for (let year = 2026; year < 2426; year++) {
      for (let month = 1; month <= 12; month++) {
        const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const date = `${year}-${String(month).padStart(2, "0")}-${Math.min(day, last)}`;
        if (!exceptions.includes(date))
          expected.push(
            Temporal.ZonedDateTime.from(`${date}T12:00:00[${timezone}]`)
              .toInstant()
              .toString({ fractionalSecondDigits: 3 }),
          );
      }
    }
    const compact = (date) => date.replaceAll("-", "") + "T120000";
    const parameter = timezone === "UTC" ? "" : `;TZID=${timezone}`;
    const suffix = timezone === "UTC" ? "Z" : "";
    const series = [
      {
        id: "ordinary",
        start: `2026-01-${day}`,
        rule: `FREQ=MONTHLY;BYMONTH=1,3,4,5,6,7,8,9,10,11,12;BYMONTHDAY=${day}`,
        excluded: exceptions.filter((date) => !date.includes("-02-")),
      },
      {
        id: "february",
        start: "2026-02-28",
        rule: "FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1",
        excluded: exceptions.filter((date) => date.includes("-02-")),
      },
    ];
    const text = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tempus//Split Monthly Diagnostic//EN",
      ...(timezone === "UTC"
        ? []
        : [calendarTimezoneOngoing(timezone, "2026-01-01T00:00:00Z").trimEnd()]),
      ...series.flatMap((series) => [
        "BEGIN:VEVENT",
        `UID:${name}-${series.id}@tempus.invalid`,
        "DTSTAMP:20260101T000000Z",
        `DTSTART${parameter}:${compact(series.start)}${suffix}`,
        "DURATION:PT1800S",
        "SUMMARY:Monthly clamp diagnostic",
        `RRULE:${series.rule}`,
        ...series.excluded.map((date) => `EXDATE${parameter}:${compact(date)}${suffix}`),
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
      "",
    ].join("\r\n");
    writeFileSync(join(output, `${name}.ics`), text);
    writeFileSync(join(output, `${name}.expected.json`), JSON.stringify(expected));
    const entry = {
      name,
      timezone,
      day,
      sha256: createHash("sha256").update(text).digest("hex"),
      expectedCount: expected.length,
    };
    try {
      const calendar = new ICAL.Component(ICAL.parse(text));
      for (const zone of calendar.getAllSubcomponents("vtimezone"))
        ICAL.TimezoneService.register(new ICAL.Timezone(zone));
      const observed = [];
      for (const component of calendar.getAllSubcomponents("vevent")) {
        const event = new ICAL.Event(component),
          iterator = event.iterator();
        for (let n = 0; n < 5000; n++) {
          const next = iterator.next();
          assert.ok(next, "Ongoing series unexpectedly ended");
          const details = event.getOccurrenceDetails(next);
          const instant = details.startDate.toJSDate().toISOString();
          if (instant >= "2426-01-01T00:00:00.000Z") break;
          assert.equal(details.endDate.toUnixTime() - details.startDate.toUnixTime(), 1800);
          observed.push(instant);
          if (n === 4999) throw Error("Expansion did not reach the horizon");
        }
      }
      observed.sort();
      assert.deepEqual(observed, expected);
      Object.assign(entry, {
        status: "passed",
        observedCount: observed.length,
        seriesCount: series.length,
        durationSeconds: 1800,
      });
    } catch (error) {
      Object.assign(entry, { status: "failed", error: String(error).slice(0, 1200) });
    }
    report.cases.push(entry);
  }
}
writeFileSync(join(output, "ical-js.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report));
if (report.cases.some((row) => row.status !== "passed")) process.exitCode = 1;
