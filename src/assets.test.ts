import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { photos, products } from "./data";
describe("bundled photography", () => {
  it("provides small and large WebP files for every product", () => {
    for (const id of new Set([...photos,...products.map(p=>p.photo)])) {
      for (const suffix of ["", "-large"]) {
        const path = join(
          process.cwd(),
          "public",
          "images",
          `${id}${suffix}.webp`,
        );
        expect(existsSync(path), path).toBe(true);
        const bytes = readFileSync(path);
        expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
        expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
      }
    }
  });
  it("provides every editorial image referenced by the home page", () => {
    const source = readFileSync(join(process.cwd(), "src/App.tsx"), "utf8");
    const ids = [...source.matchAll(/"(\d+-[a-z0-9]+)"/g)].map((x) => x[1]);
    expect(ids.length).toBeGreaterThan(4);
    for (const id of ids)
      expect(
        existsSync(join(process.cwd(), "public", "images", `${id}.webp`)),
        id,
      ).toBe(true);
  });
});
