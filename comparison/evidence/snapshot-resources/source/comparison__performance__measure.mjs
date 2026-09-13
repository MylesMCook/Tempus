import { samePreview } from "./preview.mjs";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const engine = process.argv[2];
if (!["tempus", "gpu-time"].includes(engine)) throw new Error("Choose a known engine.");
const workload = JSON.parse(readFileSync(new URL("./workload.json", import.meta.url), "utf8"));
const heap = () => {
  global.gc?.();
  const { rss, heapUsed, external, arrayBuffers } = process.memoryUsage();
  return { rss, heapUsed, external, arrayBuffers };
};
const before = heap();
const start = performance.now();
const module =
  engine === "tempus"
    ? await import(process.argv[3] ?? "../../packages/core/dist/sdk.js")
    : await import("gpu-time");
const imported = performance.now();
const context =
  engine === "tempus"
    ? { timezone: workload.context.timeZone, reference: workload.context.reference }
    : workload.context;
const parser =
  engine === "tempus"
    ? module.createParser(context)
    : await module.defineParser({ backend: "cpu" });
const initialized = performance.now();
const parse = (text) => parser.parse(text, context);
const parseMany = (texts) => parser.parseMany(texts, context);
const normalize = (result) => {
  if (engine === "gpu-time")
    return {
      recurring: result.rrules.length > 0,
      occurrences: result.occurrences.map(({ start, end }) => ({ start, ...(end ? { end } : {}) })),
    };
  if (result.status !== "resolved") return { unresolved: result.status };
  const value = result.value;
  const rows =
    value.kind === "point"
      ? [{ start: value.calculation }]
      : value.kind === "interval"
        ? [value]
        : value.occurrences;
  return {
    recurring: value.kind === "recurrence",
    occurrences: rows.map(({ start, end }) => ({
      start: start.result.iso,
      ...(end ? { end: end.result.iso } : {}),
    })),
  };
};
const correct = (result, fixture) => samePreview(normalize(result), fixture);
const firstStart = performance.now();
const first = await parse(workload.cases[0].text);
const firstEnd = performance.now();
const afterFirst = heap();
const verification = [];
for (const fixture of workload.cases) {
  const result = await parse(fixture.text);
  verification.push({
    input: fixture.text,
    correct: correct(result, fixture),
    observed: normalize(result),
  });
}
const measurements = [];
try {
  for (const size of [1, 10, 100]) {
    // Explicit untimed warm-up for this call shape, followed by 20 measured calls.
    // Tempus is synchronous; normalize the public call to the same async timing boundary.
    const invoke = async (fixtures) =>
      size === 1 ? [await parse(fixtures[0].text)] : await parseMany(fixtures.map((f) => f.text));
    for (let warmup = 0; warmup < 4; warmup++)
      await invoke(
        Array.from(
          { length: size },
          (_, i) => workload.cases[(i + warmup) % workload.cases.length],
        ),
      );
    const samplesMs = [];
    let correctItems = 0;
    for (let iteration = 0; iteration < 20; iteration++) {
      const fixtures = Array.from(
        { length: size },
        (_, i) => workload.cases[(i + iteration) % workload.cases.length],
      );
      const t0 = performance.now();
      const results = await invoke(fixtures);
      samplesMs.push(performance.now() - t0);
      correctItems += results.filter((r, i) => correct(r, fixtures[i])).length;
    }
    measurements.push({
      operation: size === 1 ? "parse" : "parseMany",
      batchSize: size,
      samplesMs,
      correctItems,
      totalItems: size * 20,
    });
  }
  console.log(
    JSON.stringify({
      engine,
      backend: "cpu",
      importMs: imported - start,
      initializeMs: initialized - imported,
      firstParseMs: firstEnd - firstStart,
      readyThroughFirstParseMs: firstEnd - start,
      firstCorrect: correct(first, workload.cases[0]),
      verification,
      measurements,
      memoryBytes: { beforeImport: before, afterFirstParse: afterFirst, afterMeasuredWork: heap() },
    }),
  );
} finally {
  parser.dispose?.();
}
