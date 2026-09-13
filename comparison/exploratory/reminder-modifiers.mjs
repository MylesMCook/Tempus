import { parse } from "../../packages/core/dist/sdk.js";
import { prepareCalendarFile } from "../../packages/core/dist/sdk-calendar.js";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const cases = [
  ["Call Sam maybe tomorrow at noon", false],
  ["Remind me to call Sam probably tomorrow at noon", false],
  ["Call Sam who can’t meet tomorrow at noon", false],
  ["Call Sam who won’t be available tomorrow at noon", false],
  ["Call Sam tomorrow at noon unless it rains", false],
  ["Call Sam if available tomorrow at noon", false],
  ["Call Sam tentatively tomorrow at noon", false],
  ["Call Sam optionally tomorrow at noon", false],
  ["Call Sam provided that tomorrow at noon works", false],
  ["Call Sam assuming tomorrow at noon works", false],
  ["Call Sam tomorrow at noon subject to approval", false],
  ["Call Sam after lunch tomorrow at noon", false],
  ["Call Sam around tomorrow at noon", false],
  ["Call Sam tomorrow at noon", true],
  ["Call Will tomorrow at noon", true],
  ["Call O’Toole tomorrow at noon", true],
  ["Remind me to pay credit card bill tomorrow at noon", true],
];
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Edited reminder",
  pointMode: "instant",
};
const records = cases.map(([input, shouldResolve]) => {
  const result = parse(input, context);
  const file = prepareCalendarFile(result, metadata);
  const accepted = result.status === "resolved";
  const passed = accepted === shouldResolve && file.ok === shouldResolve;
  return { input, shouldResolve, passed, result, exportAllowed: file.ok };
});
const corrected = parse("Call Sam tomorrow at noon", context);
const correctedFile = prepareCalendarFile(corrected, metadata);
if (corrected.status !== "resolved" || !correctedFile.ok)
  throw new Error("Definite edited reminder did not produce a file");
const out = process.argv[2];
if (!out) throw new Error("Usage: node reminder-modifiers.mjs NEW-output-directory");
await mkdir(out);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
await writeFile(
  `${out}/report.json`,
  JSON.stringify(
    {
      scope:
        "Seventeen inspected development cases. Expected accept/refuse policy authored before this run. No independent evaluation or comparative ranking.",
      context,
      records,
      corrected: { result: corrected, exportAllowed: correctedFile.ok },
      hashes: {
        script: digest(await readFile(new URL(import.meta.url))),
        interpreter: digest(
          await readFile(new URL("../../packages/core/dist/interpret-date.js", import.meta.url)),
        ),
      },
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    total: records.length,
    failed: records
      .filter((row) => !row.passed)
      .map(({ input, result, exportAllowed }) => ({ input, status: result.status, exportAllowed })),
  }),
);
if (records.some((row) => !row.passed)) process.exitCode = 1;
