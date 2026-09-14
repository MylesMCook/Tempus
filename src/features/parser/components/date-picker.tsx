import { useEffect, useRef, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Disclosure } from "@/components/disclosure";
import { StatusBadge, readNum } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { examples, featuredExamples } from "../examples";

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
      return <StatusBadge state="loading" decorative />;
    case "done":
      return <StatusBadge state="done" decorative />;
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
      {copied ? "Date copied" : "Copy date"}
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
  const [resultEnter, setResultEnter] = useState(false);
  const hadExpression = useRef(false);
  useEffect(() => {
    if (hasExpression && !hadExpression.current) setResultEnter(true);
    if (!hasExpression) setResultEnter(false);
    hadExpression.current = hasExpression;
  }, [hasExpression]);
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
    }
  };
  return (
    <div className="grid gap-4">
      <section aria-label="Date calculator" className="rounded-xl border bg-background p-4 sm:p-5">
        <Label htmlFor="date-expression" className="text-sm font-medium text-muted-foreground">
          What date do you need?
        </Label>
        <Input
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
            error?.code !== "timezone",
          )}
          value={expression}
          onChange={(event) => onExpressionChange(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. today plus 2 weeks minus 3 days"
          className="mt-2 h-12 text-base"
        />
        <div className="mt-2 flex min-h-9 items-start justify-between gap-2 text-sm text-muted-foreground">
          <p id="phrase-help" className="leading-relaxed">
            {ready ? (
              <>
                On this device · up to 200 characters.{" "}
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
          {expression ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onExpressionChange("");
                document.getElementById("date-expression")?.focus();
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
        {!hasExpression ? (
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Try a phrase">
            {featuredExamples.map((phrase) => (
              <Button
                key={phrase}
                type="button"
                disabled={!ready}
                variant="secondary"
                className="h-auto min-h-11 whitespace-normal text-left font-normal"
                onClick={() => {
                  onExpressionChange(phrase);
                  document.getElementById("date-expression")?.focus();
                }}
              >
                {phrase}
              </Button>
            ))}
          </div>
        ) : null}
        <Disclosure className="mt-2">
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

        <RecurrenceDecisionsProvider
          key={JSON.stringify([expression, reference, settings.timezone, interpretation])}
        >
          {hasExpression ? (
            <div
              className={`mt-4 border-t pt-4${resultEnter ? " t-result-enter" : ""}`}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) setResultEnter(false);
              }}
            >
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
                  id="calculation-error"
                  tabIndex={-1}
                  role={clarification ? "status" : "alert"}
                  className={`rounded-md border p-3 ${clarification ? "border-border" : "border-destructive/40"}`}
                >
                  <h2
                    className={`font-semibold ${clarification ? "text-foreground" : "text-destructive"}`}
                  >
                    {error.message}
                  </h2>
                  <p className="mt-2 text-sm">{error.hint}</p>
                  {interpretation.status === "needs-clarification" &&
                  interpretation.clarification ? (
                    <div
                      className="mt-3 grid gap-2"
                      role="group"
                      aria-label={interpretation.clarification.question}
                    >
                      {interpretation.clarification.choices.map((choice) => (
                        <Button
                          key={choice.id}
                          variant="outline"
                          className="min-h-12 h-auto whitespace-normal text-left"
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
                      Check: <code>{expression.slice(error.span.start, error.span.end)}</code>
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
                        updateSettings({ isCustomFormat: false, dateFormat: "EEEE, MMMM d, yyyy" })
                      }
                    >
                      Restore readable format
                    </Button>
                  ) : null}
                </section>
              ) : null}

              {hasExpression && calculation && !interval && !recurrence ? (
                <CalculationTrace calculation={calculation} />
              ) : null}

              <CalendarExport
                reference={reference}
                key={JSON.stringify([expression, reference, settings.timezone, interpretation])}
                interpretation={interpretation}
              />

              {hasExpression ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 text-xs text-muted-foreground">
                  <span>Time stays fixed until you edit or refresh.</span>
                  <Button variant="ghost" size="sm" onClick={onRefresh}>
                    <RotateCcw className="mr-1 size-3" />
                    Refresh now
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <Disclosure id="timezone-settings" className="mt-3 border-t">
            <summary className="cursor-pointer py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2">
              Change timezone or format
            </summary>
            <div className="grid gap-4 pb-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="calculation-timezone" className="text-base">
                  Timezone
                </Label>
                <Input
                  id="calculation-timezone"
                  list="timezone-options"
                  value={settings.timezone}
                  onChange={(event) => {
                    const timezone = event.currentTarget.value;
                    onChoose(undefined);
                    updateSettings({ timezone });
                  }}
                  maxLength={64}
                  aria-describedby={
                    error?.code === "timezone" ? "timezone-help calculation-error" : "timezone-help"
                  }
                  aria-invalid={error?.code === "timezone"}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 text-base"
                />
                <datalist id="timezone-options">
                  {timezoneOptions.map((zone) => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </datalist>
              </div>
              <p id="timezone-help" className="text-xs text-muted-foreground">
                Choose a suggestion or enter an IANA timezone.
              </p>
              <div className="grid max-w-full gap-2">
                <Label htmlFor="date-format">Display format (single dates)</Label>
                <select
                  id="date-format"
                  value={settings.isCustomFormat ? "custom" : settings.dateFormat}
                  onChange={(event) =>
                    updateSettings({
                      isCustomFormat: event.target.value === "custom",
                      ...(event.target.value === "custom"
                        ? {}
                        : { dateFormat: event.target.value }),
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
        </RecurrenceDecisionsProvider>
      </section>
      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        Copy JSON stays on your device. API compare sends the phrase you typed, or the interpreted
        expression for a single-date result, to this server.
      </p>
      <Disclosure className="px-1 text-sm">
        <summary className="cursor-pointer py-3 font-medium text-foreground focus-visible:outline focus-visible:outline-2">
          Developer tools
        </summary>
        <div className="mt-1 grid min-w-0 gap-5 rounded-xl border bg-background p-4 sm:p-5">
          <p className="leading-relaxed text-muted-foreground">
            Use the structured interpretation in your own application.{" "}
            <a className="font-medium text-primary underline underline-offset-4" href="/developers">
              Integration guide
            </a>
          </p>
          {expression.trim() ? (
            <section aria-label="Calculation details" className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight">Calculation details</h2>
              <p className="mt-2 break-words leading-relaxed text-muted-foreground">
                Reference time: <time dateTime={reference}>{clock}</time>
              </p>
              {calculation && !interval && !recurrence ? (
                <div className="mt-3 text-sm">
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">ISO date (UTC)</dt>
                      <dd className="break-all font-mono">{calculation.result.iso}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Unix milliseconds</dt>
                      <dd className="font-mono">{calculation.result.timestamp}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(calculation.result.iso, "ISO date")}
                    >
                      Copy ISO
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(String(calculation.result.timestamp), "Timestamp")}
                    >
                      Copy timestamp
                    </Button>
                  </div>
                </div>
              ) : null}
              <Button
                variant="outline"
                className="mt-4"
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
            className={`grid min-w-0 gap-2 ${expression.trim() ? "border-t pt-5" : ""}`}
          >
            <h2 className="text-base font-semibold tracking-tight">Compare with the API</h2>
            {interpretation.status === "resolved" && interpretation.event ? (
              <p className="text-sm text-muted-foreground">
                This sends the interpreted calculator expression, including any date choice you
                made. The API does not interpret the full sentence.
              </p>
            ) : null}
            {interval ||
            (interpretation.status === "resolved" && interpretation.apiReplay === false) ? (
              <p className="text-sm text-muted-foreground">
                This interpretation needs a schedule, range or explicit clock decision. Strict API
                v2 does not replay those decisions; this result was resolved locally.
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
      </Disclosure>
    </div>
  );
}
