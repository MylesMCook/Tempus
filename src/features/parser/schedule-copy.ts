import type { Interpretation } from "@/shared/interpret-date";
import { scheduleQuantity } from "./schedule-labels";

export type Schedule = Extract<
  Extract<Interpretation, { status: "resolved" }>["value"],
  { kind: "recurrence" | "collection" }
>;
export type ScheduleCopyFormat = "text" | "markdown" | "json";

/** Refuse a finite preview at the output boundary, regardless of button state. */
export function scheduleCopy(
  interpretation: Extract<Interpretation, { status: "resolved" }>,
  schedule: Schedule,
  input: string,
  reference: string,
  format: ScheduleCopyFormat,
) {
  const bounded =
    schedule.kind === "collection" || Boolean(schedule.rule.count || schedule.rule.until);
  if (bounded && schedule.kind === "recurrence" && schedule.truncated)
    throw new Error("The complete schedule is not ready.");
  const scope = bounded ? "all-upcoming-within-boundaries" : "open-ended-rule-with-preview";
  if (format === "json")
    return JSON.stringify(
      {
        schemaVersion: 1,
        input,
        reference,
        scope,
        occurrencesComplete: bounded,
        occurrenceCount: schedule.occurrences.length,
        timezone: schedule.timezone,
        source: interpretation.source,
        event: interpretation.event,
        rule: schedule.kind === "recurrence" ? schedule.rule : undefined,
        selectedChoice: interpretation.selectedChoice,
        interpretationNotes:
          schedule.kind === "recurrence"
            ? (schedule.rule.clockOverrides ?? []).map((choice) => choice.label)
            : (schedule.selectedClocks ?? []),
        occurrences: schedule.occurrences,
      },
      null,
      2,
    );
  const instant = (snapshot: { local: string; offset: string }) =>
    `${snapshot.local.replace("T", " ").replace(/:00\.000$/, "")} (UTC${snapshot.offset})`;
  const rows = schedule.occurrences.map((row) => {
    const allDay = "allDay" in row && row.allDay;
    const start = allDay
      ? `${row.start.result.local.slice(0, 10)} (all day)`
      : instant(row.start.result);
    const end = row.end
      ? allDay
        ? row.end.result.local.slice(0, 10)
        : instant(row.end.result)
      : undefined;
    return `${start}${end ? ` → ${end} (end not included)` : ""}`;
  });
  const summary = bounded
    ? `${scheduleQuantity(rows.length, "date")} · ${rows.length === 1 ? "the upcoming occurrence" : "all upcoming occurrences"} within the supplied boundaries`
    : `Open-ended rule · the ${rows.length === 1 ? "date below is" : "dates below are"} only a preview`;
  const notes =
    schedule.kind === "recurrence"
      ? [
          `Start boundary: ${schedule.rule.starting}`,
          schedule.rule.until ? `Last start date (included): ${schedule.rule.until}` : undefined,
          schedule.rule.count ? `Requested count: ${schedule.rule.count}` : undefined,
          schedule.rule.countPast
            ? `Past starts: ${schedule.rule.countPast === "consume" ? "use count slots" : "do not use count slots"}`
            : undefined,
          schedule.rule.countExclusions
            ? `Excluded dates: ${schedule.rule.countExclusions === "consume" ? "use count slots" : "are replaced"}`
            : undefined,
          schedule.rule.exceptions.length
            ? `Excluded start date${schedule.rule.exceptions.length === 1 ? "" : "s"}: ${schedule.rule.exceptions.join(", ")}`
            : undefined,
          ...(schedule.rule.clockOverrides ?? []).map((choice) => choice.label),
        ].filter(Boolean)
      : (schedule.selectedClocks ?? []);
  const escape = (text: string) => text.replace(/[\\`*_{}[\]()#+.!|<>~-]/g, "\\$&");
  if (format === "markdown")
    return [
      `## ${escape(interpretation.event?.text ?? (rows.length === 1 ? "Date" : "Dates"))}`,
      "",
      escape(summary),
      "",
      `Timezone: ${escape(schedule.timezone)}`,
      `Phrase: ${escape(input)}`,
      `Reference: ${escape(reference)}`,
      "",
      ...rows.map((row, index) => `${index + 1}. ${escape(row)}`),
      ...(notes.length ? ["", ...notes.map((note) => `- ${escape(note!)}`)] : []),
    ].join("\n");
  return [
    interpretation.event?.text,
    summary,
    `Timezone: ${schedule.timezone}`,
    `Phrase: ${input}`,
    `Reference: ${reference}`,
    "",
    ...rows.map((row, index) => `${index + 1}. ${row}`),
    "",
    ...notes,
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .trim();
}
