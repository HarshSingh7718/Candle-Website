import { CustomError } from "../middleware/errorHandler.js";
import { Product } from "../models/productModels.js";
import Review from "../models/reviewModel.js";
export const getSingleProduct = async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  //  1. Get product with reviews
  const prod = await Product.findOne({
    slug: slug,
    isActive: true
  }).populate("category", "name");
  if (!prod) {
    throw new CustomError("Product not found", 404);
  }

  const id = prod._id;

  //  2. Get similar products (same category, exclude current)
  // category is now an array — extract IDs whether populated or raw
  const categoryIds = (prod.category || []).map(c => c._id || c);
  const similarProducts = await Product.find({
    category: { $in: categoryIds },
    _id: {
      $ne: id
    } // exclude current product
  }).limit(6).select("name slug price discountPrice images ratings");

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
    maxPrice,
    search,
    sort
  } = req.query;

  const query = {
    type: "simpleCandle",
    isActive: true
  };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (maxPrice) {
    const priceLimit = Number(maxPrice);
    query.effectivePrice = { $lte: priceLimit };
  }

  let sortOption = { createdAt: -1 };
  if (sort === "popularity") {
    sortOption = { ratings: -1 };
  } else if (sort === "low-to-high") {
    sortOption = { effectivePrice: 1 };
  } else if (sort === "high-to-low") {
    sortOption = { effectivePrice: -1 };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const candles = await Product.find(query)
    .sort(sortOption)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .select("name slug price discountPrice images ratings stock createdAt");
    
  const total = await Product.countDocuments(query);
  
  res.status(200).json({
    success: true,
    total,
    currentPage: pageNum,
    totalPages: Math.ceil(total / limitNum),
    candles
  });
};