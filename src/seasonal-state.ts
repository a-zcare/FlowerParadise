import type { Text } from "./data";
export type NotificationKind =
  | "order"
  | "pickup"
  | "reservation"
  | "date"
  | "launch"
  | "stock"
  | "offer"
  | "newOrder"
  | "newLead"
  | "lowStock"
  | "expiring"
  | "fault"
  | "temperature"
  | "summary";
export interface NotificationEntry {
  id: string;
  kind: NotificationKind;
  channel: string;
  date: string;
}
export interface SeasonalState {
  discovery: {
    defaultTheme: string;
    unavailableLocations: string[];
    hiddenArticles: string[];
    articleNotes: Record<string, Text>;
    faqAnswer: Text | null;
  };
  campaign: {
    enabled: boolean;
    start: string;
    end: string;
    prelaunch: boolean;
    sections: number[];
    featured: string[];
  };
  interests: string[];
  launchInterest: boolean;
  adventOpened: number[];
  survey: {
    budget: string;
    location: string;
    time: string;
    vending: string;
    completed: boolean;
  };
  notifications: {
    transactional: boolean;
    marketing: boolean;
    admin: boolean;
    channel: string;
    log: NotificationEntry[];
  };
}
export const seasonalDefaults = (): SeasonalState => ({
  discovery: {
    defaultTheme: "original",
    unavailableLocations: [],
    hiddenArticles: [],
    articleNotes: {},
    faqAnswer: null,
  },
  campaign: {
    enabled: true,
    start: "2026-10-01",
    end: "2027-01-07",
    prelaunch: true,
    sections: [0, 1, 2, 3, 4, 5, 6, 7],
    featured: ["xm-001", "xm-018", "xm-034", "xm-052"],
  },
  interests: [],
  launchInterest: false,
  adventOpened: [],
  survey: {
    budget: "25-50",
    location: "centre",
    time: "evening",
    vending: "yes",
    completed: false,
  },
  notifications: {
    transactional: true,
    marketing: false,
    admin: true,
    channel: "Email",
    log: [],
  },
});
export const notificationTemplates: Record<NotificationKind, Text> = {
  order: [
    "Demo pasūtījums ir apstiprināts. Nav īsta maksājuma.",
    "Демо-заказ подтверждён. Реального платежа нет.",
    "Your demo order is confirmed. No real payment.",
  ],
  pickup: [
    "Tavs demo pušķis gaida. Izmanto lokālo saņemšanas kodu.",
    "Демо-букет ждёт. Используйте локальный код получения.",
    "Your demo bouquet is waiting. Use your local pickup code.",
  ],
  reservation: [
    "Demo rezervācijas statuss ir atjaunināts.",
    "Статус демо-бронирования обновлён.",
    "Your demo reservation status has been updated.",
  ],
  date: [
    "Svarīgs datums tuvojas. Izvēlies sirsnīgu dāvanu.",
    "Приближается важная дата. Выберите тёплый подарок.",
    "An important date is coming. Choose a thoughtful gift.",
  ],
  launch: [
    "Flower Paradise atklāšanas ziņas — demonstrācijas priekšskatījums.",
    "Новости запуска Flower Paradise — демонстрационный просмотр.",
    "Flower Paradise launch news — a demonstration preview.",
  ],
  stock: [
    "Jauni demo pušķi katalogā. Nav reāllaika krājumu.",
    "Новые демо-букеты в каталоге. Остатки не в реальном времени.",
    "Fresh demo bouquets in the catalog. Not live inventory.",
  ],
  offer: [
    "Ziemassvētku idejas un lokālas demo akcijas.",
    "Рождественские идеи и локальные демо-акции.",
    "Christmas inspiration and local demo offers.",
  ],
  newOrder: [
    "Pievienots jauns demo pasūtījums.",
    "Добавлен новый демо-заказ.",
    "A new demo order was added.",
  ],
  newLead: [
    "Lokāli saglabāta demo interese. Nav nosūtīts īsts pieteikums.",
    "Демо-интерес сохранён локально. Реальная заявка не отправлена.",
    "Demo interest saved locally. No real lead was submitted.",
  ],
  lowStock: [
    "Demo krājumu līmenis ir zems. Pārbaudi partijas.",
    "Низкий демо-остаток. Проверьте партии.",
    "Demo stock is low. Review inventory batches.",
  ],
  expiring: [
    "Demo partija tuvojas izņemšanas datumam.",
    "Демо-партия приближается к дате снятия.",
    "A demo batch is approaching its removal date.",
  ],
  fault: [
    "Demo automāta kļūme. Pārbaudi apkopes žurnālu.",
    "Демо-неисправность автомата. Проверьте журнал обслуживания.",
    "Demo vending fault. Review the maintenance log.",
  ],
  temperature: [
    "Demo temperatūras brīdinājums. Nav sensoru savienojuma.",
    "Демо-предупреждение о температуре. Датчики не подключены.",
    "Demo temperature alert. No sensors are connected.",
  ],
  summary: [
    "Dienas demo kopsavilkums šajā pārlūkā.",
    "Дневной демо-отчёт в этом браузере.",
    "Daily demo summary in this browser.",
  ],
};
export const notificationLabels: Record<NotificationKind, Text> = {
  order: ["Pasūtījums", "Заказ", "Order confirmation"],
  pickup: ["Saņemšana", "Получение", "Pickup reminder"],
  reservation: ["Rezervācija", "Бронирование", "Reservation status"],
  date: ["Svarīgi datumi", "Важные даты", "Important dates"],
  launch: ["Atklāšana", "Запуск", "Launch announcements"],
  stock: ["Svaigi pušķi", "Новые букеты", "Fresh stock"],
  offer: ["Sezonas piedāvājumi", "Сезонные предложения", "Seasonal offers"],
  newOrder: ["Jauns pasūtījums", "Новый заказ", "New order"],
  newLead: ["Jauna interese", "Новый интерес", "New lead"],
  lowStock: ["Zemi krājumi", "Низкий остаток", "Low inventory"],
  expiring: ["Partiju termiņš", "Сроки партий", "Expiring products"],
  fault: ["Automāta kļūmes", "Сбои автомата", "Vending faults"],
  temperature: ["Temperatūra", "Температура", "Temperature alerts"],
  summary: ["Dienas kopsavilkums", "Дневной отчёт", "Daily summary"],
};
export function migrateSeasonal(raw: unknown): SeasonalState {
  const d = seasonalDefaults();
  if (!raw || typeof raw !== "object") return d;
  const x = raw as Partial<SeasonalState>;
  if (x.campaign) {
    const c = x.campaign;
    d.campaign = {
      ...d.campaign,
      enabled: typeof c.enabled === "boolean" ? c.enabled : true,
      prelaunch: typeof c.prelaunch === "boolean" ? c.prelaunch : true,
      start: /^2026-\d\d-\d\d$/.test(c.start) ? c.start : d.campaign.start,
      end: /^202[67]-\d\d-\d\d$/.test(c.end) ? c.end : d.campaign.end,
      sections: Array.isArray(c.sections)
        ? [
            ...new Set(
              c.sections.filter((n) => Number.isInteger(n) && n >= 0 && n < 9),
            ),
          ]
        : d.campaign.sections,
      featured: Array.isArray(c.featured)
        ? c.featured.filter((id) => /^xm-\d{3}$/.test(id)).slice(0, 8)
        : d.campaign.featured,
    };
  }
  d.interests = Array.isArray(x.interests)
    ? [
        ...new Set(
          x.interests.filter(
            (id) => typeof id === "string" && /^(xm|fp)-[\d]+$/.test(id),
          ),
        ),
      ]
    : [];
  d.launchInterest = x.launchInterest === true;
  d.adventOpened = Array.isArray(x.adventOpened)
    ? [
        ...new Set(
          x.adventOpened.filter(
            (n) => Number.isInteger(n) && n >= 1 && n <= 24,
          ),
        ),
      ]
    : [];
  if (x.survey) {
    for (const k of ["budget", "location", "time", "vending"] as const)
      if (typeof x.survey[k] === "string")
        d.survey[k] = x.survey[k].slice(0, 100);
    d.survey.completed = x.survey.completed === true;
  }
  if (x.notifications) {
    const n = x.notifications;
    d.notifications = {
      transactional: n.transactional !== false,
      marketing: n.marketing === true,
      admin: n.admin !== false,
      channel: ["Email", "Telegram"].includes(n.channel) ? n.channel : "Email",
      log: Array.isArray(n.log)
        ? n.log
            .filter(
              (v) =>
                v &&
                typeof v.id === "string" &&
                Object.hasOwn(notificationTemplates, v.kind) &&
                typeof v.date === "string" &&
                ["Email", "Telegram"].includes(v.channel),
            )
            .slice(-50)
        : [],
    };
  }
  if (x.discovery) {
    const v = x.discovery;
    if (typeof v.defaultTheme === "string")
      d.discovery.defaultTheme = v.defaultTheme.slice(0, 40);
    for (const key of ["unavailableLocations", "hiddenArticles"] as const)
      if (Array.isArray(v[key]))
        d.discovery[key] = v[key]
          .filter((id) => typeof id === "string")
          .slice(0, 30);
    if (v.articleNotes && typeof v.articleNotes === "object")
      for (const [id, note] of Object.entries(v.articleNotes))
        if (
          Array.isArray(note) &&
          note.length === 3 &&
          note.every((n) => typeof n === "string")
        )
          d.discovery.articleNotes[id] = note.map((n) =>
            n.slice(0, 2000),
          ) as Text;
    if (
      Array.isArray(v.faqAnswer) &&
      v.faqAnswer.length === 3 &&
      v.faqAnswer.every((n) => typeof n === "string")
    )
      d.discovery.faqAnswer = v.faqAnswer.map((n) => n.slice(0, 2000)) as Text;
  }
  return d;
}
// Replace this adapter only after secure server-side consent and storage exist.
export const leadAdapter = {
  submitDemo: async () => ({
    submitted: false as const,
    scope: "this-browser" as const,
  }),
};
