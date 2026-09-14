import { useEffect, useRef, useState } from "react";
import { startCalendarPreparation } from "./start-calendar-preparation";
import type {
  CalendarPreparationRequest,
  CalendarPreparationResponse,
} from "./calendar-preparation";

/** The request object is the identity boundary. Never expose a response to newer input. */
export function useCalendarPreparation(request: CalendarPreparationRequest | undefined) {
  const previous = useRef<CalendarPreparationRequest | undefined>(undefined);
  const [completed, setCompleted] = useState<{
    request: CalendarPreparationRequest;
    response: CalendarPreparationResponse;
  }>();
  useEffect(() => {
    if (!request) {
      previous.current = undefined;
      setCompleted(undefined);
      return;
    }
    const editingTitle =
      previous.current?.interpretation === request.interpretation &&
      previous.current.reference === request.reference &&
      previous.current.selection === request.selection &&
      previous.current.title !== request.title;
    previous.current = request;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // Avoid starting a fresh computation for every title keystroke.
    const timer = setTimeout(
      () => {
        stop = startCalendarPreparation(request, (response) => {
          if (!cancelled) setCompleted({ request, response });
        });
      },
      editingTitle ? 150 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
      stop?.();
    };
  }, [request]);
  return completed?.request === request ? completed?.response : undefined;
}
