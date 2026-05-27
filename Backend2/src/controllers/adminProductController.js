import { CustomError } from "../middleware/errorHandler.js";
import { Product } from "../models/productModels.js";
import cloudinary, { uploadImage } from "../services/cloudinaryService.js"; // 👉 Import generic uploader

export const createProduct = async (req, res) => {
  const {
    name, description, price, discountPrice, category, type, scent, vessel, size,
    burnTime, stock, isFeatured, isTrending, isBestSeller, isDiscounted, isLatest,
    weight, material
  } = req.body;

  // 👉 Validate BEFORE uploading to prevent orphaned images on Cloudinary!
  if (!name || !price || !type) {
    throw new CustomError("Required fields missing", 400);
  }

  // 👉 Upload images concurrently using Promise.all and the new compression service
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => {
      // 1200px is optimal for product zoom features
      return uploadImage(file.buffer, "naisha-creations/products", 1200); 
    });

    // Execute all uploads at the exact same time
    const results = await Promise.all(uploadPromises);

    uploadedImages = results.map(result => ({
      url: result.url,
      public_id: result.public_id
    }));
  }

  // Create product
  // Parse category — arrives as a JSON string from FormData (e.g. '["id1","id2"]')
  let parsedCategory = [];
  if (category) {
    try {
      parsedCategory = JSON.parse(category);
    } catch {
      // Fallback: if it's a single ID string, wrap it
      parsedCategory = [category];
    }
  }

  const newProduct = await Product.create({
    name, description, price, discountPrice, category: parsedCategory, type, scent, vessel, size,
    burnTime, stock, images: uploadedImages, isFeatured, isTrending, isBestSeller,
    isDiscounted, isLatest, weight, material,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    product: newProduct
  });
};

export const deleteProduct = async (req, res) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) {
    throw new CustomError("Product not found", 404);
  }

  // 👉 Concurrently delete all images from cloudinary to save time
  if (prod.images && prod.images.length > 0) {
    const deletePromises = prod.images
      .filter(img => img.public_id) // ensure public_id exists
      .map(img => cloudinary.uploader.destroy(img.public_id));
      
    await Promise.all(deletePromises);
  }
  
  await prod.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Product deleted"
  });
};

export const updateProduct = async (req, res) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) {
    throw new CustomError("Product not found", 404);
  }

  // 1. Update normal fields
  const fields = [
    "name", "description", "price", "discountPrice", "type", "scent", 
    "vessel", "size", "burnTime", "stock", "isFeatured", "isTrending", "isBestSeller", 
    "isDiscounted", "isLatest", "weight", "material"
  ];
  
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      prod[field] = req.body[field];
    }
  });

  // Handle category separately — arrives as JSON string from FormData
  if (req.body.category !== undefined) {
    try {
      prod.category = JSON.parse(req.body.category);
    } catch {
      prod.category = [req.body.category];
    }
  }

  // 2. Handle image update (optional)
  if (req.files && req.files.length > 0) {
    
    // 👉 Step A: Delete old images concurrently
    if (prod.images && prod.images.length > 0) {
      const deletePromises = prod.images
        .filter(img => img.public_id)
        .map(img => cloudinary.uploader.destroy(img.public_id));
      await Promise.all(deletePromises);
    }
    
    // 👉 Step B: Compress and upload new images concurrently
    const uploadPromises = req.files.map(file => {
      return uploadImage(file.buffer, "naisha-creations/products", 1200);
    });

    const results = await Promise.all(uploadPromises);

    prod.images = results.map(result => ({
      url: result.url,
      public_id: result.public_id
    }));
  }
  
  await prod.save();
  
  res.status(200).json({
    success: true,
    product: prod
  });
};

export const getSingleProductAdmin = async (req, res) => {
  // Admin panel stays using ID, which is perfectly fine!
  const product = await Product.findById(req.params.id);
  if (!product) throw new CustomError("Product not found", 404);
  res.status(200).json({
    success: true,
    product
  });
};

export const getAllProductsAdmin = async (req, res) => {
  let {
    page = 1,
    limit = 10,
    lowStock,
    inactive
  } = req.query;
  
  const pageNumber = Number(page);
  const pageLimit = Number(limit);
  const skip = (pageNumber - 1) * pageLimit;

  // BUILD QUERY
  let query = {};

  // Low stock filter (e.g. stock <= 5)
  if (lowStock === "true") {
    query.stock = {
      $lte: 5
    };
  }

  // Inactive products filter
  if (inactive === "true") {
    query.isActive = false;
  }

  // TOTAL COUNT (based on filter)
  const totalProducts = await Product.countDocuments(query);

  // FETCH PRODUCTS
  const products = await Product.find(query).populate("category", "name").sort({
    createdAt: -1
  }).skip(skip).limit(pageLimit);
  
  res.status(200).json({
    success: true,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalProducts / pageLimit),
    totalProducts,
    count: products.length,
    hasMore: skip + products.length < totalProducts,
    products
  });
};