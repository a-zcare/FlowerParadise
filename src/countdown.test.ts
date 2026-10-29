import { describe, it, expect } from "vitest";
import {
  countdownParts,
  countdownPreset,
  countdownLabel,
  rigaDateTimeToEpoch,
  validCampaignTarget,
} from "./countdown";
import { migrateCommerce } from "./commerce";
import { themeTokens, themes } from "./themes";

describe("Riga seasonal countdown", () => {
  it("targets Christmas Eve midnight in Riga independent of the host zone", () => {
    expect(countdownPreset().targetLocal).toBe("2026-12-24T00:00");
    expect(rigaDateTimeToEpoch(countdownPreset().targetLocal)).toBe(
      Date.parse("2026-12-23T22:00:00Z"),
    );
    expect(rigaDateTimeToEpoch(countdownPreset("new-year").targetLocal)).toBe(
      Date.parse("2026-12-31T22:00:00Z"),
    );
  });
  it("uses daylight saving offsets on both sides of the autumn transition", () => {
    expect(rigaDateTimeToEpoch("2026-10-24T00:00")).toBe(
      Date.parse("2026-10-23T21:00:00Z"),
    );
    expect(rigaDateTimeToEpoch("2026-10-26T00:00")).toBe(
      Date.parse("2026-10-25T22:00:00Z"),
    );
    expect(rigaDateTimeToEpoch("2026-07-01T12:00")).toBe(
      Date.parse("2026-07-01T09:00:00Z"),
    );
  });
  it("rejects nonexistent, ambiguous, malformed and overflowing local times", () => {
    for (const time of [
      "2026-03-29T03:30",
      "2026-10-25T03:30",
      "2026-02-30T00:00",
      "2026-12-24T24:00",
      "2026-12-24",
      "bad",
      "2026-13-01T12:00",
    ])
      expect(rigaDateTimeToEpoch(time), time).toBeNull();
  });
  it("crosses month boundaries and never returns negative or early-expired units", () => {
    const target = Date.parse("2026-12-23T22:00:00Z");
    expect(countdownParts(target, Date.parse("2026-10-31T21:00:00Z"))).toEqual({
      days: 53,
      hours: 1,
      minutes: 0,
      seconds: 0,
      expired: false,
    });
    expect(countdownParts(target, target - 90061000)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      expired: false,
    });
    expect(countdownParts(target, target - 1).seconds).toBe(1);
    expect(countdownParts(target, target)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    });
    expect(countdownParts(target, target + 100000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    });
  });
  it("localizes plural forms in all three languages", () => {
    expect(
      [1, 2, 5, 11, 21, 22].map((n) => countdownLabel("days", n, "ru")),
    ).toEqual(["день", "дня", "дней", "дней", "день", "дня"]);
    expect(
      [0, 1, 2, 11, 21].map((n) => countdownLabel("hours", n, "lv")),
    ).toEqual(["stundu", "stunda", "stundas", "stundu", "stunda"]);
    expect(countdownLabel("seconds", 1, "en")).toBe("second");
    expect(countdownLabel("seconds", 2, "en")).toBe("seconds");
    for (const lang of ["lv", "ru", "en"] as const)
      for (const unit of ["days", "hours", "minutes", "seconds"] as const)
        expect(countdownLabel(unit, 0, lang)).toBeTruthy();
  });
  it("migrates the old milestone and preserves validated custom settings through refresh", () => {
    expect(
      migrateCommerce({ countdown: "new-year" }).countdownSettings.targetLocal,
    ).toBe("2027-01-01T00:00");
    const settings = {
      targetLocal: "2026-12-26T10:30",
      label: ["Notikums", "Событие", "Event"],
      greeting: ["Sveiki", "Привет", "Hello"],
    };
    expect(
      migrateCommerce({ countdownSettings: settings }).countdownSettings,
    ).toEqual(settings);
    expect(
      migrateCommerce({
        countdownSettings: { ...settings, targetLocal: "2027-10-31T00:00" },
      }).countdownSettings.targetLocal,
    ).toBe("2026-12-24T00:00");
    expect(validCampaignTarget("2026-10-25T03:30")).toBe(false);
    expect(
      migrateCommerce({
        countdownSettings: {
          targetLocal: "broken",
          label: [""],
          greeting: null,
        },
      }).countdownSettings,
    ).toEqual(countdownPreset());
  });
  it("retains all 15 distinct palettes with shared seasonal and image action tokens", () => {
    expect(themes).toHaveLength(15);
    expect(themes[0].id).toBe("original");
    expect(new Set(themes.map((t) => t.colors.join())).size).toBe(15);
    for (const theme of themes)
      for (const dark of [false, true]) {
        const tokens = themeTokens(theme, dark) as Record<string, string>;
        for (const key of [
          "--festive-bg",
          "--festive-ink",
          "--festive-accent",
          "--image-action-bg",
          "--image-action-ink",
        ])
          expect(tokens[key]).toMatch(/^#/);
      }
  });
});
