import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };

it.each([
  ["2026-09-12 8pm-8pm", 24],
  ["2026-03-07 noon-noon", 23],
  ["2026-10-31 noon-noon", 25],
])("requires confirmation for matching clocks: %s", (input, hours) => {
  const first = interpretDate(input, context);
  expect(first.status).toBe("needs-clarification");
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing choice");
  expect(first.clarification.choices).toHaveLength(1);
  const selection = {
    contextKey: first.clarification.contextKey,
    id: first.clarification.choices[0].id,
  };
  const chosen = interpretDate(input, { ...context, selection });
  expect(chosen.status).toBe("resolved");
  if (chosen.status !== "resolved" || chosen.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(chosen.value.end.result.timestamp - chosen.value.start.result.timestamp).toBe(
    Number(hours) * 3600000,
  );
  expect(chosen.value.overnight).toBe(true);
  expect(chosen.apiReplay).toBe(false);
  expect(chosen.selectedChoice).toBeTruthy();
  expect(interpretDate(`${input} `, { ...context, selection }).status).toBe("needs-clarification");
  expect(interpretDate(input, { ...context, timezone: "UTC", selection }).status).toBe(
    "needs-clarification",
  );
  expect(
    interpretDate(input, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
  expect(calculateDate(input, context).ok).toBe(false);
});

it("keeps the full reminder and source spans after confirmation", () => {
  const input = "  Remind me to call Sam tomorrow 8pm-8pm.";
  const first = interpretDate(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing choice");
  const result = interpretDate(input, {
    ...context,
    selection: {
      contextKey: first.clarification.contextKey,
      id: first.clarification.choices[0].id,
    },
  });
  if (result.status !== "resolved") throw new Error("Missing result");
  expect(result.event?.text).toBe("call Sam");
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe("tomorrow 8pm-8pm");
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe("call Sam");
});

it.each(["tomorrow 8pm-8pm except holidays", "every Monday 8pm-8pm"])(
  "does not offer an incomplete interpretation: %s",
  (input) => {
    const result = interpretDate(input, context);
    expect(result.status).not.toBe("resolved");
    if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
  },
);
