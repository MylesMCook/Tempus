import { describe, expect, it } from "vite-plus/test";
import { score, scoreWithPrecision, validateFixtures, type Observed } from "./scoring";
import { fixtures, type Expected } from "./fixtures";

const expected: Expected = {
  kind: "resolved",
  recurring: false,
  occurrences: [{ start: "2026-09-13T17:00:00Z" }],
};
const empty: Observed = { occurrences: [], recurring: false, diagnostics: [] };

describe("comparison scoring", () => {
  it("accepts equivalent instants written with different offsets", () => {
    expect(
      score(expected, { ...empty, occurrences: [{ start: "2026-09-13T12:00:00-05:00" }] }),
    ).toBe("correct");
  });
  it("does not count rejection of a valid input as success", () => {
    expect(score(expected, empty)).toBe("abstained");
    expect(score({ kind: "ambiguous" }, empty)).toBe("abstained");
    expect(score({ kind: "no-expression" }, empty)).toBe("correct-rejection");
  });
  it("counts wrong accepted answers even when they carry a warning", () => {
    expect(
      score(expected, {
        ...empty,
        occurrences: [{ start: "2026-09-14T17:00:00Z" }],
        diagnostics: ["low-confidence"],
      }),
    ).toBe("incorrect");
  });
  it("does not mistake a matching range endpoint for a matching point", () => {
    expect(
      score(expected, {
        ...empty,
        occurrences: [{ start: "2026-09-12T17:00:00Z", end: "2026-09-13T17:00:00Z" }],
      }),
    ).toBe("incorrect");
  });
  it("requires the full preview and recurrence semantics", () => {
    const recurring: Expected = {
      kind: "resolved",
      recurring: true,
      occurrences: [{ start: "2026-09-13T17:00:00Z" }, { start: "2026-09-20T17:00:00Z" }],
    };
    expect(score(recurring, { ...empty, occurrences: recurring.occurrences })).toBe("incorrect");
    expect(
      score(recurring, {
        ...empty,
        recurring: true,
        occurrences: recurring.occurrences.slice(0, 1),
      }),
    ).toBe("incorrect");
    expect(
      score(recurring, {
        ...empty,
        recurring: true,
        occurrences: [...recurring.occurrences].reverse(),
      }),
    ).toBe("correct");
  });
  it("counts crashes separately from abstentions", () => {
    expect(score(expected, { ...empty, exception: "device unavailable" })).toBe("error");
  });
  it("does not normalize invalid dates, assume a timezone, or discard precision", () => {
    for (const start of [
      "2026-09-13T17:00:00",
      "2026-09-13T17:00:00.000001Z",
      "2026-02-30T17:00:00Z",
    ]) {
      expect(score(expected, { ...empty, occurrences: [{ start }] })).toBe("incorrect");
    }
  });
  it("rejects malformed and backwards observed intervals", () => {
    for (const end of ["invalid", "2026-09-12T17:00:00Z"]) {
      expect(
        score(expected, { ...empty, occurrences: [{ start: "2026-09-13T17:00:00Z", end }] }),
      ).toBe("incorrect");
    }
  });
  it("validates all authored expectations and rejects duplicate IDs", () => {
    expect(() => validateFixtures(fixtures)).not.toThrow();
    expect(() => validateFixtures([fixtures[0], fixtures[0]])).toThrow("Duplicate");
    expect(() =>
      validateFixtures([
        {
          id: "bad",
          rationale: "Invalid oracle",
          expected: {
            kind: "resolved",
            recurring: false,
            occurrences: [{ start: "2026-09-13T17:00:00" }],
          },
        },
      ]),
    ).toThrow("offset");
  });
});

it("does not credit matching midnight timestamps with the wrong date-only meaning", () => {
  const date = {
    kind: "resolved" as const,
    recurring: false,
    occurrences: [{ start: "2026-09-13T05:00:00Z", allDay: true }],
  };
  const timed = { ...empty, occurrences: [{ start: "2026-09-13T05:00:00Z", allDay: false }] };
  expect(score(date, timed)).toBe("correct");
  expect(scoreWithPrecision(date, timed)).toBe("incorrect");
  expect(
    scoreWithPrecision(date, { ...empty, occurrences: [{ start: "2026-09-13T05:00:00Z" }] }),
  ).toBe("not-exposed");
  expect(scoreWithPrecision(date, { ...empty, occurrences: date.occurrences })).toBe("correct");
});
it("keeps missing precision expectations and valid abstention distinct from success", () => {
  expect(scoreWithPrecision(expected, { ...empty, occurrences: expected.occurrences })).toBe(
    "not-specified",
  );
  expect(scoreWithPrecision(expected, empty)).toBe("abstained");
});
