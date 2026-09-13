# Isolated source build

The current nonignored source files were copied into a new directory without `.git`, `node_modules`, ignored secrets, build output or historical generated results. A frozen-lockfile offline install with lifecycle scripts disabled created a separate dependency tree. The existing pnpm store and host tools were reused; this is not a fresh machine, network install or hermetic build.

SDK and app builds passed. The first test run exposed a comparison-report dependency on `git rev-parse HEAD`: 991 tests passed, one comparison test failed, and the existing reader failure remained expected. Comparison provenance now records null commit/dirty fields and `gitMetadataStatus: absent` when the source root has no `.git`. It does not borrow a containing repository's identity. Existing but broken Git metadata still throws. Source and lockfile hashes remain recorded.

After overlaying only the three recorded comparison-tooling files, the isolated and working-checkout suites each pass 994 tests plus one existing expected failure across 59 files. Type checks and scoped lint pass. The isolated packed SDK is byte-identical to archive `5866c6b3c4048852dae4f9595bdb47396e512c71aba9623966c808161a970162`; client build assets also match exactly. No app/SDK behavior or dependency changed.

The 31 comparison semantic outputs match before/after and between directories. Only `results[*].gpu.raw.timings` is omitted from that comparison because those measurements differ per run. Raw reports retain the timing fields. The package comparison uses the packed tarball: pnpm normalizes package.json formatting, so a raw source-manifest byte comparison is not an equivalent packaging check.

The initial source manifest covers 2,917 files. `overlay.json` records the subsequent tooling changes. Retained build/install/test logs and validation.json identify the results. No whole-repository `pnpm check` success is claimed; unrelated Rust-spike formatting remains untouched. The existing expected reader failure, signature authentication, cross-host/toolchain provenance, independent evaluation, physical devices and real imports remain open.

To repeat, copy tracked and nonignored untracked files to a new directory, excluding symlinks pending review; retain a file-hash manifest. In that directory run `pnpm install --offline --frozen-lockfile --ignore-scripts`, `pnpm build:sdk`, `pnpm build` and `pnpm test --run`. Pack packages/core separately and compare the resulting archive. An offline cache miss should fail rather than fetching or changing the lockfile. This procedure requires the declared existing Node/pnpm toolchain and populated package store.

All work stayed local. No persistent service, cloud configuration, package publication or calendar was changed.
