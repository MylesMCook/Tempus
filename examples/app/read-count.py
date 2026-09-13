# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
import hashlib
import json
import sys
from pathlib import Path
from datetime import datetime, timezone
import icalendar
import recurring_ical_events
root = Path(sys.argv[1])
source = json.loads((root / "report.json").read_text())
assert source["status"] == "passed"
assert len(source["runs"]) == 12
assert {(r["id"], r["width"]) for r in source["runs"]} == {(kind, width) for kind in ["weekly", "monthly", "consume", "replace", "past-consume", "past-upcoming"] for width in [320, 1280]}
expected = {
    "past-consume": ["2026-09-14T17:00:00+00:00", "2026-09-21T17:00:00+00:00"],
    "past-upcoming": ["2026-09-14T17:00:00+00:00", "2026-09-21T17:00:00+00:00", "2026-09-28T17:00:00+00:00"],
    "consume": ["2026-09-14T17:00:00+00:00", "2026-09-28T17:00:00+00:00"],
    "replace": ["2026-09-14T17:00:00+00:00", "2026-09-28T17:00:00+00:00", "2026-10-05T17:00:00+00:00"],
    "weekly": [f"2026-09-{day}T17:00:00+00:00" for day in [14, 21, 28]] + ["2026-10-05T17:00:00+00:00", "2026-10-12T17:00:00+00:00"],
    "monthly": ["2026-09-30T17:00:00+00:00", "2026-10-31T17:00:00+00:00", "2026-11-30T18:00:00+00:00"],
}
report = []
for run in source["runs"]:
    assert run["status"] == "passed"
    file = f"{run['id']}-{run['width']}.ics"
    raw = (root / file).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == run["sha256"]
    calendar = icalendar.Calendar.from_ical(raw)
    events = calendar.walk("VEVENT")
    assert all("RRULE" not in e and "DURATION" not in e and "DTEND" not in e for e in events)
    assert all(str(e["SUMMARY"]) == "Call Sam" for e in events)
    if run["id"] in ["consume", "replace"]:
        phrase = "Excluded dates use count slots" if run["id"] == "consume" else "Excluded dates are replaced"
        assert all(phrase in str(e["DESCRIPTION"]) for e in events)
    if run["id"].startswith("past-"):
        phrase = "count includes past starts" if run["id"] == "past-consume" else "count includes upcoming starts only"
        assert all(phrase in str(e["DESCRIPTION"]) for e in events)
    rows = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2036, 1, 1, tzinfo=timezone.utc))
    starts = sorted(e.decoded("DTSTART").astimezone(timezone.utc).isoformat() for e in rows)
    assert starts == expected[run["id"]], starts
    report.append({"file": file, "status": "passed", "starts": starts})
print(json.dumps(report, indent=2))
