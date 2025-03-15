import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

import mongoose from "mongoose";

import userModel from "../models/userModel";

dotenv.config();

test.beforeEach(async ({ page }) => {
  // Connect to DB so as to delete test user later
  await mongoose.connect(process.env.MONGO_URL);
  // Navigate to Home Page
  await page.goto("http://localhost:3000", { waitUntil: "commit" });
});

test.describe("Unauthorised access to admin features", () => {
  test.describe("Not logged-in users attempt", () => {
    test.beforeEach(async ({ page }) => {
      // Clear cookies/storage to ensure clean state
      await page.context().clearCookies();
    });
    test("should redirect to login page", async ({ page }) => {
      // Admin dashboard should not be accessible to unauthenticated users
      await page.goto("http://localhost:3000/dashboard/admin", {
        waitUntil: "domcontentloaded",
      });
      await expect(page).toHaveURL("http://localhost:3000/login");
      // Create category page should not be accessible to unauthenticated users
      await page.goto("http://localhost:3000/dashboard/admin/create-category", {
        waitUntil: "domcontentloaded",
      });
      await expect(page).toHaveURL("http://localhost:3000/login");
      // Create product page should not be accessible to unathenticated users
      await page.goto("http://localhost:3000/dashboard/admin/create-product", {
        waitUntil: "domcontentloaded",
      });
      await expect(page).toHaveURL("http://localhost:3000/login");
      // Admin products page should not be accessible to unauthenticated users
      await page.goto("http://localhost:3000/dashboard/admin/products", {
        waitUntil: "domcontentloaded",
      });
      await expect(page).toHaveURL("http://localhost:3000/login");
      //Admin orders page should not be accessible to uauthenticated users
      await page.goto("http://localhost:3000/dashboard/admin/orders", {
        waitUntil: "domcontentloaded",
      });
      await expect(page).toHaveURL("http://localhost:3000/login");
    });
  });

  test.describe("Logged-in users (but not admin) attempt", () => {
    test.beforeEach(async ({ page }) => {
      // Create user for test
      const hashedPassword =
        "$2b$10$6yckf4REjQKwirxfh8Q30efR4RLp5mCBrPoluhz4kIVe.zat6uDO2";

      await new userModel({
        name: "Test User",
        email: "notadmin@mail.com",
        phone: "81234567",
        address: "123 Test Road",
        password: hashedPassword,
        answer: "password is cs4218",
      }).save();

      // Navigating to home page
      await page.goto("http://localhost:3000", { waitUntil: "commit" });
    });
    test.afterEach(async () => {
      // Delete test user
      await userModel.deleteMany({ email: "notadmin@mail.com" });
      // Disconnect from DB
      await mongoose.disconnect();
    });

    test("should only show non-admin items as links", async ({ page }) => {
      // Navigating to login page
      await page.getByRole("link", { name: "Login" }).click();

      // Login as a non-admin user
      await page
        .getByRole("textbox", { name: "Enter Your Email" })
        .fill("notadmin@mail.com");
      await page
        .getByRole("textbox", { name: "Enter Your Password" })
        .fill("cs4218");
      await page.getByRole("button", { name: "Login" }).click();

      await page.getByRole("button", { name: "Test User" }).click();
      await page.getByRole("link", { name: "Dashboard" }).click();
      await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Create Category" })
      ).not.toBeVisible();
      await expect(
        page.getByRole("link", { name: "Create Product" })
      ).not.toBeVisible();
      await expect(
        page.getByRole("link", { name: "Products" })
      ).not.toBeVisible();

      await page.getByRole("link", { name: "Profile" }).click();

      await expect(page).toHaveURL(
        "http://localhost:3000/dashboard/user/profile"
      );

      await page.goBack({ waitUntil: "commit" });

      await page.getByRole("link", { name: "Orders" }).click();

      await expect(page).toHaveURL(
        "http://localhost:3000/dashboard/user/orders"
      );
    });

    // Non-admin users redirected to forbidden page instead since user is technically logged in
    test("should redirect to forbidden page", async ({ page }) => {
      // Navigating to login page
      await page.getByRole("link", { name: "Login" }).click();
      // Login as a non-admin user
      await page
        .getByRole("textbox", { name: "Enter Your Email" })
        .fill("notadmin@mail.com");
      await page
        .getByRole("textbox", { name: "Enter Your Password" })
        .fill("cs4218");
      await page.getByRole("button", { name: "Login" }).click();

      // Wait for login to complete by checking for name
      await expect(
        page.getByRole("button", { name: "Test User" })
      ).toBeVisible();

      // Admin dashboard should not be accessible to non-admin signed in users
      await page.goto("http://localhost:3000/dashboard/admin", {
        waitUntil: "networkidle",
      });
      await expect(page).toHaveURL("http://localhost:3000/forbidden");

      // Create category page should not be accessible to non-admin signed in users
      await page.goto("http://localhost:3000/dashboard/admin/create-category", {
        waitUntil: "networkidle",
      });
      await expect(page).toHaveURL("http://localhost:3000/forbidden");

      // Create product page should not be accessible to non-admin signed in users
      await page.goto("http://localhost:3000/dashboard/admin/create-product", {
        waitUntil: "networkidle",
      });
      await expect(page).toHaveURL("http://localhost:3000/forbidden");

      // Admin products page should not be accessible to non-admin signed in users
      await page.goto("http://localhost:3000/dashboard/admin/products", {
        waitUntil: "networkidle",
      });
      await expect(page).toHaveURL("http://localhost:3000/forbidden");

      //Admin orders page should not be accessible to non-admin signed in users
      await page.goto("http://localhost:3000/dashboard/admin/orders", {
        waitUntil: "networkidle",
      });
      await expect(page).toHaveURL("http://localhost:3000/forbidden");
    });
  });
});
