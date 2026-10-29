import { useMemo, useState } from "react";
import { CalendarPlus, Download } from "lucide-react";
import { flushSync } from "react-dom";
import { Disclosure } from "@/components/disclosure";
import { OrganicShimmer } from "@/components/organic-shimmer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appendSelection, type ParseResult } from "@/shared/sdk";
import { prepareCalendar } from "@/shared/sdk-calendar";
import { useRecurrenceDecisions } from "../context/recurrence-decisions-context";
import { useCalendarPreparation } from "../use-calendar-preparation";
import { safeFormatDate } from "../options";
import { scheduleQuantity } from "../schedule-labels";

/** Remount for every input, context or interpretation change. */
export function CalendarExport({
  interpretation,
  reference,
}: {
  interpretation: ParseResult;
  reference: string;
}) {
  const [title, setTitle] = useState(
    interpretation.status === "resolved"
      ? (interpretation.event?.text ?? interpretation.source.text)
      : "",
  );
  const [feedback, setFeedback] = useState("");
  const [length, setLength] = useState<"start" | 15 | 30 | 60>();
  const { selection, setSelection } = useRecurrenceDecisions();
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(
    () =>
      open &&
      !paused &&
      interpretation.status === "resolved" &&
      interpretation.value.kind === "recurrence"
        ? { interpretation, reference, selection, title, attempt }
        : undefined,
    [open, paused, interpretation, reference, selection, title, attempt],
  );
  const preparation = useCalendarPreparation(request);
  const plan = preparation?.ok ? preparation.result : undefined;
  const prompt = plan?.status === "needs-clarification" ? plan.clarification : undefined;
  const preparedFile = plan?.status === "ready" ? plan.file : undefined;
  const [page, setPage] = useState(0);
  if (interpretation.status !== "resolved") return null;
  const value = interpretation.value;

  const pointMode: "date" | "instant" | undefined =
    value.kind === "point" ? (value.precision === "date" ? "date" : "instant") : undefined;
  const description =
    value.kind === "recurrence"
      ? `${value.rule.countPast === "consume" && value.rule.count ? `${scheduleQuantity(value.rule.count, "scheduled date")} from the written start${value.rule.countExclusions === "consume" ? ", before exclusions" : ""}. Only future events are included.` : value.rule.count ? `${value.rule.countExclusions === "consume" ? `${scheduleQuantity(value.rule.count, "scheduled date")} before exclusions` : `${scheduleQuantity(value.rule.count, "occurrence")} in total`}.` : value.rule.until ? `Every upcoming occurrence through ${value.rule.until}.` : "Repeats with no end date."}${!value.rule.duration && !value.rule.endClock ? " No length set; your calendar may pick one." : ""}`
      : value.kind === "collection"
        ? `${scheduleQuantity(value.occurrences.length, "separate event")}, in listed order.${value.occurrences.some((row) => row.allDay) ? " Dates without times are all-day." : ""}${value.occurrences.some((row) => !row.allDay && !row.end) ? " Timed dates have no length; your calendar may pick one." : ""}`
        : undefined;
  const events =
    value.kind === "point"
      ? [{ start: value.calculation, end: undefined, allDay: pointMode === "date" }]
      : value.kind === "interval"
        ? [value]
        : (value.kind === "recurrence"
            ? plan?.status === "ready"
              ? (plan.schedule?.occurrences ?? [])
              : []
            : value.occurrences
          ).map((event) => ({ ...event, allDay: "allDay" in event && event.allDay }));
  const pageSize = 10;
  const pageStart = page * pageSize;
  const titleField = (
    <div className="grid gap-1.5">
      <label htmlFor="calendar-title" className="text-sm font-medium">
        Event title
      </label>
      <Input
        id="calendar-title"
        value={title}
        maxLength={2000}
        onChange={(event) => {
          setTitle(event.target.value);
          setFeedback("");
        }}
      />
    </div>
  );
  const body = (
    <>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {value.kind === "recurrence" ? (
        <div id="calendar-export-status" tabIndex={-1} role="status" className="grid gap-2 text-sm">
          {paused
            ? "Preparation cancelled."
            : preparation && !preparation.ok
              ? preparation.error
              : plan?.status === "ready"
                ? plan.ongoing
                  ? `Keeps repeating. Next ${scheduleQuantity(events.length, "date")} below.`
                  : `${scheduleQuantity(events.length, "event")} in the file.`
                : plan?.status === "blocked"
                  ? plan.reason
                  : prompt
                    ? prompt.question
                    : "Checking the schedule…"}
          {!paused &&
          !(preparation && !preparation.ok) &&
          plan?.status !== "ready" &&
          plan?.status !== "blocked" &&
          !prompt ? (
            <OrganicShimmer width="100%" height={36} radius={8} className="t-shimmer-bar" />
          ) : null}
          {paused || (preparation && !preparation.ok) ? (
            <Button
              variant="outline"
              onClick={() => {
                setPaused(false);
                setAttempt(attempt + 1);
              }}
            >
              Try preparing again
            </Button>
          ) : !preparation ? (
            <Button variant="outline" onClick={() => setPaused(true)}>
              Cancel preparation
            </Button>
          ) : null}
          {plan?.status === "blocked" ? <p>{plan.hint}</p> : null}
          {plan?.status === "blocked" ? (
            <Button
              variant="outline"
              onClick={() => {
                const input = document.getElementById("date-expression");
                if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
                  input.focus();
                  input.setSelectionRange(input.value.length, input.value.length);
                }
              }}
            >
              Edit schedule
            </Button>
          ) : null}
          {prompt ? (
            <div className="grid gap-2" role="group" aria-label={prompt.question}>
              <p>{prompt.question}</p>
              {prompt.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="h-auto min-h-12 whitespace-normal"
                  onClick={() => {
                    const next = appendSelection(selection, {
                      contextKey: prompt.contextKey,
                      id: choice.id,
                    });
                    flushSync(() => {
                      setSelection(next);
                      setFeedback("");
                      setPage(0);
                    });
                    document.getElementById("calendar-export-status")?.focus();
                  }}
                >
                  {choice.label}
                </Button>
              ))}
            </div>
          ) : null}
          {selection ? (
            <Button
              variant="link"
              onClick={() => {
                flushSync(() => {
                  setSelection(undefined);
                  setPaused(false);
                  setFeedback("");
                  setPage(0);
                });
                document.getElementById("calendar-export-status")?.focus();
              }}
            >
              Restart export choices
            </Button>
          ) : null}
        </div>
      ) : null}
      {events.length > pageSize ? (
        <nav aria-label="Review file events" className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous events
          </Button>
          <p role="status" className="text-sm">
            Events {pageStart + 1}–{Math.min(pageStart + pageSize, events.length)} of{" "}
            {events.length}
          </p>
          <Button
            variant="outline"
            disabled={pageStart + pageSize >= events.length}
            onClick={() => setPage(page + 1)}
          >
            Next events
          </Button>
        </nav>
      ) : null}
      <ol
        start={pageStart + 1}
        aria-label={
          plan?.status === "ready" && plan.ongoing
            ? `Next occurrence${events.length === 1 ? "" : "s"} of the repeating rule`
            : `Event${events.length === 1 ? "" : "s"} in this file`
        }
        className="grid gap-3 text-sm"
      >
        {events.slice(pageStart, pageStart + pageSize).map((event, index) => (
          <li
            key={pageStart + index}
            className="grid min-w-0 gap-1 border-b pb-4 last:border-0 last:pb-0"
          >
            {events.length > 1 ? (
              <p className="font-medium">Event {pageStart + index + 1}</p>
            ) : null}
            {(
              [
                ["Start", event.start],
                ["End · not included", event.end],
              ] as const
            ).map(([label, date]) =>
              date ? (
                <p key={label} className="break-words text-base font-medium leading-relaxed">
                  <span className="block text-xs font-normal text-muted-foreground">{label}: </span>
                  {safeFormatDate(
                    new Date(date.result.timestamp),
                    date.timezone,
                    event.allDay
                      ? "EEEE, MMMM d, yyyy"
                      : date.result.timestamp % 60000 === 0
                        ? "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
                        : date.result.timestamp % 1000 === 0
                          ? "EEEE, MMMM d, yyyy 'at' h:mm:ss a zzz"
                          : "EEEE, MMMM d, yyyy 'at' h:mm:ss.SSS a zzz",
                  ) ?? date.result.local}
                  {!event.allDay ? ` (UTC${date.result.offset})` : ""}
                </p>
              ) : null,
            )}
            <p className="break-words text-muted-foreground">
              {event.allDay ? "All day · " : ""}
              {event.start.timezone}
            </p>
          </li>
        ))}
      </ol>
      {pointMode === "instant" ? (
        <fieldset className="grid min-w-0 gap-2">
          <legend className="mb-2 text-sm font-medium">How long is this event?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["start", "Start time only"],
                [15, "15 minutes"],
                [30, "30 minutes"],
                [60, "1 hour"],
              ] as const
            ).map(([choice, label]) => (
              <label
                key={choice}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm has-[:checked]:border-primary has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
              >
                <input
                  type="radio"
                  className="accent-primary"
                  name="calendar-length"
                  value={choice}
                  checked={length === choice}
                  onChange={() => {
                    setLength(choice);
                    setFeedback("");
                  }}
                />
                {label}
              </label>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {length === "start"
              ? "No end time. Your calendar may pick its own length."
              : "Need another length? Add it to your phrase, like “for 45 minutes”."}
          </p>
        </fieldset>
      ) : null}
      <div className="grid gap-2">
        <Button
          className="min-h-12 w-full sm:w-fit"
          disabled={
            !title.trim() ||
            (value.kind === "recurrence" && !preparedFile?.ok) ||
            (pointMode === "instant" && length === undefined)
          }
          onClick={() => {
            try {
              const metadata = {
                title,
                pointMode,
                ...(typeof length === "number" ? { pointLengthMinutes: length } : {}),
                uid: crypto.randomUUID(),
                stamp: new Date().toISOString(),
              };
              const prepared =
                value.kind === "recurrence"
                  ? undefined
                  : prepareCalendar(interpretation, { file: metadata });
              const file =
                value.kind === "recurrence"
                  ? preparedFile
                  : prepared?.status === "ready"
                    ? prepared.file
                    : undefined;
              if (!file) return;
              if (!file.ok) {
                setFeedback(file.reason);
                return;
              }
              const link = document.createElement("a");
              const url = URL.createObjectURL(new Blob([file.text], { type: file.mimeType }));
              try {
                link.href = url;
                link.download = "tempus-events.ics";
                document.body.append(link);
                link.click();
              } finally {
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }
              setFeedback("Download started. Open the file to add it to your calendar.");
            } catch {
              setFeedback("Download failed. Try again.");
            }
          }}
        >
          <Download aria-hidden="true" data-icon="inline-start" />
          Download calendar file
        </Button>
        <p className="text-sm text-muted-foreground">
          {pointMode === "instant" && length === undefined ? "Choose a length first. " : ""}
          An .ics file. No alert or reminder is set.
        </p>
        <p role="status" className="text-sm">
          {feedback || (preparedFile && !preparedFile.ok ? preparedFile.reason : "")}
        </p>
      </div>
    </>
  );
  if (!interpretation.event)
    return (
      <Disclosure
        className="mt-3 border-t"
        onToggle={(event) => {
          setOpen(event.currentTarget.open);
        }}
      >
        <summary
          id="calendar-export-toggle"
          className="cursor-pointer py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2"
        >
          Download as calendar file
        </summary>
        <div className="grid min-w-0 gap-6 pb-4 pt-2">
          {titleField}
          {body}
        </div>
      </Disclosure>
    );
  // A recognized event leads with this action; callers place it before their copy button.
  const toggle = (next: boolean) => {
    flushSync(() => setOpen(next));
    document.getElementById(next ? "calendar-panel-heading" : "calendar-export-toggle")?.focus();
  };
  return (
    <>
      <Button
        id="calendar-export-toggle"
        aria-expanded={open}
        aria-controls="calendar-panel"
        className="h-12 w-full transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100 sm:w-auto sm:min-w-40"
        onClick={() => toggle(!open)}
      >
        <CalendarPlus aria-hidden="true" />
        Add to calendar
      </Button>
      {open ? (
        <section
          id="calendar-panel"
          aria-labelledby="calendar-panel-heading"
          className="t-answer-swap order-last grid min-w-0 basis-full gap-6 rounded-lg border p-4 ring-4 ring-primary/10"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              id="calendar-panel-heading"
              tabIndex={-1}
              className="text-base font-semibold focus-visible:outline-none"
            >
              Add to calendar
            </h3>
            <Button variant="ghost" size="sm" onClick={() => toggle(false)}>
              Close
            </Button>
          </div>
          {titleField}
          {body}
        </section>
      ) : null}
    </>
  );
}
