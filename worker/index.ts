import { buildParseResponse } from "@/shared/parse-api";

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
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/parse") {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return json({}, 200, { "Access-Control-Max-Age": "86400" });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, { Allow: "GET, OPTIONS" });
    }

    const query: Record<string, string> = {};
    for (const [key, value] of url.searchParams) {
      if (Object.hasOwn(query, key))
        return json({ error: `Duplicate query parameter: ${key}` }, 400, {
          "Cache-Control": "no-store",
        });
      Object.defineProperty(query, key, { value, enumerable: true });
    }
    const result = buildParseResponse(query);

    return json(result.body, result.status, { "Cache-Control": "no-store" });
  },
};
