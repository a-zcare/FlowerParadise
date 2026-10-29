import type { Product, Text } from "./data";
export interface CatalogEdit {
  id: string;
  name: Text;
  price: number;
}
export function parseCatalogEdits(
  text: string,
  catalog: Product[],
): CatalogEdit[] {
  const rows: unknown = JSON.parse(text);
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > catalog.length)
    throw new Error("rows");
  const known = new Set(catalog.map((p) => p.id));
  const seen = new Set<string>();
  return rows.map((row) => {
    if (!row || typeof row !== "object") throw new Error("row");
    const { id, name, price } = row;
    if (
      typeof id !== "string" ||
      !known.has(id) ||
      seen.has(id) ||
      !Array.isArray(name) ||
      name.length !== 3 ||
      !name.every(
        (n) => typeof n === "string" && n.trim().length > 0 && n.length <= 160,
      ) ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 1 ||
      price > 500
    )
      throw new Error("fields");
    seen.add(id);
    return {
      id,
      name: name.map((n) => n.trim()) as Text,
      price: Math.round(price * 100) / 100,
    };
  });
}
