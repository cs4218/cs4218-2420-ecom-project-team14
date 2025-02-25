import { jest } from "@jest/globals";
import { singleCategoryController } from "../categoryController";
import categoryModel from "../../models/categoryModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/categoryModel.js");

describe("Get Single Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params : {
                slug: 'latest-street-fashion'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }
    });

    // Case 1: Success case where user can find the single category with valid slug
    it('should allow the user to get single category with valid slug', async () => {
        const mockCategory = {
            _id: new ObjectId("67bd7972f616a1f52783a628"),
            name: "Latest Street Fashion",
            slug: "latest-street-fashion"
        }

        categoryModel.findOne = jest.fn().mockResolvedValue(mockCategory);
        
        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send.mock.lastCall[0].message).toBe("Get SIngle Category SUccessfully");
    });

    // Case 2: Case where user is unable to find the category with provided invalid slug
    it('should return an error message when the user provides an invalid slug', async () => {
        categoryModel.findOne = jest.fn().mockResolvedValue(null);
        
        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Unable to find the category with provided slug");
    });

    // Case 3: Case where there is an error when trying to get the single category
    it('should throw an error when there is an error faced in getting the single category', async () => {
        categoryModel.findOne = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to get the single category")
        });

        await singleCategoryController({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send.mock.lastCall[0].message).toBe("Error While getting Single Category");
    });


});