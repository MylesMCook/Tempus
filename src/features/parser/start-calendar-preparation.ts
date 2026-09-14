import type {
  CalendarPreparationRequest,
  CalendarPreparationResponse,
} from "./calendar-preparation";

type CalendarPreparationWorkerConstructor = new () => Worker;
type CalendarPreparationWorkerModule = { default: CalendarPreparationWorkerConstructor };

export const calendarPreparationWorker = {
  pending: undefined as Promise<CalendarPreparationWorkerModule> | undefined,
  importModule: () => import("./calendar-preparation.worker.ts?worker&inline"),
};

function loadBundledWorker() {
  calendarPreparationWorker.pending ??= calendarPreparationWorker
    .importModule()
    .catch((error: unknown) => {
      calendarPreparationWorker.pending = undefined;
      throw error;
    });
  return calendarPreparationWorker.pending;
}

/** Fetch the worker chunk during client startup so later offline use needs no network. */
export function preloadCalendarPreparationWorker() {
  return loadBundledWorker().then(() => undefined);
}

/** Best-effort client startup preload; a failure must not become an unhandled rejection. */
export function startClientCalendarWorkerPreload() {
  return preloadCalendarPreparationWorker().catch(() => undefined);
}

/** Bundle the worker with the app so its first use needs no network request. */
export function startCalendarPreparation(
  request: CalendarPreparationRequest,
  complete: (response: CalendarPreparationResponse) => void,
) {
  let worker: Worker | undefined;
  let finished = false;
  const stop = () => {
    finished = true;
    worker?.terminate();
  };
  const finish = (response: CalendarPreparationResponse) => {
    if (finished) return;
    stop();
    complete(response);
  };
  const unavailable = () =>
    finish({
      ok: false,
      reason: "worker-unavailable",
      error:
        "The background worker could not start or communicate. Try preparing again. If this continues, reconnect and reload the app, or use a browser that allows Web Workers.",
    });
  void loadBundledWorker()
    .then(({ default: CalendarPreparationWorker }) => {
      if (finished) return;
      try {
        worker = new CalendarPreparationWorker();
        worker.onmessage = (event: MessageEvent<CalendarPreparationResponse>) => finish(event.data);
        worker.onerror = unavailable;
        worker.onmessageerror = unavailable;
        worker.postMessage(request);
      } catch {
        unavailable();
      }
    })
    .catch(unavailable);
  return stop;
}
