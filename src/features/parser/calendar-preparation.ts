import type { Interpretation } from "@/shared/interpret-date";
import type { CalendarFile } from "@/shared/calendar-file";
import type { resolveRecurringExport } from "@/shared/recurring-calendar-file";

export type CalendarPreparationRequest = {
  attempt: number;
  output?: "occurrences";
  interpretation: Interpretation;
  reference: string;
  decisions: string[];
  title: string;
};

export type CalendarPreparationResponse =
  | { ok: true; plan: ReturnType<typeof resolveRecurringExport>; file?: CalendarFile }
  | { ok: false; reason: "worker-unavailable" | "computation"; error: string };
