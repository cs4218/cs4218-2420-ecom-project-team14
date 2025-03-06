import { jest } from "@jest/globals";
import { createCategoryController } from "../categoryController";
import categoryModel from "../../models/categoryModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/categoryModel");

describe("Create Category Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        categoryModel.findOne = jest.fn().mockResolvedValue(null);
        categoryModel.prototype.save = jest.fn();

        req = {
            body: {
                name: "Role-playing Games, Board Games, Card Games, Puzzle Games, Sports Games, Strategy Games, Party Games"
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }
    });

    // Test 1: Success case where user can create category successfully with not used valid name
    // This test also covers the case for the upper boundary for BVA for category name (100 characters)
    it('should allow the user to create category with non-empty and not used valid name', async () => {
        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(201); 
        // Check that message shows that new category has been created  
        expect(res.send.mock.lastCall[0].message).toBe("new category created");
        expect(res.send.mock.lastCall[0].success).toEqual(true);
    });

    // Name (Equivalence Partitioning) (There are 4 equivalence classes: Empty name, Non-empty invalid name, Already used valid name, Not used valid name)
    // Not used valid name is already covered in Test 1
    // Test 2 (Empty name): Case where name of category is empty
    it('should not allow the user to create category with empty name', async () => {
        req.body.name = "";

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);   
        // Check that message shows that name is required  
        expect(res.send.mock.lastCall[0].message).toBe("Name is required");
    });

    // Test 3 (Non-empty invalid name): Case where length of name is more than 100 characters
    // This test also covers the case for just above upper boundary for BVA for category name (101 characters)
    it('should not allow the user to create category with name that is 101 characters long', async () => {
        req.body.name = "Electronics and Toys for Kids: Video Games, Lego, Board Games, Card Games, Action Figures and Puzzles";

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);   
        // Check that message show that name of category can only be up to 100 characters long
        expect(res.send.mock.lastCall[0].message).toBe("Name of category can only be up to 100 characters long");
    });

    // Test 4 (Already used valid name): Case where non-empty valid name already exists in database
    it('should not allow the user to create category with name that is already used', async () => {
        const category = {
            _id: new ObjectId("67bd7972f616a1f52783a628"),
            name: "Video Games",
            slug: "video-games"
        }
        categoryModel.findOne = jest.fn().mockResolvedValue(category);

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);   
        // Check that message show that the name of the category already exists
        expect(res.send.mock.lastCall[0].message).toBe("The name of the category already exists");
    });

    // Test 5: Case where there is an error when trying to create the category
    it('should throw an error when the user faces an error while creating the category', async () => {
        categoryModel.findOne = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to create the category")
        });

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);   
        // Check that the message show that there is an error when creating the category
        expect(res.send.mock.lastCall[0].message).toBe("Error in Category");
        expect(res.send.mock.lastCall[0].success).toEqual(false);
    });
});