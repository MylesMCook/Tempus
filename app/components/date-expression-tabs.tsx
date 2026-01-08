"use client"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DateExpressionTabsProps {
  examples: Record<string, string[]>
  onExampleClick: (expression: string) => void
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Simple: "Basic date references that are easy to understand.",
  Relative: "Dates defined in relation to the current moment.",
  "Date Math": "Expressions that perform calculations with dates.",
  Fractional: "Precise date calculations using decimal values.",
  Advanced: "Complex expressions combining multiple concepts.",
}

export function DateExpressionTabs({ examples, onExampleClick }: DateExpressionTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(examples)[0])
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLButtonElement>,
    expressions: string[],
    currentIndex: number
  ) => {
    let nextIndex: number | null = null

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault()
        nextIndex = (currentIndex + 1) % expressions.length
        break
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault()
        nextIndex = (currentIndex - 1 + expressions.length) % expressions.length
        break
      case "Home":
        e.preventDefault()
        nextIndex = 0
        break
      case "End":
        e.preventDefault()
        nextIndex = expressions.length - 1
        break
    }

    if (nextIndex !== null) {
      const nextExpression = expressions[nextIndex]
      const nextButton = buttonRefs.current.get(nextExpression)
      nextButton?.focus()
    }
  }, [])

  const setButtonRef = useCallback((expression: string, el: HTMLButtonElement | null) => {
    if (el) {
      buttonRefs.current.set(expression, el)
    } else {
      buttonRefs.current.delete(expression)
    }
  }, [])

  const renderExampleButtons = (expressions: string[]) => (
    <div className="grid grid-cols-1 gap-2" role="listbox" aria-label="Date expression examples">
      {expressions.map((expression, index) => (
        <button
          type="button"
          key={expression}
          ref={(el) => setButtonRef(expression, el)}
          onClick={() => onExampleClick(expression)}
          onKeyDown={(e) => handleKeyDown(e, expressions, index)}
          role="option"
          aria-selected={false}
          aria-label={`Use example: ${expression}. Click or press Enter to use this expression.`}
          className="text-left px-3 py-2 min-h-[44px] rounded-md
            bg-background hover:bg-primary/5 focus:bg-primary/5 transition-colors
            border border-border hover:border-primary/30 focus:border-primary/30
            focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <span className="text-sm">{expression}</span>
        </button>
      ))}
    </div>
  )

  return (
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
      <div className="px-2 sm:px-4 py-2 border-b">
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
          // Mobile view - dropdown select
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-full h-9" aria-label="Select example category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(examples).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {Object.entries(examples).map(([category, expressions]) => (
        <TabsContent key={category} value={category} className="p-3 sm:p-4">
          <p className="text-sm text-muted-foreground mb-3">
            {CATEGORY_DESCRIPTIONS[category] || ""}
          </p>
          {renderExampleButtons(expressions)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
