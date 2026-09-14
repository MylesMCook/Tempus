import { afterAll, beforeAll, expect, it, vi } from "vite-plus/test";
import { parse } from "@/shared/sdk";
import type { CalendarPreparationRequest } from "./calendar-preparation";

const postMessage = vi.fn();
let handleMessage: (event: MessageEvent) => void;
beforeAll(async () => {
  vi.stubGlobal("postMessage", postMessage);
  vi.stubGlobal("onmessage", undefined);
  await import("./calendar-preparation.worker");
  handleMessage = globalThis.onmessage!;
});
afterAll(() => vi.unstubAllGlobals());

const request: CalendarPreparationRequest = {
  interpretation: parse("every Monday at noon for 5 occurrences", {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  }),
  reference: "2026-09-12T16:00:00Z",
  title: "Meeting",
  attempt: 0,
};

it.each([undefined, "occurrences"] as const)(
  "computes the complete %s output in the worker handler",
  (output) => {
    postMessage.mockClear();
    handleMessage(new MessageEvent("message", { data: { ...request, output } }));
    expect(postMessage).toHaveBeenCalledOnce();
    const response = postMessage.mock.calls[0][0];
    expect(response.ok).toBe(true);
    expect(response.result.schedule.occurrences).toHaveLength(5);
    if (output === "occurrences") expect(response.result.file).toBeUndefined();
    else expect(response.result.file.ok).toBe(true);
  },
);

it.each([undefined, "occurrences"] as const)(
  "distinguishes %s computation failures from worker startup failures",
  (output) => {
    postMessage.mockClear();
    // A malformed internal request exercises the worker's last-resort error boundary.
    handleMessage(
      new MessageEvent("message", { data: { ...request, interpretation: null, output } }),
    );
    expect(postMessage).toHaveBeenCalledExactlyOnceWith({
      ok: false,
      reason: "computation",
      error: expect.stringContaining(
        output === "occurrences" ? "The full schedule" : "The calendar file",
      ),
    });
  },
);
