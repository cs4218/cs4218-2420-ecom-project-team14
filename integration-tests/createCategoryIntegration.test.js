import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server"
import JWT from "jsonwebtoken";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";

describe('Create Category Backend Integration Testing', () => {
    const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";
    let mongoInMemoryServer, jwtToken;

    beforeAll(async () => {
        // Connecting to in memory mongodb database
        mongoInMemoryServer = await MongoMemoryServer.create();
        const uri = mongoInMemoryServer.getUri();
        await mongoose.connect(uri);

        // Creating the admin account (Used later in JWT creation)
        const admin = await new userModel({
            name: "Admin Account",
            email: "admin.account@mail.cpm",
            phone: "91292838",
            address: "Admin place somewhere",
            password: hashedPassword,
            answer: "Swimming",
            role: 1
        }).save();

        // Creating the JWT Token needed to call the createCategoryController
        jwtToken = await JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
        });
        
    });

    afterEach(async () => {
        // Clearing the database after each test
        await categoryModel.deleteMany({});
    })

    afterAll(async () => {
        // Disconnecting the connection to database after test has finished
        await mongoose.disconnect();
        // Stopping the in memory mongodb server since test has ended
        await mongoInMemoryServer.stop();
    });

    // Check that the user is able to successfully create category with valid category name
    test('response returns 201 when the admin is able to successfully create category with valid category name', async () => {
        const response = await request(app).post('/api/v1/category/create-category')
            .set("Authorization", jwtToken)
            .send({
                name: "Pikmin Series"
            });
        
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("new category created");
        expect(response.body.category.name).toBe("Pikmin Series");
    });

    // Check that the user is unable to create category with empty name
    test('response returns 401 when the admin is trying to create category with empty name', async () => {
        const response = await request(app).post('/api/v1/category/create-category')
            .set("Authorization", jwtToken)
            .send({
                name: ""
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Name is required");
    });

    // Check that the user is unable to create category with name of length greater than 100
    test('response returns 401 when the admin is trying to create category with name of length 101', async () => {
        const response = await request(app).post('/api/v1/category/create-category')
            .set("Authorization", jwtToken)
            .send({
                name: "Electronics and Toys for Kids: Video Games, Lego, Board Games, Card Games, Action Figures and Puzzles"
            });
        
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Name of category can only be up to 100 characters long");
    });

    // Check that the user is unable to create category when the category name already exists
    test('response returns 401 when the admin is trying to create category with name that already exists', async () => {
        await new categoryModel({
            name: "Pikmin Series",
            slug: "pikmin-series"
        }).save()
        
        
        const response = await request(app).post('/api/v1/category/create-category')
        .set("Authorization", jwtToken)
        .send({
            name: "Pikmin Series"
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("The name of the category already exists");
    });

})