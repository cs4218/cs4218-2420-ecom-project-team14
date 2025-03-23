import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server";
import JWT from "jsonwebtoken";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import { ObjectId } from "mongodb";

describe('Update Category Backend Integration Testing', () => {
    const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";
    let mongoInMemoryServer, adminJwtToken, regularUserJwtToken, categoryId;

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

    // Test 1: Successful category update by admin
    it('should allow admin to update a category successfully', async () => {
        const updatedName = "Updated Category";
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: updatedName });
        
        // Check response status code and message
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Category Updated Successfully");
        
        // Verify that the category was actually updated in the database
        const updatedCategory = await categoryModel.findById(categoryId);
        expect(updatedCategory.name).toBe(updatedName);
        expect(updatedCategory.slug).toBe("updated-category");
    });

    // Test 2: Authentication failure - no token provided
    it('should not allow category update when no authentication token is provided', async () => {
        const updatedName = "Updated Category";
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .send({ name: updatedName });
        
        // Check response status code
        expect(response.status).toBe(401);
        
        // Verify that the category was not updated in the database
        const category = await categoryModel.findById(categoryId);
        expect(category.name).toBe("Test Category");
        expect(category.slug).toBe("test-category");
    });

    // Test 3: Authorization failure by non-admin user
    it('should not allow regular users to update categories', async () => {
        const updatedName = "Updated Category";
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", regularUserJwtToken)
            .send({ name: updatedName });
        
        // Check response status code
        expect(response.status).toBe(401);
        
        // Verify that the category was not updated in the database
        const category = await categoryModel.findById(categoryId);
        expect(category.name).toBe("Test Category");
        expect(category.slug).toBe("test-category");
    });

    // Test 4: Empty name validation
    it('should return 400 when trying to update a category with empty name', async () => {
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: "" });
        
        // Check response status code and message
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("The category name is required");
        
        // Verify that the category was not updated in the database
        const category = await categoryModel.findById(categoryId);
        expect(category.name).toBe("Test Category");
    });

    // Test 5: Name length validation
    it('should return 400 when trying to update a category with name exceeding 100 characters', async () => {
        const longName = "a".repeat(101); // Create a string with 101 characters
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: longName });
        
        // Check response status code and message
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("The name of the category can only be up to 100 characters long");
        
        // Verify that the category was not updated in the database
        const category = await categoryModel.findById(categoryId);
        expect(category.name).toBe("Test Category");
    });

    // Test 6: Duplicate name validation
    it('should return 400 when trying to update a category with a name that already exists', async () => {
        // Create another category with the name we will try to update to
        await new categoryModel({
            name: "Existing Category",
            slug: "existing-category"
        }).save();
        
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: "Existing Category" });
        
        // Check response status code and message
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("The name of the category already exists");
        
        // Verify that the original category was not updated
        const category = await categoryModel.findById(categoryId);
        expect(category.name).toBe("Test Category");
    });

    // Test 7: Invalid category ID
    it('should return 400 when trying to update a category with non-existent ID', async () => {
        const nonExistentId = new ObjectId();
        const response = await request(app)
            .put(`/api/v1/category/update-category/${nonExistentId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: "Updated Category" });
        
        // Check response status code
        expect(response.status).toBe(400);
    });

    // Test 8: Invalid format of category ID
    it('should return 500 when trying to update a category with invalid ID format', async () => {
        const invalidId = "invalid-id-format";
        const response = await request(app)
            .put(`/api/v1/category/update-category/${invalidId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: "Updated Category" });
        
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
    });

    // Test 9: Update with same name (no actual change)
    it('should return 400 when trying to update with the same name', async () => {
        const response = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", adminJwtToken)
            .send({ name: "Test Category" });
        
        // Check response status code
        expect(response.status).toBe(400);
        
        // Verify that the category data remains the same
        const category = await categoryModel.findById(categoryId);
        expect(category.name).toBe("Test Category");
        expect(category.slug).toBe("test-category");
    });
});