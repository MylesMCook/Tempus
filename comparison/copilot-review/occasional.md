### Realistic Task That Already Works

- **Task/Input**: `today plus 2 weeks minus 3 days`
- **Expectation**: Enter a basic arithmetic phrase and immediately see a single computed target date in the user's timezone.
- **Current Status**: Works. The engine resolves to a single point in time, formats it into readable text (e.g., `EEEE, MMMM d, yyyy`), and updates live as typed (`date-picker.tsx`, lines 112–115, 237–245).

---

### Actionable Product Flaws

#### 1. "Copy date" button pollutes the clipboard with multi-line diagnostic metadata

- **Task/Input**: Type `today plus 2 weeks` and click **Copy date** to paste the date into an external form or message.
- **Exact Code Evidence**: `src/features/parser/components/date-picker.tsx`, lines 278–291:
  ```tsx
  value={
    formatted === null
      ? null
      : [
          interpretation.status === "resolved"
            ? interpretation.event?.text
            : undefined,
          formatted,
          dateOnly
            ? `Date only · no time specified · ${calculation.timezone}`
            : `${safeFormatDate(new Date(calculation.result.timestamp), calculation.timezone, resultClockFormat(calculation.result.local))} · ${calculation.timezone} (UTC${calculation.result.offset})`,
        ]
          .filter(Boolean)
          .join("\n")
  }
  ```
- **Impact**: The button promises "Copy date", but pastes a 2–3 line block containing parser event labels and timezone/offset strings. An impatient user has to manually select and delete the extra lines every time.
- **Reproduction Steps**:
  1. Enter `today plus 2 weeks`.
  2. Click **Copy date**.
  3. Paste the clipboard into any single-line input or text box.
  4. Observe lines like `Date only · no time specified · America/New_York` pasted along with the date.
- **Smallest Fix**: Change `value` in `CopyDate` to pass `formatted` directly instead of joining the metadata array (`value={formatted}`).
- **Confidence**: High (code fact: string joining with `\n` is hardcoded in `date-picker.tsx`).
- **Counterargument**: Users archiving date calculations in notes might want the full context (timezone and time specification) preserved alongside the date.

---

#### 2. Disambiguation choices are styled as destructive system failures

- **Task/Input**: Enter an ambiguous phrase requiring clarification (e.g., choosing between interpretations).
- **Exact Code Evidence**: `src/features/parser/components/date-picker.tsx`, lines 98, 183–193:
  ```tsx
  const error = interpretation.status !== "resolved" ? interpretation.error : undefined;
  ...
  : error ? (
    <section
      id="calculation-error"
      tabIndex={-1}
      role="alert"
      className="rounded-md border border-destructive/40 p-3"
    >
      <h2 className="font-semibold text-destructive">{error.message}</h2>
      <p className="mt-2 text-sm">{error.hint}</p>
      {interpretation.status === "needs-clarification" && interpretation.clarification ? (
  ```
- **Impact**: When the engine simply needs the user to pick between two valid meanings, it renders inside `#calculation-error` using `role="alert"`, `border-destructive/40`, and `text-destructive`. A user with zero tolerance for broken tools assumes the parser failed rather than realizing it is asking a routine question.
- **Reproduction Steps**:
  1. Enter a phrase that produces `status: "needs-clarification"`.
  2. Observe the red destructive alert box, warning header, and error styling wrapping the choice buttons.
- **Smallest Fix**: Separate `interpretation.status === "needs-clarification"` into its own block before the `error ?` check, styled as a neutral card with standard borders and typography.
- **Confidence**: High (code fact: `needs-clarification` is nested inside `error ? <section className="border-destructive/40">`).
- **Counterargument**: Reusing the error container minimizes layout divergence and guarantees screen-reader focus handling (`#calculation-error`) without additional markup.

---

#### 3. Calculation trace auto-expands by default, cluttering the view with jargon

- **Task/Input**: Calculate any multi-step date expression (e.g., `tomorrow minus 3 days`).
- **Exact Code Evidence**: `src/features/parser/components/calculation-trace.tsx`, line 8:
  ```tsx
  <details open={calculation.ok && calculation.steps.length > 0} className="mt-5 border-t">
  ```
- **Impact**: An impatient user wanting just the answer is forced to view an auto-opened diagnostic list containing "Starting date", ISO timestamps, and step mechanics. It pushes viewport content down and forces working memory to filter out unnecessary internal mechanics.
- **Reproduction Steps**:
  1. Type `tomorrow minus 3 days`.
  2. Note that the `<details>` accordion is automatically open on render without the user clicking "Show calculation steps".
- **Smallest Fix**: Remove the `open` prop entirely (`<details className="mt-5 border-t">`) so the trace defaults to collapsed.
- **Confidence**: High (code fact: `open` attribute is conditionally bound to `calculation.steps.length > 0`).
- **Counterargument**: Tempus is explicitly marketed as "Date math, with the steps"; showing steps by default reinforces its core premise.
