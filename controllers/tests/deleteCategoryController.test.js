import { jest } from "@jest/globals";
import { deleteCategoryCOntroller } from "../categoryController";
import categoryModel from "../../models/categoryModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/categoryModel.js");

describe("Delete Category Controller Tests", () => {
    let req, res;

    const category = {
        _id: new ObjectId('67bdc9a9bcc01fba258d1cf4'),
        name: "Pokemon Merchandise",
        slug: "pokemon-merchandise"
    }

    beforeEach(() => {
        jest.clearAllMocks();

        categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue(category);

        req = {
            params: {
                id: new ObjectId("67bda1494564629f823f1a34")
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }
    });

    // Case 1: Success case where the admin is able to delete the category
    it('should allow the admin to delete the category with a valid id', async () => {
        await deleteCategoryCOntroller(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send.mock.lastCall[0].message).toBe("Categry Deleted Successfully");
    });

    // ID 
    // Case 2: Case where id is empty
    it('should not allow the admin to delete a category with an empty id', async () => {
        req.params.id = "";
        
        await deleteCategoryCOntroller(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Category id cannot be empty");
    });


    // Case 3: Case where invalid id which is not found in database is given
    it('should not allow the admin to delete a category with invalid id that is not found in database', async () => {
        categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

        await deleteCategoryCOntroller(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send.mock.lastCall[0].message).toBe("Unable to find the category to delete");
    });


    // Case 4: Case where there is an error faced when trying to delete the category
    it('should throw an error when the admin faces an error while deleting the category', async () => {
        categoryModel.findByIdAndDelete = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to delete the category")
        });

        await deleteCategoryCOntroller(req, res);

        expect(res.status).toHaveBeenCalledWith(500);   
        expect(res.send.mock.lastCall[0].message).toBe("error while deleting category");
        expect(res.send.mock.lastCall[0].success).toEqual(false);
    });

   
});