import { describe, expect, it } from "vite-plus/test";
import { decodeStoredSettings, saveSettings } from "./settings-storage";

const defaults = {
  dateFormat: "yyyy-MM-dd",
  customFormat: "",
  isCustomFormat: false,
  timezone: "UTC",
  preserveDayOfMonth: true,
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
    ).toEqual({ ...defaults, preserveDayOfMonth: false });
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
