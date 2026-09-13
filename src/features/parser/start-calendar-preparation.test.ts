import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { interpretDate } from "@/shared/interpret-date";
import type { CalendarPreparationRequest } from "./calendar-preparation";
import { startCalendarPreparation } from "./start-calendar-preparation";

const mock = vi.hoisted(() => {
  const state = { failStartup: false, failPost: false };
  class Worker {
    onmessage?: (event: { data: unknown }) => void;
    onerror?: () => void;
    onmessageerror?: () => void;
    terminate = vi.fn();
    postMessage = vi.fn(() => {
      if (state.failPost) throw new Error("Cannot post message");
    });
    constructor() {
      if (state.failStartup) throw new Error("Worker blocked");
      instances.push(this);
    }
  }
  const instances: Worker[] = [];
  return { state, instances, Worker };
});
vi.mock("./calendar-preparation.worker.ts?worker&inline", () => ({ default: mock.Worker }));

const request: CalendarPreparationRequest = {
  interpretation: interpretDate("every Monday at noon for 1 occurrence", {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  }),
  reference: "2026-09-12T16:00:00Z",
  decisions: [],
  title: "Meeting",
  attempt: 0,
  output: "occurrences",
};
beforeEach(() => {
  mock.instances.length = 0;
  mock.state.failStartup = false;
  mock.state.failPost = false;
});
afterEach(() => vi.unstubAllGlobals());

it("starts the bundled worker even when offline, without a main-thread fallback", () => {
  vi.stubGlobal("navigator", { onLine: false });
  const complete = vi.fn();
  startCalendarPreparation(request, complete);
  const worker = mock.instances[0];
  expect(worker.postMessage).toHaveBeenCalledWith(request);
  expect(complete).not.toHaveBeenCalled();
  const response = { ok: true, plan: undefined };
  worker.onmessage?.({ data: response });
  expect(complete).toHaveBeenCalledExactlyOnceWith(response);
  expect(worker.terminate).toHaveBeenCalledOnce();
});

it("terminates cancelled work and ignores stale responses and errors", () => {
  const complete = vi.fn();
  const stop = startCalendarPreparation(request, complete);
  const oldWorker = mock.instances[0];
  stop();
  const nextComplete = vi.fn();
  startCalendarPreparation({ ...request, title: "New title", attempt: 1 }, nextComplete);
  oldWorker.onmessage?.({ data: { ok: true, plan: undefined } });
  oldWorker.onerror?.();
  oldWorker.onmessageerror?.();
  expect(complete).not.toHaveBeenCalled();
  expect(nextComplete).not.toHaveBeenCalled();
  expect(oldWorker.terminate).toHaveBeenCalledOnce();
  mock.instances[1].onmessage?.({ data: { ok: true, plan: undefined } });
  expect(nextComplete).toHaveBeenCalledOnce();
});

it.each(["startup", "post", "error", "messageerror"])(
  "reports actionable worker failures (%s) and allows a fresh retry",
  (failure) => {
    mock.state.failStartup = failure === "startup";
    mock.state.failPost = failure === "post";
    const complete = vi.fn();
    startCalendarPreparation(request, complete);
    if (failure === "error") mock.instances[0].onerror?.();
    if (failure === "messageerror") mock.instances[0].onmessageerror?.();
    expect(complete).toHaveBeenCalledExactlyOnceWith({
      ok: false,
      reason: "worker-unavailable",
      error: expect.stringContaining("reconnect and reload"),
    });
    if (failure !== "startup") expect(mock.instances[0].terminate).toHaveBeenCalledOnce();
    mock.state.failStartup = false;
    mock.state.failPost = false;
    const retry = vi.fn();
    startCalendarPreparation({ ...request, attempt: 1 }, retry);
    mock.instances.at(-1)?.onmessage?.({ data: { ok: true, plan: undefined } });
    expect(retry).toHaveBeenCalledOnce();
  },
);

it("preserves computation errors and ignores duplicate worker events after completion", () => {
  const complete = vi.fn();
  startCalendarPreparation(request, complete);
  const worker = mock.instances[0];
  const response = { ok: false, reason: "computation", error: "Could not calculate the schedule." };
  worker.onmessage?.({ data: response });
  worker.onerror?.();
  worker.onmessage?.({ data: { ok: true, plan: undefined } });
  expect(complete).toHaveBeenCalledExactlyOnceWith(response);
  expect(worker.terminate).toHaveBeenCalledOnce();
});
