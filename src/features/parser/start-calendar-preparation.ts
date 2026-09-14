import type {
  CalendarPreparationRequest,
  CalendarPreparationResponse,
} from "./calendar-preparation";

type CalendarPreparationWorkerConstructor = new () => Worker;

let bundledWorkerModule: Promise<{ default: CalendarPreparationWorkerConstructor }> | undefined;

function loadBundledWorker() {
  bundledWorkerModule ??= import("./calendar-preparation.worker.ts?worker&inline");
  return bundledWorkerModule;
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
