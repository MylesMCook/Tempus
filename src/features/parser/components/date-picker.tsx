import { useEffect, useRef, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Disclosure } from "@/components/disclosure";
import { StatusBadge, readNum } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ClarificationSelection, ParseResult } from "@/shared/sdk";
import { RecurrenceDecisionsProvider } from "../context/recurrence-decisions-context";
import { useSettings } from "../context/settings-context";
import { dateFormatOptions, safeFormatDate, timezoneOptions, resultClockFormat } from "../options";
import { CalculationTrace } from "./calculation-trace";
import { DateExpressionTabs } from "./date-expression-tabs";
import { OccurrenceResult } from "./occurrence-result";
import { IntervalResult } from "./interval-result";
import { CalendarExport } from "./calendar-export";
import { ApiDocs } from "./api-docs";
import { examples, featuredExampleGroups } from "../examples";

async function copy(value: string, label: string, notify = true) {
  try {
    await navigator.clipboard.writeText(value);
    if (notify) toast.success(`${label} copied`);
    return true;
  } catch {
    toast.error("Copy was blocked. Select the value and copy it manually.");
    return false;
  }
}

function copyGlyph(morph: "idle" | "loading" | "done") {
  switch (morph) {
    case "idle":
      return <Copy className="size-4" />;
    case "loading":
    case "done":
      return <StatusBadge state={morph} decorative />;
    default: {
      const _exhaustive: never = morph;
      return _exhaustive;
    }
  }
}

function CopyDate({ value }: { value: string | null }) {
  const [copied, setCopied] = useState(false);
  const [morph, setMorph] = useState<"idle" | "loading" | "done">("idle");
  useEffect(() => {
    if (morph !== "done") return;
    const t = window.setTimeout(
      () => {
        setCopied(false);
        setMorph("idle");
      },
      readNum("--check-hold", 2000),
    );
    return () => window.clearTimeout(t);
  }, [morph]);
  return (
    <Button
      className="h-12 w-full sm:w-auto sm:min-w-40"
      disabled={value === null}
      onClick={async () => {
        if (value === null) return;
        setMorph("loading");
        const ok = await copy(value, "Date", false);
        setCopied(ok);
        setMorph(ok ? "done" : "idle");
      }}
    >
      {copyGlyph(morph)}
      {copied ? "Result copied" : "Copy result"}
    </Button>
  );
}

export function DatePicker({
  expression,
  onExpressionChange,
  interpretation,
  reference,
  onRefresh,
  onChoose,
  hasSelection = false,
}: {
  expression: string;
  onExpressionChange: (value: string) => void;
  interpretation: ParseResult;
  reference: string;
  onRefresh: () => void;
  onChoose: (selection: ClarificationSelection | undefined) => void;
  hasSelection?: boolean;
}) {
  const { settings, ready, settingsSaved, effectiveDateFormat, updateSettings, resetSettings } =
    useSettings();
  const hasExpression = Boolean(expression.trim());
  // A phrase that is not understood stays quiet until typing pauses or the field loses focus.
  const [settledExpression, setSettledExpression] = useState(expression);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettledExpression(expression), 600);
    return () => window.clearTimeout(timer);
  }, [expression]);
  const pane = useRef<HTMLDivElement>(null);
  const clarification =
    interpretation.status === "needs-clarification" ? interpretation.clarification : undefined;
  const recurrence =
    interpretation.status === "resolved" &&
    (interpretation.value.kind === "recurrence" || interpretation.value.kind === "collection");
  const interval = interpretation.status === "resolved" && interpretation.value.kind === "interval";
  const dateOnly =
    interpretation.status === "resolved" &&
    interpretation.value.kind === "point" &&
    interpretation.value.precision === "date";
  const calculation =
    interpretation.status === "resolved" && interpretation.value.kind === "point"
      ? interpretation.value.calculation
      : undefined;
  const error = interpretation.status !== "resolved" ? interpretation.error : undefined;
  const quietError = Boolean(
    error && !clarification && error.code !== "timezone" && settledExpression !== expression,
  );
  const answerKind = !hasExpression
    ? "examples"
    : recurrence
      ? "recurrence"
      : interval
        ? "interval"
        : clarification
          ? "choices"
          : error
            ? "message"
            : "result";
  const chooseExample = (phrase: string) => {
    // Hold the pane's height so the rows below ease up instead of snapping.
    const box = pane.current;
    if (box) {
      box.style.transition = "none";
      box.style.minHeight = `${box.offsetHeight}px`;
      void box.offsetHeight;
      requestAnimationFrame(() => {
        box.style.removeProperty("transition");
        box.style.removeProperty("min-height");
      });
    }
    onExpressionChange(phrase);
    // Touch keeps the page still and the keyboard closed; elsewhere the caret stays in the field.
    if (!window.matchMedia("(pointer: coarse)").matches)
      document.getElementById("date-expression")?.focus({ preventScroll: true });
  };
  const formatted = calculation
    ? safeFormatDate(new Date(calculation.result.timestamp), settings.timezone, effectiveDateFormat)
    : null;
  const clock =
    safeFormatDate(new Date(reference), settings.timezone, "MMM d, yyyy HH:mm:ss zzz") ?? reference;
  const openTimezoneSettings = () => {
    const panel = document.getElementById("timezone-settings");
    if (panel instanceof HTMLDetailsElement) {
      panel.open = true;
      panel.scrollIntoView({ block: "nearest" });
      document.getElementById("calculation-timezone")?.focus({ preventScroll: true });
    }
  };
  return (
    <div className="grid min-w-0 gap-8">
      <section
        aria-label="Date calculator"
        className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10"
      >
        <div className="min-w-0">
          <Label htmlFor="date-expression" className="text-sm font-medium">
            What date do you need?
          </Label>
          <div className="relative mt-3 flex min-w-0 items-start">
            <textarea
              id="date-expression"
              disabled={!ready}
              aria-describedby={
                expression.trim() && interpretation.status !== "resolved"
                  ? "phrase-help calculation-error"
                  : "phrase-help"
              }
              aria-invalid={Boolean(
                expression.trim() &&
                !clarification &&
                interpretation.status !== "resolved" &&
                error?.code !== "timezone" &&
                !quietError,
              )}
              value={expression}
              onChange={(event) => onExpressionChange(event.target.value.replaceAll("\n", " "))}
              onBlur={() => setSettledExpression(expression)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              autoComplete="off"
              spellCheck={false}
              rows={2}
              cols={1}
              placeholder="e.g. today plus 2 weeks"
              className="min-h-36 min-w-0 w-full flex-1 resize-none rounded-xl border border-input bg-background p-4 pb-12 text-xl leading-relaxed shadow-xs ring-offset-background placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {expression ? (
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => {
                  onExpressionChange("");
                  document.getElementById("date-expression")?.focus();
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
          <p id="phrase-help" className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {ready ? (
              <>
                <span className="mb-2 block">On this device · up to 200 characters.</span>
                <button
                  type="button"
                  className="text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2"
                  onClick={openTimezoneSettings}
                >
                  Using {settings.timezone} — change
                </button>
              </>
            ) : (
              "Loading the date tools…"
            )}
          </p>
        </div>
        <div
          ref={pane}
          className="min-h-[24rem] min-w-0 rounded-2xl border bg-background p-5 shadow-xs ease-out motion-safe:transition-[min-height] motion-safe:duration-200 sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <div key={answerKind} className="t-answer-swap min-w-0">
            {!hasExpression ? (
              <div className="grid gap-5" role="group" aria-label="Try a phrase">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Try a phrase</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pick an example, or write your own.
                  </p>
                </div>
                {featuredExampleGroups.map((group) => (
                  <fieldset key={group.label} className="m-0 min-w-0 border-0 p-0">
                    <legend className="float-none mb-1.5 w-full p-0 text-xs font-medium text-muted-foreground">
                      {group.label}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {group.phrases.map((phrase) => (
                        <Button
                          key={phrase}
                          type="button"
                          disabled={!ready}
                          variant="outline"
                          className="h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left text-sm font-normal shadow-none hover:border-primary/40 hover:bg-primary/5"
                          onClick={() => chooseExample(phrase)}
                        >
                          {phrase}
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            ) : null}
            <RecurrenceDecisionsProvider
              key={JSON.stringify([expression, reference, settings.timezone, interpretation])}
            >
              {hasExpression ? (
                <div className="min-w-0">
                  {recurrence && interpretation.status === "resolved" ? (
                    <OccurrenceResult
                      reference={reference}
                      key={JSON.stringify([expression, reference, settings.timezone])}
                      interpretation={interpretation}
                      expression={expression}
                      onChangeInterpretation={() => {
                        onChoose(undefined);
                        document.getElementById("calculation-error")?.focus();
                      }}
                    />
                  ) : interval && interpretation.status === "resolved" ? (
                    <IntervalResult
                      key={JSON.stringify([expression, reference, settings.timezone])}
                      interpretation={interpretation}
                      expression={expression}
                      onChangeInterpretation={() => {
                        onChoose(undefined);
                        document.getElementById("calculation-error")?.focus();
                      }}
                    />
                  ) : error ? (
                    <section
                      // A fresh alert node is announced once typing pauses.
                      key={String(quietError)}
                      id="calculation-error"
                      tabIndex={-1}
                      role={clarification ? "status" : quietError ? undefined : "alert"}
                      className={cn(
                        "grid min-w-0 gap-3 rounded-lg border p-4 sm:p-5",
                        clarification
                          ? "border-border bg-background"
                          : quietError
                            ? "border-border bg-muted/40"
                            : "border-destructive/30 bg-destructive/5",
                      )}
                    >
                      <h2
                        className={cn(
                          "font-semibold leading-relaxed",
                          !clarification && !quietError && "text-destructive",
                        )}
                      >
                        {error.message}
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">{error.hint}</p>
                      {interpretation.status === "needs-clarification" &&
                      interpretation.clarification ? (
                        <div
                          className="flex flex-wrap items-start gap-2"
                          role="group"
                          aria-label={interpretation.clarification.question}
                        >
                          {interpretation.clarification.choices.map((choice) => (
                            <Button
                              key={choice.id}
                              variant="outline"
                              className="h-auto min-h-12 w-full justify-start whitespace-normal text-left sm:w-auto"
                              onClick={() => {
                                if (interpretation.clarification)
                                  onChoose({
                                    contextKey: interpretation.clarification.contextKey,
                                    id: choice.id,
                                  });
                                // onChoose commits synchronously; focus before the next user action.
                                (
                                  document.getElementById("calculated-date") ??
                                  document.getElementById("calculation-error")
                                )?.focus();
                              }}
                            >
                              {choice.label}
                            </Button>
                          ))}
                        </div>
                      ) : null}
                      {hasSelection ? (
                        <Button
                          variant="link"
                          onClick={() => {
                            onChoose(undefined);
                            document.getElementById("calculation-error")?.focus();
                          }}
                        >
                          Restart choices
                        </Button>
                      ) : null}
                      {error.span && error.span.end > error.span.start ? (
                        <p className="mt-2 break-words text-sm text-muted-foreground">
                          Check this part of your phrase:{" "}
                          <code>{expression.slice(error.span.start, error.span.end)}</code>
                        </p>
                      ) : null}
                      {error.code === "timezone" ? (
                        <Button
                          className="mt-3"
                          variant="outline"
                          onClick={() => updateSettings({ timezone: "UTC" })}
                        >
                          Use UTC
                        </Button>
                      ) : null}
                    </section>
                  ) : calculation ? (
                    <section
                      id="calculated-date"
                      tabIndex={-1}
                      aria-label="Calculated date"
                      className="pb-1"
                    >
                      <div role="status" aria-live="polite" aria-atomic="true">
                        <h2
                          className={`break-words text-2xl font-semibold tracking-tight sm:text-3xl ${formatted === null ? "text-destructive" : ""}`}
                        >
                          {formatted ?? "Choose a valid date format."}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {calculation.timezone} ·{" "}
                          {dateOnly
                            ? "Date only · no time specified"
                            : safeFormatDate(
                                new Date(calculation.result.timestamp),
                                calculation.timezone,
                                resultClockFormat(calculation.result.local),
                              )}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-xs text-muted-foreground">
                          Time stays fixed until you edit or refresh.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={onRefresh}
                        >
                          <RotateCcw className="mr-1 size-3" />
                          Refresh now
                        </Button>
                      </div>
                      {interpretation.status === "resolved" && interpretation.event ? (
                        <div className="mt-4 grid gap-2 border-t pt-4 text-sm">
                          <p className="break-words">
                            <span className="font-medium">Event: </span>
                            {interpretation.event.text}
                          </p>
                          <p className="break-words" aria-label="Recognized date phrase">
                            {expression.slice(0, interpretation.source.span.start)}
                            <mark className="rounded bg-amber-100 px-1 text-amber-950">
                              {interpretation.source.text}
                            </mark>
                            {expression.slice(interpretation.source.span.end)}
                          </p>
                        </div>
                      ) : null}
                      {interpretation.status === "resolved" && interpretation.selectedChoice ? (
                        <div className="mt-3 text-sm">
                          <p>Using {interpretation.selectedChoice}</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              onChoose(undefined);
                              document.getElementById("calculation-error")?.focus();
                            }}
                          >
                            Change date interpretation
                          </Button>
                        </div>
                      ) : null}
                      {calculation.warnings.map((warning) => (
                        <p
                          key={warning}
                          className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
                          role="note"
                        >
                          {warning}
                        </p>
                      ))}
                      <div className="mt-4 flex flex-wrap items-end gap-3">
                        <CopyDate
                          key={JSON.stringify([
                            expression,
                            reference,
                            settings.timezone,
                            effectiveDateFormat,
                          ])}
                          value={
                            formatted === null
                              ? null
                              : [
                                  interpretation.status === "resolved"
                                    ? interpretation.event?.text
                                    : undefined,
                                  formatted,
                                  dateOnly
                                    ? `Date only · no time specified · ${calculation.timezone}`
                                    : `${safeFormatDate(new Date(calculation.result.timestamp), calculation.timezone, resultClockFormat(calculation.result.local))} · ${calculation.timezone} (UTC${calculation.result.offset})`,
                                ]
                                  .filter(Boolean)
                                  .join("\n")
                          }
                        />
                      </div>
                      {formatted === null ? (
                        <Button
                          className="mt-3"
                          variant="outline"
                          onClick={() =>
                            updateSettings({
                              isCustomFormat: false,
                              dateFormat: "EEEE, MMMM d, yyyy",
                            })
                          }
                        >
                          Restore readable format
                        </Button>
                      ) : null}
                    </section>
                  ) : null}

                  {hasExpression && calculation && !interval && !recurrence ? (
                    <CalculationTrace calculation={calculation} dateOnly={dateOnly} />
                  ) : null}

                  {hasExpression && !(calculation && !interval && !recurrence) ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 text-xs text-muted-foreground">
                      <span>Time stays fixed until you edit or refresh.</span>
                      <Button variant="ghost" size="sm" onClick={onRefresh}>
                        <RotateCcw className="mr-1 size-3" />
                        Refresh now
                      </Button>
                    </div>
                  ) : null}

                  <CalendarExport
                    reference={reference}
                    key={JSON.stringify([expression, reference, settings.timezone, interpretation])}
                    interpretation={interpretation}
                  />
                </div>
              ) : null}
            </RecurrenceDecisionsProvider>
          </div>
          <Disclosure className="mt-5 border-t pt-2">
            <summary className="cursor-pointer py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2">
              Browse examples
            </summary>
            <DateExpressionTabs
              examples={examples}
              onExampleClick={(value) => {
                onExpressionChange(value);
                requestAnimationFrame(() => {
                  const result =
                    document.getElementById("calculated-date") ??
                    document.getElementById("calculation-error");
                  result?.focus({ preventScroll: true });
                  result?.scrollIntoView({ block: "nearest" });
                });
              }}
            />
          </Disclosure>
        </div>
        <Disclosure
          id="timezone-settings"
          className="min-w-0 border-t lg:col-start-1 lg:row-start-2"
        >
          <summary className="cursor-pointer py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2">
            Change timezone or format
          </summary>
          <div className="grid gap-4 pb-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="calculation-timezone" className="text-base">
                Timezone
              </Label>
              <select
                id="calculation-timezone"
                value={settings.timezone}
                onChange={(event) => {
                  const timezone = event.currentTarget.value;
                  onChoose(undefined);
                  updateSettings({ timezone });
                }}
                aria-describedby={
                  error?.code === "timezone" ? "timezone-help calculation-error" : "timezone-help"
                }
                aria-invalid={error?.code === "timezone"}
                className="h-12 w-full min-w-0 rounded-md border bg-background px-2 text-base focus-visible:outline focus-visible:outline-2"
              >
                {/* Keep a device or stored zone outside the list (e.g. Etc/GMT+5) visible. */}
                {timezoneOptions.some((zone) => zone.value === settings.timezone) ? null : (
                  <option value={settings.timezone}>{settings.timezone}</option>
                )}
                {timezoneOptions.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </div>
            <p id="timezone-help" className="text-xs text-muted-foreground">
              Words like “today” and “at noon” are calculated in this timezone.
            </p>
            <div className="grid max-w-full gap-2">
              <Label htmlFor="date-format">Display format (single dates)</Label>
              <select
                id="date-format"
                value={settings.isCustomFormat ? "custom" : settings.dateFormat}
                onChange={(event) =>
                  updateSettings({
                    isCustomFormat: event.target.value === "custom",
                    ...(event.target.value === "custom" ? {} : { dateFormat: event.target.value }),
                  })
                }
                className="h-10 max-w-full rounded-md border bg-background px-2 text-sm focus-visible:outline focus-visible:outline-2"
              >
                {dateFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {settings.isCustomFormat ? (
              <div className="mt-4 grid gap-2">
                <Label htmlFor="custom-format">Custom date format</Label>
                <Input
                  id="custom-format"
                  value={settings.customFormat}
                  maxLength={50}
                  aria-invalid={Boolean(calculation && formatted === null)}
                  aria-describedby={
                    calculation && formatted === null
                      ? "format-help custom-format-error"
                      : "format-help"
                  }
                  onChange={(event) => updateSettings({ customFormat: event.target.value })}
                />
                {calculation && formatted === null ? (
                  <p id="custom-format-error" role="status" className="text-sm text-destructive">
                    This format could not be applied. Check the tokens below or use yyyy-MM-dd.
                  </p>
                ) : null}
                <p id="format-help" className="text-xs text-muted-foreground">
                  Use yyyy for year, MM for month, dd for day, HH:mm for time. Example: yyyy-MM-dd
                  HH:mm.
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
              <span>
                {settingsSaved
                  ? "Preferences saved in this browser."
                  : "Preferences last until you reload. Browser storage is unavailable."}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChoose(undefined);
                  resetSettings();
                }}
              >
                Reset preferences
              </Button>
            </div>
          </div>
        </Disclosure>
      </section>
      <Disclosure className="min-w-0 max-w-full border-t text-sm">
        <summary className="cursor-pointer whitespace-normal break-words py-3 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2">
          <span>Developer tools</span>
        </summary>
        <div className="mt-1 grid min-w-0 gap-6 rounded-xl border bg-background p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Inspect the captured result or compare it with the API.
            </p>
            <a
              className="text-sm font-medium text-primary underline underline-offset-4"
              href="/developers"
            >
              Integration guide
            </a>
          </div>
          <div className={cn("grid min-w-0 gap-6", hasExpression && "lg:grid-cols-2")}>
            {expression.trim() ? (
              <section aria-label="Calculation details" className="min-w-0">
                <p className="mb-1 text-xs font-medium text-muted-foreground">On this device</p>
                <h2 className="text-base font-semibold tracking-tight">Calculation details</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Copy values and the parser response locally. These actions do not send a server
                  request.
                </p>
                <p className="mt-2 break-words leading-relaxed text-muted-foreground">
                  Reference time: <time dateTime={reference}>{clock}</time>
                </p>
                {calculation && !interval && !recurrence ? (
                  <dl className="mt-4 grid min-w-0 divide-y border-y text-sm">
                    <div className="grid gap-2 py-3">
                      <dt className="text-xs text-muted-foreground">ISO date (UTC)</dt>
                      <dd className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <code className="min-w-0 w-full break-all font-mono sm:w-auto sm:flex-1">
                          {calculation.result.iso}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copy(calculation.result.iso, "ISO date")}
                        >
                          Copy ISO
                        </Button>
                      </dd>
                    </div>
                    <div className="grid gap-2 py-3">
                      <dt className="text-xs text-muted-foreground">Unix milliseconds</dt>
                      <dd className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <code className="min-w-0 w-full break-all font-mono sm:w-auto sm:flex-1">
                          {calculation.result.timestamp}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copy(String(calculation.result.timestamp), "Timestamp")}
                        >
                          Copy timestamp
                        </Button>
                      </dd>
                    </div>
                  </dl>
                ) : null}
                <Button
                  variant="outline"
                  className="mt-4 h-auto min-h-11 w-full whitespace-normal sm:w-auto"
                  onClick={() =>
                    copy(
                      JSON.stringify(
                        {
                          expression,
                          timezone: settings.timezone,
                          reference,
                          format: effectiveDateFormat,
                          interpretation,
                        },
                        null,
                        2,
                      ),
                      "Calculation details",
                    )
                  }
                >
                  Copy parser response JSON
                </Button>
              </section>
            ) : null}
            <section
              aria-label="Compare with the API"
              className={cn(
                "grid min-w-0 content-start gap-3",
                hasExpression && "border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0",
              )}
            >
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Sent to this site's server
                </p>
                <h2 className="text-base font-semibold tracking-tight">Compare with the API</h2>
              </div>
              {interpretation.status === "resolved" && interpretation.event ? (
                <p className="text-sm text-muted-foreground">
                  This sends the interpreted calculator expression, including any date choice you
                  made. The API does not interpret the full sentence.
                </p>
              ) : null}
              {interval ||
              (interpretation.status === "resolved" && interpretation.apiReplay === false) ? (
                <p className="text-sm text-muted-foreground">
                  This interpretation includes a confirmed choice, schedule or range that strict API
                  v2 does not replay. This result was resolved locally.
                </p>
              ) : (
                <ApiDocs
                  expression={calculation ? calculation.expression : expression}
                  reference={reference}
                  calculation={calculation}
                />
              )}
            </section>
          </div>
        </div>
      </Disclosure>
    </div>
  );
}
