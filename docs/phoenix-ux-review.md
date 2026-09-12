## Laws of UX critique

**Context read:** Rebuilt date calculator for someone who needs a date and a trustworthy explanation; API replay is secondary. Reviewed source and actual desktop/mobile behavior.
**Selected lenses:** Mental Model, Cognitive Load, Law of Proximity

### 1. Mental Model - the written phrase should predict the calculation

- **How it applies here:** V1 sorted changes by unit and used host-local arithmetic. “Jan 30 plus 2 days plus 1 month” could disagree with its apparent order, and UI/API dates could differ.
- **Recommendation:** Apply steps in written order, calculate in the visible timezone, and replay the same captured instant. Implemented; browser and API both reached March 1.
- **Why this follows from the law:** Matching visible inputs and written order reduces the need to learn an invisible execution order, making results easier to predict.
- **Watch-out:** Calendar days and elapsed hours differ across clock changes. The trace explains that boundary; ambiguous clock times return guidance.

### 2. Cognitive Load - keep verification available without requiring it

- **How it applies here:** The result now leads, while ISO values, trace, and API are disclosures. The API uses the existing phrase and reference instead of a second form.
- **Recommendation:** Preserve those disclosures and show whether a replay matches or has become stale. Implemented and exercised with now, refresh, successful replay, HTTP 400, and offline recovery.
- **Why this follows from the law:** Disclosure reduces competing information, and shared inputs reduce the need to recall or re-enter a phrase.
- **Watch-out:** A collapsed trace must remain discoverable. “See how it works” is a labelled keyboard-operable native disclosure.

### 3. Law of Proximity - controls belong beside the state they change

- **How it applies here:** Timezone is beside the phrase; formatting is beside the result. Mobile review found the format label could wrap separately from its select.
- **Recommendation:** Keep label and select in one group. Implemented, along with a bounded API response scroller after mobile replay exposed page overflow.
- **Why this follows from the law:** Spatial grouping increases the perceived relationship between timezone and calculation, and between format and presentation.
- **Watch-out:** Grouping should survive narrow screens; visual proximity alone does not replace programmatic labels.

## Prioritized next moves

1. Preserve shared-input API parity and exact-result regression tests as release gates.
2. Recheck expanded trace/API states whenever layout or response shape changes.
3. Validate comprehension with actual users before expanding the finite phrase grammar.

## ADHD-oriented follow-up — September 12, 2026

The I Have ADHD plugin's communication guidance informed this UI pass: lower starting friction, a small visible choice set, and visible completion. This is a usability adaptation, not a claim of clinical benefit.

- Start with one phrase field and three quick examples. A shorter heading keeps the working area near the top.
- Put the result and primary copy action together. The button reads “Date copied” after success, without a duplicate toast, and resets when the calculation or format changes.
- Group timezone and formatting in a native disclosure below the result. Keep the selected timezone visible while collapsed. This replaces the always-visible placement described in the original proximity review above.
- Keep approximations and recovery actions visible. Preserve the live trace, diagnostic copy, precise timestamps, all examples, and API replay behind disclosures. Selecting a detailed example focuses and reveals the result without focusing the text field.

Verified in the browser: desktop, 390px and 320px widths, first-screen result/copy visibility at 320px, no horizontal overflow, keyboard tab-to-copy and activation, example category arrow keys, result focus after example selection, invalid phrase/timezone/format recovery, approximation trace, and HTTP 200 API parity. The final preview emitted no console warnings or errors. All 255 engine/API/storage tests, source checks, TypeScript build, and production build passed. No parser, storage, dependencies, or API semantics changed. Physical phone keyboards and assistive-technology announcements were not directly tested.
