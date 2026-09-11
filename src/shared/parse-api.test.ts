import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { buildParseResponse } from "./parse-api";
import worker from "../../worker/index";

afterEach(() => vi.useRealTimers());

describe("Date API output", () => {
  it("formats one instant in the requested timezone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-12T01:30:00Z"));
    const result = buildParseResponse({
      expression: "now",
      timezone: "America/Chicago",
      format: "yyyy-MM-dd HH:mm",
    });
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      date: "2026-09-12T01:30:00.000Z",
      formatted: "2026-09-11 20:30",
      settings: { preserveDayOfMonth: false },
    });
  });

  it("returns a recoverable error for invalid formatting", () => {
    expect(buildParseResponse({ expression: "tomorrow", format: "invalid" })).toMatchObject({
      status: 400,
      body: { error: "Invalid date format" },
    });
  });

  it("rejects unknown timezones and whitespace-only expressions", () => {
    expect(buildParseResponse({ expression: "now", timezone: "Not/A_Zone" }).status).toBe(400);
    expect(buildParseResponse({ expression: "   " }).status).toBe(400);
  });

  it("does not serve a cached result for a later now request", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-12T01:30:00Z"));
    const first = await worker.fetch(new Request("http://localhost/api/parse?expression=now"));
    expect(first.headers.get("Cache-Control")).toBe("no-store");
    vi.advanceTimersByTime(60000);
    const second = await worker.fetch(new Request("http://localhost/api/parse?expression=now"));
    const a = (await first.json()) as { timestamp: number };
    const b = (await second.json()) as { timestamp: number };
    expect(b.timestamp - a.timestamp).toBe(60000);
  });
});
