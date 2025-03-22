import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

const testPassword = "testPassword";

const testAdmin = {
  _id: new ObjectId("67dee66d9e3e63ab7ad4b27f"),
  name: "test admin",
  email: "testadmin@mail.com",
  phone: "81234567",
  address: "123 Fake Street",
  password: testPassword,
  answer: "Basketball",
  role: 1,
};

const testUser = {
  _id: new ObjectId("67ded40f06b328cc295117bd"),
  name: "test user",
  email: "testuser@mail.com",
  phone: "81234567",
  address: "123 Fake Street",
  password: testPassword,
  answer: "Basketball",
};

const testCategory = {
  _id: new ObjectId("67ded4dd7ad06592dc97a763"),
  name: "test category",
  slug: "test-category",
};

const testProduct1 = {
  _id: new ObjectId("67ded57c282d8af763590d9a"),
  name: "Test Product 1",
  slug: "test-product-1",
  description: "Test Product 1 Description",
  quantity: 10,
  shipping: true,
  category: testCategory._id,
  price: 1,
};

const testProduct2 = {
  _id: new ObjectId("67deda6fe90bda948e15487c"),
  name: "Test Product 2",
  slug: "test-product-2",
  description: "Test Product 2 Description",
  quantity: 20,
  shipping: true,
  category: testCategory._id,
  price: 2,
};

export {
    testAdmin,
    testCategory,
    testPassword,
    testProduct1,
    testProduct2,
    testUser
};

