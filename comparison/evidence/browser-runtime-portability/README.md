# Explicit browser runtime dependency

The browser performance runner imported playwright-core without declaring it in the project. On this host, Node found a parent-directory installation. That hidden prerequisite would make a fresh checkout fail despite installing the repository lockfile.

The runner now requires PLAYWRIGHT-ENTRY as its third argument and imports that explicit path, matching the SDK browser verifier. The command and prerequisites are documented in comparison/performance/README.md. No package or dependency was added. Existing two-argument invocations must supply the new path.

Verification completed ten Chrome processes using existing Playwright 1.59.1. The same recorded parsing bundles and pinned CPU comparator were used; all preview checks passed. The report retains raw timings and artifact identity (756fbb4e); it is a tooling smoke run, not a new optimization comparison or a replacement for the paired performance evidence. Scope and timing limitations remain in the report.

Missing and nonexistent runtime paths reject before output creation, even while the parent installation exists. Scoped lint and diff checks pass. Module-entry and package-manifest hashes are recorded; this is not full dependency attestation. The runner closed its temporary browser processes and loopback server.

This fixes one hidden dependency. It does not establish a successful fresh-machine setup, provision Chrome or browser binaries, or verify physical devices. Other diagnostics explicitly accept a runtime path; their installation prerequisites still need validation by a new consumer. No app/SDK behavior, matrix requirement, package dependency, deployment or calendar changed.
