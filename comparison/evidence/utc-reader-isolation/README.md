# Isolating the UTC-to-local reader disagreement

The retained Chicago spring-boundary failure also occurs with a hand-written VTIMEZONE that imports no Tempus, Temporal or pinned timezone data. The same finite fixture reproduces a fall-boundary disagreement. This establishes that Tempus's generator is not necessary to trigger this reader behavior; it does not certify every generated timezone definition.

The synthetic `Probe/Seasonal` zone defines a prior standard offset and the two 2026 transitions explicitly. Expected civil clocks and offsets are authored from those transitions. No real-world timezone lookup is required.

| UTC instant | Expected civil clock | ical.js 2.2.1 | Python embedded-zone reader |
| --- | --- | --- | --- |
| 2026-03-08 07:59:59Z | 01:59:59, offset −06:00 | 02:59:59 | 01:59:59 |
| 2026-11-01 06:59:59Z | 01:59:59, offset −05:00 | 00:59:59 | 01:59:59 |

ical.js matches seven of nine civil clocks; icalendar 7.3.0 matches all nine clocks, offsets and round trips. Python uses `to_tz(lookup_tzid=False)`, so the result comes from the embedded observances rather than a named system-zone replacement. The other rows cover ordinary dates and each transition instant plus one second.

The installed `Timezone.convert_time` subtracts the source offset, then asks the destination `utcOffset` about the resulting clock fields. That lookup compares fields against local transition boundaries. This source path is consistent with selecting the wrong seasonal offset when converting UTC fields near a transition. The spring conversion can still round-trip to the original UTC instant while displaying the wrong local clock; the fall example changes the round-tripped instant too. Round-trip equality alone is therefore insufficient validation of civil labels.

## Reproduction

```sh
node comparison/calendar/utc-conversion-probe.mjs /absolute/NEW-output
uv run --locked --offline comparison/calendar/read-utc-conversion.py /absolute/NEW-output
```

The Node conformance command deliberately exits **1**, with `conforms: false`. The Python command exits **0** for this fixture. Both require a new output/report path and retain expectations and observations. The locked Python dependencies must already be available for offline execution. Raw reader outputs, fixture, runner snapshots, installed reader source and a captured process exit are retained here.

The existing expected-failure test remains unchanged. No dependency was patched, replaced or upgraded; no export restriction was relaxed. This is a reader-conformance diagnostic, not an independent user evaluation or calendar-client import. A second reader agreeing on nine authored instants does not establish whole-library or whole-export correctness. Actual client imports, ongoing-duration policy and the other release gates remain open.

Next validator work should assert both civil clock/offset and instant preservation at transition boundaries, retaining disagreements. Do not turn this isolated result into a claim that all generated files are valid or all other ical.js operations are unusable. The recorded recurrence-duration disagreement is a separate behavior with its own evidence.
