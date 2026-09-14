import type { ParseResult, ClarificationSelection } from "@/shared/sdk";
import type { CalendarPreparation } from "@/shared/sdk-calendar";

export type CalendarPreparationRequest = {
  attempt: number;
  output?: "occurrences";
  interpretation: ParseResult;
  reference: string;
  selection?: ClarificationSelection;
  title: string;
};

export type CalendarPreparationResponse =
  | { ok: true; result: CalendarPreparation }
  | { ok: false; reason: "worker-unavailable" | "computation"; error: string };
