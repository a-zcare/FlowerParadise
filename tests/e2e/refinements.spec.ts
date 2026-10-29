import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { themes } from "../../src/themes";
const STORAGE_KEY = "flower-paradise-v2";
const now = new Date("2026-10-29T12:00:00Z");
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: now });
  await page.addInitScript(
    ({ key, state }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(state));
      if (!localStorage.getItem("flower-paradise-visual-v1"))
        localStorage.setItem(
          "flower-paradise-visual-v1",
          JSON.stringify({ current: "midnight-bloom" }),
        );
    },
    { key: STORAGE_KEY, state: { lang: "en" } },
  );
});
for (const zone of ["Europe/Riga", "America/New_York", "Asia/Tokyo"])
  test(`countdown targets Riga, ticks, resumes and expires in ${zone}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ timezoneId: zone });
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-12-23T21:59:57Z") });
    await page.clock.pauseAt(new Date("2026-12-23T21:59:57Z"));
    await page.addInitScript(
      ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
      { key: STORAGE_KEY, state: { lang: "en" } },
    );
    await page.goto("./");
    await expect(page.locator(".countdown-unit")).toHaveCount(4);
    await expect(page.locator("[data-unit=seconds] strong")).toHaveText("03");
    await page.clock.runFor(1000);
    await expect(page.locator("[data-unit=seconds] strong")).toHaveText("02");
    await page.clock.setSystemTime(new Date("2026-12-23T21:59:59Z"));
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect(page.locator("[data-unit=seconds] strong")).toHaveText("01");
    await page.clock.runFor(1000);
    await expect(page.locator(".countdown-greeting")).toHaveText(
      "Merry Christmas!",
    );
    await expect(page.locator(".countdown-units")).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".countdown-greeting")).toHaveText(
      "Merry Christmas!",
    );
    await context.close();
  });
for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920])
  test(`countdown, card actions and navigation clearance at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./");
    await expect(page.locator(".countdown-unit")).toHaveCount(4);
    await expect(page.locator("[data-unit=days] strong")).toHaveText("55");
    const metrics = await page.locator(".countdown-unit").evaluateAll((units) =>
      units.map((unit) => {
        const box = unit.getBoundingClientRect();
        const value = unit.querySelector("strong")!.getBoundingClientRect();
        const label = unit.querySelector("span")!.getBoundingClientRect();
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          valueY: value.y,
          labelY: label.y,
          valueBottom: value.bottom,
          labelRight: label.right,
          right: box.right,
        };
      }),
    );
    expect(new Set(metrics.map((x) => Math.round(x.valueY))).size).toBe(1);
    expect(new Set(metrics.map((x) => Math.round(x.labelY))).size).toBe(1);
    for (const m of metrics) {
      expect(m.labelY).toBeGreaterThan(m.valueBottom);
      expect(m.labelRight).toBeLessThanOrEqual(m.right + 1);
    }
    expect(
      Math.max(...metrics.map((x) => x.width)) -
        Math.min(...metrics.map((x) => x.width)),
    ).toBeLessThan(1);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      )
      .toBeLessThanOrEqual(1);
    if (width <= 600) {
      const bar = page.locator(".mobile-bottom-nav");
      await expect(bar).toBeVisible();
      const height = (await bar.boundingBox())!.height;
      expect(
        await page
          .locator("body")
          .evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom)),
      ).toBeGreaterThanOrEqual(height);
      for (const link of await bar.locator("a").all())
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.locator(".footer-bottom").scrollIntoViewIfNeeded();
      expect(
        (await page.locator(".footer-bottom").boundingBox())!.y +
          (await page.locator(".footer-bottom").boundingBox())!.height,
      ).toBeLessThanOrEqual((await bar.boundingBox())!.y);
    } else if (width >= 1024) {
      await expect(page.locator("header .theme-control-label")).toBeVisible();
      await expect(page.locator("header .theme-control-label")).toContainText(
        "Styles",
      );
    }
    const card = page.locator(".featured-holiday .product-card").first();
    await card
      .getByRole("button", { name: "Quick view", exact: true })
      .click({ force: true });
    await expect(page.getByRole("dialog")).toBeVisible();
    if (width <= 600)
      await expect(page.locator(".mobile-bottom-nav")).toBeHidden();
    const dialog = (await page.getByRole("dialog").boundingBox())!;
    expect(dialog.x).toBeGreaterThanOrEqual(0);
    expect(dialog.x + dialog.width).toBeLessThanOrEqual(width + 1);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close / Aizvērt / Закрыть" })
      .click();
    await card.getByRole("button", { name: "Add to bag", exact: true }).click();
    await page.goto("./#/cart");
    await expect(page.locator(".cart-line")).toHaveCount(1);
    if (width <= 600) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.locator("header nav.open")).toBeVisible();
      await expect(page.locator(".mobile-bottom-nav")).toBeHidden();
      expect(
        await page.locator("header nav.open").evaluate((el) => el.clientHeight),
      ).toBeLessThan(1000);
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
    }
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      )
      .toBeLessThanOrEqual(1);
  });
test("admin date, labels and expiry greeting persist without changing the chosen theme", async ({
  page,
}) => {
  await page.goto("./#/admin?view=commerce");
  await page.getByRole("button", { name: "Campaign", exact: true }).click();
  const date = page.getByLabel("Target date and time · Europe/Riga", {
    exact: true,
  });
  await date.fill("2026-12-31T12:00");
  await date.press("Tab");
  await page
    .getByLabel("Event label · en", { exact: true })
    .fill("New Year atelier");
  await page.getByLabel("Event label · en", { exact: true }).press("Tab");
  await page
    .getByLabel("Holiday greeting · en", { exact: true })
    .fill("A beautiful winter to you!");
  await page.getByLabel("Holiday greeting · en", { exact: true }).press("Tab");
  await page.goto("./");
  await expect(page.locator(".countdown-intro")).toContainText(
    "New Year atelier",
  );
  await expect(page.locator(".countdown-intro time")).toHaveAttribute(
    "datetime",
    "2026-12-31T10:00:00.000Z",
  );
  await page.reload();
  await expect(page.locator(".countdown-intro")).toContainText(
    "New Year atelier",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-theme",
    "midnight-bloom",
  );
  await page.clock.setSystemTime(new Date("2026-12-31T10:00:00Z"));
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.locator(".countdown-greeting")).toHaveText(
    "A beautiful winter to you!",
  );
});
for (const width of [390, 1440])
  test(`all theme surfaces and refined screenshots ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await mkdir("qa/screenshots", { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./");
    for (const theme of themes) {
      await page.evaluate(
        (id) =>
          localStorage.setItem(
            "flower-paradise-visual-v1",
            JSON.stringify({ current: id }),
          ),
        theme.id,
      );
      await page.goto("./");
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute(
        "data-visual-theme",
        theme.id,
      );
      await expect(page.locator(".countdown-units")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
      await page.locator(".holiday-countdown").screenshot({
        path: `qa/screenshots/countdown-${theme.id}-${width}.png`,
      });
      if (theme.id === "midnight-bloom") {
        await page.locator(".holiday-countdown").scrollIntoViewIfNeeded();
        await page.evaluate(() =>
          document
            .querySelectorAll(".featured-holiday img")
            .forEach((img) => ((img as HTMLImageElement).loading = "eager")),
        );
        await page
          .locator(".featured-holiday img")
          .evaluateAll((imgs) =>
            Promise.all(
              imgs.map((img) =>
                (img as HTMLImageElement).decode().catch(() => {}),
              ),
            ),
          );
        await page.evaluate(() =>
          window.scrollTo(
            0,
            document
              .querySelector(".holiday-countdown")!
              .getBoundingClientRect().top +
              scrollY -
              24,
          ),
        );
        await page.screenshot({
          path: `qa/screenshots/refined-countdown-cards-${width}.png`,
        });
      }
      for (const [route, title] of [
        ["/gift-studio", "Gift Builder 2.0"],
        ["/cart", "Your bag of lovely things"],
        ["/admin?view=commerce", "Christmas operations"],
      ]) {
        await page.goto(`./#${route}`);
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
        await expect(page.locator("html")).toHaveAttribute(
          "data-visual-theme",
          theme.id,
        );
      }
    }
  });
