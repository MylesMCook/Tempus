import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const [installationArg, evidenceArg, outputArg] = process.argv.slice(2);
assert.ok(
  installationArg && evidenceArg && outputArg && process.argv.length === 5,
  "Usage: node comparison/replay-packed.mjs VERIFIED-INSTALL SOURCE-SNAPSHOT NEW-report.json",
);
const installation = resolve(installationArg),
  evidence = resolve(evidenceArg),
  output = resolve(outputArg);
assert.ok(!existsSync(output), "Refuse to overwrite evidence");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const verified = json(join(installation, "verification.json"));
assert.equal(verified.status, "passed");
const packageRoot = join(installation, "node_modules/@tempus-date/core");
for (const [name, expected] of Object.entries(verified.installedFileHashes))
  assert.equal(hash(readFileSync(join(packageRoot, name))), expected, `Installed file: ${name}`);
const manifest = json(join(evidence, "manifest.json"));
assert.equal(manifest.format, "tempus-development-evidence-v1");
for (const [name, expected] of Object.entries(manifest.files)) {
  assert.ok(!name.startsWith("/") && !name.split("/").includes(".."));
  assert.equal(hash(readFileSync(join(evidence, name))), expected, `Snapshot file: ${name}`);
}
const sdk = await import(pathToFileURL(join(packageRoot, "dist/sdk.js")));
const calendar = await import(pathToFileURL(join(packageRoot, "dist/sdk-calendar.js")));
const report = {
  status: "running",
  node: process.version,
  archiveSha256: verified.archiveSha256,
  manifestSha256: hash(readFileSync(join(evidence, "manifest.json"))),
  runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  cases: [],
  journeys: [],
  scope:
    "Installed SDK equality with inspected source replay: not independent evaluation, new accuracy evidence, browser interaction or calendar-client import.",
};
// JSON normalization matches the representation retained by the source runner.
const recorded = (value) => JSON.parse(JSON.stringify(value));
try {
  for (const row of json(join(evidence, "report.json")).results) {
    const context = { reference: row.context.reference, timezone: row.context.timeZone };
    assert.deepEqual(
      recorded(sdk.calculateDate(row.fixture.text, context)),
      row.tempus.raw,
      row.fixture.id,
    );
    const {
      sdkVersion,
      input,
      context: resultContext,
      ...interpretation
    } = sdk.parse(row.fixture.text, context);
    assert.equal(input, row.fixture.text);
    assert.deepEqual(resultContext, context);
    assert.equal(sdkVersion, sdk.SDK_VERSION);
    assert.deepEqual(recorded(interpretation), row.interpretation.raw, row.fixture.id);
    report.cases.push({ id: row.fixture.id, status: "matched-source" });
  }
  for (const row of json(join(evidence, "journeys.json")).records) {
    assert.equal(row.status, "passed", `Source journey incomplete: ${row.id}`);
    let selection, result;
    for (const step of row.steps) {
      if (step.action === "input") result = sdk.parse(row.input, row.context);
      else if (step.action === "choice") {
        assert.equal(result.status, "needs-clarification");
        assert.ok(result.clarification.choices.some((choice) => choice.id === step.id));
        assert.equal(
          calendar.prepareCalendarFile(result, {
            uid: "11111111-2222-4333-8444-555555555555",
            stamp: row.reference,
            title: row.event ?? "call Sam",
          }).ok,
          false,
        );
        selection = sdk.appendSelection(selection, {
          contextKey: result.clarification.contextKey,
          id: step.id,
        });
        result = sdk.parse(row.input, { ...row.context, selection });
      } else if (step.action === "edit")
        result = sdk.parse(row.editedInput ?? row.input + " ", { ...row.context, selection });
      else if (step.action === "file-validation") {
        assert.equal(result.status, "resolved");
        const metadata = {
          uid: "11111111-2222-4333-8444-555555555555",
          stamp: row.reference,
          reference: row.reference,
          title: result.event.text,
          pointMode:
            result.value.kind === "point" && result.value.precision === "date" ? "date" : "instant",
        };
        const file =
          result.value.kind === "recurrence"
            ? calendar.prepareRecurringCalendarFile(result, metadata)
            : calendar.prepareCalendarFile(result, metadata);
        assert.equal(file.ok, true);
        assert.equal(hash(file.text), step.fileSha256, row.id);
        continue;
      } else throw new Error(`Unknown replay step: ${step.action}`);
      assert.deepEqual(recorded(result), step.result, `${row.id}: ${step.action}`);
    }
    report.journeys.push({ id: row.id, stages: row.steps.length, status: "matched-source" });
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(output, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
}
console.log(
  JSON.stringify({
    status: report.status,
    cases: report.cases.length,
    journeys: report.journeys.length,
    error: report.error,
  }),
);
