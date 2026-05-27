import { CustomError } from "../middleware/errorHandler.js";
import { Category } from "../models/categoryModel.js";
import { Product } from "../models/productModels.js";

export const getAllCategories = async (req, res) => {
  // Find all category IDs that have at least one active product
  const activeProductCategories = await Product.distinct("category", { isActive: true });

  const categories = await Category.find({
    _id: { $in: activeProductCategories },
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    categories
  });
};
export const getProductsByCategory = async (req, res) => {
  let {
    page = 1,
    limit = 10,
    search,
    maxPrice,
    sort
  } = req.query;
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true });
  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  const query = {
    category: category._id,
    isActive: true
  };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (maxPrice) {
    const priceLimit = Number(maxPrice);
    query.$or = [
      { discountPrice: { $gt: 0, $lte: priceLimit } },
      { discountPrice: 0, price: { $lte: priceLimit } }
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === "popularity") {
    sortOption = { ratings: -1 };
  } else if (sort === "low-to-high") {
    sortOption = { price: 1 };
  } else if (sort === "high-to-low") {
    sortOption = { price: -1 };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const products = await Product.find(query)
    .populate("category", "name")
    .sort(sortOption)
    .select("name slug price discountPrice images ratings stock createdAt")
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
    
  const totalProducts = await Product.countDocuments(query);
  
  res.status(200).json({
    success: true,
    totalProducts,
    currentPage: pageNum,
    totalPages: Math.ceil(totalProducts / limitNum),
    products
  });
};