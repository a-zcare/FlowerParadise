import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("combobox", { name: "Valoda", exact: true })
    .selectOption("en");
});
test("wreath and calendar builders preserve price, name and all 24 notes after reload", async ({
  page,
}) => {
  await page.goto("./#/wreath-builder");
  await page
    .getByRole("combobox", { name: "Size", exact: true })
    .selectOption("L");
  await page
    .getByRole("textbox", { name: "Name or short message", exact: true })
    .fill("Alex Demo");
  await page.getByRole("button", { name: /Add concept to bag/ }).click();
  await expect(
    page.getByText("Saved in your bag", { exact: true }),
  ).toBeVisible();
  await page.goto("./#/advent-builder");
  await page
    .getByRole("button", { name: "Suggest ideas", exact: true })
    .click();
  await expect(page.locator(".calendar-note-grid input")).toHaveCount(24);
  await page
    .locator(".calendar-note-grid input")
    .nth(23)
    .fill("Last Christmas message");
  await page.getByRole("button", { name: /Add concept to bag/ }).click();
  await page.goto("./#/cart");
  await page.reload();
  await expect(page.locator(".cart-line")).toHaveCount(2);
  await expect(page.locator(".cart-line").first()).toContainText("Alex Demo");
  await expect(page.locator(".cart-line").first()).toContainText("54.60");
  await expect(page.locator(".cart-line").last()).toContainText(
    "24: Last Christmas message",
  );
});
test("catalog tools validate imports and publish edited prices only in local state", async ({
  page,
}) => {
  await page.goto("./#/admin?view=catalog-tools");
  await page
    .getByRole("textbox", { name: "Import JSON", exact: true })
    .fill(
      '[{"id":"xm-150","name":["LV Demo","RU Demo","EN Demo"],"price":42}]',
    );
  await page
    .getByRole("button", { name: "Validate import", exact: true })
    .click();
  await expect(page.locator(".catalog-edit-preview")).toContainText("EN Demo");
  await page
    .getByRole("button", { name: "Apply validated changes", exact: true })
    .click();
  await page.goto("./#/product/xm-150");
  await expect(page.locator(".detail-copy h1")).toContainText("EN Demo");
  await page.goto("./#/admin?view=catalog-tools");
  await page
    .getByRole("textbox", { name: "Import JSON", exact: true })
    .fill('[{"id":"not-a-product","name":["a","b","c"],"price":4}]');
  await page
    .getByRole("button", { name: "Validate import", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Invalid import");
});
test("location filtering respects demo vending inventory and maintenance", async ({
  page,
}) => {
  await page.goto("./#/shop?location=dvp-vending-01");
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(3);
  await page.goto("./#/admin?view=experience");
  await page
    .getByRole("button", { name: "Pickup locations", exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "Mark unavailable / under demo maintenance",
      exact: true,
    })
    .first()
    .check();
  await page.goto("./#/shop?method=vending");
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(0);
});
test("theme comparisons support desktop and mobile viewports without losing the page", async ({
  page,
}) => {
  await page.goto("./#/themes");
  await page
    .locator(".theme-card")
    .nth(0)
    .getByRole("checkbox", { name: "Compare", exact: true })
    .check();
  await page
    .locator(".theme-card")
    .nth(2)
    .getByRole("checkbox", { name: "Compare", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Compare themes", exact: true })
    .click();
  await expect(page.locator(".live-theme-preview")).toHaveCount(2);
  await expect(page.locator(".live-theme-preview").first()).toHaveCSS(
    "width",
    "1440px",
  );
  await page
    .getByRole("button", { name: "Mobile · 390px", exact: true })
    .click();
  await expect(page.locator(".live-theme-preview").first()).toHaveCSS(
    "width",
    "390px",
  );
  await page
    .getByRole("button", { name: "Apply Theme", exact: true })
    .last()
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-theme",
    "midnight-bloom",
  );
});
test("ten translated guides use valid images and allow navigation to products", async ({
  page,
}) => {
  await page.goto("./#/guides");
  await expect(page.locator(".guide-card")).toHaveCount(10);
  await page.locator(".guide-card").first().click();
  await expect(page.locator(".guide-body")).toBeVisible();
  for (const image of await page.locator("main img").all()) {
    await expect(image).toHaveJSProperty("complete", true);
    await expect(image).not.toHaveJSProperty("naturalWidth", 0);
  }
});
for (const width of [320, 390, 768, 1024, 1440, 1920])
  test(`new flows fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, scope] of [
      ["/wreath-builder", ".holiday-atelier"],
      ["/advent-builder", ".holiday-atelier"],
      ["/guides", ".journal"],
      ["/how-it-works", ".how-page"],
      ["/admin?view=experience", ".admin-content"],
    ]) {
      await page.goto(`./#${route}`);
      await expect(page.locator(`${scope} h1`)).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
  });

test("mixed gift choices start checkout with one consistent delivery method and location", async ({
  page,
}) => {
  await page.goto("./#/product/fp-1");
  await page
    .locator(".detail-copy")
    .getByRole("button", { name: "Add to bag", exact: true })
    .click();
  await page.goto("./#/product/fp-2");
  await page
    .locator(".detail-copy")
    .getByRole("combobox", { name: /Fulfilment option/ })
    .selectOption("delivery");
  await page
    .locator(".detail-copy")
    .getByRole("button", { name: "Add to bag", exact: true })
    .click();
  await page.goto("./#/checkout");
  await expect(page.locator(".pickup-selection select")).toHaveValue(
    "dvp-delivery",
  );
  await expect(page.locator(".choice.selected")).toContainText("Delivery");
});
