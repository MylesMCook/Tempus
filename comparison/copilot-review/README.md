# Copilot product critiques

Three tool-disabled GitHub Copilot CLI 1.0.83 reviews examined public revision `4477e516a86b9c9ef33c2b4ecf7574500a3156c7`. They reviewed supplied source, not a live browser. Their confident wording and line references are unverified claims until checked below. None is an independent user study.

## Reviewers

| Persona                                                               | Copilot model      | Report                    |
| --------------------------------------------------------------------- | ------------------ | ------------------------- |
| Impatient occasional user; low tolerance for jargon and repeated work | `gemini-3.8-flash` | [Critique](occasional.md) |
| Keyboard-only power user; rapid edits, correction and JSON inspection | `claude-sonnet-5`  | [Critique](keyboard.md)   |
| Skeptical TypeScript integrator; setup, errors and complete data      | `gpt-5.6-sol`      | [Critique](developer.md)  |

Model selection checked [models.dev](https://models.dev/) and [GitHub support](https://docs.github.com/en/copilot/reference/ai-models/supported-models), then verified all three with successful Copilot runs. All support reasoning and adequate context; distinct providers give different reviewers, not guaranteed independent judgments. Catalog prices are not a Copilot bill estimate. [Run status](runs.json).

Each prompt requested at most three concrete flaws, a task/input, source evidence, reproduction, smallest fix, confidence, counterargument and a task expected to work. It prohibited new product families, rewrites, dependencies, edits, tools and claimed browser tests. Only public committed files were supplied. Authentication details and full duplicated source prompts are not retained here.

## Decisions

| Finding                                                   | Decision and evidence                                                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ordinary clarification looks like a system failure        | Confirmed in browser: numeric-date choices used a red alert and invalid input state. Use a neutral polite status for offered choices; retain red alerts for unsupported input. |
| Invalid custom format has no feedback beside its field    | Confirmed. Add a short associated error message, preserve the format and phrase, and remove the error when corrected.                                                          |
| SDK install guide stops before a usable consumer          | Confirmed. Add exact archive installation and ESM smoke commands, tested in a fresh consumer.                                                                                  |
| SDK returned statuses do not cover thrown argument errors | Confirmed against source and runtime. Document exception classes and HTTP 400 variants without inventing new machine codes.                                                    |
| Clarification focus race                                  | Not reproduced. The model contradicts its own claim about `flushSync`; the DOM is committed before focus. Keep the existing implementation.                                    |
| Stale parser-response JSON                                | Rejected: the report identifies no stale data and the payload already has an explicit status. Keep unresolved diagnostic output available.                                     |
| Copy only the display date                                | Rejected: removes timezone, time and event context requested earlier. A format-only copy option requires a separate demonstrated need.                                         |
| Collapse arithmetic steps                                 | Rejected: visible arithmetic is the current product focus.                                                                                                                     |
| Expand or rename the public `limits` object               | Deferred. Preparation remains authoritative and reference lists its limits. Do not rename a public export or duplicate policy constants for an unverified preflight workflow.  |

[Before reproduction](before.json). Code changes are confined to the existing date-picker component; no engine, dependency or infrastructure changes.

## Verification and remaining gaps

The [new browser regression](browser.json) covers clarification, keyboard focus, custom-format correction without input loss, and unsupported-input alerts in Chromium, Firefox and WebKit. The full suite has 1,181 passing tests and the existing expected calendar-reader failure. Formatting, types, lint and build pass. A fresh installed consumer prints `0.1.0 resolved` using the documented command.

[Packed-SDK/browser journeys](browser-contract.json) also pass for calculation, correction, complete copy and calendar-file output. Cloudflare deployment dry run passes.

A clean browser run is not a screen-reader or physical-phone test. These model critiques do not establish usability improvement, language coverage or competitive superiority. Actual calendar imports and the independent evaluation gate remain open.

## Release

[PR #7](https://github.com/MylesMCook/TempusTotal/pull/7) merged as `ec6e01c`. Cloudflare version `1a9e0cc8-0ed8-46b0-bfae-c876794d07e0` is deployed. [Live fixes](live-fixes.json) pass in all three browser engines; [both-host checks](live-report.json) cover routes, API, calculation, correction and full five-date copy. Previous version `228380e5-5b2f-4ec9-8ca4-69adebe55f4d` remains the rollback target.
