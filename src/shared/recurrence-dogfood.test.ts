import { expect, it } from "vite-plus/test";
import { interpretRecurrence } from "./interpret-recurrence";
import { interpretDate } from "./interpret-date";
import { appendSelection } from "./clarify-numeric-date";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const january = { timezone: "UTC", reference: "2026-01-01T00:00:00Z" };
const dates = (text: string, options = context) => {
  const result = interpretRecurrence(text, options);
  if (!result?.ok) throw Error(JSON.stringify(result));
  return result.occurrences.map((row) => row.start.result.local.slice(0, 10));
};

it("recognizes plural weekdays with and without clocks", () => {
  expect(dates("Mondays at noon")).toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
  expect(interpretDate("Mondays", context)).toMatchObject({
    status: "needs-clarification",
    error: { message: "What time should this repeat?" },
  });
  expect(interpretRecurrence("Mondays starting tomorrow until October 1", context)).toMatchObject({
    ok: false,
    needsClock: true,
  });
});

it("canonicalizes named and relative inclusive boundaries without altering the source", () => {
  const input = "Mondays at noon starting next Monday until September 28, 2026";
  const result = interpretDate(input, context);
  expect(result).toMatchObject({
    status: "resolved",
    source: { text: input },
    value: {
      rule: { starting: "2026-09-14", until: "2026-09-28" },
      truncated: false,
    },
  });
  expect(dates(input)).toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
});

it("resolves relative boundaries against the supplied local date, not UTC", () => {
  const options = { timezone: "America/Los_Angeles", reference: "2026-09-14T01:00:00Z" };
  expect(dates("daily at noon starting tomorrow until September 15, 2026", options)).toEqual([
    "2026-09-14",
    "2026-09-15",
  ]);
  expect(dates("daily at noon starting in 2 days until in 3 days", options)).toEqual([
    "2026-09-15",
    "2026-09-16",
  ]);
});

it("retains independent numeric boundary ambiguity and then canonicalizes the chosen dates", () => {
  const input = "every Monday at noon starting 09/10/2026 until 11/12/2026";
  const first = interpretDate(input, context);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error("No start choice");
  let selection = {
    contextKey: first.clarification.contextKey,
    id: "boundary:starting:date:2026-09-10",
  };
  const second = interpretDate(input, { ...context, selection });
  expect(second).toMatchObject({
    status: "needs-clarification",
    clarification: { question: expect.stringContaining("until") },
  });
  if (second.status !== "needs-clarification" || !second.clarification)
    throw Error("No end choice");
  selection = appendSelection(selection, {
    contextKey: second.clarification.contextKey,
    id: "boundary:until:date:2026-11-12",
  })!;
  expect(interpretDate(input, { ...context, selection })).toMatchObject({
    status: "resolved",
    value: { rule: { starting: "2026-09-10", until: "2026-11-12" } },
  });
  expect(
    interpretDate(input, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
});

it.each([
  "every month on the last Friday at noon",
  "weekly at noon",
  "every Monday at noon unless it rains",
  "every Monday at noon except holidays",
  "Mondays at noon and Friday",
])("reports recurrence-specific unsupported wording: %s", (input) => {
  expect(interpretRecurrence(input, context)).toMatchObject({
    ok: false,
    error: { message: expect.stringContaining("repeating schedule") },
  });
});

it.each([
  "every month on the 31st at noon until January 31, 2026",
  "every month on the 31st at noon for 1 occurrence",
  "every month on the 30th at noon until January 30, 2026",
  "every month on the 31st at noon until March 31, 2026 except 2026-02-28",
])("omits the short-month choice when the full finite output is identical: %s", (input) => {
  expect(interpretRecurrence(input, january)).toMatchObject({ ok: true });
});

it("uses the actual leap year and inclusive ending day", () => {
  expect(
    interpretRecurrence("every month on the 29th at noon until February 29, 2028", {
      ...january,
      reference: "2028-01-01T00:00:00Z",
    }),
  ).toMatchObject({ ok: true });
  expect(
    interpretRecurrence("every month on the 29th at noon until February 28, 2026", january),
  ).toMatchObject({ ok: false, policyPrompt: expect.anything() });
});

it("checks beyond the preview for the first short-month difference", () => {
  const input = "every month on the 29th at noon for 14 occurrences";
  expect(interpretRecurrence(input, { ...january, limit: 1 })).toMatchObject({
    ok: false,
    policyPrompt: { question: "What happens in months without day 29?" },
  });
  expect(
    interpretRecurrence("every month on the 29th at noon until March 1, 2027", {
      ...january,
      reference: "2026-03-01T00:00:00Z",
      limit: 1,
    }),
  ).toMatchObject({ ok: false, policyPrompt: expect.anything() });
});

it("compares count slots even when the differing short-month date is excluded", () => {
  const input = "every month on the 31st at noon for 2 occurrences except 2026-02-28";
  expect(
    interpretRecurrence(input, { ...january, policyDecisions: ["count:exclusions:replace"] }),
  ).toMatchObject({ ok: true });
  expect(
    interpretRecurrence(input, { ...january, policyDecisions: ["count:exclusions:consume"] }),
  ).toMatchObject({ ok: false, policyPrompt: expect.anything() });
});

it("compares the schedule after selected past-count semantics, not only upcoming months", () => {
  const input = "every month on the 31st at noon for 2 occurrences starting January 1, 2026";
  const options = { ...january, reference: "2026-03-01T00:00:00Z" };
  expect(
    interpretRecurrence(input, { ...options, policyDecisions: ["count:past:consume"] }),
  ).toMatchObject({ ok: false, policyPrompt: expect.anything() });
  expect(
    interpretRecurrence(
      "every month on the 31st at noon for 1 occurrence starting January 1, 2026",
      { ...options, policyDecisions: ["count:past:consume"] },
    ),
  ).toMatchObject({ ok: true, occurrences: [] });
  expect(
    interpretRecurrence(
      "every month on the 31st at noon for 1 occurrence starting January 1, 2026",
      { ...options, policyDecisions: ["count:past:upcoming"] },
    ),
  ).toMatchObject({ ok: true, occurrences: [expect.anything()] });
});

it("does not ask about short months that are wholly in the past for an uncounted schedule", () => {
  expect(
    interpretRecurrence(
      "every month on the 31st at noon starting January 1, 2026 until March 31, 2026",
      { ...january, reference: "2026-03-01T00:00:00Z" },
    ),
  ).toMatchObject({ ok: true });
});

it.each([29, 30, 31])("still asks about day %s in an open-ended schedule", (day) => {
  expect(interpretRecurrence(`every month on ${day} at noon`, january)).toMatchObject({
    ok: false,
    policyPrompt: expect.anything(),
  });
});

it("never silently discards a time-valued recurrence boundary", () => {
  expect(
    interpretRecurrence("every Monday at noon starting tomorrow at 4pm", context),
  ).toMatchObject({
    ok: false,
    error: { message: expect.stringContaining("calendar date") },
  });
});
