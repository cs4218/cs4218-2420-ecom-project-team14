import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import {
  PRODUCT_LIMIT,
  RELATED_PRODUCT_LIMIT,
  PER_PAGE_LIMIT,
} from "./constants/productConstants.js";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    // validation
    switch (true) {
      case !name || name.trim() === "":
        return res
          .status(400)
          .send({ success: false, message: "Name is Required" });
      case !description || description.trim() === "":
        return res
          .status(400)
          .send({ success: false, message: "Description is Required" });
      case !price || price.trim() === "":
        return res
          .status(400)
          .send({ success: false, message: "Price is Required" });
      case !category:
        return res
          .status(400)
          .send({ success: false, message: "Category is Required" });
      case !quantity:
        return res
          .status(400)
          .send({ success: false, message: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res.status(400).send({
          success: false,
          message: "photo is Required and should be less then 1mb",
        });
    }

    // Validate that product name cannot be more than 100 characters
    if (name.length > 100) {
      return res.status(400).send({
        success: false,
        message: "Name of product can only be up to 100 characters long",
      });
    }

    // Validate that product description cannot be more than 500 characters
    if (description.length > 500) {
      return res.status(400).send({
        success: false,
        message: "Description of product can only be up to 500 characters long",
      });
    }

    // Validate that category id must conform to mongoose object id format
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).send({
        success: false,
        message: "Category id must conform to mongoose object id format",
      });
    }

    // Validate that price must be a number when parsed
    if (
      !/^\d*\.?\d+$/.test(price) || // Reject non-numeric values
      parseFloat(price) <= 0 // Reject non-positive numeric values
    ) {
      return res.status(400).send({
        success: false,
        message: "Price must be a positive number when parsed",
      });
    }

    // Validate that quantity must be a stringed positive integer
    if (
      !/^-?\d+$/.test(quantity) || // Reject non stringed integers
      parseInt(quantity) <= 0 // Reject non-positive numeric values
    ) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be a stringed positive integer",
      });
    }

    // Validate that shipping can only take values 0 or 1
    if (shipping !== "0" && shipping !== "1") {
      return res.status(400).send({
        success: false,
        message: "Shipping must either take on values 0 or 1",
      });
    }

    // Check whether categoryId exists
    const existingCategory = await categoryModel.findById(category);
    // Return error if category id does not exist
    if (!existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category given does not exist",
      });
    }

    // Do a case-insensitive check for a product with same name
    const existingProduct = await productModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    // Return error if product with same name exists
    if (existingProduct) {
      return res.status(400).send({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // Do a case-insensitive check that no other product exists with the same slug
    const productSlug = slugify(name);
    const productWithSameSlug = await productModel.findOne({
      slug: { $regex: new RegExp(`^${productSlug}$`, "i") },
    });
    if (productWithSameSlug) {
      return res.status(400).send({
        success: false,
        message: `Product with this name format or slug already exists: ${productSlug}`,
      });
    }

    // Truncate price to 2 decimal places
    const priceTruncated = parseFloat(price).toFixed(2);
    const products = new productModel({
      ...req.fields,
      price: priceTruncated,
      slug: productSlug,
    });

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(PRODUCT_LIMIT)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "AllProducts",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Invalid product slug provided",
      });
    }
    const product = await productModel
      .findOne({ slug: slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    // Check if pid is null or corresponds to mongoose object id type
    const { pid } = req.params;
    if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).send({
        success: false,
        message: "Invalid Product id format",
      });
    }
    const product = await productModel.findById(pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    const { pid } = req.params;

    // check if pid is null or doesn't correspond to mongoose object id type
    if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).send({
        success: false,
        message: "Invalid Product format",
      });
    }

    const deletedProduct = await productModel
      .findByIdAndDelete(pid)
      .select("-photo");

    // check if product is deleted successfully
    if (!deletedProduct) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//update products
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name || name.trim() == "":
        return res
          .status(400)
          .send({ success: false, message: "Name is Required" });
      case !description:
        return res
          .status(400)
          .send({ success: false, message: "Description is Required" });
      case !price:
        return res
          .status(400)
          .send({ success: false, message: "Price is Required" });
      case !category:
        return res
          .status(400)
          .send({ success: false, message: "Category is Required" });
      case !quantity:
        return res
          .status(400)
          .send({ success: false, message: "Quantity is Required" });
      case !shipping:
        return res
          .status(400)
          .send({ success: false, message: "Shipping is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(400)
          .send({ success: false, message: "Photo should be less then 1mb" });
    }

    // Validate that product name cannot be more than 100 characters
    if (name.length > 100) {
      return res.status(400).send({
        success: false,
        message: "Name of product can only be up to 100 characters long",
      });
    }

    // Validate that product description cannot be more than 500 characters
    if (description.length > 500) {
      return res.status(400).send({
        success: false,
        message: "Description of product can only be up to 500 characters long",
      });
    }

    // Validate that category id must conform to mongoose object id format
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).send({
        success: false,
        message: "Category id must conform to mongoose object id format",
      });
    }

    // Validate that price must be a number when parsed
    if (
      !/^\d*\.?\d+$/.test(price) || // Reject non-numeric values
      parseFloat(price) <= 0 // Reject non-positive numeric values
    ) {
      return res.status(400).send({
        success: false,
        message: "Price must be a positive number when parsed",
      });
    }

    // Validate that quantity must be a stringed positive integer
    if (
      !/^-?\d+$/.test(quantity) || // Reject non stringed integers
      parseInt(quantity) <= 0 // Reject non-positive numeric values
    ) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be a stringed positive integer",
      });
    }

    // Validate that shipping can only take values 0 or 1
    if (parseInt(shipping) !== 0 && parseInt(shipping) !== 1) {
      return res.status(400).send({
        success: false,
        message: "Shipping must either take on values 0 or 1",
      });
    }

    // Check whether categoryId exists
    const existingCategory = await categoryModel.findById(category);
    // Return error if category id does not exist
    if (!existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category given does not exist",
      });
    }

    // Truncate price to 2 decimal places
    const priceTruncated = parseFloat(price).toFixed(2);

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
        price: priceTruncated,
        shipping: parseInt(shipping),
      },
      { new: true }
    );
    if (photo) {
      updatedProduct.photo.data = fs.readFileSync(photo.path);
      updatedProduct.photo.contentType = photo.type;
    }
    await updatedProduct.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    // checked validations
    if (
      !checked ||
      !Array.isArray(checked) ||
      (checked.length > 0 &&
        !checked.every((id) => mongoose.Types.ObjectId.isValid(id)))
    ) {
      return res.status(400).send({
        success: false,
        message: "'checked' must be an array with valid category ids",
      });
    }

    // radio validations
    if (
      !radio ||
      !Array.isArray(radio) ||
      (radio.length !== 2 && radio.length !== 0) ||
      !radio.every((num) => typeof num === "number")
    ) {
      return res.status(400).send({
        success: false,
        message: "'radio' must an empty array or an array with two numbers",
      });
    }
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list based on page
export const productListController = async (req, res) => {
  try {
    // req.params.page will always be a string
    // Page will be NaN if req.params.page is not a numeric-integer string
    // Deals with null values which will become NaN
    let page = parseInt(req.params.page, 10);

    // Reject non-integers, null values and negative and 0 values
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).send({
        success: false,
        message: "Invalid page number. Page must be positive integer",
      });
    }

    page = Math.max(1, page);

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * PER_PAGE_LIMIT)
      .limit(PER_PAGE_LIMIT)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || keyword.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Keyword must not be empty" });
    }

    if (keyword.length > 100) {
      //limit to be not more than product name length restriction
      return res
        .status(400)
        .json({ success: false, message: "Keyword is too long" });
    }

    // Prevents regex injection attacks: Prefix special characters with "\"
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const results = await productModel
      .find({
        $or: [
          { name: { $regex: safeKeyword, $options: "i" } },
          { description: { $regex: safeKeyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    // Gives this status error when pid/cid is null or invalid
    if (
      !pid ||
      !cid ||
      !mongoose.Types.ObjectId.isValid(pid) ||
      !mongoose.Types.ObjectId.isValid(cid)
    ) {
      return res.status(400).send({
        success: false,
        message: "Pid and Cid must be in a valid format",
      });
    }

    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(RELATED_PRODUCT_LIMIT)
      .populate("category");

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get products by category
export const productCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Invalid category slug provided",
      });
    }
    const category = await categoryModel.findOne({ slug: slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    const products = await productModel.find({ category }).populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    // Truncate price to 2dp
    total = total.toFixed(2);
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          if (result.success) {
            // Create order with processing order status
            const order = new orderModel({
              products: cart,
              payment: result,
              buyer: req.user._id,
              status: "Processing"
            }).save();

            const productCount = new Map();
            // Getting the quantity of each product in the order (To avoid making too many API calls)
            cart.forEach((product) => {
              if (productCount.get(product._id)) {
                productCount.set(product._id, productCount.get(product._id) + 1);
              } else {
                productCount.set(product._id, 1);
              }
            });
            
            // Decrementing product count for each product
            productCount.forEach((value, key) => {
              productModel.findByIdAndUpdate(key, 
                {$inc: {quantity: -value}}
              ).exec();
            });
          } else {
            const order = new orderModel({
              products: cart,
              payment: result,
              buyer: req.user._id
            }).save();
          }
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
