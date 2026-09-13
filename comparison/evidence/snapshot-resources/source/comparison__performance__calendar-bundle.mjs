import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
if (args.length !== 3)
  throw new Error(
    "Usage: node calendar-bundle.mjs installed-package-directory archive.tgz new-output-directory",
  );
const [installed, archive, output] = args.map((value) => resolve(value));
const root = fileURLToPath(new URL("../../", import.meta.url));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const files = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).trim().split("\n");
const fileHashes = {};
for (const path of files.filter((name) => !name.endsWith("/"))) {
  if (!path.startsWith("package/") || path.split("/").includes(".."))
    throw new Error("Unexpected archive path");
  const relative = path.slice("package/".length);
  const expected = hash(execFileSync("tar", ["-xOzf", archive, path]));
  if (hash(readFileSync(join(installed, relative))) !== expected)
    throw new Error(`Installed file differs: ${relative}`);
  fileHashes[relative] = expected;
}
const manifest = JSON.parse(readFileSync(join(installed, "package.json")));
if (manifest.name !== "@tempus-date/core") throw new Error("Expected Tempus SDK");
const entries = {
  parse: resolve(installed, manifest.exports["."].import),
  calendar: resolve(installed, manifest.exports["./calendar"].import),
};
mkdirSync(output); // A new directory preserves earlier evidence.
const esbuild = `${root}node_modules/.bin/esbuild`;
const bundles = {};
for (const name of ["parse", "calendar", "combined"]) {
  const entry = join(output, `${name}-entry.mjs`);
  writeFileSync(
    entry,
    (name === "combined" ? Object.values(entries) : [entries[name]])
      .map((path) => `export * from ${JSON.stringify(path)};`)
      .join("\n") + "\n",
  );
  execFileSync(
    esbuild,
    [
      entry,
      "--bundle",
      "--minify",
      "--format=esm",
      "--platform=browser",
      "--target=es2022",
      `--outfile=${join(output, `${name}.js`)}`,
      `--metafile=${join(output, `${name}-meta.json`)}`,
      "--log-level=error",
    ],
    { cwd: root },
  );
  const bytes = readFileSync(join(output, `${name}.js`));
  bundles[name] = {
    minifiedBytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
    sha256: hash(bytes),
  };
}
const report = {
  scope:
    "All public exports retained; browser ESM bundles with dependencies. No code splitting or runtime timing.",
  archiveSha256: hash(readFileSync(archive)),
  fileHashes,
  scriptSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  lockSha256: hash(readFileSync(join(root, "pnpm-lock.yaml"))),
  node: process.version,
  executable: process.execPath,
  runtimeVersions: process.versions,
  esbuild: execFileSync(esbuild, ["--version"], { encoding: "utf8" }).trim(),
  bundles,
  calendarAddedToParse: {
    minifiedBytes: bundles.combined.minifiedBytes - bundles.parse.minifiedBytes,
    gzipBytes: bundles.combined.gzipBytes - bundles.parse.gzipBytes,
  },
  limitations: [
    "Bundle cost only; no measured download, latency, memory, battery or device result.",
    "Separate parse/calendar bundles duplicate shared code; their sizes must not be added as a combined integration estimate.",
    "All exports retained; a consumer using fewer exports may produce a different bundle. No competitor comparison.",
  ],
};
writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
writeFileSync(
  join(output, "report.md"),
  [
    "# Packed calendar integration bundle cost",
    "",
    report.scope,
    "",
    "| Entry | Minified bytes | Gzip bytes |",
    "| --- | ---: | ---: |",
    ...Object.entries(bundles).map(
      ([name, row]) => `| ${name} | ${row.minifiedBytes} | ${row.gzipBytes} |`,
    ),
    "",
    `Adding calendar exports to the parsing bundle adds ${report.calendarAddedToParse.minifiedBytes} minified bytes and ${report.calendarAddedToParse.gzipBytes} gzip bytes.`,
    "",
    ...report.limitations.map((line) => `- ${line}`),
    "",
    `Archive SHA-256: ${report.archiveSha256}`,
    "",
  ].join("\n"),
);
console.log(JSON.stringify({ bundles, calendarAddedToParse: report.calendarAddedToParse }));
