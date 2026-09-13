import { parse } from "@tempus-date/core";
import { prepareCalendarFile } from "@tempus-date/core/calendar";

const result = parse("tomorrow", {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
});
const file = prepareCalendarFile(result, {
  uid: "11111111-2222-4333-8444-555555555555", // New UUID for each real export.
  stamp: "2026-09-12T16:00:00Z", // Host-supplied creation instant.
  title: "Appointment",
  pointMode: "date",
});
if (file.ok) console.log(file.text); // Example only; this writes no calendar.
