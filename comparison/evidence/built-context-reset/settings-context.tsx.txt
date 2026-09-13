import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { decodeStoredSettings, saveSettings } from "../settings-storage";

export interface ParserSettings {
  dateFormat: string;
  customFormat: string;
  isCustomFormat: boolean;
  timezone: string;
}
function defaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
const defaults: ParserSettings = {
  dateFormat: "EEEE, MMMM d, yyyy",
  customFormat: "yyyy-MM-dd HH:mm",
  isCustomFormat: false,
  timezone: defaultTimezone(),
};
const SettingsContext = createContext<
  | {
      settings: ParserSettings;
      settingsSaved: boolean;
      effectiveDateFormat: string;
      updateSettings: (change: Partial<ParserSettings>) => void;
      resetSettings: () => void;
    }
  | undefined
>(undefined);
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => {
    try {
      return decodeStoredSettings(window.localStorage.getItem("parserSettings"), defaults);
    } catch {
      return defaults;
    }
  });
  const [settingsSaved, setSettingsSaved] = useState(true);
  useEffect(() => {
    try {
      setSettingsSaved(saveSettings(window.localStorage, settings));
    } catch {
      setSettingsSaved(false);
    }
  }, [settings]);
  const value = useMemo(
    () => ({
      settings,
      settingsSaved,
      effectiveDateFormat: settings.isCustomFormat
        ? settings.customFormat.trim()
        : settings.dateFormat,
      updateSettings: (change: Partial<ParserSettings>) =>
        setSettings((current) => ({ ...current, ...change })),
      resetSettings: () => setSettings({ ...defaults, timezone: defaultTimezone() }),
    }),
    [settings, settingsSaved],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("SettingsProvider is required");
  return value;
}
