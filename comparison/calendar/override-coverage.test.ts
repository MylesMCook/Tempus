import { it, expect } from "vite-plus/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { intervalOverrides } from "./interval-overrides";

const context = {
  timezone: "America/Chicago",
  first: "2026-03-01T06:00:00Z",
  through: "9999-12-31T23:59:59Z",
  weekdays: [7],
  durationMilliseconds: 4 * 3600_000,
  exceptions: ["2026-03-08"],
};
it("enumerates every supported-year Sunday interval crossing modern Chicago transitions", () => {
  const started = performance.now();
  const result = intervalOverrides(context);
  const elapsedMilliseconds = performance.now() - started;
  // Independent modern US transition-date construction, not the timezone reader.
  const expectedDates: string[] = [];
  for (let year = 2026; year <= 9999; year++) {
    for (const [month, ordinal] of [
      [3, 2],
      [11, 1],
    ]) {
      const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
      const day = 1 + ((7 - firstWeekday) % 7) + (ordinal - 1) * 7;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (!context.exceptions.includes(date)) expectedDates.push(date);
    }
  }
  expect(result.rows.map((row) => row.local.slice(0, 10))).toEqual(expectedDates);
  expect(
    result.rows.every(
      (row) => Date.parse(row.end) - Date.parse(row.start) === context.durationMilliseconds,
    ),
  ).toBe(true);
  expect(result.rows.at(-1)?.local.slice(0, 4)).toBe("9999");
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.000Z$/, "Z");
  const zone = readFileSync(
    "comparison/results/calendar/ongoing-timezones/America_Chicago.ics",
    "utf8",
  ).trimEnd();
  const uid = "full-coverage@tempus.invalid";
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tempus//Coverage candidate//EN",
    zone,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    "DTSTAMP:20260101T000000Z",
    "SUMMARY:call Sam",
    "DTSTART;TZID=America/Chicago:20260301T000000",
    "DURATION:PT4H",
    "RRULE:FREQ=WEEKLY;BYDAY=SU",
    "EXDATE;TZID=America/Chicago:20260308T000000",
    "END:VEVENT",
    ...result.rows.flatMap((row) => [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      "DTSTAMP:20260101T000000Z",
      "SUMMARY:call Sam",
      `RECURRENCE-ID;TZID=America/Chicago:${stamp(row.local)}`,
      `DTSTART:${stamp(row.start)}`,
      `DTEND:${stamp(row.end)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const directory = "comparison/results/calendar/override-coverage";
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/chicago.ics`, text);
  writeFileSync(
    `${directory}/report.json`,
    JSON.stringify(
      {
        scope:
          "Development candidate through four-digit-year support; not enabled export or calendar-client import",
        context,
        overrides: result.rows.length,
        examined: result.examined,
        elapsedMilliseconds,
        fileBytes: Buffer.byteLength(text),
        fileSha256: createHash("sha256").update(text).digest("hex"),
        sourceHashes: Object.fromEntries(
          [
            "comparison/calendar/interval-overrides.ts",
            "comparison/calendar/override-coverage.test.ts",
            "comparison/results/calendar/ongoing-timezones/America_Chicago.ics",
          ].map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]),
        ),
        first: result.rows[0],
        last: result.rows.at(-1),
        node: process.version,
      },
      null,
      2,
    ) + "\n",
  );
}, 20_000);
it("includes overlapping earlier occurrences instead of checking only the nearest start", () => {
  const result = intervalOverrides({
    ...context,
    first: "2026-02-15T06:00:00Z",
    through: "2026-03-09T00:00:00Z",
    durationMilliseconds: 15 * 86400_000,
    exceptions: [],
  });
  expect(result.rows.map((row) => row.local.slice(0, 10))).toEqual([
    "2026-02-22",
    "2026-03-01",
    "2026-03-08",
  ]);
});
