import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel";
import app from "../server"

describe('Forget Password Backend Integration Testing', () => {
    let mongoInMemoryServer, reqBodyData, userid;
    const hashedPassword = "$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa";

    beforeAll(async () => {
        // Connecting to in memory mongodb database
        mongoInMemoryServer = await MongoMemoryServer.create();
        const uri = mongoInMemoryServer.getUri();
        await mongoose.connect(uri);

        // Creating user for test
        const user = await new userModel({
            name: "Douglas Lim", 
            email: "douglas.lim@mail.com", 
            phone: "92213141", 
            address: "766 Kent Ridge Road", 
            password: hashedPassword, 
            answer: "Football"
        }).save();

        // Setting user id used later for resetting password in afterEach
        userid = user._id;
    });

    afterAll(async () => {
        // Disconnecting the connection to database after test has finished
        await mongoose.disconnect();
        // Stopping the in memory mongodb server since test has ended
        await mongoInMemoryServer.stop();
    });

    beforeEach(() => {
        reqBodyData = {
            email: 'douglas.lim@mail.com',
            answer: "Football",
            newPassword: "differentAndNewPassword"
        }
    })

    afterEach(async () => {
        // Reset the password back to original password after each test
        await userModel.findByIdAndUpdate(userid, { password: hashedPassword });
    });

    // Success case
    test('response returns 200 and the user is able to reset their password successfully', async () => {
        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Password Reset Successfully");
        expect(response.body.success).toBe(true);
    });

    // Empty email
    test('response returns 400 and the user is unable to reset their password with empty email', async () => {
        reqBodyData.email = "";
        
        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email is required");
    });

    // Invalid email
    test('response returns 400 and the user is unable to reset their password with invalid email', async () => {
        reqBodyData.email = "ThisInvalidEmailShouldNotWork";

        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("The email is in an invalid format");
    });

    // Empty new password
    test('response returns 400 and the user is unable to reset their password with empty new password', async () => {
        reqBodyData.newPassword = "";
        
        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("New Password is required");
    });

    // Invalid password with length less than 6
    test('response returns 400 and the user is unable to reset their password with password with length of 5', async () => {
        reqBodyData.newPassword = "5char";

        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("The length of the new password should be at least 6 characters long");
    })

    // Empty answer
    test('response returns 400 and the user is unable to reset their password with empty answer', async () => {
        reqBodyData.answer = "";

        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("An answer is required");
    })

    // Invalid answer with length more than 100
    test('response returns 400 and the user is unable to reset their password with answer of length 101', async () => {
        reqBodyData.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";

        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("The answer can only be up to 100 characters long");
    });

    // Valid email, password and answer but the provided email and answer are wrong (do not match user in database)
    test('response returns 404 and the user is unable to reset their password if provided email and answer does not match user in database', async () => {
        reqBodyData.email = "some.person@mail.com";
        reqBodyData.answer = "Clearly a wrong Answer";

        const response = await request(app).post('/api/v1/auth/forgot-password').send(reqBodyData);
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Wrong Email Or Answer");
        expect(response.body.success).toBe(false);
    });
})