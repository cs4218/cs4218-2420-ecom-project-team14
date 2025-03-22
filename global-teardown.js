// global-teardown.js
import mongoose from "mongoose";
import {
  testAdmin,
  testCategory,
  testProduct1,
  testProduct2,
  testUser,
} from "./global-data";
import categoryModel from "./models/categoryModel";
import productModel from "./models/productModel";
import userModel from "./models/userModel";

export default async () => {
  console.log("Cleaning up test data...");

  await mongoose.connect(process.env.MONGO_URL);
  await categoryModel.deleteMany({ name: testCategory.name });
  await productModel.deleteMany({ name: testProduct1.name });
  await productModel.deleteMany({ name: testProduct2.name });
  await userModel.deleteMany({ name: testUser.name });
  await userModel.deleteMany({ name: testAdmin.name });
  await mongoose.disconnect();

  console.log("Test data cleanup complete.");
};
