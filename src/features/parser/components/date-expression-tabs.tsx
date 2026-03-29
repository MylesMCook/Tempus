"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DateExpressionTabsProps {
  examples: Record<string, string[]>;
  onExampleClick: (expression: string) => void;
}

const categoryDescriptions: Record<string, string> = {
  Simple: "Quick references like now, tomorrow, and next friday.",
  Relative: "Offsets from the current moment such as in 3 days or 5 days ago.",
  "Date Math": "Expressions that add or subtract time from another date.",
  Fractional: "Decimal-based offsets when you need more precise time spans.",
  Advanced: "Combinations of weekdays, anchors, and longer chains of date math.",
};

export function DateExpressionTabs({ examples, onExampleClick }: DateExpressionTabsProps) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(examples)[0] ?? "");

  return (
    <Tabs className="w-full" value={activeCategory} onValueChange={setActiveCategory}>
      <div className="overflow-x-auto px-4 pt-4">
        <TabsList className="inline-flex h-auto w-max gap-1 rounded-lg bg-muted/60 p-1">
          {Object.keys(examples).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="whitespace-nowrap px-3 py-1.5 text-xs"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {Object.entries(examples).map(([category, expressions]) => (
        <TabsContent key={category} value={category} className="flex flex-col gap-4 px-4 pb-4 pt-3">
          <p className="text-sm text-muted-foreground">
            {categoryDescriptions[category] ??
              "Sample expressions you can drop straight into the parser."}
          </p>
          <div className="flex flex-col gap-2">
            {expressions.map((expression) => (
              <Button
                key={expression}
                type="button"
                variant="outline"
                className="justify-start text-left text-sm font-normal"
                onClick={() => onExampleClick(expression)}
              >
                {expression}
              </Button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
