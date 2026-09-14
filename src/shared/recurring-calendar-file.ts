import type { Interpretation } from "./interpret-date.js";
import { interpretRecurrence } from "./interpret-recurrence.js";
import { prepareCalendarFile, type CalendarFile } from "./calendar-file.js";
import { Temporal } from "@js-temporal/polyfill";
import { timezoneDatabase } from "./date-engine/timezone-database.js";
import { calculateDate } from "./date-parser.js";
import {
  recurrenceClockConflict,
  recurrenceIntervalConflict,
} from "./recurrence-clock-conflicts.js";
import { calendarTimezoneOngoing } from "./calendar-timezone-ongoing.js";
import { retainOccurrenceDecisions } from "./clarify-numeric-date.js";

type ExportPlan = NonNullable<ReturnType<typeof interpretRecurrence>> & {
  exportRule?: string;
  exclusions?: string[];
  exportTimezone?: string;
  exportDurationSeconds?: number;
};

function fixedFuture(timezone: string, from: number): boolean {
  const zone = timezoneDatabase(timezone);
  // Require an explicit fixed POSIX footer, not a guess from recent observations.
  if (!/^(?:<[A-Za-z0-9+-]{3,}>|[A-Za-z]{3,})[+-]?\d{1,3}(?::[0-5]\d){0,2}$/.test(zone.footer))
    return false;
  const last = Date.parse("9999-12-31T23:59:59Z") / 1000;
  for (let start = from + 0.001; start < last; start += 10 * 365 * 86400) {
    if (zone.transitionInstants(start, Math.min(last, start + 10 * 365 * 86400)).length)
      return false;
  }
  return true;
}

const utcDate = (iso: string) => {
  const text = iso.replace(/[-:]/g, "").replace(/\.000Z$/, "Z");
  if (!/^\d{8}T\d{6}Z$/.test(text))
    throw new Error("Calendar dates require four-digit years and whole seconds.");
  return text;
};

/** Resolve every bounded occurrence, or a fixed-offset rule without an invented end date. */
export function resolveRecurringExport(
  interpretation: Interpretation,
  reference: string,
  decisions: string[] = [],
): ExportPlan | null {
  if (interpretation.status !== "resolved" || interpretation.value.kind !== "recurrence")
    return null;
  const value = interpretation.value;
  const inherited = (value.rule.clockOverrides ?? []).map(
    (choice) => `recurrence:${choice.date}:${choice.endpoint}:${choice.instant}`,
  );
  const parseOptions = {
    timezone: value.timezone,
    reference,
    policyDecisions: [
      `boundary:starting:date:${value.rule.starting}`,
      ...(value.rule.until ? [`boundary:until:date:${value.rule.until}`] : []),
      ...(value.rule.frequency === "monthly" ? [`monthly:${value.rule.shortMonth}`] : []),
      ...(value.rule.countExclusions ? [`count:exclusions:${value.rule.countExclusions}`] : []),
      ...(value.rule.countPast ? [`count:past:${value.rule.countPast}`] : []),
    ],
    clockDecisions: [
      ...decisions,
      ...decisions.reduce((history, next) => retainOccurrenceDecisions(history, next), inherited),
    ],
  };
  // The resolved interpretation already identifies a bounded schedule. Validate
  // and enumerate it in one complete pass instead of calculating a preview first.
  if (value.rule.until || value.rule.count)
    return interpretRecurrence(interpretation.source.text, { ...parseOptions, complete: true });
  const plan = interpretRecurrence(interpretation.source.text, parseOptions);
  if (!plan?.ok) return plan;
  if (plan.rule.until || plan.rule.count)
    return interpretRecurrence(interpretation.source.text, { ...parseOptions, complete: true });
  if (!plan.occurrences.length) return plan;
  try {
    const first = plan.occurrences[0].start;
    if (plan.rule.frequency === "monthly") {
      const conflict = recurrenceClockConflict({
        timezone: value.timezone,
        reference: first.result.iso,
        monthly: plan.rule,
        clock: plan.rule.startClock,
        exceptions: plan.rule.exceptions,
      });
      if (conflict || plan.rule.clockOverrides?.length)
        throw new Error(
          "A monthly occurrence reaches a skipped or repeated clock. Ongoing export needs a future clock-choice policy; your schedule has not been shortened.",
        );
      const end = plan.occurrences[0].end;
      let durationSeconds: number | undefined;
      if (end) {
        const durationMilliseconds = end.result.timestamp - first.result.timestamp;
        const dayShift = Temporal.PlainDate.from(end.result.local.slice(0, 10)).since(
          Temporal.PlainDate.from(first.result.local.slice(0, 10)),
        ).days;
        const endConflict = recurrenceClockConflict({
          timezone: value.timezone,
          reference: end.result.iso,
          monthly: plan.rule,
          dayShift,
          clock: end.result.local.slice(11),
          exceptions: plan.rule.exceptions,
        });
        const change = recurrenceIntervalConflict({
          timezone: value.timezone,
          reference: first.result.iso,
          monthly: plan.rule,
          clock: plan.rule.startClock,
          exceptions: plan.rule.exceptions,
          durationMilliseconds,
        });
        if (endConflict || change)
          throw new Error(
            "A future monthly occurrence ends at an ambiguous clock or spans an offset change. This interval needs a validated clock-change policy before ongoing export.",
          );
        durationSeconds = durationMilliseconds / 1000;
        if (!Number.isSafeInteger(durationSeconds))
          throw new Error("Calendar export requires whole-second duration.");
      }
      const day = plan.rule.dayOfMonth;
      if (plan.rule.shortMonth === "last-day" && day > 28 && day < 31)
        throw new Error(
          "Ongoing export for this short-month policy has not passed independent recurrence validation. Your schedule has not been shortened.",
        );
      const monthDays = plan.rule.shortMonth === "last-day" && day === 31 ? "-1" : String(day);
      return {
        ...plan,
        exportRule: `FREQ=MONTHLY;BYMONTHDAY=${monthDays}`,
        ...(durationSeconds !== undefined ? { exportDurationSeconds: durationSeconds } : {}),
        exclusions: plan.rule.exceptions
          .filter((date) => date >= first.result.local.slice(0, 10))
          .map((date) => utcDate(`${date}T${first.result.local.slice(11)}Z`).slice(0, -1)),
        exportTimezone: calendarTimezoneOngoing(value.timezone, first.result.iso),
      };
    }
    if (!fixedFuture(value.timezone, first.result.timestamp / 1000)) {
      const firstDate = Temporal.PlainDate.from(first.result.local.slice(0, 10));
      const weekAnchor = firstDate.subtract({ days: firstDate.dayOfWeek - 1 });
      const conflict = recurrenceClockConflict({
        timezone: value.timezone,
        reference: first.result.iso,
        interval: plan.rule.interval,
        weekAnchor: weekAnchor.toString(),
        weekdays: plan.rule.weekdays,
        clock: plan.rule.startClock,
        exceptions: plan.rule.exceptions,
      });
      if (conflict)
        throw new Error(
          `A future occurrence reaches ${conflict.local.replace("T", " at ")}, a skipped or repeated clock. Export needs a policy for future clock choices. Your schedule has not been shortened.`,
        );
      const end = plan.occurrences[0].end;
      let durationSeconds: number | undefined;
      if (end) {
        const durationMilliseconds = end.result.timestamp - first.result.timestamp;
        const shift = Temporal.PlainDate.from(end.result.local.slice(0, 10)).since(
          Temporal.PlainDate.from(first.result.local.slice(0, 10)),
        ).days;
        const endConflict = recurrenceClockConflict({
          timezone: value.timezone,
          reference: end.result.iso,
          interval: plan.rule.interval,
          weekAnchor: weekAnchor.add({ days: shift }).toString(),
          weekdays: plan.rule.weekdays.map((day) => ((day - 1 + shift) % 7) + 1),
          clock: end.result.local.slice(11),
          exceptions: plan.rule.exceptions.map((date) =>
            Temporal.PlainDate.from(date).add({ days: shift }).toString(),
          ),
        });
        const change = recurrenceIntervalConflict({
          timezone: value.timezone,
          reference: first.result.iso,
          interval: plan.rule.interval,
          weekAnchor: weekAnchor.toString(),
          weekdays: plan.rule.weekdays,
          clock: plan.rule.startClock,
          exceptions: plan.rule.exceptions,
          durationMilliseconds,
        });
        if (endConflict || change)
          throw new Error(
            "A future occurrence ends at an ambiguous clock or spans an offset change. This interval needs a validated clock-change policy before ongoing export.",
          );
        durationSeconds = durationMilliseconds / 1000;
        if (!Number.isSafeInteger(durationSeconds))
          throw new Error("Calendar export requires whole-second duration.");
      }
      {
        const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
        const exclusions = plan.rule.exceptions
          .filter((date) => date >= first.result.local.slice(0, 10))
          .map((date) => utcDate(`${date}T${first.result.local.slice(11)}Z`).slice(0, -1));
        return {
          ...plan,
          exportRule: `FREQ=WEEKLY;${plan.rule.interval ? `INTERVAL=${plan.rule.interval};WKST=MO;` : ""}BYDAY=${plan.rule.weekdays.map((day) => weekdays[day - 1]).join(",")}`,
          exclusions,
          exportTimezone: calendarTimezoneOngoing(value.timezone, first.result.iso),
          ...(durationSeconds !== undefined ? { exportDurationSeconds: durationSeconds } : {}),
        };
      }
    }
    const localDate = Temporal.PlainDate.from(first.result.local.slice(0, 10));
    const writtenClock = calculateDate(`${localDate.toString()} at ${plan.rule.startClock}`, {
      timezone: "UTC",
      reference,
    });
    if (!writtenClock.ok || writtenClock.result.local.slice(11) !== first.result.local.slice(11))
      throw new Error(
        "This first clock choice changes the repeating time. Export of that unbounded override is not ready.",
      );
    const utcDay = Temporal.PlainDate.from(first.result.iso.slice(0, 10));
    const shift = utcDay.since(localDate).days;
    const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    const days = plan.rule.weekdays.map((day) => weekdays[(day - 1 + shift + 7) % 7]);
    const exclusions: string[] = [];
    for (const date of plan.rule.exceptions) {
      const local = Temporal.PlainDate.from(date);
      if (
        Temporal.PlainDate.compare(local, localDate) < 0 ||
        !plan.rule.weekdays.includes(local.dayOfWeek)
      )
        continue;
      const excluded = calculateDate(`${date} at ${plan.rule.startClock}`, {
        timezone: value.timezone,
        reference,
      });
      if (!excluded.ok) throw new Error(excluded.error.message);
      exclusions.push(utcDate(excluded.result.iso));
    }
    return {
      ...plan,
      exportRule: `FREQ=WEEKLY;${plan.rule.interval ? `INTERVAL=${plan.rule.interval};WKST=${weekdays[(shift + 7) % 7]};` : ""}BYDAY=${days.join(",")}`,
      exclusions,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "timezone",
        message:
          error instanceof Error
            ? error.message
            : "The complete recurring rule could not be prepared.",
        hint: "You can explicitly add an end date to export a finite schedule; no end date is chosen for you.",
      },
    };
  }
}

/** A finite recurrence set: one UID, explicit UTC recurrence dates and exact per-occurrence ends. */
export function prepareRecurringCalendarFile(
  interpretation: Interpretation,
  options: { reference: string; decisions?: string[]; uid: string; stamp: string; title: string },
): CalendarFile {
  return prepareRecurringCalendarReview(interpretation, options).file;
}

/** Internal app entry: review and file share one complete preflight, with no caller-supplied plan. */
export function prepareRecurringCalendarReview(
  interpretation: Interpretation,
  options: Parameters<typeof prepareRecurringCalendarFile>[1],
) {
  const plan = resolveRecurringExport(interpretation, options.reference, options.decisions);
  return { plan, file: calendarFileFromPlan(interpretation, options, plan) };
}

function calendarFileFromPlan(
  interpretation: Interpretation,
  options: Parameters<typeof prepareRecurringCalendarFile>[1],
  plan: ReturnType<typeof resolveRecurringExport>,
): CalendarFile {
  if (!plan || !plan.ok || interpretation.status !== "resolved")
    return {
      ok: false,
      code:
        interpretation.status !== "resolved"
          ? "unresolved"
          : plan && !plan.ok && plan.clockPrompt
            ? "clarification-required"
            : "export-blocked",
      reason:
        plan && !plan.ok ? plan.error.message : "No complete recurring schedule is available.",
    };
  if (!plan.occurrences.length)
    return {
      ok: false,
      code: "empty-schedule",
      reason: "No upcoming occurrences remain to export.",
    };
  const starts = new Set<string>();
  const events: string[] = [];
  for (const [index, row] of (plan.exportRule
    ? plan.occurrences.slice(0, 1)
    : plan.occurrences
  ).entries()) {
    if (starts.has(row.start.result.iso))
      return {
        ok: false,
        code: "invalid-file",
        reason:
          "Two occurrences share a start instant. They cannot be merged into one recurrence set.",
      };
    starts.add(row.start.result.iso);
    const value = row.end
      ? {
          ok: true as const,
          kind: "interval" as const,
          start: row.start,
          end: row.end,
          allDay: false,
          endExclusive: true as const,
          overnight: false,
        }
      : {
          kind: "point" as const,
          calculation: row.start,
          precision: "time" as const,
          clockSource: "explicit" as const,
        };
    const file = prepareCalendarFile(
      {
        ...interpretation,
        value,
        assumptions: [
          ...interpretation.assumptions.filter(
            (s) => s !== "Recurrence export has not been validated.",
          ),
          ...(plan.rule.countPast
            ? [
                plan.rule.countPast === "consume"
                  ? "The count includes past starts from the written start. Only future events are included in this file."
                  : "The count includes upcoming starts only; the written start still anchors the cadence.",
              ]
            : []),
          ...(plan.rule.countExclusions
            ? [
                plan.rule.countExclusions === "consume"
                  ? "Excluded dates use count slots and are not replaced."
                  : "Excluded dates are replaced to keep the requested event count.",
              ]
            : []),
          plan.exportRule
            ? plan.exportTimezone
              ? "Repeats at the written local clock using the embedded pinned timezone rules. Future timezone-law updates require a new file."
              : "Repeats without an end date using the timezone’s pinned fixed-offset future rules. No future timezone-law updates are applied to this file."
            : "Complete bounded recurrence set; dates are fixed to the timezone rules used when this file was generated.",
          ...(plan.rule.clockOverrides ?? []).map(
            (choice) => `${choice.date} ${choice.endpoint}: ${choice.label}`,
          ),
        ],
      },
      { ...options, pointMode: "instant" },
    );
    if (!file.ok) return file;
    let event = file.text.slice(
      file.text.indexOf("BEGIN:VEVENT\r\n"),
      file.text.indexOf("\r\nEND:VEVENT") + "\r\nEND:VEVENT".length,
    );
    const start = event.match(/\r\nDTSTART:([^\r]+)/)?.[1];
    if (!start)
      return { ok: false, code: "invalid-file", reason: "Missing complete occurrence start." };
    if (plan.exportTimezone)
      event = event.replace(
        `DTSTART:${start}`,
        `DTSTART;TZID=${plan.timezone}:${utcDate(row.start.result.local + "Z").slice(0, -1)}`,
      );
    if (plan.exportDurationSeconds !== undefined)
      event = event.replace(/\r\nDTEND:[^\r]+/, `\r\nDURATION:PT${plan.exportDurationSeconds}S`);
    events.push(
      index === 0
        ? event
        : event.replace(/^BEGIN:VEVENT\r\n/, `BEGIN:VEVENT\r\nRECURRENCE-ID:${start}\r\n`),
    );
  }
  // Each RDATE uses its own content line, avoiding unbounded line lengths.
  const recurrenceDates = plan.exportRule
    ? [
        `RRULE:${plan.exportRule}`,
        ...(plan.exclusions ?? []).map(
          (date) => `EXDATE${plan.exportTimezone ? `;TZID=${plan.timezone}` : ""}:${date}`,
        ),
      ].join("\r\n")
    : plan.occurrences.map((row) => `RDATE:${utcDate(row.start.result.iso)}`).join("\r\n");
  if (recurrenceDates)
    events[0] = events[0].replace(/\r\nEND:VEVENT$/, `\r\n${recurrenceDates}\r\nEND:VEVENT`);
  return {
    ok: true,
    text: [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tempus//Calendar Export//EN",
      "CALSCALE:GREGORIAN",
      ...(plan.exportTimezone ? [plan.exportTimezone.trimEnd()] : []),
      ...events,
      "END:VCALENDAR",
      "",
    ].join("\r\n"),
    eventCount: events.length,
    mimeType: "text/calendar;charset=utf-8",
  };
}
