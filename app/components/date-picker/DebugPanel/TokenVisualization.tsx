"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Token {
  type: string
  value: string
}

interface TokenVisualizationProps {
  tokens: Token[]
}

export function TokenVisualization({ tokens }: TokenVisualizationProps) {
  if (!tokens || tokens.length === 0) return null

  return (
    <div className="mt-3 border-t border-border pt-3">
      <h5 className="text-xs font-medium mb-2">Token Visualization</h5>
      <div className="flex flex-wrap gap-1">
        {tokens.map((token, i) => (
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
  )
}
