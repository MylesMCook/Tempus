import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import ICAL from "ical.js";
import { calculateDate } from "../../packages/core/dist/sdk.js";

if (!process.argv[2] || !process.argv[3] || process.argv[3].startsWith("--"))
  throw new Error("Supply the captured tzurl directory and the matching IANA tzdata archive.");
const directory = resolve(process.argv[2]);
const archive = resolve(process.argv[3]);
const readArchive = (path) => execFileSync("tar", ["-xOzf", archive, path], { encoding: "utf8" });
const revision = readArchive("version").trim();
if (!/^\d{4}[a-z]+$/.test(revision)) throw new Error("Unexpected IANA version.");
const links = new Map(
  [...readArchive("backward").matchAll(/^Link\s+(\S+)\s+(\S+)/gm)].map(([, target, alias]) => [
    alias,
    target,
  ]),
);
const canonical = (timezone) => {
  const visited = new Set();
  while (links.has(timezone)) {
    if (visited.has(timezone)) throw new Error("Cyclic IANA link.");
    visited.add(timezone);
    timezone = links.get(timezone);
  }
  return timezone;
};
const samples = [
  ["America/Chicago", "2046-07-01T12:00:00", "2046-07-01T17:00:00.000Z"],
  ["America/Chicago", "2046-12-01T12:00:00", "2046-12-01T18:00:00.000Z"],
  ["Asia/Almaty", "2026-09-12T12:00:00", "2026-09-12T07:00:00.000Z"],
  ["America/Yellowknife", "2026-12-01T12:00:00", "2026-12-01T18:00:00.000Z"],
];
const records = samples.map(([timezone, wallClock, expected]) => {
  const bytes = readFileSync(join(directory, timezone.replace("/", "-") + ".ics"));
  const calendar = new ICAL.Component(ICAL.parse(bytes.toString()));
  const zone = calendar.getFirstSubcomponent("vtimezone");
  const componentTimezone = zone?.getFirstPropertyValue("tzid");
  const prodid = calendar.getFirstPropertyValue("prodid");
  if (componentTimezone !== canonical(timezone) || !String(prodid).includes(`Olson ${revision}//`))
    return {
      timezone,
      componentTimezone,
      sourceRejected: "Component identity or revision differs from the selected IANA release.",
      agreesWithParser: false,
      matchesExpected: false,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  const value = ICAL.Time.fromDateTimeString(wallClock);
  value.zone = new ICAL.Timezone({ component: zone, tzid: timezone });
  const observed = value.toJSDate().toISOString();
  const runtime = calculateDate(wallClock.replace("T", " at "), {
    timezone,
    componentTimezone,
    verifiedAliasTarget: canonical(timezone),
    reference: "2026-09-12T16:00:00Z",
  });
  return {
    timezone,
    wallClock,
    expected,
    observed,
    matchesExpected: observed === expected,
    runtimeInstant: runtime.ok ? runtime.result.iso : runtime.error,
    agreesWithParser: runtime.ok && observed === runtime.result.iso,
    source: "https://www.tzurl.org/zoneinfo/" + timezone,
    prodid,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
});
const report = {
  node: process.version,
  icu: process.versions.icu,
  runtimeTzdata: process.versions.tz,
  iana: {
    revision,
    archive,
    sha256: createHash("sha256").update(readFileSync(archive)).digest("hex"),
  },
  records,
  limitations: [
    "Four inspected development samples, not full timezone-data validation.",
    "Future results use the captured rules; they do not predict future legislation.",
    "A parser/data mismatch is an open consistency defect, not an export pass.",
  ],
};
const out = new URL("../results/calendar/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("timezone-source.json", out), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (
  process.argv.includes("--require-parser-agreement") &&
  records.some((row) => !row.agreesWithParser || !row.matchesExpected)
)
  process.exitCode = 1;
