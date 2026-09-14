import type { ParseResult, ClarificationSelection } from "./sdk.js";
import { isClarificationSelection } from "./clarify-numeric-date.js";
import { prepareCalendarFile, type CalendarFile } from "./calendar-file.js";
import {
  prepareRecurringCalendarReview,
  resolveRecurringExport,
} from "./recurring-calendar-file.js";

type Resolved = Extract<ParseResult, { status: "resolved" }>;
export type PreparedSchedule = Extract<Resolved["value"], { kind: "recurrence" }>;
export type CalendarMetadata = Parameters<typeof prepareCalendarFile>[1];
export type CalendarPreparation =
  | {
      status: "ready";
      /** Complete bounded occurrences, or the preview of a validated ongoing rule. */
      schedule?: PreparedSchedule;
      ongoing: boolean;
      file?: CalendarFile;
    }
  | {
      status: "needs-clarification";
      clarification: {
        contextKey: string;
        question: string;
        choices: { id: string; label: string }[];
      };
    }
  | { status: "blocked"; reason: string; hint?: string };

/** Opaque identity of the interpreted data, including the original input and context.
 * It survives structured cloning; hosts must not construct or persist its contents independently.
 */
export function calendarContextKey(result: ParseResult): string {
  return JSON.stringify(result);
}

/** Prepare data locally. Omit file metadata to skip serialization and all file-only work.
 * The host supplies clock/UUID metadata and owns copying, downloading and Worker lifecycle.
 * Existing raw calendar helpers remain available for preview-package compatibility.
 */
export function prepareCalendar(
  result: ParseResult,
  options: { selection?: ClarificationSelection; file?: CalendarMetadata } = {},
): CalendarPreparation {
  if (result.status !== "resolved")
    return { status: "blocked", reason: "Resolve the input before preparing calendar data." };
  const contextKey = calendarContextKey(result);
  const selection = options.selection;
  if (
    selection !== undefined &&
    (!isClarificationSelection(selection) || selection.contextKey !== contextKey)
  )
    return { status: "blocked", reason: "These answers do not belong to the current result." };
  if (result.value.kind !== "recurrence")
    return {
      status: "ready",
      ongoing: false,
      ...(options.file ? { file: prepareCalendarFile(result, options.file) } : {}),
    };
  const decisions = selection
    ? [selection.id, ...(selection.previous ?? []).slice().reverse()]
    : [];
  const prepared = options.file
    ? prepareRecurringCalendarReview(result, {
        ...options.file,
        reference: result.context.reference,
        decisions,
      })
    : { plan: resolveRecurringExport(result, result.context.reference, decisions) };
  const plan = prepared.plan;
  if (!plan || !plan.ok) {
    const prompt = plan && (plan.clockPrompt ?? plan.policyPrompt);
    if (prompt) return { status: "needs-clarification", clarification: { contextKey, ...prompt } };
    return {
      status: "blocked",
      reason: plan ? plan.error.message : "No complete schedule is available.",
      ...(plan ? { hint: plan.error.hint } : {}),
    };
  }
  // Deliberately omit the serializer's private timezone, exclusion and duration plan.
  const { kind, timezone, rule, occurrences, truncated, validation } = plan;
  return {
    status: "ready",
    schedule: { ok: true, kind, timezone, rule, occurrences, truncated, validation },
    ongoing: Boolean(plan.exportRule),
    ...("file" in prepared ? { file: prepared.file } : {}),
  };
}
