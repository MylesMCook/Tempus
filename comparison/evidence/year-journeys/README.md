# Development review snapshot

This is an inspected development corpus and scripted integration replay, not an untouched holdout, human study, calendar-client import or competitive ranking. No capability gate closes from copying these reports.

- [Comparison](report.md) and [raw inputs/results](report.json): 31 inspected cases, gpu-time 0.2.1.
- [Journeys](journeys.md) and [raw stages](journeys.json): 18 authored tasks, 18 validated files retained in journey-files/. Failed or incomplete records are retained.
- Source hashes identify the dirty working-tree implementation; the commit alone does not reproduce it. The manifest hashes every retained evidence file and the exporter.
- This snapshot omits separate SDK/browser, performance and diagnostic-reader evidence. Their documented limitations and failures remain release gates.

From the repository root, verify retained file integrity with:

```sh
node comparison/export-evidence.mjs verify comparison/evidence/year-journeys
```

To regenerate current source results, run `pnpm install --frozen-lockfile`, then `pnpm exec vp test run comparison/comparison.test.ts comparison/scoring.test.ts comparison/journeys.test.ts`. Export to a new directory with `node comparison/export-evidence.mjs export comparison/evidence/NEW-name`. Source provenance must match at export time. A different runtime or edited source may produce different bytes; retain both reports and explain differences. No network or calendar write is performed by the exporter.
