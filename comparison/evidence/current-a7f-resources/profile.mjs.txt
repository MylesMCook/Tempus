import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Session } from "node:inspector/promises";
import { resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { cpus } from "node:os";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const script = fileURLToPath(import.meta.url);
const [installedArg, archiveArg, outputArg, mode] = process.argv.slice(2);
if (!installedArg || !archiveArg || !outputArg)
  throw new Error("Usage: node profile.mjs installed-package archive.tgz new-output-directory");
const installed = resolve(installedArg);
const archive = resolve(archiveArg);
const output = resolve(outputArg);
const save = (name, value) =>
  writeFileSync(join(output, name), JSON.stringify(value, null, 2) + "\n", { flag: "wx" });

if (!mode) {
  const paths = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).trim().split("\n");
  const files = {};
  for (const path of paths.filter((path) => !path.endsWith("/"))) {
    assert.ok(path.startsWith("package/") && !path.split("/").includes(".."));
    const relative = path.slice(8);
    const expected = hash(execFileSync("tar", ["-xOzf", archive, path]));
    assert.equal(hash(readFileSync(join(installed, relative))), expected, relative);
    files[relative] = expected;
  }
  assert.ok(files["dist/sdk.js"] && files["dist/sdk-calendar.js"]);
  mkdirSync(output);
  const runs = [];
  for (let trial = 0; trial < 5; trial++)
    runs.push(
      JSON.parse(
        execFileSync(
          process.execPath,
          ["--expose-gc", script, installed, archive, output, `timing-${trial}`],
          { encoding: "utf8", timeout: 120000 },
        ),
      ),
    );
  execFileSync(process.execPath, ["--expose-gc", script, installed, archive, output, "profile"], {
    encoding: "utf8",
    timeout: 120000,
  });
  save("report.json", {
    archiveSha256: hash(readFileSync(archive)),
    files,
    scriptSha256: hash(readFileSync(script)),
    node: process.version,
    cpu: cpus()[0]?.model,
    recordedAt: new Date().toISOString(),
    runs,
    limitations:
      "Authored development tasks, five fresh processes, warm filesystem. CPU/allocation profiling is separate from latency runs. Sampled allocations include collected objects; not peak memory, energy or independent task evidence. Full parse includes explanation; no trace-free public mode exists.",
  });
  console.log(JSON.stringify({ output, runs: runs.length }));
} else {
  const session = new Session();
  session.connect();
  const profiling = mode === "profile";
  if (profiling) {
    await session.post("Profiler.enable");
    await session.post("Profiler.setSamplingInterval", { interval: 100 });
    await session.post("Profiler.start");
  }
  global.gc?.();
  const memoryBefore = process.memoryUsage();
  const start = performance.now();
  const sdk = await import(pathToFileURL(join(installed, "dist/sdk.js")).href);
  const imported = performance.now();
  const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
  const parser = sdk.createParser(context);
  const initialized = performance.now();
  assert.equal(parser.parse("tomorrow at noon").status, "resolved");
  const first = performance.now();
  if (profiling) save("initialization.cpuprofile", (await session.post("Profiler.stop")).profile);
  const calendarStart = performance.now();
  const calendar = await import(pathToFileURL(join(installed, "dist/sdk-calendar.js")).href);
  const calendarImportMs = performance.now() - calendarStart;
  const input = "Remind me to call Sam 11/01/2026 at 1:30am for 30 minutes";
  const metadata = {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
    title: "call Sam",
  };
  const basic = [
    "tomorrow at noon",
    "next Friday",
    "Friday 10pm-12am",
    "every Monday from 8 pm to 10 pm",
  ];
  const schedule = parser.parse(
    "Remind me to call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08",
  );
  const decisions = ["recurrence:2026-11-01:start:2026-11-01T07:30:00Z"];
  const operations = {
    preview: () => basic.map((text) => parser.parse(text)),
    calculatorTrace: () => sdk.calculateDate("tomorrow + 1 month - 3 days", context),
    correction: () => {
      let result = parser.parse(input);
      let selection;
      for (const id of ["2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
        assert.equal(result.status, "needs-clarification");
        assert.ok(result.clarification.choices.some((choice) => choice.id === id));
        selection = sdk.appendSelection(selection, {
          contextKey: result.clarification.contextKey,
          id,
        });
        result = sdk.parse(input, { ...context, selection });
      }
      assert.equal(result.status, "resolved");
      assert.equal(result.value.start.result.iso, "2026-11-01T07:30:00.000Z");
      return result;
    },
    export: () =>
      calendar.prepareRecurringCalendarFile(schedule, {
        ...metadata,
        reference: context.reference,
        decisions,
      }),
  };
  const checks = Object.fromEntries(
    Object.entries(operations).map(([name, invoke]) => [name, invoke()]),
  );
  assert.ok(checks.preview.every((result) => result.status === "resolved"));
  assert.equal(checks.calculatorTrace.ok, true);
  assert.equal(checks.export.ok, true);
  assert.equal(checks.export.eventCount, 9);
  const measurements = {};
  for (const [name, invoke] of Object.entries(operations)) {
    for (let i = 0; i < 10; i++) invoke();
    if (profiling) {
      await session.post("HeapProfiler.startSampling", {
        samplingInterval: 16384,
        includeObjectsCollectedByMajorGC: true,
        includeObjectsCollectedByMinorGC: true,
      });
      await session.post("Profiler.start");
      for (let i = 0; i < 300; i++) invoke();
      save(`${name}.cpuprofile`, (await session.post("Profiler.stop")).profile);
      save(`${name}.heapprofile`, (await session.post("HeapProfiler.stopSampling")).profile);
    } else {
      global.gc?.();
      const before = process.memoryUsage();
      const cpuBefore = process.cpuUsage();
      const samplesMs = [];
      for (let i = 0; i < 100; i++) {
        const t = performance.now();
        invoke();
        samplesMs.push(performance.now() - t);
      }
      const cpuMicros = process.cpuUsage(cpuBefore);
      const beforeGC = process.memoryUsage();
      global.gc?.();
      measurements[name] = {
        samplesMs,
        cpuMicros,
        before,
        beforeGC,
        afterGC: process.memoryUsage(),
      };
    }
  }
  session.disconnect();
  if (!profiling)
    console.log(
      JSON.stringify({
        importMs: imported - start,
        initializeMs: initialized - imported,
        firstParseMs: first - initialized,
        readyMs: first - start,
        calendarImportMs,
        memoryBefore,
        memoryAfter: process.memoryUsage(),
        measurements,
        outputHashes: Object.fromEntries(
          Object.entries(checks).map(([name, value]) => [name, hash(JSON.stringify(value))]),
        ),
      }),
    );
}
