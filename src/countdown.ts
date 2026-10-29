import type { Lang, Text } from "./data";
export interface CountdownSettings {
  targetLocal: string;
  label: Text;
  greeting: Text;
}
export function countdownPreset(
  event: "christmas" | "new-year" = "christmas",
): CountdownSettings {
  return event === "new-year"
    ? {
        targetLocal: "2027-01-01T00:00",
        label: ["Līdz Jaunajam gadam", "До Нового года", "Until the New Year"],
        greeting: [
          "Laimīgu Jauno 2027. gadu!",
          "С Новым 2027 годом!",
          "Happy New Year 2027!",
        ],
      }
    : {
        targetLocal: "2026-12-24T00:00",
        label: ["Līdz Ziemassvētkiem", "До Рождества", "Until Christmas"],
        greeting: [
          "Priecīgus Ziemassvētkus!",
          "Счастливого Рождества!",
          "Merry Christmas!",
        ],
      };
}
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Riga",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
function rigaParts(epoch: number) {
  const p = Object.fromEntries(
    formatter.formatToParts(epoch).map((x) => [x.type, x.value]),
  );
  return [p.year, p.month, p.day, p.hour, p.minute, p.second].map(Number);
}
// Resolve a wall-clock time against IANA rules, independent of the browser zone.
// Reject invalid dates, skipped spring times and ambiguous autumn times.
export function rigaDateTimeToEpoch(local: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const values = local.split(/[-T:]/).map(Number);
  const [y, m, d, h, min] = values;
  const utc = Date.UTC(y, m - 1, d, h, min);
  const normalized = new Date(utc).toISOString().slice(0, 16);
  if (normalized !== local) return null;
  const offsets = new Set(
    [-36, 0, 36].map((hours) => {
      const probe = utc + hours * 3600000;
      const [py, pm, pd, ph, pmin, ps] = rigaParts(probe);
      return Date.UTC(py, pm - 1, pd, ph, pmin, ps) - probe;
    }),
  );
  const matches = [...offsets]
    .map((offset) => utc - offset)
    .filter((epoch) =>
      rigaParts(epoch)
        .slice(0, 5)
        .every((value, i) => value === values[i]),
    );
  return matches.length === 1 ? matches[0] : null;
}
export function validCampaignTarget(local: string) {
  return (
    local >= "2026-10-01T00:00" &&
    local <= "2027-01-02T23:59" &&
    rigaDateTimeToEpoch(local) !== null
  );
}
export function countdownParts(target: number, now: number) {
  const total = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
    expired: target <= now,
  };
}
export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";
const labels = {
  lv: {
    days: ["dienu", "diena", "dienas"],
    hours: ["stundu", "stunda", "stundas"],
    minutes: ["minūšu", "minūte", "minūtes"],
    seconds: ["sekunžu", "sekunde", "sekundes"],
  },
  ru: {
    days: ["дней", "день", "дня"],
    hours: ["часов", "час", "часа"],
    minutes: ["минут", "минута", "минуты"],
    seconds: ["секунд", "секунда", "секунды"],
  },
  en: {
    days: ["days", "day", "days"],
    hours: ["hours", "hour", "hours"],
    minutes: ["minutes", "minute", "minutes"],
    seconds: ["seconds", "second", "seconds"],
  },
};
const plurals = {
  lv: new Intl.PluralRules("lv"),
  ru: new Intl.PluralRules("ru"),
  en: new Intl.PluralRules("en"),
};
export function countdownLabel(unit: CountdownUnit, value: number, lang: Lang) {
  const plural = plurals[lang].select(value);
  return labels[lang][unit][
    plural === "one" ? 1 : plural === "few" || plural === "other" ? 2 : 0
  ];
}
