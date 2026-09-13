import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setImmediate } from "node:timers/promises";

const [installationArg, outputArg, mode] = process.argv.slice(2);
assert.ok(installationArg && outputArg, "Usage: node retention.mjs VERIFIED-INSTALL NEW-OUTPUT");
const installation = resolve(installationArg);
const output = resolve(outputArg);
const installed = join(installation, "node_modules/@tempus-date/core");
const script = fileURLToPath(import.meta.url);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
if (!mode) {
  const verified = JSON.parse(readFileSync(join(installation, "verification.json"), "utf8"));
  assert.equal(verified.status, "passed");
  for (const [name, expected] of Object.entries(verified.installedFileHashes))
    assert.equal(hash(readFileSync(join(installed, name))), expected, name);
  mkdirSync(output);
  const runs = [];
  for (let trial = 0; trial < 2; trial++) {
    const modes = ["fixed-sync", "zones-sync", "fixed-yield", "zones-yield"];
    for (const candidate of trial ? modes.reverse() : modes) {
      const run = JSON.parse(
        execFileSync(process.execPath, ["--expose-gc", script, installation, output, candidate], {
          encoding: "utf8",
          timeout: 120000,
        }),
      );
      runs.push({ trial, ...run });
      writeFileSync(
        join(output, `${trial}-${candidate}.json`),
        JSON.stringify(run, null, 2) + "\n",
      );
    }
  }
  writeFileSync(
    join(output, "report.json"),
    JSON.stringify(
      {
        archiveSha256: verified.archiveSha256,
        scriptSha256: hash(readFileSync(script)),
        node: process.version,
        executable: process.execPath,
        versions: process.versions,
        runs,
        scope:
          "Two fresh processes per lane, ten cycles of 597 discarded ambiguous-date results. Intl constructor instrumentation adds overhead. Post-GC process snapshots are neither peak memory nor isolated library/native allocation. Yield lanes allow event-loop turns between cycles. No energy or device claim.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ output, runs: runs.length }));
} else {
  assert.ok(["fixed-sync", "zones-sync", "fixed-yield", "zones-yield"].includes(mode));
  assert.ok(global.gc);
  let constructors = 0;
  const original = Intl.DateTimeFormat;
  const signatures = new Map();
  const record = (args) => {
    constructors++;
    const options = { ...args[1] };
    delete options.timeZone;
    const key = JSON.stringify([args[0], options]);
    signatures.set(key, (signatures.get(key) ?? 0) + 1);
  };
  Intl.DateTimeFormat = new Proxy(original, {
    construct(target, args, newTarget) {
      record(args);
      return Reflect.construct(target, args, newTarget);
    },
    apply(target, receiver, args) {
      record(args);
      return Reflect.apply(target, receiver, args);
    },
  });
  const memory = () => {
    global.gc();
    return process.memoryUsage();
  };
  const beforeImport = memory();
  const { parse } = await import(pathToFileURL(join(installed, "dist/sdk.js")).href);
  const { timezoneData } = await import(
    pathToFileURL(join(installed, "dist/date-engine/timezone-data.js")).href
  );
  const zones = Object.keys(timezoneData.aliases).sort();
  assert.equal(zones.length, 597);
  const afterImport = memory();
  const samples = [];
  for (let cycle = 0; cycle < 10; cycle++) {
    for (let index = 0; index < zones.length; index++) {
      const input = `Call Sam on 03/04/${2027 + cycle * zones.length + index} at noon`;
      const result = parse(input, {
        timezone: mode.startsWith("zones") ? zones[index] : "America/Chicago",
        reference: `2026-09-${String(12 + cycle).padStart(2, "0")}T16:00:00Z`,
      });
      assert.equal(result.status, "needs-clarification");
      assert.equal(result.input, input);
    }
    if (mode.endsWith("yield")) {
      global.gc();
      await setImmediate();
    }
    samples.push({ cycle, processed: (cycle + 1) * zones.length, constructors, ...memory() });
  }
  await setImmediate();
  const afterYield = memory();
  console.log(
    JSON.stringify({
      mode,
      beforeImport,
      afterImport,
      samples,
      afterYield,
      constructors,
      signatures: Object.fromEntries(signatures),
    }),
  );
}
