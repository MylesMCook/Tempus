import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

// Local build/pack/install only. No publication, servers, browser or calendar writes.
const root = fileURLToPath(new URL("../../", import.meta.url));
assert.equal(
  process.argv.length,
  3,
  "Usage: node examples/sdk/verify-package.mjs NEW-scratch-directory",
);
const destination = resolve(process.argv[2]);
const fromRoot = relative(root, destination);
assert.ok(
  fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot),
  "Use a scratch directory outside the repository",
);
assert.ok(!existsSync(destination), "Choose a new directory; prior evidence is never overwritten");
const [major, minor] = process.versions.node.split(".").map(Number);
assert.ok(major > 22 || (major === 22 && minor >= 12), "Use Node 22.12 or newer");
mkdirSync(destination);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const report = {
  status: "running",
  node: process.version,
  steps: [],
  examples: [],
  scope:
    "Local packed SDK, invoked Node runtime and installed declarations. No browser/Worker execution, device test, calendar-client import or independent evaluation.",
};
const run = (name, executable, args, cwd = root) => {
  try {
    const output = execFileSync(executable, args, {
      cwd,
      encoding: "utf8",
      timeout: 60000,
      stdio: "pipe",
    });
    report.steps.push({ name, exitCode: 0 });
    return output;
  } catch (error) {
    report.steps.push({ name, exitCode: error.status ?? null, error: error.message });
    throw error;
  }
};
try {
  report.pnpm = run("pnpm-version", "pnpm", ["--version"]).trim();
  run("build-sdk", "pnpm", ["build:sdk"]);
  run("pack", "pnpm", ["--dir", "packages/core", "pack", "--pack-destination", destination]);
  const archives = readdirSync(destination).filter((name) => name.endsWith(".tgz"));
  assert.equal(archives.length, 1, "Expected one packed archive");
  const archive = archives[0];
  report.archiveSha256 = hash(readFileSync(join(destination, archive)));
  writeFileSync(
    join(destination, "package.json"),
    JSON.stringify(
      { private: true, type: "module", dependencies: { "@tempus-date/core": `file:./${archive}` } },
      null,
      2,
    ) + "\n",
  );
  run("offline-install-no-scripts", "pnpm", [
    "--dir",
    destination,
    "install",
    "--offline",
    "--ignore-scripts",
  ]);
  const installed = join(destination, "node_modules/@tempus-date/core");
  const entries = run("archive-inventory", "tar", ["-tzf", join(destination, archive)])
    .trim()
    .split("\n")
    .filter((name) => !name.endsWith("/"));
  const hashes = {};
  for (const entry of entries) {
    assert.ok(
      entry.startsWith("package/") && !entry.split("/").includes(".."),
      "Unexpected archive path",
    );
    const name = entry.slice(8);
    const bytes = execFileSync("tar", ["-xOf", join(destination, archive), entry]);
    assert.equal(
      hash(readFileSync(join(installed, name))),
      hash(bytes),
      `Installed file differs: ${name}`,
    );
    hashes[name] = hash(bytes);
  }
  assert.ok(
    hashes["dist/sdk.js"] &&
      hashes["dist/sdk-calendar.js"] &&
      hashes["dist/sdk.d.ts"] &&
      hashes["dist/date-engine/timezone-LICENSE.txt"],
  );
  report.installedFileHashes = hashes;
  report.installedFilesMatch = entries.length;
  report.exampleSourceHashes = {};
  for (const name of [
    "node",
    "calendar",
    "state",
    "monthly",
    "date-list",
    "counts",
    "identifiers",
  ]) {
    const file = `${name}.mjs`;
    const source = join(root, "examples/sdk", file);
    copyFileSync(source, join(destination, file));
    report.exampleSourceHashes[file] = hash(readFileSync(source));
    const output = run(`example-${name}`, process.execPath, [join(destination, file)], destination);
    report.examples.push({ name, node: process.version, exitCode: 0, output: output.trim() });
  }
  const consumers = ["browser.ts", "calendar-browser.ts", "worker.ts", "contract.ts"];
  for (const file of consumers) {
    copyFileSync(join(root, "examples/sdk", file), join(destination, file));
    report.exampleSourceHashes[file] = hash(readFileSync(join(destination, file)));
  }
  run("installed-types", "pnpm", [
    "exec",
    "tsc",
    "--noEmit",
    "--strict",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--target",
    "ES2023",
    "--lib",
    "ES2023,DOM",
    ...consumers.map((file) => join(destination, file)),
  ]);
  report.runnerSha256 = hash(readFileSync(fileURLToPath(import.meta.url)));
  report.lockSha256 = hash(readFileSync(join(root, "pnpm-lock.yaml")));
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(join(destination, "verification.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(
  JSON.stringify({
    status: report.status,
    node: report.node,
    archiveSha256: report.archiveSha256,
    installedFilesMatch: report.installedFilesMatch,
    examples: report.examples.length,
    report: join(destination, "verification.json"),
  }),
);
