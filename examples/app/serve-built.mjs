import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Task-local static verification only. No API emulation, public ingress or deployment.
const repository = fileURLToPath(new URL("../../", import.meta.url));
const root = resolve(repository, "dist/client");
const lines = readFileSync(resolve(repository, "public/_headers"), "utf8").trimEnd().split("\n");
assert.equal(lines.shift(), "/*");
const headers = Object.fromEntries(
  lines.map((line) => {
    assert.ok(
      line.startsWith("  ") && line.includes(":"),
      "Review changed header rules before serving",
    );
    const colon = line.indexOf(":");
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }),
);
createServer((request, response) => {
  try {
    const pathname = new URL(request.url, "http://127.0.0.1:5175").pathname;
    const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!file.startsWith(root + sep) || !["GET", "HEAD"].includes(request.method)) {
      response.writeHead(404);
      response.end();
      return;
    }
    const data = readFileSync(file);
    response.writeHead(200, {
      ...headers,
      "Content-Type": file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : file.endsWith(".html")
            ? "text/html"
            : "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404);
    response.end();
  }
}).listen(5175, "127.0.0.1", () =>
  console.log("Built app with shipped headers: http://127.0.0.1:5175"),
);
