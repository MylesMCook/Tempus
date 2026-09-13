import { expect, it } from "vite-plus/test";
import { interpretDate } from "../src/shared/interpret-date";
import { observeTempus } from "./observe-tempus";
import { scoreWithPrecision } from "./scoring";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };

it("preserves all-day collection values instead of grading them as timed", () => {
  const result = observeTempus(interpretDate("2026-09-14 and 2026-09-16", context));
  expect(result.occurrences.map((row) => row.allDay)).toEqual([true, true]);
  expect(
    scoreWithPrecision(
      {
        kind: "resolved",
        recurring: false,
        occurrences: [
          { start: "2026-09-14T05:00:00Z", allDay: true },
          { start: "2026-09-16T05:00:00Z", allDay: true },
        ],
      },
      result,
    ),
  ).toBe("correct");
});

it("keeps mixed collection precision after a date-only choice", () => {
  const input = "2026-09-14 and 2026-09-16 at noon";
  const prompt = interpretDate(input, context);
  if (prompt.status === "resolved" || !prompt.clarification) throw Error("Missing time choice");
  const result = observeTempus(
    interpretDate(input, {
      ...context,
      selection: { contextKey: prompt.clarification.contextKey, id: "list:0:time:date-only" },
    }),
  );
  expect(result.occurrences).toEqual([
    { start: "2026-09-14T05:00:00.000Z", allDay: true },
    { start: "2026-09-16T17:00:00.000Z", allDay: false },
  ]);
});

it("retains timed recurrence previews and unresolved outcomes", () => {
  const recurring = observeTempus(interpretDate("every Monday at noon", context));
  expect(recurring.recurring).toBe(true);
  expect(recurring.occurrences).toHaveLength(3);
  expect(recurring.occurrences.every((row) => row.allDay === false)).toBe(true);
  const unresolved = observeTempus(interpretDate("2026-09-14 and maybe 2026-09-16", context));
  expect(unresolved.occurrences).toEqual([]);
  expect(unresolved.recurring).toBe(false);
});
