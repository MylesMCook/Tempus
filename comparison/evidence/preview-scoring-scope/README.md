# Explicit scope for preview grades

Review confirmed that the legacy timestamp grade and the additional all-day value grade both sort occurrence values before comparison. They preserve occurrence multiplicity and endpoints but ignore order. A matching grade therefore cannot establish that a date list preserved source order or that a preview is chronological.

Generated JSON now includes `metadata.scoringCoverage`, listing checked dimensions and unscored occurrence order, event text, source spans, full recurrence semantics, beyond-preview occurrences, interactive correction, export and human completion. The Markdown report and comparison README state the order limitation explicitly.

No scoring rule, expected answer, fixture, denominator or corpus version changed. Twelve scorer/comparison tests pass. Both family summaries and all 31 result rows remain equal to the retained before-report after excluding only `gpu.raw.timings`; original reports retain those timing samples. The SDK remains a7f9e298.

The scorer already treats unresolved valid/ambiguous inputs as abstentions, not completion, and treats wrong accepted dates as incorrect even with warnings. The separate 25-journey report requires its scripted stages and file checks to pass, but remains Tempus-only authored integration evidence. Neither report is an independent task study.

The independent protocol still requires exact semantic/source-order checks and a comparative correction adapter before relevant claims. Those are not supplied by this metadata change. Current device, import, policy and independent-evaluation gates stay open. No external action occurred.
