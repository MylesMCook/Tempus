import { defineParser } from "gpu-time";
import { parse } from "../../packages/core/dist/sdk.js";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";

// Inspected development probes, including known Tempus gaps. Not a holdout or ranking.
const context = { reference: "2026-09-12T16:00:00Z", timeZone: "America/Chicago", limit: 3 };
const cases = [
  { input: "Call Sam tomorrow at noon", intent: "call Sam on September 13 at 17:00Z" },
  {
    input: "Dentist appointment next Tuesday at 2pm",
    intent: "dentist appointment on September 15 at 19:00Z",
  },
  {
    input: "Remind me to call Sam tomorrow at noon for half an hour",
    intent: "September 13 17:00–17:30Z; retain call Sam",
  },
  {
    input: "Remind me to call Sam tomorrow at noon for 90 minutes",
    intent: "September 13 17:00–18:30Z; retain call Sam",
  },
  {
    input: "Call Sam September 14, 2026 at noon and September 16, 2026 at noon",
    intent: "two points at 17:00Z on September 14 and 16; retain call Sam",
  },
  {
    input: "Remind me to call Sam every month on the first at noon",
    intent:
      "October 1 17:00Z, November 1 18:00Z, December 1 18:00Z preview; monthly day-one recurrence",
  },
  {
    input: "Do not call Sam tomorrow at noon",
    intent: "no event; negated scheduling instruction, not mention extraction",
  },
  {
    input: "Call Sam 03/04/2027 at noon",
    intent: "ask March 4 or April 3; no selected event before clarification",
  },
];
const parser = await defineParser({ backend: "cpu" });
const records = [];
try {
  for (const fixture of cases) {
    const tempus = parse(fixture.input, {
      timezone: context.timeZone,
      reference: context.reference,
    });
    let gpu;
    try {
      gpu = await parser.parse(fixture.input, context);
    } catch (error) {
      gpu = { exception: String(error) };
    }
    records.push({ ...fixture, tempus, gpu });
  }
} finally {
  parser.dispose();
}
const hash = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
await mkdir("comparison/results/exploratory", { recursive: true });
await writeFile(
  "comparison/results/exploratory/command-bars.json",
  JSON.stringify(
    {
      scope:
        "Eight inspected qualitative development probes. Full raw outputs; no aggregate score, human completion, export validation or comparative ranking. Intent is an authored scheduling policy, not an assertion that another policy is a library bug.",
      node: process.version,
      context,
      gpuVersion: "0.2.1",
      hashes: {
        script: await hash("comparison/exploratory/command-bars.mjs"),
        sdkEntry: await hash("packages/core/dist/sdk.js"),
        interpreter: await hash("packages/core/dist/interpret-date.js"),
        lockfile: await hash("pnpm-lock.yaml"),
      },
      records,
    },
    null,
    2,
  ) + "\n",
);
for (const { input, tempus, gpu } of records)
  console.log(
    JSON.stringify({
      input,
      tempus:
        tempus.status === "resolved"
          ? tempus.value
          : { status: tempus.status, question: tempus.clarification?.question },
      gpu: {
        occurrences: gpu.occurrences,
        rrules: gpu.rrules,
        diagnostics: gpu.diagnostics,
        exception: gpu.exception,
      },
    }),
  );
