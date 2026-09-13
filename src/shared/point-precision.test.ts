import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each([
  ["tomorrow", "date", "default"],
  ["tomorrow at midnight", "time", "explicit"],
  ["tomorrow at noon", "time", "explicit"],
  ["now", "time", "reference"],
  ["in 3 weeks", "time", "reference"],
  ["2026-01-31 plus 1 month", "date", "default"],
  ["2026-01-31 plus 0.5 years", "date", "default"],
  ["today plus 0.5 days", "time", "arithmetic"],
  ["today plus 0.5 days plus 0.5 days", "time", "arithmetic"],
  ["today plus 24 hours", "time", "arithmetic"],
  ["today plus 0 hours", "time", "arithmetic"],
  ["Remind me to call Sam tomorrow", "date", "default"],
])("retains the source of clock precision: %s", (input, precision, clockSource) => {
  const result = interpretDate(input, context);
  expect(result).toMatchObject({
    status: "resolved",
    value: { kind: "point", precision, clockSource },
  });
});
it("distinguishes equal instants with different supplied precision", () => {
  const date = interpretDate("tomorrow", context);
  const time = interpretDate("tomorrow at midnight", context);
  if (
    date.status !== "resolved" ||
    time.status !== "resolved" ||
    date.value.kind !== "point" ||
    time.value.kind !== "point"
  )
    throw new Error("Missing points");
  expect(date.value.calculation.result).toEqual(time.value.calculation.result);
  expect(date.value.precision).not.toBe(time.value.precision);
  expect(calculateDate("tomorrow", context)).not.toHaveProperty("precision");
});
it.each([
  ["03/04/2027", "date", "default"],
  ["03/04/2027 at noon", "time", "explicit"],
  ["November 1, 2026 at 1:30am", "time", "explicit"],
])("retains precision after selecting %s", (input, precision, clockSource) => {
  const first = interpretDate(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing choice");
  const selected = interpretDate(input, {
    ...context,
    selection: {
      contextKey: first.clarification.contextKey,
      id: first.clarification.choices[0].id,
    },
  });
  expect(selected).toMatchObject({ status: "resolved", value: { precision, clockSource } });
});

it("keeps the precision of the user's selected correction", () => {
  const input = "Friday, actually Saturday at noon";
  const first = interpretDate(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing correction");
  for (const [id, precision] of [
    ["keep", "date"],
    ["replace", "time"],
  ]) {
    const result = interpretDate(input, {
      ...context,
      selection: { contextKey: first.clarification.contextKey, id },
    });
    expect(result).toMatchObject({ status: "resolved", value: { kind: "point", precision } });
  }
});
