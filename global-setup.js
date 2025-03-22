// global-setup.js
import mongoose from "mongoose";
import {
  testAdmin,
  testCategory,
  testPassword,
  testProduct1,
  testProduct2,
  testUser,
} from "./global-data";
import { hashPassword } from "./helpers/authHelper";
import categoryModel from "./models/categoryModel";
import productModel from "./models/productModel";
import userModel from "./models/userModel";

export default async () => {
  console.log("Setting up test data...");

  const hashedPassword = await hashPassword(testPassword);

  await mongoose.connect(process.env.MONGO_URL);

  await categoryModel.deleteMany({ name: testCategory.name });
  await productModel.deleteMany({ name: testProduct1.name });
  await productModel.deleteMany({ name: testProduct2.name });
  await userModel.deleteMany({ name: testUser.name });
  await userModel.deleteMany({ name: testAdmin.name });

  await categoryModel(testCategory).save();
  await productModel(testProduct1).save();
  await productModel(testProduct2).save();
  await userModel({ ...testUser, password: hashedPassword }).save();
  await userModel({ ...testAdmin, password: hashedPassword }).save();

  console.log("Test data setup complete.");
};
