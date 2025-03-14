import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import userModel from '../models/userModel';

dotenv.config();

test.beforeEach(async ({ page }) => {
    // Connecting to db which is needed for creating user for test
    await mongoose.connect(process.env.MONGO_URL);

    // Create user for test
    const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";

    await new userModel({
        name: "Douglas Lim", 
        email: "douglas.lim@mail.com", 
        phone: "91123321", 
        address: "766 Kent Ridge Road", 
        password: hashedPassword, 
        answer: "Football"
    }).save();

    // Login to become authenticated user
    // Navigating to login page
    await page.goto('http://localhost:3000/login');

    // Inputting user details in login page to login
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('douglas.lim@mail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Exact6');

    // Click on the login button
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Check that toast message for successful login is shown after login 
    await expect(page.getByText('login successfully')).toBeVisible();
});

test.afterEach(async () => {
    // Delete user created from this test
    await userModel.deleteMany({email : 'douglas.lim@mail.com'});

    // Close the connection with Mongo DB since the test has finished running
    await mongoose.disconnect();
})

test.describe("Update Profile Success case", () => {
    test("Should allow the user to update their profile when valid details are passed in", async ({page}) => {
        // Navigate to dashboard
        await page.getByRole('button', { name: 'Douglas Lim' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();

        // Navigate to Profile
        await page.getByRole('link', { name: 'Profile' }).click();

        // Key in details for updating the profile
        // Keying in the updated name
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('Tester1234');
        // Keying in the updated password
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newPassword');
        // Keying in the update phone number
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('91234567');
        // Keying in the updated address
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('Some testing location hidden');

        // Clicking the button to update profile
        await page.getByRole('button', { name: 'UPDATE' }).click();

        // Check that toast message which shows that profile is updated successfully is visible
        await expect(page.getByText("Profile Updated Successfully")).toBeVisible();

        // Log out and then log in again to check that profile has been updated successfully with new password
        await page.getByRole('button', { name: 'Tester1234' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
        // Navigating to login page
        await page.getByRole('link', { name: 'Login' }).click();
        // Inputting new password for login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('douglas.lim@mail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newPassword');
        // Click on the login button
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that toast message for successful login is shown to verify successful login after updating profile 
        await expect(page.getByText('login successfully')).toBeVisible();

        // Check that name on nav bar on home page is now updated to new name
        await expect(page.getByRole('list')).toContainText('Tester1234');
    });
});