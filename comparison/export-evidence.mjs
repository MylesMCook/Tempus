import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
const [mode, destination] = process.argv.slice(2);
assert.ok(
  ["export", "verify"].includes(mode) && destination && process.argv.length === 4,
  "Usage: node comparison/export-evidence.mjs export|verify NEW-directory",
);
const output = resolve(destination);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const relative = (name) => {
  assert.ok(
    typeof name === "string" &&
      /^[A-Za-z0-9_./-]+$/.test(name) &&
      !name.startsWith("/") &&
      !name.split("/").includes(".."),
    "Expected a repository-relative path",
  );
  return name;
};
if (mode === "verify") {
  const manifest = JSON.parse(readFileSync(join(output, "manifest.json")));
  assert.equal(manifest.format, "tempus-development-evidence-v1");
  for (const [name, expected] of Object.entries(manifest.files))
    assert.equal(
      hash(readFileSync(join(output, relative(name)))),
      expected,
      `Changed evidence: ${name}`,
    );
  console.log(
    `Verified ${Object.keys(manifest.files).length} snapshot files. Integrity only; not independent evaluation or current-source equivalence.`,
  );
} else {
  assert.ok(!existsSync(output), "Choose a new directory; existing evidence is never overwritten");
  const comparison = JSON.parse(readFileSync(join(root, "comparison/results/report.json")));
  const journeys = JSON.parse(readFileSync(join(root, "comparison/results/journeys.json")));
  for (const report of [comparison.metadata, journeys]) {
    assert.ok(
      report.sourceHashes && Object.keys(report.sourceHashes).length,
      "Missing source provenance",
    );
    for (const [name, expected] of Object.entries(report.sourceHashes))
      assert.equal(
        hash(readFileSync(join(root, relative(name)))),
        expected,
        `Stale source report: ${name}. Rerun the comparison and journey tests.`,
      );
  }
  const files = new Map();
  for (const name of ["report.json", "report.md", "journeys.json", "journeys.md"])
    files.set(name, readFileSync(join(root, "comparison/results", name)));
  let exportedFiles = 0;
  for (const record of journeys.records) {
    const validation = record.steps.find((step) => step.action === "file-validation");
    if (!validation) continue; // Preserve failed/incomplete records; never fabricate a successful file.
    assert.match(record.id, /^[a-z0-9-]+$/);
    const name = `journey-files/${record.id}.ics`;
    const bytes = readFileSync(join(root, "comparison/results", name));
    assert.equal(
      hash(bytes),
      validation.fileSha256,
      `Journey file differs from recorded validation: ${record.id}`,
    );
    files.set(name, bytes);
    exportedFiles++;
  }
  for (const [name, bytes] of files)
    assert.ok(
      !/\/Users\/|\/private\/var\/|file:\/\//.test(bytes.toString()),
      `Review local paths before snapshotting ${name}`,
    );
  const readme = `# Development review snapshot\n\nThis is an inspected development corpus and scripted integration replay, not an untouched holdout, human study, calendar-client import or competitive ranking. No capability gate closes from copying these reports.\n\n- [Comparison](report.md) and [raw inputs/results](report.json): ${comparison.results.length} inspected cases, gpu-time ${comparison.metadata.gpuTimeVersion}.\n- [Journeys](journeys.md) and [raw stages](journeys.json): ${journeys.records.length} authored tasks, ${exportedFiles} validated files retained in journey-files/. Failed or incomplete records are retained.\n- Source hashes identify the dirty working-tree implementation; the commit alone does not reproduce it. The manifest hashes every retained evidence file and the exporter.\n- This snapshot omits separate SDK/browser, performance and diagnostic-reader evidence. Their documented limitations and failures remain release gates.\n\nFrom the repository root, verify retained file integrity with:\n\n\`\`\`sh\nnode comparison/export-evidence.mjs verify ${relative(destination)}\n\`\`\`\n\nTo regenerate current source results, run \`pnpm install --frozen-lockfile\`, then \`pnpm exec vp test run comparison/comparison.test.ts comparison/scoring.test.ts comparison/journeys.test.ts\`. Export to a new directory with \`node comparison/export-evidence.mjs export comparison/evidence/NEW-name\`. Source provenance must match at export time. A different runtime or edited source may produce different bytes; retain both reports and explain differences. No network or calendar write is performed by the exporter.\n`;
  files.set("README.md", Buffer.from(readme));
  const manifest = {
    format: "tempus-development-evidence-v1",
    corpus: comparison.metadata.corpus,
    gpuTimeVersion: comparison.metadata.gpuTimeVersion,
    comparisonCases: comparison.results.length,
    scriptedJourneys: journeys.records.length,
    validatedJourneyFiles: exportedFiles,
    independentCases: 0,
    calendarClientImports: 0,
    exporterSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
    files: Object.fromEntries([...files].map(([name, bytes]) => [name, hash(bytes)])),
  };
  mkdirSync(output);
  mkdirSync(join(output, "journey-files"));
  for (const [name, bytes] of files) writeFileSync(join(output, name), bytes);
  writeFileSync(join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `Retained ${manifest.comparisonCases} development cases, ${manifest.scriptedJourneys} scripted tasks and ${exportedFiles} files in ${destination}. No independent-evaluation claim.`,
  );
}
