import { CustomError } from "../middleware/errorHandler.js";
import { Category } from "../models/categoryModel.js";
import cloudinary, { uploadImage } from "../services/cloudinaryService.js"; // 👉 Import generic uploader

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const existing = await Category.findOne({ name });
  
  if (existing) {
    throw new CustomError("Category already exists", 400);
  }
  
  let imageData = {};

  // 👉 Delegate to your generic service (800px is plenty for category thumbnails)
  if (req.file) {
    const result = await uploadImage(req.file.buffer, "categories", 800);
    imageData = {
      url: result.url,
      public_id: result.public_id
    };
  }

  const category = await Category.create({
    name,
    description,
    image: imageData
  });

  res.status(201).json({
    success: true,
    category
  });
};

export const updateCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  // Update text fields
  if (name) category.name = name;
  if (description) category.description = description;

  // Replace image
  if (req.file) {
    // delete old image
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    // 👉 Delegate to your generic service
    const result = await uploadImage(req.file.buffer, "categories", 800);
    
    category.image = {
      url: result.url,
      public_id: result.public_id
    };
  }
  
  await category.save();
  
  res.status(200).json({
    success: true,
    message: "Category updated",
    category
  });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  // Delete image from cloudinary
  if (category.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Category deleted"
  });
};

export const getAllCategoriesAdmin = async (req, res) => {
  const categories = await Category.find().sort({
    createdAt: -1
  });
  
  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
};

export const getSingleCategoryAdmin = async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) throw new CustomError("Category not found", 404);
  
  res.status(200).json({
    success: true,
    category
  });
};