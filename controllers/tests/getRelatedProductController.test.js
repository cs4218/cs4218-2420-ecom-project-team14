import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { relatedProductController } from "../productController.js";
import { ObjectId } from "mongodb";

jest.mock("../../models/productModel");
describe("Get Related Product Controller tests", () => {
  let res, req, mockFindRelatedProducts;

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

  beforeEach(() => {
    jest.clearAllMocks();

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockFindRelatedProducts = {
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  /**
   * Pairwise testing
   * Related products controller takes in 2 inputs, pid and cid.
   * Each input has 3 equivalence classes,
   * where a cid or pid can be of:
   *
   * 1. Valid form and exists in DB
   * 2. Valid form but does not exist in DB
   * 3. Invalid form (naturally will not exist)
   *
   * There are a total of 9 pairwise tests below to cover all pairs
   */

  // Pairwise test 1: valid and existent cid, valid but non-existent pid
  it("Should fetch related products successfully when valid & existent cid and valid & non-existent pid", async () => {
    req = {
      params: {
        pid: "9379452f970cbbd38ac79478",
        cid: "bc7f29ed898fefd6a5f713fd",
      },
    };
    productModel.find = jest.fn().mockReturnValue(mockFindRelatedProducts);

    await relatedProductController(req, res);

    // Assertions
    expect(productModel.find).toHaveBeenCalledWith({
      category: "bc7f29ed898fefd6a5f713fd",
      _id: { $ne: "9379452f970cbbd38ac79478" },
    });
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  // Pairwise test 2:  valid and existent cid, valid and existent pid
  it("Should fetch related products successfully when valid & existent cid and valid & existent pid", async () => {
    req = {
      params: {
        pid: "242ddde9effa794b93f20688", // same pid as second product in mockProducts
        cid: "bc7f29ed898fefd6a5f713fd",
      },
    };

    mockFindRelatedProducts.populate = jest
      .fn()
      .mockResolvedValue(mockProducts.slice(0, 1)); // exclude second product in mockProducts
    productModel.find = jest.fn().mockReturnValue(mockFindRelatedProducts);

    await relatedProductController(req, res);

    // Assertions
    expect(productModel.find).toHaveBeenCalledWith({
      category: "bc7f29ed898fefd6a5f713fd",
      _id: { $ne: "242ddde9effa794b93f20688" },
    });
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      products: mockProducts.slice(0, 1),
    });
  });

  // Pairwise test 3: valid but non-existent cid, valid and existent pid
  it("Should return an empty array when valid & non-existent cid, valid & existent pid", async () => {
    req = {
      params: {
        pid: "242ddde9effa794b93f20688",
        cid: "6d619356ed85340ea427b6cc", // Non-existent category
      },
    };
    const mockFindNonExistentCategory = {
      ...mockFindRelatedProducts,
      populate: jest.fn().mockResolvedValue([]),
    };

    productModel.find = jest.fn().mockReturnValue(mockFindNonExistentCategory);

    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "6d619356ed85340ea427b6cc",
      _id: { $ne: "242ddde9effa794b93f20688" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: [],
    });
  });

  // Pairwise test 4: valid and existent cid, invalid pid
  it("Should return error response when valid and existent cid, invalid pid (null)", async () => {
    req = { params: { cid: "bc7f29ed898fefd6a5f713fd" } };

    await relatedProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Pid and Cid must be in a valid format",
    });
  });

  // Pairwise test 5: invalid cid, valid and existent pid
  it("Should return error response when invalid cid, valid & existent pid", async () => {
    req = { params: { cid: "abc", pid: "242ddde9effa794b93f20688" } }; // cid is invalid as it doesn't conform to correct form

    await relatedProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Pid and Cid must be in a valid format",
    });
  });

  // Pairwise test 6 valid but non-existent cid, valid but non-existent pid
  it("Should return an empty array when valid & non-existent cid, valid & non-existent pid", async () => {
    req = {
      params: {
        pid: "14155289517d158088a0e52c", // Non-existent product
        cid: "43e63da2506585e3b8768181", // Non-existent category
      },
    };
    const mockFindNonExistent = {
      ...mockFindRelatedProducts,
      populate: jest.fn().mockResolvedValue([]),
    };

    productModel.find = jest.fn().mockReturnValue(mockFindNonExistent);

    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "43e63da2506585e3b8768181",
      _id: { $ne: "14155289517d158088a0e52c" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: [],
    });
  });

  // Pairwise test 7: invalid cid, valid but non-existent pid
  it("Should return error response when invalid cid, valid & non-existent pid", async () => {
    req = { params: { pid: "14155289517d158088a0e52cs" } }; // cid is invalid as it is null

    await relatedProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Pid and Cid must be in a valid format",
    });
  });

  // Pairwise test 8: valid but non-existent cid, invalid pid
  it("Should return error response when valid & non-existent cid, invalid pid", async () => {
    req = { params: { cid: "43e63da2506585e3b8768181", pid: "123" } }; // pid is invalid as it doesn't conform to Mongo ObjectId form

    await relatedProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Pid and Cid must be in a valid format",
    });
  });

  // Pairwise test 9: invalid cid, invalid pid
  it("Should return error response when invalid cid and invalid pid", async () => {
    req = { params: {} }; // both cid and pid are invalid as they are both null

    await relatedProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Pid and Cid must be in a valid format",
    });
  });

  it("Should return error response when there is error fetching related products", async () => {
    req = {
      params: {
        pid: "9379452f970cbbd38ac79478",
        cid: "bc7f29ed898fefd6a5f713fd",
      },
    };
    const mockFindError = {
      ...mockFindRelatedProducts,
      populate: jest.fn().mockImplementation(() => {
        throw new Error("some error");
      }),
    };

    productModel.find = jest.fn().mockReturnValue(mockFindError);

    await relatedProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "error while geting related product",
      error: new Error("some error"),
    });
  });
});
