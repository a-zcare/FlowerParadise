import type { SeasonalState } from "./seasonal-state";
import type { Lang, Product } from "./data";
export interface ProductOptions {
  size: "S" | "M" | "L";
  color: number;
  wrapping: "ivory" | "kraft" | "rose";
  card: boolean;
  extraGift: boolean;
  method: "pickup" | "delivery";
  date?: string;
  time?: string;
  locationId?: string;
}
export interface CartItem {
  id: string;
  qty: number;
  note?: string;
  price?: number;
  options?: ProductOptions;
}
export interface Reservation {
  quantity?: number;
  wrapping?: string;
  id: string;
  product: string;
  date: string;
  time: string;
  method: string;
  code: string;
  status: string;
  message?: string;
  expiresAt?: string;
}
export interface Reminder {
  id: string;
  name: string;
  event: string;
  date: string;
  annual: boolean;
  days: number;
  channel: string;
  snoozed?: boolean;
  dismissed?: boolean;
}
export interface Order {
  locationId?: string;
  id: string;
  date: string;
  time?: string;
  message?: string;
  total: number;
  items: CartItem[];
  method: string;
}
export interface Subscription {
  audience?: "home" | "corporate";
  quantity?: number;
  id: string;
  frequency: string;
  months: number;
  price: number;
  method: string;
  preference: string;
}
export interface Gift {
  id: string;
  recipient?: string;
  date?: string;
  amount: number;
  message: string;
  code: string;
  redeemed: boolean;
}
export type FreshnessStatus =
  | "fresh"
  | "monitor"
  | "discount"
  | "remove"
  | "discarded";
export interface InventoryBatch {
  id: string;
  productId: string;
  quantity: number;
  receivedDate: string;
  assemblyDate: string;
  sellBy: string;
  status: FreshnessStatus;
  location: "studio" | string;
  unitCost: number;
}
export interface Compartment {
  id: string;
  productId: string;
  batchId: string;
  status: "available" | "reserved" | "collected" | "maintenance";
  reservationId?: string;
}
export interface FreshnessRules {
  monitor: number;
  discount: number;
  remove: number;
}
export interface WasteRecord {
  id: string;
  batchId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  reason: string;
  date: string;
}
export type MaintenanceType =
  | "inspection"
  | "temperature"
  | "cleaning"
  | "restock"
  | "compartment"
  | "payment"
  | "connectivity"
  | "lock"
  | "fault";
export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  date: string;
  due: string;
  temperature?: number;
  compartment: string;
  notes: string;
  resolved: boolean;
  sample?: boolean;
}
export interface GiftPlan {
  year: number;
  reminderId: string;
  productId: string;
  budget: number;
  completed: boolean;
}
export interface SecretGift {
  reservationId?: string;
  pickupCode?: string;
  slotId?: string;
  id: string;
  productId: string;
  recipient: string;
  message: string;
  revealDate: string;
  animation: "petals" | "envelope" | "simple";
  pickup: "vending" | "pickup";
  code: string;
  redeemed: boolean;
  createdAt: string;
}
export interface Campaign {
  id: string;
  code: string;
  percent: number;
  productIds: string[];
  active: boolean;
}
export interface Costs {
  price: number;
  flowers: number;
  packaging: number;
  feePercent: number;
  spoilagePercent: number;
  rent: number;
  electricity: number;
  transport: number;
  maintenance: number;
  marketing: number;
  dailySales: number;
  days: number;
  machine: number;
  startup: number;
  grant: number;
  restocksPerDay: number;
  useRecordedWaste: boolean;
}
export interface DemoState {
  schemaVersion: 2;
  seasonal: SeasonalState;
  lang: Lang;
  dark: boolean;
  cart: CartItem[];
  wishlist: string[];
  reservations: Reservation[];
  reminders: Reminder[];
  orders: Order[];
  subscriptions: Subscription[];
  gifts: Gift[];
  catalog: Product[];
  picked: number[];
  preferences: { channel: string; fresh: boolean };
  promo: string;
  comparison: string[];
  batches: InventoryBatch[];
  compartments: Compartment[];
  freshnessRules: FreshnessRules;
  waste: WasteRecord[];
  maintenance: MaintenanceRecord[];
  costs: Costs;
  giftPlans: GiftPlan[];
  secretGifts: SecretGift[];
  campaigns: Campaign[];
}
