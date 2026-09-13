import "./verify.mjs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { cpus, totalmem, platform, arch, release } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, join } from "node:path";
import { gzipSync } from "node:zlib";
const root = fileURLToPath(new URL("../../", import.meta.url));
const args = process.argv.slice(2);
if (args.length !== 0 && (args.length !== 3 || args[0] !== "--packed"))
  throw new Error("Usage: node run.mjs [--packed installed-package-directory archive.tgz]");
const packed = args.length > 0;
const packageDirectory = packed ? resolve(args[1]) : `${root}packages/core`;
const manifest = JSON.parse(readFileSync(join(packageDirectory, "package.json")));
if (manifest.name !== "@tempus-date/core") throw new Error("Expected the Tempus SDK package.");
const entry = resolve(packageDirectory, manifest.exports["."].import);
const hashBytes = (bytes) => createHash("sha256").update(bytes).digest("hex");
let artifact;
if (packed) {
  const archive = resolve(args[2]);
  const files = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).trim().split("\n");
  const hashes = {};
  for (const file of files.filter((name) => !name.endsWith("/"))) {
    if (!file.startsWith("package/") || file.split("/").includes(".."))
      throw new Error("Unexpected archive path.");
    const relative = file.slice("package/".length);
    const expected = hashBytes(execFileSync("tar", ["-xOzf", archive, file]));
    if (hashBytes(readFileSync(join(packageDirectory, relative))) !== expected)
      throw new Error(`Installed file differs from the archive: ${relative}`);
    hashes[relative] = expected;
  }
  if (!hashes["dist/sdk.js"] || !hashes["package.json"])
    throw new Error("Archive is missing the SDK entry or manifest.");
  artifact = {
    archive,
    sha256: hashBytes(readFileSync(archive)),
    installedDirectory: packageDirectory,
    fileHashes: hashes,
  };
}
const out = new URL(
  packed ? "../results/performance/packed/" : "../results/performance/",
  import.meta.url,
);
mkdirSync(out, { recursive: true });
const runs = [];
for (let trial = 0; trial < 5; trial++) {
  for (const engine of trial % 2 ? ["gpu-time", "tempus"] : ["tempus", "gpu-time"]) {
    const result = execFileSync(
      process.execPath,
      [
        "--expose-gc",
        fileURLToPath(new URL("./measure.mjs", import.meta.url)),
        engine,
        pathToFileURL(entry).href,
      ],
      {
        cwd: root,
        encoding: "utf8",
        timeout: 60000,
      },
    );
    runs.push({ trial, ...JSON.parse(result) });
  }
}
const bundles = {};
for (const [engine, bundleEntry] of [
  ["tempus", entry],
  ["gpu-time", "node_modules/gpu-time/dist/index.js"],
]) {
  const output = new URL(`${engine}.js`, out);
  execFileSync(
    `${root}node_modules/.bin/esbuild`,
    [
      bundleEntry,
      "--bundle",
      "--minify",
      "--format=esm",
      "--platform=browser",
      "--target=es2022",
      `--outfile=${fileURLToPath(output)}`,
      "--log-level=error",
    ],
    { cwd: root },
  );
  const bytes = readFileSync(output);
  bundles[engine] = {
    minifiedBytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
const sourceFiles = [
  "comparison/performance/run.mjs",
  "comparison/performance/measure.mjs",
  "comparison/performance/preview.mjs",
  "comparison/performance/verify.mjs",
  "comparison/performance/workload.json",
  "pnpm-lock.yaml",
  ...readdirSync(`${packageDirectory}/dist`, { recursive: true })
    .filter((path) => path.endsWith(".js"))
    .map((path) => `${packageDirectory}/dist/${path}`),
];
const report = {
  protocol: "desktop-cpu-development-v1",
  tempusInput: packed ? "installed-archive" : "emitted-workspace",
  artifact,
  recordedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    executable: process.execPath,
    runtimeVersions: process.versions,
    platform: platform(),
    arch: arch(),
    osRelease: release(),
    cpu: cpus()[0]?.model,
    logicalCpus: cpus().length,
    totalMemoryBytes: totalmem(),
  },
  versions: {
    esbuild: execFileSync(`${root}node_modules/.bin/esbuild`, ["--version"], {
      encoding: "utf8",
    }).trim(),
    tempus: manifest.version,
    gpuTime: JSON.parse(readFileSync(`${root}node_modules/gpu-time/package.json`)).version,
  },
  git: {
    commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    dirty: Boolean(
      execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim(),
    ),
  },
  sourceHashes: Object.fromEntries(
    sourceFiles.map((path) => [path, hashBytes(readFileSync(resolve(root, path)))]),
  ),
  workload: JSON.parse(readFileSync(new URL("./workload.json", import.meta.url))),
  bundles,
  runs,
};
const percentile = (values, fraction) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1];
const summary = [
  "# Desktop CPU development baseline",
  "",
  `Tempus input: ${packed ? `installed archive ${artifact.sha256}` : "emitted workspace SDK"}.`,
  "",
  "Five fresh processes per engine; alternating order. Milliseconds, empirical p50 / p95. OS filesystem caches are not cleared. This is a four-case development workload, not general accuracy or device evidence.",
  "",
  "| Engine | Import | Initialize | First parse | Import through first result | Warm single | Batch 10 | Batch 100 | Correct timed items |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
];
for (const engine of ["tempus", "gpu-time"]) {
  const selected = runs.filter((r) => r.engine === engine);
  const format = (samples) =>
    `${percentile(samples, 0.5).toFixed(3)} / ${percentile(samples, 0.95).toFixed(3)}`;
  const timings = ["importMs", "initializeMs", "firstParseMs", "readyThroughFirstParseMs"].map(
    (key) => format(selected.map((r) => r[key])),
  );
  for (const size of [1, 10, 100])
    timings.push(
      format(selected.flatMap((r) => r.measurements.find((m) => m.batchSize === size).samplesMs)),
    );
  const measurements = selected.flatMap((r) => r.measurements);
  summary.push(
    `| ${engine} | ${timings.join(" | ")} | ${measurements.reduce((s, m) => s + m.correctItems, 0)} / ${measurements.reduce((s, m) => s + m.totalItems, 0)} |`,
  );
}
summary.push(
  "",
  "## Browser bundle cost",
  "",
  "Same esbuild settings; all public entry exports retained, dependencies included. These are integration bundles, not npm tarball sizes or measured network transfers.",
  "",
  "| Engine | Minified bytes | Gzip bytes |",
  "| --- | ---: | ---: |",
);
for (const [engine, bundle] of Object.entries(bundles))
  summary.push(`| ${engine} | ${bundle.minifiedBytes} | ${bundle.gzipBytes} |`);
summary.push(
  "",
  "Raw JSON includes each timing sample, exact observed preview checks, environment, versions, source hashes and process memory snapshots after explicit GC. Snapshots are not peak memory or isolated library allocations. CPU only; no browser runtime, GPU, phone, battery or user-task measurements. Matching previews do not validate recurrence exports.",
);
writeFileSync(new URL("report.json", out), JSON.stringify(report, null, 2) + "\n");
writeFileSync(new URL("report.md", out), summary.join("\n") + "\n");
console.log(summary.join("\n"));
