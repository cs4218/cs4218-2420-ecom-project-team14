import { jest } from "@jest/globals";
import { getAllOrdersController } from "../authController";
import orderModel from "../../models/orderModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/orderModel");

describe("Get All Orders Controller Tests", () => {
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    // Test 1: Success case where admin can get all orders sorted by createdAt
    it('should allow the admin to get all orders sorted by createdAt', async () => {
        
        const firstMockProduct = {
            _id: new ObjectId('67af136e412da5fc3b82ecde'),
            name: 'Toy Car',
            slug: 'Toy-Car',
            description: 'VROOOOOOM!!!',
            price: 85.99,
            category: new ObjectId('67af1353412da5fc3b82ecd8'),
            quantity: 50,
            shipping: false,
            createdAt: "2025-02-14T09:57:02.898Z",
            updatedAt: "2025-02-14T09:57:02.898Z",
            __v: 0
        };
    
        const secondMockProduct = {
            _id: new ObjectId('67af1437412da5fc3b82ece7'),
            name: 'Snorlax Pokemon Trading Card',
            slug: 'Snorlax-Pokemon-Trading-Card',
            description: "This is a very rare card worth 1000s",
            price: 1250,
            catgeory: new ObjectId('67af1353412da5fc3b82ecd8'),
            quantity: 1,
            shipping: true, 
            createdAt: "2025-02-14T10:00:23.193Z",
            updatedAt: "2025-02-14T10:00:23.193Z"
        };
    
        const firstMockOrder = {
            _id: new ObjectId('67b1a6a6f9d490b2482c8eb2'),
            products: [firstMockProduct],
            buyer: {
                _id: new ObjectId('67b18f9cbcd7fd83f1df3c20'),
                name: 'Douglas Lim'
            },
            status: 'Delivered',
            createdAt: '2025-02-16T08:44:51.984Z',
            updatedAt: '2025-02-16T08:47:16.756Z'
        };

        const secondMockOrder = {
            _id: new ObjectId('67b1c8283d892eb5386cb272'),
            products: [secondMockProduct],
            buyer: {
                _id: new ObjectId('67b18f9cbcd7fd83f1df3c20'),
                name: 'Douglas Lim'
            },
            status: 'Not Processed',
            createdAt: '2025-02-14T08:44:51.984Z',
            updatedAt: '2025-02-14T08:47:16.756Z'
        }

       
        const mockPopulateSort = {
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue([firstMockOrder, secondMockOrder])
                })
            })
        };
        orderModel.find = jest.fn().mockReturnValue(mockPopulateSort);

        await getAllOrdersController({}, res);

        // Some checks to see that the first order is firstMockOrder and second order is secondMockOrder
        expect(res.json.mock.lastCall[0][0]._id).toEqual(new ObjectId('67b1a6a6f9d490b2482c8eb2'));
        expect(res.json.mock.lastCall[0][1]._id).toEqual(new ObjectId('67b1c8283d892eb5386cb272'));
    });

    // Test 2: Success case where empty array list is returned when no orders have been made
    it('should return an empty array when no orders have been made', async () => {
        
        const mockPopulateSort = {
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue([])
                })
            })
        };
        orderModel.find = jest.fn().mockReturnValue(mockPopulateSort);

        await getAllOrdersController({}, res);

        // Check that an empty array is passed to res.json since there are no orders that can be found
        expect(res.json.mock.lastCall[0]).toEqual([]);
    });

    // Test 3: Case where there is an error when trying to get all the orders
    it('should throw an error message when there is an error faced in getting all orders', async () => {

        orderModel.find = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to retrieve all the orders")
        });

        await getAllOrdersController({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        // Check that the message shows that there is an error while getting orders
        expect(res.send.mock.lastCall[0].message).toBe("Error WHile Geting Orders");
    });

});