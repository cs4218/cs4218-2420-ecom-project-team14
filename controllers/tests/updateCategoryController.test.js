import { jest } from "@jest/globals";
import { updateCategoryController } from "../categoryController";
import categoryModel from "../../models/categoryModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/categoryModel.js");

describe("Update Category Controller Tests", () => {
    let req, res;

    const category = {
        _id: new ObjectId("67bd7972f616a1f52783a628"),
        name: "Video Games",
        slug: "video-games"
    }


    beforeEach(() => {
        jest.clearAllMocks();

        categoryModel.findOne = jest.fn().mockResolvedValue(null);
        categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(category);

        req = {
            body: {
                name: "Video Games"
            },
            params: {
                id: new ObjectId("67bda1494564629f823f1a34")
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }
    });

    // Case where the user is able to succesfully update the category with valid name and id
    it('should allow the user to update the category with valid name and id', async () => {
        
        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send.mock.lastCall[0].message).toBe("Category Updated Successfully");
        expect(res.send.mock.lastCall[0].success).toEqual(true);
    });

    // Name
    // Case where name is empty
    it('should not allow the user to update the category with empty name', async () => {
        req.body.name = "";

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The category name is required");
    });

    // Case where length of name is more than 100 characters
    it('should not allow the user to update the category with a name that is 101 characters long', async () => {
        req.body.name = "Electronics and Toys for Kids: Video Games, Lego, Board Games, Card Games, Action Figures and Puzzles";        

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The name of the category can only be up to 100 characters long");
    });

    // Case where name is already used
    it('should not allow the user to update the category if the name is already used', async () => {
        const category = {
            _id: new ObjectId("67bd7972f616a1f52783a628"),
            name: "Video Games",
            slug: "video-games"
        }
        categoryModel.findOne = jest.fn().mockResolvedValue(category);

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The name of the category already exists");
        
    });

    // ID
    // Case where id is empty
    it('should not allow the user to update the category with empty id', async () => {
        req.params.id = "";

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("The Category id is required");
    });

    // Case where id is invalid and unable to be found in database
    it('should not allow the user to update the category with invalid id', async () => {
        categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Unable to find and update the category");
    });

    // Case where there is an error while trying to update the category
    it('should throw an error when the user faces an error while updating the category', async () => {
        categoryModel.findByIdAndUpdate = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to update the category")
        });

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);   
        expect(res.send.mock.lastCall[0].message).toBe("Error while updating category");
        expect(res.send.mock.lastCall[0].success).toEqual(false);
    });
});