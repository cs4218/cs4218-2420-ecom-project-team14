import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { productFiltersController } from "../productController.js";
import { ObjectId } from "mongodb";

jest.mock("../../models/productModel");
describe("Product Filters Controller tests", () => {
  let res, req;

  const mockProducts = [
    {
      _id: new ObjectId("51f45420a784984f2942e609"),
      name: "Toy Giraffe",
      slug: "Toy-Giraffe",
      description: "Some toy giraffe",
      price: 10,
      category: new ObjectId("bc7f29ed898fefd6a5f713fd"),
      quantity: 12,
      createdAt: "2025-02-02T10:19:37.524Z",
      updatedAt: "2025-02-13T08:11:52.724Z",
      __v: 0,
    },
    {
      _id: new ObjectId("242ddde9effa794b93f20688"),
      name: "Toy cars",
      slug: "Toy-cars",
      description: "some toy cars",
      price: 15,
      category: new ObjectId("bc7f29ed898fefd6a5f713fd"),
      quantity: 1,
      createdAt: "2025-02-02T10:19:37.524Z",
      updatedAt: "2025-02-13T08:11:52.724Z",
      __v: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    productModel.find = jest.fn().mockResolvedValue(mockProducts);
  });

  beforeAll(() => {
    jest.resetModules();
  });

  describe("General functional test cases", () => {
    it("Should get filtered products successfully when valid input for both checked and radio", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"],
          radio: [10, 20],
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(productModel.find).toHaveBeenCalledWith({
        category: ["bc7f29ed898fefd6a5f713fd"],
        price: { $gte: 10, $lte: 20 },
      });
      expect(res.status).toBeCalledWith(200);
      expect(res.send).toBeCalledWith({
        success: true,
        products: mockProducts,
      });
    });
    it("Should return a 400 error when valid input for checked but invalid input for radio", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"],
          radio: ["print", "helloworld"], // invalid input as radio elements must be numbers
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'radio' must an empty array or an array with two numbers",
      });
    });

    it("Should return a 400 error when invalid input for checked but valid input for radio", async () => {
      req = {
        body: {
          checked: ["12345"], // invalid input as checked elements must correspond to Mongoose ObjectId type format
          radio: [10, 20],
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'checked' must be an array with valid category ids",
      });
    });

    it("Should return a 400 error when invalid input for both checked and radio", async () => {
      req = {
        body: {
          checked: null, // invalid as checked should not be null
          radio: ["hello", "world"], // invalid input as radio elements must be numbers
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'checked' must be an array with valid category ids",
      });
    });

    it("Should return 400 error when there is an error in fetching filtered products", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"], // valid
          radio: [10, 20], // valid
        },
      };
      productModel.find = jest.fn().mockImplementation(() => {
        throw new Error("some error");
      });

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "Error WHile Filtering Products",
        error: new Error("some error"),
      });
    });
  });

  /**
   * Equivalence classes for the 2 given inputs:
   *
   * For "checked":
   * 1. null (tested above)
   * 2. empty array
   * 3. non-array type
   * 4. array with all valid category ids (tested above)
   * 5. array with not all valid category ids (tested above)
   *
   * For "radio":
   * 1. null
   * 2. empty array
   * 3. non-array type
   * 4. array with length != 2 and length != 0
   * 5. array where elements are numbers (tested above)
   * 6. array where not all elements are numbers (tested above)
   *
   *
   * The remaining 6 test cases not tested in previous testcases (under general functional testcases)
   * will be enumerated below
   */
  describe("Specific equivalence class testing", () => {
    // test when checked is an empty array (valid input)
    it("Should get filtered products when checked is an empty array (valid input)", async () => {
      req = {
        body: {
          checked: [], // valid
          radio: [10, 20], // valid
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(productModel.find).toHaveBeenCalledWith({
        price: { $gte: 10, $lte: 20 },
      });
      expect(res.status).toBeCalledWith(200);
      expect(res.send).toBeCalledWith({
        success: true,
        products: mockProducts,
      });
    });

    // test when checked is a non-array type (invalid input)
    it("Should return 400 error when checked is non-array type (invalid input)", async () => {
      req = {
        body: {
          checked: {}, // invalid as it must be array type
          radio: [10, 20], // valid
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'checked' must be an array with valid category ids",
      });
    });

    // test when radio is null (invalid input)
    it("Should return 400 error when radio is null (invalid input)", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"], //valid
          // radio is null
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'radio' must an empty array or an array with two numbers",
      });
    });

    // test when radio is non-array type (invalid input)
    it("Should return 400 error when radio is non-array type (invalid input)", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"], // valid
          radio: {}, // invalid as it must be array type
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'radio' must an empty array or an array with two numbers",
      });
    });

    // test when radio is an empty array (valid input)
    it("Should get filtered products when radio is an empty array (valid input)", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"], // valid
          radio: [], // valid
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(productModel.find).toHaveBeenCalledWith({
        category: ["bc7f29ed898fefd6a5f713fd"],
      });
      expect(res.status).toBeCalledWith(200);
      expect(res.send).toBeCalledWith({
        success: true,
        products: mockProducts,
      });
    });

    // test when radio is an array with length != 2 and length != 0 (invalid)
    it("Should return 400 error when radio is an array with length != 2 and length != 0", async () => {
      req = {
        body: {
          checked: ["bc7f29ed898fefd6a5f713fd"], // valid
          radio: [10], // invalid as it must be array type
        },
      };

      await productFiltersController(req, res);

      // Assertions
      expect(res.status).toBeCalledWith(400);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "'radio' must an empty array or an array with two numbers",
      });
    });
  });
});
