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
  timezone: "UTC",
};
const SettingsContext = createContext<
  | {
      settings: ParserSettings;
      ready: boolean;
      settingsSaved: boolean;
      effectiveDateFormat: string;
      updateSettings: (change: Partial<ParserSettings>) => void;
      resetSettings: () => void;
    }
  | undefined
>(undefined);
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParserSettings>(defaults);
  const [ready, setReady] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(true);
  useEffect(() => {
    const browserDefaults = { ...defaults, timezone: defaultTimezone() };
    try {
      setSettings(
        decodeStoredSettings(window.localStorage.getItem("parserSettings"), browserDefaults),
      );
    } catch {
      setSettings(browserDefaults);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      setSettingsSaved(saveSettings(window.localStorage, settings));
    } catch {
      setSettingsSaved(false);
    }
  }, [settings, ready]);
  const value = useMemo(
    () => ({
      settings,
      ready,
      settingsSaved,
      effectiveDateFormat: settings.isCustomFormat
        ? settings.customFormat.trim()
        : settings.dateFormat,
      updateSettings: (change: Partial<ParserSettings>) =>
        setSettings((current) => ({ ...current, ...change })),
      resetSettings: () => setSettings({ ...defaults, timezone: defaultTimezone() }),
    }),
    [settings, settingsSaved, ready],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("SettingsProvider is required");
  return value;
}
