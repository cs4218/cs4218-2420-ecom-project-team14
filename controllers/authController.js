import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is Required" });
    }

    // Add validation for name (Maximum 150 characters long)
    if (name.length > 150) {
      return res.status(400).send({ message: "The name can only be up to 150 characters long"});
    }

    // Add validation for password length (Need to be minimum of length 6)
    if (password.length < 6) {
      return res.status(400).send({ message: "The length of the password should be at least 6 characters long"});
    }

    // Add validation for email check 
    /* Conditions which are added are as follows:
    Local part
    1) Cannot start with dot
    2) Cannot have consecutive dots
    3) Cannot end with dot
    4) Restrict characters to alphanumeric and dot
    5) Maximally is 64 characters long
    
    Domain part
    1) Cannot start with dot
    2) Cannot have consecutive dots
    3) Cannot end with dot
    4) Restrict characters to alphanumeric and dot
    5) Maximally is 64 characters long
    
    */
    const emailRegex = /^(?!^\.)(?!.*\.@)(?!.*\.{2})[a-zA-Z0-9.]{1,64}@(?!@\.)(?!.*\.$)(?!.*\.{2})[a-zA-Z0-9.]{1,64}$/;    
    if (!email.match(emailRegex)) {
      return res.status(400).send({ message: "The email is in an invalid format"});
    }

    // Add validation for phone number
    const phoneRegex = /^[689]\d{7}$/;
    if (!phone.match(phoneRegex)) {
      return res.status(400).send({ message: "The phone number must start with 6,8 or 9 and be 8 digits long"});
    }

    // Add validation for address
    if (address.length > 150) {
      return res.status(400).send({ message: "The address can only be up to 150 characters long"});
    }

    // Add validation for answer
    if (answer.length > 100) {
      return res.status(400).send({ message: "The answer can only be up to 100 characters long"});
    }

    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      // Changed error message to have same generic error message as below
      return res.status(400).send({
        success: false,
        message: "Invalid email or password has been entered or email is not registered",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      // Change error message as it should not reveal that email is not registered (Should just give generic message)
      return res.status(400).send({
        success: false,
        message: "Invalid email or password has been entered or email is not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      // Change http status code to 400 instead of 200 which is for successful response case
      // Change error message as it should not reveal whether email is wrong or password is wrong (Security Reasons)
      return res.status(400).send({
        success: false,
        message: "Invalid email or password has been entered or email is not registered",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "An answer is required" });
    }
    if (!newPassword) {
      return res.status(400).send({ message: "New Password is required" });
    }
    
    // Add validation for new password length (Need to be minimum of length 6)
    if (newPassword.length < 6) {
      return res.status(400).send({ message: "The length of the new password should be at least 6 characters long"});
    }

    // Add validation for email being used
    const emailRegex = /^(?!^\.)(?!.*\.@)(?!.*\.{2})[a-zA-Z0-9.]{1,64}@(?!@\.)(?!.*\.$)(?!.*\.{2})[a-zA-Z0-9.]{1,64}$/;    
    if (!email.match(emailRegex)) {
      return res.status(400).send({ message: "The email is in an invalid format"});
    }

    // Add validation for answer
    if (answer.length > 100) {
      return res.status(400).send({ message: "The answer can only be up to 100 characters long"});
    }

    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }

    // Add validation for non-empty name (Maximum 150 characters long)
    if (name && name.length > 150) {
      return res.status(400).send({ message: "The name can only be up to 150 characters long"});
    }

    // Add validation for non-empty phone number
    const phoneRegex = /^[689]\d{7}$/;
    if (phone && !phone.match(phoneRegex)) {
      return res.status(400).send({ message: "The phone number must start with 6,8 or 9 and be 8 digits long"});
    }

    // Add validation for non-empty address
    if (address && address.length > 150) {
      return res.status(400).send({ message: "The address can only be up to 150 characters long"});
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    // Made minor change to error status code to be 500 since 400 is more for bad request rather than for error
    res.status(500).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Add validation for the type of order status (Need to check if it's one of the enums)
    if (!(orderModel.schema.paths.status.enumValues.includes(status))) {
      return res.status(400).send({
        message: "Invalid order status is provided"
      })
    }

    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!orders) {
      return res.status(400).send({
        message: "Invalid order id was provided and order cannot be found"
      })
    }
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};