"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { decodeStoredSettings, saveSettings } from "../settings-storage";

export interface ParserSettings {
  dateFormat: string;
  customFormat: string;
  isCustomFormat: boolean;
  preserveDayOfMonth: boolean;
  timezone: string;
}

type SettingsContextValue = {
  settings: ParserSettings;
  settingsSaved: boolean;
  effectiveDateFormat: string;
  updateSettings: (settings: Partial<ParserSettings>) => void;
  resetSettings: () => void;
};

function getDefaultTimezone() {
  if (typeof Intl === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

const DEFAULT_SETTINGS: ParserSettings = {
  dateFormat: "EEEE, MMMM d, yyyy",
  customFormat: "",
  isCustomFormat: false,
  preserveDayOfMonth: true,
  timezone: getDefaultTimezone(),
};

const STORAGE_KEY = "parserSettings";

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readStoredSettings(): ParserSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const rawSettings = window.localStorage.getItem(STORAGE_KEY);
    if (!rawSettings) {
      return DEFAULT_SETTINGS;
    }

    return decodeStoredSettings(rawSettings, DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParserSettings>(readStoredSettings);

  const [settingsSaved, setSettingsSaved] = useState(true);
  useEffect(() => {
    try {
      setSettingsSaved(saveSettings(window.localStorage, settings));
    } catch {
      setSettingsSaved(false);
    }
  }, [settings]);

  const value = useMemo<SettingsContextValue>(() => {
    const effectiveDateFormat =
      settings.isCustomFormat && settings.customFormat.trim()
        ? settings.customFormat.trim()
        : settings.dateFormat;

    return {
      settings,
      settingsSaved,
      effectiveDateFormat,
      updateSettings(nextSettings) {
        setSettings((currentSettings) => ({
          ...currentSettings,
          ...nextSettings,
        }));
      },
      resetSettings() {
        setSettings({
          ...DEFAULT_SETTINGS,
          timezone: getDefaultTimezone(),
        });
      },
    };
  }, [settings, settingsSaved]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
}
