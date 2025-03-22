import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { testCategory, testProduct1 } from "../../global-data";

dotenv.config();

const rootURL = "http://localhost:3000";

test.describe("Unauthenticated Users", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(rootURL, { waitUntil: "domcontentloaded" });
  });

  test("Should be able to visit the home page", async ({ page }) => {
    const homeLinks = await page.locator('a[href="/"]').all();
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    for (let homeLink of homeLinks) {
      expect(homeLink).toBeVisible();
    }
    await homeLinks[0].click();

    expect(page.url()).toBe(rootURL + "/");
  });

  test("Should be able to visit the cart page", async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"]');
    expect(cartLink).toBeVisible();
    await cartLink.click();
    expect(page.url()).toBe(rootURL + "/cart");
  });

  test("Should be able to visit the all categories page", async ({ page }) => {
    const categoriesLink = page.locator('a[href="/categories"]');
    expect(categoriesLink).toBeVisible();
    await categoriesLink.click();
    expect(page.url()).toBe(rootURL + "/categories");
  });

  test("Should be able to visit the about page", async ({ page }) => {
    const aboutLink = page.locator('a[href="/about"]');
    expect(aboutLink).toBeVisible();
    await aboutLink.click();
    expect(page.url()).toBe(rootURL + "/about");
  });

  test("Should be able to visit the contact page", async ({ page }) => {
    const contactLink = page.locator('a[href="/contact"]');
    expect(contactLink).toBeVisible();
    await contactLink.click();
    expect(page.url()).toBe(rootURL + "/contact");
  });

  test("Should be able to visit the policy page", async ({ page }) => {
    const policyLink = page.locator('a[href="/policy"]');
    expect(policyLink).toBeVisible();
    await policyLink.click();
    expect(page.url()).toBe(rootURL + "/policy");
  });

  test("Should be able to visit the register page", async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]');
    expect(registerLink).toBeVisible();
    await registerLink.click();
    expect(page.url()).toBe(rootURL + "/register");
  });

  test("Should be able to visit the login page", async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    expect(loginLink).toBeVisible();
    await loginLink.click();
    expect(page.url()).toBe(rootURL + "/login");
  });

  test("Should be able to visit the search page", async ({ page }) => {
    const searchLink = page.locator('a[href="/search"]');
    expect(searchLink).toBeVisible();
    await searchLink.click();
    expect(page.url()).toBe(rootURL + "/search");
  });

  test("Should be able to visit the single product page", async ({ page }) => {
    await page.waitForSelector(`#product-card-${testProduct1.slug}`, {
      state: "visible",
    });

    const singleProductLinks = await page
      .locator(`a[href="/product/${testProduct1.slug}"]`)
      .all();
    expect(singleProductLinks.length).toBeGreaterThanOrEqual(1);
    for (let singleProductLink of singleProductLinks) {
      expect(singleProductLink).toBeVisible();
    }
    await singleProductLinks[0].click();
    expect(page.url()).toBe(rootURL + `/product/${testProduct1.slug}`);
  });

  test("Should be able to visit the single category page", async ({ page }) => {
    await page.goto("http://localhost:3000/categories", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(`#category-card-${testCategory.slug}`, {
      state: "visible",
    });

    const singleCategoryLinks = await page
      .locator(`a[href="/category/${testCategory.slug}"]`)
      .all();

    expect(singleCategoryLinks.length).toBeGreaterThanOrEqual(1);
    for (let singleCategoryLink of singleCategoryLinks) {
      expect(singleCategoryLink).toBeVisible();
    }
    await singleCategoryLinks[0].click();
    expect(page.url()).toBe(rootURL + `/category/${testCategory.slug}`);
  });
});
