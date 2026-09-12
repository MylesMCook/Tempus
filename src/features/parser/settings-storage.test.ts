import { describe, expect, it } from "vite-plus/test";
import { decodeStoredSettings, saveSettings } from "./settings-storage";

const defaults = {
  dateFormat: "yyyy-MM-dd",
  customFormat: "",
  isCustomFormat: false,
  timezone: "UTC",
};

describe("Persisted settings", () => {
  it.each([null, "null", "[]", "broken", '"text"', "42"])(
    "recovers from invalid stored data: %s",
    (raw) => {
      expect(decodeStoredSettings(raw, defaults)).toEqual(defaults);
    },
  );
  it("rejects wrong field types and unknown zones while preserving valid choices", () => {
    expect(
      decodeStoredSettings(
        JSON.stringify({
          customFormat: 42,
          isCustomFormat: "yes",
          preserveDayOfMonth: false,
          timezone: "Bad/Zone",
          dateFormat: {},
        }),
        defaults,
      ),
    ).toEqual(defaults);
  });
  it("survives denied or full storage", () => {
    expect(
      saveSettings(
        {
          setItem() {
            throw new Error("Storage unavailable");
          },
        },
        defaults,
      ),
    ).toBe(false);
  });
});

it("migrates legacy preferences without retaining arithmetic switches or unknown fields", () => {
  const migrated = decodeStoredSettings(
    JSON.stringify({
      dateFormat: "yyyy-MM-dd",
      customFormat: "HH:mm",
      timezone: "Asia/Tokyo",
      isCustomFormat: true,
      preserveDayOfMonth: true,
      extra: "unused",
    }),
    defaults,
  );
  expect(migrated).toEqual({
    dateFormat: "yyyy-MM-dd",
    customFormat: "HH:mm",
    timezone: "Asia/Tokyo",
    isCustomFormat: true,
  });
  let raw = "";
  expect(
    saveSettings(
      {
        setItem(_key, value) {
          raw = value;
        },
      },
      migrated,
    ),
  ).toBe(true);
  expect(decodeStoredSettings(raw, defaults)).toEqual(migrated);
});
it("restores a known display format when legacy data names an unavailable option", () => {
  expect(
    decodeStoredSettings(JSON.stringify({ dateFormat: "custom", timezone: "UTC" }), defaults)
      .dateFormat,
  ).toBe(defaults.dateFormat);
});
