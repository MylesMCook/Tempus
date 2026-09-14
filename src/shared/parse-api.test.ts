import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { buildParseResponse } from "./parse-api";
import { calculateDate } from "./date-parser";
import { oracleCases } from "./date-engine/oracle-fixtures";
import worker, { type Env } from "../../worker/index";
const env: Env = { PARSE_RATE_LIMITER: { limit: async () => ({ success: true }) } };
const fetchWorker = (request: Request) => worker.fetch(request, env);
const reference = "2026-01-26T19:30:00.000Z";
const timezone = "America/Chicago";
afterEach(() => vi.useRealTimers());

describe("API v2 calculation parity", () => {
  it.each(oracleCases)("replays %s as %s", (expression, expected) => {
    const result = buildParseResponse({ expression, timezone, reference }, "test");
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      ...calculateDate(expression, { timezone, reference }),
      date: expected,
      requestId: "test",
    });
  });
  it("formats the calculated instant and returns its captured reference", () => {
    const result = buildParseResponse({
      expression: "tomorrow",
      timezone,
      reference,
      format: "yyyy-MM-dd HH:mm",
    });
    expect(result).toMatchObject({
      status: 200,
      body: {
        engineVersion: 2,
        date: "2026-01-27T06:00:00.000Z",
        formatted: "2026-01-27 00:00",
        reference,
      },
    });
  });
  it.each([
    { expression: "   " },
    { expression: "now", timezone: "Bad/Zone" },
    { expression: "now", reference: "2026-01-26" },
    { expression: "now", format: "invalid" },
    { expression: "now", format: "   " },
    { expression: "now", preserveDayOfMonth: "false" },
    { expression: "now", unknown: "true" },
    { expression: "now", format: "x".repeat(51) },
    { expression: "0.0001 seconds" },
    { expression: "today garbage" },
  ])("rejects invalid requests: %j", (query) => {
    expect(buildParseResponse(query)).toMatchObject({
      status: 400,
      body: { engineVersion: 2, error: expect.any(String) },
    });
  });
  it("makes now reproducible even after the server clock changes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(reference));
    const first = buildParseResponse({ expression: "now" });
    vi.advanceTimersByTime(60000);
    const replay = buildParseResponse({ expression: "now", reference });
    expect(first.body).toMatchObject({ timestamp: Date.parse(reference) });
    expect(replay.body).toMatchObject({ timestamp: Date.parse(reference) });
  });
});

describe("Worker request boundary", () => {
  it("does not cache a later now request", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(reference));
    const first = await fetchWorker(new Request("http://localhost/api/parse?expression=now"));
    expect(first.headers.get("Cache-Control")).toBe("no-store");
    expect(first.headers.get("Access-Control-Allow-Origin")).toBe("*");
    vi.advanceTimersByTime(60000);
    const second = await fetchWorker(new Request("http://localhost/api/parse?expression=now"));
    const a = (await first.json()) as { timestamp: number };
    const b = (await second.json()) as { timestamp: number };
    expect(b.timestamp - a.timestamp).toBe(60000);
  });
  it("supports preflight and rejects unsupported methods and paths", async () => {
    expect(
      (await fetchWorker(new Request("http://localhost/api/parse", { method: "OPTIONS" }))).status,
    ).toBe(200);
    const post = await fetchWorker(new Request("http://localhost/api/parse", { method: "POST" }));
    expect(post.status).toBe(405);
    expect(post.headers.get("Allow")).toBe("GET, OPTIONS");
    expect((await fetchWorker(new Request("http://localhost/api/missing"))).status).toBe(404);
  });
  it.each([
    "expression=now&expression=today",
    "expression=now&timezone=UTC&timezone=Asia%2FTokyo",
    "expression=now&preserveDayOfMonth=true",
    "expression=now&surprise=true",
    "expression=in%20999999999%20years",
  ])("rejects %s without throwing or caching", async (query) => {
    const response = await fetchWorker(new Request(`http://localhost/api/parse?${query}`));
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });
});

describe("Worker protections", () => {
  it.each([200, 429, 503])("returns protected responses when limiter yields %s", async (status) => {
    const limit = vi.fn(async () => {
      if (status === 503) throw new Error("Unavailable");
      return { success: status === 200 };
    });
    const response = await worker.fetch(
      new Request("https://example.test/api/parse?expression=now", {
        headers: { "CF-Connecting-IP": "192.0.2.1", "X-Forwarded-For": "192.0.2.2" },
      }),
      { PARSE_RATE_LIMITER: { limit } },
    );
    expect(response.status).toBe(status);
    expect(limit).toHaveBeenCalledWith({ key: "tempus:parse:192.0.2.1" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    if (status !== 200) expect(response.headers.get("Retry-After")).toBe("60");
  });
  it("rejects an oversized URL before parsing or using the limiter", async () => {
    const limit = vi.fn();
    const response = await worker.fetch(
      new Request(`https://example.test/api/parse?expression=${"a".repeat(4096)}`),
      { PARSE_RATE_LIMITER: { limit } },
    );
    expect(response.status).toBe(414);
    expect(limit).not.toHaveBeenCalled();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("keeps preflight independent of the limiter", async () => {
    const limit = vi.fn();
    const response = await worker.fetch(
      new Request("https://example.test/api/parse", { method: "OPTIONS" }),
      { PARSE_RATE_LIMITER: { limit } },
    );
    expect(response.status).toBe(200);
    expect(limit).not.toHaveBeenCalled();
  });
});
