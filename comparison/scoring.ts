import type { Expected, Occurrence } from "./fixtures";
import { Temporal } from "@js-temporal/polyfill";

export type Observed = {
  occurrences: Occurrence[];
  recurring: boolean;
  diagnostics: string[];
  exception?: string;
};
export type Grade = "correct" | "correct-rejection" | "abstained" | "incorrect" | "error";

function instant(value: string): bigint {
  // Require an explicit offset and preserve precision; Date.parse normalizes some invalid dates.
  return Temporal.Instant.from(value).epochNanoseconds;
}

function canonical(occurrences: Occurrence[]): string[] {
  return occurrences
    .map(({ start, end }) => {
      const a = instant(start);
      const b = end === undefined ? undefined : instant(end);
      if (b !== undefined && b <= a) throw new Error("An interval must end after it starts.");
      return JSON.stringify([a.toString(), b?.toString() ?? null]);
    })
    .sort();
}

export function score(expected: Expected, observed: Observed): Grade {
  if (observed.exception !== undefined) return "error";
  if (observed.occurrences.length === 0) {
    // A rule without a usable preview is not an empty/no-expression response.
    if (observed.recurring) return "incorrect";
    return expected.kind === "invalid" || expected.kind === "no-expression"
      ? "correct-rejection"
      : "abstained";
  }
  if (expected.kind !== "resolved") return "incorrect";
  try {
    return observed.recurring === expected.recurring &&
      JSON.stringify(canonical(expected.occurrences)) ===
        JSON.stringify(canonical(observed.occurrences))
      ? "correct"
      : "incorrect";
  } catch {
    return "incorrect";
  }
}

export function validateFixtures(
  fixtures: { id: string; expected: Expected; rationale: string }[],
) {
  const ids = new Set<string>();
  for (const fixture of fixtures) {
    if (ids.has(fixture.id)) throw new Error(`Duplicate fixture: ${fixture.id}`);
    ids.add(fixture.id);
    if (!fixture.rationale.trim()) throw new Error(`Missing rationale: ${fixture.id}`);
    if (fixture.expected.kind === "resolved") {
      if (!fixture.expected.occurrences.length) throw new Error(`Empty oracle: ${fixture.id}`);
      for (const occurrence of fixture.expected.occurrences) {
        for (const value of [occurrence.start, occurrence.end].filter((v) => v !== undefined)) {
          if (!/(Z|[+-]\d{2}:\d{2})$/.test(value))
            throw new Error(`Missing UTC offset: ${fixture.id}`);
        }
      }
      canonical(fixture.expected.occurrences);
    }
  }
}

/** Additional preview check, not a complete semantic or calendar-export grade.
 * Preserve the legacy timestamp grade so historical results stay comparable.
 */
export function scoreWithPrecision(
  expected: Expected,
  observed: Observed,
): Grade | "not-exposed" | "not-specified" {
  const timestampGrade = score(expected, observed);
  if (timestampGrade !== "correct" || expected.kind !== "resolved") return timestampGrade;
  if (expected.occurrences.some((row) => row.allDay === undefined)) return "not-specified";
  if (observed.occurrences.some((row) => row.allDay === undefined)) return "not-exposed";
  const values = (rows: Occurrence[]) =>
    rows
      .map((row) =>
        JSON.stringify([
          instant(row.start).toString(),
          row.end === undefined ? null : instant(row.end).toString(),
          row.allDay,
        ]),
      )
      .sort();
  return JSON.stringify(values(expected.occurrences)) ===
    JSON.stringify(values(observed.occurrences))
    ? "correct"
    : "incorrect";
}
