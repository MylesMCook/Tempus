import ICAL from "ical.js";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Authored standards expectations plus separately identified app/browser files.
// Point expectations use equal endpoints for comparison, without adding a duration.
const cases = [
  {
    id: "chicago-repeat-first",
    timezone: "America/Chicago",
    start: "20261025T013000",
    weekday: "SU",
    expected: [
      ["2026-10-25T06:30:00.000Z", "2026-10-25T06:30:00.000Z"],
      ["2026-11-01T06:30:00.000Z", "2026-11-01T06:30:00.000Z"],
      ["2026-11-08T07:30:00.000Z", "2026-11-08T07:30:00.000Z"],
    ],
    policy: "RFC 5545 section 3.3.5: first occurrence of a repeated local time",
  },
  {
    id: "chicago-gap-offset-generated",
    timezone: "America/Chicago",
    start: "20260301T023000",
    weekday: "SU",
    expected: [
      ["2026-03-01T08:30:00.000Z", "2026-03-01T08:30:00.000Z"],
      ["2026-03-08T08:30:00.000Z", "2026-03-08T08:30:00.000Z"],
      ["2026-03-15T07:30:00.000Z", "2026-03-15T07:30:00.000Z"],
    ],
    policy:
      "RFC 5545 verified erratum 4271 and section 3.3.5: generated missing clocks use the pre-gap offset",
  },
  {
    id: "chicago-gap-explicit-start",
    timezone: "America/Chicago",
    start: "20260308T023000",
    weekday: "SU",
    expected: [
      ["2026-03-08T08:30:00.000Z", "2026-03-08T08:30:00.000Z"],
      ["2026-03-15T07:30:00.000Z", "2026-03-15T07:30:00.000Z"],
      ["2026-03-22T07:30:00.000Z", "2026-03-22T07:30:00.000Z"],
    ],
    policy: "RFC 5545 section 3.3.5: explicit nonexistent DTSTART uses the pre-gap offset",
  },
  {
    id: "app-chicago-workday",
    timezone: "America/Chicago",
    file: "comparison/results/calendar/unbounded-zoned-workday.ics",
    expected: [
      ["2026-10-26T14:00:00.000Z", "2026-10-26T22:00:00.000Z"],
      ["2026-11-09T15:00:00.000Z", "2026-11-09T23:00:00.000Z"],
      ["2026-11-16T15:00:00.000Z", "2026-11-16T23:00:00.000Z"],
    ],
  },
  {
    id: "app-chicago-point",
    timezone: "America/Chicago",
    file: "comparison/results/calendar/unbounded-zoned-point-chicago.ics",
    expected: [
      ["2026-10-26T17:00:00.000Z", "2026-10-26T17:00:00.000Z"],
      ["2026-11-09T18:00:00.000Z", "2026-11-09T18:00:00.000Z"],
      ["2026-11-16T18:00:00.000Z", "2026-11-16T18:00:00.000Z"],
    ],
  },
  {
    id: "chicago-noon-exclusion",
    timezone: "America/Chicago",
    start: "20260302T120000",
    duration: "PT1H",
    weekday: "MO",
    exclusion: "20260309T120000",
    expected: [
      ["2026-03-02T18:00:00.000Z", "2026-03-02T19:00:00.000Z"],
      ["2026-03-16T17:00:00.000Z", "2026-03-16T18:00:00.000Z"],
      ["2026-03-23T17:00:00.000Z", "2026-03-23T18:00:00.000Z"],
    ],
  },
  {
    id: "chicago-elapsed-duration",
    timezone: "America/Chicago",
    start: "20260301T010000",
    duration: "PT2H",
    weekday: "SU",
    expected: [
      ["2026-03-01T07:00:00.000Z", "2026-03-01T09:00:00.000Z"],
      ["2026-03-08T07:00:00.000Z", "2026-03-08T09:00:00.000Z"],
      ["2026-03-15T06:00:00.000Z", "2026-03-15T08:00:00.000Z"],
    ],
  },
  {
    id: "casablanca-noon",
    timezone: "Africa/Casablanca",
    start: "20260208T120000",
    duration: "PT1H",
    weekday: "SU",
    expected: [
      ["2026-02-08T11:00:00.000Z", "2026-02-08T12:00:00.000Z"],
      ["2026-02-15T12:00:00.000Z", "2026-02-15T13:00:00.000Z"],
      ["2026-02-22T12:00:00.000Z", "2026-02-22T13:00:00.000Z"],
    ],
  },
];
// Explicit transition exceptions are a candidate repair, not an enabled policy.
cases.push({
  ...cases.find((entry) => entry.id === "chicago-repeat-first"),
  id: "chicago-repeat-first-explicit",
  policy:
    "Rejected repair proposal: EXDATE plus UTC RDATE; desired first-clock output conflicts with exclusion precedence",
  exclusion: "20261101T013000",
  inclusion: "20261101T063000Z",
});
cases.push({
  ...cases.find((entry) => entry.id === "chicago-gap-offset-generated"),
  id: "chicago-gap-skip-explicit",
  policy:
    "Explicit EXDATE omits March 8; this is a chosen exclusion, not the default missing-clock rule",
  expected: [
    ["2026-03-01T08:30:00.000Z", "2026-03-01T08:30:00.000Z"],
    ["2026-03-15T07:30:00.000Z", "2026-03-15T07:30:00.000Z"],
    ["2026-03-22T07:30:00.000Z", "2026-03-22T07:30:00.000Z"],
  ],
  exclusion: "20260308T023000",
});
cases.push({
  ...cases.find((entry) => entry.id === "chicago-repeat-first"),
  id: "chicago-repeat-first-override",
  override: { local: "20261101T013000", instant: "20261101T063000Z" },
});
cases.push({
  ...cases.find((entry) => entry.id === "chicago-repeat-first"),
  id: "chicago-repeat-second-override",
  override: { local: "20261101T013000", instant: "20261101T073000Z" },
  expected: [
    ["2026-10-25T06:30:00.000Z", "2026-10-25T06:30:00.000Z"],
    ["2026-11-01T07:30:00.000Z", "2026-11-01T07:30:00.000Z"],
    ["2026-11-08T07:30:00.000Z", "2026-11-08T07:30:00.000Z"],
  ],
  policy: "Candidate explicit choice: second occurrence of the repeated clock",
});
cases.push({
  ...cases.find((entry) => entry.id === "chicago-gap-offset-generated"),
  id: "chicago-gap-later-override",
  override: { local: "20260308T023000", instant: "20260308T083000Z" },
  expected: [
    ["2026-03-01T08:30:00.000Z", "2026-03-01T08:30:00.000Z"],
    ["2026-03-08T08:30:00.000Z", "2026-03-08T08:30:00.000Z"],
    ["2026-03-15T07:30:00.000Z", "2026-03-15T07:30:00.000Z"],
  ],
  policy: "Candidate explicit choice: shift the missing 2:30 AM forward to 3:30 AM",
});
cases.push({
  ...cases.find((entry) => entry.id === "chicago-elapsed-duration"),
  id: "chicago-elapsed-duration-override",
  override: { local: "20260308T010000", instant: "20260308T070000Z", end: "20260308T090000Z" },
  policy: "Candidate explicit endpoints preserve two elapsed hours across spring DST",
});
// Independent, minimal current-US-rule definition: no generated timezone bytes.
for (const entry of cases.slice(0, 3)) {
  cases.push({
    ...entry,
    id: `${entry.id}-control`,
    timezone: "Tempus/Chicago-control",
    timezoneFile: "comparison/calendar/chicago-policy-control.ics",
  });
}
const browserIndex = process.argv.indexOf("--browser-point");
if (browserIndex >= 0) {
  const file = process.argv[browserIndex + 1];
  if (!file || file.startsWith("--")) throw new Error("A captured Chicago point file is required.");
  cases.push({
    ...cases.find((entry) => entry.id === "app-chicago-point"),
    id: "browser-chicago-point",
    file,
  });
}
const workdayIndex = process.argv.indexOf("--browser-workday");
if (workdayIndex >= 0) {
  const file = process.argv[workdayIndex + 1];
  if (!file || file.startsWith("--"))
    throw new Error("A captured Chicago workday file is required.");
  cases.push({
    ...cases.find((entry) => entry.id === "app-chicago-workday"),
    id: "browser-chicago-workday",
    file,
  });
}
const directory = "comparison/results/calendar/ongoing-events";
mkdirSync(directory, { recursive: true });
const records = cases.map((entry) => {
  const zoneFile =
    entry.timezoneFile ??
    `comparison/results/calendar/ongoing-timezones/${entry.timezone.replaceAll("/", "_")}.ics`;
  const zone = readFileSync(zoneFile, "utf8");
  const text = entry.file
    ? readFileSync(entry.file, "utf8")
    : [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Tempus//Development probe//EN",
        zone.trimEnd(),
        "BEGIN:VEVENT",
        `UID:${entry.id}@tempus.invalid`,
        "DTSTAMP:20260101T000000Z",
        "SUMMARY:call Sam",
        `DTSTART;TZID=${entry.timezone}:${entry.start}`,
        ...(entry.duration ? [`DURATION:${entry.duration}`] : []),
        `RRULE:FREQ=WEEKLY;BYDAY=${entry.weekday}`,
        ...(entry.exclusion ? [`EXDATE;TZID=${entry.timezone}:${entry.exclusion}`] : []),
        ...(entry.inclusion ? [`RDATE:${entry.inclusion}`] : []),
        "END:VEVENT",
        ...(entry.override
          ? [
              "BEGIN:VEVENT",
              `UID:${entry.id}@tempus.invalid`,
              "DTSTAMP:20260101T000000Z",
              "SUMMARY:call Sam",
              `RECURRENCE-ID;TZID=${entry.timezone}:${entry.override.local}`,
              `DTSTART:${entry.override.instant}`,
              ...(entry.override.end ? [`DTEND:${entry.override.end}`] : []),
              "END:VEVENT",
            ]
          : []),
        "END:VCALENDAR",
        "",
      ].join("\r\n");
  const components = new ICAL.Component(ICAL.parse(text)).getAllSubcomponents("vevent");
  const master = components.find((component) => !component.hasProperty("recurrence-id"));
  const event = new ICAL.Event(master, {
    exceptions: components
      .filter((component) => component !== master)
      .map((component) => new ICAL.Event(component)),
  });
  const iterator = event.iterator();
  const observed = entry.expected.map(() => {
    const next = iterator.next();
    if (!next) throw new Error("Ongoing rule stopped early.");
    const row = event.getOccurrenceDetails(next);
    return [row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()];
  });
  writeFileSync(`${directory}/${entry.id}.ics`, text);
  return {
    ...entry,
    fileSha256: createHash("sha256").update(text).digest("hex"),
    timezoneSha256: createHash("sha256")
      .update(text.match(/BEGIN:VTIMEZONE[\s\S]*?END:VTIMEZONE\r\n/)[0])
      .digest("hex"),
    observed,
    passed: JSON.stringify(observed) === JSON.stringify(entry.expected),
  };
});
const report = {
  semanticsRevision: "RFC 5545 with verified erratum 4271",
  scope:
    "First three expected occurrences of authored standards candidates and separately identified saved app/browser files; no calendar import",
  node: process.version,
  reader: JSON.parse(readFileSync("node_modules/ical.js/package.json")).version,
  scriptSha256: createHash("sha256")
    .update(readFileSync(new URL(import.meta.url)))
    .digest("hex"),
  records,
};
writeFileSync(`${directory}/report.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(records.map(({ id, passed }) => ({ id, passed }))));
if (process.argv.includes("--require-conformance") && records.some((row) => !row.passed))
  process.exitCode = 1;
