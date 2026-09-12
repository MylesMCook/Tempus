import { dateFormatOptions } from "./options";
import type { ParserSettings } from "./context/settings-context";

export function decodeStoredSettings(raw: string | null, defaults: ParserSettings): ParserSettings {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
    const stored = value as Record<string, unknown>;
    const text = (key: "dateFormat" | "customFormat" | "timezone") =>
      typeof stored[key] === "string" && stored[key].length <= (key === "timezone" ? 64 : 50)
        ? stored[key]
        : defaults[key];
    let timezone = text("timezone");
    try {
      new Intl.DateTimeFormat("en", { timeZone: timezone });
    } catch {
      timezone = defaults.timezone;
    }
    return {
      dateFormat: dateFormatOptions.some(
        (option) => option.value !== "custom" && option.value === text("dateFormat"),
      )
        ? text("dateFormat")
        : defaults.dateFormat,
      customFormat: text("customFormat"),
      timezone,
      isCustomFormat:
        typeof stored.isCustomFormat === "boolean"
          ? stored.isCustomFormat
          : defaults.isCustomFormat,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(storage: Pick<Storage, "setItem">, settings: ParserSettings): boolean {
  try {
    storage.setItem("parserSettings", JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
