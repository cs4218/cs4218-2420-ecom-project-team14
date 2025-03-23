import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server";
import JWT from "jsonwebtoken";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import { ObjectId } from "mongodb";

describe('Delete Category Backend Integration Testing', () => {
    const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";
    let mongoInMemoryServer, jwtToken, adminJwtToken, regularUserJwtToken, categoryId;

    beforeAll(async () => {
        mongoInMemoryServer = await MongoMemoryServer.create();
        const uri = mongoInMemoryServer.getUri();
        await mongoose.connect(uri);

        const admin = await new userModel({
            name: "Admin Account",
            email: "admin.account@mail.com",
            phone: "91292838",
            address: "Admin place somewhere",
            password: hashedPassword,
            answer: "Swimming",
            role: 1
        }).save();

        const regularUser = await new userModel({
            name: "Regular User",
            email: "regular.user@mail.com",
            phone: "81234567",
            address: "Regular User Home",
            password: hashedPassword,
            answer: "Running",
            role: 0
        }).save();

        adminJwtToken = await JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        
        regularUserJwtToken = await JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        jwtToken = adminJwtToken;
    });

    beforeEach(async () => {
        const category = await new categoryModel({
            name: "Test Category",
            slug: "test-category"
        }).save();
        
        categoryId = category._id;
    });

    afterEach(async () => {
        await categoryModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoInMemoryServer.stop();
    });

    // Test 1: Successful category deletion by admin
    it('should allow admin to delete a category successfully', async () => {
        const response = await request(app)
            .delete(`/api/v1/category/delete-category/${categoryId}`)
            .set("Authorization", adminJwtToken);
        
        // Check response status code and message
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Category Deleted Successfully");
        
        // Verify that the category was actually deleted from the database
        const deletedCategory = await categoryModel.findById(categoryId);
        expect(deletedCategory).toBeNull();
    });

    // Test 2: Test authentication failure - no token provided
    it('should not allow category deletion when no authentication token is provided', async () => {
        const response = await request(app)
            .delete(`/api/v1/category/delete-category/${categoryId}`);
        
        // Check response status code
        expect(response.status).toBe(401);
        
        // Verify that the category still exists in the database
        const category = await categoryModel.findById(categoryId);
        expect(category).not.toBeNull();
    });

    // Test 3: Test authorization failure - non-admin user
    it('should not allow regular users to delete categories', async () => {
        const response = await request(app)
            .delete(`/api/v1/category/delete-category/${categoryId}`)
            .set("Authorization", regularUserJwtToken);
        
        // Check response status code
        expect(response.status).toBe(401);
        
        // Verify that the category still exists in the database
        const category = await categoryModel.findById(categoryId);
        expect(category).not.toBeNull();
    });

    // Test 4: Test invalid category ID
    it('should return 400 when trying to delete a category with non-existent ID', async () => {
        const nonExistentId = new ObjectId();
        const response = await request(app)
            .delete(`/api/v1/category/delete-category/${nonExistentId}`)
            .set("Authorization", adminJwtToken);
        
        // Check response status code and message
        expect(response.status).toBe(400);
    });

    // Test 5: Test invalid format of category ID
    it('should return 500 when trying to delete a category with invalid ID format', async () => {
        const invalidId = "invalid-id-format";
        const response = await request(app)
            .delete(`/api/v1/category/delete-category/${invalidId}`)
            .set("Authorization", adminJwtToken);
        
        
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
    });
});