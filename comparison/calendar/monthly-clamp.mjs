import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import ICAL from "ical.js";

// Diagnostic candidates only. No application export is enabled by this probe.
const directory = process.argv[2];
if (!directory) throw new Error("Provide a new output directory.");
const output = resolve(directory);
mkdirSync(output, { recursive: false });
const candidates = [29, 30].flatMap((day) => [
  {
    name: `day-${day}-setpos`,
    day,
    rule: `FREQ=MONTHLY;BYMONTHDAY=${Array.from({ length: day - 27 }, (_, i) => 28 + i).join(",")};BYSETPOS=-1`,
  },
  {
    name: `day-${day}-rscale`,
    day,
    rule: `RSCALE=GREGORIAN;FREQ=MONTHLY;BYMONTHDAY=${day};SKIP=BACKWARD`,
  },
]);
candidates.push({ name: "day-31-last-day", day: 31, rule: "FREQ=MONTHLY;BYMONTHDAY=-1" });
const report = {
  reader: "ical.js 2.2.1",
  node: process.version,
  scope: "UTC file expansion, 2026–2425; not a calendar-client import",
  cases: [],
};
for (const candidate of candidates) {
  const expected = [];
  for (let year = 2026; year < 2426; year++) {
    for (let month = 1; month <= 12; month++) {
      const day = Math.min(candidate.day, new Date(Date.UTC(year, month, 0)).getUTCDate());
      expected.push(new Date(Date.UTC(year, month - 1, day, 12)).toISOString());
    }
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tempus//Monthly Rule Probe//EN",
    "BEGIN:VEVENT",
    `UID:${candidate.name}@tempus.invalid`,
    "DTSTAMP:20260101T000000Z",
    `DTSTART:202601${candidate.day}T120000Z`,
    "SUMMARY:Monthly rule probe",
    `RRULE:${candidate.rule}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const text = lines.map((line) => line.match(/.{1,70}/g).join("\r\n ")).join("\r\n") + "\r\n";
  writeFileSync(join(output, `${candidate.name}.ics`), text);
  writeFileSync(join(output, `${candidate.name}.expected.json`), JSON.stringify(expected));
  const entry = {
    ...candidate,
    sha256: createHash("sha256").update(text).digest("hex"),
    expectedCount: expected.length,
  };
  try {
    const event = new ICAL.Event(
      new ICAL.Component(ICAL.parse(text)).getFirstSubcomponent("vevent"),
    );
    const iterator = event.iterator(),
      observed = [];
    for (let index = 0; index < expected.length; index++) {
      const next = iterator.next();
      if (!next) break;
      observed.push(next.toJSDate().toISOString());
    }
    const mismatch = expected.findIndex((instant, i) => instant !== observed[i]);
    Object.assign(entry, {
      status: mismatch === -1 ? "passed" : "failed",
      observedCount: observed.length,
      firstMismatch:
        mismatch === -1
          ? null
          : { index: mismatch, expected: expected[mismatch], observed: observed[mismatch] ?? null },
    });
  } catch (error) {
    Object.assign(entry, { status: "failed", error: String(error) });
  }
  report.cases.push(entry);
}
writeFileSync(join(output, "ical-js.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report));
if (report.cases.some((row) => row.status !== "passed")) process.exitCode = 1;
