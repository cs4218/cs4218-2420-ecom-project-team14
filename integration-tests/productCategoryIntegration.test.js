import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

describe('Product Category Controller Integration Tests', () => {
    let mongoMemServer;
    let category1, category2;
    let product1, product2, product3;

    beforeAll(async () => {
        // Connect to in-memory MongoDB
        mongoMemServer = await MongoMemoryServer.create();
        const uri = mongoMemServer.getUri();
        await mongoose.connect(uri);

        // Create test categories
        category1 = await categoryModel.create({
            name: "Electronics",
            slug: "electronics"
        });

        category2 = await categoryModel.create({
            name: "Clothing",
            slug: "clothing"
        });

        // Create test products in different categories
        product1 = await productModel.create({
            name: "Smartphone",
            slug: "smartphone",
            description: "Latest smartphone with advanced features",
            price: 999,
            category: category1._id,
            quantity: 15,
            shipping: true
        });

        product2 = await productModel.create({
            name: "Laptop",
            slug: "laptop",
            description: "High-performance laptop for professionals",
            price: 1499,
            category: category1._id,
            quantity: 10,
            shipping: true
        });

        product3 = await productModel.create({
            name: "T-Shirt",
            slug: "t-shirt",
            description: "Comfortable cotton t-shirt",
            price: 25,
            category: category2._id,
            quantity: 50,
            shipping: true
        });
    });

    afterAll(async () => {
        // Disconnect and stop MongoDB server after all tests
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoMemServer.stop();
    });

    // Test 1: Successfully get products by category
    it('should retrieve all products belonging to a specific category', async () => {
        const response = await request(app)
            .get(`/api/v1/product/product-category/${category1.slug}`);
        
        // Check response status code and structure
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('category');
        expect(response.body).toHaveProperty('products');
        
        // Verify correct category info is returned
        expect(response.body.category.name).toBe(category1.name);
        expect(response.body.category.slug).toBe(category1.slug);
        
        // Verify correct products are returned
        expect(response.body.products.length).toBe(2); // Should return 2 products from Electronics category
        
        // Verify product details
        const productNames = response.body.products.map(p => p.name);
        expect(productNames).toContain(product1.name);
        expect(productNames).toContain(product2.name);
        expect(productNames).not.toContain(product3.name); // Should not contain products from other categories
    });

    // Test 2: Get products for category with no products
    it('should return empty products array for category with no products', async () => {
        // Create a new empty category
        const emptyCategory = await categoryModel.create({
            name: "Empty Category",
            slug: "empty-category"
        });
        
        const response = await request(app)
            .get(`/api/v1/product/product-category/${emptyCategory.slug}`);
        
        // Check response status code and structure
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('category');
        expect(response.body).toHaveProperty('products');
        
        // Verify correct category info is returned
        expect(response.body.category.name).toBe(emptyCategory.name);
        expect(response.body.category.slug).toBe(emptyCategory.slug);
        
        // Verify empty products array
        expect(Array.isArray(response.body.products)).toBe(true);
        expect(response.body.products.length).toBe(0);
    });

    // Test 3: Get products for non-existent category
    it('should return 404 for non-existent category', async () => {
        const response = await request(app)
            .get('/api/v1/product/product-category/non-existent-category');
        
        // Check response status code
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Category not found');
    });

    // Test 4: Verify product details are correctly returned
    it('should return complete product details for category products', async () => {
        const response = await request(app)
            .get(`/api/v1/product/product-category/${category1.slug}`);
        
        // Find product1 in response
        const returnedProduct = response.body.products.find(p => p.slug === product1.slug);
        
        // Verify all required product fields are returned
        expect(returnedProduct).toBeDefined();
        expect(returnedProduct.name).toBe(product1.name);
        expect(returnedProduct.description).toBe(product1.description);
        expect(returnedProduct.price).toBe(product1.price);
        expect(returnedProduct.quantity).toBe(product1.quantity);
        expect(returnedProduct.shipping).toBe(product1.shipping);
        
        // Verify category information is populated
        expect(returnedProduct.category).toBeDefined();
        expect(returnedProduct.category.name).toBe(category1.name);
        expect(returnedProduct.category.slug).toBe(category1.slug);
    });

    // Test 5: Verify products are returned when querying a category
    it('should return all products for a category including newly added ones', async () => {
        // Create a new product in the category
        const newerProduct = await productModel.create({
            name: "Newer Electronic",
            slug: "newer-electronic",
            description: "A newer electronic product",
            price: 299,
            category: category1._id,
            quantity: 5,
            shipping: true
        });
        
        const response = await request(app)
            .get(`/api/v1/product/product-category/${category1.slug}`);
            
        // Verify all products for the category are returned
        expect(response.body.products.length).toBeGreaterThanOrEqual(3); // At least 3 products (2 original + 1 new)
        
        // Verify the new product is included in the results
        const productNames = response.body.products.map(p => p.name);
        expect(productNames).toContain(newerProduct.name);
        expect(productNames).toContain(product1.name);
        expect(productNames).toContain(product2.name);
    });
});