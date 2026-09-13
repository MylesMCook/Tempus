import { sourceHashes as sharedSourceHashes } from "./provenance";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse as interpretDate } from "../src/shared/sdk";
import { appendSelection, type ClarificationSelection } from "../src/shared/clarify-numeric-date";
import { prepareCalendarFile } from "../src/shared/calendar-file";
import { prepareRecurringCalendarFile } from "../src/shared/recurring-calendar-file";

// Inspected development tasks. IDs describe intended user choices, never a search for a passing answer.
const journeys = [
  {
    id: "quantity-title-date-clock-reminder",
    editedInput: "Buy 4 apples on 11/01/2026 at 1:30am for 30 minutes",
    input: "Buy 3 apples on 11/01/2026 at 1:30am for 30 minutes",
    event: "Buy 3 apples",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"]],
    rationale:
      "Confirm the quantity as event text, choose November 1 and the second 1:30 AM, then retain the full thirty-minute interval and title in the file. Each question costs a user action; this is not automatically a usability advantage.",
  },
  {
    id: "count-exclusion-consumes-slot",
    editedInput: "Call Sam every Monday at noon for 4 occurrences except 2026-09-21",
    input: "Call Sam every Monday at noon for 3 occurrences except 2026-09-21",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["count:exclusions:consume"],
    expected: [
      ["2026-09-14T17:00:00.000Z", "2026-09-14T17:00:00.000Z"],
      ["2026-09-28T17:00:00.000Z", "2026-09-28T17:00:00.000Z"],
    ],
    rationale:
      "Explicitly spend one of three weekly count slots on the excluded September 21. The complete file has two point events, no invented duration and no replacement October event.",
  },
  {
    id: "count-exclusion-replaced",
    editedInput: "Call Sam every Monday at noon for 3 occurrences except 2026-09-28",
    input: "Call Sam every Monday at noon for 3 occurrences except 2026-09-21",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["count:exclusions:replace"],
    expected: [
      ["2026-09-14T17:00:00.000Z", "2026-09-14T17:00:00.000Z"],
      ["2026-09-28T17:00:00.000Z", "2026-09-28T17:00:00.000Z"],
      ["2026-10-05T17:00:00.000Z", "2026-10-05T17:00:00.000Z"],
    ],
    rationale:
      "Explicitly replace the excluded September 21 so the complete file still has three point events on the original weekly cadence, including October 5. Keep input, title and choice provenance.",
  },
  {
    id: "explicit-date-range-correction",
    input: "Call Sam from 11/01/2026 at 1:30am until 2026-11-02 at noon",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["interval:start:date:2026-11-01", "interval:start:2026-11-01T07:30:00Z"],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-02T18:00:00.000Z"]],
    rationale:
      "Choose November 1 and its second 1:30 AM, preserve the full written end date and exclusive endpoint, then export one complete interval. Editing invalidates both choices.",
  },
  {
    id: "omitted-month-reminder-list",
    input: "Call Sam September 30 and October 2 and 4 at noon",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["list:2:month:october", "list:year:2026", "list:0:time:0", "list:1:time:0"],
    expected: [
      ["2026-09-30T17:00:00.000Z", "2026-09-30T17:00:00.000Z"],
      ["2026-10-02T17:00:00.000Z", "2026-10-02T17:00:00.000Z"],
      ["2026-10-04T17:00:00.000Z", "2026-10-04T17:00:00.000Z"],
    ],
    rationale:
      "Choose the omitted month, then the shared year and missing times. Preserve all three dates in written order, source spans and title; edits invalidate choices and unresolved stages cannot export.",
  },
  {
    id: "missing-item-year-reminder-list",
    input: "Call Sam December 31 and January 1, 2027 at noon",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["list:0:year:2026", "list:0:time:0"],
    expected: [
      ["2026-12-31T18:00:00.000Z", "2026-12-31T18:00:00.000Z"],
      ["2027-01-01T18:00:00.000Z", "2027-01-01T18:00:00.000Z"],
    ],
    rationale:
      "Explicitly choose December’s missing year without changing January’s written year, then share noon with the first date. Preserve both points, title and source spans without adding duration; editing invalidates the answers.",
  },
  {
    id: "mixed-month-reminder-list",
    input: "Call Sam September 30 and October 2 at noon",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["list:year:2026", "list:0:time:0"],
    expected: [
      ["2026-09-30T17:00:00.000Z", "2026-09-30T17:00:00.000Z"],
      ["2026-10-02T17:00:00.000Z", "2026-10-02T17:00:00.000Z"],
    ],
    rationale:
      "Explicitly choose a shared year, then share noon with the first date. Preserve both points, title and source spans without adding duration; editing invalidates the answers.",
  },
  {
    id: "shared-year-reminder-list",
    input: "Call Sam September 14 and 16 at noon",
    event: "Call Sam",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["list:year:2026", "list:0:time:0"],
    expected: [
      ["2026-09-14T17:00:00.000Z", "2026-09-14T17:00:00.000Z"],
      ["2026-09-16T17:00:00.000Z", "2026-09-16T17:00:00.000Z"],
    ],
    rationale:
      "Explicitly choose a shared year, then share noon with the first date. Preserve both points, title and source spans without adding duration; editing invalidates the answers.",
  },
  {
    id: "spring-gap-fortnight-reminder",
    input:
      "Remind me to call Sam every other Sunday at 2:30am for half an hour starting 2026-03-08 until 2026-04-19 except 2026-04-05",
    reference: "2026-03-07T12:00:00Z",
    decisions: ["recurrence:2026-03-08:start:2026-03-08T08:30:00Z"],
    expected: [
      ["2026-03-08T08:30:00.000Z", "2026-03-08T09:00:00.000Z"],
      ["2026-03-22T07:30:00.000Z", "2026-03-22T08:00:00.000Z"],
      ["2026-04-19T07:30:00.000Z", "2026-04-19T08:00:00.000Z"],
    ],
    rationale:
      "Move only the missing March 8 clock to 3:30 AM. Keep later active Sundays at 2:30 AM, preserve the half-hour duration and fortnight anchor, and omit April 5 from the complete file.",
  },
  {
    id: "confirmed-appointment-title",
    input: "Dentist appointment 01/11/2026 at 1:30am for half an hour",
    event: "Dentist appointment",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"]],
    rationale:
      "Confirm the proposed title, choose November 1 and the second repeated start; retain the title and complete half-hour interval in the file.",
  },
  {
    id: "half-hour-clock-reminder",
    input: "call Sam 01/11/2026 at 1:30am for half an hour",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["2026-11-01", "interval:start:2026-11-01T07:30:00Z"],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"]],
    rationale:
      "Choose November 1 and its second repeated start. Half an hour is thirty elapsed minutes, retained through clarification and exact calendar output.",
  },
  {
    id: "direct-command-correction",
    input:
      "call Sam Friday at noon for 30 minutes, actually 01/11/2026 at 1:30am for 30 seconds instead",
    reference: "2026-09-12T16:00:00Z",
    decisions: [
      "correction:branch:1:2026-11-01",
      "correction:branch:1:interval:start:2026-11-01T07:30:00Z",
      "replace",
    ],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-01T07:30:30.000Z"]],
    rationale:
      "A direct command retains its event without requiring the reminder prefix. Date, repeated-clock and replacement choices must preserve the complete thirty-second interval.",
  },
  {
    id: "staged-correction-reminder",
    input:
      "Remind me to call Sam Friday at noon for 30 minutes, actually 01/11/2026 at 1:30am for 30 seconds instead",
    reference: "2026-09-12T16:00:00Z",
    decisions: [
      "correction:branch:1:2026-11-01",
      "correction:branch:1:interval:start:2026-11-01T07:30:00Z",
      "replace",
    ],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-01T07:30:30.000Z"]],
    rationale:
      "Resolve November 1 and its second repeated clock in the replacement, then explicitly replace Friday. Do not export an intermediate answer or retain Friday's thirty-minute duration.",
  },
  {
    id: "staged-alternative-reminder",
    input: "Remind me to call Sam tomorrow at noon or 01/11/2026 at 1:30am for 30 seconds",
    reference: "2026-09-12T16:00:00Z",
    decisions: [
      "alternative:branch:1:2026-11-01",
      "alternative:branch:1:interval:start:2026-11-01T07:30:00Z",
      "alternative:second",
    ],
    expected: [["2026-11-01T07:30:00.000Z", "2026-11-01T07:30:30.000Z"]],
    rationale:
      "Interpret the second branch as November 1, choose the second repeated 1:30 AM, then explicitly select that alternative. Preserve the thirty-second interval and event; no intermediate answer permits export.",
  },
  {
    id: "alternative-reminder-duration",
    input: "Remind me to call Sam tomorrow at noon for 30 minutes or Friday at 2pm for 30 seconds",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["alternative:second"],
    expected: [["2026-09-18T19:00:00.000Z", "2026-09-18T19:00:30.000Z"]],
    rationale:
      "Explicitly choose the complete second interval. Retain its thirty seconds and event text; do not combine it with the first alternative's duration.",
  },
  {
    id: "short-reminder",
    input: "Remind me to call Sam 03/04/2027 at noon for 30 seconds",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["2027-04-03"],
    expected: [["2027-04-03T17:00:00.000Z", "2027-04-03T17:00:30.000Z"]],
    rationale:
      "Choose April 3 and preserve all thirty elapsed seconds through the complete interval and file.",
  },
  {
    id: "short-recurring-reminder",
    input:
      "Remind me to call Sam every Sunday at 1:30am for 30 seconds starting 2026-11-01 until 2026-11-08",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["recurrence:2026-11-01:start:2026-11-01T07:30:00Z"],
    expected: [
      ["2026-11-01T07:30:00.000Z", "2026-11-01T07:30:30.000Z"],
      ["2026-11-08T07:30:00.000Z", "2026-11-08T07:30:30.000Z"],
    ],
    rationale:
      "Select the second repeated clock; retain thirty seconds on both bounded Sunday occurrences.",
  },
  {
    id: "all-day-reminder",
    input: "Remind me to call Sam 03/04/2027",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["2027-04-03"],
    expected: [["2027-04-03T05:00:00.000Z", "2027-04-03T05:00:00.000Z"]],
    calendarDates: [["2027-04-03", "2027-04-04"]],
    rationale:
      "Choose April 3. Export a civil all-day date with an implicit exclusive next-day end, not a midnight instant.",
  },
  {
    id: "midnight-reminder",
    input: "Remind me to call Sam 03/04/2027 at midnight",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["2027-04-03"],
    expected: [["2027-04-03T05:00:00.000Z", "2027-04-03T05:00:00.000Z"]],
    rationale:
      "Choose April 3 at midnight CDT. Keep the exact 05:00Z instant without inventing a duration; do not turn it into an all-day date.",
  },
  {
    id: "fortnightly-reminder",
    input:
      "Remind me to call Sam every other Sunday at 1:30am for 30 minutes starting 2026-10-18 until 2026-11-29 except 2026-11-15",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["recurrence:2026-11-01:start:2026-11-01T07:30:00Z"],
    expected: [
      ["2026-10-18T06:30:00.000Z", "2026-10-18T07:00:00.000Z"],
      ["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"],
      ["2026-11-29T07:30:00.000Z", "2026-11-29T08:00:00.000Z"],
    ],
    rationale:
      "Retain alternate Sundays anchored October 18; choose the second repeated clock on November 1, omit November 15, and retain November 29.",
  },
  {
    id: "group-clock-reminder",
    input: "Remind me to call Sam Sun 1:15am-1:45am Mon 9am-10am",
    reference: "2026-10-31T12:00:00Z",
    decisions: ["group:0:start:2026-11-01T07:15:00Z", "group:0:end:2026-11-01T07:45:00Z"],
    expected: [
      ["2026-11-01T07:15:00.000Z", "2026-11-01T07:45:00.000Z"],
      ["2026-11-02T15:00:00.000Z", "2026-11-02T16:00:00.000Z"],
    ],
    rationale:
      "Choose the second repeated start and end for Sunday; retain Monday's complete interval and the reminder text.",
  },
  {
    id: "arithmetic-clock-reminder",
    input: "Remind me to call Sam October 31, 2026 at 1:30am plus 1 day plus 2 hours",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["arithmetic:1:2026-11-01T01:30:00:2026-11-01T07:30:00Z"],
    expected: [["2026-11-01T09:30:00.000Z", "2026-11-01T09:30:00.000Z"]],
    rationale:
      "Select the second 1:30 AM, then add two elapsed hours. Export a point without inventing an event duration.",
  },
  {
    id: "numeric-reminder-duration",
    input: "Remind me to call Sam 03/04/2027 at noon for 30 minutes",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["2027-04-03"],
    expected: [["2027-04-03T17:00:00.000Z", "2027-04-03T17:30:00.000Z"]],
    rationale: "April 3 noon CDT is 17:00Z; thirty elapsed minutes end at 17:30Z.",
  },
  {
    id: "replace-reminder-range",
    input: "Remind me to call Sam Friday 9am-11am, actually Saturday 1pm-2pm instead",
    reference: "2026-09-12T16:00:00Z",
    decisions: ["replace"],
    expected: [["2026-09-12T18:00:00.000Z", "2026-09-12T19:00:00.000Z"]],
    rationale:
      "Saturday includes today because 1 PM is still ahead; replace the Friday range entirely.",
  },
  {
    id: "repeated-recurring-reminder",
    input:
      "Remind me to call Sam every Sunday from 1:30am to 3am until 2026-11-15 except 2026-11-08",
    reference: "2026-10-31T12:00:00Z",
    decisions: ["recurrence:2026-11-01:start:2026-11-01T07:30:00Z"],
    expected: [
      ["2026-11-01T07:30:00.000Z", "2026-11-01T09:00:00.000Z"],
      ["2026-11-15T07:30:00.000Z", "2026-11-15T09:00:00.000Z"],
    ],
    rationale: "Choose the second 1:30 AM CST; retain both complete ranges and exclude November 8.",
  },
];

it("records complete scripted correction-to-file tasks without claiming user completion", async () => {
  const records = [];
  await mkdir("comparison/results/journey-files", { recursive: true });
  for (const journey of journeys) {
    const title = journey.event ?? "call Sam";
    const context = { timezone: "America/Chicago", reference: journey.reference };
    let selection: ClarificationSelection | undefined;
    const steps: unknown[] = [];
    let failure: string | undefined;
    try {
      let result = interpretDate(journey.input, context);
      steps.push({ action: "input", result });
      for (const id of journey.decisions) {
        if (result.status !== "needs-clarification" || !result.clarification)
          throw new Error("Expected a selectable question before accepting a result.");
        expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
        expect(
          prepareCalendarFile(result, {
            uid: "11111111-2222-4333-8444-555555555555",
            stamp: journey.reference,
            title,
          }).ok,
        ).toBe(false);
        selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
        result = interpretDate(journey.input, { ...context, selection });
        steps.push({ action: "choice", id, result });
      }
      if (result.status !== "resolved")
        throw new Error("Choices did not finish the interpretation.");
      expect(result.input).toBe(journey.input);
      expect(result.event?.text).toBe(title);
      expect(journey.input.slice(result.source.span.start, result.source.span.end)).toBe(
        result.source.text,
      );
      const value = result.value;
      const rows =
        value.kind === "interval"
          ? [[value.start.result.iso, value.end.result.iso]]
          : value.kind === "recurrence" || value.kind === "collection"
            ? value.occurrences.map((row) => [
                row.start.result.iso,
                row.end?.result.iso ?? row.start.result.iso,
              ])
            : value.kind === "point"
              ? [[value.calculation.result.iso, value.calculation.result.iso]]
              : [];
      expect(rows).toEqual(journey.expected);
      if (value.kind === "collection") {
        for (const row of value.occurrences)
          expect(journey.input.slice(row.source.span.start, row.source.span.end)).toBe(
            row.source.text,
          );
      }
      const metadata = {
        uid: "11111111-2222-4333-8444-555555555555",
        stamp: journey.reference,
        reference: journey.reference,
        title: result.event!.text,
        pointMode:
          value.kind === "point" && value.precision === "date"
            ? ("date" as const)
            : ("instant" as const),
      };
      const file =
        value.kind === "recurrence"
          ? prepareRecurringCalendarFile(result, metadata)
          : prepareCalendarFile(result, metadata);
      if (!file.ok) throw new Error(file.reason);
      await writeFile(`comparison/results/journey-files/${journey.id}.ics`, file.text);
      expect(file.eventCount).toBe(journey.expected.length);
      const calendar = new ICAL.Component(ICAL.parse(file.text));
      const components = calendar.getAllSubcomponents("vevent");
      expect(components).toHaveLength(journey.expected.length);
      expect(
        new Set(components.map((component) => component.getFirstPropertyValue("uid"))).size,
      ).toBe(value.kind === "collection" ? journey.expected.length : 1);
      if (value.kind === "collection") {
        value.occurrences.forEach((row, index) => {
          if (!row.end && !row.allDay) {
            expect(components[index].hasProperty("dtend")).toBe(false);
            expect(components[index].hasProperty("duration")).toBe(false);
          }
        });
      }
      // Readers expose point ends as their start; separately verify that the file adds no duration.
      const exported: string[][] = [];
      const expectedFile = journey.calendarDates ?? journey.expected;
      const masters = value.kind === "collection" ? components : components.slice(0, 1);
      for (const component of masters) {
        const event = new ICAL.Event(component);
        expect(event.summary).toBe(title);
        const iterator = event.iterator();
        for (let next = iterator.next(); next; next = iterator.next()) {
          if (exported.length >= 1000) throw new Error("Unexpected unbounded file.");
          const row = event.getOccurrenceDetails(next);
          expect(row.startDate.isDate).toBe(Boolean(journey.calendarDates));
          expect(row.endDate.isDate).toBe(Boolean(journey.calendarDates));
          exported.push(
            [row.startDate, row.endDate].map((date) =>
              date.isDate ? date.toString() : date.toJSDate().toISOString(),
            ),
          );
        }
      }
      expect(exported).toEqual(expectedFile);
      steps.push({
        action: "file-validation",
        exported,
        fileSha256: createHash("sha256").update(file.text).digest("hex"),
      });
      const editedInput = journey.editedInput ?? journey.input + " ";
      const edited = interpretDate(editedInput, { ...context, selection });
      steps.push({ action: "edit", result: edited });
      expect(edited.status).toBe("needs-clarification");
      if (journey.editedInput) {
        expect(edited).toEqual(interpretDate(editedInput, context));
        expect(prepareCalendarFile(edited, metadata).ok).toBe(false);
        expect(prepareRecurringCalendarFile(edited, metadata).ok).toBe(false);
      }
    } catch (error) {
      failure = String(error);
    }
    records.push({ ...journey, context, steps, status: failure ? "failed" : "passed", failure });
  }
  const sourceHashes = await sharedSourceHashes(["comparison/journeys.test.ts"]);
  const limitations = [
    "Inspected development tasks with scripted decisions; not an independent holdout or human task-completion study.",
    "Tempus-only integration replay; no gpu-time interaction adapter or comparative completion claim.",
    "Source parser and independent file reader only; no browser download, calendar-client import or external write.",
  ];
  await mkdir("comparison/results", { recursive: true });
  await writeFile(
    "comparison/results/journeys.json",
    JSON.stringify(
      {
        corpus: "correction-journeys-development-v2-count-quantity",
        node: process.version,
        sourceHashes,
        limitations,
        records,
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    "comparison/results/journeys.md",
    [
      "# Scripted correction journeys",
      "",
      ...limitations.map((line) => `- ${line}`),
      "",
      "| Task | Declared choices | Result |",
      "| --- | ---: | --- |",
      ...records.map((row) => `| ${row.id} | ${row.decisions.length} | ${row.status} |`),
      "",
      "Full inputs, declared answers, intermediate results and failures are in journeys.json.",
      "",
    ].join("\n"),
  );
  expect(
    records.filter((row) => row.status === "failed").map(({ id, failure }) => ({ id, failure })),
  ).toEqual([]);
});
