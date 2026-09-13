import { expect, it } from "vite-plus/test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIdentity } from "./provenance";

it("does not borrow a containing repository's Git identity", () => {
  expect(gitIdentity("src")).toEqual({
    tempusCommit: null,
    workingTreeDirty: null,
    gitMetadataStatus: "absent",
  });
});
it("does not disguise broken Git metadata as an archive", () => {
  const directory = mkdtempSync(join(tmpdir(), "tempus-git-identity-"));
  try {
    writeFileSync(join(directory, ".git"), "gitdir: missing\n");
    expect(() => gitIdentity(directory)).toThrow();
  } finally {
    rmSync(directory, { recursive: true });
  }
});
