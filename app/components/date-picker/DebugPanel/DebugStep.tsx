"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { THEME_STYLES } from "../types"

interface DebugStepProps {
  stepNumber: number
  title: string
  description: string
  isActive: boolean
  onToggle: () => void
  showToggle: boolean
  children: React.ReactNode
}

export function DebugStep({
  stepNumber,
  title,
  description,
  isActive,
  onToggle,
  showToggle,
  children,
}: DebugStepProps) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        className="flex items-center gap-2 cursor-pointer w-full text-left"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", THEME_STYLES.stepStyle)}>
          Step {stepNumber}
        </span>
        <h4 className="font-medium">{title}</h4>
        {showToggle && (
          isActive ? (
            <ChevronUp className="h-3 w-3 ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )
        )}
      </button>
      <p className={cn("text-sm", THEME_STYLES.highlightStyle)}>{description}</p>
      {isActive && children}
    </div>
  )
}

export function DebugCodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("mt-1 p-2 rounded text-xs font-mono overflow-x-auto", THEME_STYLES.preStyle)}>
      {children}
    </div>
  )
}

export function DebugGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
      {children}
    </div>
  )
}
