import { useId, useState } from "react";
import { Bug, Check, ChevronDown, Clock3, Copy, Info } from "lucide-react";
import { Disclosure } from "@/components/disclosure";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Calculation, CalculationStep, DateSnapshot } from "@/shared/date-parser";
import { resultClockFormat, safeFormatDate } from "../options";

const GENERIC_CALENDAR_NOTE = "Calendar change, applied to this step’s starting date.";

function timestamp(date: DateSnapshot) {
  return `${date.local.replace("T", " ").replace(/\.000$/, "")} ${date.offset}`;
}

function classifyDetail(detail: string): "omit" | "clamp" | "approximation" | "note" {
  if (detail === GENERIC_CALENDAR_NOTE) return "omit";
  if (detail.includes("clamp to day")) return "clamp";
  if (detail.startsWith("Approximation:")) return "approximation";
  return "note";
}

function duration(milliseconds: bigint) {
  let remaining = milliseconds < 0n ? -milliseconds : milliseconds;
  const parts: string[] = [];
  for (const [size, unit] of [
    [3_600_000n, "hour"],
    [60_000n, "minute"],
    [1_000n, "second"],
    [1n, "millisecond"],
  ] as const) {
    const count = remaining / size;
    remaining %= size;
    if (count) parts.push(`${count} ${unit}${count === 1n ? "" : "s"}`);
  }
  return parts.join(" ") || "0 milliseconds";
}

function elapsedTime(step: Pick<CalculationStep, "before" | "after">) {
  const elapsed = BigInt(step.after.timestamp) - BigInt(step.before.timestamp);
  return `${elapsed < 0n ? "-" : ""}${duration(elapsed)}`;
}

function offsetMinutes(offset: string) {
  const match = /^([+-])(\d\d):(\d\d)$/.exec(offset);
  return match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
}

/** Describes the real-world clock change between the earlier and later date, whichever way the step runs. */
function clockChange(step: Pick<CalculationStep, "before" | "after">) {
  const [earlier, later] =
    step.after.timestamp < step.before.timestamp
      ? [step.after, step.before]
      : [step.before, step.after];
  const shift = offsetMinutes(later.offset) - offsetMinutes(earlier.offset);
  return `Clocks go ${shift < 0 ? "back" : "forward"} ${duration(BigInt(shift) * 60_000n)} during this step`;
}

function TimelineDot({ current }: { current?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-background ring-2",
        current ? "bg-primary ring-primary/30" : "bg-background ring-muted-foreground/50",
      )}
    />
  );
}

function SnapshotFields({ date, timezone }: { date: DateSnapshot; timezone: string }) {
  return (
    <dl className="@container min-w-0 divide-y text-sm">
      {[
        [`Local time (${timezone})`, timestamp(date)],
        ["Weekday", safeFormatDate(new Date(date.timestamp), timezone, "EEEE") ?? "Unavailable"],
        ["UTC", date.iso],
        ["Epoch milliseconds", date.timestamp],
        ["UTC offset", date.offset],
      ].map(([label, value]) => (
        <div
          key={label}
          className="grid min-w-0 gap-1 py-2 first:pt-0 last:pb-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="break-words font-mono tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DateCheckpoint({
  date,
  timezone,
  dateOnly,
  result = false,
}: {
  date: DateSnapshot;
  timezone: string;
  dateOnly: boolean;
  result?: boolean;
}) {
  return (
    <>
      <time dateTime={date.iso} className="block">
        <span
          className={cn(
            "block tabular-nums",
            result ? "text-xl font-semibold tracking-tight" : "text-base font-medium",
          )}
        >
          {safeFormatDate(new Date(date.timestamp), timezone, "EEE, MMM d, yyyy") ??
            timestamp(date)}
        </span>
        {!dateOnly ? (
          <span className="mt-0.5 block text-sm tabular-nums text-muted-foreground">
            {safeFormatDate(new Date(date.timestamp), timezone, resultClockFormat(date.local)) ??
              timestamp(date)}
          </span>
        ) : null}
      </time>
      {result && dateOnly ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Date only; no time of day was requested.
        </p>
      ) : null}
    </>
  );
}

function StepEndpoints({ step, timezone }: { step: CalculationStep; timezone: string }) {
  return (
    <dl className="grid min-w-0 gap-4 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div>
        <dt className="mb-3 font-medium">From </dt>
        <dd>
          <SnapshotFields date={step.before} timezone={timezone} />
        </dd>
      </div>
      <div className="pt-4 sm:pl-4 sm:pt-0">
        <dt className="mb-3 font-medium">To </dt>
        <dd>
          <SnapshotFields date={step.after} timezone={timezone} />
        </dd>
      </div>
    </dl>
  );
}

function StepNotes({ step }: { step: CalculationStep }) {
  const notes = step.details
    .map((detail) => ({ detail, kind: classifyDetail(detail) }))
    .filter((item) => item.kind === "clamp" || item.kind === "approximation");
  if (!notes.length) return null;
  return (
    <div className="mt-2 grid gap-2">
      {notes.map(({ detail, kind }, index) => (
        <Alert key={index} role="note" variant="warning">
          <Info aria-hidden="true" />
          <AlertTitle>{kind === "clamp" ? "Clamped." : "Approximated."}</AlertTitle>
          <AlertDescription>{detail}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

function ReadPhrase({ normalized }: { normalized: string }) {
  return (
    <div>
      <h5 className="font-medium text-muted-foreground">Read as</h5>
      <p className="mt-2 font-mono text-sm [overflow-wrap:anywhere]">{normalized}</p>
    </div>
  );
}

function CalculationDebug({ calculation }: { calculation: Extract<Calculation, { ok: true }> }) {
  const headingId = useId();
  const jsonHeadingId = `${headingId}-json`;
  const json = JSON.stringify(calculation, null, 2);
  const [copyFeedback, setCopyFeedback] = useState({ json: "", message: "" });
  return (
    <Card className="mt-3">
      <Disclosure className="group/debug">
        <Button asChild variant="ghost" className="h-auto w-full justify-between gap-3 px-4 py-3">
          <summary id={headingId}>
            <span className="flex items-center gap-2">
              <Bug aria-hidden="true" />
              Debug calculation
            </span>
            <ChevronDown
              aria-hidden="true"
              className="transition-transform duration-150 ease-out group-open/debug:rotate-180 motion-reduce:transition-none"
            />
          </summary>
        </Button>
        <section aria-labelledby={headingId}>
          <CardHeader className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle role="heading" aria-level={3}>
                Calculation summary
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(json);
                    setCopyFeedback({ json, message: "Debug JSON copied." });
                  } catch {
                    setCopyFeedback({
                      json,
                      message: "Copy was blocked. Select the JSON below and copy it manually.",
                    });
                  }
                }}
              >
                <Copy data-icon="inline-start" aria-hidden="true" />
                Copy debug JSON
              </Button>
            </div>
            <CardDescription>
              The captured inputs and the exact values recorded by the engine.
            </CardDescription>
            <p role="status" className="text-xs text-muted-foreground">
              {copyFeedback.json === json ? copyFeedback.message : ""}
            </p>
          </CardHeader>
          <CardContent className="grid min-w-0 grid-cols-1 gap-8 p-4 pt-0 [overflow-wrap:anywhere]">
            <dl className="@container min-w-0 divide-y text-sm">
              <div className="grid min-w-0 gap-1 py-3 first:pt-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Engine version</dt>
                <dd>{calculation.engineVersion}</dd>
              </div>
              <div className="grid min-w-0 gap-1 py-3 first:pt-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Timezone</dt>
                <dd className="break-words">{calculation.timezone}</dd>
              </div>
              <div className="grid min-w-0 gap-1 py-3 first:pt-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Steps</dt>
                <dd>{calculation.steps.length}</dd>
              </div>
              <div className="grid min-w-0 gap-1 py-3 first:pt-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Reference instant (UTC)</dt>
                <dd className="break-all font-mono">{calculation.reference}</dd>
              </div>
              <div className="grid min-w-0 gap-1 py-3 first:pt-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Result (UTC)</dt>
                <dd className="break-all font-mono">{calculation.result.iso}</dd>
              </div>
              <div className="grid min-w-0 gap-1 py-3 first:pt-0 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Total elapsed time</dt>
                <dd>{elapsedTime({ before: calculation.anchor, after: calculation.result })}</dd>
              </div>
              <div className="grid min-w-0 gap-1 py-3 @min-[24rem]:grid-cols-[9rem_minmax(0,1fr)] @min-[24rem]:gap-4">
                <dt className="text-muted-foreground">Warnings</dt>
                <dd>
                  {calculation.warnings.length ? (
                    <Alert role="note" variant="warning">
                      <AlertDescription>
                        <ul className="grid gap-1">
                          {calculation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>
            </dl>
            <div className="grid min-w-0 gap-4 border-t pt-6">
              <h4 className="flex items-center gap-2 font-medium">
                <Badge variant="secondary">Input</Badge>Expression analysis
              </h4>
              <h5 className="text-sm text-muted-foreground">
                Engine input · {Array.from(calculation.expression).length} characters
              </h5>
              <pre className="whitespace-pre-wrap font-mono text-sm">{calculation.expression}</pre>
              <ReadPhrase normalized={calculation.normalized} />
              <p className="break-words text-sm text-muted-foreground">
                Reference used:{" "}
                {safeFormatDate(
                  new Date(calculation.reference),
                  calculation.timezone,
                  "MMM d, yyyy HH:mm:ss.SSS xxx",
                ) ?? calculation.reference}
              </p>
            </div>
            <div className="grid min-w-0 gap-4 border-t pt-6">
              <h4 className="font-medium">Starting date</h4>
              <p className="text-sm text-muted-foreground">{calculation.anchorDescription}</p>
              <SnapshotFields date={calculation.anchor} timezone={calculation.timezone} />
            </div>
            {!calculation.steps.length ? (
              <p className="text-sm text-muted-foreground">No adjustments recorded.</p>
            ) : null}
            {calculation.steps.map((step, index) => (
              <div key={index} className="grid min-w-0 gap-4 border-t pt-6">
                <h4 className="flex flex-wrap items-center gap-2 font-medium">
                  <Badge variant="secondary">Step {index + 1}</Badge>
                  {step.source}
                </h4>
                <StepEndpoints step={step} timezone={calculation.timezone} />
                <p className="text-sm">
                  <span className="text-muted-foreground">Elapsed time: </span>
                  {elapsedTime(step)}
                </p>
                <StepNotes step={step} />
                <ul className="grid list-disc gap-1 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {step.details
                    .filter(
                      (detail) => !["clamp", "approximation"].includes(classifyDetail(detail)),
                    )
                    .map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                </ul>
              </div>
            ))}
            <div className="grid min-w-0 gap-4 border-t pt-6">
              <h4 className="flex items-center gap-2 font-medium">
                <Badge>Result</Badge>Final calculation
              </h4>
              <SnapshotFields date={calculation.result} timezone={calculation.timezone} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Calendar days follow the local clock. 24 hours is elapsed time. Negative elapsed
              values run backward.
            </p>
            <div className="grid min-w-0 gap-4 border-t pt-6">
              <h4 id={jsonHeadingId} className="font-medium">
                Raw calculation JSON
              </h4>
              <pre
                tabIndex={0}
                role="region"
                aria-labelledby={jsonHeadingId}
                className="max-h-64 min-w-0 max-w-full overflow-auto whitespace-pre rounded-md border bg-muted/30 p-3 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                {json}
              </pre>
            </div>
          </CardContent>
        </section>
      </Disclosure>
    </Card>
  );
}

export function CalculationTrace({
  calculation,
  dateOnly = false,
}: {
  calculation: Calculation;
  dateOnly?: boolean;
}) {
  const lastIndex = calculation.ok ? calculation.steps.length - 1 : -1;
  return (
    <Disclosure className="t-calculation-trace group/trace mt-5">
      <Button asChild variant="ghost" className="h-auto w-full justify-between gap-2 px-0 py-3">
        <summary>
          Show calculation steps
          <ChevronDown
            aria-hidden="true"
            className="transition-transform duration-150 ease-out group-open/trace:rotate-180 motion-reduce:transition-none"
          />
        </summary>
      </Button>
      {!calculation.ok ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {calculation.error.message} {calculation.error.hint}
        </p>
      ) : (
        <div className="mt-2 grid gap-5 pb-1 text-sm">
          <p className="text-sm text-muted-foreground">
            Reference time:{" "}
            <time dateTime={calculation.reference} className="tabular-nums">
              {safeFormatDate(
                new Date(calculation.reference),
                calculation.timezone,
                "EEE, MMM d, yyyy 'at' h:mm a zzz",
              ) ?? calculation.reference}
            </time>
            {" · "}
            {calculation.timezone}
          </p>
          <ol
            className="relative ml-3 grid border-l-2 border-border"
            aria-label="Calculation steps"
          >
            <li className="relative pl-5">
              <TimelineDot current={calculation.steps.length === 0} />
              {!calculation.steps.length ? (
                <div className="mb-2">
                  <Badge>
                    <Check aria-hidden="true" />
                    Result
                  </Badge>
                </div>
              ) : null}
              <DateCheckpoint
                date={calculation.anchor}
                timezone={calculation.timezone}
                dateOnly={dateOnly}
                result={calculation.steps.length === 0}
              />
              {!calculation.steps.length ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Your phrase gives the result directly, with no arithmetic adjustments.
                </p>
              ) : null}
            </li>
            {calculation.steps.map((step, index) => (
              <li key={index} className="pl-5">
                <div className="pb-4 pt-4">
                  <h3 className="flex items-center gap-2">
                    <Badge variant="outline">{step.source}</Badge>
                  </h3>
                  {index > 0 &&
                  calculation.steps[index - 1].details.some(
                    (detail) => classifyDetail(detail) === "clamp",
                  ) ? (
                    <p className="mt-1 pl-2.5 text-sm text-muted-foreground">
                      {`Starts from step ${index}'s result: ${safeFormatDate(new Date(step.before.timestamp), calculation.timezone, "MMM d, yyyy") ?? timestamp(step.before)}.`}
                    </p>
                  ) : null}
                  <div className="[&>div]:mt-1">
                    <StepNotes step={step} />
                  </div>
                  <div className="mt-1 grid gap-1 pl-2.5 text-sm text-muted-foreground">
                    {step.details
                      .filter(
                        (detail) =>
                          classifyDetail(detail) === "note" &&
                          !detail.startsWith("The timezone offset changes from "),
                      )
                      .map((detail, index) => (
                        <p key={index}>{detail}</p>
                      ))}
                  </div>
                  {step.before.offset !== step.after.offset ? (
                    <Alert role="note" variant="warning" className="mt-1">
                      <Clock3 aria-hidden="true" />
                      <AlertTitle>{clockChange(step)}</AlertTitle>
                      <AlertDescription>{`Actual time between these dates: ${duration(BigInt(step.after.timestamp) - BigInt(step.before.timestamp))}.`}</AlertDescription>
                    </Alert>
                  ) : null}
                </div>
                <div className="relative -ml-5 pl-5">
                  <TimelineDot current={index === lastIndex} />
                  {index === lastIndex ? (
                    <div className="mb-2">
                      <Badge>
                        <Check aria-hidden="true" />
                        Result
                      </Badge>
                    </div>
                  ) : null}
                  <DateCheckpoint
                    date={step.after}
                    timezone={calculation.timezone}
                    dateOnly={dateOnly}
                    result={index === lastIndex}
                  />
                </div>
              </li>
            ))}
          </ol>
          <CalculationDebug calculation={calculation} />
        </div>
      )}
    </Disclosure>
  );
}
