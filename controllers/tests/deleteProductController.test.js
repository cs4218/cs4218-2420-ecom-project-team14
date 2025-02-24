import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { deleteProductController } from "../productController.js";
import { ObjectId } from "mongodb";

jest.mock("../../models/productModel");

describe("Delete Product Controller tests", () => {
  let res, req;

  const mockProduct = {
    _id: new ObjectId("0A2463A6406A263EFF5B5F62"),
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
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.resetModules();
  });

  it("Should delete a product when product exists", async () => {
    req = { params: { pid: "0A2463A6406A263EFF5B5F62" } };
    productModel.findByIdAndDelete = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct),
    });

    await deleteProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  it("Should return error response if product id is not found but is valid", async () => {
    req = { params: { pid: "3373D6C5B1BCFB50E6461FF6" } };
    productModel.findByIdAndDelete = jest
      .fn()
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await deleteProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Product not found",
    });
  });

  it("Should return error response if product id is not defined", async () => {
    req = { params: {} };

    await deleteProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid Product format",
    });
  });

  it("Should return error response if product id does not conform to correct id format", async () => {
    req = { params: { pid: "abc" } };

    await deleteProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Invalid Product format",
    });
  });

  it("Should return error response when there is an internal error when deleting product", async () => {
    req = { params: { pid: "3373D6C5B1BCFB50E6461FF6" } };
    productModel.findByIdAndDelete = jest.fn().mockReturnValue({
      select: jest.fn().mockImplementation(() => {
        throw new Error("some error");
      }),
    });

    await deleteProductController(req, res);

    // Assertions
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Error while deleting product",
      error: new Error("some error"),
    });
  });
});
