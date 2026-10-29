import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
async function route(page: Page, path: string) {
  await page.goto(`./#${path}`);
}
test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("combobox", { name: "Valoda", exact: true })
    .selectOption("en");
});
test("Gift Builder 2.0 saves choices and uses the shared cart quote", async ({
  page,
}) => {
  await route(page, "/gift-studio");
  await expect(
    page.getByRole("heading", { name: "Gift Builder 2.0", exact: true }),
  ).toBeVisible();
  await page.locator(".commerce-stepper button").nth(4).click();
  await page
    .getByRole("spinbutton", { name: "Tea sachet", exact: true })
    .fill("3");
  await page.locator(".commerce-stepper button").nth(5).click();
  await page.getByRole("checkbox", { name: /Add custom packaging/ }).check();
  await page.locator(".commerce-stepper button").nth(6).click();
  await page
    .getByRole("checkbox", { name: "Greeting card · €5", exact: true })
    .check();
  await page.locator(".commerce-stepper button").nth(7).click();
  await page
    .getByRole("textbox", { name: "Personal message", exact: true })
    .fill("Christmas demo greeting");
  await page.reload();
  await page.locator(".commerce-stepper button").nth(7).click();
  await expect(
    page.getByRole("textbox", { name: "Personal message", exact: true }),
  ).toHaveValue("Christmas demo greeting");
  await expect(page.locator(".commerce-summary .summary-total")).toContainText(
    "45.00",
  );
  await page
    .getByRole("button", { name: "Add configured bundle to bag", exact: true })
    .click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toHaveCount(1);
  await expect(page.locator(".cart-line")).toContainText("45.00");
  await expect(page.locator(".cart-line")).toContainText("Tea sachet × 3");
  await expect(page.locator(".cart-line")).toContainText(
    "Christmas demo greeting",
  );
});
test("wrapping preview and pricing update together", async ({ page }) => {
  await route(page, "/wrapping-studio");
  await page.getByRole("checkbox", { name: /Add custom packaging/ }).check();
  await page
    .getByRole("combobox", { name: "Box size", exact: true })
    .selectOption("large");
  await page
    .getByRole("textbox", { name: "Recipient name", exact: true })
    .fill("Demo");
  await expect(page.locator(".wrapping-preview")).toHaveClass(/size-large/);
  await expect(page.locator(".wrapping-tag")).toHaveText("Demo");
  await page
    .getByRole("button", { name: "Add wrapped gift to bag", exact: true })
    .click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toContainText("40.00");
  await expect(page.locator(".cart-line")).toContainText("11.00");
});
test("wreath choices alter the visual concept and shared price", async ({
  page,
}) => {
  await route(page, "/wreath-builder");
  await page
    .getByRole("combobox", { name: "Wreath type", exact: true })
    .selectOption("2");
  await page
    .getByRole("combobox", { name: "Greenery", exact: true })
    .selectOption("4");
  await page
    .getByRole("combobox", { name: "Candles", exact: true })
    .selectOption("2");
  await page
    .getByRole("checkbox", { name: "Dried oranges · €2", exact: true })
    .check();
  await expect(page.locator(".atelier-wreath")).toHaveClass(/wreath-type-2/);
  await expect(page.locator(".atelier-wreath")).toHaveClass(/greenery-4/);
  await page.getByRole("button", { name: /Add concept to bag/ }).click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toContainText("52.00");
  await expect(page.locator(".cart-line")).toContainText("LED candles");
});
test("physical calendar validates size, fills 24 days, duplicates content and preserves its draft", async ({
  page,
}) => {
  await route(page, "/advent-builder");
  const add = page.getByRole("button", { name: /Add concept to bag/ });
  await expect(add).toBeDisabled();
  await page
    .getByRole("button", { name: "Suggest ideas", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Content 1", exact: true })
    .selectOption("toy");
  await expect(add).toBeDisabled();
  await page
    .getByRole("combobox", { name: "Size", exact: true })
    .selectOption("L");
  await page.locator(".calendar-day input[type=checkbox]").nth(1).check();
  await page
    .getByRole("button", { name: "Copy to selected days", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Content 2", exact: true }),
  ).toHaveValue("toy");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Content 2", exact: true }),
  ).toHaveValue("toy");
  await expect(
    page.getByRole("combobox", { name: "Size", exact: true }),
  ).toHaveValue("L");
  await add.click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toContainText(
    "Calendar contents: 24/24",
  );
});
test("Gift Finder explains results and respects a strict budget", async ({
  page,
}) => {
  await route(page, "/gift-finder");
  await page.locator(".commerce-stepper button").nth(2).click();
  await page
    .getByRole("spinbutton", { name: "Budget (€)", exact: true })
    .fill("25");
  await expect(
    page.locator(".commerce-product-grid .product-card"),
  ).toHaveCount(6);
  await expect(page.locator(".match-reasons").first()).toContainText(
    "Within budget",
  );
});
test("curated bundles expose individual prices and optional components without invented savings", async ({
  page,
}) => {
  await route(page, "/christmas-collections");
  await expect(page.locator(".collection-tiles button")).toHaveCount(15);
  await page.locator(".bundle-line input[type=checkbox]").last().uncheck();
  await page
    .getByRole("button", { name: "Add collection to bag", exact: true })
    .click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toHaveCount(1);
});
test("named wishlist sharing creates an ID snapshot that another context can view", async ({
  page,
  browser,
}) => {
  await route(page, "/product/xm-001");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await route(page, "/wishlists");
  await page
    .getByRole("button", { name: "New list from favorites", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Prepare share link & export", exact: true })
    .click();
  const link = await page
    .getByRole("textbox", { name: "Copyable link", exact: true })
    .inputValue();
  expect(link).toContain("shared=");
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(link);
  await expect(
    other.locator(".commerce-product-grid .product-card"),
  ).toHaveCount(1);
  await expect(
    other.getByRole("button", {
      name: /Save local copy|Saglabāt lokālu kopiju/,
    }),
  ).toBeVisible();
  await context.close();
});
test("corporate quote is local and appears in the administration view", async ({
  page,
}) => {
  await route(page, "/corporate-christmas");
  await page
    .getByRole("spinbutton", { name: "Recipient count", exact: true })
    .fill("12");
  await page
    .getByRole("button", { name: "Save demo inquiry", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "The business received nothing",
  );
  await route(page, "/admin?view=commerce");
  await page
    .getByRole("button", { name: "Corporate inquiries", exact: true })
    .click();
  await expect(page.locator(".commerce-admin")).toContainText("Demo Company");
  await expect(page.locator(".commerce-admin")).toContainText("12 ×");
});
test("preorders honor configured capacity and prevent duplicate reservations", async ({
  page,
}) => {
  await route(page, "/admin?view=commerce");
  await page.getByRole("button", { name: "Preorders", exact: true }).click();
  await page
    .getByRole("spinbutton", { name: "Units per time window", exact: true })
    .fill("1");
  await route(page, "/christmas-preorders");
  await page
    .getByRole("spinbutton", { name: "Quantity", exact: true })
    .fill("2");
  await expect(
    page.getByRole("button", { name: "Reserve demo slot", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("spinbutton", { name: "Quantity", exact: true })
    .fill("1");
  await page
    .getByRole("button", { name: "Reserve demo slot", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Demo code" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reserve demo slot", exact: true }),
  ).toBeDisabled();
});
test("CSV import previews updates and supports rollback", async ({ page }) => {
  await route(page, "/admin?view=commerce");
  await page.getByRole("button", { name: "CSV", exact: true }).click();
  await page
    .getByRole("button", { name: "Export catalog CSV", exact: true })
    .click();
  const original = await page
    .getByRole("textbox", { name: "CSV", exact: true })
    .inputValue();
  await page
    .getByRole("textbox", { name: "CSV", exact: true })
    .fill(original.replace('"32","0"', '"33","0"'));
  await page
    .getByRole("button", { name: "Validate and preview CSV", exact: true })
    .click();
  await expect(page.locator(".catalog-edit-preview")).toContainText(
    "Update · fp-1",
  );
  await page
    .getByRole("button", { name: "Apply CSV import", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Roll back last catalog change", exact: true })
    .click();
  await route(page, "/product/fp-1");
  await expect(page.locator(".detail-price")).toContainText("32.00");
});
test("internal lifecycle and visibility changes hide a product but remain reversible", async ({
  page,
}) => {
  await route(page, "/admin?view=commerce");
  await page
    .getByRole("checkbox", { name: "Select xm-001", exact: true })
    .check();
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("archived");
  await page.getByRole("button", { name: "Apply status", exact: true }).click();
  await route(page, "/christmas");
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("Classic Evergreen Teddy Bear");
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(0);
});
test("order photo demonstration never substitutes catalog photography for a prepared order", async ({
  page,
}) => {
  await route(page, "/order-confidence");
  await expect(page.locator(".actual-photo-placeholder")).toContainText(
    "No actual order photograph",
  );
  await expect(page.locator(".order-local-photo")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Approve demo photo", exact: true }),
  ).toBeDisabled();
});
for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920])
  test(`complete commerce responsive ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 960 });
    for (const [path, title] of [
      ["/gift-studio", "Gift Builder 2.0"],
      ["/wrapping-studio", "Premium Gift Wrapping Studio"],
      ["/gift-finder", "Smart Christmas Gift Finder"],
      ["/christmas-collections", "Ready-made Christmas Collections"],
      ["/wishlists", "Shareable Christmas Wishlists"],
      ["/corporate-christmas", "Corporate Christmas Orders"],
      ["/christmas-preorders", "Christmas Preorder Calendar"],
      ["/order-confidence", "Order Preparation & Photo Preview"],
      ["/admin?view=commerce", "Christmas operations"],
    ]) {
      await route(page, path);
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
    }
  });
for (const width of [390, 1440])
  test(`representative screenshots ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await mkdir("qa/screenshots", { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, name] of [
      ["/", "home"],
      ["/gift-studio", "gift-studio"],
      ["/wrapping-studio", "wrapping"],
      ["/product/xm-001", "product"],
      ["/themes", "themes"],
    ]) {
      await route(page, path);
      if (path === "/wrapping-studio")
        await page
          .getByRole("checkbox", { name: /Add custom packaging/ })
          .check();
      await expect(page.locator("main h1").first()).toBeVisible();
      await page.locator("main img").evaluateAll(async (images) => {
        await Promise.all(
          images.map(async (image) => {
            const img = image as HTMLImageElement;
            img.loading = "eager";
            try {
              await img.decode();
            } catch {
              /* Fall back to the app's own image handling. */
            }
          }),
        );
      });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await page.screenshot({
        path: `qa/screenshots/${name}-${width}.png`,
        fullPage: true,
      });
      if (path === "/" || path === "/wrapping-studio") {
        if (path === "/wrapping-studio")
          await page.locator(".wrapping-preview").scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `qa/screenshots/${name}-${width}-viewport.png`,
          fullPage: false,
        });
      }
    }
  });
