import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { readZone } from "./tzif-prototype.mjs";
if (!process.argv[2]) throw new Error("Supply the compiled build directory.");
const base = pathToFileURL(resolve(process.argv[2]) + "/");
const databasePath =
  process.argv[3] === "--database" && process.argv[4] ? resolve(process.argv[4]) : null;
if (process.argv[3] && !databasePath)
  throw new Error("Use --database /absolute/bundled-database.mjs");
const database = databasePath
  ? (await import(pathToFileURL(databasePath).href)).timezoneDatabase
  : null;
if (databasePath && typeof database !== "function")
  throw new Error("Artifact must export timezoneDatabase.");
const oracle = readFileSync(new URL("tzif-boundary-oracle.jsonl", base));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = JSON.parse(readFileSync(new URL("tzif-oracle-manifest.json", base)));
if (
  digest(oracle) !== manifest.oracleSha256 ||
  digest(readFileSync(new URL("build-manifest.json", base))) !== manifest.buildManifestSha256
)
  throw new Error("Oracle or build manifest changed after generation.");
const expectedFiles = new Map(manifest.zones.map((zone) => [zone.name, zone.sha256]));
const zones = new Map();
const failures = [];
let count = 0;
const start = performance.now();
for (const line of oracle.toString().trim().split("\n")) {
  const row = JSON.parse(line);
  count++;
  try {
    if (!zones.has(row.zone)) {
      if (!expectedFiles.has(row.zone)) throw new Error("Zone absent from oracle manifest.");
      const bytes = readFileSync(new URL("compiled/" + row.zone, base));
      if (digest(bytes) !== expectedFiles.get(row.zone))
        throw new Error("Compiled file changed after oracle generation.");
      zones.set(row.zone, readZone(bytes));
    }
    const observed = (database ? database(row.zone) : zones.get(row.zone)).possibleInstants(
      Date.parse(row.wall),
    );
    if (JSON.stringify(observed) !== JSON.stringify(row.expected))
      failures.push({ ...row, observed });
  } catch (error) {
    failures.push({ ...row, error: error.message });
  }
}
const hash = (name) =>
  createHash("sha256")
    .update(
      readFileSync(
        new URL(name, name.endsWith(".mjs") || name.endsWith(".py") ? import.meta.url : base),
      ),
    )
    .digest("hex");
const report = {
  node: process.version,
  databaseArtifact: databasePath
    ? { path: databasePath, sha256: digest(readFileSync(databasePath)) }
    : null,
  cases: count,
  zones: zones.size,
  failureCount: failures.length,
  failures,
  elapsedMs: performance.now() - start,
  hashes: Object.fromEntries(
    [
      "tzif-prototype.mjs",
      "tzif-oracle.py",
      "tzif-compare.mjs",
      "tzif-boundary-oracle.jsonl",
      "tzif-oracle-manifest.json",
      "build-manifest.json",
      "build-tzif.py",
    ].map((name) => [name, hash(name)]),
  ),
  limitations: [
    "Prototype outside the app; no SDK or browser integration.",
    "Same compiled IANA data, independent Python ZoneInfo interpretation.",
    "Development checks, not held-out product accuracy or superiority evidence.",
  ],
};
writeFileSync(new URL("tzif-boundary-report.json", base), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ ...report, failures: failures.slice(0, 10) }, null, 2));
if (failures.length) process.exitCode = 1;
