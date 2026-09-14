# Verdict

Tempus’s core boundaries are unusually honest: deterministic local SDK, separate strict HTTP calculator, explicit clarification, and no false claim of reminder delivery. But the integration surface still feels like a candidate assembled for its authors rather than a package a skeptical TypeScript consumer can adopt and operate predictably.

## 1. Local installation instructions stop before a working consumer import

**Task/input:** Install the unpublished SDK into a clean Node 22.12 TypeScript application and verify `parse("tomorrow", context)`.

**Code evidence:** `packages/core/README.md` gives:

```sh
pnpm build:sdk
cd packages/core
pnpm pack
```

It then says only “Install the resulting tarball in your app.” `reference.md` adds the Node floor, ESM requirement, BigInt/Intl needs, and Temporal dependency, but still provides neither the tarball name/install command nor a minimal consumer verification command.

**Impact:** The first integration task requires guessing the artifact path and package-manager syntax. Because multiple builds share `0.1.0`, accidentally installing an older tarball is especially plausible.

**Synthetic reproduction:**

1. Follow the documented commands.
2. Move to a separate consumer project.
3. Try to continue using only the quickstart.
4. There is no exact `pnpm add /path/to/...tgz`, `npm install ...tgz`, or import verification step to follow.

**Smallest fix:** Add the emitted filename pattern, exact pnpm/npm installation examples, Node requirement, and a five-line smoke script that prints `SDK_VERSION` and checks a resolved parse. Show how to record the tarball hash.

**Confidence:** 10/10.

**Counterargument:** Experienced package authors know how `pnpm pack` works. That is not a sufficient setup contract for an unpublished package whose documentation explicitly warns that identically versioned builds differ.

## 2. “Check `status`” is not the whole SDK error contract

**Task/input:** Safely wrap `parse`, `parseMany`, and `createParser` without turning programmer errors or resource failures into unresolved language results.

**Code evidence:** The README says, “All three calls are synchronous. Check `status` before using a result.” But `src/shared/sdk.ts` also throws:

- `TypeError("Input must be a string.")`
- `TypeError("Provide a timezone and reference as strings.")`
- `TypeError("Invalid clarification selection.")`
- `TypeError("Batch input must be an array of strings.")`
- `RangeError("Use at most 100 inputs per batch.")`

The public docs explain parse statuses but provide no consolidated throw table or stable machine discriminator for thrown failures. Separately, `docs/api.md` promises HTTP 400 “with an error and recovery guidance” without documenting the JSON error shape.

**Impact:** An integrator cannot derive one predictable boundary from the docs. They must discover which failures return discriminated data, which throw exceptions, and what an HTTP error body contains. Branching on exception or response wording would contradict the reference’s own warning not to treat prose as machine identifiers.

**Synthetic reproduction:**

1. Implement exactly the README pattern: call `parseMany` and branch on each result’s `status`.
2. Supply 101 inputs or malformed runtime data crossing a JavaScript boundary.
3. No result exists to inspect; the call throws through the documented status-based handling.
4. Attempt to type an HTTP 400 handler from `docs/api.md`; no response interface or stable error code is specified.

**Smallest fix:** Document a compact failure matrix for each public function. State which invalid arguments throw and whether exception classes/messages are stable. Publish the HTTP success and error JSON shapes with stable error codes; if no codes exist, add a small code field rather than asking clients to parse prose.

**Confidence:** 9/10.

**Counterargument:** TypeScript catches most invalid SDK arguments, and HTTP status codes identify broad API failures. Runtime boundaries still exist, batch limits are valid typed inputs, and status codes do not provide the promised recovery guidance programmatically.

## 3. The exported `limits` object cannot describe complete-data constraints

**Task/input:** Preflight “every Monday at noon for 1,000 occurrences” and determine whether Tempus can return or export the complete schedule without relying on UI behavior.

**Code evidence:** `src/shared/sdk.ts` exports:

```ts
export const limits = Object.freeze({
  inputCharacters: 200,
  clarificationHistory: MAX_SELECTION_HISTORY,
  batchSize: 100,
  weeklyPreview: 3,
  weeklyInterval: 52,
  groupedIntervals: 14,
  excludedDates: 10,
});
```

But `reference.md` separately documents a count limit of 1,000, finite export of 1,000 events and ten future calendar years, and calendar years 1–9999. It explicitly admits that `limits` “is not an exhaustive listing of every export/timezone constraint.”

**Impact:** The SDK offers a machine-readable object named `limits`, but consumers still need to transcribe critical completeness/export limits from prose. That invites drift and makes it harder to distinguish a full finite result from an input that will be blocked by preparation constraints.

**Synthetic reproduction:**

1. Import `limits` to build client-side validation for recurrence preparation.
2. Inspect it for maximum occurrence count, export event count, or export horizon.
3. None are present.
4. Consult prose and duplicate `1_000` and ten years in application code, with no typed link to the installed candidate build.

**Smallest fix:** Add the documented count and export ceilings to the exported contract, preferably under explicit `parsing` and `calendarPreparation` groups. If some constraints cannot be represented as constants, rename the current export to `parserLimits` so it does not imply completeness.

**Confidence:** 9/10.

**Counterargument:** The reference clearly warns that `limits` is incomplete and preparation returns explicit statuses. Honest prose prevents overclaiming, but it does not make preflight limits discoverable or version-coupled.

## A realistic task that should already work

A local ESM consumer should be able to parse `"every Monday at noon for 5 occurrences"` with an explicit IANA timezone and reference, pass the resolved result to `prepareCalendar`, and read all five occurrences when preparation returns `ready`. The public docs consistently describe this as synchronous, deterministic, data-only behavior with no clock reads, network access, file writes, or reminder delivery.
