import { expect, it } from "vite-plus/test";
import { parse } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";
import { prepareRecurringCalendarFile, resolveRecurringExport } from "./recurring-calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
  reference: context.reference,
};
it("distinguishes unresolved input, the recurring API and missing point precision", () => {
  expect(prepareCalendarFile(parse("03/04/2027", context), metadata)).toMatchObject({
    ok: false,
    code: "unresolved",
  });
  expect(prepareCalendarFile(parse("every Monday at noon", context), metadata)).toMatchObject({
    ok: false,
    code: "recurrence-required",
  });
  expect(prepareCalendarFile(parse("tomorrow", context), metadata)).toMatchObject({
    ok: false,
    code: "point-mode-required",
  });
  expect(
    prepareCalendarFile(parse("tomorrow", context), { ...metadata, pointMode: "date" }).ok,
  ).toBe(true);
});
it("separates export clarification from an unsupported ongoing rule, then completes the selected file", () => {
  const input = "Call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08";
  const result = parse(input, context);
  expect(result.status).toBe("resolved");
  expect(prepareRecurringCalendarFile(result, metadata)).toMatchObject({
    ok: false,
    code: "clarification-required",
  });
  const plan = resolveRecurringExport(result, context.reference);
  if (!plan || plan.ok || !plan.clockPrompt) throw Error("Missing export question");
  const choice = plan.clockPrompt.choices.find(
    (choice) => choice.id === "recurrence:2026-11-01:start:2026-11-01T07:30:00Z",
  );
  if (!choice) throw Error("Missing authored second-clock answer");
  const file = prepareRecurringCalendarFile(result, { ...metadata, decisions: [choice.id] });
  expect(file).toMatchObject({ ok: true, eventCount: 9 });
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("20261101T073000Z");
  expect(
    prepareRecurringCalendarFile(parse("every Sunday at 1:30am", context), metadata),
  ).toMatchObject({ ok: false, code: "export-blocked" });
  expect(prepareRecurringCalendarFile(parse(input + " maybe", context), metadata)).toMatchObject({
    ok: false,
    code: "unresolved",
  });
});
it("allows metadata repair without changing the interpretation or treating it as a date clarification", () => {
  const result = parse("tomorrow at noon", context);
  expect(
    prepareCalendarFile(result, { ...metadata, title: "", pointMode: "instant" }),
  ).toMatchObject({ ok: false, code: "invalid-file" });
  expect(prepareCalendarFile(result, { ...metadata, pointMode: "instant" })).toMatchObject({
    ok: true,
    eventCount: 1,
  });
  const past = { ...context, reference: "2026-11-01T08:00:00Z" };
  expect(
    prepareRecurringCalendarFile(parse("every Sunday at 1:30am until 2026-11-01", past), {
      ...metadata,
      reference: past.reference,
    }),
  ).toMatchObject({ ok: false, code: "empty-schedule" });
});
