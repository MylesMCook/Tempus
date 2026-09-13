# Lowercase recipients through correction and export

A supported action can now propose a recipient title without requiring capital letters: “Buy groceries for mom tomorrow at noon” and “Send flowers for jo smith tomorrow at noon” ask for title confirmation. The original wording and source spans remain intact. Date/clock questions follow confirmation; no recipient is selected automatically.

The existing one-to-three-word boundary remains. Temporal names such as May, indefinite durations, uncertainty, conditions and sequential instructions remain unresolved in the checked contrasts. Capitalization is no longer the guard against those qualifiers; explicit checks retain that boundary. This is bounded title recognition, not arbitrary name or document extraction.

## Verification

- The three new point examples and lowercase duration journey failed before the change and pass afterward. New qualifier contrasts pass; existing capitalized-recipient expectations remain unchanged.
- 1004 source tests pass, with the existing expected calendar-reader failure, across 59 files. Build/types and scoped lint pass; the bundle-size warning remains.
- New archive `3c93bbcadab020fb4903ecf044d0ad2e1a15e74d289636ed66a783823da07a50` passes seven examples on Node22/26, installed consumer types and 56-file equality. A targeted packed journey confirms title, date order, repeated clock, exact interval/file output and mom→dad edit invalidation on both runtimes.
- Sixteen built-app Chrome journeys pass at 320/1280 pixels. Separate readers accept all sixteen downloaded files. The new case retains “Buy apples for mom” and resolves November 1, 2026 at 07:30–08:00Z only after title/date/DST answers. Editing mom to dad restores title confirmation and removes export access.
- The existing 31-case/25-journey packed replay is unchanged. The updated version-6 app reader also accepts the retained version-5 fourteen-file report.

This adds complete authored task coverage, not independent accuracy or usability evidence. Direct-focus/Enter desktop checks are not physical-device or sequential-Tab proof. File reading is not calendar-client import. Full offline/Worker and performance evidence still belongs to e70f6d12; this new wording was not measured there.

The task-local server was stopped after verification. No deployment, publication, cloud setting or calendar write occurred. The original matrix requirements, ongoing-export restrictions and independent-evaluation gates remain unchanged. Raw before/after logs, app files/readbacks, package provenance, targeted runtime results and source snapshots are retained here.
