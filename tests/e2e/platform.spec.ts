import { test, expect, type Page } from "@playwright/test";
async function english(page: Page) {
  await page.goto("./");
  await page
    .getByRole("combobox", { name: "Valoda", exact: true })
    .selectOption("en");
  await expect(
    page.getByRole("heading", {
      name: "Some feelings deserve flowers.",
      exact: true,
    }),
  ).toBeVisible();
}
async function route(page: Page, path: string) {
  await page.goto(`./#${path}`);
}
test.beforeEach(async ({ page }) => {
  await english(page);
});
test("catalog, search, availability filtering, quick view and comparison", async ({
  page,
}) => {
  await route(page, "/shop");
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(36);
  await page.getByRole("textbox", { name: "Search products" }).fill("rose");
  expect(
    await page.locator(".catalog-products .product-card").count(),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Roses 3", exact: true }).click();
  await expect(page.locator(".catalog-products .product-card")).toHaveCount(3);
  await page
    .getByRole("combobox", { name: "Sort", exact: true })
    .selectOption("low");
  await page.locator(".catalog-products .compare-button").first().click();
  await route(page, "/compare");
  await expect(page.locator(".comparison-card")).toHaveCount(1);
  await expect(
    page.getByText("Roses, eucalyptus", { exact: true }),
  ).toBeVisible();
});
test("product variants, demo checkout, order history and reorder", async ({
  page,
}) => {
  await route(page, "/product/fp-1");
  await page
    .getByRole("combobox", { name: "Size option", exact: true })
    .selectOption("L");
  await page
    .getByRole("checkbox", { name: "Add a greeting card + €5", exact: true })
    .check();
  await page
    .getByRole("textbox", { name: "Your personal message", exact: true })
    .fill("Demo greeting");
  await page
    .locator(".detail-copy")
    .getByRole("button", { name: "Add to bag", exact: true })
    .click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Promo code" }).fill("BADCODE");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Unknown code");
  await page.getByRole("textbox", { name: "Promo code" }).fill("BLOOM10");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page
    .getByRole("link", { name: "Continue to demo checkout", exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "I understand this is a demonstration order.",
      exact: true,
    })
    .check();
  await page
    .getByRole("button", { name: "Confirm demo order", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your demo order is all set.",
      exact: true,
    }),
  ).toBeVisible();
  await route(page, "/account?tab=orders");
  await page
    .getByRole("button", { name: "Order these again", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add available items to bag", exact: true })
    .click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toHaveCount(1);
  await expect(page.locator(".cart-line")).toContainText("Demo greeting");
});
test("four compartments share availability and codes cannot be reused", async ({
  page,
}) => {
  await route(page, "/available");
  await expect(page.locator(".available-card")).toHaveCount(3);
  await route(page, "/vending");
  await page.getByRole("button", { name: /^01 Available/ }).click();
  await page
    .getByRole("button", { name: "Reserve · Simulate payment", exact: true })
    .click();
  const code = await page.locator(".code-receipt strong").innerText();
  await route(page, "/available");
  await expect(page.locator(".available-card")).toHaveCount(2);
  await route(page, "/vending");
  await page
    .getByRole("textbox", { name: "Demo pickup code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Unlock compartment", exact: true })
    .click();
  await expect(page.locator(".compartment.unlocked")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Demo pickup code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Unlock compartment", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("already used");
});
test("future reservations reject browser-local time conflicts", async ({
  page,
}) => {
  await route(page, "/reserve");
  await page
    .getByRole("button", { name: "Confirm demo reservation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your demo reservation is confirmed",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Confirm demo reservation", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("already reserved");
});
test("Flower Match is a complete seven-step rule-based wizard", async ({
  page,
}) => {
  await route(page, "/match");
  for (let i = 0; i < 6; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Find my flowers", exact: true })
    .click();
  await expect(page.locator(".recommendation")).toHaveCount(3);
  for (const card of await page.locator(".recommendation").all())
    expect(await card.locator("li").count()).toBeGreaterThan(0);
  await page
    .locator(".recommendation")
    .nth(0)
    .locator(".compare-button")
    .last()
    .click();
  await page
    .locator(".recommendation")
    .nth(1)
    .locator(".compare-button")
    .last()
    .click();
  await page
    .getByRole("link", { name: "Compare selected bouquets", exact: true })
    .click();
  await expect(page.locator(".comparison-card")).toHaveCount(2);
});
test("gift builder includes extras and delivery within a €40 total", async ({
  page,
}) => {
  await route(page, "/gift-builder");
  await page
    .getByRole("spinbutton", { name: "Total budget (€)", exact: true })
    .fill("40");
  await page
    .getByRole("checkbox", { name: "Include demo delivery · €5", exact: true })
    .check();
  await expect(page.locator(".bundle-card")).toHaveCount(3);
  await expect(
    page.locator(".bundle-card .budget-remaining").first(),
  ).toContainText("€0.00");
  await page
    .getByRole("button", { name: "Add this little gift", exact: true })
    .first()
    .click();
  await route(page, "/checkout");
  await expect(
    page.getByRole("button", { name: "Delivery · €5", exact: true }),
  ).toHaveClass(/selected/);
  await expect(page.locator(".summary-total")).toContainText("€40.00");
});
test("secret gift has a greeting, reveal and one-time local redemption", async ({
  page,
}) => {
  await route(page, "/secret-gift");
  await page
    .getByRole("textbox", {
      name: "Fictional recipient display name",
      exact: true,
    })
    .fill("Alex Demo");
  await page
    .getByRole("textbox", { name: "A personal greeting", exact: true })
    .fill("Just a little demo happiness.");
  await page
    .getByRole("button", { name: "Create & preview the surprise", exact: true })
    .click();
  const code = await page.locator(".secret-code").innerText();
  await page
    .getByRole("button", { name: "Reveal my gift", exact: true })
    .click();
  await expect(page.locator(".personal-greeting")).toHaveText(
    "Just a little demo happiness.",
  );
  await page
    .getByRole("textbox", { name: "Demo gift code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Collect demo gift", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "A little lovely, collected.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Collect demo gift", exact: true }),
  ).toHaveCount(0);
});
test("reminder create/edit, annual plan budget/completion and delete", async ({
  page,
}) => {
  await route(page, "/reminders");
  await page.getByRole("button", { name: "Add a date", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Fictional name or title", exact: true })
    .fill("Demo anniversary");
  const year = new Date().getFullYear();
  await page.locator("dialog input[type=date]").fill(`${year}-12-25`);
  await page
    .getByRole("combobox", { name: "Demo notification channel", exact: true })
    .selectOption("Telegram");
  await page
    .getByRole("button", { name: "Save the date", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Fictional name or title", exact: true })
    .fill("Our demo anniversary");
  await page
    .getByRole("button", { name: "Save the date", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Preview notification", exact: true })
    .click();
  await expect(page.locator("dialog")).toContainText("Telegram");
  await page
    .getByRole("button", { name: "Close / Aizvērt / Закрыть", exact: true })
    .click();
  await route(page, "/planner");
  await page.getByRole("button", { name: /December/ }).click();
  await page
    .getByRole("button", { name: "Plan this gift", exact: true })
    .click();
  await page
    .getByRole("spinbutton", { name: "Budget (€)", exact: true })
    .fill("40");
  await page
    .getByRole("checkbox", {
      name: "Mark plan completed (does not place an order)",
      exact: true,
    })
    .check();
  await page
    .getByRole("button", { name: "Save gift plan", exact: true })
    .click();
  await expect(page.locator(".planner-event")).toContainText("Completed");
  await expect(page.locator(".planner-event")).toContainText("€40.00");
  await route(page, "/reminders");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator(".reminder-card")).toHaveCount(0);
});
test("passport distinguishes catalog and local photos without persisting uploads", async ({
  page,
}) => {
  await route(page, "/passport/fp-1");
  await expect(
    page.getByRole("heading", { name: "Bouquet passport", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".passport-batches")).toContainText(
    "not real florist",
  );
  await expect(page.locator(".passport-link>a")).toHaveAttribute(
    "href",
    /\/#\/passport\/fp-1$/,
  );
  await expect(page.locator("input[type=file]")).toHaveAttribute(
    "accept",
    "image/jpeg,image/png,image/webp",
  );
});
test("maintenance records can be added and resolved", async ({ page }) => {
  await route(page, "/admin?view=maintenance");
  await page
    .getByRole("button", { name: "Add maintenance entry", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Type", exact: true })
    .selectOption("fault");
  await page
    .getByRole("textbox", { name: "Notes", exact: true })
    .fill("Demo lock inspection");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  const card = page
    .locator(".maintenance-card")
    .filter({ hasText: "Demo lock inspection" });
  await expect(card).toBeVisible();
  await card
    .getByRole("checkbox", { name: "Resolved / complete", exact: true })
    .check();
  await expect(card.getByRole("checkbox")).toBeChecked();
});
test("waste accounting reduces inventory and feeds the financial model", async ({
  page,
}) => {
  await route(page, "/admin?view=waste");
  await page.getByRole("button", { name: "Record waste", exact: true }).click();
  await page
    .getByRole("spinbutton", { name: "Quantity to discard", exact: true })
    .fill("1");
  await page
    .getByRole("button", { name: "Record discard", exact: true })
    .click();
  await expect(page.locator(".record-list .record")).toHaveCount(1);
  await route(page, "/admin?view=profitability");
  await page
    .getByRole("checkbox", { name: /Also include recorded demo waste/ })
    .check();
  await expect(page.locator(".profit-card strong")).not.toHaveText("€1,420.00");
});
test("financial defaults, capacity limits and interactive scenarios", async ({
  page,
}) => {
  await route(page, "/admin?view=profitability");
  await expect(page.locator(".profit-card strong")).toHaveText("€1,420.00");
  await page.getByLabel(/^Daily sales demand/).fill("20");
  await expect(page.locator(".capacity-card")).toContainText(
    "Unserved daily demand",
  );
  await expect(page.locator(".profit-card strong")).toHaveText("€3,340.00");
  await page.getByRole("button", { name: /Busier/ }).click();
  await expect(page.locator(".scenario-card").last()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
test("full demo reset restores operations and removes personal records", async ({
  page,
}) => {
  await route(page, "/shop");
  await page.locator(".product-card .compare-button").first().click();
  await page
    .getByRole("button", { name: "Add to bag", exact: true })
    .first()
    .click();
  await route(page, "/account?tab=settings");
  await page
    .getByRole("button", { name: "Reset all demo data", exact: true })
    .click();
  await route(page, "/cart");
  await expect(page.locator(".cart-line")).toHaveCount(0);
  await route(page, "/available");
  await expect(page.locator(".available-card")).toHaveCount(3);
  await route(page, "/compare");
  await expect(page.locator(".comparison-card")).toHaveCount(0);
});
test("Latvian, Russian, English and dark theme persist through refresh", async ({
  page,
}) => {
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ru");
  await expect(
    page.getByRole("heading", {
      name: "Цветы, которые говорят больше.",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Сменить тему", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("combobox", { name: "Язык", exact: true })
    .selectOption("lv");
  await expect(
    page.getByRole("heading", {
      name: "Ziedi, kas pasaka vairāk.",
      exact: true,
    }),
  ).toBeVisible();
});
test("production PWA can reload a catalog route offline", async ({
  page,
  context,
}) => {
  await route(page, "/shop");
  await page.waitForFunction(
    () => !!navigator.serviceWorker?.controller,
    undefined,
    { timeout: 30000 },
  );
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Flowers for every story.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".offline-status")).toContainText("Offline");
});
for (const [width, height] of [
  [320, 740],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
])
  test(`responsive ${width}px and route refresh`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height });
    for (const path of [
      "/",
      "/shop",
      "/match",
      "/compare",
      "/planner",
      "/admin?view=profitability",
      "/passport/fp-1",
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
    await route(page, "/shop");
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Flowers for every story.",
        exact: true,
      }),
    ).toBeVisible();
    if (width < 768) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.locator("header nav")).toBeVisible();
    }
  });
for (const [width, height] of [
  [844, 390],
  [1024, 768],
  [600, 320],
])
  test(`landscape ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await route(page, "/vending");
    await expect(page.locator(".machine")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });
test("informational routes and navigation have real destinations", async ({
  page,
}) => {
  for (const path of [
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/delivery",
    "/discover",
  ]) {
    await route(page, path);
    await expect(page.locator("main h1").first()).toBeVisible();
  }
  await route(page, "/contact");
  await page
    .getByRole("textbox", { name: "Fictional name", exact: true })
    .fill("Alex Demo");
  await page
    .getByRole("textbox", { name: "Your message", exact: true })
    .fill("A demonstration inquiry.");
  await page
    .getByRole("button", { name: "Prepare demo message", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Demo message prepared" }),
  ).toBeVisible();
});
