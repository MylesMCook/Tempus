"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { DatePicker } from "./components/date-picker"
import { ApiDocs } from "./components/api-docs"
import { SettingsProvider } from "./context/settings-context"
import { formatInTimeZone } from "date-fns-tz"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
// Import the new DateExpressionTabs component
import { DateExpressionTabs } from "./components/date-expression-tabs"

const examples = {
  Simple: ["now", "today", "tomorrow", "yesterday", "next friday", "last monday"],
  Relative: ["in 3 days", "2 weeks from now", "3 months ago", "1 year from now", "5 days ago"],
  "Date Math": [
    "today plus 2 weeks",
    "tomorrow minus 3 days",
    "2 weeks plus 3 days",
    "1 month minus 1 week",
    "6 months plus 2 weeks",
  ],
  Fractional: [
    "1.5 days from now",
    "2.5 weeks ago",
    "6.5 months from today",
    "0.5 years from now",
    "today plus 0.25 years",
  ],
  Advanced: [
    "6 months before sep 14",
    "2 weeks after dec 25",
    "3 days before next friday",
    "1 month after last monday",
    "2.5 weeks before may 1",
    "friday next week",
  ],
}

export default function Home() {
  const [date, setDate] = useState<Date>()
  const [formattedDate, setFormattedDate] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("Simple")

  // Update the handler to store both the Date object and its formatted representation
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      // Format the date according to the user's settings
      const { dateFormat } = JSON.parse(localStorage.getItem("parserSettings") || '{"dateFormat":"EEEE, MMMM d, yyyy"}')
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const formatted = formatInTimeZone(newDate, timezone, dateFormat)
      setFormattedDate(formatted)
    } else {
      setFormattedDate("")
    }
  }

  // TODO: Issue #3 - Replace direct DOM manipulation with React state
  // This hack bypasses React's data flow and can break with React updates.
  // Fix: Lift input value state to this component and pass as prop to DatePicker.
  // Example: const [inputValue, setInputValue] = useState("")
  //          <DatePicker value={inputValue} onChange={setInputValue} />
  const handleExampleClick = (expression: string) => {
    const input = document.querySelector("input")
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, expression)
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.focus()
      }
    }
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background">
        <main className="container py-8 sm:py-12 space-y-8 sm:space-y-12 px-4 sm:px-6 flex flex-col items-center">
          {/* Adjust the header spacing and title sizes for better mobile layout */}
          <section className="w-full max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-primary">
              <Clock className="size-5 sm:size-6" />
              <span className="text-base sm:text-lg font-bold tracking-tight">TempusTotal</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Natural Language Time, <span className="text-primary">Precisely Parsed</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-prose mx-auto px-1">
                Transform expressions like "next friday" or "3.5 weeks from now" into exact dates and time. Simple,
                powerful, and built for people.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/20 via-primary/30 rounded-xl blur-xl" />
              <div className="relative bg-background rounded-lg border shadow-sm">
                <DatePicker date={date} onDateChange={handleDateChange} />
              </div>
            </div>
          </section>

          {/* Adjust the examples layout for improved mobile display */}
          <section className="w-full max-w-2xl mx-auto">
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle>Date Expression Examples</CardTitle>
                <CardDescription>Explore different ways to express dates in natural language</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <DateExpressionTabs examples={examples} onExampleClick={handleExampleClick} />
              </CardContent>
            </Card>
          </section>
          <section className="w-full max-w-2xl mx-auto">
            <ApiDocs />
          </section>
        </main>

        <footer className="border-t mt-12">
          <div className="container py-6 flex flex-col sm:flex-row items-center gap-4 sm:justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>TempusTotal</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Natural language date parsing, made simple.</span>
              <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </SettingsProvider>
  )
}
