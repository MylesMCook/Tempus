import { expect, it } from "vite-plus/test";
import { interpretRecurrence } from "./interpret-recurrence";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };

it.each([
  ["America/Sao_Paulo", "2018-11-04T12:00:00Z", "2018-11-04T14:00:00.000Z"],
  ["America/Havana", "2026-11-01T12:00:00Z", "2026-11-01T17:00:00.000Z"],
])(
  "validates the reference without inventing a midnight clock in %s",
  (timezone, reference, noon) => {
    const options = { timezone, reference };
    const result = interpretRecurrence("daily at noon", options);
    if (!result?.ok) throw new Error(JSON.stringify(result));
    expect(result.occurrences[0].start.result.iso).toBe(noon);
    expect(interpretRecurrence("daily", options)).toMatchObject({
      ok: false,
      needsClock: true,
      error: { message: "What time should this repeat?" },
    });
    // Both midnight candidates are already past at this reference instant.
    expect(interpretRecurrence("daily at midnight", options)?.ok).toBe(true);
  },
);

it("resolves the complete weekly range preview", () => {
  const result = interpretRecurrence("every Monday from 8 pm to 10 pm", context);
  if (!result?.ok) throw new Error("Expected weekly schedule");
  expect(result.occurrences.map((row) => [row.start.result.iso, row.end?.result.iso])).toEqual([
    ["2026-09-15T01:00:00.000Z", "2026-09-15T03:00:00.000Z"],
    ["2026-09-22T01:00:00.000Z", "2026-09-22T03:00:00.000Z"],
    ["2026-09-29T01:00:00.000Z", "2026-09-29T03:00:00.000Z"],
  ]);
  expect(result.truncated).toBe(true);
  expect(result.validation).toBe("preview-only");
});
it("honors inclusive boundary dates and start-date exceptions", () => {
  const result = interpretRecurrence(
    "every Monday at noon starting 2026-09-21 until 2026-10-05 except 2026-09-28",
    context,
  );
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-21T17:00:00.000Z",
    "2026-10-05T17:00:00.000Z",
  ]);
  expect(result.truncated).toBe(false);
});
it("retains local wall clocks across DST", () => {
  const result = interpretRecurrence("every Monday at noon starting 2026-10-26", context);
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-10-26T17:00:00.000Z",
    "2026-11-02T18:00:00.000Z",
    "2026-11-09T18:00:00.000Z",
  ]);
});
it.each([
  "every Sunday at 1:30 am starting 2026-11-01",
  "every Sunday at 2:30 am starting 2027-03-14",
])("rejects an ambiguous occurrence without partial success: %s", (input) => {
  const result = interpretRecurrence(input, context);
  expect(result?.ok).toBe(false);
  if (result && !result.ok) expect(result.error.code).toBe("ambiguous-time");
});
it.each([
  "every Monday at noon until 2026-02-30",
  "every Monday at noon starting 2026-10-05 until 2026-09-12",
  "every Monday at 25:00",
])("rejects invalid schedules: %s", (input) => {
  expect(interpretRecurrence(input, context)?.ok).toBe(false);
});
it.each([
  "every Monday at noon except holidays",
  "every Monday at noon unless it rains",
  "every Monday at noon and Friday",
  "not every Monday at noon",
])("does not discard a qualifier: %s", (input) => {
  const result = interpretRecurrence(input, context);
  if (input.startsWith("every"))
    expect(result).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining("repeating schedule") },
    });
  else expect(result).toBeNull();
});
it("reports empty completed schedules and explicit preview limits", () => {
  const result = interpretRecurrence(
    "every Monday at noon starting 2026-09-14 until 2026-09-14 except 2026-09-14",
    context,
  );
  expect(result).toMatchObject({ ok: true, occurrences: [], truncated: false });
  expect(interpretRecurrence("every Monday at noon", { ...context, limit: 0 })?.ok).toBe(false);
  expect(interpretRecurrence("every Monday at noon", { ...context, limit: 1 })).toMatchObject({
    ok: true,
    truncated: true,
  });
});

it("keeps overnight ranges complete and skips occurrences whose starts have passed", () => {
  const result = interpretRecurrence("every Saturday from 10 pm to midnight", context);
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.occurrences[0].start.result.iso).toBe("2026-09-13T03:00:00.000Z");
  expect(result.occurrences[0].end?.result.iso).toBe("2026-09-13T05:00:00.000Z");
  const past = interpretRecurrence("every Saturday at 10 am", context);
  if (!past?.ok) throw new Error("Missing schedule");
  expect(past.occurrences[0].start.result.iso).toBe("2026-09-19T15:00:00.000Z");
});

it("validates caller context and resource limits", () => {
  for (const options of [
    { ...context, timezone: "Invalid/Zone" },
    { ...context, reference: "invalid" },
    { ...context, limit: 101 },
    { ...context, limit: 1.5 },
  ]) {
    expect(interpretRecurrence("every Monday at noon", options)?.ok).toBe(false);
  }
});

it.each([
  "every Wednesday and Monday at noon",
  "every Mondays, Wednesdays at noon",
  "every Monday, and Wednesday at noon",
])("orders all weekdays chronologically: %s", (input) => {
  const result = interpretRecurrence(input, context);
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.rule.weekdays).toEqual([1, 3]);
  expect(result.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
    "2026-09-21T17:00:00.000Z",
  ]);
  expect(result.truncated).toBe(true);
});

it("combines inclusive bounds, exclusions and complete overnight endpoints", () => {
  const result = interpretRecurrence(
    "every Monday, Wednesday and Friday from 10 pm to midnight starting 2026-09-14 until 2026-09-18 except 2026-09-16",
    context,
  );
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.occurrences.map((row) => [row.start.result.iso, row.end?.result.iso])).toEqual([
    ["2026-09-15T03:00:00.000Z", "2026-09-15T05:00:00.000Z"],
    ["2026-09-19T03:00:00.000Z", "2026-09-19T05:00:00.000Z"],
  ]);
  expect(result.truncated).toBe(false);
});

it("keeps all local clocks across DST and orders weekend-to-weekday transitions", () => {
  const result = interpretRecurrence(
    "every Sunday and Monday at noon starting 2026-10-26",
    context,
  );
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-10-26T17:00:00.000Z",
    "2026-11-01T18:00:00.000Z",
    "2026-11-02T18:00:00.000Z",
  ]);
});

it("rejects a later ambiguous weekday without returning earlier partial occurrences", () => {
  const result = interpretRecurrence(
    "every Monday and Sunday at 1:30 am starting 2026-10-26",
    context,
  );
  expect(result?.ok).toBe(false);
  if (result && !result.ok) expect(result.error.code).toBe("ambiguous-time");
});

it("supports 100 weekly occurrences without truncating its search prematurely", () => {
  const result = interpretRecurrence("every Monday at noon", { ...context, limit: 100 });
  if (!result?.ok) throw new Error("Missing schedule");
  expect(result.occurrences).toHaveLength(100);
  expect(result.truncated).toBe(true);
  expect(result.occurrences[99].start.result.local.slice(0, 10)).toBe("2028-08-07");
});

it.each([
  "every Monday and Monday at noon",
  "every Monday, Wednesday or Friday at noon",
  "every Monday and Wednesday at noon except Fridays",
  "every Monday and Wednesday at noon and Friday at 3pm",
  "every Monday Wednesday at noon",
])("does not silently drop or duplicate a weekday: %s", (input) => {
  expect(interpretRecurrence(input, context)?.ok).not.toBe(true);
});

it.each([
  ["daily at noon", [1, 2, 3, 4, 5, 6, 7], ["2026-09-12", "2026-09-13", "2026-09-14"]],
  ["every day at noon", [1, 2, 3, 4, 5, 6, 7], ["2026-09-12", "2026-09-13", "2026-09-14"]],
  ["every weekday at noon", [1, 2, 3, 4, 5], ["2026-09-14", "2026-09-15", "2026-09-16"]],
  ["every weekend at noon", [6, 7], ["2026-09-12", "2026-09-13", "2026-09-19"]],
  ["weekly on Monday at noon", [1], ["2026-09-14", "2026-09-21", "2026-09-28"]],
] as const)("resolves the complete cadence %s", (input, days, dates) => {
  const result = interpretRecurrence(input, context);
  if (!result?.ok) throw new Error("Missing recurrence");
  expect(result.rule.weekdays).toEqual(days);
  expect(result.occurrences.map((row) => row.start.result.local.slice(0, 10))).toEqual(dates);
  expect(result.truncated).toBe(true);
});
it("retains daily bounds, exclusions and local clocks across DST", () => {
  const result = interpretRecurrence(
    "daily at noon starting 2026-10-31 until 2026-11-03 except 2026-11-02",
    context,
  );
  if (!result?.ok) throw new Error("Missing recurrence");
  expect(result.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-10-31T17:00:00.000Z",
    "2026-11-01T18:00:00.000Z",
    "2026-11-03T18:00:00.000Z",
  ]);
  expect(result.truncated).toBe(false);
});
it("rejects an unresolved daily clock without returning a partial preview", () => {
  const result = interpretRecurrence("daily at 1:30 am starting 2026-10-31", context);
  expect(result).toMatchObject({ ok: false, error: { code: "ambiguous-time" } });
});
it.each(["daily", "every weekday", "weekly on Monday"])("asks for a missing clock: %s", (input) => {
  expect(interpretRecurrence(input, context)).toMatchObject({
    ok: false,
    needsClock: true,
    error: { message: "What time should this repeat?" },
  });
});
it.each([
  "weekly on day at noon",
  "daily at noon except holidays",
  "daily at noon and 5pm",
  "every weekday from 9 am to 5 pm unless it rains",
])("does not reinterpret unsupported cadence forms: %s", (input) => {
  expect(interpretRecurrence(input, context)?.ok).not.toBe(true);
});

it.each(["at 25:00", "from 9am to 25:00", "from 9am to 9am", "from noon to 12pm"])(
  "validates written clocks even when the schedule has no future rows: %s",
  (clock) => {
    const input = `every Monday ${clock} starting 2026-01-01 until 2026-02-01`;
    const result = interpretRecurrence(input, {
      timezone: "America/Chicago",
      reference: "2026-09-12T16:00:00Z",
    });
    expect(result?.ok).toBe(false);
  },
);
it("preserves a valid expired schedule as an empty complete preview", () => {
  const result = interpretRecurrence("every Monday at noon starting 2026-01-01 until 2026-02-01", {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  });
  expect(result).toMatchObject({ ok: true, occurrences: [], truncated: false });
});

it("does not choose between conflicting occurrence answers, but permits identical answers", () => {
  const input = "every Sunday at 1:30am starting 2026-11-01";
  const question = interpretRecurrence(input, context);
  if (!question || question.ok || !question.clockPrompt) throw new Error("Missing clock choice");
  const ids = question.clockPrompt.choices.map((choice) => choice.id);
  expect(interpretRecurrence(input, { ...context, clockDecisions: ids })).toMatchObject({
    ok: false,
    clockPrompt: question.clockPrompt,
  });
  const result = interpretRecurrence(input, { ...context, clockDecisions: [ids[1], ids[1]] });
  if (!result?.ok) throw new Error("Duplicate identical choice rejected");
  expect(result.occurrences[0].start.result.iso).toBe("2026-11-01T07:30:00.000Z");
});
