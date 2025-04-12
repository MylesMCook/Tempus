"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface ParserSettings {
  // Date formatting
  dateFormat: string
  showWeekday: boolean
  customFormat: string
  isCustomFormat: boolean

  // Parsing behavior
  preserveDayOfMonth: boolean

  // Debug features
  syntaxHighlighting: boolean
  autoExpandSteps: boolean
}

const DEFAULT_SETTINGS: ParserSettings = {
  dateFormat: "EEEE, MMMM d, yyyy",
  showWeekday: true,
  customFormat: "",
  isCustomFormat: false,
  preserveDayOfMonth: true,
  syntaxHighlighting: true,
  autoExpandSteps: true,
}

export interface SettingsContextType {
  settings: ParserSettings
  updateSettings: (settings: Partial<ParserSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ParserSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("parserSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
      }
    } catch (err) {
      console.error("Failed to load settings from localStorage", err)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("parserSettings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<ParserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
