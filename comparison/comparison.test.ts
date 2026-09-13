import { observeTempus } from "./observe-tempus";
import { sourceHashes as sharedSourceHashes, gitIdentity } from "./provenance";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { defineParser } from "gpu-time";
import { expect, it } from "vite-plus/test";
import { calculateDate } from "../src/shared/date-parser";
import { interpretDate } from "../src/shared/interpret-date";
import { context, fixtures, type Fixture } from "./fixtures";
import { score, scoreWithPrecision, validateFixtures, type Grade, type Observed } from "./scoring";

it("records the local development comparison and protects existing arithmetic", async () => {
  validateFixtures(fixtures);
  const parser = await defineParser({ backend: "cpu" });
  type Evaluation = {
    grade: Grade;
    valueGrade: ReturnType<typeof scoreWithPrecision>;
    observed: Observed;
    raw: unknown;
  };
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
      const observedInterpretation = observeTempus(interpretation);
      let gpu: unknown;
      let observedGpu: Observed;
      try {
        const result = await parser.parse(fixture.text, inputContext);
        gpu = result;
        observedGpu = {
          occurrences: result.occurrences.map(({ start, end, allDay }) => ({
            start,
            allDay,
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
          valueGrade: scoreWithPrecision(fixture.expected, observedTempus),
          observed: observedTempus,
          raw: tempus,
        },
        gpu: {
          grade: score(fixture.expected, observedGpu),
          valueGrade: scoreWithPrecision(fixture.expected, observedGpu),
          observed: observedGpu,
          raw: gpu,
        },
        interpretation: {
          grade: score(fixture.expected, observedInterpretation),
          valueGrade: scoreWithPrecision(fixture.expected, observedInterpretation),
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
  const valueGrades = [...grades, "not-exposed", "not-specified"] as const;
  const valueSummary = families.flatMap((family) =>
    (["tempus", "interpretation", "gpu"] as const).map((engine) => ({
      family,
      engine,
      total: results.filter((row) => row.fixture.family === family).length,
      counts: Object.fromEntries(
        valueGrades.map((grade) => [
          grade,
          results.filter((row) => row.fixture.family === family && row[engine].valueGrade === grade)
            .length,
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
  const sourceHashes = await sharedSourceHashes([
    "comparison/fixtures.ts",
    "comparison/scoring.ts",
    "comparison/observe-tempus.ts",
    "comparison/comparison.test.ts",
  ]);
  const metadata = {
    corpus: "development-v4-precision",
    fixtureSha256,
    sourceHashes,
    ...gitIdentity(),
    gpuTimeVersion: packageJson.version,
    backend: "cpu",
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
    scoringCoverage: {
      timestampGrade: [
        "preview instants",
        "interval endpoints",
        "occurrence multiplicity",
        "recurrence flag",
      ],
      valueGradeAdds: ["explicit all-day flags"],
      unscored: [
        "occurrence order",
        "event text",
        "source spans",
        "full recurrence rule",
        "occurrences beyond preview",
        "interactive correction",
        "calendar export",
        "human task completion",
      ],
    },
    limitations: [
      "Development fixtures; not an independent holdout or general accuracy estimate.",
      "Legacy grade scores preview timestamps/recurrence flag only. Value grade additionally checks explicit all-day flags; missing precision is not success. Occurrence order, event text/spans, full RRULE semantics and recurrence beyond the preview remain unscored. Both preview grades compare sorted values; they do not verify written or chronological order.",
      "No browser, GPU, task-completion or performance benchmark.",
      "Ambiguity and negation follow the explicitly stated Tempus product policy; policy disagreements are not automatically parser bugs.",
    ],
  };
  const directory = new URL("./results/", import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(
    new URL("report.json", directory),
    JSON.stringify({ metadata, summary, valueSummary, results }, null, 2) + "\n",
  );
  const markdown = [
    "# Development comparison",
    "",
    `Tempus ${metadata.tempusCommit ?? "source snapshot (Git metadata absent; use source hashes)"}${metadata.workingTreeDirty ? " (working tree modified)" : ""}; gpu-time ${metadata.gpuTimeVersion}; CPU; ${process.version}.`,
    "",
    ...metadata.limitations.map((line) => `- ${line}`),
    "",
    "| Family | Engine | Cases | Matching timestamp preview | Correct rejection | Abstained | Incorrect accepted preview | Exception |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...summary.map(
      (row) =>
        `| ${row.family} | ${row.engine} | ${row.total} | ${grades.map((grade) => row.counts[grade]).join(" | ")} |`,
    ),
    "",
    "## Cases",
    "",
    "Legacy timestamp preview grade:",
    "",
    "| Case | Tempus v2 | Interpretation | gpu-time |",
    "| --- | --- | --- | --- |",
    ...results.map(
      (row) =>
        `| ${row.fixture.id} | ${row.tempus.grade} | ${row.interpretation.grade} | ${row.gpu.grade} |`,
    ),
    "",
    "## Preview values including date-only meaning",
    "",
    "`correct` here requires matching preview timestamps, recurrence flag and all-day flags. It does not check occurrence order and is not complete semantic or export validation. Strict v2 does not expose precision; its matching timestamps are marked `not-exposed` rather than inferring meaning from midnight.",
    "",
    "| Family | Engine | Cases | Correct preview value | Correct rejection | Abstained | Incorrect accepted value | Exception | Precision not exposed | Precision not specified |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...valueSummary.map(
      (row) =>
        `| ${row.family} | ${row.engine} | ${row.total} | ${valueGrades.map((grade) => row.counts[grade]).join(" | ")} |`,
    ),
    "",
    "| Case | Tempus v2 value | Interpretation value | gpu-time value |",
    "| --- | --- | --- | --- |",
    ...results.map(
      (row) =>
        `| ${row.fixture.id} | ${row.tempus.valueGrade} | ${row.interpretation.valueGrade} | ${row.gpu.valueGrade} |`,
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
