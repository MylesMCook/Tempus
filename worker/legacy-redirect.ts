/** Preserve old API clients while browser bookmarks move to the canonical site. */
export default {
  fetch(request: Request, env: { TEMPUS: { fetch(request: Request): Promise<Response> } }) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return env.TEMPUS.fetch(request);
    }
    url.hostname = "tempus.funnydomainname.com";
    url.protocol = "https:";
    url.port = "";
    return new Response(null, {
      status: 308,
      headers: {
        Location: url.href,
        "Cache-Control": "no-store",
        "Strict-Transport-Security": "max-age=31536000",
        "Referrer-Policy": "no-referrer",
      },
    });
  },
};
