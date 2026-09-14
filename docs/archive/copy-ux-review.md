## Laws of UX critique

> Historical v1 review. The current engine and interaction contract is documented in [Phoenix](phoenix.md).

**Context read:** Tempus calculator, settings, examples, API playground, privacy page, and their source. Assumed primary reader: someone turning a date phrase into a usable date; developers use the disclosed API. This is an expert review, not user research.

**Selected lenses:** Mental Model, Cognitive Load, Law of Proximity.

### 1. Mental Model - local calculator and server API have different consequences

- **How it applies here:** The privacy page said preferences never leave the device, although API URLs include them. The calculator and API share a phrase but use different environments for relative calendar calculations.
- **Recommendation:** Explain the server timezone beside the playground; disclose phrase/settings transmission before submission. Replace the privacy page’s absolute local-only claim with separate calculator, storage, and hosting explanations.
- **Why this follows from the law:** Accurate consequences establish a model that matches what the action does and reduces surprise when the API returns a different calendar date.
- **Watch-out:** This copy explains existing behavior; it does not unify calendar arithmetic or establish legal compliance. Hosting retention is plan-dependent, so no fixed retention promise is made.

### 2. Cognitive Load - redundant choices and parser terminology interrupt the task

- **How it applies here:** Six API example buttons repeat choices already offered above. “Parser settings,” “hitting the API,” and “Could not parse” ask calculator users to interpret implementation vocabulary.
- **Recommendation:** Remove the repeated API examples while retaining the editable API phrase. Use “Date settings,” a concrete recovery example, and request feedback that identifies the next action.
- **Why this follows from the law:** Removing duplicate choices reduces scanning; concrete recovery phrases reduce the effort needed to decide what to type next.
- **Watch-out:** Preserve technical parameter names and JSON in the developer section because they support actual API use.

### 3. Law of Proximity - timezone guidance belongs beside the timezone selector

- **How it applies here:** The display-only caveat appeared beneath the main phrase input, detached from the control it explains. It could be missed when choosing a timezone inside settings.
- **Recommendation:** Place and programmatically associate the explanation with Display timezone. Keep the input helper focused on browser calculation. Put request-transmission guidance directly below the API form.
- **Why this follows from the law:** Nearby guidance groups a control with its consequences and directs attention to the relevant rule at the moment of choice.
- **Watch-out:** Additional guidance must fit the existing scrollable settings panel on narrow screens; spacing and keyboard behavior need browser verification.

## Prioritized next moves

1. Correct privacy claims and disclose API transmission and differing calendar results.
2. Move timezone guidance beside its selector and remove redundant API examples.
3. Replay calculator recovery, settings, API success/error responses, and privacy navigation at desktop and mobile sizes.

## Writer findings

Removed unsupported promises about cookies, request use, update notifications, and an unspecified contact channel. Replaced vague parser errors with example-based recovery. Kept the existing concise hero and developer response labels. Logging claims were checked against the enabled Wrangler observability configuration and [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).

## Verification

Implemented in `90ba06b`. Critique validator, source checks, type checking, all 40 tests, and production build passed. Browser replay covered invalid-input recovery, settings guidance and Escape, API success and HTTP 400 via Enter, and privacy navigation. Desktop and mobile privacy/settings were visually checked; the expanded mobile API had no horizontal page overflow. The deployed calculator, API HTTP 200, and privacy page were verified on the public domain. No user study or screen-reader device testing was performed.
