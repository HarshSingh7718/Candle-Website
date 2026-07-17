import { CustomError } from "../middleware/errorHandler.js";
import { Category } from "../models/categoryModel.js";
import { Product } from "../models/productModels.js";
import cloudinary, { uploadImage } from "../services/cloudinaryService.js"; // 👉 Import generic uploader

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const existing = await Category.findOne({ name });
  
  if (existing) {
    throw new CustomError("Category already exists", 400);
  }
  
  let imageData = {};
  let bannerImageData = {};

  if (req.files) {
    // Process main image (800px for thumbnails)
    if (req.files.image && req.files.image[0]) {
      const result = await uploadImage(req.files.image[0].buffer, "categories", 800);
      imageData = {
        url: result.url,
        public_id: result.public_id
      };
    }

    // Process banner image (1920px for wide banners)
    if (req.files.bannerImage && req.files.bannerImage[0]) {
      const bannerResult = await uploadImage(req.files.bannerImage[0].buffer, "categories_banners", 1920);
      bannerImageData = {
        url: bannerResult.url,
        public_id: bannerResult.public_id
      };
    }
  }

  const category = await Category.create({
    name,
    description,
    image: imageData,
    bannerImage: bannerImageData
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

  // Handle image updates
  if (req.files) {
    // Replace main image
    if (req.files.image && req.files.image[0]) {
      if (category.image?.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }
      const result = await uploadImage(req.files.image[0].buffer, "categories", 800);
      category.image = {
        url: result.url,
        public_id: result.public_id
      };
    }

    // Replace banner image
    if (req.files.bannerImage && req.files.bannerImage[0]) {
      if (category.bannerImage?.public_id) {
        await cloudinary.uploader.destroy(category.bannerImage.public_id);
      }
      const bannerResult = await uploadImage(req.files.bannerImage[0].buffer, "categories_banners", 1920);
      category.bannerImage = {
        url: bannerResult.url,
        public_id: bannerResult.public_id
      };
    }
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
    isActive: -1,
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

/**
 * GET /admin/category/:id/products
 * Returns all products with a boolean `assigned` flag for the given category.
 */
export const getCategoryProducts = async (req, res) => {
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);
  if (!category) throw new CustomError("Category not found", 404);

  // Fetch all active products (lightweight fields only)
  const products = await Product.find()
    .select("name slug images category")
    .sort({ createdAt: -1 });

  // Map each product to include an `assigned` flag
  const mapped = products.map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    image: p.images?.[0]?.url || null,
    assigned: (p.category || []).some(
      (catId) => catId.toString() === categoryId
    ),
  }));

  res.status(200).json({
    success: true,
    category: { _id: category._id, name: category.name },
    products: mapped,
  });
};

/**
 * PUT /admin/category/:id/products
 * Body: { productIds: ["id1", "id2", ...] }
 * Sets the given category on exactly these products (adds to new ones, removes from old ones).
 */
export const updateCategoryProducts = async (req, res) => {
  const categoryId = req.params.id;
  const { productIds = [] } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) throw new CustomError("Category not found", 404);

  // 1. Remove this category from ALL products that currently have it
  await Product.updateMany(
    { category: categoryId },
    { $pull: { category: categoryId } }
  );

  // 2. Add this category to the selected products
  if (productIds.length > 0) {
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { category: categoryId } }
    );
  }

  res.status(200).json({
    success: true,
    message: `Category "${category.name}" updated for ${productIds.length} product(s).`,
  });
};

/**
 * POST /admin/migrate-categories
 * One-time migration: wraps any single-ObjectId `category` values into arrays.
 * Safe to run multiple times — skips products that are already arrays.
 */
export const migrateCategoryToArray = async (req, res) => {
  // Find products where category is a single ObjectId (not an array)
  // In MongoDB, when the schema changes to array but data is still a single value,
  // we can use $type to check. But since Mongoose now treats it as array,
  // the safest approach is a raw update via the driver.
  const result = await Product.collection.updateMany(
    { category: { $type: "objectId" } },          // still a raw ObjectId
    [{ $set: { category: ["$category"] } }]        // wrap in array
  );

  res.status(200).json({
    success: true,
    message: `Migration complete. ${result.modifiedCount} product(s) updated.`,
  });
};