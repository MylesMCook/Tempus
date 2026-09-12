import { buildParseResponse } from "@/shared/parse-api";

export interface Env {
  PARSE_RATE_LIMITER: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} satisfies Record<string, string>;

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Strict-Transport-Security": "max-age=31536000",
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.url.length > 4096) {
      return json({ error: "Request URL is too long" }, 414);
    }
    const url = new URL(request.url);

    if (url.pathname !== "/api/parse") {
      return json({ error: "Not found" }, 404);
    }

    if (request.method === "OPTIONS") {
      return json({}, 200, { "Access-Control-Max-Age": "86400" });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, { Allow: "GET, OPTIONS" });
    }

    try {
      // Cloudflare supplies this header. Forwarded headers supplied by clients are ignored.
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const { success } = await env.PARSE_RATE_LIMITER.limit({
        key: `tempus-total:parse:${ip}`,
      });
      if (!success) {
        return json({ error: "Too many API requests. Try again in a minute." }, 429, {
          "Retry-After": "60",
        });
      }
    } catch {
      return json({ error: "The API is temporarily unavailable. Try again shortly." }, 503, {
        "Retry-After": "60",
      });
    }

    const query: Record<string, string> = {};
    const allowedKeys = new Set([
      "expression",
      "timezone",
      "reference",
      "format",
      "preserveDayOfMonth",
    ]);
    for (const [key, value] of url.searchParams) {
      if (!allowedKeys.has(key)) return json({ error: "Unknown query parameter" }, 400);
      if (Object.hasOwn(query, key))
        return json({ error: `Duplicate query parameter: ${key}` }, 400);
      Object.defineProperty(query, key, { value, enumerable: true });
    }
    const result = buildParseResponse(query);

    return json(result.body, result.status);
  },
};
