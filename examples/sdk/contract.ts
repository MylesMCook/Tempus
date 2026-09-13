// Compile-only consumer checks. This file is never executed or bundled into the SDK.
import { parse, type ParseResult } from "@tempus-date/core";
import { resolveRecurringExport, type CalendarFile } from "@tempus-date/core/calendar";

export function describe(result: ParseResult): string {
  if (result.status !== "resolved") {
    // @ts-expect-error An unresolved result has no usable temporal value.
    void result.value;
    // @ts-expect-error A clarification prompt is optional even when unresolved.
    void result.clarification.choices;
    return result.error.message;
  }
  const value = result.value;
  switch (value.kind) {
    case "point":
      // @ts-expect-error A point has no interval endpoint.
      void value.end;
      return value.calculation.result.iso;
    case "interval":
      return `${value.start.result.iso} to ${value.end.result.iso}`;
    case "collection":
      return value.occurrences.map((item) => item.start.result.iso).join(", ");
    case "recurrence":
      // @ts-expect-error A recurrence preview is not a prepared calendar file.
      void value.text;
      return `${value.occurrences.length} upcoming occurrences shown`;
    default: {
      const unhandled: never = value;
      return unhandled;
    }
  }
}

export function fileOutput(file: CalendarFile): string {
  if (file.ok) return file.text;
  // @ts-expect-error Failed preparation cannot supply downloadable file text.
  void file.text;
  return file.reason;
}

export function reviewSchedule(result: ParseResult): string {
  const plan = resolveRecurringExport(result, result.context.reference);
  // @ts-expect-error A plan may be absent or unresolved; do not consume its preview yet.
  void plan.occurrences;
  if (!plan) return "No recurring schedule";
  if (!plan.ok) return plan.error.message;
  return plan.exportRule ? "Repeating schedule" : `${plan.occurrences.length} complete events`;
}

export function invalidContext(): void {
  // @ts-expect-error Reproducible parsing requires an explicit reference instant.
  parse("tomorrow", { timezone: "UTC" });
}
