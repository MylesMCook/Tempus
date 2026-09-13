# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
"""Independently read fixed verification-worker output; no calendar writes."""
import hashlib
import json
import sys
from datetime import date, datetime, timezone
from importlib.metadata import version
from pathlib import Path
import icalendar
import recurring_ical_events

result = json.loads(Path(sys.argv[1]).read_text())
assert result["status"] == "passed"
assert set(result["failures"]) == {"unresolved", "recurrence-required", "point-mode-required", "export-blocked", "invalid-file", "clarification-required", "empty-schedule"}
assert result["metadataRecovery"] and result["staleAnswerRejected"]
assert set(result["files"]) == {"recurring", "shorthand", "monthly"}
days = ["2026-09-13", "2026-09-20", "2026-09-27", "2026-10-04", "2026-10-11", "2026-10-18", "2026-10-25", "2026-11-01", "2026-11-08"]
expected = {
    "recurring": [[f"{day}T{'06' if i < 7 else '07'}:30:00.000Z", f"{day}T{'07' if i < 7 else '08'}:00:00.000Z"] for i, day in enumerate(days)],
    "shorthand": [[f"{day}T17:00:00.000Z"] for day in ["2026-09-30", "2026-10-02", "2026-10-04"]],
    "monthly": [[f"2026-{day}T{hour}:00:00.000Z", f"2026-{day}T{hour}:30:00.000Z"] for day, hour in [("01-30", "15"), ("02-28", "15"), ("04-30", "14"), ("05-30", "14")]],
}
count_dates = {'weekly': ['2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12'], 'monthly': ['2026-09-30', '2026-10-31', '2026-11-30'], 'past-consume': ['2026-09-14', '2026-09-21'], 'past-upcoming': ['2026-09-14', '2026-09-21', '2026-09-28'], 'excluded-consume': ['2026-09-14', '2026-09-28'], 'excluded-replace': ['2026-09-14', '2026-09-28', '2026-10-05']}
report = []
assert result.get("diagnosticVersion", 1) in (1, 2, 3)
if result.get("diagnosticVersion", 1) >= 2:
    text = result["quantityFile"]
    events = icalendar.Calendar.from_ical(text).walk("VEVENT")
    assert len(events) == 1
    event = events[0]
    assert str(event["SUMMARY"]) == "Buy 3 apples"
    assert "RRULE" not in event and "DURATION" not in event
    rows = [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]]
    assert rows == ["2026-11-01T07:30:00+00:00", "2026-11-01T08:00:00+00:00"]
    report.append({"name": "quantity", "sha256": hashlib.sha256(text.encode()).hexdigest(), "observed": rows, "status": "passed"})
if result.get("diagnosticVersion") == 3:
    assert set(result["reminderFiles"]) == {"recipient-clock", "recipient-dst"}
    for name, text in result["reminderFiles"].items():
        events = icalendar.Calendar.from_ical(text).walk("VEVENT")
        assert len(events) == 1
        event = events[0]
        assert str(event["SUMMARY"]) == "Buy apples for Sam"
        assert all(field not in event for field in ["DTEND", "DURATION", "RRULE"])
        observed = event.decoded("DTSTART").astimezone(timezone.utc).isoformat()
        assert observed == ("2026-09-13T17:00:00+00:00" if name == "recipient-clock" else "2026-11-01T07:30:00+00:00")
        report.append({"name": name, "sha256": hashlib.sha256(text.encode()).hexdigest(), "observed": observed, "status": "passed"})
for name, text in result["files"].items():
    calendar = icalendar.Calendar.from_ical(text)
    if name == "shorthand":
        events = calendar.walk("VEVENT")
        assert all("DTEND" not in event and "DURATION" not in event for event in events)
        fields = ["dtstart"]
    else:
        events = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2027, 1, 1, tzinfo=timezone.utc))
        fields = ["dtstart", "dtend"]
    rows = [[event.decoded(field).astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") for field in fields] for event in events]
    assert rows == expected[name], f"Unexpected {name} dates"
    assert all(str(event["SUMMARY"]) == "Call Sam" for event in events)
    report.append({"name": name, "sha256": hashlib.sha256(text.encode()).hexdigest(), "observed": rows, "status": "passed"})
assert set(result["precisionFiles"]) == {"date-point", "all-day-range"}
for name, text in result["precisionFiles"].items():
    events = icalendar.Calendar.from_ical(text).walk("VEVENT")
    assert len(events) == 1
    event = events[0]
    assert type(event.decoded("DTSTART")) is date
    assert event.decoded("DTSTART").isoformat() == ("2026-09-12" if name == "date-point" else "2026-09-13")
    if name == "all-day-range":
        assert type(event.decoded("DTEND")) is date and event.decoded("DTEND").isoformat() == "2026-09-15"
    if name == "date-point":
        assert "DTEND" not in event
    assert str(event["SUMMARY"]) == "Call Sam" and "DURATION" not in event
    report.append({"name": name, "sha256": hashlib.sha256(text.encode()).hexdigest(), "status": "passed"})
events = icalendar.Calendar.from_ical(result["rangeFile"]).walk("VEVENT")
assert len(events) == 1
event = events[0]
assert [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]] == ["2026-11-01T07:30:00+00:00", "2026-11-02T18:00:00+00:00"]
assert str(event["SUMMARY"]) == "Call Sam" and "DURATION" not in event
report.append({"name": "range", "sha256": hashlib.sha256(result["rangeFile"].encode()).hexdigest(), "status": "passed"})
assert set(result["rangePolicyFiles"]) == {"range-exclusive", "range-inclusive", "range-mixed"}
for name, text in result["rangePolicyFiles"].items():
    events = icalendar.Calendar.from_ical(text).walk("VEVENT")
    assert len(events) == 1
    event = events[0]
    assert str(event["SUMMARY"]) == "Call Sam" and "RRULE" not in event and "DURATION" not in event
    if name == "range-mixed":
        assert all(type(event.decoded(field)) is datetime for field in ["DTSTART", "DTEND"])
        observed = [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]]
        assert observed == ["2026-11-01T07:30:00+00:00", "2026-11-02T07:30:00+00:00"]
    else:
        assert all(type(event.decoded(field)) is date for field in ["DTSTART", "DTEND"])
        observed = [event.decoded(field).isoformat() for field in ["DTSTART", "DTEND"]]
        assert observed == ["2026-09-13", "2026-09-18" if name == "range-exclusive" else "2026-09-19"]
    report.append({"name": name, "sha256": hashlib.sha256(text.encode()).hexdigest(), "observed": observed, "status": "passed"})
assert set(result["countFiles"]) == set(count_dates)
for name, text in result["countFiles"].items():
    calendar = icalendar.Calendar.from_ical(text)
    assert all("RRULE" not in event and "DTEND" not in event and "DURATION" not in event for event in calendar.walk("VEVENT"))
    events = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2036, 1, 1, tzinfo=timezone.utc))
    starts = sorted(event.decoded("DTSTART").astimezone(timezone.utc).isoformat() for event in events)
    expected = [f"{day}T{'18' if day == '2026-11-30' else '17'}:00:00+00:00" for day in count_dates[name]]
    assert starts == expected
    assert all(str(event["SUMMARY"]) == "Call Sam" for event in events)
    report.append({"name": "count-" + name, "sha256": hashlib.sha256(text.encode()).hexdigest(), "observed": starts, "status": "passed"})
print(json.dumps({"readers": {name: version(name) for name in ["icalendar", "recurring-ical-events"]}, "files": report, "scope": "Fixed file readback, not calendar-client import or independent evaluation"}, indent=2))
