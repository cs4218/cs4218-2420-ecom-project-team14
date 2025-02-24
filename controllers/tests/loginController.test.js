import { jest } from "@jest/globals";
import { loginController } from "../authController";
import userModel from "../../models/userModel";
import { ObjectId } from "mongodb";
import JWT from "jsonwebtoken"

jest.mock("../../models/userModel.js");
jest.mock("jsonwebtoken");

describe("Login Controller Tests", () => {
    let req, res;
    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {
                email: "douglas@mail.com",
                password: "SomeRandomPasswordHere123"
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
          };
        
        
    });

    // Success case where user is able to login successfully
    it("should allow the user to login successfully when correct email and password is entered", async () => {
            // Specifying the user model's find one mock functionality (Like lab example)
            userModel.findOne = jest.fn().mockResolvedValue({
                _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
                name: 'Douglas Lim',
                email: 'douglas@mail.com',
                password: '$2b$10$qbvAri/zqZbK3PplhOFLM.SWfKecgXWjCOyv8S0le/fipAFhSxH4i',
                phone: '97376721',
                address: 'Beautiful Home on Earth',
                role: 0
            });

            // Mock JWT functionality
            JWT.sign = jest.fn().mockResolvedValue(null);
            
            await loginController(req, res); 

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send.mock.lastCall[0].message).toBe("login successfully");
            expect(res.send.mock.lastCall[0].user._id).toEqual(new ObjectId("679f3c5eb35bb2db5e6a3646"));
            expect(res.send.mock.lastCall[0].user.name).toBe("Douglas Lim");
            expect(res.send.mock.lastCall[0].user.email).toBe("douglas@mail.com");
            expect(res.send.mock.lastCall[0].user.phone).toBe("97376721");
            expect(res.send.mock.lastCall[0].user.address).toBe("Beautiful Home on Earth");
            expect(res.send.mock.lastCall[0].user.role).toBe(0);
    });


    // Email
    // Case where empty email is inputted
    it('should not allow user with an empty email to login', async () => {
        req.body.email = "";
        userModel.findOne = jest.fn().mockResolvedValue(null);

        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Invalid email or password has been entered or email is not registered");
        
        // Checks that it does not reach this method
        expect(userModel.findOne).not.toHaveBeenCalled();
    });

    // Case where non-empty email is inputted but not found in database
    it('should not allow user with a non-empty email that is not in the database to login', async () => {
        req.body.email = "non.existent.email@mail.com";

        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Invalid email or password has been entered or email is not registered");
    });


    // Password
    // Case where empty password is inputted
    it('should not allow user with an empty password to login', async () => {
        req.body.password = "";
        userModel.findOne = jest.fn().mockResolvedValue(null);

        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Invalid email or password has been entered or email is not registered");

        // Checks that it does not reach this method
        expect(userModel.findOne).not.toHaveBeenCalled();
    });


    // Case where non-empty password is inputted but it is invalid
    it('should not allow user with a non-empty invalid password to login', async () => {
        // Specifying the user model's find one mock functionality (Like lab example)
        userModel.findOne = jest.fn().mockResolvedValue({
            _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
            name: 'Douglas Lim',
            email: 'douglas@mail.com',
            password: '$2b$10$qbvAri/zqZbK3PplhOFLM.SWfKecgXWjCOyv8S0le/fipAFhSxH4i',
            phone: '97376721',
            address: 'Beautiful Home on Earth',
            role: 0
        });

        req.body.password = "ThisShouldNotBeWorking";

        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Invalid email or password has been entered or email is not registered");
    });

});
