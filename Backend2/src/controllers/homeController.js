import { Product } from "../models/productModels.js";
import { Banner } from "../models/bannerModel.js";
export const getHomeData = async (req, res) => {
  const [banners, featured, trending, latest, bestSeller, discounted, rawProducts] = await Promise.all([
  // Fetch active banners
  Banner.find({
    isActive: true
  }).sort({
    createdAt: -1
  }).limit(6),
  // Featured
  Product.find({
    isFeatured: true,
    isActive: true
  }).limit(6).select("name slug price discountPrice images ratings"),
  // Trending
  Product.find({
    isTrending: true,
    isActive: true
  }).limit(6).select("name slug price discountPrice images ratings"),
  // Latest
  Product.find({
    isLatest: true,
    isActive: true
  }).limit(6).select("name slug price discountPrice images ratings"),
  // Best Seller
  Product.find({
    isBestSeller: true,
    isActive: true
  }).limit(6).select("name slug price discountPrice images ratings"),
  // Discounted
  Product.find({
    isDiscounted: true,
    isActive: true
  }).limit(6).select("name slug price discountPrice images ratings"),
  // Raw products
  Product.find({
    type: "simpleRaw"
  }).limit(6).select("name slug price discountPrice images ratings")]);
  return res.status(200).json({
    success: true,
    banners,
    featured,
    trending,
    latest,
    rawProducts,
    bestSeller,
    discounted
  });
};