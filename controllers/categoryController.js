import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }
    // Add validation to ensure that length of category name is not more than 100 characters
    if (name.length > 100) {
      return res.status(401).send({ message: "Name of category can only be up to 100 characters long"});
    }

    // Add validation to ensure that search is case insensitive 
    const existingCategory = await categoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i')} });
    if (existingCategory) {
      return res.status(401).send({
        message: "The name of the category already exists",
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "new category created",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Category",
    });
  }
};

//update category
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    // Add validation to check that name is not empty
    if (!name) {
      return res.status(400).send({ message: "The category name is required" });
    }

    // Add validation to check that name is at most 100 characters long
    if (name.length > 100) {
      return res.status(400).send({ message: "The name of the category can only be up to 100 characters long"});
    }

    // Add validation to check that name of category is not already used
    const existingCategory = await categoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i')} });
    if (existingCategory) {
      return res.status(400).send({
        message: "The name of the category already exists",
      });
    }

    // Add validation to check that id is not empty
    if (!id) {
      return res.status(400).send({ message: "The Category id is required" });
    }
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );

    // Checks whether category can be updated
    if (!category) {
      return res.status(400).send({ message: "Unable to find and update the category" });
    }

    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category",
    });
  }
};

// get all cat
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};

// single category
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(400).send({ message: "Unable to find the category with provided slug"});
    }
    res.status(200).send({
      success: true,
      message: "Get SIngle Category SUccessfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category",
    });
  }
};

//delete category
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Category id cannot be empty"});
    }

    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(400).send({ message: "Unable to find the category to delete"});
    }

    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while deleting category",
      error,
    });
  }
};