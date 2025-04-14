"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DateExpressionTabsProps {
  examples: Record<string, string[]>
  onExampleClick: (expression: string) => void
}

export function DateExpressionTabs({ examples, onExampleClick }: DateExpressionTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(examples)[0])
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full overflow-hidden">
      <div className="px-2 sm:px-4 py-2 border-b overflow-x-auto -mx-px">
        <div className="flex min-w-full pb-1">
          {isDesktop ? (
            // Desktop view - evenly distributed tabs
            <TabsList className="inline-flex h-9 w-full">
              {Object.keys(examples).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs flex-1">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          ) : (
            // Mobile view - scrollable tabs
            <TabsList className="inline-flex h-9 w-auto gap-1">
              {Object.keys(examples).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs whitespace-nowrap px-3 flex-shrink-0">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
        </div>
      </div>

      {Object.entries(examples).map(([category, expressions]) => (
        <TabsContent key={category} value={category} className="p-3 sm:p-4">
          <p className="text-sm text-muted-foreground mb-3">
            {category === "Simple" && "Basic date references that are easy to understand."}
            {category === "Relative" && "Dates defined in relation to the current moment."}
            {category === "Date Math" && "Expressions that perform calculations with dates."}
            {category === "Fractional" && "Precise date calculations using decimal values."}
            {category === "Advanced" && "Complex expressions combining multiple concepts."}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {expressions.map((expression) => (
              <button
                key={expression}
                onClick={() => onExampleClick(expression)}
                className="text-left px-3 py-2 rounded-md
                bg-background hover:bg-primary/5 transition-colors
                border border-border hover:border-primary/30"
              >
                <span className="text-sm">{expression}</span>
              </button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
