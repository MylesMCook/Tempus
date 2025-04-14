"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CopyIcon,
  CheckIcon,
  PlayIcon,
  RefreshCwIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useSettings } from "../context/settings-context"

const examples = [
  {
    description: "Simple date",
    expression: "next friday",
    response: {
      expression: "next friday",
      date: "2024-01-10T00:00:00.000Z",
      timestamp: 1704412800000,
      meta: {
        type: "weekday",
        components: ["friday", "next"],
      },
    },
  },
  {
    description: "Relative date",
    expression: "3 weeks from now",
    response: {
      expression: "3 weeks from now",
      date: "2024-01-23T00:00:00.000Z",
      timestamp: 1705968000000,
      formatted: "January 23, 2024",
      meta: {
        type: "relative",
        components: ["week", "from now"],
      },
      settings: {
        format: "MMMM d, yyyy",
        preserveDayOfMonth: true,
      },
    },
  },
  {
    description: "Date math",
    expression: "2 months before september 14",
    response: {
      expression: "2 months before september 14",
      date: "2024-07-14T00:00:00.000Z",
      timestamp: 1718409600000,
      meta: {
        type: "date-math",
        components: ["month", "before"],
      },
      settings: {
        preserveDayOfMonth: false,
      },
    },
  },
  {
    description: "Decimal time",
    expression: "6.5 months from now",
    response: {
      expression: "6.5 months from now",
      date: "2024-07-15T12:00:00.000Z",
      timestamp: 1721044800000,
      meta: {
        type: "relative",
        components: ["month", "from now"],
      },
    },
  },
]

const dateFormats = [
  { label: "Full date with weekday", value: "EEEE, MMMM d, yyyy" },
  { label: "Month, day, year", value: "MMMM d, yyyy" },
  { label: "Short month, day, year", value: "MMM d, yyyy" },
  { label: "Numeric (MM/DD/YYYY)", value: "MM/dd/yyyy" },
  { label: "ISO format (YYYY-MM-DD)", value: "yyyy-MM-dd" },
  { label: "Custom format...", value: "custom" },
]

// Function to format JSON with syntax highlighting
function formatJSON(json: any): React.ReactNode {
  // Convert the JSON to a string with proper indentation
  const jsonString = JSON.stringify(json, null, 2)

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

export function ApiDocs() {
  const [testExpression, setTestExpression] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [testUrl, setTestUrl] = useState<string>("")
  const [activeExample, setActiveExample] = useState<number | null>(null)
  const { toast } = useToast()
  const { settings, updateSettings } = useSettings()

  // Track viewport width for responsive design
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied((prev) => ({ ...prev, [id]: true }))

      toast({
        title: "Copied to clipboard",
        duration: 2000,
      })

      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Copy failed",
        variant: "destructive",
      })
    }
  }

  const handleFormatChange = (value: string) => {
    if (value === "custom") {
      updateSettings({
        isCustomFormat: true,
        customFormat: settings.dateFormat,
      })
    } else {
      updateSettings({
        isCustomFormat: false,
        dateFormat: value,
      })
    }
  }

  const handleCustomFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateSettings({
      customFormat: value,
      dateFormat: value,
    })
  }

  const buildTestUrl = () => {
    const baseUrl = `${window.location.origin}/api/parse`
    const params = new URLSearchParams()

    // Only add parameters that have actual values
    if (testExpression) params.append("expression", testExpression.trim())

    // Use either the selected format or custom format
    if (settings.isCustomFormat) {
      if (settings.customFormat && settings.customFormat.trim() !== "")
        params.append("format", settings.customFormat.trim())
    } else {
      if (settings.dateFormat && settings.dateFormat.trim() !== "") params.append("format", settings.dateFormat.trim())
    }

    // Add preserveDayOfMonth parameter
    params.append("preserveDayOfMonth", settings.preserveDayOfMonth.toString())

    return `${baseUrl}?${params.toString()}`
  }

  const testApi = async () => {
    if (!testExpression.trim()) {
      toast({
        title: "Expression required",
        description: "Please enter a date expression to test",
        variant: "destructive",
      })
      return
    }

    setErrorMessage(null)
    setIsTesting(true)
    const url = buildTestUrl()
    setTestUrl(url)

    try {
      const response = await fetch(url)
      const data = await response.json()
      setTestResult(data)

      if (!response.ok) {
        console.error("API Error:", data)

        // Special handling for rate limit errors
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60
          setErrorMessage(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`)

          // Show a more helpful toast for rate limits
          toast({
            title: "Rate limit reached",
            description: `Please wait ${retryAfter} seconds before trying again.`,
            variant: "destructive",
            duration: 5000,
          })
        } else {
          setErrorMessage(data.error || `Error ${response.status}: ${response.statusText}`)
          toast({
            title: "API Error",
            description: data.error || "An error occurred while testing the API",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "API Test Successful",
          description: "Date parsed successfully",
        })
      }
    } catch (error) {
      console.error("Fetch Error:", error)
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setErrorMessage(errorMsg)
      setTestResult({
        error: "Failed to fetch",
        details: errorMsg,
      })

      toast({
        title: "Request Failed",
        description: "Could not connect to the API",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const resetForm = () => {
    setTestExpression("")
    setTestResult(null)
    setTestUrl("")
    setShowAdvancedOptions(false)
    setErrorMessage(null)
    setActiveExample(null)
  }

  const loadExample = (index: number) => {
    setActiveExample(index)
    const example = examples[index]
    setTestExpression(example.expression)
  }

  const formattedJson = useMemo(() => {
    if (!testResult) return null
    return formatJSON(testResult)
  }, [testResult])

  return (
    <section className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="w-full">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>API Playground</CardTitle>
          <CardDescription>Test the date parsing API with different expressions</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Examples Bar */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Example Expressions</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className={cn(
                    "px-3 py-2 text-sm border rounded-md text-left transition-all",
                    index === activeExample
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted/30 hover:border-primary/20",
                  )}
                  onClick={() => loadExample(index)}
                >
                  {example.description}
                </button>
              ))}
            </div>
            <div className="border-b -mx-6 w-[calc(100%+3rem)]"></div>
          </div>

          {/* Main Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="test-expression" className="text-sm font-medium">
                Date Expression
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="h-8 px-3 text-xs"
                  disabled={isTesting}
                >
                  Reset Form
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-xs h-8 px-3 transition-colors",
                    showAdvancedOptions ? "bg-primary/10 text-primary" : "",
                  )}
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  {showAdvancedOptions ? (
                    <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {showAdvancedOptions ? "Hide Options" : "Show Options"}
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="relative flex-1 w-full">
                <Input
                  id="test-expression"
                  value={testExpression}
                  onChange={(e) => setTestExpression(e.target.value)}
                  placeholder="Enter a date expression..."
                  className="pr-24 focus-visible:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && testExpression.trim()) {
                      testApi()
                    }
                  }}
                />
                {testExpression && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTestExpression("")}
                      className="h-6 w-6 rounded-full p-0 hover:bg-muted"
                      aria-label="Clear input"
                    >
                      <span className="sr-only">Clear</span>
                      <span className="text-lg font-semibold">×</span>
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={testApi}
                disabled={isTesting || !testExpression.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm w-full sm:w-auto h-10 px-4 text-sm"
              >
                {isTesting ? (
                  <>
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    <span>Test API</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="date-format" className="text-sm font-medium">
                  Date Format
                </Label>

                {!settings.isCustomFormat ? (
                  <Select value={settings.dateFormat} onValueChange={handleFormatChange}>
                    <SelectTrigger id="date-format" className="h-9">
                      <SelectValue placeholder="Select format (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-1">
                    <Input
                      value={settings.customFormat}
                      onChange={handleCustomFormatChange}
                      placeholder="e.g., yyyy-MM-dd HH:mm"
                      className="h-9"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                      onClick={() =>
                        updateSettings({
                          isCustomFormat: false,
                          dateFormat: "EEEE, MMMM d, yyyy",
                        })
                      }
                    >
                      Reset to default format
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:justify-between">
                <div>
                  <Label htmlFor="preserve-day" className="text-sm font-medium">
                    Preserve Day of Month
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Keep same day when adding months</p>
                </div>
                <Switch
                  id="preserve-day"
                  checked={settings.preserveDayOfMonth}
                  onCheckedChange={(checked) => updateSettings({ preserveDayOfMonth: checked })}
                  className="mt-1 sm:mt-0"
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {errorMessage && (
            <div className="p-4 border border-destructive/30 rounded-md bg-destructive/10 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive">Error Response</h4>
                  <p className="text-sm mt-1 text-destructive/90">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Result Display */}
          {testResult && !errorMessage && (
            <div className="rounded-lg border animate-in fade-in duration-200" aria-live="polite" aria-atomic="true">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">API Response</h4>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2), "result")}
                  >
                    {copied["result"] ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 max-h-[400px] overflow-auto bg-zinc-950">
                <pre className="text-sm text-zinc-100 font-mono">{formattedJson}</pre>
              </div>

              <div className="p-3 sm:p-4 border-t bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between">
                  <div className="flex-1 truncate">
                    <Label className="text-xs font-medium block text-muted-foreground">Request URL:</Label>
                    <code className="text-xs block truncate max-w-[calc(100vw-3rem)] sm:max-w-md">{testUrl}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:ml-2 h-8 whitespace-nowrap w-full sm:w-auto flex-shrink-0"
                    onClick={() => copyToClipboard(testUrl, "url")}
                  >
                    {copied["url"] ? <CheckIcon className="h-3 w-3 mr-1" /> : <CopyIcon className="h-3 w-3 mr-1" />}
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
    </section>
  )
}
