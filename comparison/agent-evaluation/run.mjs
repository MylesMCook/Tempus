import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const [casesArg, consumerArg, outputArg] = process.argv.slice(2);
if (process.argv.length !== 5)
  throw new Error("Usage: node run.mjs CASES.json INSTALLED-CONSUMER NEW-OUTPUT");
const casesPath = resolve(casesArg),
  consumer = resolve(consumerArg),
  output = resolve(outputArg);
const bytes = readFileSync(casesPath);
const cases = JSON.parse(bytes);
if (
  !Array.isArray(cases) ||
  cases.length > 100 ||
  new Set(cases.map((c) => c.id)).size !== cases.length ||
  cases.some((c) => typeof c.id !== "string" || typeof c.input !== "string" || c.input.length > 200)
)
  throw new Error("Expected up to 100 uniquely identified short cases.");
const hash = (b) => createHash("sha256").update(b).digest("hex");
const entries = {
  tempus: join(consumer, "node_modules/@tempus-date/core/dist/sdk.js"),
  calendar: join(consumer, "node_modules/@tempus-date/core/dist/sdk-calendar.js"),
  gpuTime: join(consumer, "node_modules/gpu-time/dist/index.js"),
};
mkdirSync(output); // Preserve previous runs.
writeFileSync(join(output, "cases.json"), bytes);
const context = { reference: "2026-09-13T15:00:00Z", timezone: "America/Chicago" };
const identity = {
  context,
  casesSha256: hash(bytes),
  node: process.version,
  harnessSha256: hash(readFileSync(new URL(import.meta.url))),
  entries: Object.fromEntries(
    Object.entries(entries).map(([name, path]) => [
      name,
      { path, sha256: hash(readFileSync(path)) },
    ]),
  ),
  consumerLockSha256: hash(readFileSync(join(consumer, "pnpm-lock.yaml"))),
};
writeFileSync(join(output, "identity.json"), JSON.stringify(identity, null, 2) + "\n");
globalThis.fetch = () => {
  throw new Error("Network fetch is disabled in this local evaluation.");
};
const { parse } = await import(pathToFileURL(entries.tempus));
const { prepareCalendar } = await import(pathToFileURL(entries.calendar));
const { defineParser } = await import(pathToFileURL(entries.gpuTime));
const competitor = await defineParser({ backend: "cpu" });
const rows = [];
try {
  for (const item of cases) {
    const row = { id: item.id, input: item.input };
    try {
      row.tempus = parse(item.input, context);
      if (row.tempus.status === "resolved") row.preparation = prepareCalendar(row.tempus);
    } catch (error) {
      row.tempusError = String(error);
    }
    try {
      row.gpuTime = await competitor.parse(item.input, {
        reference: context.reference,
        timeZone: context.timezone,
        limit: 3,
      });
    } catch (error) {
      row.gpuTimeError = String(error);
    }
    rows.push(row);
  }
} finally {
  competitor.dispose();
}
writeFileSync(
  join(output, "results.json"),
  JSON.stringify(
    {
      scope:
        "Synthetic diagnostic run, not human evidence or a competitive accuracy ranking. No automatic correctness grade. Abstention is not successful completion. Preparation is not calendar-client import.",
      rows,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    rows.map((row) => ({
      id: row.id,
      tempus: row.tempus?.status ?? row.tempusError,
      gpuOccurrences: row.gpuTime?.occurrences.length,
      gpuError: row.gpuTimeError,
    })),
  ),
);
if (rows.some((row) => row.tempusError || row.gpuTimeError)) process.exitCode = 1;
