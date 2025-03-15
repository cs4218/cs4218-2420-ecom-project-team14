import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userModel from "../models/userModel";

dotenv.config();

test.beforeEach(async ({ page }) => {
  // Connect to DB for deleting test user later
  await mongoose.connect(process.env.MONGO_URL);

  await page.goto("http://localhost:3000", { waitUntil: "commit" });
});

test.afterEach(async () => {
  // After every test close open Mongoose connections
  await mongoose.disconnect();
});

test.describe("Invalid registration failures", () => {
  test("should not allow name to be greater than 150 characters", async ({
    page,
  }) => {
    // Navigating to register page
    await page.getByRole("link", { name: "Register" }).click();

    const superLongName = "a".repeat(151);

    // Filling up the invalid name under register
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill(superLongName);

    // Filling up valid email
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test123@mail.com");
    // Filling up valid password
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    // Filling up valid phone
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    // Filling up valid address
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    // Filling up valid answer
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText("The name can only be up to 150 characters long")
    ).toBeVisible();
  });

  test("should not allow password to be less than 6 characters", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Register" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("Test User");

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test123@mail.com");

    // Invalid password (less than 6 characters)
    const shortPassword = "test";
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(shortPassword);

    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");

    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");

    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText("The password must be more than 6 characters long")
    ).toBeVisible();
  });

  test("should not allow invalid email (default validation)", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Register" }).click();

    // Wait for the form to be visible so we can inject noValidate
    // attribute (we do not want to just rely on browser form validation)
    await page.waitForSelector("form");
    await page.evaluate(() => {
      document.querySelector("form").setAttribute("noValidate", "");
    });

    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("Test User");

    // Email above 150 characters
    let invalidEmail = "a".repeat(143) + "@mail.com";
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(invalidEmail);

    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");

    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page.getByText("The email is not valid")).toBeVisible();

    // Email should have domain
    invalidEmail = "test123nodomain";

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(invalidEmail);
    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(page.getByText("The email is not valid")).toBeVisible();
  });

  test("should not allow invalid phone number", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("Test User");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test123@mail.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");

    // Should start with 6 or 8 or 9
    let invalidPhone = "1234567";
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill(invalidPhone);
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText(
        "The phone number is not valid. The phone number must start with 6,8 or 9 and be 8 digits long"
      )
    ).toBeVisible();

    // Should not be less than 8 digits long
    invalidPhone = "8123456";
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill(invalidPhone);

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText(
        "The phone number is not valid. The phone number must start with 6,8 or 9 and be 8 digits long"
      )
    ).toBeVisible();

    // Should not be more than 8 digits long
    invalidPhone = "812345679";
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill(invalidPhone);

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText(
        "The phone number is not valid. The phone number must start with 6,8 or 9 and be 8 digits long"
      )
    ).toBeVisible();
  });

  test("should not allow address to be greater than 150 characters", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Register" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("Test User");

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test123@mail.com");

    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");

    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");

    // Invalid address of 151 characters
    const invalidAddress = "a".repeat(151);
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill(invalidAddress);

    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText("The address can only be up to 150 characters long")
    ).toBeVisible();
  });

  test("should not allow answer to be greater than 100 characters", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Register" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("Test User");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test123@mail.com");

    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");

    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");

    // Invalid answer longer than 100 characters
    const invalidAnswer = "a".repeat(101);

    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill(invalidAnswer);

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(
      page.getByText("The answer can only be up to 100 characters long")
    ).toBeVisible();
  });
});
