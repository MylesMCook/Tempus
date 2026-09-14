import { prepareCalendar } from "@/shared/sdk-calendar";
import type {
  CalendarPreparationRequest,
  CalendarPreparationResponse,
} from "./calendar-preparation";

// Computes calendar data only; downloading stays behind an explicit click in the main thread.
globalThis.onmessage = (event: MessageEvent<CalendarPreparationRequest>) => {
  const { interpretation, selection, title } = event.data;
  let response: CalendarPreparationResponse;
  try {
    response = {
      ok: true,
      result: prepareCalendar(interpretation, {
        selection,
        ...(event.data.output === "occurrences"
          ? {}
          : {
              file: { title, uid: crypto.randomUUID(), stamp: new Date().toISOString() },
            }),
      }),
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
