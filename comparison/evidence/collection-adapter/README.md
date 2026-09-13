# Collection precision in the comparison adapter

September 13, 2026. The interpreter adapter previously set all collection occurrence `allDay` fields to false. It now retains each item's explicit all-day value; weekly/monthly previews remain timed under their current explicit-clock contract. This changes comparison tooling, not Tempus or gpu-time behavior.

Three adapter controls verify all-day collections (including their precision grade), mixed date-only/timed collections after a time-scope choice, and timed recurrence/unresolved outcomes. Adapter type-check passes. The combined comparison/scoring/adapter/journey suite passes 16 tests across four files. The 31-case timestamp and precision summaries are unchanged: those comparison inputs did not cover the affected collections. The controls are inspected development tests, not new independent evaluation cases.

[The refreshed snapshot](../collection-adapter-journeys/README.md) retains the same 31 comparison cases and 19 complete tasks with current source identity. All nineteen files pass both readers. Strict Python conformance still exits 1 for the separate duration diagnostic; readback.json preserves that failure and repository-relative paths, with the original report hash recorded.

The legacy grade checks sorted preview timestamps and the recurrence flag. The additional value grade checks all-day flags. Neither grades event-text fidelity, qualifiers, written source order, complete recurring rules, export compatibility or corrected human task completion. A matching preview must not be relabeled a completed schedule. Broader full-semantic evaluation remains gated by the independent protocol, expectations and required access. Historical snapshots are unchanged. Package bytes and deployments are unchanged.
