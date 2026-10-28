import { ArrowUpRight, Flower2 } from "lucide-react";
import { Link } from "react-router-dom";
import { img } from "./data";
import { availability } from "./domain";
import { useStore } from "./store";
import { ProductCard, useT } from "./ui";
export default function HomeExtras() {
  const { s } = useStore();
  const t = useT();
  const ready = s.catalog
    .filter((p) => availability(s, p.id).immediate)
    .slice(0, 3);
  return (
    <>
      <section className="match-home">
        <div>
          <span className="eyebrow">FLOWER MATCH</span>
          <h2>
            {t(
              "Nezini, kurus ziedus izvēlēties?",
              "Не знаете, какие цветы выбрать?",
              "Not sure which flowers feel right?",
            )}
          </h2>
          <p>
            {t(
              "Septiņi mazi jautājumi. Trīs pārdomātas ziedu idejas. Atrodi pušķi viņu stāstam.",
              "Семь простых вопросов. Три продуманные цветочные идеи. Найдите букет для их истории.",
              "Seven little questions. Three thoughtful ideas. Find the bouquet for their story.",
            )}
          </p>
          <Link className="btn" to="/match">
            {t("Atrast manus ziedus", "Найти мои цветы", "Find my flowers")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="match-home-image">
          <img
            src={img("1563241527-3004b7be0ffd", 1000)}
            alt={t(
              "Maigs ziedu pušķis",
              "Нежный букет цветов",
              "A soft floral bouquet",
            )}
            loading="lazy"
          />
          <span>
            <Flower2 size={23} />
            {t(
              "MAZS ŽESTS. LIELA SAJŪTA.",
              "МАЛЕНЬКИЙ ЖЕСТ. БОЛЬШОЕ ЧУВСТВО.",
              "SMALL GESTURE. BIG FEELING.",
            )}
          </span>
        </div>
      </section>
      <section className="section ready-home">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t(
                "TAVS MIRKLIS IR TAGAD",
                "ВАШ МОМЕНТ — СЕЙЧАС",
                "YOUR MOMENT IS NOW",
              )}
            </span>
            <h2>
              {t(
                "Mazs pārsteigums jau gaida.",
                "Маленький сюрприз уже ждёт.",
                "A little surprise, already waiting.",
              )}
            </h2>
            <p>
              {t(
                "Pieejamie demo automāta pušķi. Tikai simulēti krājumi.",
                "Доступные демо-букеты автомата. Только имитация остатков.",
                "Available demo machine bouquets. Simulated stock only.",
              )}
            </p>
          </div>
          <Link className="text-link" to="/available">
            {t("Pieejams tagad", "Доступно сейчас", "Available now")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        {ready.length ? (
          <div className="recommendation-grid">
            {ready.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="panel">
            <p>
              {t(
                "Visi demo nodalījumi šobrīd aizņemti. Ieplāno nākamo skaisto mirkli.",
                "Все демо-ячейки сейчас заняты. Запланируйте следующий прекрасный момент.",
                "All demo compartments are occupied. Plan your next lovely moment.",
              )}
            </p>
            <Link className="text-link" to="/reserve">
              {t(
                "Rezervēt nākotnei",
                "Забронировать на будущее",
                "Reserve a future moment",
              )}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
