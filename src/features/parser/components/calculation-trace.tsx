import { useId } from "react";
import { Disclosure } from "@/components/disclosure";
import type { Calculation, CalculationStep, DateSnapshot } from "@/shared/date-parser";

const GENERIC_CALENDAR_NOTE = "Calendar change, applied to this step’s starting date.";

function timestamp(date: DateSnapshot) {
  return `${date.local.replace("T", " ").replace(/\.000$/, "")} ${date.offset}`;
}

function classifyDetail(detail: string): "omit" | "clamp" | "note" {
  if (detail === GENERIC_CALENDAR_NOTE) return "omit";
  if (detail.includes("clamp to day")) return "clamp";
  return "note";
}

function TimelineDot({ current }: { current?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -left-[5px] top-1.5 size-2 rounded-full ring-4 ring-background ${
        current ? "bg-primary" : "bg-muted-foreground"
      }`}
    />
  );
}

function TimestampLine({ date }: { date: DateSnapshot }) {
  return (
    <p className="mt-1 break-words font-mono text-xs tabular-nums tracking-tight sm:text-sm">
      {timestamp(date)}
    </p>
  );
}

function StepEndpoints({ step }: { step: CalculationStep }) {
  return (
    <dl className="mt-1.5 grid gap-0.5 font-mono text-xs tabular-nums tracking-tight sm:text-sm">
      <div>
        <dt className="inline text-muted-foreground">From </dt>
        <dd className="inline break-words">{timestamp(step.before)}</dd>
      </div>
      <div>
        <dt className="inline text-muted-foreground">To </dt>
        <dd className="inline break-words">{timestamp(step.after)}</dd>
      </div>
    </dl>
  );
}

function StepNotes({ step }: { step: CalculationStep }) {
  const notes = step.details
    .map((detail) => ({ detail, kind: classifyDetail(detail) }))
    .filter((item) => item.kind !== "omit");
  if (!notes.length) return null;
  return (
    <div className="mt-2 grid gap-2">
      {notes.map(({ detail, kind }) =>
        kind === "clamp" ? (
          <p
            key={detail}
            role="note"
            className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-sm text-amber-950"
          >
            <span className="font-medium">Clamped. </span>
            {detail}
          </p>
        ) : (
          <p key={detail} className="text-sm leading-relaxed text-muted-foreground">
            {detail}
          </p>
        ),
      )}
    </div>
  );
}

function PhraseParts({ expression, normalized }: { expression: string; normalized: string }) {
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  const typed = expression.trim();
  const showTyped = typed.length > 0 && typed.toLowerCase() !== normalized;
  return (
    <div>
      <h3 className="font-medium text-muted-foreground">Read the phrase</h3>
      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Recognized parts">
        {parts.map((part, index) => (
          <li
            key={`${index}-${part}`}
            className="max-w-full break-all rounded-md bg-muted px-2 py-1 font-mono text-xs"
          >
            {part}
          </li>
        ))}
      </ul>
      {showTyped ? (
        <p className="mt-2 break-words text-sm text-muted-foreground">Typed as {typed}</p>
      ) : null}
    </div>
  );
}

export function CalculationTrace({ calculation }: { calculation: Calculation }) {
  const inputsHeadingId = useId();
  const lastIndex = calculation.ok ? calculation.steps.length - 1 : -1;
  return (
    <Disclosure className="mt-5 border-t">
      <summary className="cursor-pointer py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2">
        Show calculation steps
      </summary>
      {!calculation.ok ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {calculation.error.message} {calculation.error.hint}
        </p>
      ) : (
        <div className="mt-1 grid gap-5 pb-1 text-sm">
          <p className="text-muted-foreground">
            Each change runs in written order, from one instant to the next.
          </p>
          <PhraseParts expression={calculation.expression} normalized={calculation.normalized} />
          <ol
            className="relative ml-3 grid border-l-2 border-primary/25"
            aria-label="Calculation steps"
          >
            <li className="relative pb-5 pl-5">
              <TimelineDot current={calculation.steps.length === 0} />
              <h3 className="font-medium text-muted-foreground">Starting date</h3>
              <TimestampLine date={calculation.anchor} />
              <p className="mt-1.5 leading-relaxed">{calculation.anchorDescription}</p>
            </li>
            {calculation.steps.map((step, index) => (
              <li key={index} className="relative pb-5 pl-5 last:pb-0">
                <TimelineDot current={index === lastIndex} />
                <h3 className="font-medium">
                  {index + 1}. {step.source}
                </h3>
                <StepEndpoints step={step} />
                <StepNotes step={step} />
              </li>
            ))}
          </ol>
          {!calculation.steps.length ? (
            <p>No time changes needed. The starting date is the result.</p>
          ) : null}
          <Disclosure>
            <summary
              id={inputsHeadingId}
              className="cursor-pointer rounded-md bg-muted/50 px-3 py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2"
            >
              Calculation inputs
            </summary>
            <section aria-labelledby={inputsHeadingId} className="px-3 pb-3">
              <dl className="mt-3 grid gap-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Timezone</dt>
                  <dd className="mt-0.5 font-medium">{calculation.timezone}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Calendar day</dt>
                  <dd className="mt-0.5 leading-relaxed">
                    Follows the local clock. 24 hours is elapsed time.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Read as</dt>
                  <dd className="mt-0.5 break-words font-medium">{calculation.normalized}</dd>
                </div>
              </dl>
              <Disclosure className="mt-3">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2">
                  Exact UTC values
                </summary>
                <dl className="mt-2 grid gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Reference instant</dt>
                    <dd className="break-all font-mono">{calculation.reference}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Result in UTC</dt>
                    <dd className="break-all font-mono">{calculation.result.iso}</dd>
                  </div>
                </dl>
              </Disclosure>
            </section>
          </Disclosure>
        </div>
      )}
    </Disclosure>
  );
}
