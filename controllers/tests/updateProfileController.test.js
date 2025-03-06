import { expect, jest } from "@jest/globals";
import { updateProfileController } from "../authController";
import userModel from "../../models/userModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/userModel");

describe("Update Profile Controller Tests", () => {
    let req, res, user, updatedUser;

    const updateUser = () => {
      updatedUser = {
        _id: new ObjectId("679f3c5eb35bb2db5e6a3646"),
        name: req.body.name || user.name,
        email: 'douglas@mail.com',
        password: (req.body.password ? '$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa' : undefined) || user.password,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        role: 0
      }
    }

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            body: {
              name: "Douglas Lim",
              password: "Exact6",
              phone: "90183289",
              address: "This is a very long address which is highly improbable but not impossible and I need to type a lot more words to hit one hundred and fifty characters."
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

    // Test 1 (Non-empty valid name, Non-empty valid password, Non-empty valid phone, Non-empty valid address)
    // Success case where the user is able to update the profile successfully with all non-empty, valid fields
    // This test also covers the case for lower boundary for the BVA for password (6 characters)
    // This test also covers the case for upper boundary for the BVA for address (150 characters)
    // This also covers the pairwise testing combination 1 (Non-empty valid name, Non-empty valid password, Non-empty valid phone, Non-empty valid address)
    it("should allow the user to update the profile successfully", async () => {
      updateUser();
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Check that the message shows that the profile is updated successfully
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
      // Check that the values passed into res.send is correct
      expect(res.send.mock.lastCall[0].updatedUser.name).toBe('Douglas Lim');
      expect(res.send.mock.lastCall[0].updatedUser.password).toBe('$2b$10$u/a/pMmAY0Iezeuna3W1OOiggduh3sEla8jhXvg0hUDW6vBIeTeWa');
      expect(res.send.mock.lastCall[0].updatedUser.phone).toBe('90183289');
      expect(res.send.mock.lastCall[0].updatedUser.address).toBe("This is a very long address which is highly improbable but not impossible and I need to type a lot more words to hit one hundred and fifty characters.");
    });

    // Password (Equivalence Partitioning) (There are 3 equivalence classes: Empty password, Non-empty invalid password, Non-empty valid password)
    // Non-empty valid password is already covered in Test 1
    // Test 2 (Non-empty invalid Password): Case where invalid password with length less than 6 is used for updating the profile
    // This test also covers the case for just below lower boundary for BVA for password (5 characters) 
    it('should not allow the user to update the profile with a password of length 5', async () => {
      req.body.password = "SHORT";
      await updateProfileController(req, res);
      
      // Check that the message shows that the password needs to be at least 6 characters long
      expect(res.json.mock.lastCall[0].error).toBe("Passsword is required and 6 character long");
    });

    // Test 3 (Empty Password): Case where empty password is used for updating the profile (Should allow for updating by using the previous password)
    it('should allow the user to update the profile with empty password', async () => {
      req.body.password = "";

      updateUser();

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Check that the message shows that the profile is updated successfully
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
      // Check that the user's previous password is used
      expect(res.send.mock.lastCall[0].updatedUser.password).toBe(user.password);
    });

    // Name (Equivalence Partitioning) (There are 3 equivalence classes: Empty name, Non-empty invalid name, Non-empty valid name)
    // Non-empty valid name is already covered in Test 1
    // Test 4 (Non-empty invalid name): Case where invalid name with length more than 150 characters is used for updating the profile
    it('should not allow the user to update the profile with a name that is of length 151', async () => {
      req.body.name = "John William Samuel Douglas Russell Wallace Brandon Blaine James Joseph Johnson Monrole Jefferson Theodore Timothy Reece Franklin Charles Watson Holmes";
      
      await updateProfileController(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      // Check that the message shows that the name can only be up to 150 characters long 
      expect(res.send.mock.lastCall[0].message).toBe("The name can only be up to 150 characters long");
    });

    // Test 5 (Empty name): Case where empty name is used for updating the profile (Should allow for updating by using the previous name)
    it('should allow the user to update the profile with empty name', async () => {
      req.body.name = "";

      updateUser();

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Check that the message shows that profile can be updated successfully
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
      // Check that the user's previous name is used
      expect(res.send.mock.lastCall[0].updatedUser.name).toBe(user.name);
    });

    // Phone (Equivalence Partitioning) (There are 3 equivalence classes: Empty phone, Non-empty invalid phone, Non-empty valid phone)
    // Non-empty valid phone is already covered in Test 1
    // Test 6 (Non-empty invalid phone): Case where invalid phone number which does not start with 6,8,9 is used for updating the profile
    it('should not allow the user to update the profile with a number that does not start with 6,8 or 9', async () => {
      req.body.phone = "12345678";

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      // Check that the message shows that the phone number must start with 6,8 or 9 and be 8 digits long
      expect(res.send.mock.lastCall[0].message).toBe("The phone number must start with 6,8 or 9 and be 8 digits long");
    });


    // Test 7 (Empty phone): Case where empty phone number is used for updating the profile (Should allow for updating by using the previous phone number)
    it('should allow the user to update the profile with empty phone number', async () => {
      req.body.phone = "";

      updateUser();

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Check that the message shows the profile is updated successfully
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
      // Check that the user's previous phone is used
      expect(res.send.mock.lastCall[0].updatedUser.phone).toBe(user.phone);
    });
    
    // Address (Equivalence Partitioning) (There are 3 equivalence classes: Empty address, Non-empty invalid address, Non-empty valid address)
    // Non-empty valid address is already covered in Test 1
    // Test 8 (Non-empty invalid address): Case where invalid address with more than 150 characters is used for updating the profile
    // This test also covers the case for just above upper boundary for BVA for address (151 characters)
    it('should not allow the user to update the profile with a address that is 151 characters long', async () => {
      req.body.address = "This is an extremely long long address with more than one hundred and fifty characters and this should not be allowed when trying to update the profile";

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message shows that address can only be up to 150 characters long
      expect(res.send.mock.lastCall[0].message).toBe("The address can only be up to 150 characters long");
    });


    // Test 9 (Empty address): Case where empty address is used for updating the profile (Should allow for updating by using the previous address)
    it('should allow the user to update the profile with empty address', async () => {
      req.body.address = "";

      updateUser();

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Check that message shows that profile is updated successfully
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
      // Check that the user's previous address is used
      expect(res.send.mock.lastCall[0].updatedUser.address).toBe(user.address);
    });

    // Some pairwise testing cases
    /* Pairwise Combination 2 (Test 10)
      Name: Non-empty valid
      Pasword: Empty
      Phone: Empty
      Address: Empty
    */
    it('should allow the user to update their profile when non-empty valid name, empty password, empty phone number and empty address is passed as input', async () => {
      req.body.password = "";
      req.body.phone = "";
      req.body.address = "";

      updateUser();

      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      await updateProfileController(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      // Check that the message shows that the profile is updated successfully
      expect(res.send.mock.lastCall[0].message).toBe("Profile Updated Successfully");
      // Check that the user's previous password is used
      expect(res.send.mock.lastCall[0].updatedUser.password).toBe(user.password);
      // Check that the user's previous phone is used
      expect(res.send.mock.lastCall[0].updatedUser.phone).toBe(user.phone);
      // Check that the user's previous address is used
      expect(res.send.mock.lastCall[0].updatedUser.address).toBe(user.address);
    });

    /* Pairwise Combination 2 (Test 11)
      Name: Non-empty valid
      Password: Non-empty invalid
      Phone: Non-empty invalid
      Address: Non-empty invalid
    */
    it('should not allow the user to update their profile when Non-empty Valid name, Non-empty Invalid password, Non-empty Invalid phone number and Non-empty Invalid address is passed in as input', async () => {
    req.body.password = "5char";
    req.body.phone = "12873822";
    req.body.address = "This is an extremely long long address with more than one hundred and fifty characters and this should not be allowed when trying to update the profile";

    await updateProfileController(req, res);

    // Check that the message shows that the password needs to be at least 6 characters long
    expect(res.json.mock.lastCall[0].error).toBe("Passsword is required and 6 character long");
    });

   /* Pairwise Combination 3 (Test 12)
    Name: Empty
    Password: Empty 
    Phone: Non-empty invalid
    Address: Non-empty valid
   */
    it('should not allow the user to update their profile when empty name, empty password,  Non-empty Invalid phone number and Non-empty Valid address is passed in as input', async () => {
      req.body.name = "";
      req.body.password = "";
      req.body.phone = "12873822";

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      // Check that the message shows that the phone number must start with 6,8 or 9 and be 8 digits long
      expect(res.send.mock.lastCall[0].message).toBe("The phone number must start with 6,8 or 9 and be 8 digits long");
    });

    /* Pairwise Combination 4 (Test 13)
      Name: Empty
      Password: Non-empty invalid
      Phone: Non-empty valid
      Address: Empty
    */
    it('should not allow the user to update their profile when empty name, Non-empty Invalid password, Non-empty Valid phone number and empty address is passed as input', async () => {
      req.body.name = "";
      req.body.password = "5char";
      req.body.address = "";

      await updateProfileController(req, res);
      
      // Check that the message shows that the password needs to be at least 6 characters long
      expect(res.json.mock.lastCall[0].error).toBe("Passsword is required and 6 character long");
    });

    /* Pairwise Combination 5 (Test 14)
      Name: Empty
      Password: Non-empty Valid
      Phone: Empty
      Address: Non-empty Invalid
    */
    it('should not allow the user to update their profile when Non-empty Invalid name, Non-empty Valid password, empty phone and Non-empty Invalid address is passed as input', async () => {
      req.body.name = "";
      req.body.phone = "";
      req.body.address = "This is an extremely long long address with more than one hundred and fifty characters and this should not be allowed when trying to update the profile";


      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      // Check that message shows that address can only be up to 150 characters long
      expect(res.send.mock.lastCall[0].message).toBe("The address can only be up to 150 characters long");
    });

});