"use client"

import * as React from "react"
import { Clock, Copy, CheckCircle2, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatInTimeZone } from "date-fns-tz"
import { TimeSelector } from "./TimeSelector"
import { formatTime } from "./utils"

interface DatePickerResultProps {
  previewDate: Date
  timezone: string
  dateFormat: string
  showTimeSelector: boolean
  onToggleTimeSelector: () => void
  timeFormat: "12h" | "24h"
  onTimeFormatChange: (format: "12h" | "24h") => void
  onHoursChange: (hours: number) => void
  onMinutesChange: (minutes: number) => void
  onSecondsChange: (seconds: number) => void
  onDateChange: (date: Date) => void
  copied: boolean
  onCopy: () => void
}

export function DatePickerResult({
  previewDate,
  timezone,
  dateFormat,
  showTimeSelector,
  onToggleTimeSelector,
  timeFormat,
  onTimeFormatChange,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  onDateChange,
  copied,
  onCopy,
}: DatePickerResultProps) {
  const formattedDate = formatInTimeZone(previewDate, timezone, dateFormat)
  const formattedTime = formatTime(previewDate, timeFormat)

  return (
    <div
      className="flex flex-col gap-3 px-3 sm:px-4 py-3 bg-muted/50 rounded-md"
      role="status"
      aria-live="polite"
      aria-label={`Parsed date: ${formattedDate}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-4" />
            <span className="text-sm font-medium">Result:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">
              {formattedDate}
              {showTimeSelector && <span className="ml-2 text-primary">{formattedTime}</span>}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 min-h-[44px] sm:min-h-0 px-3 text-xs border shadow-sm transition-colors flex-1 sm:flex-none",
                    showTimeSelector
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "hover:border-primary/50 hover:bg-primary/5",
                  )}
                  onClick={onToggleTimeSelector}
                >
                  <CalendarClock className="size-3 mr-1" />
                  {showTimeSelector ? "Hide Time" : "Set Time"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showTimeSelector ? "Hide time selector" : "Show time selector to adjust hours, minutes, and seconds"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={copied ? "outline" : "default"}
                  className={cn(
                    "h-8 min-h-[44px] sm:min-h-0 px-3 text-xs transition-all shadow-sm flex-1 sm:flex-none",
                    copied
                      ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                      : "",
                  )}
                  onClick={onCopy}
                >
                  {copied ? <CheckCircle2 className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
                  {copied ? "Copied!" : "Copy Date"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Date copied to clipboard" : "Copy formatted date to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {showTimeSelector && (
        <TimeSelector
          previewDate={previewDate}
          timeFormat={timeFormat}
          onTimeFormatChange={onTimeFormatChange}
          onHoursChange={onHoursChange}
          onMinutesChange={onMinutesChange}
          onSecondsChange={onSecondsChange}
          onDateChange={onDateChange}
          formatTime={(date) => formatTime(date, timeFormat)}
        />
      )}
    </div>
  )
}
