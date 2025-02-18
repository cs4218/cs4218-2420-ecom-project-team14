import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { getSingleProductController } from "../productController.js";

jest.mock("../../models/productModel");
describe("Get Single Product Controller tests", () => {
  let res, req;

  const mockProduct = {
    _id: "123",
    name: "Toy Giraffe",
    slug: "toy-giraffe",
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    productModel.findOne = jest.fn().mockImplementation(({ slug }) => {
      return {
        select: jest.fn().mockReturnThis(),
        populate: jest
          .fn()
          .mockResolvedValue(slug === "toy-giraffe" ? mockProduct : null),
      };
    });

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  it("Should fetch a product when product exists", async () => {
    req = { params: { slug: "toy-giraffe" } };

    await getSingleProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: mockProduct,
    });
  });

  it("Should return no product when slug does not exist", async () => {
    req = { params: { slug: "toy-cat" } };

    await getSingleProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: null,
    });
  });

  it("Should return no product when no slug exists", async () => {
    req = { params: { slug: "toy-cat" } };
    const mockFindNoSlugExist = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(null),
    };

    productModel.findOne = jest.fn().mockReturnValue(mockFindNoSlugExist);

    await getSingleProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: null,
    });
  });

  it("Should return error response when there is error fetching product", async () => {
    req = { params: { slug: "toy-giraffe" } };
    const mockFindError = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockImplementation(() => {
        throw new Error("some error");
      }),
    };

    productModel.findOne = jest.fn().mockReturnValue(mockFindError);

    await getSingleProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Error while getting single product",
      error: new Error("some error"),
    });
  });
});
