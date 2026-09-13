import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const [directory, destination] = process.argv.slice(2);
assert.ok(
  directory && destination && process.argv.length === 4,
  "Usage: node verify-installed-node.mjs VERIFIED-INSTALL NEW-report.json",
);
const root = resolve(directory),
  output = resolve(destination);
assert.ok(!existsSync(output), "Refuse to overwrite evidence");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const verified = JSON.parse(readFileSync(join(root, "verification.json")));
assert.equal(verified.status, "passed");
for (const [file, expected] of Object.entries(verified.installedFileHashes))
  assert.equal(
    hash(readFileSync(join(root, "node_modules/@tempus-date/core", file))),
    expected,
    file,
  );
const report = {
  status: "running",
  node: process.version,
  archiveSha256: verified.archiveSha256,
  runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  examples: [],
  scope:
    "Same verified installed artifact on the invoked Node runtime. No repack, browser/Worker execution or external actions.",
};
try {
  for (const name of [
    "node",
    "calendar",
    "state",
    "monthly",
    "date-list",
    "counts",
    ...(verified.exampleSourceHashes["identifiers.mjs"] ? ["identifiers"] : []),
  ]) {
    const file = `${name}.mjs`;
    assert.equal(hash(readFileSync(join(root, file))), verified.exampleSourceHashes[file], file);
    const stdout = execFileSync(process.execPath, [join(root, file)], {
      cwd: root,
      encoding: "utf8",
      timeout: 60000,
    });
    report.examples.push({ name, status: "passed", output: stdout.trim() });
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
}
writeFileSync(output, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(
  JSON.stringify({
    status: report.status,
    node: report.node,
    archiveSha256: report.archiveSha256,
    examples: report.examples.length,
  }),
);
