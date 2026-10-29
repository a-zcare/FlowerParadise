import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { pick } from "./data";
import { useStore } from "./store";
import { useT } from "./i18n";
import {
  countdownLabel,
  countdownParts,
  rigaDateTimeToEpoch,
  type CountdownUnit,
} from "./countdown";
export function HolidayCountdown() {
  const { s } = useStore();
  const t = useT();
  const config = s.commerce.countdownSettings;
  const target = rigaDateTimeToEpoch(config.targetLocal)!;
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      setNow(Date.now());
      if (!document.hidden && Date.now() < target)
        timer = setInterval(() => {
          const current = Date.now();
          setNow(current);
          if (current >= target) clearInterval(timer);
        }, 1000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, [target]);
  const parts = countdownParts(target, now);
  return (
    <section
      className="holiday-countdown"
      aria-label={pick(config.label, s.lang)}
    >
      <div className="countdown-intro">
        <Sparkles size={21} aria-hidden="true" />
        <div>
          <span>{pick(config.label, s.lang)}</span>
          <time dateTime={new Date(target).toISOString()}>
            {new Intl.DateTimeFormat(s.lang, {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Riga",
              hourCycle: "h23",
            }).format(target)}{" "}
            · Rīga
          </time>
        </div>
      </div>
      {parts.expired ? (
        <p className="countdown-greeting" role="status">
          {pick(config.greeting, s.lang)}
        </p>
      ) : (
        <div
          className="countdown-units"
          role="timer"
          aria-live="off"
          aria-label={pick(config.label, s.lang)}
        >
          {(["days", "hours", "minutes", "seconds"] as CountdownUnit[]).map(
            (unit) => (
              <div className="countdown-unit" key={unit} data-unit={unit}>
                <strong>{String(parts[unit]).padStart(2, "0")}</strong>
                <span>{countdownLabel(unit, parts[unit], s.lang)}</span>
              </div>
            ),
          )}
        </div>
      )}
      <small className="countdown-edition">
        {t(
          "2026 / 2027 · Ideju kolekcija",
          "2026 / 2027 · Коллекция идей",
          "2026 / 2027 · An inspiration collection",
        )}
      </small>
    </section>
  );
}
