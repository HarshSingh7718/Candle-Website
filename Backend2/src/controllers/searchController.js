import { Product } from "../models/productModels.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchProducts = async (req, res) => {
  const {
    keyword,
    category,
    type,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10
  } = req.query;
  let query = {
    isActive: true
  };

  //  Search by keyword (sanitized to prevent ReDoS)
  if (keyword) {
    const safeKeyword = escapeRegex(keyword);
    query.$or = [{
      name: {
        $regex: safeKeyword,
        $options: "i"
      }
    }, {
      description: {
        $regex: safeKeyword,
        $options: "i"
      }
    }, {
      tags: {
        $regex: safeKeyword,
        $options: "i"
      }
    }];
  }

  //  Category filter
  if (category) {
    query.category = category;
  }

  //  Type filter
  if (type) {
    query.type = type;
  }

  //  Price filter (discountPrice OR price)
  if (minPrice || maxPrice) {
    query.$expr = {
      $and: [...(minPrice ? [{
        $gte: [{
          $ifNull: ["$discountPrice", "$price"]
        }, Number(minPrice)]
      }] : []), ...(maxPrice ? [{
        $lte: [{
          $ifNull: ["$discountPrice", "$price"]
        }, Number(maxPrice)]
      }] : [])]
    };
  }

  //  Pagination logic
  const skip = (Number(page) - 1) * Number(limit);
  const products = await Product.find(query).skip(skip).limit(Number(limit)).select("name slug price discountPrice images ratings type");
  const totalProducts = await Product.countDocuments(query);
  res.status(200).json({
    success: true,
    totalProducts,
    currentPage: Number(page),
    totalPages: Math.ceil(totalProducts / limit),
    count: products.length,
    products
  });
};