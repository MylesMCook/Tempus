import { expect, it } from "vite-plus/test";
import { interpretDate } from "@/shared/interpret-date";
import { resolveRecurringExport } from "@/shared/recurring-calendar-file";
import { scheduleCopy } from "./schedule-copy";
const options = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
function result(input: string) {
  const value = interpretDate(input, options);
  if (value.status !== "resolved" || value.value.kind !== "recurrence")
    throw new Error("Expected schedule");
  return value;
}
it("copies every date in all formats and refuses the initial bounded preview", () => {
  const input = "every Monday at noon for 5 occurrences";
  const interpretation = result(input);
  if (interpretation.value.kind !== "recurrence") throw new Error("Expected recurrence");
  const preview = interpretation.value;
  expect(() => scheduleCopy(interpretation, preview, input, options.reference, "text")).toThrow(
    "not ready",
  );
  const plan = resolveRecurringExport(interpretation, options.reference);
  if (!plan?.ok) throw new Error("Expected complete schedule");
  const dates = ["2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05", "2026-10-12"];
  for (const format of ["text", "markdown", "json"] as const) {
    const output = scheduleCopy(interpretation, plan, input, options.reference, format);
    for (const date of dates) expect(output.replaceAll("\\", "")).toContain(date);
    if (format === "json") {
      const data = JSON.parse(output);
      expect(data.occurrencesComplete).toBe(true);
      expect(data.occurrences).toEqual(plan.occurrences);
      expect(data.occurrenceCount).toBe(5);
      expect(data.reference).toBe(options.reference);
    }
  }
});
it("retains all 1000 dates even though the interface paginates", () => {
  const input = "every day at noon for 1000 occurrences";
  const interpretation = result(input);
  const plan = resolveRecurringExport(interpretation, options.reference);
  if (!plan?.ok) throw new Error("Expected complete schedule");
  expect(
    JSON.parse(scheduleCopy(interpretation, plan, input, options.reference, "json")).occurrences,
  ).toHaveLength(1000);
});
it("labels an open-ended rule as incomplete", () => {
  const input = "every Monday at noon";
  const interpretation = result(input);
  if (interpretation.value.kind !== "recurrence") throw new Error("Expected recurrence");
  const data = JSON.parse(
    scheduleCopy(interpretation, interpretation.value, input, options.reference, "json"),
  );
  expect(data.occurrencesComplete).toBe(false);
  expect(data.rule).toEqual(interpretation.value.rule);
  expect(data.scope).toBe("open-ended-rule-with-preview");
});
it("requires a future clock choice and carries the selected offset into complete output", () => {
  const input = "every Sunday at 1:30am until 2026-11-15";
  const interpretation = result(input);
  const pending = resolveRecurringExport(interpretation, options.reference);
  if (!pending || pending.ok || !pending.clockPrompt) throw new Error("Expected ambiguity");
  const plan = resolveRecurringExport(interpretation, options.reference, [
    pending.clockPrompt.choices[1].id,
  ]);
  if (!plan?.ok) throw new Error("Expected resolved schedule");
  const data = JSON.parse(scheduleCopy(interpretation, plan, input, options.reference, "json"));
  expect(data.occurrences).toHaveLength(10);
  expect(data.occurrences[7].start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(data.interpretationNotes.length).toBeGreaterThan(0);
});
