import { CustomError } from "../middleware/errorHandler.js";
import { Product } from "../models/productModels.js";
import cloudinary from "../services/cloudinaryService.js";
export const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    type,
    scent,
    color,
    size,
    burnTime,
    stock,
    isFeatured,
    isTrending,
    isBestSeller,
    isDiscounted,
    isLatest,
    // tags,
    weight,
    material
  } = req.body;

  //  Upload images (if any)
  let images = [];
  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`);
      images.push({
        url: result.secure_url,
        public_id: result.public_id
      });
    }
  }
  if (!name || !price || !type) {
    throw new CustomError("Required fields missing", 400);
  }
  //  Create product
  const newProduct = await Product.create({
    name,
    description,
    price,
    discountPrice,
    category,
    type,
    scent,
    color,
    size,
    burnTime,
    stock,
    images,
    isFeatured,
    isTrending,
    isBestSeller,
    isDiscounted,
    isLatest,
    // tags,
    weight,
    material,
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

  // delete images
  for (let img of prod.images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
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

  //  1. Update normal fields
  const fields = ["name", "description", "price", "discountPrice", "category", "type", "scent", "color", "size", "burnTime", "stock", "isFeatured", "isTrending", "isBestSeller", "isDiscounted", "isLatest",
  // "tags",
  "weight", "material"];
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      prod[field] = req.body[field];
    }
  });

  //  2. Handle image update (optional)
  if (req.files && req.files.length > 0) {
    // delete old images
    for (let img of prod.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
    let newImages = [];
    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, {
        folder: "products"
      });
      newImages.push({
        url: result.secure_url,
        public_id: result.public_id
      });
    }
    prod.images = newImages;
  }
  await prod.save();
  res.status(200).json({
    success: true,
    product: prod
  });
};
export const getSingleProductAdmin = async (req, res) => {
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

  //  Low stock filter (e.g. stock <= 5)
  if (lowStock === "true") {
    query.stock = {
      $lte: 5
    };
  }

  //  Inactive products filter
  if (inactive === "true") {
    query.isActive = false;
  }

  //  TOTAL COUNT (based on filter)
  const totalProducts = await Product.countDocuments(query);

  //  FETCH PRODUCTS
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