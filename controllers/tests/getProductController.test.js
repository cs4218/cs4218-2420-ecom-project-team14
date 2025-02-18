import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { getProductController } from "../productController.js";
import { PRODUCT_LIMIT } from "../constants/productConstants.js";

jest.mock("../../models/productModel");
describe("Get Product Controller tests", () => {
  let mockFindSuccess;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindSuccess = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  const mockProducts = [
    {
      _id: "123",
      name: "Toy Giraffe",
      slug: "Toy-Giraffe",
      description: "Some toy giraffe",
      price: 10,
      category: {
        _id: "456",
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
      _id: "234",
      name: "Toy cars",
      slug: "Toy-cars",
      description: "some toy cars",
      price: 15,
      category: {
        _id: "456",
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

  it("Should fetch products successfully", async () => {
    productModel.find = jest.fn().mockReturnValue(mockFindSuccess);

    await getProductController({}, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      counTotal: 2,
      message: "AllProducts",
      products: mockProducts,
    });
  });

  it("Should fetch products successfully when there are 0 products", async () => {
    mockFindSuccess.sort.mockResolvedValue([]);
    productModel.find = jest.fn().mockReturnValue(mockFindSuccess);

    await getProductController({}, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      counTotal: 0,
      message: "AllProducts",
      products: [],
    });
  });

  it("Should fetch no more products than the maximum product limit", async () => {
    const mockProductsExceedLimit = Array.from(
      { length: PRODUCT_LIMIT + 2 },
      (_, index) => ({
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
      })
    );

    mockFindSuccess = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockImplementation((limit) => ({
        ...mockFindSuccess,
        sort: jest
          .fn()
          .mockResolvedValue(mockProductsExceedLimit.slice(0, limit)),
      })),
      sort: jest.fn().mockResolvedValue(mockProductsExceedLimit),
    };

    productModel.find = jest.fn().mockReturnValue(mockFindSuccess);

    await getProductController({}, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      counTotal: 12,
      message: "AllProducts",
      products: mockProductsExceedLimit.slice(0, PRODUCT_LIMIT),
    });
  });

  it("Should return error response when there is error fetching products", async () => {
    const mockFindError = {
      ...mockFindSuccess,
      sort: jest.fn().mockImplementation(() => {
        throw new Error("some error");
      }),
    };

    productModel.find = jest.fn().mockReturnValue(mockFindError);

    await getProductController({}, res);

    // Assertions
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Error in getting products",
      error: "some error",
    });
  });
});
