import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { searchProductController } from "../productController.js";
import { ObjectId } from "mongodb";

jest.mock("../../models/productModel");
describe("Search Product Controller tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  const mockProducts = [
    {
      _id: new ObjectId("242ddde9effa794b93f20688"),
      name: "Toy Giraffe",
      slug: "Toy-Giraffe",
      description: "Some toy animal",
      price: 10,
      category: {
        _id: new ObjectId("bc7f29ed898fefd6a5f713fd"),
        name: "Toys",
        slug: "toys",
        __v: 0,
      },
      quantity: 12,
      createdAt: "2025-02-02T10:19:37.524Z",
      updatedAt: "2025-02-13T08:11:52.724Z",
      __v: 0,
    },
    {
      _id: new ObjectId("51f45420a784984f2942e609"),
      name: "Toy cars",
      slug: "Toy-cars",
      description: "some toy car" + "a".repeat(100),
      price: 15,
      category: {
        _id: new ObjectId("bc7f29ed898fefd6a5f713fd"),
        name: "Toys",
        slug: "toys",
        __v: 0,
      },
      quantity: 1,
      createdAt: "2025-02-02T10:19:37.524Z",
      updatedAt: "2025-02-13T08:11:52.724Z",
      __v: 0,
    },
  ];

  /**
   * Boundary Value Analysis test cases with the following scenarios:
   *
   * 1. Empty input
   * 2. Smallest valid input (1 character)
   * 3. Maximum valid input (100 characters)
   * 4. Just above maximum valid input (e.g 101 characters)
   *
   */
  describe("Boundary Value Analysis test cases", () => {
    it("Should return 400 error with empty keyword input", async () => {
      req = { params: { keyword: "" } }; // empty string input

      await searchProductController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        success: false,
        message: "Keyword must not be empty",
      });
    });

    it("Should fetch associated products given minimum valid input that matches product name or description", async () => {
      req = { params: { keyword: "a" } }; // minimum input of 1 character
      productModel.find = jest
        .fn()
        .mockReturnValue({ select: jest.fn().mockResolvedValue(mockProducts) });

      await searchProductController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({
        success: true,
        results: mockProducts,
      });
    });

    it("Should fetch associated products given maximum valid input that matches product name or description", async () => {
      req = { params: { keyword: "a".repeat(100) } }; // maximum input of 100 characters
      productModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([mockProducts[2]]),
      });

      await searchProductController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({
        success: true,
        results: [mockProducts[2]],
      });
    });

    it("Should return 400 error given just above maximum valid input", async () => {
      req = { params: { keyword: "a".repeat(101) } }; // just above maximum input of 100 characters

      await searchProductController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        success: false,
        message: "Keyword is too long",
      });
    });
  });

  describe("Functional test cases", () => {
    it("Should deal with input appropriately that has special characters", async () => {
      req = { params: { keyword: "(c+)+" } }; // input with special characters
      productModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await searchProductController(req, res);

      // Assertions
      expect(productModel.find).toBeCalledWith({
        $or: [
          { name: { $regex: "\\(c\\+\\)\\+", $options: "i" } },
          { description: { $regex: "\\(c\\+\\)\\+", $options: "i" } },
        ],
      });
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({
        success: true,
        results: [],
      });
    });

    it("Should fetch associated products given valid input that matches product name or description, regardless of case", async () => {
      req = { params: { keyword: "giRaFfe" } }; // input with special characters
      productModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([mockProducts[0]]),
      });

      await searchProductController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({
        success: true,
        results: [mockProducts[0]],
      });
    });

    it("Should return error response when there is error fetching associated products", async () => {
      req = { params: { keyword: "a" } };
      productModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockImplementation(() => {
          throw new Error("some error");
        }),
      });

      await searchProductController(req, res);
      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        success: false,
        message: "Error In Search Product API",
        error: new Error("some error"),
      });
    });
  });
});
