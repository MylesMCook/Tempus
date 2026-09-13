import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Use existing measured bundles; never silently rebuild or overwrite evidence.
if (process.argv.length !== 5)
  throw new Error(
    "Usage: node browser.mjs packed-results-directory NEW-output-directory PLAYWRIGHT-ENTRY",
  );
const [input, output, playwrightEntry] = process.argv.slice(2).map((path) => resolve(path));
const { chromium } = await import(pathToFileURL(playwrightEntry).href);
const baseline = JSON.parse(await readFile(`${input}/report.json`, "utf8"));
const workload = JSON.parse(await readFile(new URL("./workload.json", import.meta.url), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const assets = new Map([
  ["/", Buffer.from("<!doctype html><title>Local parser measurement</title>")],
]);
for (const engine of ["tempus", "gpu-time"]) {
  const bytes = await readFile(`${input}/${engine}.js`);
  if (hash(bytes) !== baseline.bundles[engine].sha256) throw new Error(`${engine} bundle changed`);
  assets.set(`/${engine}.js`, bytes);
}
const comparator = await readFile(new URL("./preview.mjs", import.meta.url));
assets.set("/preview.mjs", comparator);
await mkdir(output); // Fails if an earlier report already exists.
const server = createServer((request, response) => {
  const body = assets.get(request.url);
  response.writeHead(body ? 200 : 404, {
    "content-type": request.url === "/" ? "text/html" : "text/javascript",
    "cache-control": "no-store",
  });
  response.end(body);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const runs = [];
try {
  for (let round = 0; round < 5; round++) {
    for (const engine of round % 2 ? ["gpu-time", "tempus"] : ["tempus", "gpu-time"]) {
      const browser = await chromium.launch({ channel: "chrome", headless: true });
      const unexpectedRequests = [];
      try {
        const page = await browser.newPage();
        await page.route("**/*", (route) => {
          const url = new URL(route.request().url());
          if (url.origin === origin && assets.has(url.pathname)) return route.continue();
          unexpectedRequests.push(url.href);
          return route.abort();
        });
        await page.goto(origin);
        const result = await page.evaluate(
          async ({ engine, workload }) => {
            const { samePreview } = await import("/preview.mjs");
            const start = performance.now();
            const module = await import(`/${engine}.js`);
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
            const normalize = (result) => {
              if (engine === "gpu-time")
                return { recurring: result.rrules.length > 0, occurrences: result.occurrences };
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
            const first = await parser.parse(workload.cases[0].text, context);
            const firstEnd = performance.now();
            const measurements = [];
            try {
              for (const size of [1, 10, 100]) {
                const samples = [];
                for (let iteration = -4; iteration < 20; iteration++) {
                  const fixtures = Array.from(
                    { length: size },
                    (_, i) => workload.cases[(i + iteration + 4) % workload.cases.length],
                  );
                  const texts = fixtures.map((fixture) => fixture.text);
                  const t0 = performance.now();
                  const results =
                    size === 1
                      ? [await parser.parse(texts[0], context)]
                      : await parser.parseMany(texts, context);
                  const elapsed = performance.now() - t0;
                  const correct =
                    results.length === fixtures.length &&
                    results.every((result, i) => samePreview(normalize(result), fixtures[i]));
                  if (!correct) throw new Error(`Incorrect ${engine} preview in batch ${size}`);
                  if (iteration >= 0) samples.push(elapsed);
                }
                measurements.push({ size, samplesMs: samples });
              }
              return {
                importMs: imported - start,
                initializeMs: initialized - imported,
                firstParseMs: firstEnd - initialized,
                importThroughFirstMs: firstEnd - start,
                firstCorrect: samePreview(normalize(first), workload.cases[0]),
                measurements,
              };
            } finally {
              parser.dispose?.();
            }
          },
          { engine, workload },
        );
        if (!result.firstCorrect || unexpectedRequests.length)
          throw new Error("First preview or local-only request check failed");
        runs.push({ round, engine, browser: browser.version(), ...result, unexpectedRequests });
      } finally {
        await browser.close();
      }
    }
  }
} finally {
  await new Promise((done) => server.close(done));
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        protocol: "browser-cpu-development-v1",
        completed: runs.length === 10,
        baselineReportSha256: hash(await readFile(`${input}/report.json`)),
        scriptSha256: hash(await readFile(new URL(import.meta.url))),
        comparatorSha256: hash(comparator),
        artifact: baseline.artifact,
        bundles: baseline.bundles,
        versions: baseline.versions,
        runnerExecutable: process.execPath,
        runnerVersions: process.versions,
        workload,
        runs,
        limitations: [
          "Desktop headless Chrome, fresh process per run; OS caches retained.",
          "Import includes uncompressed loopback fetch, compilation and evaluation; not pure CPU or production network latency.",
          "Four inspected cases, four warmups and twenty measured calls per size; no independent accuracy or task-completion claim.",
          "CPU backend only. No device, battery, peak-memory, GPU or calendar-export measurement.",
          "Bundle hashes bind prior packed-build evidence; this does not independently authenticate every dependency.",
        ],
      },
      null,
      2,
    ) + "\n",
  );
}
console.log(JSON.stringify({ output, completedRuns: runs.length }));
