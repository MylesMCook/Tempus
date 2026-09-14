import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import api, { type Env } from "../worker/index";
import { Document } from "./document";
import { EngineApp } from "./engine-app";
import { PrivacyPage } from "./routes/privacy-page";
import { DevelopersPage } from "./routes/developers-page";

const app = defineApp([
  ({ response, rw }) => {
    response.headers.set(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' 'nonce-${rw.nonce}'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Strict-Transport-Security", "max-age=31536000");
    response.headers.set("Cache-Control", "no-store");
  },
  render(Document, [
    route("/", () => <EngineApp initialReference={new Date().toISOString()} />),
    route("/privacy", PrivacyPage),
    route("/developers", DevelopersPage),
    route("*", ({ response }) => {
      response.status = 404;
      return (
        <main id="main" className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <a className="mt-4 inline-block underline" href="/">
            Return to Tempus
          </a>
        </main>
      );
    }),
  ]),
]);

export default {
  fetch(
    request: Request,
    env: Env & Parameters<typeof app.fetch>[1],
    ctx: Parameters<typeof app.fetch>[2],
  ) {
    if (new URL(request.url).pathname.startsWith("/api/")) return api.fetch(request, env);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    return app.fetch(request, env, ctx);
  },
};
