import { jest } from "@jest/globals";
import productModel from "../../models/productModel.js";
import { productCountController } from "../productController.js";

jest.mock("../../models/productModel");
describe("Product Count Controller tests", () => {
  let res;

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

  it("Should fetch product count successfully", async () => {
    const mockGetCountSuccess = {
      estimatedDocumentCount: jest.fn().mockResolvedValue(3),
    };
    productModel.find = jest.fn().mockReturnValue(mockGetCountSuccess);

    await productCountController({}, res);

    // Assertions
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      total: 3,
    });
  });

  it("Should return error response when there is error fetching product count", async () => {
    const mockGetCountError = {
      estimatedDocumentCount: jest.fn().mockImplementation(() => {
        throw new Error("some error");
      }),
    };
    productModel.find = jest.fn().mockReturnValue(mockGetCountError);

    await productCountController({}, res);

    // Assertions
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      message: "Error in product count",
      error: new Error("some error"),
      success: false,
    });
  });
});
