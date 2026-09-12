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
  Fractional: "Decimals and mixed fractions. Any calendar approximation is shown with the result.",
  Advanced: "Combinations of weekdays, anchors, and longer chains of date math.",
};

export function DateExpressionTabs({ examples, onExampleClick }: DateExpressionTabsProps) {
  const [activeCategory, setActiveCategory] = useState(
    (Object.keys(examples)[0] ?? "").replaceAll(" ", "-"),
  );

  return (
    <Tabs className="w-full" value={activeCategory} onValueChange={setActiveCategory}>
      <div className="px-4 pt-2">
        <TabsList className="inline-flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted/60 p-1">
          {Object.keys(examples).map((category) => (
            <TabsTrigger
              key={category}
              value={category.replaceAll(" ", "-")}
              className="whitespace-nowrap px-3 py-1.5 text-xs"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {Object.entries(examples).map(([category, expressions]) => (
        <TabsContent
          key={category}
          value={category.replaceAll(" ", "-")}
          className="flex flex-col gap-4 px-4 pb-4 pt-3 data-[state=inactive]:hidden"
        >
          <p className="text-sm text-muted-foreground">
            {categoryDescriptions[category] ??
              "Sample expressions you can drop straight into the parser."}
          </p>
          <div className="flex flex-wrap gap-2">
            {expressions.map((expression) => (
              <Button
                key={expression}
                type="button"
                variant="outline"
                className="h-auto min-h-10 whitespace-normal justify-start text-left text-sm font-normal"
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
