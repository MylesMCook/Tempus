import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync, writeFileSync, realpathSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

// Static bundle/import review of an already verified installation. No package or network mutations.
const [installationArg, reportArg] = process.argv.slice(2);
assert.ok(
  installationArg && reportArg && process.argv.length === 4,
  "Usage: node verify-import-closure.mjs VERIFIED-INSTALL NEW-report.json",
);
const installation = resolve(installationArg);
const output = resolve(reportArg);
assert.ok(!existsSync(output), "Refuse to overwrite prior evidence");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const verified = JSON.parse(readFileSync(join(installation, "verification.json")));
assert.equal(verified.status, "passed");
const installed = realpathSync(join(installation, "node_modules/@tempus-date/core"));
for (const [name, expected] of Object.entries(verified.installedFileHashes))
  assert.equal(
    hash(readFileSync(join(installed, name))),
    expected,
    `Changed installed file: ${name}`,
  );
const manifest = JSON.parse(readFileSync(join(installed, "package.json")));
assert.deepEqual(Object.keys(manifest.exports).sort(), [".", "./calendar"]);
const owner = (file) => {
  for (let folder = dirname(file); ; folder = dirname(folder)) {
    if (existsSync(join(folder, "package.json"))) {
      const bytes = readFileSync(join(folder, "package.json"));
      return { folder, manifest: JSON.parse(bytes), manifestSha256: hash(bytes) };
    }
    assert.notEqual(folder, dirname(folder), `No package owner: ${file}`);
  }
};
const bundles = {};
const packages = {};
for (const [entry, target] of Object.entries(manifest.exports)) {
  const result = buildSync({
    absWorkingDir: installation,
    entryPoints: [join(installed, target.import)],
    bundle: true,
    platform: "browser",
    format: "esm",
    target: "es2022",
    write: false,
    metafile: true,
    logLevel: "silent",
  });
  const inputs = {};
  for (const [name, info] of Object.entries(result.metafile.inputs)) {
    const path = resolve(installation, name);
    const pkg = owner(path);
    const id = `${pkg.manifest.name}@${pkg.manifest.version}`;
    packages[id] = {
      dependencies: pkg.manifest.dependencies ?? {},
      manifestSha256: pkg.manifestSha256,
    };
    const imports = info.imports.map((edge) => {
      assert.ok(!edge.external, `External import remains: ${edge.path}`);
      const dependency = owner(resolve(installation, edge.path));
      if (dependency.folder !== pkg.folder) {
        assert.ok(
          Object.hasOwn(pkg.manifest.dependencies ?? {}, dependency.manifest.name),
          `Undeclared runtime dependency: ${id} -> ${dependency.manifest.name}`,
        );
      }
      return {
        package: `${dependency.manifest.name}@${dependency.manifest.version}`,
        file: relative(dependency.folder, resolve(installation, edge.path)),
        kind: edge.kind,
      };
    });
    inputs[`${id}/${relative(pkg.folder, path)}`] = { sha256: hash(readFileSync(path)), imports };
  }
  const outputs = Object.values(result.metafile.outputs);
  assert.ok(
    outputs.every((item) => item.imports.length === 0),
    "Bundle still needs external imports",
  );
  bundles[entry] = {
    inputs,
    exports: outputs.flatMap((item) => item.exports).sort(),
    bundleSha256: hash(result.outputFiles[0].contents),
  };
}
writeFileSync(
  output,
  JSON.stringify(
    {
      status: "passed",
      archiveSha256: verified.archiveSha256,
      runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
      packages,
      bundles,
      scope:
        "Browser-platform bundle and declared import closure of current public entries. No unresolved externals or undeclared cross-package edges. Not runtime execution, side-effect proof, vulnerability scan, dependency provenance or independent review.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    status: "passed",
    packages: Object.keys(packages),
    entries: Object.keys(bundles),
  }),
);
