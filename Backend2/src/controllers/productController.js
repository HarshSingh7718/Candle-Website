import { CustomError } from "../middleware/errorHandler.js";
import { Product } from "../models/productModels.js";
import Review from "../models/reviewModel.js";
export const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  //  1. Get product with reviews
  const prod = await Product.findById({
    _id: id,
    isActive: true
  }).populate("category", "name");
  if (!prod) {
    throw new CustomError("Product not found", 404);
  }

  //  2. Get similar products (same category, exclude current)
  const similarProducts = await Product.find({
    category: prod.category._id,
    _id: {
      $ne: id
    } // exclude current product
  }).limit(6).select("name price discountPrice images ratings");

  // Fetch reviews for a product with pagination
  const productReviews = await Review.find({
    product: prod._id,
    status: "published" // optional filter
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalReviews = await Review.countDocuments({
    product: prod._id,
    status: "published"
  });

  // Format reviews
  const reviews = productReviews.map(r => ({
    user: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt
  }));
  res.status(200).json({
    success: true,
    product: prod,
    reviews,
    pagination: {
      total: totalReviews,
      page,
      pages: Math.ceil(totalReviews / limit)
    },
    similarProducts
  });
};
export const getAllCandles = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    minPrice,
    maxPrice
  } = req.query;
  const query = {
    type: "simpleCandle",
    isActive: true
  };
  const candles = await Product.find(query).skip((page - 1) * limit).limit(Number(limit)).select("name price discountPrice images ratings stock createdAt");
  const total = await Product.countDocuments(query);
  res.status(200).json({
    success: true,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    candles
  });
};