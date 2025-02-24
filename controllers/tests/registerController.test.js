import { jest } from "@jest/globals";
import { registerController } from "../authController";
import userModel from "../../models/userModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/userModel.js");

describe("Register Controller Tests", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();


      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.prototype.save = jest.fn();

      req = {
        body: {
          name: "Douglas Lim",
          email: "douglas.lim@mail.com",
          password: "SomeRandomPasswordHere123",
          phone: "90183289",
          address: "6 Short Street",
          answer: "Basketball",
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });

    // Success case where all details are in correct format for user to be registered
    it("should allow user with all correct details to be registered successfully", async () => {
      
      await registerController(req, res);
      
      // Check that http status is 201
      expect(res.status).toHaveBeenCalledWith(201);   
      // Check that message sent in response is correct
      expect(res.send.mock.lastCall[0].message).toBe("User Register Successfully");

    });
  

    // Email (Equivalence partitioning) (There are 3 cases with valid email case already covered above)
    // Case 1: Empty email 
    it('should not allow user with empty email to be registered', async () => {

      req.body.email = '';

      await registerController(req, res);

      // Check that message shows that email is required
      expect(res.send.mock.lastCall[0].message).toBe("Email is Required");
    });

    // Case 2: Non-empty email in an invalid format
    it('should not allow user with non-empty invalid email to be registered', async () => {
      req.body.email = "thisIsNotAnEmailThatShouldWork";

      await registerController(req, res);

      // Check that http status is 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message shows that email is in invalid format
      expect(res.send.mock.lastCall[0].message).toBe("The email is in an invalid format");

    });
    

    // Password (Equivalence Partitioning) (There are 3 cases with valid password case already covered above)
    // Case 1: Empty password
    it('should not allow user with empty password to be registered', async () => {

      req.body.password = '';

      await registerController(req, res);

      // Check that message says that password is required
      expect(res.send.mock.lastCall[0].message).toBe("Password is Required");
    });

    // Case 2: Non-empty password with length less than 6 characters
    it('should not allow user with non-empty password of length less than 6 to be registered', async () => {
      
      req.body.password = "SHORT";

      await registerController(req, res);

      // Check that http status is 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message says that password should be at least 6 characters long
      expect(res.send.mock.lastCall[0].message).toBe("The length of the password should be at least 6 characters long");
    });


    // Name (Equivalence Partitioning) (There are 3 cases with valid name case already covered above)
    // Case 1: Empty Name
    it('should not allow user with empty name to be registered', async () => {
      req.body.name = "";

      await registerController(req, res);

      // Check that message says that name is required
      expect(res.send.mock.lastCall[0].message).toBe("Name is Required");
    });
    
    
    // Case 2: Non-empty name with length more than 150 characters
    it('should not allow user with non-empty name of length 151 to be registered', async () => {
      req.body.name = "John William Samuel Douglas Russell Wallace Brandon Blaine James Joseph Johnson Monrole Jefferson Theodore Timothy Reece Franklin Charles Watson Holmes";

      await registerController(req, res);

      // Check that http status is 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message says that name should be at more 150 characters long
      expect(res.send.mock.lastCall[0].message).toBe("The name can only be up to 150 characters long");
    });


    // Phone (Equivalence Partitioning) (There are 3 cases with valid phone case already covered above)
    // Case 1: Empty phone number
    it('should not allow user with empty phone number to be registered', async () => {
      req.body.phone = "";

      await registerController(req, res);

      // Check that message says that phone number is required
      expect(res.send.mock.lastCall[0].message).toBe("Phone no is Required");
    });
    
    
    // Case 2: Non-empty invalid phone number that does not start with 6,8 or 9 and be 8 digits long
    it('should not allow user with non-empty invalid phone number that does not start with 6, 8 or 9 to be registered', async () => {
      req.body.phone = "12391021";

      await registerController(req, res);

      // Check that http status is 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message says that phone number needs to start with 6,8 or 9 and be 8 digits long
      expect(res.send.mock.lastCall[0].message).toBe("The phone number must start with 6,8 or 9 and be 8 digits long");
    });


    // Address (Equivalence Partitioning) (There are 3 cases with valid address case already covered above)
    // Case 1: Empty address
    it('should not allow user with empty address to be registered', async () => {
      req.body.address = "";

      await registerController(req, res);

      // Check that message says that address is required
      expect(res.send.mock.lastCall[0].message).toBe("Address is Required");
    });

    // Case 2: Non-empty invalid address that is more than 150 characters long
    it('should not allow user with non-empty invalid address of length 151 to be registered', async () => {
      req.body.address = "This is an extremely long long address with more than one hundred and fifty characters and this should not be allowed when trying to update the profile";
  
      await registerController(req, res);

      // Check that http status is 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message says that address can only be up to 150 characters long
      expect(res.send.mock.lastCall[0].message).toBe("The address can only be up to 150 characters long");
    });


    // Answer (Equivalence Partitioning) (There are 3 cases with valid answer case already covered above)
    // Case 1: Empty answer
    it('should not allow user with empty answer to be registered', async () => {
      req.body.answer = "";

      await registerController(req, res);

      // Check that message says that answer is required
      expect(res.send.mock.lastCall[0].message).toBe("Answer is Required");
    });

    // Case 2: Non-empty invalid answer that is more than 50 characters long
    it('should not allow user with non-empty invalid answer of length 51 to be registered', async () => {
      req.body.answer = "Basketball, Triple Jump, Cross country running, Half Marathon, Decathlon, Baseball, Volleyball, Rugby";
  
      await registerController(req, res);

      // Check that http status is 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message says that answer can only be up to 50 characters long
      expect(res.send.mock.lastCall[0].message).toBe("The answer can only be up to 50 characters long");
    });


    // Case where all fields are valid but email is already used
    it('should not allow user with a used email to be registered', async () => {
      const user = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: 'Douglas Lim',
        email: 'douglas@mail.com',
        password: '$2b$10$qbvAri/zqZbK3PplhOFLM.SWfKecgXWjCOyv8S0le/fipAFhSxH4i',
        phone: '97376721',
        address: 'Beautiful Home on Earth',
        role: 0
      }

      userModel.findOne = jest.fn().mockResolvedValue(user);

      await registerController(req, res);

      // Check that http status is 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Check that message says that the user is already registered and to login
      expect(res.send.mock.lastCall[0].message).toBe("Already Register please login");
    });

    // Case where error is handled when the user encounters an error connecting to database
    it('should throw an error when the user faces an error in connecting to database', async () => {
      userModel.findOne = jest.fn().mockImplementation(() => {
        throw new Error("Error in connecting with database to check for existing user")
      });

      await registerController(req, res);

      // Check that http status is 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Check that message says that there is an error in registration
      expect(res.send.mock.lastCall[0].message).toBe("Error in Registration");
    });

  });
  