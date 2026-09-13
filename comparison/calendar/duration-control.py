# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
"""Independent exact-duration control; no calendar imports."""
import hashlib
import json
import sys
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path
import icalendar
import recurring_ical_events

folder = Path(sys.argv[1])
source = json.loads((folder / "ical-js.json").read_text())
expected = [["2026-03-01T07:00:00.000Z", "2026-03-01T09:00:00.000Z"], ["2026-03-08T07:00:00.000Z", "2026-03-08T09:00:00.000Z"], ["2026-03-15T06:00:00.000Z", "2026-03-15T08:00:00.000Z"]]
reports = []
assert {row["name"] for row in source["reports"]} == {"historical", "with-prodid"}
for row in source["reports"]:
    raw = (folder / (row["name"] + ".ics")).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == row["sha256"]
    assert row["expected"] == expected
    calendar = icalendar.Calendar.from_ical(raw)
    events = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2027, 1, 1, tzinfo=timezone.utc))
    observed = [[event.decoded(field).astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") for field in ["dtstart", "dtend"]] for event in events]
    reports.append({"name": row["name"], "sha256": row["sha256"], "expected": expected, "observed": observed, "conforms": observed == expected})
print(json.dumps({"readers": {name: version(name) for name in ["icalendar", "recurring-ical-events"]}, "reports": reports, "scope": "Authored exact-duration control, not exporter or calendar-client verification"}, indent=2))
sys.exit(0 if all(row["conforms"] for row in reports) else 1)
