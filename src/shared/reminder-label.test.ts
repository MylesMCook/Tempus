import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each(["can't", "won’t", "cannot", "couldn’t", "shouldn't", "isn’t", "wasn't", "hasn’t"])(
  "does not select an event from a negative reminder clause: %s",
  (negative) => {
    const result = interpretDate(
      `Remind me to call Sam who ${negative} meet tomorrow at noon`,
      context,
    );
    expect(result.status).toBe("no-expression");
    expect(result).not.toHaveProperty("event");
  },
);
it("keeps ordinary apostrophes in names and allows a definite edited reminder", () => {
  const result = interpretDate("Call O’Toole tomorrow at noon", context);
  expect(result).toMatchObject({ status: "resolved", event: { text: "Call O’Toole" } });
});
it.each(["maybe", "perhaps", "probably", "possibly", "tentatively", "optionally"])(
  "does not absorb uncertainty into a reminder label: %s",
  (word) => {
    for (const prefix of ["Call Sam", "Remind me to call Sam"]) {
      const result = interpretDate(`${prefix} ${word} tomorrow at noon`, context);
      expect(result.status).toBe("needs-clarification");
      expect(result).not.toHaveProperty("event");
      const corrected = interpretDate(`${prefix} tomorrow at noon`, context);
      expect(corrected.status).toBe("resolved");
      if (corrected.status !== "resolved") throw new Error("Missing corrected reminder");
      expect(corrected.event?.text).toBe(prefix.startsWith("Remind") ? "call Sam" : "Call Sam");
    }
  },
);
it.each([
  ["  Call Sam tomorrow at noon!  ", "Call Sam", "tomorrow at noon", "point"],
  ["Pay rent on October 1, 2026", "Pay rent", "October 1, 2026", "point"],
  [
    "Email Jo every Monday at noon for 30 minutes",
    "Email Jo",
    "every Monday at noon for 30 minutes",
    "recurrence",
  ],
  [
    "Pick up groceries tomorrow at noon for 30 minutes",
    "Pick up groceries",
    "tomorrow at noon for 30 minutes",
    "interval",
  ],
  [
    "  Please remind me to call Sam Jones tomorrow at noon!  ",
    "call Sam Jones",
    "tomorrow at noon",
    "point",
  ],
  ["Remind me to pay credit card bill on Friday", "pay credit card bill", "Friday", "point"],
  [
    "Remind me to submit tax return tomorrow 1pm-3pm",
    "submit tax return",
    "tomorrow 1pm-3pm",
    "interval",
  ],
  [
    "Remind me to email Jo O’Brien every Monday and Wednesday at noon",
    "email Jo O’Brien",
    "every Monday and Wednesday at noon",
    "recurrence",
  ],
  [
    "Remind me to visit Jean-Luc Picard Sat Sun 1pm-3pm",
    "visit Jean-Luc Picard",
    "Sat Sun 1pm-3pm",
    "collection",
  ],
  [
    "Remind me to call Sam Jones for 3 days from today",
    "call Sam Jones",
    "for 3 days from today",
    "interval",
  ],
])("preserves the full label and date suffix: %s", (input, label, source, kind) => {
  const result = interpretDate(input, context);
  if (result.status !== "resolved") throw new Error(result.error.message);
  expect(result.value.kind).toBe(kind);
  expect(result.event?.text).toBe(label);
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe(label);
  expect(result.source.text).toBe(source);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(source);
});
it.each([
  "Remind me to call Sam tomorrow nonsense Friday",
  "Remind me to call Sam May Jones tomorrow at noon",
  "Remind me to pay bill 1040 tomorrow",
  "Remind me to call Sam Jones tomorrow and Friday",
  "Remind me to call Sam Jones tomorrow unless it rains",
  "Remind me to call Sam Jones every Monday at noon except holidays",
  "Remind me to call Sam Jones not tomorrow",
  "Remind me to call Sam Jones",
])("does not hide temporal words or conditions in a label: %s", (input) => {
  expect(interpretDate(input, context).status).not.toBe("resolved");
});
it("retains a multiword label through numeric date clarification", () => {
  const input = "Remind me to call Sam Jones on 03/04/2027";
  const first = interpretDate(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing choice");
  const result = interpretDate(input, {
    ...context,
    selection: {
      contextKey: first.clarification.contextKey,
      id: first.clarification.choices[1].id,
    },
  });
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: "call Sam Jones" },
    value: { kind: "point", precision: "date" },
  });
});

it.each(["two weeks from now", "a week from now", "one and a half weeks ago"])(
  "keeps the entire written amount in the date suffix: %s",
  (phrase) => {
    const input = `Remind me to call Sam Jones ${phrase}`;
    const result = interpretDate(input, context);
    expect(result).toMatchObject({
      status: "resolved",
      event: { text: "call Sam Jones" },
      source: { text: phrase },
    });
  },
);
it.each([
  "weekly on Monday",
  "Mondays at noon",
  "before Tuesday",
  "after Friday",
  "twice tomorrow",
  "within two days",
  "around noon",
  "every other Monday",
])("does not hide an unsupported temporal qualifier: %s", (phrase) => {
  const result = interpretDate(`Remind me to call Sam Jones ${phrase}`, context);
  expect(result.status).not.toBe("resolved");
});

it.each(["each Monday", "alternate Monday at noon", "repeat on Monday"])(
  "retains recurring qualifiers before a concrete date: %s",
  (phrase) => {
    expect(interpretDate(`Remind me to call Sam Jones ${phrase}`, context).status).not.toBe(
      "resolved",
    );
  },
);

it.each([
  ["daily at noon until 2026-09-14 except 2026-09-13", ["2026-09-12", "2026-09-14"]],
  ["weekly on Monday at noon until 2026-09-28 except 2026-09-21", ["2026-09-14", "2026-09-28"]],
] as const)("retains cadence and exclusions in the full reminder: %s", (phrase, dates) => {
  const input = `Remind me to call Sam Jones ${phrase}`;
  const result = interpretDate(input, context);
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error("Missing full schedule");
  expect(result.event?.text).toBe("call Sam Jones");
  expect(result.source.text).toBe(phrase);
  expect(result.value.occurrences.map((row) => row.start.result.local.slice(0, 10))).toEqual(dates);
  expect(result.value.truncated).toBe(false);
});
it("asks for a time on a repeating reminder without creating a single point", () => {
  const result = interpretDate("Remind me to call Sam Jones weekly on Monday", context);
  expect(result).toMatchObject({
    status: "needs-clarification",
    error: { message: "What time should this repeat?" },
  });
});

it.each([
  "Call Sam tomorrow at noon unless it rains",
  "Call Sam tomorrow nonsense Friday",
  "Call Sam around noon tomorrow",
  "Do not call Sam tomorrow",
  "Call Sam tomorrow except Friday",
  "Call tomorrow at noon",
  "Call Sam tomorrow at noon and email Jo Friday",
])("keeps incomplete or qualified direct commands unresolved: %s", (input) => {
  expect(interpretDate(input, context).status).not.toBe("resolved");
});
