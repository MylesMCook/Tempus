# Public consumer type contract

The package verifier now compiles `examples/sdk/contract.ts` against the installed package's public entries. It handles each resolved value kind exhaustively and confirms that TypeScript rejects consuming unresolved values, absent prompts, point endpoints, recurrence previews as files, failed file text, unresolved export plans and missing reference context.

The annotated fixture compiles. Removing its seven expected-error annotations produces eight compiler diagnostics and exit code 2. This confirms the checks fail for their intended reasons. These are compile-only consumer checks; they are never executed or shipped in the package.

A fresh package verification passes seven Node26 runtime examples, all four typed consumers and 56-file archive equality. The tarball remains b8ffb7e0 byte for byte; existing runtime/performance evidence remains applicable to those unchanged bytes. Scoped lint passes.

An initial invocation refused an existing scratch directory without overwriting it. A later intermediate fixture edit accidentally applied `void` to two valid expressions; the package verifier failed its installed-types step after the seven runtime examples passed. That failed report and fixture are retained. The corrected fixture passes. These were verification-tooling mistakes, not SDK runtime changes.

The source/README review found no new confirmed runtime defect in the inspected parsing wrappers, option snapshots, selection helper or public calendar entry points. This is a bounded consumer-contract review, not a full security scan. TypeScript cannot prove semantic calendar correctness, prevent JavaScript misuse or establish current user authorization. Hosts still own stale-handler invalidation, interpretation review and external actions.

Cross-version guarantees, package naming/version ownership, independent consumer review, physical devices and calendar-client imports remain open. This check does not establish API stability by itself. No package was published and no external state changed.
