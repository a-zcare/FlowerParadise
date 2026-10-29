import type { Text } from "./data";
import type { DemoState } from "./models";
import { availability } from "./domain";
export interface PickupLocation {
  id: string;
  name: Text;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
  accessHours: Text;
  method: "pickup" | "delivery" | "vending";
  machineId?: string;
  compartmentCount: number;
  availability: "planned";
  maintenance: "demo-ready" | "maintenance";
}
export const pickupLocations: PickupLocation[] = [
  {
    id: "dvp-vending-01",
    name: [
      "Plānotais ziedu automāts · Daugavpils",
      "Планируемый цветочный автомат · Даугавпилс",
      "Planned flower vending · Daugavpils",
    ],
    address: null,
    coordinates: null,
    accessHours: [
      "24/7 iecere · Nav uzstādīts",
      "Концепция 24/7 · Не установлен",
      "24/7 concept · Not installed",
    ],
    method: "vending",
    machineId: "fp-machine-01",
    compartmentCount: 4,
    availability: "planned",
    maintenance: "demo-ready",
  },
  {
    id: "dvp-studio",
    name: [
      "Florista saņemšana · Koncepts",
      "Самовывоз у флориста · Концепция",
      "Florist pickup · Concept",
    ],
    address: null,
    coordinates: null,
    accessHours: [
      "Laiks pēc vienošanās · Nav atvērts",
      "По согласованию · Ещё не открыт",
      "By arrangement · Not open",
    ],
    method: "pickup",
    compartmentCount: 0,
    availability: "planned",
    maintenance: "demo-ready",
  },
  {
    id: "dvp-delivery",
    name: [
      "Piegāde Daugavpilī · Koncepts",
      "Доставка по Даугавпилсу · Концепция",
      "Daugavpils delivery · Concept",
    ],
    address: null,
    coordinates: null,
    accessHours: [
      "Maršruti un laiki vēl nav apstiprināti",
      "Маршруты и время ещё не утверждены",
      "Routes and times are not confirmed",
    ],
    method: "delivery",
    compartmentCount: 0,
    availability: "planned",
    maintenance: "demo-ready",
  },
];
export function locationMatches(
  s: DemoState,
  productId: string,
  locationId = "",
  method = "",
) {
  const location = pickupLocations.find((l) => l.id === locationId);
  if (locationId && !location) return false;
  if (location && method && location.method !== method) return false;
  const m = location?.method || method;
  if (
    location &&
    s.seasonal.discovery.unavailableLocations.includes(location.id)
  )
    return false;
  if (!m) return true;
  const methodLocation = pickupLocations.find((l) => l.method === m);
  if (
    methodLocation &&
    s.seasonal.discovery.unavailableLocations.includes(methodLocation.id)
  )
    return false;
  const a = availability(s, productId);
  if (m === "vending")
    return (
      a.slots.length > 0 &&
      !s.seasonal.discovery.unavailableLocations.includes("dvp-vending-01")
    );
  return ["pickup", "delivery"].includes(m) && a.studio > 0;
}
