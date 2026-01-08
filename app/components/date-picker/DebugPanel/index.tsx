"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { formatInTimeZone } from "date-fns-tz"
import { DebugInfo, THEME_STYLES } from "../types"
import { formatJSON } from "../utils"
import { DebugSummary } from "./DebugSummary"
import { DebugStep, DebugCodeBlock, DebugGrid } from "./DebugStep"
import { TokenVisualization } from "./TokenVisualization"
import { CalculationSummary } from "./CalculationSummary"

interface DebugPanelProps {
  inputValue: string
  previewDate: Date | null
  debugInfo: DebugInfo | null
  timezone: string
  settings: {
    preserveDayOfMonth: boolean
    syntaxHighlighting: boolean
    autoExpandSteps: boolean
    dateFormat: string
  }
}

export function DebugPanel({
  inputValue,
  previewDate,
  debugInfo,
  timezone,
  settings,
}: DebugPanelProps) {
  const [debugOpen, setDebugOpen] = React.useState(true)
  const [activeStep, setActiveStep] = React.useState<string | null>(null)
  const { toast } = useToast()

  const toggleStep = (step: string) => {
    setActiveStep(activeStep === step ? null : step)
  }

  const isStepActive = (step: string) => {
    return activeStep === null || activeStep === step
  }

  const copyDebugReport = () => {
    if (!debugInfo) return

    const debugReport = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      input: inputValue,
      result: previewDate ? previewDate.toISOString() : null,
      settings: {
        ...settings,
        timezone,
        browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: typeof navigator !== "undefined" ? navigator.language : "unknown",
      },
      debugData: debugInfo,
      environment: {
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        language: typeof navigator !== "undefined" ? navigator.language : "unknown",
        platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
        screenSize: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "unknown",
      },
    }

    navigator.clipboard.writeText(JSON.stringify(debugReport, null, 2))
    toast({
      title: "Complete debug data copied",
      description: "Comprehensive debug information copied to clipboard",
      duration: 2000,
    })
  }

  return (
    <div className={cn("px-4 py-3 rounded-md border", THEME_STYLES.lightBg, THEME_STYLES.darkBg)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(THEME_STYLES.badgeStyle)}>
            Developer Mode
          </Badge>
          <span className={cn("text-sm font-medium", THEME_STYLES.highlightStyle)}>
            Date Parsing Debug Information
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs shadow-sm hover:bg-primary/5 hover:border-primary/50"
            onClick={copyDebugReport}
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
            aria-expanded={debugOpen}
            aria-label={debugOpen ? "Collapse debug panel" : "Expand debug panel"}
          >
            {debugOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {debugOpen && (
        <div className="mt-3 space-y-4">
          {/* Debug Summary */}
          <DebugSummary
            inputValue={inputValue}
            previewDate={previewDate}
            timezone={timezone}
            preserveDayOfMonth={settings.preserveDayOfMonth}
            debugInfo={debugInfo}
          />

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
                <code className={cn("block p-2 rounded text-xs font-mono", THEME_STYLES.preStyle)}>
                  {inputValue || "<empty>"}
                </code>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">Character Length</p>
                <code className={cn("block p-2 rounded text-xs font-mono", THEME_STYLES.preStyle)}>
                  {inputValue ? inputValue.length : 0} characters
                </code>
              </div>
            </div>
          </div>

          {debugInfo ? (
            <>
              {/* Step 1: Tokenization */}
              <DebugStep
                stepNumber={1}
                title="Tokenization"
                description={`Breaking "${inputValue}" into tokens`}
                isActive={isStepActive("tokenization")}
                onToggle={() => toggleStep("tokenization")}
                showToggle={activeStep !== null}
              >
                <DebugCodeBlock>
                  {formatJSON(debugInfo.tokens, settings.syntaxHighlighting)}
                </DebugCodeBlock>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Token Count:</span> {debugInfo.tokens?.length || 0} tokens
                </div>
                {debugInfo.tokens && debugInfo.tokens.length > 0 && (
                  <TokenVisualization tokens={debugInfo.tokens} />
                )}
              </DebugStep>

              {/* Step 2: Base Date Identification */}
              <DebugStep
                stepNumber={2}
                title="Base Date Identification"
                description="Determining the reference date"
                isActive={isStepActive("baseDate")}
                onToggle={() => toggleStep("baseDate")}
                showToggle={activeStep !== null}
              >
                <DebugCodeBlock>
                  {debugInfo.baseDate ? debugInfo.baseDate.toISOString() : "No base date identified"}
                </DebugCodeBlock>
                {debugInfo.baseDate && (
                  <DebugGrid>
                    <div>
                      <span className="font-medium">Local Format:</span> {debugInfo.baseDate.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Day of Week:</span>{" "}
                      {new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(debugInfo.baseDate)}
                    </div>
                  </DebugGrid>
                )}
              </DebugStep>

              {/* Step 3: Time Operations */}
              <DebugStep
                stepNumber={3}
                title="Time Operations"
                description="Calculating time adjustments"
                isActive={isStepActive("operations")}
                onToggle={() => toggleStep("operations")}
                showToggle={activeStep !== null}
              >
                <DebugCodeBlock>
                  {formatJSON(debugInfo.operations, settings.syntaxHighlighting)}
                </DebugCodeBlock>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Operation Count:</span> {debugInfo.operations?.length || 0} operations
                  {debugInfo.operations && debugInfo.operations.length > 0 && (
                    <ul className="mt-1 space-y-1 pl-4 list-disc">
                      {debugInfo.operations.map((op, i) => (
                        <li key={i}>
                          {op.direction > 0 ? "Add" : "Subtract"} {op.amount} {op.unit}
                          {op.amount !== 1 && op.unit !== "month" ? "s" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </DebugStep>

              {/* Step 4: Final Calculation */}
              <DebugStep
                stepNumber={4}
                title="Final Calculation"
                description="Applying operations to base date"
                isActive={isStepActive("result")}
                onToggle={() => toggleStep("result")}
                showToggle={activeStep !== null}
              >
                <DebugCodeBlock>
                  {debugInfo.result ? debugInfo.result.toISOString() : "No result"}
                </DebugCodeBlock>
                {debugInfo.result && (
                  <DebugGrid>
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
                        (debugInfo.result.getTime() - new Date(debugInfo.result.getFullYear(), 0, 0).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Browser Timezone:</span>{" "}
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </div>
                    <div>
                      <span className="font-medium">Selected Timezone:</span> {timezone}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Time in {timezone}:</span>{" "}
                      {formatInTimeZone(debugInfo.result, timezone, "yyyy-MM-dd HH:mm:ss zzz")}
                    </div>
                  </DebugGrid>
                )}
              </DebugStep>

              {/* Calculation Summary */}
              {debugInfo.baseDate && debugInfo.result && (
                <CalculationSummary
                  baseDate={debugInfo.baseDate}
                  result={debugInfo.result}
                  timezone={timezone}
                />
              )}
            </>
          ) : (
            <div className={cn("py-2 text-sm", THEME_STYLES.highlightStyle)}>
              Enter a date expression to see debug information.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
