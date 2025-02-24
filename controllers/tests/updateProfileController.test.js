import { jest } from "@jest/globals";
import { updateProfileController } from "../authController";
import userModel from "../../models/userModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/userModel.js");

describe("Update Profile Controller Tests", () => {
    let req, res, user, updatedUser;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            body: {
              name: "Douglas Lim",
              password: "SomeRandomPasswordHere123",
              phone: "90183289",
              address: "6 Short Street"
            },

            user: {
              _id: "679f3c5eb35bb2db5e6a3646"
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
            json: jest.fn()
          };

          userModel.findById = jest.fn().mockResolvedValue(user);
    });

    // Success case: Should allow the user to update the profile successfully with all valid fields
    it("should allow the user to update the profile successfully", async () => {

      updatedUser = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: req.body.name || user.name,
        email: 'douglas@mail.com',
        password: req.body.password || user.password,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        role: 0
      }

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
    });

    // Password
    // Case where invalid password with length less than 6 is used for updating the profile
    it('should not allow the user to update the profile with a password of length 5', async () => {
      req.body.password = "SHORT";
      await updateProfileController(req, res);
      
      expect(res.json.mock.lastCall[0].error).toBe("Passsword is required and 6 character long");
    });

    // Case where empty password is used for updating the profile (Should allow for updating by using the previous password)
    it('should allow the user to update the profile with empty password', async () => {
      req.body.password = "";

      updatedUser = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: req.body.name || user.name,
        email: 'douglas@mail.com',
        password: req.body.password || user.password,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        role: 0
      }

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
    });

    // Name
    // Case where invalid name with length more than 150 characters is used for updating the profile
    it('should not allow the user to update the profile with a name that is of length 151', async () => {
      req.body.name = "John William Samuel Douglas Russell Wallace Brandon Blaine James Joseph Johnson Monrole Jefferson Theodore Timothy Reece Franklin Charles Watson Holmes";
      
      await updateProfileController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send.mock.lastCall[0].message).toBe("The name can only be up to 150 characters long");
    });

    // Case where empty name is used for updating the profile (Should allow for updating by using the previous name)
    it('should allow the user to update the profile with empty name', async () => {
      req.body.name = "";

      updatedUser = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: req.body.name || user.name,
        email: 'douglas@mail.com',
        password: req.body.password || user.password,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        role: 0
      }

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
    });

    // Phone
    // Case where invalid phone number which does not start with 6,8,9 is used for updating the profile
    it('should not allow the user to update the profile with a number that does not start with 6,8 or 9', async () => {
      req.body.phone = "12345678";

      await updateProfileController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send.mock.lastCall[0].message).toBe("The phone number must start with 6,8 or 9 and be 8 digits long");
    });


    // Case where empty phone number is used for updating the profile (Should allow for updating by using the previous phone number)
    it('should allow the user to update the profile with empty phone number', async () => {
      req.body.phone = "";

      updatedUser = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: req.body.name || user.name,
        email: 'douglas@mail.com',
        password: req.body.password || user.password,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        role: 0
      }

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
    });
    
    // Address
    // Case where invalid address with more than 150 characters is used for updating the profile
    it('should not allow the user to update the profile with a address that is 151 characters long', async () => {
      req.body.address = "This is an extremely long long address with more than one hundred and fifty characters and this should not be allowed when trying to update the profile";

      await updateProfileController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send.mock.lastCall[0].message).toBe("The address can only be up to 150 characters long");
    });


    // Case where empty address is used for updating the profile (Should allow for updating by using the previous address)
    it('should allow the user to update the profile with empty address', async () => {
      req.body.address = "";

      updatedUser = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: req.body.name || user.name,
        email: 'douglas@mail.com',
        password: req.body.password || user.password,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        role: 0
      }

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
    });

    // Add pairwise testing cases
    /* Pairwise Combination 1
      Name: Valid
      Pasword: Valid
      Phone: Non-empty invalid
      Address: Empty
    */
    it('should not allow the user to update their profile when valid name, valid password, non-empty invalid phone number and empty address is passed as input', async () => {
      req.body.phone = "22345678";
      req.body.address = "";

      await updateProfileController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send.mock.lastCall[0].message).toBe("The phone number must start with 6,8 or 9 and be 8 digits long");
    });

    /* Pairwise Combination 2
      Name: Valid
      Password: Empty
      Phone: Valid
      Address: Non-empty invalid
    */
    it('should not allow the user to update their profile when valid name, empty passowrd, valid phone number and non-empty invalid address is passed in as input', async () => {
    req.body.password = "";
    req.body.address = "This is an extremely long long address with more than one hundred and fifty characters and this should not be allowed when trying to update the profile";

    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send.mock.lastCall[0].message).toBe("The address can only be up to 150 characters long");
    });

   /* Pairwise Combination 3 
    Name: Valid
    Password: Non-empty Invalid
    Phone: Empty
    Address: Valid
   */
    it('should not allow the user to update their profile when valid name, non-empty invalid password, empty phone number and valid address is passed in as input', async () => {
      req.body.password = "5char";
      req.body.phone = "";

      await updateProfileController(req, res);
      expect(res.json.mock.lastCall[0].error).toBe("Passsword is required and 6 character long");
    });

});