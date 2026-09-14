import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import headers from "../../../public/_headers?raw";
import documentWorker from "../../worker.tsx?raw";
import { parse } from "@/shared/sdk";
import type { CalendarPreparationRequest } from "./calendar-preparation";
import engineApp from "../../engine-app.tsx?raw";
import {
  calendarPreparationWorker,
  startCalendarPreparation,
  startClientCalendarWorkerPreload,
} from "./start-calendar-preparation";

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
  interpretation: parse("every Monday at noon for 1 occurrence", {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  }),
  reference: "2026-09-12T16:00:00Z",
  title: "Meeting",
  attempt: 0,
  output: "occurrences",
};
beforeEach(() => {
  mock.instances.length = 0;
  mock.state.failStartup = false;
  mock.state.failPost = false;
  calendarPreparationWorker.pending = undefined;
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("preloads the worker from the client app without constructing it", async () => {
  expect(engineApp).toContain("startClientCalendarWorkerPreload");
  const load = vi.spyOn(calendarPreparationWorker, "importModule");
  await startClientCalendarWorkerPreload();
  expect(load).toHaveBeenCalledOnce();
  expect(mock.instances).toHaveLength(0);
});

it("swallows a failed startup preload so the page can still retry later", async () => {
  vi.spyOn(calendarPreparationWorker, "importModule").mockRejectedValue(
    new Error("Failed to load worker module"),
  );
  await expect(startClientCalendarWorkerPreload()).resolves.toBeUndefined();
  expect(calendarPreparationWorker.pending).toBeUndefined();
});

it("retries after the worker module fails to load", async () => {
  const load = vi
    .spyOn(calendarPreparationWorker, "importModule")
    .mockRejectedValueOnce(new Error("Failed to load worker module"))
    .mockResolvedValue({ default: mock.Worker as unknown as new () => Worker });
  const complete = vi.fn();
  startCalendarPreparation(request, complete);
  await vi.waitFor(() => expect(complete).toHaveBeenCalledOnce());
  expect(complete).toHaveBeenCalledExactlyOnceWith({
    ok: false,
    reason: "worker-unavailable",
    error: expect.stringContaining("reconnect and reload"),
  });
  const retry = vi.fn();
  startCalendarPreparation({ ...request, attempt: 1 }, retry);
  await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
  mock.instances[0].onmessage?.({ data: { ok: true, plan: undefined } });
  expect(retry).toHaveBeenCalledOnce();
  expect(load).toHaveBeenCalledTimes(2);
});

it("permits bundled blob workers without broadening script execution in shipped CSP", () => {
  const policy = headers.match(/Content-Security-Policy: (.+)/)?.[1];
  expect(policy).toBeDefined();
  expect(policy?.split(";").map((directive) => directive.trim())).toContain(
    "worker-src 'self' blob:",
  );
  expect(policy?.split(";").map((directive) => directive.trim())).toContain("script-src 'self'");
  expect(documentWorker).toContain("worker-src 'self' blob:");
  expect(documentWorker).toContain("script-src 'self' 'nonce-${rw.nonce}'");
});

it("starts the bundled worker even when offline, without a main-thread fallback", async () => {
  vi.stubGlobal("navigator", { onLine: false });
  const complete = vi.fn();
  startCalendarPreparation(request, complete);
  await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
  const worker = mock.instances[0];
  expect(worker.postMessage).toHaveBeenCalledWith(request);
  expect(complete).not.toHaveBeenCalled();
  const response = { ok: true, plan: undefined };
  worker.onmessage?.({ data: response });
  expect(complete).toHaveBeenCalledExactlyOnceWith(response);
  expect(worker.terminate).toHaveBeenCalledOnce();
});

it("terminates cancelled work and ignores stale responses and errors", async () => {
  const complete = vi.fn();
  const stop = startCalendarPreparation(request, complete);
  await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
  const oldWorker = mock.instances[0];
  stop();
  const nextComplete = vi.fn();
  startCalendarPreparation({ ...request, title: "New title", attempt: 1 }, nextComplete);
  await vi.waitFor(() => expect(mock.instances).toHaveLength(2));
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
  async (failure) => {
    mock.state.failStartup = failure === "startup";
    mock.state.failPost = failure === "post";
    const complete = vi.fn();
    startCalendarPreparation(request, complete);
    if (failure === "startup") {
      await vi.waitFor(() => expect(complete).toHaveBeenCalledOnce());
    } else {
      await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
    }
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
    await vi.waitFor(() =>
      expect(mock.instances.length).toBeGreaterThan(failure === "startup" ? 0 : 1),
    );
    mock.instances.at(-1)?.onmessage?.({ data: { ok: true, plan: undefined } });
    expect(retry).toHaveBeenCalledOnce();
  },
);

it("preserves computation errors and ignores duplicate worker events after completion", async () => {
  const complete = vi.fn();
  startCalendarPreparation(request, complete);
  await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
  const worker = mock.instances[0];
  const response = { ok: false, reason: "computation", error: "Could not calculate the schedule." };
  worker.onmessage?.({ data: response });
  worker.onerror?.();
  worker.onmessage?.({ data: { ok: true, plan: undefined } });
  expect(complete).toHaveBeenCalledExactlyOnceWith(response);
  expect(worker.terminate).toHaveBeenCalledOnce();
});
