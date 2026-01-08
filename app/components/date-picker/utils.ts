import * as React from "react"

/**
 * Format time based on 12h or 24h preference
 */
export function formatTime(date: Date | null, timeFormat: "12h" | "24h"): string {
  if (!date) return "--:--:--"

  if (timeFormat === "12h") {
    const hours = date.getHours() % 12 || 12
    const ampm = date.getHours() >= 12 ? "PM" : "AM"
    return `${hours}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")} ${ampm}`
  } else {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
  }
}

/**
 * Format JSON with optional syntax highlighting
 */
export function formatJSON(json: unknown, syntaxHighlighting: boolean): React.ReactNode {
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
  return React.createElement(
    "pre",
    { className: "syntax-highlight" },
    jsonString.split("\n").map((line, i) => {
      // Match keys and values
      const keyMatch = line.match(/^(\s*)(".*?"):/)
      const valueMatch = line.match(/:\s*(.*?)$/)

      if (keyMatch && valueMatch) {
        const [, spaces, key] = keyMatch
        const value = valueMatch[1]

        return React.createElement(
          "div",
          { key: i },
          spaces,
          React.createElement("span", { className: "json-key" }, key),
          ":",
          value.includes('"')
            ? React.createElement("span", { className: "json-string" }, value)
            : value.match(/^-?\d+(\.\d+)?$/)
              ? React.createElement("span", { className: "json-number" }, value)
              : React.createElement("span", null, value),
        )
      }

      return React.createElement("div", { key: i }, line)
    }),
  )
}

/**
 * Get contextual error message for parse failures
 */
export function getParseErrorMessage(
  input: string,
  debugInfo: { tokens?: unknown[]; baseDate?: Date; result?: Date } | null,
): string {
  if (!input.trim()) return "Enter a date expression to begin"
  if (!debugInfo?.tokens?.length) return `Could not understand "${input}"`
  if (!debugInfo?.baseDate) return `No reference date found in "${input}"`
  if (!debugInfo?.result) return `Unable to calculate date from "${input}"`
  return "Unknown parsing error"
}
