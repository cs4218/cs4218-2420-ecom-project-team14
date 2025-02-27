import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import categoryModel from "../../models/categoryModel.js";
import { productCategoryController } from "../productController.js";
import { ObjectId } from "mongodb";

jest.mock("../../models/productModel");
jest.mock("../../models/categoryModel");
describe("Get Product Category Controller tests", () => {
  let res, req;

  const mockProducts = [
    {
      _id: new ObjectId("51f45420a784984f2942e609"),
      name: "Toy Giraffe",
      slug: "Toy-Giraffe",
      description: "Some toy giraffe",
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
      _id: new ObjectId("242ddde9effa794b93f20688"),
      name: "Toy cars",
      slug: "Toy-cars",
      description: "some toy cars",
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

  const mockCategory = {
    _id: new ObjectId("bc7f29ed898fefd6a5f713fd"),
    name: "Toys",
    slug: "toys",
    __v: 0,
  };

  const mockCategoryWithNoAssociatedProducts = {
    _id: new ObjectId("90f3ca8f5a4724ed893ab264"),
    name: "Shoes",
    slug: "shoes",
    __v: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  it("Should return a non-empty product array when a valid category slug exists and products are associated with it", async () => {
    req = { params: { slug: "toys" } };

    categoryModel.findOne = jest.fn().mockReturnValue(mockCategory);
    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue(mockProducts),
    });

    await productCategoryController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      category: mockCategory,
      products: mockProducts,
    });
  });

  it("Should return a 400 error response when category slug is invalid ", async () => {
    req = { params: {} }; // category slug is null

    await productCategoryController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid category slug provided",
    });
  });

  it("Should return a 404 error response when category slug is valid but does not exist", async () => {
    req = { params: { slug: "toys" } };

    categoryModel.findOne = jest.fn().mockReturnValue(null);

    await productCategoryController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Category not found",
    });
  });

  it("Should return a empty product array when a valid category slug exists but no products are associated with it", async () => {
    req = { params: { slug: "shoes" } };

    categoryModel.findOne = jest
      .fn()
      .mockReturnValue(mockCategoryWithNoAssociatedProducts);
    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue([]),
    });

    await productCategoryController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      category: mockCategoryWithNoAssociatedProducts,
      products: [],
    });
  });

  it("Should return 400 error response when there is error fetching categories", async () => {
    req = { params: { slug: "toys" } };

    categoryModel.findOne = jest.fn().mockImplementation(() => {
      throw new Error("some error");
    });

    await productCategoryController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      error: new Error("some error"),
      message: "Error While Getting products",
    });
  });
});
