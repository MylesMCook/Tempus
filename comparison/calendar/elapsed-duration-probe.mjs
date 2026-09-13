// Development candidate only: no app export policy or calendar write is enabled.
import { calendarTimezoneOngoing } from "../../packages/core/dist/calendar-timezone-ongoing.js";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const directory = process.argv[2];
if (!directory) throw new Error("Provide a new output directory.");
mkdirSync(directory, { recursive: false });
const original = calendarTimezoneOngoing("America/Chicago", "2026-03-01T06:00:00Z");
const timezone = original.replaceAll("America/Chicago", "Tempus/Chicago-control");
const text = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Tempus//Elapsed duration candidate//EN",
  timezone.trimEnd(),
  "BEGIN:VEVENT",
  "UID:tempus-elapsed-ongoing-candidate@tempus.invalid",
  "DTSTAMP:20260101T000000Z",
  "SUMMARY:Elapsed duration diagnostic",
  "DTSTART;TZID=Tempus/Chicago-control:20260301T000000",
  "DURATION:PT14400S",
  "RRULE:FREQ=WEEKLY;BYDAY=SU",
  "EXDATE;TZID=Tempus/Chicago-control:20261108T000000",
  "END:VEVENT",
  "END:VCALENDAR",
  "",
].join("\r\n");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
writeFileSync(resolve(directory, "candidate.ics"), text);
writeFileSync(resolve(directory, "timezone.ics"), original);
writeFileSync(
  resolve(directory, "manifest.json"),
  JSON.stringify(
    {
      fileSha256: hash(text),
      originalTimezoneSha256: hash(original),
      generatorSha256: hash(readFileSync(new URL(import.meta.url))),
      moduleSha256: hash(
        readFileSync(
          new URL("../../packages/core/dist/calendar-timezone-ongoing.js", import.meta.url),
        ),
      ),
      bytes: Buffer.byteLength(text),
      durationSeconds: 14400,
      scope:
        "Unbounded weekly local midnight, four elapsed hours, one explicit exclusion; pinned timezone with opaque TZID to prohibit host substitution; development candidate only",
    },
    null,
    2,
  ) + "\n",
);
