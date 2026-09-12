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

describe("Worker request contract", () => {
  it("rejects unsupported methods and paths", async () => {
    const post = await worker.fetch(new Request("http://localhost/api/parse", { method: "POST" }));
    expect(post.status).toBe(405);
    expect(post.headers.get("Allow")).toBe("GET, OPTIONS");
    expect((await worker.fetch(new Request("http://localhost/api/missing"))).status).toBe(404);
  });
  it("allows preflight and rejects invalid boolean settings", async () => {
    expect(
      (await worker.fetch(new Request("http://localhost/api/parse", { method: "OPTIONS" }))).status,
    ).toBe(200);
    expect(buildParseResponse({ expression: "now", preserveDayOfMonth: "yes" }).status).toBe(400);
  });
  it("returns a JSON error rather than throwing for dates outside the valid range", async () => {
    const response = await worker.fetch(
      new Request("http://localhost/api/parse?expression=in%20999999999%20years"),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ error: "Could not parse date expression" });
  });
});

it("labels API metadata using whole words and includes sub-day units", () => {
  expect(buildParseResponse({ expression: "yesterday" }).body).toMatchObject({
    meta: { type: "relative", components: [] },
  });
  expect(buildParseResponse({ expression: "in 2 hours" }).body).toMatchObject({
    meta: { type: "relative", components: ["hour"] },
  });
  expect(buildParseResponse({ expression: "friday" }).body).toMatchObject({
    meta: { type: "weekday" },
  });
});
