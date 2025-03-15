import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import orderModel from "../models/orderModel";
import userModel from "../models/userModel";
import app from "../server"
import JWT from "jsonwebtoken";
import productModel from "../models/productModel";
import { ObjectId } from "mongodb";

describe('Order Status Backend Integration Testing', () => {
    const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";
    let mongoInMemoryServer, orderId, jwtToken;

    beforeAll(async () => {
        // Connecting to in memory mongodb database
        mongoInMemoryServer = await MongoMemoryServer.create();
        const uri = mongoInMemoryServer.getUri();
        await mongoose.connect(uri);
        
        // Creating category id needed for creating product
        const categoryId = new ObjectId("67d3e462339aeb35c28f1be3");

        // Adding product to database
        const testProduct = await new productModel({
            name: "Mega Lucario EX Trading Card",
            slug: "mega-lucario-ex-trading-card",
            description: "This is a trading card for the mega evolved form of lucario",
            price: 100.50,
            category: categoryId,
            quantity: 3,
            shipping: true,
        }).save();

        // Adding buyer to database
        const testBuyer = await new userModel({
            name: "Douglas Lim", 
            email: "douglas.lim@mail.com", 
            phone: "92213141", 
            address: "766 Kent Ridge Road", 
            password: hashedPassword, 
            answer: "Football"
        }).save();

        // Adding the order to database
        const testOrder = await new orderModel({
            products: [testProduct._id],
            buyer: testBuyer._id,
        }).save();

        // Setting the order id used later when calling order status
        orderId = testOrder._id;

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

        // Creating the JWT Token needed to call the orderStatusController
        jwtToken = await JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
        });
    });

    afterAll(async () => {
        // Disconnecting the connection to database after test has finished
        await mongoose.disconnect();
        // Stopping the in memory mongodb server since test has ended
        await mongoInMemoryServer.stop();
    });

    afterEach(async () => {
        // Update order status back to Not Processed after each test
        await orderModel.findByIdAndUpdate(orderId, { status: "Not Processed"});
    });

    // Check that order with updated order status is returned when called by admin
    test('response returns the order with updated order status when called by admin', async () => {
        const response = await request(app).put(`/api/v1/auth/order-status/${orderId}`)
            .set("Authorization", jwtToken)
            .send({
                status: "Delivered"
            });
        
        const orderReturned = response.body;
        
        // Check that the order id of the order is correct
        expect(orderReturned._id).toEqual(orderId.toString());
        // Check that the order status of the product is changed to delivered
        expect(orderReturned.status).toBe("Delivered");
    });

    // Check that there is an error message when invalid order status is provided
    test('response returns 400 when invalid order status is given', async () => {
        const response = await request(app).put(`/api/v1/auth/order-status/${orderId}`)
            .set("Authorization", jwtToken)
            .send({
                status: "Not a valid status here"
            });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid order status is provided");
    });

    // Check that there is an error message when invalid order id that is not found in database is provided
    test('response returns 400 when invalid order id which is not in database is given', async () => {
        const response = await request(app).put("/api/v1/auth/order-status/67d3ef07971e8aeb3dc1228c")
            .set("Authorization", jwtToken)
            .send({
                status: "Delivered"
            });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid order id was provided and order cannot be found");
    });

})