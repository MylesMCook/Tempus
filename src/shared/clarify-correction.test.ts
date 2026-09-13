import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const input = "Meet Friday at noon, actually Saturday at noon instead";

it.each([
  ["keep", "2026-09-18T17:00:00.000Z"],
  ["replace", "2026-09-12T17:00:00.000Z"],
])("resolves only the confirmed correction: %s", (id, iso) => {
  const prompt = interpretDate(input, context);
  expect(prompt.status).toBe("needs-clarification");
  if (prompt.status === "resolved" || !prompt.clarification)
    throw new Error("Missing clarification");
  const selected = interpretDate(input, {
    ...context,
    selection: { contextKey: prompt.clarification.contextKey, id },
  });
  if (selected.status !== "resolved" || selected.value.kind !== "point")
    throw new Error("Missing point");
  expect(selected.value.calculation.result.iso).toBe(iso);
  expect(selected.event?.text).toBe("Meet");
  expect(input.slice(selected.source.span.start, selected.source.span.end)).toBe(input);
});

it("retains the original reminder event span and supports complete interval choices", () => {
  const text = "  Remind me to call Sam Friday 9am-11am, actually Saturday 1pm-2pm instead!";
  const prompt = interpretDate(text, context);
  if (prompt.status === "resolved" || !prompt.clarification) throw new Error("Missing choices");
  const selected = interpretDate(text, {
    ...context,
    selection: { contextKey: prompt.clarification.contextKey, id: "replace" },
  });
  if (selected.status !== "resolved" || selected.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(selected.value.start.result.iso).toBe("2026-09-12T18:00:00.000Z");
  expect(selected.value.end.result.iso).toBe("2026-09-12T19:00:00.000Z");
  expect(text.slice(selected.event!.span.start, selected.event!.span.end)).toBe("call Sam");
});

it.each([
  "Meet Friday, actually February 30, 2026 instead",
  "Meet Friday, actually Saturday unless it rains",
  "Meet Friday, actually Saturday, actually Sunday instead",
  "Do not meet Friday, actually Saturday instead",
  "Meet Friday, actually Saturday and Sunday instead",
  "Remind me to call Sam Friday, actually remind me to call Jo Saturday instead",
])("does not offer an incomplete correction: %s", (text) => {
  const result = interpretDate(text, context);
  expect(result.status).not.toBe("resolved");
  if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
});

it("rejects a decision from another reference, input or choice", () => {
  const prompt = interpretDate(input, context);
  if (prompt.status === "resolved" || !prompt.clarification) throw new Error("Missing choices");
  const selection = { contextKey: prompt.clarification.contextKey, id: "replace" };
  expect(
    interpretDate(input, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
  expect(
    interpretDate(input, { ...context, selection: { ...selection, id: "unknown" } }).status,
  ).toBe("needs-clarification");
  expect(interpretDate(input.replace("Saturday", "Sunday"), { ...context, selection }).status).toBe(
    "needs-clarification",
  );
});

it.each([
  ["alternative:first", "2026-09-13T17:00:00.000Z"],
  ["alternative:second", "2026-09-18T19:00:00.000Z"],
])("keeps both complete alternatives until a choice: %s", (id, iso) => {
  const text = "Remind me to call Sam tomorrow at noon or Friday at 2pm";
  const prompt = interpretDate(text, context);
  if (prompt.status === "resolved" || !prompt.clarification)
    throw new Error("Missing alternatives");
  expect(prompt.clarification.question).toBe("Which date do you want?");
  const selection = { contextKey: prompt.clarification.contextKey, id };
  const result = interpretDate(text, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Missing selected point");
  expect(result.value.calculation.result.iso).toBe(iso);
  expect(result.event?.text).toBe("call Sam");
  expect(text.slice(result.event!.span.start, result.event!.span.end)).toBe("call Sam");
  expect(text.slice(result.source.span.start, result.source.span.end)).toBe(text);
  expect(result.apiReplay).toBe(false);
  expect(interpretDate(text + " ", { ...context, selection }).status).toBe("needs-clarification");
  expect(
    interpretDate(text, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
});
it.each([
  "Remind me to call Sam tomorrow at noon or Friday unless it rains",
  "Remind me to call Sam tomorrow at noon or Friday or Saturday",
  "Remind me to call Sam tomorrow at noon or February 30, 2027",
  "Remind me to call Sam tomorrow at noon or call Jo Friday at noon",
  "Do not call Sam tomorrow at noon or Friday at noon",
])("does not offer incomplete or conditional alternatives: %s", (text) => {
  const result = interpretDate(text, context);
  expect(result.status).not.toBe("resolved");
  if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
});

it.each([
  ["tomorrow at noon for 30 seconds or Friday at 2pm for 30 seconds", "12:00:30 PM"],
  ["tomorrow at noon plus 0.5 seconds or Friday at 2pm", "12:00:00.500 PM"],
])("does not hide precision in the offered choices: %s", (input, clock) => {
  const result = interpretDate(input, context);
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choices");
  expect(result.clarification.choices[0].label).toContain(clock);
});

it("resolves date then clock ambiguity inside the second alternative before final selection", () => {
  const text = "Remind me to call Sam tomorrow at noon or 01/11/2026 at 1:30am for 30 seconds";
  let selection: ClarificationSelection | undefined;
  const choose = (index: number) => {
    const result = interpretDate(text, { ...context, selection });
    if (result.status === "resolved" || !result.clarification) throw new Error("Missing question");
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: result.clarification.choices[index].id,
    });
    return result.clarification;
  };
  expect(choose(1).question).toContain("Second alternative");
  expect(choose(1).question).toContain("Second alternative");
  expect(choose(1).question).toBe("Which date do you want?");
  const result = interpretDate(text, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(result.value.start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(result.value.end.result.iso).toBe("2026-11-01T07:30:30.000Z");
  expect(result.event?.text).toBe("call Sam");
  expect(result.source.text).toBe(text);
  expect(result.apiReplay).toBe(false);
  expect(
    interpretDate(text.replace("30 seconds", "60 seconds"), { ...context, selection }).status,
  ).toBe("needs-clarification");
});

it("keeps identical numeric ambiguities in separate branches", () => {
  const text = "03/04/2027 at noon or 03/04/2027 at 2pm";
  let selection: ClarificationSelection | undefined;
  for (const index of [0, 1, 1]) {
    const result = interpretDate(text, { ...context, selection });
    if (result.status === "resolved" || !result.clarification)
      throw new Error("Missing independent choice");
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: result.clarification.choices[index].id,
    });
  }
  const result = interpretDate(text, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Missing point");
  expect(result.value.calculation.result.iso).toBe("2027-04-03T19:00:00.000Z");
});

it.each([
  ["keep", "2026-09-18T17:00:00.000Z", "2026-09-18T17:30:00.000Z"],
  ["replace", "2026-11-01T07:30:00.000Z", "2026-11-01T07:30:30.000Z"],
])("clarifies a replacement before the explicit %s decision", (finalId, start, end) => {
  const text =
    "Remind me to call Sam Friday at noon for 30 minutes, actually 01/11/2026 at 1:30am for 30 seconds instead";
  let selection: ClarificationSelection | undefined;
  for (const id of [
    "correction:branch:1:2026-11-01",
    "correction:branch:1:interval:start:2026-11-01T07:30:00Z",
    finalId,
  ]) {
    const question = interpretDate(text, { ...context, selection });
    if (question.status === "resolved" || !question.clarification)
      throw new Error("Missing correction question");
    expect(question.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    selection = appendSelection(selection, { contextKey: question.clarification.contextKey, id });
  }
  const result = interpretDate(text, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing interval");
  expect([result.value.start.result.iso, result.value.end.result.iso]).toEqual([start, end]);
  expect(result.event?.text).toBe("call Sam");
  expect(result.source.text).toBe(text);
  expect(result.apiReplay).toBe(false);
  expect(
    interpretDate(text.replace("30 seconds", "60 seconds"), { ...context, selection }).status,
  ).toBe("needs-clarification");
  expect(interpretDate(text, { ...context, timezone: "America/New_York", selection }).status).toBe(
    "needs-clarification",
  );
});

it("shows date-only correction choices without an invented clock", () => {
  const text = "Call Sam Friday at noon, actually Saturday instead";
  const result = interpretDate(text, context);
  if (result.status === "resolved" || !result.clarification) throw Error("Missing correction");
  expect(result.clarification.choices[0].label).toContain("12:00 PM");
  expect(result.clarification.choices[1].label).toBe("Use September 12, 2026 (date only)");
  const selected = interpretDate(text, {
    ...context,
    selection: { contextKey: result.clarification.contextKey, id: "replace" },
  });
  expect(selected).toMatchObject({
    status: "resolved",
    value: { kind: "point", precision: "date" },
    selectedChoice: "September 12, 2026 (date only)",
  });
});

it("labels all-day alternatives with civil dates and their exclusive end", () => {
  const text = "Call Sam tomorrow for 2 days or Friday at midnight for 2 days";
  const result = interpretDate(text, context);
  if (result.status === "resolved" || !result.clarification) throw Error("Missing alternatives");
  expect(result.clarification.choices[0].label).toBe(
    "Use September 13, 2026 to September 15, 2026 (all day; exclusive end)",
  );
  expect(result.clarification.choices[1].label).toContain("12:00 AM");
  expect(result.clarification.choices[1].label).not.toContain("all day");
});
