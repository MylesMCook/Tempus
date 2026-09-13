import {
  prepareRecurringCalendarReview,
  resolveRecurringExport,
} from "@/shared/recurring-calendar-file";
import type {
  CalendarPreparationRequest,
  CalendarPreparationResponse,
} from "./calendar-preparation";

// Computes calendar data only; downloading stays behind an explicit click in the main thread.
globalThis.onmessage = (event: MessageEvent<CalendarPreparationRequest>) => {
  const { interpretation, reference, decisions, title } = event.data;
  let response: CalendarPreparationResponse;
  try {
    if (event.data.output === "occurrences") {
      globalThis.postMessage({
        ok: true,
        plan: resolveRecurringExport(interpretation, reference, decisions),
      });
      return;
    }
    const { plan, file } = prepareRecurringCalendarReview(interpretation, {
      reference,
      decisions,
      title,
      uid: crypto.randomUUID(),
      stamp: new Date().toISOString(),
    });
    response = {
      ok: true,
      plan,
      ...(plan?.ok ? { file } : {}),
    };
  } catch {
    response = {
      ok: false,
      reason: "computation",
      error: `${event.data.output === "occurrences" ? "The full schedule" : "The calendar file"} could not be calculated. Try preparing again or edit the schedule.`,
    };
  }
  globalThis.postMessage(response);
};
