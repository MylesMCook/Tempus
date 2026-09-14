import type { Calculation, DateSnapshot } from "@/shared/date-parser";

function timestamp(date: DateSnapshot) {
  return `${date.local.replace("T", " ").replace(/\.000$/, "")} ${date.offset}`;
}

export function CalculationTrace({ calculation }: { calculation: Calculation }) {
  return (
    <details open className="mt-5 border-t">
      <summary className="cursor-pointer py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2">
        Show calculation steps
      </summary>
      {!calculation.ok ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {calculation.error.message} {calculation.error.hint}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 text-sm">
          <p className="text-muted-foreground">
            Start with the date below, then apply each change in order.
          </p>
          <ol className="grid gap-4" aria-label="Calculation steps">
            <li className="border-l-2 pl-3">
              <h3 className="font-medium">Starting date</h3>
              <p className="mt-1 text-muted-foreground">{calculation.anchorDescription}</p>
              <p className="mt-1 break-words font-mono text-xs sm:text-sm">
                {timestamp(calculation.anchor)}
              </p>
            </li>
            {calculation.steps.map((step, index) => (
              <li key={index} className="border-l-2 pl-3">
                <h3 className="font-medium">
                  {index + 1}. {step.source}
                </h3>
                <dl className="mt-2 grid gap-1 font-mono text-xs sm:text-sm">
                  <div>
                    <dt className="inline text-muted-foreground">From </dt>
                    <dd className="inline break-words">{timestamp(step.before)}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">To </dt>
                    <dd className="inline break-words">{timestamp(step.after)}</dd>
                  </div>
                </dl>
                {step.details.map((detail) => (
                  <p key={detail} className="mt-1 text-muted-foreground">
                    {detail}
                  </p>
                ))}
              </li>
            ))}
          </ol>
          {!calculation.steps.length ? (
            <p>No time changes needed. The starting date is the result.</p>
          ) : null}
          <p className="text-muted-foreground">
            All calendar dates use {calculation.timezone}. A calendar day follows the local clock;
            24 hours is always 24 elapsed hours.
          </p>
          <details className="border-t pt-3">
            <summary className="cursor-pointer focus-visible:outline focus-visible:outline-2">
              Calculation inputs
            </summary>
            <dl className="mt-3 grid gap-2">
              <div>
                <dt className="text-muted-foreground">Read as</dt>
                <dd className="break-words font-mono">{calculation.normalized}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reference instant</dt>
                <dd className="break-all font-mono">{calculation.reference}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Result in UTC</dt>
                <dd className="break-all font-mono">{calculation.result.iso}</dd>
              </div>
            </dl>
          </details>
        </div>
      )}
    </details>
  );
}
