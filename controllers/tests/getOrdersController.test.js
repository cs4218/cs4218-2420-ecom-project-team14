import { jest } from "@jest/globals";
import { getOrdersController } from "../authController";
import orderModel from "../../models/orderModel";
import { ObjectId } from "mongodb";

jest.mock("../../models/orderModel");

describe("Get Orders Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            user: {
                _id: "67b18f9cbcd7fd83f1df3c20"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    }); 

    // Test 1: Success case where the orders made by the user can be obtained
    it('should allow the user to get the list of orders that they have made', async () => {

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
    
        const mockOrder = {
            _id: new ObjectId('67b1a6a6f9d490b2482c8eb2'),
            products: [firstMockProduct, secondMockProduct],
            buyer: {
                _id: new ObjectId('67b18f9cbcd7fd83f1df3c20'),
                name: 'Douglas Lim'
            },
            status: 'Delivered',
            createdAt: '2025-02-16T08:44:51.984Z',
            updatedAt: '2025-02-16T08:47:16.756Z'
        };

        // Chaining the populate calls here to eventually return mockOrder
        const mockPopulate = {
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue(mockOrder)
            })
        };

        orderModel.find = jest.fn().mockReturnValue(mockPopulate);

        await getOrdersController(req, res);

        // Check that the id of the buyer of the order and the id passed into req.user is the same
        expect(res.json.mock.lastCall[0].buyer._id.toString()).toBe(req.user._id);

        // Some checks to ensure that the order and products passed to res.json is correct
        expect(res.json.mock.lastCall[0]._id).toEqual(new ObjectId('67b1a6a6f9d490b2482c8eb2'));
        expect(res.json.mock.lastCall[0].products[0]._id).toEqual(new ObjectId('67af136e412da5fc3b82ecde'));
        expect(res.json.mock.lastCall[0].products[1]._id).toEqual(new ObjectId('67af1437412da5fc3b82ece7'));
        expect(res.json.mock.lastCall[0].buyer.name).toBe('Douglas Lim');
        expect(res.json.mock.lastCall[0].status).toBe('Delivered');
    });

    // Test 2: Success case where user did not make any orders
    it('should return an empty array for the user who has made 0 orders', async () => {
       
        // Chaining the populate calls here to eventually return empty array
        const mockPopulate = {
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue([])
            })
        };

        orderModel.find = jest.fn().mockReturnValue(mockPopulate);

        await getOrdersController(req, res);

        // Check that an empty array is passed to res.json since there are no orders that can be found
        expect(res.json.mock.lastCall[0]).toEqual([]);
    });

    // Test 3: Error when trying to get the orders
    it('should throw an error when the user faces an error in getting the orders', async () => {

        orderModel.find = jest.fn().mockImplementation(() => {
            throw new Error("Error in connecting with database to retrieve order")
        });

        await getOrdersController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        // Check that the message shows that there is an error while getting orders
        expect(res.send.mock.lastCall[0].message).toBe("Error WHile Geting Orders");
    });
    
});