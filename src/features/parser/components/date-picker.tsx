"use client";

import { useMemo } from "react";
import { Copy, RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { parseNaturalLanguageDate } from "@/shared/date-parser";
import { useSettings } from "../context/settings-context";
import { dateFormatOptions, safeFormatDate, timezoneOptions } from "../options";

interface DatePickerProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

export function DatePicker({ expression, onExpressionChange }: DatePickerProps) {
  const { settings, effectiveDateFormat, resetSettings, updateSettings } = useSettings();

  const parsedDate = useMemo(() => {
    if (!expression.trim()) {
      return null;
    }

    return parseNaturalLanguageDate(expression, {
      preserveDayOfMonth: settings.preserveDayOfMonth,
    });
  }, [expression, settings.preserveDayOfMonth]);

  const formattedDate = parsedDate
    ? safeFormatDate(parsedDate, settings.timezone, effectiveDateFormat)
    : "";

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="date-expression"
              value={expression}
              onChange={(event) => onExpressionChange(event.target.value)}
              placeholder="next friday, 2 weeks after may 1, 1.5 days from now"
              className="h-11 text-base"
            />

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline">
                    <Settings2 data-icon="inline-start" />
                    Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="flex w-80 flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold">Parser settings</h2>
                    <p className="text-sm text-muted-foreground">
                      These settings affect both the local preview and the API playground.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => updateSettings({ timezone: value })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Choose a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date-format">Date format</Label>
                    <Select
                      value={settings.isCustomFormat ? "custom" : settings.dateFormat}
                      onValueChange={(value) =>
                        updateSettings({
                          dateFormat: value === "custom" ? settings.dateFormat : value,
                          isCustomFormat: value === "custom",
                        })
                      }
                    >
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Choose a format" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {settings.isCustomFormat ? (
                      <Input
                        value={settings.customFormat}
                        onChange={(event) => updateSettings({ customFormat: event.target.value })}
                        placeholder="yyyy-MM-dd HH:mm"
                      />
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="preserve-day">Preserve day of month</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep the same day number when adding months where possible.
                      </p>
                    </div>
                    <Switch
                      id="preserve-day"
                      checked={settings.preserveDayOfMonth}
                      onCheckedChange={(checked) => updateSettings({ preserveDayOfMonth: checked })}
                    />
                  </div>

                  <Button type="button" variant="ghost" onClick={resetSettings}>
                    <RotateCcw data-icon="inline-start" />
                    Reset settings
                  </Button>
                </PopoverContent>
              </Popover>

              <Button
                type="button"
                variant="outline"
                onClick={() => onExpressionChange("")}
                disabled={!expression}
              >
                Clear
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            The preview updates as you type and uses the same settings the Worker playground will
            send to
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5">/api/parse</code>.
          </p>
        </CardContent>
      </Card>

      {expression.trim() && !parsedDate ? (
        <Alert variant="destructive">
          <AlertTitle>Could not parse that expression</AlertTitle>
          <AlertDescription>Try one of the examples below or simplify the phrase.</AlertDescription>
        </Alert>
      ) : null}

      {parsedDate ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is the local parser result before you hit the API.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{settings.timezone}</Badge>
              <Badge variant={settings.preserveDayOfMonth ? "default" : "outline"}>
                preserveDayOfMonth={String(settings.preserveDayOfMonth)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Formatted
                </span>
                <p className="text-sm font-medium break-words">{formattedDate}</p>
              </div>

              <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  ISO
                </span>
                <code className="text-sm break-all">{parsedDate.toISOString()}</code>
              </div>

              <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Timestamp
                </span>
                <code className="text-sm break-all">{parsedDate.getTime()}</code>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(formattedDate, "Formatted date")}
              >
                <Copy data-icon="inline-start" />
                Copy formatted
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(parsedDate.toISOString(), "ISO date")}
              >
                <Copy data-icon="inline-start" />
                Copy ISO
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
