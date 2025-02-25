import { jest } from "@jest/globals";
import { createCategoryController } from "../categoryController";
import categoryModel from "../../models/categoryModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/categoryModel.js");

describe("Create Category Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        categoryModel.findOne = jest.fn().mockResolvedValue(null);
        categoryModel.prototype.save = jest.fn();

        req = {
            body: {
                name: "Video Games"
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }
    });

    // Success case where user can create category successfully with valid name
    it('should allow the user to create category with valid name', async () => {
        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);   
        expect(res.send.mock.lastCall[0].message).toBe("new category created");
        expect(res.send.mock.lastCall[0].success).toEqual(true);
    });

    // Name
    // Case where name of category is empty
    it('should not allow the user to create category with empty name', async () => {
        req.body.name = "";

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);   
        expect(res.send.mock.lastCall[0].message).toBe("Name is required");
    });

    // Case where length of name is more than 100 characters
    it('should not allow the user to create category with name that is 101 characters long', async () => {
        req.body.name = "Electronics and Toys for Kids: Video Games, Lego, Board Games, Card Games, Action Figures and Puzzles";

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);   
        expect(res.send.mock.lastCall[0].message).toBe("Name of category can only be up to 100 characters long");
    });

    // Case where name already exists in database
    it('should not allow the user to create category with name that is already used', async () => {
        const category = {
            _id: new ObjectId("67bd7972f616a1f52783a628"),
            name: "Video Games",
            slug: "video-games"
        }
        categoryModel.findOne = jest.fn().mockResolvedValue(category);

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);   
        expect(res.send.mock.lastCall[0].message).toBe("The name of the category already exists");
    });

    // Case where there is an error when trying to create the category
    it('should throw an error when the user faces an error while creating the category', async () => {
        categoryModel.findOne = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to create the category")
        });

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);   
        expect(res.send.mock.lastCall[0].message).toBe("Error in Category");
        expect(res.send.mock.lastCall[0].success).toEqual(false);
    });
});