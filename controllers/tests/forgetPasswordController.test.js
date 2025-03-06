import { expect, jest } from "@jest/globals";
import { forgotPasswordController } from "../authController";
import userModel from "../../models/userModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/userModel.js");

describe("Forget Password Controller Tests", () => {
    let req, res, user;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            body: {
                email: "douglas@mail.com",
                answer: "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Golf",
                newPassword: "Exact6"
            }
          };

          user = {
            _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
            name: 'Douglas Lim',
            email: 'douglas@mail.com',
            password: '$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa',
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

    // Test 1: Success case where user is able to reset their password with all valid fields
    // This test also covers the case for the upper boundary for BVA for answer (100 characters)
    // This test also covers the case for the lower boundary for BVA for password (6 characters)
    // This also covers Pairwise Testing Combination 1 (Valid email, Valid answer, Valid new password) 
    it('should allow the user to reset their password successfully with all valid fields', async () => {
        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        // Check that the message shows that the password can be resetted successfully
        expect(res.send.mock.lastCall[0].message).toBe("Password Reset Successfully");
    });

    // Email (Equivalence Partitioning) (There are 3 equivalence classes: Empty email, Non-empty invalid email, Valid email)
    // Valid email is already covered in Test 1
    // Test 2 (Empty email): Case where email is empty
    it('should not allow the user to reset their password when their email is empty', async () => {
        req.body.email = "";

        await forgotPasswordController(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        // Check that the message shows that the email is required
        expect(res.send.mock.lastCall[0].message).toBe("Email is required");
    });

    // Test 3 (Non-empty invalid email): Case where email is non-empty and invalid
    it('should not allow the user to reset their password when their non-empty email is invalid', async () => {
        req.body.email = "InvalidEmailShouldNotWork";

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        // Check that the message shows that the email is in an invalid format
        expect(res.send.mock.lastCall[0].message).toBe("The email is in an invalid format");
    });

    // Answer (Equivalence Partitioning) (There are 3 equivalence classes: Empty answer, Non-empty invalid answer, Valid answer)
    // Valid answer is already covered in Test 1
    // Test 4 (Empty answer): Case where answer is empty
    it('should not allow the user to reset their password when their answer is empty', async () => {
        req.body.answer = "";

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        // Check that the message shows that an answer is required
        expect(res.send.mock.lastCall[0].message).toBe("An answer is required");
    });

    // Test 5 (Non-empty invalid answer): Case where answer is non-empty and invalid
    // This test also covers the case for just above upper boundary for BVA for answer (101 characters)
    it('should not allow the user to reset their password when their non-empty answer is 101 characters long', async () => {
        req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        // Check that the message shows that the answer can only be up to 100 characters
        expect(res.send.mock.lastCall[0].message).toBe("The answer can only be up to 100 characters long");
    });
    
    // Password (Equivalence Partitioning) (There are 3 equivalence classes: Empty password, Non-empty invalid password, Valid password)
    // Valid password is already covered in Test 1
    // Test 6 (Empty Password): Case where new password is empty
    it('should not allow the user to reset their password when their new password is empty', async () => {
        req.body.newPassword = "";

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        // Check that the message shows that new password is required
        expect(res.send.mock.lastCall[0].message).toBe("New Password is required");
    });

    // Test 7 (Non-empty invalid password): Case where new password is non-empty and has a length less than 6
    // This test also covers the case for just below the lower boundary for BVA for password (5 characters)
    it('should not allow the user to reset their password when their non-empty password is of length 5', async () => {
        req.body.newPassword = "5char";

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        // Check that the message shows that the password should be at least 6 characters long
        expect(res.send.mock.lastCall[0].message).toBe("The length of the new password should be at least 6 characters long");
    });

    // Test 8: Case where valid email, valid password and valid answer is given but user does not exist
    it('should not allow the user to reset their password when the user does not exist', async () => {
        userModel.findOne = jest.fn().mockResolvedValue(null);

        await forgotPasswordController(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        // Check that the message shows that the email or answer is incorrect
        expect(res.send.mock.lastCall[0].message).toBe("Wrong Email Or Answer");
    });

    // Test 9: Case where there is an error when connecting to the database
    it('should throw an error when there is an error in connecting to the database', async () => {
        userModel.findOne = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to retrieve user for resetting password");
        });

        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        // Check that the message shows that there is an error
        expect(res.send.mock.lastCall[0].message).toBe("Something went wrong");
    });

    // Some pairwise testing cases
    // Pairwise Testing Combination 1 is already used in Test case 1
    /* Pairwise Testing Combination 2 (Test 10)
    Email: Valid
    Answer: Non-empty invalid
    New Password: Non-empty invalid
    */
   it('should not allow the user to reset their password when valid email, non-empty invalid answer and non-empty invalid new password is passed as input', async () => {
    req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";
    req.body.newPassword = "5char";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // Check that the message shows that the length of the new password should be at least 6 characters long
    expect(res.send.mock.lastCall[0].message).toBe("The length of the new password should be at least 6 characters long");
   });


   /* Pairwise Testing Combination 3 (Test 11)
   Email: Valid
   Answer: Empty
   New Password: Empty
   */
  it('should not allow the user to reset their password when valid email, empty answer and empty new password is passed as input', async () => {
    req.body.answer = "";
    req.body.newPassword = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // Check that the message shows that an answer is required
    expect(res.send.mock.lastCall[0].message).toBe("An answer is required");    
  });


  /* Pairwise Testing Combination 4 (Test 12)
    Email: Non-empty invalid
    Answer: Non-empty invalid
    New Password: Empty
  */
  it('should not allow the user to reset their password when non-empty invalid email, non-empty invalid answer and empty new password is passed as input', async () => {
    req.body.email = "InvalidEmailShouldNotWork";
    req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";
    req.body.newPassword = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // Check that the message shows that new password is required
    expect(res.send.mock.lastCall[0].message).toBe("New Password is required");   
  });

  /* Pairwise Testing Combination 5 (Test 13)
    Email: Non-empty invalid
    Answer: Empty
    New Password: Valid
  */
 it('should not allow the user to reset their password when non-empty invalid email, empty answer and valid new password is passed as input', async () => {
    req.body.email = "InvalidEmailShouldNotWork";
    req.body.answer = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // Check that the message shows that an answer is required
    expect(res.send.mock.lastCall[0].message).toBe("An answer is required");
 });


  /* Pairwise Testing Combination 6 (Test 14)
    Email: Non-empty invalid
    Answer: Valid
    New Password: Non-empty invalid
  */
 it('should not allow the user to reset their password when non-empty invalid email, valid answer and non-empty invalid new password is passed as input', async () => {
    req.body.email = "InvalidEmailShouldNotWork";
    req.body.newPassword = "5char";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // Check that the message shows that the length of the new password should be at least 6 characters long
    expect(res.send.mock.lastCall[0].message).toBe("The length of the new password should be at least 6 characters long");
 });

});
