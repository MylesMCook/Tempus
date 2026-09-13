import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const [installationArg, outputArg] = process.argv.slice(2);
assert.ok(installationArg && outputArg, "Usage: node serve-packed.mjs PACKED-INSTALL NEW-OUTPUT");
const installation = resolve(installationArg);
const output = resolve(outputArg);
const root = fileURLToPath(new URL("../../", import.meta.url));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const verified = JSON.parse(readFileSync(join(installation, "verification.json"), "utf8"));
assert.equal(verified.status, "passed");
assert.equal(
  hash(readFileSync(join(installation, "tempus-date-core-0.1.0.tgz"))),
  verified.archiveSha256,
);
for (const [name, expected] of Object.entries(verified.installedFileHashes))
  assert.equal(
    hash(readFileSync(join(installation, "node_modules/@tempus-date/core", name))),
    expected,
  );
const source = readFileSync(join(installation, "calendar-browser.ts"));
assert.equal(hash(source), verified.exampleSourceHashes["calendar-browser.ts"]);
const html = readFileSync(join(installation, "calendar.html"), "utf8");
assert.equal(html, readFileSync(join(root, "examples/sdk/calendar.html"), "utf8"));
assert.ok(html.includes('src="/calendar-browser.ts"'));
mkdirSync(output);
execFileSync(join(root, "node_modules/.bin/esbuild"), [
  join(installation, "calendar-browser.ts"),
  "--bundle",
  "--format=esm",
  "--platform=browser",
  "--target=es2022",
  `--outfile=${join(output, "calendar-browser.js")}`,
  "--log-level=error",
]);
const page = Buffer.from(html.replace('src="/calendar-browser.ts"', 'src="/calendar-browser.js"'));
const bundle = readFileSync(join(output, "calendar-browser.js"));
writeFileSync(join(output, "calendar.html"), page);
writeFileSync(
  join(output, "build.json"),
  JSON.stringify(
    {
      archiveSha256: verified.archiveSha256,
      exampleSha256: hash(source),
      htmlSha256: hash(page),
      bundleSha256: hash(bundle),
      runnerSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
      node: process.version,
      scope:
        "Installed SDK static integration. No hot reload, API, external requests or calendar import.",
    },
    null,
    2,
  ) + "\n",
);
const assets = new Map([
  ["/calendar.html", [page, "text/html; charset=utf-8"]],
  ["/calendar-browser.js", [bundle, "text/javascript; charset=utf-8"]],
]);
const server = createServer((request, response) => {
  const asset = request.method === "GET" ? assets.get(request.url) : undefined;
  response.writeHead(asset ? 200 : 404, {
    "Content-Type": asset?.[1] ?? "text/plain",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(asset?.[0] ?? "Not found");
});
server.listen(5184, "127.0.0.1", () =>
  console.log("Static packed example: http://127.0.0.1:5184/calendar.html"),
);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
