import { test, expect, type Page } from "@playwright/test";
async function route(page: Page, path: string) {
  await page.goto(`./#${path}`);
}
test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("combobox", { name: "Valoda", exact: true })
    .selectOption("en");
  await expect(page.locator(".christmas-hero h1")).toContainText(
    "A little wonder.",
  );
});
test("Christmas catalog has 157 records, loads efficiently and filters by category and recipient", async ({
  page,
}) => {
  await route(page, "/christmas");
  await expect(page.locator(".results")).toContainText("157");
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(36);
  await page.getByRole("button", { name: /Show more/ }).click();
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(72);
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("gnome");
  await expect(page.locator(".results")).toContainText("20");
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("");
  await page
    .getByRole("combobox", { name: "Recipient", exact: true })
    .selectOption("teachers");
  await expect(page.locator(".results")).toContainText("20");
  await route(page, "/shop");
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(36);
});
test("personalized holiday product survives cart refresh and interest is local", async ({
  page,
}) => {
  await route(page, "/product/xm-101");
  await page
    .getByRole("textbox", { name: "Name or ornament text", exact: true })
    .fill("Alex Demo");
  await expect(page.locator(".personalization-preview")).toContainText(
    "Alex Demo",
  );
  await page
    .getByRole("button", { name: "I’m interested", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Interest saved locally", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator(".detail-copy")
    .getByRole("button", { name: "Add to bag", exact: true })
    .click();
  await route(page, "/cart");
  await page.reload();
  await expect(page.locator(".cart-line")).toContainText("Alex Demo");
  await route(page, "/launch");
  await expect(page.locator(".launch-page")).toContainText(
    "Interest in this browser: 1",
  );
});
test("all 15 themes switch instantly without losing language or cart and can be compared", async ({
  page,
}) => {
  await route(page, "/shop");
  await page
    .locator(".product-card")
    .first()
    .getByRole("button", { name: "Add to bag", exact: true })
    .click();
  await route(page, "/themes");
  await expect(page.locator(".theme-card")).toHaveCount(15);
  for (const card of await page.locator(".theme-card").all()) {
    await card
      .getByRole("button", { name: /Apply Theme|Applied/, exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-theme",
    "modern-pop",
  );
  await page
    .locator(".theme-card")
    .nth(1)
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
  await expect(
    page.locator(".theme-compare-grid .live-theme-preview"),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Close / Aizvērt / Закрыть", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset to Original", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-theme",
    "original",
  );
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toHaveCount(1);
});
test("theme search and favorites work and the header picker opens accessibly", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Choose visual theme", exact: true })
    .click();
  await expect(page.locator("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Midnight Bloom · Apply Theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-theme",
    "midnight-bloom",
  );
  await route(page, "/themes");
  await page
    .getByRole("textbox", { name: "Search themes", exact: true })
    .fill("Emerald");
  await expect(page.locator(".theme-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Favorite theme: Emerald Luxury",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Search themes", exact: true })
    .fill("");
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.locator(".theme-card")).toHaveCount(1);
});
test("Advent calendar respects dates and preview mode can reveal a demo coupon", async ({
  page,
}) => {
  await route(page, "/advent");
  await expect(page.locator(".advent-door")).toHaveCount(24);
  if (Date.now() < Date.parse("2026-12-24T00:00:00+02:00"))
    await expect(
      page.getByRole("button", { name: "Window 24", exact: true }),
    ).toBeDisabled();
  await page
    .getByRole("checkbox", { name: "Preview all windows (demo)", exact: true })
    .check();
  await page.getByRole("button", { name: "Window 6", exact: true }).click();
  await expect(page.locator("dialog")).toContainText("ADVENT10");
  await page
    .getByRole("button", { name: "Activate demo coupon", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Close / Aizvērt / Закрыть", exact: true })
    .click();
  await expect(page.locator(".advent-door.opened")).toHaveCount(1);
});
test("holiday bundle enforces full budget including delivery and greeting card", async ({
  page,
}) => {
  await route(page, "/christmas-builder");
  await page
    .getByRole("spinbutton", { name: "Your total budget (€)", exact: true })
    .fill("10");
  await page.locator(".holiday-builder-products button").first().click();
  await expect(
    page.getByRole("button", { name: "Add bundle to bag", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("spinbutton", { name: "Your total budget (€)", exact: true })
    .fill("100");
  await page
    .getByRole("checkbox", { name: "Demo delivery · €5", exact: true })
    .check();
  const price = await page.locator(".summary-total strong").innerText();
  await page
    .getByRole("button", { name: "Add bundle to bag", exact: true })
    .click();
  await route(page, "/checkout");
  await expect(page.locator(".summary-total")).toContainText(price);
  await expect(
    page.getByRole("button", { name: "Delivery · €5", exact: true }),
  ).toHaveClass(/selected/);
});
test("holiday preorders allocate quantity and preserve local confirmation", async ({
  page,
}) => {
  await route(page, "/reserve?holiday=1&product=xm-031");
  await page
    .getByRole("spinbutton", { name: "Quantity", exact: true })
    .fill("2");
  await page
    .getByRole("button", { name: "Confirm demo reservation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your demo reservation is confirmed",
      exact: true,
    }),
  ).toBeVisible();
  await route(page, "/account?tab=reservations");
  await expect(page.locator("main")).toContainText(
    "Classic Scandinavian Christmas Gnome",
  );
});
test("campaign can restore the original homepage and reorder collections", async ({
  page,
}) => {
  await route(page, "/admin?view=christmas");
  await page
    .getByRole("checkbox", { name: "Enable Christmas homepage", exact: true })
    .uncheck();
  await route(page, "/");
  await expect(page.locator(".christmas-hero")).toHaveCount(0);
  await expect(page.locator(".hero h1")).toContainText("Some feelings");
  await route(page, "/admin?view=christmas");
  await page
    .getByRole("checkbox", { name: "Enable Christmas homepage", exact: true })
    .check();
  await page
    .getByRole("button", { name: /Move down Evergreen animals/ })
    .click();
  await route(page, "/");
  await expect(page.locator(".holiday-collection h2").first()).toHaveText(
    "Advent wreaths & candles",
  );
});
test("survey is explicitly local and no address is saved for launch interest", async ({
  page,
}) => {
  await route(page, "/launch");
  await page
    .getByRole("combobox", { name: "Preferred gift budget", exact: true })
    .selectOption("over50");
  await page
    .getByRole("button", { name: "Save answers locally", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Nothing was submitted" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try it", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Interest saved", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Demo email", exact: true }),
  ).toHaveValue("alex@example.com");
});
test("notification previews honor marketing preferences and persist only a simulation log", async ({
  page,
}) => {
  await route(page, "/notifications");
  await page
    .getByRole("combobox", { name: "Notification template", exact: true })
    .selectOption("offer");
  await expect(
    page.getByRole("button", { name: "Add simulation to log", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "Marketing demo updates (optional)",
      exact: true,
    })
    .check();
  await page
    .getByRole("combobox", { name: "Preview channel", exact: true })
    .selectOption("Telegram");
  await page
    .getByRole("button", { name: "Add simulation to log", exact: true })
    .click();
  await expect(page.locator(".notification-log-row")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".notification-log-row")).toContainText("Telegram");
});
for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920])
  test(`Christmas responsive ${width}px, images and theme comparison`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/christmas",
      "/themes",
      "/advent",
      "/christmas-builder",
      "/launch",
      "/notifications",
      "/admin?view=christmas",
    ]) {
      await route(page, path);
      await expect(page.locator("main h1").first()).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
    }
    await route(page, "/");
    await page.locator(".christmas-hero img").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(".christmas-hero img")
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      )
      .toBe(true);
  });
