import { expect, jest } from "@jest/globals";
import { forgotPasswordController } from "../authController";
import userModel from "../../models/userModel";
import { ObjectId } from "mongodb";

describe("Update Profile Controller Tests", () => {
    let req, res, user;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            body: {
                email: "douglas@mail.com",
                answer: "Football",
                newPassword: "MoreThan6CharLong"
            }
          };

          user = {
            _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
            name: 'Douglas Lim',
            email: 'douglas@mail.com',
            password: '$2b$10$qbvAri/zqZbK3PplhOFLM.SWfKecgXWjCOyv8S0le/fipAFhSxH4i',
            phone: '97376721',
            address: 'Beautiful Home on Earth',
            role: 0
          }
      
          res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
          };

          userModel.findOne = jest.fn().mockResolvedValue(user);
          userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    });

    // Success case where user is able to reset their password with all valid fields
    it('should allow the user to reset their password successfully with all valid fields', async () => {
        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send.mock.lastCall[0].message).toBe("Password Reset Successfully");
    });

    // Email
    // Case where email is empty
    it('should not allow the user to reset their password when their email is empty', async () => {
        req.body.email = "";

        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Email is required");
    });

    // Case where email is non-empty and invalid
    it('should not allow the user to reset their password when their non-empty email is invalid', async () => {
        req.body.email = "InvalidEmailShouldNotWork";

        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The email is in an invalid format");
    });

    // Answer
    // Case where answer is empty
    it('should not allow the user to reset their password when their answer is empty', async () => {
        req.body.answer = "";

        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("An answer is required");
    });

    // Case where answer is non-empty and invalid
    it('should not allow the user to reset their password when their non-empty answer is invalid', async () => {
        req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";

        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The answer can only be up to 200 characters long");
    });
    
    // Password
    // Case where new password is empty
    it('should not allow the user to reset their password when their new password is empty', async () => {
        req.body.newPassword = "";

        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("New Password is required");
    });

    // Case where new password is non-empty and has a length less than 6
    it('should not allow the user to reset their password when their non-empty password is of length 5', async () => {
        req.body.newPassword = "5char";

        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The length of the new password should be at least 6 characters long");
    });

    // Case where valid email, password and answer is given but user does not exist
    it('should not allow the user to reset their password when the user does not exist', async () => {
        userModel.findOne = jest.fn().mockResolvedValue(null);

        await forgotPasswordController(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send.mock.lastCall[0].message).toBe("Wrong Email Or Answer");
    });

    // Case where there is an error when connecting to the database
    it('should throw an error when there is an error in connecting to the database', async () => {
        userModel.findOne = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to retrieve user for resetting password");
        });

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send.mock.lastCall[0].message).toBe("Something went wrong");
    });

    /* Pairwise Testing Combination 1
    Email: Valid
    Answer: Invalid
    New Password: Invalid
    */
   it('should not allow the user to reset their password when valid email, non-empty invalid answer and non-empty invalid new password is passed as input', async () => {
    req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";
    req.body.newPassword = "5char";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send.mock.lastCall[0].message).toBe("The length of the new password should be at least 6 characters long");
   });


   /* Pairwise Testing Combination 2
   Email: Valid
   Answer: Empty
   New Password: Empty
   */
  it('should not allow the user to reset their password when valid email, empty answer and empty new password is passed as input', async () => {
    req.body.answer = "";
    req.body.newPassword = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send.mock.lastCall[0].message).toBe("An answer is required");    
  });


  /* Pairwise Testing Combination 3
    Email: Invalid
    Answer: Invalid
    New Password: Empty
  */
  it('should not allow the user to reset their password when non-empty invalid email, non-empty invalid answer and empty new password is passed as input', async () => {
    req.body.email = "InvalidEmailShouldNotWork";
    req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";
    req.body.newPassword = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send.mock.lastCall[0].message).toBe("New Password is required");   
  });

});
