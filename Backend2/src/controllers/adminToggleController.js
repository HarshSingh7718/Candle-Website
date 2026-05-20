import { CustomError } from "../middleware/errorHandler.js";
import { Product } from "../models/productModels.js";
import { CandleCustomization } from "../models/optionModel.js";
import { Banner } from "../models/bannerModel.js";
import { Category } from "../models/categoryModel.js";
import Review from "../models/reviewModel.js";
export const updateReviewStatus = async (req, res) => {
  const {
    reviewId
  } = req.params;
  const {
    status
  } = req.body;

  // 1. Validate status
  if (!["pending", "published"].includes(status)) {
    throw new CustomError("Invalid status", 400);
  }

  // 2. Find review
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new CustomError("Review not found", 404);
  }

  // 3. Update status
  review.status = status;
  await review.save();

  // 4. Recalculate product rating (IMPORTANT)
  const productId = review.product;
  const publishedReviews = await Review.find({
    product: productId,
    status: "published"
  });
  const numOfPublishedReviews = publishedReviews.length;
  const totalStars = publishedReviews.reduce((acc, item) => acc + item.rating, 0);
  const avgRating = numOfPublishedReviews > 0 ? totalStars / numOfPublishedReviews : 0;

  // 5. Update product
  const product = await Product.findById(productId);
  if (product) {
    product.numOfReviews = numOfPublishedReviews;
    product.ratings = Number(avgRating.toFixed(1));
    await product.save();
  }
  res.status(200).json({
    success: true,
    message: `Review marked as ${status}`,
    review
  });
};
export const toggleOptionStatus = async (req, res) => {
  const {
    step,
    optionId
  } = req.params;
  // step is expected to be a number (1, 2, or 3) passed in the URL

  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization not found", 404);
  }

  // 👉 1. FIND THE CORRECT STEP BY NUMBER
  const targetStep = customization.steps.find(s => s.stepNumber === Number(step));
  if (!targetStep) {
    throw new CustomError("Step not found", 404);
  }

  // 👉 2. FIND THE OPTION INSIDE THAT SPECIFIC STEP
  // Mongoose subdocument arrays have a built-in .id() method to find by _id
  const option = targetStep.options.id(optionId);
  if (!option) {
    throw new CustomError("Option not found", 404);
  }

  // 👉 3. TOGGLE STATUS
  option.isActive = !option.isActive;

  // Save the parent document, Mongoose handles the nested update
  await customization.save();
  res.status(200).json({
    success: true,
    message: `Option ${option.isActive ? "activated" : "deactivated"}`,
    option
  });
};
export const toggleProductStatus = async (req, res) => {
  const prod = await Product.findById(req.params.id);
  prod.isActive = !prod.isActive;
  await prod.save();
  res.json({
    success: true,
    isActive: prod.isActive
  });
};
export const toggleCategoryStatus = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new CustomError("Category not found", 404);
  }
  category.isActive = !category.isActive;
  await category.save();
  res.status(200).json({
    success: true,
    message: "Category status updated",
    isActive: category.isActive
  });
};
export const toggleBannerStatus = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new CustomError("Banner not found", 404);
  }
  banner.isActive = !banner.isActive;
  await banner.save();
  res.status(200).json({
    success: true,
    message: "Banner status updated",
    isActive: banner.isActive
  });
};