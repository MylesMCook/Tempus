# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
"""Read diagnostic files from monthly-split.mjs; no calendar writes."""
import hashlib
import json
import sys
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path
import icalendar
import recurring_ical_events

base = Path(sys.argv[1])
manifest = json.loads((base / "ical-js.json").read_text())
report = {"versions": {name: version(name) for name in ["icalendar", "recurring-ical-events"]}, "cases": []}
for case in manifest["cases"]:
    content = (base / f"{case['name']}.ics").read_bytes()
    assert hashlib.sha256(content).hexdigest() == case["sha256"]
    expected = json.loads((base / f"{case['name']}.expected.json").read_text())
    entry = {"name": case["name"], "sha256": case["sha256"]}
    try:
        calendar = icalendar.Calendar.from_ical(content)
        events = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2426, 1, 1, tzinfo=timezone.utc))
        observed = sorted(event.decoded("dtstart").astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") for event in events)
        assert all((event.decoded("dtend") - event.decoded("dtstart")).total_seconds() == 1800 for event in events)
        assert len({str(event["uid"]) for event in events}) == 2
        mismatch = next((i for i, value in enumerate(expected) if i >= len(observed) or value != observed[i]), None)
        entry.update(status="passed" if observed == expected else "failed", observedCount=len(observed), firstMismatch=None if mismatch is None else {"index": mismatch, "expected": expected[mismatch], "observed": observed[mismatch] if mismatch < len(observed) else None})
    except Exception as error:
        entry.update(status="failed", error=str(error))
    report["cases"].append(entry)
(base / "python.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))
sys.exit(int(any(case["status"] != "passed" for case in report["cases"])))
