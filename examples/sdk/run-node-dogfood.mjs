import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dir = fileURLToPath(new URL(".", import.meta.url));
const examples = [
  "node.mjs",
  "state.mjs",
  "calendar.mjs",
  "monthly.mjs",
  "date-list.mjs",
  "counts.mjs",
  "identifiers.mjs",
];

for (const file of examples) {
  process.stderr.write(`sdk:dogfood ${file}\n`);
  execFileSync("pnpm", ["--dir", "examples/sdk", "exec", "node", file], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "inherit",
  });
}

console.log(
  JSON.stringify({
    status: "passed",
    examples: examples.length,
    scope:
      "Workspace-linked @tempus-date/core Node integration scripts only. No pack/install, browser, Worker or calendar-client checks.",
  }),
);
