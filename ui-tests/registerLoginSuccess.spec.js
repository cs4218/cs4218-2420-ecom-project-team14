import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import userModel from '../models/userModel';

dotenv.config();

let emailForDeletion;

test.beforeEach(async ({ page }) => {
    // Connecting to db which is needed for deleting the user later
    await mongoose.connect(process.env.MONGO_URL);
    // Navigating to home page
    await page.goto('http://localhost:3000', { waitUntil: 'commit' });
});

test.afterEach(async () => {
    // Delete user created from this test
    await userModel.deleteMany({email: emailForDeletion});
    
    // Close the connection with Mongo DB since the test has finished running
    await mongoose.disconnect();
})

test.describe("Successful Register and Login", () => {
    // Check that normal user is able to register and login successfully
    test("Should allow the normal user to register and login successfully", async ({page}) => {
        // Set email to use for deleting user later
        emailForDeletion = 'douglas.lim@mail.com';

        // Navigating to register page
        await page.getByRole('link', { name: 'Register' }).click();

        // Keying in details under register
        // Filling up the name under register
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('Douglas Lim');
        // Filling up the email under register
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('douglas.lim@mail.com');
        // Filling up the password under register
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('simple-password');
        // Filling up the phone number under register
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('91123322');
        // Filling up the address under register
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('766 Kent Ridge Road');
        // Filling up the favourite sports under register
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Football');
       
        // Click on the register button
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Check that the toast message for successful registration is shown after registering
        await expect(page.getByText("Register Successfully, please login")).toBeVisible();
        
        // Inputting user details in login page to login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('douglas.lim@mail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('simple-password');
        
        // Click on the login button
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that toast message for successful login is shown after login 
        await expect(page.getByText('login successfully')).toBeVisible();

        // Check that correct name appears for normal user on nav bar of home page after login
        await expect(page.getByRole('list')).toContainText('Douglas Lim');

        // Navigate to dashboard
        await page.getByRole('button', { name: 'Douglas Lim' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        
        // Check that the user's name, email and address is correctly displayed on dashboard
        const name = page.locator('h3').nth(0);
        const email = page.locator('h3').nth(1);
        const address = page.locator('h3').nth(2);
        
        await expect(name).toContainText('Douglas Lim');
        await expect(email).toContainText('douglas.lim@mail.com');
        await expect(address).toContainText('766 Kent Ridge Road');
    });

    // Check that admin is able to login successfully (Admin is not able to register so we only check login)
    test('Should allow admin to login successfully', async ({page}) => {
        // Set email to use for deleting admin later
        emailForDeletion = "admin.account@mail.com";

        // Create admin for test
        const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";

        const admin = await new userModel({
            name: "Admin Account", 
            email: "admin.account@mail.com", 
            phone: "91123321", 
            address: "Some Admin Place somewhere", 
            password: hashedPassword, 
            answer: "Swimming",
            role: 1
        }).save();

        // Navigating to login page
        await page.getByRole('link', { name: 'Login' }).click();

        // Inputting user details in login page to login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin.account@mail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Exact6');
        
        // Click on the login button
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check that correct name appears for admin on nav bar of home page after login
        await expect(page.getByRole('list')).toContainText('Admin Account');

        // Navigate to admin dashboard
        await page.getByRole('button', { name: 'Admin Account' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();

        // Wait for page to finish loading admin dashboard
        await page.getByText('Admin Panel').waitFor('visible');

        // Check that admin's name, email and phone number are correct on the dashboard
        const adminName = page.locator('h3').nth(0);
        const adminEmail = page.locator('h3').nth(1);
        const adminPhone = page.locator('h3').nth(2);

        expect(adminName).toContainText(`Admin Name : ${admin.name}`);
        expect(adminEmail).toContainText(`Admin Email : ${admin.email}`);
        expect(adminPhone).toContainText(`Admin Contact : ${admin.phone}`);
    });
});
