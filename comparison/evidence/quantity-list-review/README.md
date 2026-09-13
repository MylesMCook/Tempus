# Quantified item-list review

The new item-list path proposed misleading titles for “Buy 3 apples and 2 pears then call Sam tomorrow at noon”, the equivalent “then email Jo” phrase, and a dangling “and” before tomorrow. The original text was visible for confirmation, but the proposals incorrectly treated a sequential instruction or incomplete item list as supported title text.

The item-title recognizer now rejects “then” and a trailing “and”. Valid quantified lists retain their confirmation path. Three regression checks fail before the change and pass afterward. The raw six-input exploratory before/after probe is retained; it is authored failure discovery, not independent evaluation.

The full source suite passes 992 tests plus one existing expected failure. Build/types/scoped lint pass with the existing large-chunk warning. Fourteen built-app journeys and separate file readbacks pass. At both desktop widths, each of the three problematic edits keeps the input visible, shows a diagnostic, and exposes no title choice or export. These are direct-focus/Enter checks, not physical-device or unfamiliar-user evidence.

Archive `5866c6b3c4048852dae4f9595bdb47396e512c71aba9623966c808161a970162` passes seven Node26 examples, installed consumer types and 56-file equality. The valid item-list journey still passes on Node22/26, and the retained 31-case/25-journey replay is unchanged. Full Worker/offline/performance evidence remains on b8ffb7e0. No dependency or strict calculator/API v2 change was made.

Blocking these proposals does not complete the second-action request. General action sequencing, arbitrary lists and independent user recovery remain open. Calendar imports, physical devices, ongoing-duration conformance and public compatibility commitments also remain unfinished. All work stayed local.
