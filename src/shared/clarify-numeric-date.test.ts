import { expect, it } from "vite-plus/test";
import { Temporal } from "@js-temporal/polyfill";
import { numericDateChoices } from "./clarify-numeric-date";
import { interpretDate } from "./interpret-date";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };

it.each([
  ["2027-03-04", "2027-03-04T06:00:00.000Z"],
  ["2027-04-03", "2027-04-03T05:00:00.000Z"],
])("resolves a selected numeric date %s without replacing input", (id, expected) => {
  const input = "  Remind me to call Sam 03/04/2027!";
  const result = interpretDate(input, context);
  expect(result.status).toBe("needs-clarification");
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choices");
  expect(result.clarification.choices.map((choice) => choice.label)).toEqual([
    "March 4, 2027",
    "April 3, 2027",
  ]);
  const resolved = interpretDate(input, {
    ...context,
    selection: { contextKey: result.clarification.contextKey, id },
  });
  if (resolved.status !== "resolved" || resolved.value.kind !== "point")
    throw new Error("Missing point");
  expect(resolved.value.calculation.result.iso).toBe(expected);
  expect(resolved.event?.text).toBe("call Sam");
  expect(input.slice(resolved.source.span.start, resolved.source.span.end)).toBe("03/04/2027");
});

it("rejects stale and unknown choices", () => {
  const input = "03/04/2027";
  const result = interpretDate(input, context);
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choices");
  const selection = { contextKey: result.clarification.contextKey, id: "2027-03-04" };
  for (const changed of [
    { ...context, timezone: "UTC" },
    { ...context, reference: "2026-09-13T16:00:00Z" },
  ]) {
    expect(interpretDate(input, { ...changed, selection }).status).toBe("needs-clarification");
  }
  expect(interpretDate("04/05/2027", { ...context, selection }).status).toBe("needs-clarification");
  expect(
    interpretDate(input, { ...context, selection: { ...selection, id: "injected" } }).status,
  ).toBe("needs-clarification");
});

it("does not eliminate a date-order alternative because its clock falls in a DST gap", () => {
  const input = "03/08/2026 at 2:30 am";
  const result = interpretDate(input, context);
  expect(result.status).toBe("needs-clarification");
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choices");
  expect(result.clarification.choices).toHaveLength(2);
  const selected = interpretDate(input, {
    ...context,
    selection: { contextKey: result.clarification.contextKey, id: "2026-03-08" },
  });
  expect(selected.status).toBe("needs-clarification");
});

it.each(["13/04/2027", "04/04/2027"])("resolves %s when only one calendar date exists", (input) => {
  expect(interpretDate(input, context).status).toBe("resolved");
});

it.each(["31/02/2027", "00/04/2027", "03/04/0000", "03/04/2027 extra"])(
  "rejects invalid or incomplete %s",
  (input) => {
    expect(interpretDate(input, context).status).not.toBe("resolved");
  },
);

it("keeps numeric date labels identical across low years, leap dates and month boundaries", () => {
  for (const year of [1, 99, 100, 1582, 1900, 2000, 2026, 9999]) {
    for (let month = 1; month <= 12; month++) {
      for (const day of [1, 4, 12, 28, 29, 30, 31]) {
        const choices = numericDateChoices(`${month}/${day}/${String(year).padStart(4, "0")}`);
        for (const choice of choices ?? []) {
          const date = Temporal.PlainDate.from(choice.id);
          expect(choice.label).toBe(
            date.toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
          );
        }
      }
    }
  }
});
