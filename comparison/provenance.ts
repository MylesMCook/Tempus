import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

/** Snapshot all shared implementation files, including pinned timezone data.
 * This is a source snapshot, not a claim to hash every runtime dependency.
 */
export async function sourceHashes(extraPaths: string[]) {
  const paths: string[] = [];
  async function collect(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await collect(path);
      else if (
        entry.isFile() &&
        ((entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) ||
          entry.name === "timezone-LICENSE.txt")
      )
        paths.push(path);
    }
  }
  await collect("src/shared");
  const files = [
    ...new Set([
      ...paths,
      ...extraPaths,
      "comparison/provenance.ts",
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
    ]),
  ].sort();
  return Object.fromEntries(
    await Promise.all(
      files.map(async (path) => [
        path,
        createHash("sha256")
          .update(await readFile(path))
          .digest("hex"),
      ]),
    ),
  );
}

/** Archives have no Git identity. Never borrow a containing repository's identity. */
export function gitIdentity(directory = process.cwd()) {
  if (!existsSync(join(directory, ".git")))
    return { tempusCommit: null, workingTreeDirty: null, gitMetadataStatus: "absent" as const };
  const run = (args: string[]) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  // Existing but unreadable/broken metadata is an error, not a source archive.
  return {
    tempusCommit: run(["rev-parse", "HEAD"]),
    workingTreeDirty: run(["status", "--porcelain"]).length > 0,
    gitMetadataStatus: "available" as const,
  };
}
