import { writeFileSync } from "node:fs";
import {
  timezoneData,
  TIMEZONE_DATA_VERSION,
} from "../../packages/core/dist/date-engine/timezone-data.js";
import {
  timezoneDatabase,
  TimezoneDataUnavailable,
} from "../../packages/core/dist/date-engine/timezone-database.js";

const output = process.argv[2];
if (!output) throw new Error("Pass a new JSON output filename after building the SDK.");
const instants = [
  "1900-01-01",
  "1970-01-01",
  "2026-01-15",
  "2026-07-15",
  "2027-01-15",
  "2030-07-15",
];
const differences = [],
  unsupported = [],
  pinnedUnavailable = [];
let checked = 0;
for (const zone of Object.keys(timezoneData.aliases)) {
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" });
  } catch {
    unsupported.push(zone);
    continue;
  }
  for (const date of instants) {
    const timestamp = Date.parse(`${date}T12:00:00Z`);
    const label = formatter
      .formatToParts(timestamp)
      .find((part) => part.type === "timeZoneName").value;
    const match = /^GMT(?:([+-])(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(label);
    if (!match) throw new Error(`Unexpected offset: ${label}`);
    const host = match[1]
      ? (match[1] === "-" ? -1 : 1) *
        (Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4] ?? 0))
      : 0;
    let pinned;
    try {
      pinned = timezoneDatabase(zone).offsetAt(timestamp / 1000);
    } catch (error) {
      if (!(error instanceof TimezoneDataUnavailable)) throw error;
      pinnedUnavailable.push({ zone, date, reason: error.message });
      continue;
    }
    checked++;
    if (host !== pinned) differences.push({ zone, date, host, pinned });
  }
}
const report = {
  node: process.version,
  icu: process.versions.icu,
  hostTz: process.versions.tz,
  pinnedTz: TIMEZONE_DATA_VERSION,
  instants,
  checked,
  unsupported,
  pinnedUnavailable,
  differences,
  limitations:
    "Authored offset samples on one Node runtime. Not a correctness oracle, transition-boundary test, browser inventory or proof of user value. Pinned data can become stale too.",
};
writeFileSync(output, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(
  JSON.stringify({
    checked,
    unsupported: unsupported.length,
    differences: differences.length,
    pinnedUnavailable: pinnedUnavailable.length,
    hostTz: report.hostTz,
  }),
);
