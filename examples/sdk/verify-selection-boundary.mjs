import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const [installationArg, outputArg] = process.argv.slice(2);
assert.ok(
  installationArg && outputArg && process.argv.length === 4,
  "Usage: node verify-selection-boundary.mjs VERIFIED-INSTALL NEW-report.json",
);
const installation = resolve(installationArg);
const output = resolve(outputArg);
assert.ok(!existsSync(output), "Refuse to overwrite evidence");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const verified = JSON.parse(readFileSync(join(installation, "verification.json")));
assert.equal(verified.status, "passed");
const installed = join(installation, "node_modules/@tempus-date/core");
for (const [name, expected] of Object.entries(verified.installedFileHashes))
  assert.equal(
    hash(readFileSync(join(installed, name))),
    expected,
    `Changed installed file: ${name}`,
  );
const manifest = JSON.parse(readFileSync(join(installed, "package.json")));
const { parse, appendSelection } = await import(
  pathToFileURL(join(installed, manifest.exports["."].import)).href
);
const { prepareCalendarFile } = await import(
  pathToFileURL(join(installed, manifest.exports["./calendar"].import)).href
);
const report = {
  status: "running",
  node: process.version,
  archiveSha256: verified.archiveSha256,
  runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
  checks: [],
  scope:
    "Authored omitted-month clarification boundary checks against installed bytes. Not independent language evaluation, browser race testing or an authorization boundary for hostile SDK callers.",
};
const input = "Call Sam September 30 and October 2 and 4 at noon";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
const answers = ["list:2:month:october", "list:year:2026", "list:0:time:0", "list:1:time:0"];
const conflicts = [
  "list:2:month:september",
  "list:year:2027",
  "list:0:time:date-only",
  "list:1:time:date-only",
];
try {
  let result = parse(input, context);
  let selection;
  for (const id of answers) {
    assert.equal(result.status, "needs-clarification");
    assert.ok(result.clarification.choices.some((choice) => choice.id === id));
    assert.equal(prepareCalendarFile(result, metadata).ok, false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...context, selection });
  }
  assert.equal(result.status, "resolved");
  assert.equal(prepareCalendarFile(result, metadata).eventCount, 3);
  report.checks.push({ id: "complete-current-selection", status: "passed" });
  const unresolved = (id, text, options) => {
    const candidate = parse(text, options);
    assert.notEqual(candidate.status, "resolved", id);
    assert.equal(prepareCalendarFile(candidate, metadata).ok, false, id);
    report.checks.push({ id, status: "passed", outcome: candidate.status });
  };
  for (const [index, answer] of answers.entries()) {
    const remaining = answers.filter((id) => id !== answer);
    unresolved(`missing-${answer}`, input, {
      ...context,
      selection: {
        contextKey: selection.contextKey,
        id: remaining.at(-1),
        previous: remaining.slice(0, -1),
      },
    });
    unresolved(`conflicting-${answer}`, input, {
      ...context,
      selection: {
        ...selection,
        previous: [...(selection.previous ?? []), conflicts[index]],
      },
    });
  }
  for (const [name, text, options] of [
    ["edited-day", input.replace("4 at", "5 at"), context],
    ["edited-title", input.replace("Sam", "Jo"), context],
    ["edited-clock", input.replace("noon", "1pm"), context],
    ["edited-timezone", input, { ...context, timezone: "UTC" }],
    ["edited-reference", input, { ...context, reference: "2026-09-13T16:00:00Z" }],
  ])
    unresolved(name, text, { ...options, selection });
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(output, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
}
console.log(
  JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error }),
);
