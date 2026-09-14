"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Disclosure({ className, onToggle, ...props }: ComponentProps<"details">) {
  const ready = useRef(false);
  useEffect(() => {
    ready.current = true;
  }, []);
  return (
    <details
      {...props}
      className={cn("t-disclosure", className)}
      onToggle={(event) => {
        if (ready.current) {
          if (event.currentTarget.open) event.currentTarget.classList.add("is-opening");
          else event.currentTarget.classList.remove("is-opening");
        }
        onToggle?.(event);
      }}
    />
  );
}
