import { useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Calculation } from "@/shared/date-parser";
import { useSettings } from "../context/settings-context";
import { dateFormatOptions, safeFormatDate, timezoneOptions } from "../options";
import { CalculationTrace } from "./calculation-trace";
import { DateExpressionTabs } from "./date-expression-tabs";
import { ApiDocs } from "./api-docs";
import { examples } from "../examples";

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

function CopyDate({ value }: { value: string | null }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      className="h-12 w-full sm:w-auto sm:min-w-40"
      disabled={value === null}
      onClick={async () => {
        if (value !== null) setCopied(await copy(value, "Date", false));
      }}
    >
      {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
      {copied ? "Date copied" : "Copy date"}
    </Button>
  );
}

export function DatePicker({
  expression,
  onExpressionChange,
  calculation,
  reference,
  onRefresh,
}: {
  expression: string;
  onExpressionChange: (value: string) => void;
  calculation: Calculation;
  reference: string;
  onRefresh: () => void;
}) {
  const { settings, settingsSaved, effectiveDateFormat, updateSettings, resetSettings } =
    useSettings();
  const formatted = calculation.ok
    ? safeFormatDate(new Date(calculation.result.timestamp), settings.timezone, effectiveDateFormat)
    : null;
  const clock =
    safeFormatDate(new Date(reference), settings.timezone, "MMM d, yyyy HH:mm:ss zzz") ?? reference;
  return (
    <div className="grid gap-4">
      <section aria-label="Date calculator" className="rounded-xl border bg-background p-4 sm:p-6">
        <Label htmlFor="date-expression" className="text-base font-semibold">
          Type a phrase
        </Label>
        <Input
          id="date-expression"
          aria-describedby={
            expression.trim() && !calculation.ok ? "phrase-help calculation-error" : "phrase-help"
          }
          aria-invalid={Boolean(
            expression.trim() && !calculation.ok && calculation.error.code !== "timezone",
          )}
          value={expression}
          onChange={(event) => onExpressionChange(event.target.value)}
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. in 3 weeks"
          className="mt-3 h-12 text-base"
        />
        <div className="mt-2 flex min-h-10 items-center justify-between gap-2 text-sm text-muted-foreground">
          <p id="phrase-help">Your date updates as you type.</p>
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
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Try a phrase">
          {["tomorrow", "in 3 weeks", "3 weeks ago"].map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              className="min-h-11 font-normal"
              onClick={() => onExpressionChange(phrase)}
            >
              {phrase}
            </Button>
          ))}
        </div>
        <details className="mt-3 border-t pt-1">
          <summary className="cursor-pointer py-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2">
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
        </details>
      </section>

      <div className="rounded-xl border bg-background p-4 sm:p-6">
        {!expression.trim() ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Your date will appear here.
          </div>
        ) : !calculation.ok ? (
          <section
            id="calculation-error"
            tabIndex={-1}
            role="alert"
            className="rounded-md border border-destructive/40 p-3"
          >
            <h2 className="font-semibold text-destructive">{calculation.error.message}</h2>
            <p className="mt-2 text-sm">{calculation.error.hint}</p>
            {calculation.error.span && calculation.error.span.end > calculation.error.span.start ? (
              <p className="mt-2 break-words text-sm text-muted-foreground">
                Check:{" "}
                <code>
                  {expression.slice(calculation.error.span.start, calculation.error.span.end)}
                </code>
              </p>
            ) : null}
            {calculation.error.code === "timezone" ? (
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => updateSettings({ timezone: "UTC" })}
              >
                Use UTC
              </Button>
            ) : null}
          </section>
        ) : (
          <section id="calculated-date" tabIndex={-1} aria-label="Calculated date" className="pb-1">
            <h2 className="text-sm font-medium text-emerald-800">
              {formatted === null ? "Date calculated" : "Your date is ready"}
            </h2>
            <div role="status" aria-live="polite" aria-atomic="true" className="mt-2">
              <p
                className={`break-words text-2xl font-semibold tracking-tight sm:text-3xl ${formatted === null ? "text-destructive" : ""}`}
              >
                {formatted ?? "Choose a valid date format."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {calculation.timezone} ·{" "}
                {safeFormatDate(
                  new Date(calculation.result.timestamp),
                  calculation.timezone,
                  "h:mm a zzz",
                )}
              </p>
            </div>
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
                value={formatted}
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
        )}

        {expression.trim() ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 text-xs text-muted-foreground">
            <span>Time stays fixed until you edit or refresh.</span>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RotateCcw className="mr-1 size-3" />
              Refresh now
            </Button>
          </div>
        ) : null}

        <details className="mt-3 border-t">
          <summary className="cursor-pointer py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2">
            Change timezone or format
          </summary>
          {!expression.trim() ? (
            <p className="break-words text-xs text-muted-foreground">Using {settings.timezone}</p>
          ) : null}
          <div className="grid gap-4 pb-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="calculation-timezone" className="text-base">
                Timezone
              </Label>
              <Input
                id="calculation-timezone"
                list="timezone-options"
                value={settings.timezone}
                onChange={(event) => updateSettings({ timezone: event.target.value })}
                maxLength={64}
                aria-describedby={
                  !calculation.ok && calculation.error.code === "timezone"
                    ? "timezone-help calculation-error"
                    : "timezone-help"
                }
                aria-invalid={!calculation.ok && calculation.error.code === "timezone"}
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
              <Label htmlFor="date-format">Display format</Label>
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
                  aria-invalid={calculation.ok && formatted === null}
                  aria-describedby="format-help"
                  onChange={(event) => updateSettings({ customFormat: event.target.value })}
                />
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
              <Button variant="ghost" size="sm" onClick={resetSettings}>
                Reset preferences
              </Button>
            </div>
          </div>
        </details>
        {expression.trim() && calculation.ok ? (
          <CalculationTrace calculation={calculation} />
        ) : null}
      </div>
      <details className="px-1 text-sm">
        <summary className="cursor-pointer py-3 text-muted-foreground focus-visible:outline focus-visible:outline-2">
          Developer tools
        </summary>
        <div className="mt-1 grid min-w-0 gap-5 rounded-xl border bg-background p-4 sm:p-5">
          {expression.trim() ? (
            <section aria-label="Calculation details" className="min-w-0">
              <h2 className="font-semibold">Calculation details</h2>
              <p className="mt-4 break-words text-muted-foreground">
                Calculated from <time dateTime={reference}>{clock}</time>.
              </p>
              {calculation.ok ? (
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
                        calculation,
                      },
                      null,
                      2,
                    ),
                    "Calculation details",
                  )
                }
              >
                Copy calculation details
              </Button>
            </section>
          ) : null}
          <section aria-label="API replay" className="grid min-w-0 gap-3">
            <h2 className="font-semibold">API replay</h2>
            <ApiDocs expression={expression} reference={reference} calculation={calculation} />
          </section>
        </div>
      </details>
    </div>
  );
}
