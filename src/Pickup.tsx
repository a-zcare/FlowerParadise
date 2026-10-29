import { MapPin, Clock3, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { pick } from "./data";
import { pickupLocations, locationMatches } from "./pickup";
import { useStore } from "./store";
import { useT } from "./ui";
export function PickupSelection({
  value,
  onChange,
  productId,
  checkout = false,
  fixed = false,
}: {
  value: string;
  onChange: (id: string) => void;
  productId?: string;
  checkout?: boolean;
  fixed?: boolean;
}) {
  const { s } = useStore();
  const t = useT();
  const selected = pickupLocations.find((l) => l.id === value);
  return (
    <div className="pickup-selection">
      <label>
        <MapPin size={16} />
        {t("Saņemšanas punkts", "Точка получения", "Pickup location")}
        {fixed ? (
          <strong>{selected && pick(selected.name, s.lang)}</strong>
        ) : (
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">
              {t(
                "Visi saņemšanas veidi",
                "Все способы получения",
                "All fulfilment options",
              )}
            </option>
            {pickupLocations
              .filter((l) => !checkout || l.method !== "vending")
              .map((l) => (
                <option
                  key={l.id}
                  value={l.id}
                  disabled={s.seasonal.discovery.unavailableLocations.includes(
                    l.id,
                  )}
                >
                  {pick(l.name, s.lang)}
                </option>
              ))}
          </select>
        )}
      </label>
      {selected && (
        <div className="pickup-detail">
          <strong>
            {t(
              "Pirms atklāšanas · Demo",
              "До открытия · Демо",
              "Pre-launch · Demo",
            )}
          </strong>
          <p>
            <Clock3 size={14} /> {pick(selected.accessHours, s.lang)}
          </p>
          <p>
            {t(
              "Precīza adrese vēl nav apstiprināta. Tā nav darbojoša saņemšanas vieta.",
              "Точный адрес ещё не подтверждён. Это не действующая точка получения.",
              "The address is not confirmed. This is not an operating collection point.",
            )}
          </p>
          {productId && !locationMatches(s, productId, value) && (
            <p role="status">
              {t(
                "Šis produkts šeit nav demo-pieejams.",
                "Этот товар здесь недоступен в демо.",
                "This product is not available here in the demo.",
              )}
            </p>
          )}
          {selected.method === "vending" && (
            <Link className="text-link" to="/vending">
              {t(
                "Atvērt četru nodalījumu demo",
                "Открыть демо четырёх ячеек",
                "Open four-compartment demo",
              )}
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
export function PickupSteps() {
  const t = useT();
  return (
    <div className="pickup-steps">
      {[
        [
          t("Izvēlies pušķi", "Выберите букет", "Choose a bouquet"),
          t(
            "Apskati demo nodalījumus un produkta detaļas.",
            "Посмотрите демо-ячейки и детали товара.",
            "Explore the demo compartments and product details.",
          ),
        ],
        [
          t(
            "Apstiprini demo rezervāciju",
            "Подтвердите демо-бронь",
            "Confirm a demo reservation",
          ),
          t(
            "Maksājums tiek tikai simulēts. Nauda netiek iekasēta.",
            "Оплата только имитируется. Деньги не списываются.",
            "Payment is simulated. No money is charged.",
          ),
        ],
        [
          t(
            "Izmēģini saņemšanas kodu",
            "Попробуйте код получения",
            "Try your pickup code",
          ),
          t(
            "Ievadi vienreizējo kodu šīs lapas simulatorā. Īsts automāts neatveras.",
            "Введите одноразовый код в симуляторе этой страницы. Настоящий автомат не открывается.",
            "Enter the one-time code in this page’s simulator. No real machine opens.",
          ),
        ],
      ].map(([title, body], i) => (
        <div key={title}>
          <span>0{i + 1}</span>
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}
