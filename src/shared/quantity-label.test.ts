import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
import { prepareCalendarFile } from "./calendar-file";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Buy 3 apples",
};
it.each([
  "Buy 3 apples",
  "Send 2 invoices",
  "Buy 3 apples and 2 pears",
  "Pick up three parcels and two letters and one box",
  "Pick up three parcels",
  "Remind me to buy 3 apples",
  "Please remind me to send 2 invoices",
])("requires confirmation for %s", (title) => {
  const input = `  ${title} tomorrow at noon! `;
  const question = interpretDate(input, context);
  if (question.status === "resolved" || !question.clarification)
    throw Error("Missing title choice");
  expect(question.clarification.choices[0].id).toBe("event:title");
  expect(prepareCalendarFile(question, metadata).ok).toBe(false);
  const result = interpretDate(input, {
    ...context,
    selection: { contextKey: question.clarification.contextKey, id: "event:title" },
  });
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw Error("Missing complete reminder");
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe(result.event!.text);
  expect(result.event!.text).toBe(title.replace(/^(?:please )?remind me to /i, ""));
  expect(result.source.text).toBe("tomorrow at noon");
  expect(result.value.calculation.result.iso).toBe("2026-09-13T17:00:00.000Z");
  expect(result.apiReplay).toBe(false);
});
it("retains quantity through title, date and DST correction, then invalidates it on edit", () => {
  const input = "Buy 3 apples on 11/01/2026 at 1:30am for 30 minutes";
  let selection: ClarificationSelection | undefined;
  for (const id of ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
    const question = interpretDate(input, { ...context, selection });
    if (question.status === "resolved" || !question.clarification)
      throw Error("Missing staged choice");
    expect(question.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    expect(prepareCalendarFile(question, metadata).ok).toBe(false);
    selection = appendSelection(selection, { contextKey: question.clarification.contextKey, id });
  }
  const result = interpretDate(input, { ...context, selection });
  expect(result).toMatchObject({ status: "resolved", event: { text: "Buy 3 apples" } });
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("DTSTART:20261101T073000Z");
  expect(file.text).toContain("DTEND:20261101T080000Z");
  expect(file.text).toContain("SUMMARY:Buy 3 apples");
  expect(interpretDate(input.replace("3 apples", "4 apples"), { ...context, selection })).toEqual(
    interpretDate(input.replace("3 apples", "4 apples"), context),
  );
});
it.each([
  "Buy 3 pm tomorrow at noon",
  "Buy 3 days tomorrow",
  "Buy 3 hours of work tomorrow",
  "Buy 3 apples tomorrow unless it rains",
  "Maybe buy 3 apples tomorrow",
  "Buy 3 possibly fresh apples tomorrow",
  "Do not buy 3 apples tomorrow",
  "Buy 3 apples sometime tomorrow",
  "Buy 3 apples tomorrow nonsense Friday",
  "Buy 3.5 apples tomorrow",
  "Buy 0 apples tomorrow",
])("does not hide clocks, qualifiers or unsupported quantities: %s", (input) => {
  const result = interpretDate(input, context);
  expect(result.status).not.toBe("resolved");
  if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
});

it("completes a quantified list through correction, file preparation and edit", () => {
  const input = "Buy 3 apples and 2 pears on 11/01/2026 at 1:30am for 30 minutes";
  let selection: ClarificationSelection | undefined;
  for (const id of ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
    const result = interpretDate(input, { ...context, selection });
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error("Missing list question");
    expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
  }
  const result = interpretDate(input, { ...context, selection });
  if (result.status !== "resolved") throw Error("Unresolved list");
  expect(result.event?.text).toBe("Buy 3 apples and 2 pears");
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe(result.event!.text);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
  const file = prepareCalendarFile(result, { ...metadata, title: result.event!.text });
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("SUMMARY:Buy 3 apples and 2 pears");
  expect(file.text).toContain("DTSTART:20261101T073000Z");
  expect(file.text).toContain("DTEND:20261101T080000Z");
  const edited = input.replace("2 pears", "4 pears");
  expect(interpretDate(edited, { ...context, selection })).toEqual(interpretDate(edited, context));
  expect(prepareCalendarFile(interpretDate(edited, { ...context, selection }), metadata).ok).toBe(
    false,
  );
});
it.each([
  "Buy 3 apples and 2 days tomorrow",
  "Buy 3 apples and 2 hours of work tomorrow",
  "Buy 3 apples and 2 pears maybe tomorrow",
  "Buy 3 apples and 2 pears unless it rains tomorrow",
  "Buy 3 apples and email 2 people tomorrow",
  "Buy 3 apples and 2 pears and call Sam tomorrow",
  "Buy 3 apples and 2.5 pears tomorrow",
  "Buy 3 apples and 0 pears tomorrow",
])("does not absorb qualifiers or a second action in a list: %s", (input) => {
  const result = interpretDate(input, context);
  expect(result.status).not.toBe("resolved");
  if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
});

it.each([
  "Buy 3 apples and 2 pears then call Sam tomorrow at noon",
  "Buy 3 apples and 2 pears then email Jo tomorrow",
  "Buy 3 apples and 2 pears and tomorrow at noon",
])("does not propose an incomplete or sequential shopping title: %s", (input) => {
  const result = interpretDate(input, context);
  expect(result.status).not.toBe("resolved");
  if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});
