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

    // Navigating to home page
    await page.goto('http://localhost:3000');
});

test.afterEach(async () => {
    // Delete user created from this test
    await userModel.deleteMany({email : 'douglas.lim@mail.com'});

    // Close the connection with Mongo DB since the test has finished running
    await mongoose.disconnect();
})

test.describe("Resetting of password", () => {
    test("Should allow the user to reset their password successfully", async ({page}) => {
        // Navigating to login page
        await page.getByRole('link', { name: 'Login' }).click();

        // Click on button to go to forget password page
        await page.getByRole('button', { name: 'Forgot Password' }).click();

        // Key in email address
        await page.getByRole('textbox', { name: 'Enter your email address' }).fill('douglas.lim@mail.com');

        // Key in new password
        await page.getByRole('textbox', { name: 'Enter your new password' }).fill('simple-password');

        // Key in answer to favourite sports
        await page.getByRole('textbox', { name: 'Enter your favourite sports' }).fill('Football');
        
        // Click on reset password button to change button
        await page.getByRole('button', { name: 'Reset Password' }).click();

        // Check that toast message for successful resetting of password is shown after resetting password
        await expect(page.getByText('Password has been successfully resetted')).toBeVisible();

        // Inputting user details in login page to login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('douglas.lim@mail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('simple-password');
        
        // Click on the login button
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that toast message for successful login is shown after login 
        await expect(page.getByText('login successfully')).toBeVisible();

        // Check that correct name appears for user on home page after login
        await expect(page.getByRole('list')).toContainText('Douglas Lim');
    });
});