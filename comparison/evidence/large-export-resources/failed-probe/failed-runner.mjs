import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const [installationArg, outputArg] = process.argv.slice(2);
assert.ok(installationArg && outputArg && process.argv.length === 4);
assert.ok(global.gc, "Run with --expose-gc");
const installation = resolve(installationArg),
  output = resolve(outputArg);
const verified = JSON.parse(readFileSync(join(installation, "verification.json")));
assert.equal(verified.status, "passed");
const installed = join(installation, "node_modules/@tempus-date/core");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [path, expected] of Object.entries(verified.installedFileHashes))
  assert.equal(hash(readFileSync(join(installed, path))), expected, path);
mkdirSync(output);
const save = (name, value) =>
  writeFileSync(join(output, name), JSON.stringify(value, null, 2) + "\n");
const memory = () => {
  global.gc();
  return process.memoryUsage();
};
const beforeImport = memory();
const sdk = await import(pathToFileURL(join(installed, "dist/sdk.js")).href);
const calendar = await import(pathToFileURL(join(installed, "dist/sdk-calendar.js")).href);
const { timezoneData } = await import(
  pathToFileURL(join(installed, "dist/date-engine/timezone-data.js")).href
);
const afterImport = memory();
const samples = [];
const zones = Object.keys(timezoneData.aliases).sort();
const statuses = {};
// Discard results, vary every phrase/context, and traverse more zones than either bounded cache.
for (let cycle = 0; cycle < 10; cycle++) {
  for (let index = 0; index < zones.length; index++) {
    const input = `Call person ${cycle * zones.length + index} on 03/04/2027 at noon`;
    const result = sdk.parse(input, {
      timezone: zones[index],
      reference: `2026-09-${String(12 + cycle).padStart(2, "0")}T16:00:00Z`,
    });
    statuses[result.status] = (statuses[result.status] ?? 0) + 1;
    assert.equal(result.status, "needs-clarification");
    assert.equal(result.input, input);
  }
  samples.push({ cycle, processed: (cycle + 1) * zones.length, ...memory() });
}
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  reference: context.reference,
  stamp: context.reference,
  title: "Call Sam",
  uid: "11111111-2222-4333-8444-555555555555",
};
const exports = [];
for (const [id, input, expectedCount] of [
  ["daily-point", "Call Sam every day at noon for 1000 occurrences", 1000],
  ["daily-duration", "Call Sam every day at noon for 30 minutes for 1000 occurrences", 1000],
  ["over-horizon", "Call Sam every Monday at noon for 1000 occurrences", 0],
]) {
  const result = sdk.parse(input, context);
  assert.equal(result.status, "resolved");
  const invoke = () => calendar.prepareRecurringCalendarFile(result, metadata);
  invoke();
  const samplesMs = [];
  let file;
  for (let trial = 0; trial < 20; trial++) {
    const start = performance.now();
    file = invoke();
    samplesMs.push(performance.now() - start);
    assert.equal(file.ok, expectedCount > 0);
    if (file.ok) assert.equal(file.eventCount, expectedCount);
  }
  if (file.ok) writeFileSync(join(output, `${id}.ics`), file.text);
  exports.push({
    id,
    input,
    expectedCount,
    samplesMs,
    ...(file.ok
      ? { sha256: hash(file.text), bytes: Buffer.byteLength(file.text) }
      : { reason: file.reason }),
  });
}
save("report.json", {
  recordedAt: new Date().toISOString(),
  node: process.version,
  archiveSha256: verified.archiveSha256,
  scriptSha256: hash(readFileSync(new URL(import.meta.url))),
  zoneCount: zones.length,
  beforeImport,
  afterImport,
  samples,
  statuses,
  exports,
  scope:
    "One desktop process; all bundled zone names across ten cycles of unique ambiguous phrases/contexts. Explicit-GC snapshots are not peak/native-only allocation or proof of no leak. Twenty warm export samples per authored case; independent readers must validate actual files. No calendars written.",
});
console.log(
  JSON.stringify({
    output,
    processed: zones.length * 10,
    exports: exports.map(({ id, samplesMs }) => ({ id, maxMs: Math.max(...samplesMs) })),
  }),
);
