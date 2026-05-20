import { CustomError } from "../middleware/errorHandler.js";
import { User } from '../models/userModel.js';
export const addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const {
    productId
  } = req.body;
  const user = await User.findById(userId);

  // Prevent duplicate
  if (user.wishlist.includes(productId)) {
    throw new CustomError("Already in wishlist", 400);
  }
  user.wishlist.push(productId);
  await user.save();
  res.status(200).json({
    success: true,
    message: "Added to wishlist"
  });
};
export const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const {
    productId
  } = req.body;
  const user = await User.findById(userId);
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed from wishlist"
  });
};
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.status(200).json({
    success: true,
    wishlist: user.wishlist
  });
};