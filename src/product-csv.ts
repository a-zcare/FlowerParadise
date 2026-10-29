import type { Product, Text } from "./data";
import type { ProductMeta } from "./commerce-model";
import { lifecycle, validProduct } from "./commerce";
export const csvColumns = [
  "id",
  "name_lv",
  "name_ru",
  "name_en",
  "price",
  "category",
  "status",
  "visible",
  "seasonal",
  "photo",
  "dimensions",
  "materials_lv",
  "materials_ru",
  "materials_en",
  "description_lv",
  "description_ru",
  "description_en",
  "care_lv",
  "care_ru",
  "care_en",
];
const safeCell = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);
export function exportProductCsv(
  products: Product[],
  meta: Record<string, ProductMeta>,
) {
  const rows = products.map((p) => [
    p.id,
    ...p.name,
    String(p.price),
    String(p.category),
    meta[p.id]?.status || "concept",
    String(meta[p.id]?.visible !== false),
    String(meta[p.id]?.seasonal ?? !!p.seasonal),
    p.photo,
    p.size,
    ...p.composition,
    ...p.description,
    ...p.care,
  ]);
  return [csvColumns, ...rows]
    .map((row) =>
      row.map((v) => `"${safeCell(v).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}
export function readCsv(text: string): string[][] {
  if (text.length > 2e6) throw Error("size");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let ended = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          ended = true;
        }
      } else cell += ch;
    } else if (ch === '"') {
      if (cell || ended) throw Error("quotes");
      quoted = true;
    } else if (ch === "," || ch === "\n" || ch === "\r") {
      row.push(cell.replace(/^'(?=[=+\-@\t\r])/, ""));
      cell = "";
      ended = false;
      if (ch !== ",") {
        if (row.some((v) => v !== "")) rows.push(row);
        row = [];
        if (ch === "\r" && text[i + 1] === "\n") i++;
      }
    } else {
      if (ended) throw Error("quotes");
      cell += ch;
    }
    if (rows.length > 500) throw Error("rows");
  }
  if (quoted) throw Error("quotes");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
export interface CsvProduct {
  product: Product;
  meta: ProductMeta;
  action: "create" | "update";
}
export function previewProductCsv(
  text: string,
  catalog: Product[],
  knownImages: Set<string>,
) {
  const errors: string[] = [];
  const result: CsvProduct[] = [];
  let rows: string[][];
  try {
    rows = readCsv(text);
  } catch {
    return { errors: ["CSV: malformed quoting, size or row limit"], rows: [] };
  }
  const header = rows.shift() || [];
  if (header.join(",") !== csvColumns.join(","))
    return { errors: ["CSV: header/schema mismatch"], rows: [] };
  const seen = new Set<string>();
  rows.forEach((cells, i) => {
    const error = (field: string) => errors.push(`${i + 2}: ${field}`);
    if (cells.length !== csvColumns.length) {
      error("columns");
      return;
    }
    const r = Object.fromEntries(header.map((h, j) => [h, cells[j]]));
    if (seen.has(r.id)) {
      error("duplicate ID");
      return;
    }
    seen.add(r.id);
    const existing = catalog.find((p) => p.id === r.id);
    if (!existing && !/^demo-[a-zA-Z0-9-]+$/.test(r.id)) {
      error("new ID must start demo-");
      return;
    }
    const base =
      existing ||
      catalog.find((p) => p.category === Number(r.category)) ||
      catalog[0];
    const triple = (key: string) =>
      ["lv", "ru", "en"].map((l) => r[`${key}_${l}`]) as Text;
    const p: Product = {
      ...base,
      id: r.id,
      name: triple("name"),
      price: Number(r.price),
      category: Number(r.category),
      photo: r.photo,
      size: r.dimensions,
      composition: triple("materials"),
      description: triple("description"),
      care: triple("care"),
      stock: existing?.stock || 0,
    };
    if (!validProduct(p)) {
      error("product fields / translations / price / category");
      return;
    }
    if (!knownImages.has(p.photo)) {
      error("unknown image");
      return;
    }
    if (
      !lifecycle.some((s) => s.id === r.status) ||
      !["true", "false"].includes(r.visible) ||
      !["true", "false"].includes(r.seasonal)
    ) {
      error("status / visibility / seasonal");
      return;
    }
    if (p.category >= 12 && !p.seasonal) {
      error("seasonal metadata requires a seasonal template");
      return;
    }
    if (p.category < 12) {
      delete p.seasonal;
      p.availabilityType = "pickup-delivery";
    } else
      p.seasonal = {
        ...p.seasonal!,
        materials: p.composition,
        dimensions: p.size,
      };
    result.push({
      product: p,
      meta: {
        status: r.status as ProductMeta["status"],
        visible: r.visible === "true",
        seasonal: r.seasonal === "true",
      },
      action: existing ? "update" : "create",
    });
  });
  return { errors, rows: errors.length ? [] : result };
}

// Catalog undo must never rewind orders, inventory consumption or customer drafts.
export function rollbackCatalog(
  state: import("./models").DemoState,
  backup: Pick<import("./models").DemoState, "catalog" | "commerce">,
): import("./models").DemoState {
  const previous = new Set(backup.catalog.map((p) => p.id));
  const added = state.catalog.filter((p) => !previous.has(p.id));
  const edits = { ...backup.commerce.edits };
  const meta = { ...backup.commerce.productMeta };
  for (const p of added) {
    if (state.commerce.edits[p.id]) edits[p.id] = state.commerce.edits[p.id];
    meta[p.id] = { status: "archived", visible: false, seasonal: !!p.seasonal };
  }
  return {
    ...state,
    catalog: [
      ...backup.catalog.map((p) => ({
        ...p,
        stock: state.catalog.find((x) => x.id === p.id)?.stock ?? p.stock,
      })),
      ...added,
    ],
    commerce: {
      ...state.commerce,
      edits,
      productMeta: meta,
      deleted: [
        ...new Set([...backup.commerce.deleted, ...added.map((p) => p.id)]),
      ],
      customProducts: [
        ...backup.commerce.customProducts,
        ...state.commerce.customProducts.filter((p) => !previous.has(p.id)),
      ],
    },
  };
}
