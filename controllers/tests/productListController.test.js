import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { productListController } from "../productController.js";
import { PER_PAGE_LIMIT } from "../constants/productConstants.js";

jest.mock("../../models/productModel");
describe("Product List Controller tests", () => {
  let mockProducts;
  let mockFindProductListSuccess;
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    // An array of (PER_PAGE_LIMIT + 2) products is generated
    mockProducts = Array.from({ length: PER_PAGE_LIMIT + 2 }, (_, index) => ({
      _id: index.toString(),
      name: `Toy ${index}`,
      slug: `Toy-${index}`,
      description: `Toy description ${index}`,
      price: 10 + index,
      category: {
        _id: "456",
        name: "Toys",
        slug: "toys",
        __v: 0,
      },
      quantity: 10,
      createdAt: "2025-02-02T10:19:37.524Z",
      updatedAt: "2025-02-13T08:11:52.724Z",
      __v: 0,
    }));

    mockFindProductListSuccess = {
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts.slice(0, PER_PAGE_LIMIT)),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  it("Should return paginated product list when page is 1", async () => {
    req = { params: { page: "1" } };
    productModel.find = jest.fn().mockReturnValue(mockFindProductListSuccess);
    console.log(mockFindProductListSuccess);

    await productListController(req, res);

    // Assertions
    expect(mockFindProductListSuccess.skip).toBeCalledWith(0);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      products: mockProducts.slice(0, PER_PAGE_LIMIT),
    });
  });

  it("Should return paginated product list when page is 2", async () => {
    req = { params: { page: "2" } };
    mockFindProductListSuccess.sort = jest
      .fn()
      .mockReturnValue(mockProducts.slice(PER_PAGE_LIMIT));
    productModel.find = jest.fn().mockReturnValue(mockFindProductListSuccess);

    await productListController(req, res);

    // Assertions
    expect(mockFindProductListSuccess.skip).toBeCalledWith(PER_PAGE_LIMIT);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      products: mockProducts.slice(PER_PAGE_LIMIT),
    });
  });

  // Added equivalence class tests
  it("Should return error response when page requested is 0", async () => {
    req = { params: { page: "0" } };

    await productListController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid page number. Page must be positive integer",
    });
  });

  // Added equivalence class tests
  it("Should return error response when page requested is -1", async () => {
    req = { params: { page: "-1" } };

    await productListController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid page number. Page must be positive integer",
    });
  });

  // Added equivalence class tests
  it("Should return error response when page requested is null", async () => {
    req = { params: {} };

    await productListController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid page number. Page must be positive integer",
    });
  });

  // Added equivalence class tests
  it("Should return error response when page requested is non-numeric", async () => {
    req = { params: { page: "hello" } };

    await productListController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid page number. Page must be positive integer",
    });
  });

  it("Should return error response when there is error fetching product list", async () => {
    req = { params: { page: "2" } };
    const mockFindError = {
      ...mockFindProductListSuccess,
      sort: jest.fn().mockImplementation(() => {
        throw new Error("some error");
      }),
    };
    productModel.find = jest.fn().mockReturnValue(mockFindError);

    await productListController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "error in per page ctrl",
      error: new Error("some error"),
    });
  });
});
