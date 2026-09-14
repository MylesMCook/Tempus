# Tempus Critique — Keyboard-Only Power User

## 1. Focus target vanishes when the clarification answer resolves cleanly

**Task:** Type an ambiguous phrase, press Tab to a clarification choice, hit Enter/click.
**Evidence** (`date-picker.tsx`):

```jsx
onClick={() => {
  if (interpretation.clarification)
    onChoose({ contextKey: ..., id: choice.id });
  // onChoose commits synchronously; focus before the next user action.
  (document.getElementById("calculated-date") ?? document.getElementById("calculation-error"))?.focus();
}}
```

The comment asserts `onChoose` "commits synchronously," but `onChoose` in `home-page.tsx` calls `setSelection` inside `flushSync`, then React re-renders `DatePicker` with new `interpretation` — for `recurrence`/`interval` kinds the result renders inside `OccurrenceResult`/`IntervalResult`, whose own `#calculated-date` section (in `occurrence-result.tsx`) is a _different_ DOM node created after this `getElementById` call runs against the pre-render DOM. Since `flushSync` does force a synchronous commit before the click handler continues, the ID lookup should actually find the new node in most cases — but only for the plain point-date branch in `date-picker.tsx` itself. For recurrence/collection results, `OccurrenceResult` is a new component instance mounted at that moment; if `flushSync` batching or React's commit timing lags a tick (e.g., under `RecurrenceDecisionsProvider`'s `key={JSON.stringify(...)}` remount), the ref lookup can silently no-op with no fallback or error.
**Impact:** Keyboard users lose their place — no visible focus ring, no announcement — right after resolving the one interaction most likely to need announcement (a clarification prompt).
**Repro:** Trigger an ambiguous recurrence phrase (e.g., something needing a weekday clarification) with a screen reader/focus-visible tracking on; select a choice; observe whether focus lands on the new `#calculated-date` section inside `OccurrenceResult` or stays on the now-removed button.
**Smallest fix:** Replace the manual `getElementById(...).focus()` calls with a `useEffect` keyed on the resolved interpretation/selection (same pattern already used in `home-page.tsx` for the `selection` state), so focus is applied post-commit regardless of which result component mounts.
**Confidence:** Medium — code shows the fragile pattern and an internally inconsistent comment; without running it I can't confirm it actually fails in practice for every case.
**Counterargument:** `flushSync` genuinely forces synchronous DOM commit before the next line executes, so this may work correctly today for all branches; the comment may be accurate and I'm overweighting a stylistic red flag.

## 2. Custom date format failures block the primary use case without dedicated feedback loop

**Task:** Power users routinely override `customFormat` with real `date-fns` tokens (e.g., typing `MMMM Do` instead of `MMMM d`, an easy Moment→date-fns muscle-memory slip).
**Evidence** (`date-picker.tsx`):

```jsx
{
  formatted === null ? (
    <Button
      className="mt-3"
      variant="outline"
      onClick={() => updateSettings({ isCustomFormat: false, dateFormat: "EEEE, MMMM d, yyyy" })}
    >
      Restore readable format
    </Button>
  ) : null;
}
```

When `safeFormatDate` fails, the UI shows "Choose a valid date format" and only offers "Restore readable format" (i.e., abandon the custom format entirely) — there's no inline message identifying _which token_ is invalid, and the custom format input (`id="custom-format"`) keeps the bad value with only `aria-invalid` set, no error text tied via `aria-describedby` beyond the static `format-help` hint.
**Impact:** A power user who mistyped one token gets no diagnostic, just "reset everything," forcing them to re-derive their format string from scratch by trial and error.
**Repro:** Open "Change timezone or format," pick custom, enter an invalid token, observe the calculated-date panel shows only the generic failure with no per-field error text.
**Smallest fix:** When `formatted === null`, additionally render an inline error under `#custom-format` (e.g., "This format could not be applied — check the tokens above") wired via `aria-describedby="format-help custom-format-error"`, without removing the reset button.
**Confidence:** Medium-high — the code path and missing message are directly verifiable in the excerpt; whether users find this "confusing enough to block a task" is a judgment call.
**Counterargument:** The `format-help` text already documents valid tokens, and "Restore readable format" is a reasonable one-click recovery; adding more inline error UI is polish, not a hard blocker.

## 3. JSON dev-tools copy silently includes stale `expression` state due to missing dependency on `attempt`/`selection` timing

**Task:** Inspect JSON via "Copy parser response JSON" right after choosing a recurrence clarification, to compare against the API.
**Evidence** (`date-picker.tsx`):

```jsx
onClick={() => copy(JSON.stringify({ expression, timezone: settings.timezone, reference, format: effectiveDateFormat, interpretation }, null, 2), "Calculation details")}
```

This button lives in the "Developer tools" `<details>`, gated only by `expression.trim()`, not by whether `interpretation.status === "resolved"`. If `interpretation` is `needs-clarification` (mid-flow, before a choice is made), the copied JSON's `interpretation` object won't contain a settled `value`/`calculation`, yet the UI presents this uniformly as "Calculation details" with no state qualifier in the payload or button label.
**Impact:** Power users diagnosing/debugging (the exact audience for this button) get an unlabeled JSON blob that could represent an interim clarification state, not a final calculation — easy to misread when pasting into a bug report or comparing against the API section right below it, which explicitly distinguishes replay eligibility.
**Repro:** Enter a phrase that triggers `needs-clarification`; before answering, open Developer tools and click "Copy parser response JSON"; inspect the clipboard — `interpretation.status` will read `"needs-clarification"` with no visual cue in the button that this is a partial state.
**Smallest fix:** Add the `interpretation.status` value to the button's visible label (e.g., "Copy parser response JSON (needs clarification)") when not `"resolved"`, reusing data already in scope — no new logic required.
**Confidence:** Medium — confirmed from code that no status-based labeling exists; whether this actually confuses users depends on how often they invoke it mid-clarification.
**Counterargument:** The JSON itself contains `status: "needs-clarification"` in plain text, so an attentive developer inspecting raw JSON (the stated persona) would notice immediately — this may not need a UI change at all.

## Task that should already work (no flaw found)

Typing `January 31 2027 plus 1 month plus 1 month` and copying the ISO/timestamp via Developer Tools: `formatted`/`calculation.result` render from `safeFormatDate`/`CalculationTrace`, and the "Copy ISO"/"Copy timestamp" buttons in `date-picker.tsx` operate on `calculation.result.iso`/`.timestamp` directly with no intermediate state — this matches the README's documented month-end example and the code path is straightforward and synchronous.
