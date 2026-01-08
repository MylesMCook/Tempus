"use client"

import * as React from "react"
import { Code } from "lucide-react"
import { DatePickerModal } from "./date-picker-modal"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { parseNaturalLanguageDate, debugDateParser } from "../lib/date-parser"
import { trackEvent } from "@/lib/analytics"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "../context/settings-context"
import { formatInTimeZone } from "date-fns-tz"
import {
  DatePickerSettings,
  DatePickerResult,
  DebugPanel,
  DebugInfo,
} from "./date-picker/index"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  onFormattedDateChange?: (formattedDate: string) => void
  className?: string
  inputValue?: string
  onInputValueChange?: (value: string) => void
}

export function DatePicker({
  date,
  onDateChange,
  onFormattedDateChange,
  className,
  inputValue: controlledInputValue,
  onInputValueChange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalInputValue, setInternalInputValue] = React.useState("")
  const isControlled = controlledInputValue !== undefined
  const inputValue = isControlled ? controlledInputValue : internalInputValue

  const setInputValue = React.useCallback((value: string) => {
    if (isControlled) {
      onInputValueChange?.(value)
    } else {
      setInternalInputValue(value)
    }
  }, [isControlled, onInputValueChange])

  const [previewDate, setPreviewDate] = React.useState<Date | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [debugMode, setDebugMode] = React.useState(false)
  const [debugInfo, setDebugInfo] = React.useState<DebugInfo | null>(null)
  const { settings } = useSettings()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [timezone, setTimezone] = React.useState<string>("")
  const [showTimeSelector, setShowTimeSelector] = React.useState(false)
  const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">("12h")

  // Initialize timezone
  React.useEffect(() => {
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezone(browserTimezone || "UTC")
    } catch {
      setTimezone("UTC")
    }
  }, [])

  // Sync with external date prop
  React.useEffect(() => {
    if (date) {
      setInputValue(date.toLocaleDateString())
      setPreviewDate(null)
    } else {
      setInputValue("")
    }
  }, [date, setInputValue])

  // Reset copied state
  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value) {
      const startTime = performance.now()
      const parsedDate = parseNaturalLanguageDate(value)
      const parseTime = performance.now() - startTime

      if (debugMode) {
        const debug = debugDateParser(value)
        const enhancedDebugInfo: DebugInfo = {
          ...debug,
          input: {
            raw: value,
            length: value.length,
            normalized: value.toLowerCase().trim(),
            timestamp: new Date().toISOString(),
          },
          performance: {
            parseTimeMs: parseTime.toFixed(2),
            timestamp: Date.now(),
          },
          environment: {
            timezone: timezone,
            browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
            preserveDayOfMonth: settings.preserveDayOfMonth,
          },
        }
        setDebugInfo(enhancedDebugInfo)
      }

      if (parsedDate) {
        setPreviewDate(parsedDate)
        trackEvent("date_parsed", { expression: value, result: parsedDate.toISOString() })
      } else {
        setPreviewDate(null)
        trackEvent("date_parse_failed", { expression: value })
      }
    } else {
      setPreviewDate(null)
      setDebugInfo(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && previewDate) {
      e.preventDefault()
      confirmDate()
    } else if (e.key === "Escape") {
      setInputValue(date ? date.toLocaleDateString() : "")
      setPreviewDate(null)
      trackEvent("date_reset")
    }
  }

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      if (previewDate) {
        newDate.setHours(previewDate.getHours())
        newDate.setMinutes(previewDate.getMinutes())
        newDate.setSeconds(previewDate.getSeconds())
      }
      setInputValue(newDate.toLocaleDateString())
      setPreviewDate(newDate)
    }
    setOpen(false)
  }

  const confirmDate = () => {
    if (previewDate) {
      const formattedDisplay = formatInTimeZone(previewDate, timezone, settings.dateFormat)
      onDateChange?.(previewDate)
      onFormattedDateChange?.(formattedDisplay)
      toast({ title: "Date confirmed", description: formattedDisplay, duration: 2000 })
      setPreviewDate(null)
      inputRef.current?.focus()
      trackEvent("date_confirmed", {
        expression: inputValue,
        result: previewDate.toISOString(),
        formatted: formattedDisplay,
        hasTimeComponent: showTimeSelector,
      })
    }
  }

  const copyDate = async () => {
    if (previewDate) {
      const formattedDate = formatInTimeZone(previewDate, timezone, settings.dateFormat)
      try {
        await navigator.clipboard.writeText(formattedDate)
        setCopied(true)
        toast({ title: "Date copied to clipboard", description: formattedDate, duration: 2000 })
        trackEvent("date_copied", { expression: inputValue, result: previewDate.toISOString() })
      } catch {
        toast({ title: "Failed to copy", description: "Please try again", variant: "destructive" })
      }
    }
  }

  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
    if (!debugMode && inputValue) {
      const debug = debugDateParser(inputValue)
      setDebugInfo(debug)
      trackEvent("debug_mode_enabled", {})
    } else {
      trackEvent("debug_mode_disabled", {})
    }
  }

  const adjustHours = (hours: number) => {
    if (!previewDate) return
    const newDate = new Date(previewDate)
    newDate.setHours(hours)
    setPreviewDate(newDate)
  }

  const adjustMinutes = (minutes: number) => {
    if (!previewDate) return
    const newDate = new Date(previewDate)
    newDate.setMinutes(minutes)
    setPreviewDate(newDate)
  }

  const adjustSeconds = (seconds: number) => {
    if (!previewDate) return
    const newDate = new Date(previewDate)
    newDate.setSeconds(seconds)
    setPreviewDate(newDate)
  }

  return (
    <div className={cn("w-full flex flex-col max-w-full", className)}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
        <div className="relative flex flex-col gap-1.5 bg-background rounded-lg p-1.5">
          {/* Input Section */}
          <div className="relative flex items-center w-full overflow-hidden rounded-md shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Try any natural date expression..."
              className="w-full h-12 px-3 text-base sm:text-lg bg-transparent border-0 outline-none ring-0 focus:ring-0 placeholder:text-muted-foreground/60"
              aria-label="Choose a date (any way you like)"
            />
            <div className="flex items-center gap-0.5 mr-1 sm:gap-1 sm:mr-2">
              <DatePickerSettings
                timezone={timezone}
                onTimezoneChange={setTimezone}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-10 sm:h-8 min-h-[44px] sm:min-h-0 border border-transparent px-3",
                        debugMode
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "hover:bg-primary/5 hover:text-primary",
                      )}
                      onClick={toggleDebugMode}
                    >
                      <Code className="size-4 mr-1 hidden sm:inline-block" />
                      <span>Debug</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle developer debug mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DatePickerModal
                date={date}
                previewDate={previewDate}
                onSelect={handleCalendarSelect}
                open={open}
                setOpen={setOpen}
              />
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground px-3 pb-1">
            <span className="hidden sm:inline">Type any date expression and press </span>
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Enter</kbd>
            <span className="hidden sm:inline"> to confirm</span>
          </p>

          {/* Result Section */}
          {previewDate && (
            <DatePickerResult
              previewDate={previewDate}
              timezone={timezone}
              dateFormat={settings.dateFormat}
              showTimeSelector={showTimeSelector}
              onToggleTimeSelector={() => setShowTimeSelector(!showTimeSelector)}
              timeFormat={timeFormat}
              onTimeFormatChange={setTimeFormat}
              onHoursChange={adjustHours}
              onMinutesChange={adjustMinutes}
              onSecondsChange={adjustSeconds}
              onDateChange={setPreviewDate}
              copied={copied}
              onCopy={copyDate}
            />
          )}

          {/* Debug Panel */}
          {debugMode && (
            <DebugPanel
              inputValue={inputValue}
              previewDate={previewDate}
              debugInfo={debugInfo}
              timezone={timezone}
              settings={{
                preserveDayOfMonth: settings.preserveDayOfMonth,
                syntaxHighlighting: settings.syntaxHighlighting,
                autoExpandSteps: settings.autoExpandSteps,
                dateFormat: settings.dateFormat,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
