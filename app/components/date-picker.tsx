// TODO: Issue #7 - This component is 1274 lines and needs refactoring
// Split into smaller, focused components:
// - DatePickerInput: Input field and basic preview
// - TimeSelector: Time adjustment sliders
// - DebugPanel: The entire debug mode interface (5 collapsible sections)
// - DatePickerSettings: The settings popover
// This will improve maintainability, testability, and reasoning about state flow.

"use client"

import * as React from "react"
import {
  Check,
  Clock,
  Copy,
  CheckCircle2,
  Code,
  ChevronDown,
  ChevronUp,
  Settings,
  RotateCcw,
  Clock3,
  CalendarClock,
} from "lucide-react"

// Update the import for DatePickerModal to ensure we're using the enhanced version
import { DatePickerModal } from "./date-picker-modal"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { parseNaturalLanguageDate, debugDateParser } from "../lib/date-parser"
import { trackEvent } from "@/lib/analytics"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useSettings } from "../context/settings-context"
import { formatInTimeZone } from "date-fns-tz"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  onFormattedDateChange?: (formattedDate: string) => void
  className?: string
}

interface DateParserSettings {
  dateFormat: string
  showWeekday: boolean
  autoExpandSteps: boolean
  syntaxHighlighting: boolean
  preserveDayOfMonth: boolean
}

const DEFAULT_SETTINGS: DateParserSettings = {
  dateFormat: "EEEE, MMMM d, yyyy",
  showWeekday: true,
  autoExpandSteps: true,
  syntaxHighlighting: true,
  preserveDayOfMonth: true,
}

// Replace the entire THEME_COLORS object with these direct variables
const lightBg = "bg-gray-50 border-gray-200 text-gray-800"
const darkBg = "dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-200"
const badgeStyle = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
const stepStyle = "bg-gray-200 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
const preStyle = "bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200"
const highlightStyle = "text-gray-700 dark:text-gray-300"
const buttonStyle = "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400"

// Function to format JSON with syntax highlighting
function formatJSON(json: any, syntaxHighlighting: boolean): React.ReactNode {
  if (!syntaxHighlighting) {
    return JSON.stringify(json, null, 2)
  }

  // Convert the JSON to a string with proper indentation
  const jsonString = JSON.stringify(
    json,
    (key, value) => {
      // Format Date objects specially
      if (value instanceof Date) {
        return {
          _isDate: true,
          iso: value.toISOString(),
          local: value.toString(),
          timestamp: value.getTime(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      }
      return value
    },
    2,
  )

  // Replace key-value pairs with styled spans
  return (
    <pre className="syntax-highlight">
      {jsonString.split("\n").map((line, i) => {
        // Match keys and values
        const keyMatch = line.match(/^(\s*)(".*?"):/)
        const valueMatch = line.match(/:\s*(.*?)$/)

        if (keyMatch && valueMatch) {
          const [, spaces, key] = keyMatch
          const value = valueMatch[1]

          return (
            <div key={i}>
              {spaces}
              <span className="json-key">{key}</span>:
              {value.includes('"') ? (
                <span className="json-string">{value}</span>
              ) : value.match(/^-?\d+(\.\d+)?$/) ? (
                <span className="json-number">{value}</span>
              ) : (
                <span>{value}</span>
              )}
            </div>
          )
        }

        return <div key={i}>{line}</div>
      })}
    </pre>
  )
}

export function DatePicker({ date, onDateChange, onFormattedDateChange, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [previewDate, setPreviewDate] = React.useState<Date | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [debugMode, setDebugMode] = React.useState(false)
  const [debugOpen, setDebugOpen] = React.useState(true)
  const [debugInfo, setDebugInfo] = React.useState<any>(null)
  const [activeStep, setActiveStep] = React.useState<string | null>(null)
  const { settings, updateSettings, resetSettings } = useSettings()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [timezone, setTimezone] = React.useState<string>("")
  const [showTimeSelector, setShowTimeSelector] = React.useState(false)
  const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">("12h")

  const formatTime = (date: Date | null): string => {
    if (!date) return "--:--:--"

    if (timeFormat === "12h") {
      const hours = date.getHours() % 12 || 12
      const ampm = date.getHours() >= 12 ? "PM" : "AM"
      return `${hours}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")} ${ampm}`
    } else {
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
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

  React.useEffect(() => {
    if (date) {
      setInputValue(date.toLocaleDateString())
      setPreviewDate(null)
    } else {
      setInputValue("")
    }
  }, [date])

  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  React.useEffect(() => {
    // Detect browser timezone on component mount
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezone(browserTimezone || "UTC")
    } catch (e) {
      console.error("Failed to detect timezone:", e)
      setTimezone("UTC")
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value) {
      const startTime = performance.now()
      const parsedDate = parseNaturalLanguageDate(value)
      const parseTime = performance.now() - startTime

      // Get debug info if debug mode is enabled
      if (debugMode) {
        const debug = debugDateParser(value)

        // Enhance debug info with additional metadata
        const enhancedDebugInfo = {
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

        // Auto-expand steps if enabled
        if (settings.autoExpandSteps) {
          setActiveStep(null) // Show all steps
        }
      }

      if (parsedDate) {
        setPreviewDate(parsedDate)
        // Track successful parse
        trackEvent("date_parsed", {
          expression: value,
          result: parsedDate.toISOString(),
        })
      } else {
        setPreviewDate(null)
        // Track failed parse
        trackEvent("date_parse_failed", {
          expression: value,
        })
      }
    } else {
      setPreviewDate(null)
      setDebugInfo(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && previewDate) {
      e.preventDefault()
      onDateChange?.(previewDate)
      setPreviewDate(null)
      // Track date confirmation
      trackEvent("date_confirmed", {
        expression: inputValue,
        result: previewDate.toISOString(),
      })
    } else if (e.key === "Escape") {
      setInputValue(date ? date.toLocaleDateString() : "")
      setPreviewDate(null)
      // Track date reset
      trackEvent("date_reset")
    }
  }

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Preserve time from previous date if it exists
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

  // Add this function after the handleCalendarSelect function
  const getFormattedDate = (date: Date): string => {
    return formatInTimeZone(date, timezone, settings.dateFormat)
  }

  const confirmDate = () => {
    if (previewDate) {
      // Create a formatted representation for display
      const formattedDisplay = formatInTimeZone(previewDate, timezone, settings.dateFormat)

      // Pass both the Date object and formatted string to parent
      onDateChange?.(previewDate)
      onFormattedDateChange?.(formattedDisplay)

      // Show a toast with the formatted date
      toast({
        title: "Date confirmed",
        description: formattedDisplay,
        duration: 2000,
      })

      setPreviewDate(null)
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

        // Show toast notification
        toast({
          title: "Date copied to clipboard",
          description: formattedDate,
          duration: 2000,
        })

        // Track copy event
        trackEvent("date_copied", {
          expression: inputValue,
          result: previewDate.toISOString(),
        })
      } catch (err) {
        console.error("Failed to copy date: ", err)
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        })
      }
    }
  }

  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
    if (!debugMode) {
      setDebugOpen(true)
      // Get debug info for current input
      if (inputValue) {
        const debug = debugDateParser(inputValue)
        setDebugInfo(debug)
      }
      trackEvent("debug_mode_enabled", {})
    } else {
      setDebugOpen(false)
      trackEvent("debug_mode_disabled", {})
    }
  }

  const toggleStep = (step: string) => {
    if (activeStep === step) {
      setActiveStep(null)
    } else {
      setActiveStep(step)
    }
  }

  const isStepActive = (step: string) => {
    return activeStep === null || activeStep === step
  }

  return (
    <div className={cn("w-full flex flex-col max-w-full", className)}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
        <div className="relative flex flex-col gap-1.5 bg-background rounded-lg p-1.5">
          {/* Update the DatePicker to improve mobile UI */}
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Settings className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <div className="p-4 pb-2 border-b">
                          <h3 className="font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Date Parser Settings
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Customize how dates are parsed and displayed
                          </p>
                        </div>

                        <div className="p-4 space-y-4">
                          {/* Timezone Section */}
                          <div className="space-y-2">
                            <Label htmlFor="timezone-select" className="text-sm font-medium">
                              Timezone
                            </Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                              <SelectTrigger id="timezone-select" className="h-8 text-sm">
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                                  Browser Default ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                                </SelectItem>
                                <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                                <SelectItem value="Europe/Paris">Central European (CET/CEST)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                                <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Timezone used for displaying dates. API uses UTC by default.
                            </p>
                          </div>

                          {/* Date Format Section */}
                          <div className="space-y-2">
                            <Label htmlFor="date-format" className="text-sm font-medium">
                              Date Format
                            </Label>
                            {!settings.isCustomFormat ? (
                              <Select
                                value={settings.dateFormat}
                                onValueChange={(value) => {
                                  if (value === "custom") {
                                    updateSettings({
                                      isCustomFormat: true,
                                      customFormat: settings.dateFormat,
                                    })
                                  } else {
                                    updateSettings({
                                      dateFormat: value,
                                      isCustomFormat: false,
                                    })
                                  }
                                }}
                              >
                                <SelectTrigger id="date-format" className="h-8 text-sm">
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EEEE, MMMM d, yyyy">Tuesday, April 15, 2025</SelectItem>
                                  <SelectItem value="MMM d, yyyy">Apr 15, 2025</SelectItem>
                                  <SelectItem value="MM/dd/yyyy">04/15/2025</SelectItem>
                                  <SelectItem value="yyyy-MM-dd">2025-04-15</SelectItem>
                                  <SelectItem value="d MMMM yyyy">15 April 2025</SelectItem>
                                  <SelectItem value="yyyy-MM-dd HH:mm:ss">2025-04-15 14:30:00</SelectItem>
                                  <SelectItem value="custom">Custom format...</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    value={settings.customFormat}
                                    onChange={(e) =>
                                      updateSettings({ customFormat: e.target.value, dateFormat: e.target.value })
                                    }
                                    placeholder="e.g., yyyy-MM-dd HH:mm"
                                    className="h-8 text-sm"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateSettings({ isCustomFormat: false })}
                                    className="h-8 w-8 hover:bg-primary/5 hover:border-primary/50"
                                    title="Back to presets"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span>Format tokens:</span>
                                  <Badge variant="outline" className="font-mono text-[10px] h-4">
                                    yyyy
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-[10px] h-4">
                                    MM
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-[10px] h-4">
                                    dd
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-[10px] h-4">
                                    HH
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-[10px] h-4">
                                    mm
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-[10px] h-4">
                                    ss
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Parser Behavior Section */}
                          <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-sm font-medium">Parser Behavior</h4>

                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="preserve-day" className="text-sm">
                                  Preserve Day of Month
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Keep the same day when adding months/years
                                </p>
                              </div>
                              <Switch
                                id="preserve-day"
                                checked={settings.preserveDayOfMonth}
                                onCheckedChange={(checked) => updateSettings({ preserveDayOfMonth: checked })}
                              />
                            </div>
                          </div>

                          {/* Debug Options Section */}
                          <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-sm font-medium">Debug Options</h4>

                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="syntax-highlighting" className="text-sm">
                                  Syntax Highlighting
                                </Label>
                                <p className="text-xs text-muted-foreground">Colorize JSON in debug output</p>
                              </div>
                              <Switch
                                id="syntax-highlighting"
                                checked={settings.syntaxHighlighting}
                                onCheckedChange={(checked) => updateSettings({ syntaxHighlighting: checked })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="auto-expand" className="text-sm">
                                  Auto-expand Steps
                                </Label>
                                <p className="text-xs text-muted-foreground">Automatically expand all debug steps</p>
                              </div>
                              <Switch
                                id="auto-expand"
                                checked={settings.autoExpandSteps}
                                onCheckedChange={(checked) => updateSettings({ autoExpandSteps: checked })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-muted/50 flex items-center justify-between border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetSettings}
                            className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Reset to Defaults
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs bg-primary hover:bg-primary/90"
                            onClick={() => {
                              toast({
                                title: "Settings saved",
                                description: "Your preferences have been applied",
                                duration: 2000,
                              })
                            }}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open parser settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 border border-transparent px-3",
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

          {previewDate && (
            <div className="flex flex-col gap-3 px-3 sm:px-4 py-3 bg-muted/50 rounded-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-4" />
                    <span className="text-sm font-medium">Result:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">
                      {formatInTimeZone(previewDate, timezone, settings.dateFormat)}
                      {showTimeSelector && <span className="ml-2 text-primary">{formatTime(previewDate)}</span>}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-8 px-3 text-xs border shadow-sm transition-colors flex-1 sm:flex-none",
                      showTimeSelector
                        ? "bg-primary/10 border-primary/50 text-primary"
                        : "hover:border-primary/50 hover:bg-primary/5",
                    )}
                    onClick={() => setShowTimeSelector(!showTimeSelector)}
                  >
                    <CalendarClock className="size-3 mr-1" />
                    {showTimeSelector ? "Hide Time" : "Set Time"}
                  </Button>

                  <Button
                    size="sm"
                    variant={copied ? "outline" : "default"}
                    className={cn(
                      "h-8 px-3 text-xs transition-all shadow-sm flex-1 sm:flex-none",
                      copied
                        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                        : "",
                    )}
                    onClick={copyDate}
                  >
                    {copied ? <CheckCircle2 className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
                    {copied ? "Copied!" : "Copy Date"}
                  </Button>
                </div>
              </div>

              {showTimeSelector && (
                <div className="border-t pt-3 mt-1 overflow-x-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      Time
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-primary">{formatTime(previewDate)}</span>
                      <Tabs value={timeFormat} onValueChange={(v) => setTimeFormat(v as "12h" | "24h")} className="h-7">
                        <TabsList className="h-6 p-0">
                          <TabsTrigger value="12h" className="text-xs px-2 h-6">
                            12h
                          </TabsTrigger>
                          <TabsTrigger value="24h" className="text-xs px-2 h-6">
                            24h
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">
                          Hours: {timeFormat === "12h" ? previewDate.getHours() % 12 || 12 : previewDate.getHours()}
                        </Label>
                        <span className="text-xs text-muted-foreground">{timeFormat === "12h" ? "1-12" : "0-23"}</span>
                      </div>
                      <Slider
                        value={[timeFormat === "12h" ? previewDate.getHours() % 12 || 12 : previewDate.getHours()]}
                        min={timeFormat === "12h" ? 1 : 0}
                        max={timeFormat === "12h" ? 12 : 23}
                        step={1}
                        onValueChange={(value) => {
                          if (timeFormat === "12h") {
                            // Preserve AM/PM when adjusting hours in 12h mode
                            const isCurrentlyPM = previewDate.getHours() >= 12
                            const newHour = value[0] + (isCurrentlyPM ? 12 : 0)
                            adjustHours(newHour % 24)
                          } else {
                            adjustHours(value[0])
                          }
                        }}
                        className="py-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Minutes: {previewDate.getMinutes()}</Label>
                        <span className="text-xs text-muted-foreground">0-59</span>
                      </div>
                      <Slider
                        value={[previewDate.getMinutes()]}
                        min={0}
                        max={59}
                        step={1}
                        onValueChange={(value) => adjustMinutes(value[0])}
                        className="py-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Seconds: {previewDate.getSeconds()}</Label>
                        <span className="text-xs text-muted-foreground">0-59</span>
                      </div>
                      <Slider
                        value={[previewDate.getSeconds()]}
                        min={0}
                        max={59}
                        step={1}
                        onValueChange={(value) => adjustSeconds(value[0])}
                        className="py-1"
                      />
                    </div>

                    {timeFormat === "12h" && (
                      <div className="flex justify-end mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            "h-7 text-xs",
                            previewDate.getHours() >= 12
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "hover:bg-primary/5 hover:border-primary/50",
                          )}
                          onClick={() => {
                            const newDate = new Date(previewDate)
                            const currentHours = newDate.getHours()
                            newDate.setHours((currentHours + 12) % 24)
                            setPreviewDate(newDate)
                          }}
                        >
                          {previewDate.getHours() >= 12 ? "PM" : "AM"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {debugMode && (
            <div className={cn("px-4 py-3 rounded-md border", lightBg, darkBg)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(badgeStyle)}>
                    Developer Mode
                  </Badge>
                  <span className={cn("text-sm font-medium", highlightStyle)}>Date Parsing Debug Information</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs shadow-sm hover:bg-primary/5 hover:border-primary/50"
                    onClick={() => {
                      if (debugInfo) {
                        // Create a more comprehensive debug report
                        const debugReport = {
                          version: "1.0",
                          timestamp: new Date().toISOString(),
                          input: inputValue,
                          result: previewDate ? previewDate.toISOString() : null,
                          settings: {
                            ...settings,
                            timezone,
                            browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            locale: navigator.language,
                          },
                          debugData: debugInfo,
                          environment: {
                            userAgent: navigator.userAgent,
                            language: navigator.language,
                            platform: navigator.platform,
                            screenSize: `${window.innerWidth}x${window.innerHeight}`,
                          },
                        }

                        navigator.clipboard.writeText(JSON.stringify(debugReport, null, 2))
                        toast({
                          title: "Complete debug data copied",
                          description: "Comprehensive debug information copied to clipboard",
                          duration: 2000,
                        })
                      }
                    }}
                    disabled={!debugInfo}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Debug Report
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-full"
                    onClick={() => setDebugOpen(!debugOpen)}
                  >
                    {debugOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {debugOpen && (
                <div className="mt-3 space-y-4">
                  {/* Debug Summary */}
                  <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                    <h4 className="text-sm font-medium mb-2">Debug Summary</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="font-medium">Input:</span> {inputValue || "<empty>"}
                      </div>
                      <div>
                        <span className="font-medium">Parse Status:</span> {previewDate ? "Success" : "Failed/Pending"}
                      </div>
                      <div>
                        <span className="font-medium">Timezone:</span> {timezone}
                      </div>
                      <div>
                        <span className="font-medium">Preserve Day:</span> {settings.preserveDayOfMonth ? "Yes" : "No"}
                      </div>
                      {debugInfo?.performance && (
                        <div>
                          <span className="font-medium">Parse Time:</span> {debugInfo.performance.parseTimeMs}ms
                        </div>
                      )}
                      {previewDate && (
                        <div>
                          <span className="font-medium">Result:</span> {previewDate.toISOString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Analysis */}
                  <div className="space-y-1 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Input
                      </Badge>
                      <h4 className="font-medium">Raw Expression Analysis</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Expression</p>
                        <code className={cn("block p-2 rounded text-xs font-mono", preStyle)}>
                          {inputValue || "<empty>"}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Character Length</p>
                        <code className={cn("block p-2 rounded text-xs font-mono", preStyle)}>
                          {inputValue ? inputValue.length : 0} characters
                        </code>
                      </div>
                    </div>
                  </div>

                  {debugInfo ? (
                    <>
                      {/* Step 1: Tokenization */}
                      <div className="space-y-1">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => toggleStep("tokenization")}
                        >
                          <Badge className={cn(stepStyle)}>Step 1</Badge>
                          <h4 className="font-medium">Tokenization</h4>
                          {activeStep !== null &&
                            (activeStep === "tokenization" ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            ))}
                        </div>
                        <p className={cn("text-sm", highlightStyle)}>Breaking "{inputValue}" into tokens</p>
                        {isStepActive("tokenization") && (
                          <>
                            <div className={cn("mt-1 p-2 rounded text-xs font-mono overflow-x-auto", preStyle)}>
                              {formatJSON(debugInfo.tokens, settings.syntaxHighlighting)}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Token Count:</span> {debugInfo.tokens?.length || 0} tokens
                            </div>
                          </>
                        )}
                      </div>

                      {/* Token Analysis - Visual Representation */}
                      {debugInfo?.tokens && debugInfo.tokens.length > 0 && isStepActive("tokenization") && (
                        <div className="mt-3 border-t border-border pt-3">
                          <h5 className="text-xs font-medium mb-2">Token Visualization</h5>
                          <div className="flex flex-wrap gap-1">
                            {debugInfo.tokens.map((token: any, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className={cn(
                                  "font-mono text-xs",
                                  token.type === "number" &&
                                    "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
                                  token.type === "unit" &&
                                    "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",
                                  token.type === "modifier" &&
                                    "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
                                  token.type === "weekday" &&
                                    "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
                                  token.type === "month" &&
                                    "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800",
                                )}
                              >
                                <span className="opacity-70">{token.type}:</span> {token.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Base Date Identification */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStep("baseDate")}>
                          <Badge className={cn(stepStyle)}>Step 2</Badge>
                          <h4 className="font-medium">Base Date Identification</h4>
                          {activeStep !== null &&
                            (activeStep === "baseDate" ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            ))}
                        </div>
                        <p className={cn("text-sm", highlightStyle)}>Determining the reference date</p>
                        {isStepActive("baseDate") && (
                          <>
                            <div className={cn("mt-1 p-2 rounded text-xs font-mono overflow-x-auto", preStyle)}>
                              {debugInfo.baseDate ? debugInfo.baseDate.toISOString() : "No base date identified"}
                            </div>
                            {debugInfo.baseDate && (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium">Local Format:</span>{" "}
                                  {debugInfo.baseDate.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">Day of Week:</span>{" "}
                                  {new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(debugInfo.baseDate)}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Step 3: Time Operations */}
                      <div className="space-y-1">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => toggleStep("operations")}
                        >
                          <Badge className={cn(stepStyle)}>Step 3</Badge>
                          <h4 className="font-medium">Time Operations</h4>
                          {activeStep !== null &&
                            (activeStep === "operations" ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            ))}
                        </div>
                        <p className={cn("text-sm", highlightStyle)}>Calculating time adjustments</p>
                        {isStepActive("operations") && (
                          <>
                            <div className={cn("mt-1 p-2 rounded text-xs font-mono overflow-x-auto", preStyle)}>
                              {formatJSON(debugInfo.operations, settings.syntaxHighlighting)}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Operation Count:</span> {debugInfo.operations?.length || 0}{" "}
                              operations
                              {debugInfo.operations?.length > 0 && (
                                <ul className="mt-1 space-y-1 pl-4 list-disc">
                                  {debugInfo.operations.map((op: any, i: number) => (
                                    <li key={i}>
                                      {op.direction > 0 ? "Add" : "Subtract"} {op.amount} {op.unit}
                                      {op.amount !== 1 && op.unit !== "month" ? "s" : ""}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Step 4: Final Calculation */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStep("result")}>
                          <Badge className={cn(stepStyle)}>Step 4</Badge>
                          <h4 className="font-medium">Final Calculation</h4>
                          {activeStep !== null &&
                            (activeStep === "result" ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            ))}
                        </div>
                        <p className={cn("text-sm", highlightStyle)}>Applying operations to base date</p>
                        {isStepActive("result") && (
                          <>
                            <div className={cn("mt-1 p-2 rounded text-xs font-mono overflow-x-auto", preStyle)}>
                              {debugInfo.result ? debugInfo.result.toISOString() : "No result"}
                            </div>
                            {debugInfo.result && (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium">Local Format:</span> {debugInfo.result.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">Unix Timestamp:</span>{" "}
                                  {Math.floor(debugInfo.result.getTime() / 1000)}
                                </div>
                                <div>
                                  <span className="font-medium">Day of Week:</span>{" "}
                                  {new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(debugInfo.result)}
                                </div>
                                <div>
                                  <span className="font-medium">Day of Year:</span>{" "}
                                  {Math.floor(
                                    (debugInfo.result - new Date(debugInfo.result.getFullYear(), 0, 0)) /
                                      (1000 * 60 * 60 * 24),
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">Browser Timezone:</span>{" "}
                                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                </div>
                                <div>
                                  <span className="font-medium">Selected Timezone:</span> {timezone}
                                </div>
                                <div>
                                  <span className="font-medium">Time in {timezone}:</span>{" "}
                                  {formatInTimeZone(debugInfo.result, timezone, "yyyy-MM-dd HH:mm:ss zzz")}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Step 5: Calculation Summary */}
                      <div className="space-y-1 mt-4 pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/20 text-primary">Summary</Badge>
                          <h4 className="font-medium">Calculation Overview</h4>
                        </div>
                        {debugInfo.baseDate && debugInfo.result && (
                          <div className="mt-2 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded bg-muted/50">
                                <p className="font-medium mb-1">Base Date</p>
                                <p>{debugInfo.baseDate.toLocaleString()}</p>
                                <p className="text-muted-foreground mt-1">{debugInfo.baseDate.toISOString()}</p>
                              </div>
                              <div className="p-2 rounded bg-muted/50">
                                <p className="font-medium mb-1">Result Date</p>
                                <p>{debugInfo.result.toLocaleString()}</p>
                                <p className="text-muted-foreground mt-1">{debugInfo.result.toISOString()}</p>
                              </div>
                            </div>
                            <div className="p-2 rounded bg-muted/50">
                              <p className="font-medium mb-1">Time Difference</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="opacity-70">Days:</span>{" "}
                                  {Math.abs(
                                    Math.floor(
                                      (debugInfo.result.getTime() - debugInfo.baseDate.getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    ),
                                  )}
                                </div>
                                <div>
                                  <span className="opacity-70">Hours:</span>{" "}
                                  {Math.floor(
                                    Math.abs(debugInfo.result.getTime() - debugInfo.baseDate.getTime()) /
                                      (1000 * 60 * 60),
                                  )}
                                </div>
                                <div>
                                  <span className="opacity-70">Minutes:</span>{" "}
                                  {Math.floor(
                                    Math.abs(debugInfo.result.getTime() - debugInfo.baseDate.getTime()) / (1000 * 60),
                                  )}
                                </div>
                                <div>
                                  <span className="opacity-70">Seconds:</span>{" "}
                                  {Math.floor(
                                    Math.abs(debugInfo.result.getTime() - debugInfo.baseDate.getTime()) / 1000,
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-2 rounded bg-muted/50">
                              <p className="font-medium mb-1">Timezone Display</p>
                              <p>
                                {formatInTimeZone(debugInfo.result, timezone, "yyyy-MM-dd HH:mm:ss zzz")}
                                {timezone !== "UTC" && (
                                  <span className="block mt-1 text-muted-foreground">
                                    UTC: {formatInTimeZone(debugInfo.result, "UTC", "yyyy-MM-dd HH:mm:ss 'UTC'")}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="p-2 rounded bg-muted/50">
                              <p className="font-medium mb-1">Technical Details</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="opacity-70">Unix Timestamp:</span>{" "}
                                  {Math.floor(debugInfo.result.getTime() / 1000)}
                                </div>
                                <div>
                                  <span className="opacity-70">Day of Year:</span>{" "}
                                  {Math.floor(
                                    (debugInfo.result - new Date(debugInfo.result.getFullYear(), 0, 0)) /
                                      (1000 * 60 * 60 * 24),
                                  )}
                                </div>
                                <div>
                                  <span className="opacity-70">Week Number:</span>{" "}
                                  {Math.ceil(
                                    (debugInfo.result.getTime() -
                                      new Date(debugInfo.result.getFullYear(), 0, 1).getTime()) /
                                      (7 * 24 * 60 * 60 * 1000),
                                  )}
                                </div>
                                <div>
                                  <span className="opacity-70">Quarter:</span>{" "}
                                  {Math.floor(debugInfo.result.getMonth() / 3) + 1}
                                </div>
                              </div>
                            </div>
                            <div className="p-2 rounded bg-muted/50">
                              <p className="font-medium mb-1">Time Components</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="opacity-70">Hours:</span> {debugInfo.result.getHours()}
                                </div>
                                <div>
                                  <span className="opacity-70">Minutes:</span> {debugInfo.result.getMinutes()}
                                </div>
                                <div>
                                  <span className="opacity-70">Seconds:</span> {debugInfo.result.getSeconds()}
                                </div>
                                <div>
                                  <span className="opacity-70">Milliseconds:</span> {debugInfo.result.getMilliseconds()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={cn("py-2 text-sm", highlightStyle)}>
                      Enter a date expression to see debug information.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for syntax highlighting */}
      <style jsx global>{`
        .syntax-highlight .json-key {
          color: #a626a4;
        }
        .syntax-highlight .json-string {
          color: #50a14f;
        }
        .syntax-highlight .json-number {
          color: #986801;
        }
        .dark .syntax-highlight .json-key {
          color: #c678dd;
        }
        .dark .syntax-highlight .json-string {
          color: #98c379;
        }
        .dark .syntax-highlight .json-number {
          color: #d19a66;
        }
      `}</style>
    </div>
  )
}
