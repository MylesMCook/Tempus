import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { defineParser } from "gpu-time";
import { expect, it } from "vite-plus/test";
import { calculateDate } from "../src/shared/date-parser";
import { interpretDate } from "../src/shared/interpret-date";
import { context, fixtures, type Fixture } from "./fixtures";
import { score, validateFixtures, type Grade, type Observed } from "./scoring";

it("records the local development comparison and protects existing arithmetic", async () => {
  validateFixtures(fixtures);
  const parser = await defineParser({ backend: "cpu" });
  type Evaluation = { grade: Grade; observed: Observed; raw: unknown };
  const results: {
    fixture: Fixture;
    context: typeof context;
    tempus: Evaluation;
    interpretation: Evaluation;
    gpu: Evaluation;
  }[] = [];
  try {
    for (const fixture of fixtures) {
      const inputContext = { ...context, reference: fixture.reference ?? context.reference };
      const tempus = calculateDate(fixture.text, {
        reference: inputContext.reference,
        timezone: inputContext.timeZone,
      });
      const observedTempus: Observed = {
        occurrences: tempus.ok ? [{ start: tempus.result.iso }] : [],
        recurring: false,
        diagnostics: tempus.ok ? tempus.warnings : [tempus.error.code, tempus.error.message],
      };
      const interpretation = interpretDate(fixture.text, {
        reference: inputContext.reference,
        timezone: inputContext.timeZone,
      });
      const observedInterpretation: Observed = {
        occurrences:
          interpretation.status === "resolved"
            ? [{ start: interpretation.value.calculation.result.iso }]
            : [],
        recurring: false,
        diagnostics:
          interpretation.status === "resolved"
            ? interpretation.assumptions
            : [interpretation.status, interpretation.error.message],
      };
      let gpu: unknown;
      let observedGpu: Observed;
      try {
        const result = await parser.parse(fixture.text, inputContext);
        gpu = result;
        observedGpu = {
          occurrences: result.occurrences.map(({ start, end }) => ({
            start,
            ...(end ? { end } : {}),
          })),
          recurring: result.rrules.length > 0,
          diagnostics: result.diagnostics.map((d) => `${d.code}: ${d.message}`),
        };
      } catch (error) {
        observedGpu = {
          occurrences: [],
          recurring: false,
          diagnostics: [],
          exception: String(error),
        };
        gpu = { exception: String(error) };
      }
      results.push({
        fixture,
        context: inputContext,
        tempus: {
          grade: score(fixture.expected, observedTempus),
          observed: observedTempus,
          raw: tempus,
        },
        gpu: { grade: score(fixture.expected, observedGpu), observed: observedGpu, raw: gpu },
        interpretation: {
          grade: score(fixture.expected, observedInterpretation),
          observed: observedInterpretation,
          raw: interpretation,
        },
      });
    }
  } finally {
    parser.dispose();
  }

  const grades: Grade[] = ["correct", "correct-rejection", "abstained", "incorrect", "error"];
  const families = [...new Set(fixtures.map((f) => f.family))];
  const summary = families.flatMap((family) =>
    (["tempus", "interpretation", "gpu"] as const).map((engine) => ({
      family,
      engine,
      total: results.filter((r) => r.fixture.family === family).length,
      counts: Object.fromEntries(
        grades.map((grade) => [
          grade,
          results.filter((r) => r.fixture.family === family && r[engine].grade === grade).length,
        ]),
      ),
    })),
  );
  const packageJson = JSON.parse(
    await readFile(new URL("../node_modules/gpu-time/package.json", import.meta.url), "utf8"),
  ) as { version: string };
  const fixtureSha256 = createHash("sha256")
    .update(await readFile(new URL("./fixtures.ts", import.meta.url)))
    .digest("hex");
  const sourceHashes = Object.fromEntries(
    await Promise.all(
      [
        "src/shared/date-parser.ts",
        "src/shared/interpret-date.ts",
        "src/shared/date-engine/grammar.ts",
        "src/shared/date-engine/types.ts",
        "comparison/scoring.ts",
        "comparison/comparison.test.ts",
        "pnpm-lock.yaml",
      ].map(async (path) => [
        path,
        createHash("sha256")
          .update(await readFile(new URL(`../${path}`, import.meta.url)))
          .digest("hex"),
      ]),
    ),
  );
  const metadata = {
    corpus: "development-v1",
    fixtureSha256,
    sourceHashes,
    tempusCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    workingTreeDirty:
      execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim().length > 0,
    gpuTimeVersion: packageJson.version,
    backend: "cpu",
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
    limitations: [
      "Development fixtures; not an independent holdout or general accuracy estimate.",
      "Bounded occurrence previews only; RRULE validity, all-day flags and recurrence beyond the preview are not scored.",
      "No browser, GPU, task-completion or performance benchmark.",
      "Ambiguity and negation follow the explicitly stated Tempus product policy; policy disagreements are not automatically parser bugs.",
    ],
  };
  const directory = new URL("./results/", import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(
    new URL("report.json", directory),
    JSON.stringify({ metadata, summary, results }, null, 2) + "\n",
  );
  const markdown = [
    "# Development comparison",
    "",
    `Tempus ${metadata.tempusCommit}${metadata.workingTreeDirty ? " (working tree modified)" : ""}; gpu-time ${metadata.gpuTimeVersion}; CPU; ${process.version}.`,
    "",
    ...metadata.limitations.map((line) => `- ${line}`),
    "",
    "| Family | Engine | Cases | Correct result | Correct rejection | Abstained | Incorrect accepted result | Exception |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...summary.map(
      (row) =>
        `| ${row.family} | ${row.engine} | ${row.total} | ${grades.map((grade) => row.counts[grade]).join(" | ")} |`,
    ),
    "",
    "## Cases",
    "",
    "| Case | Tempus v2 | Interpretation | gpu-time |",
    "| --- | --- | --- | --- |",
    ...results.map(
      (row) =>
        `| ${row.fixture.id} | ${row.tempus.grade} | ${row.interpretation.grade} | ${row.gpu.grade} |`,
    ),
    "",
    "Full inputs, expectations, rationale, context and raw responses are in report.json.",
    "",
  ].join("\n");
  await writeFile(new URL("report.md", directory), markdown);
  console.table(
    summary.map(({ family, engine, total, counts }) => ({ family, engine, total, ...counts })),
  );

  // Capability gaps remain visible in the report. They must not prevent running the baseline.
  // Existing supported cases are release gates: a new recognizer cannot sacrifice arithmetic.
  for (const result of results.filter((r) => r.fixture.preserve)) {
    expect(result.tempus.grade, result.fixture.id).toBe("correct");
    expect(result.interpretation.grade, result.fixture.id).toBe("correct");
  }
  for (const result of results) {
    expect(result.gpu.grade, `${result.fixture.id}: gpu-time runtime exception`).not.toBe("error");
  }
}, 30_000);
