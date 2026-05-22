import { CustomError } from "../middleware/errorHandler.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";

//  ADD TO CART (COMMON API)
export const addToCart = async (req, res) => {
  const {
    productId,
    customCandleId,
    quantity = 1
  } = req.body;
  const user = await User.findById(req.user._id);

  // =========================
  //  SIMPLE PRODUCT
  // =========================
  if (productId) {
    // 1. Fetch product and populate category to determine the type
    const prod = await Product.findById(productId).populate("category");
    if (!prod || !prod.isActive || prod.stock < quantity) {
      throw new CustomError("Product unavailable or out of stock", 400);
    }

    // 2. Determine the "Cart Type" dynamically
    // You can base this on the category name or a field on the product model
    let correctType = "simpleCandle"; // Default fallback

    if (prod.category?.name?.toLowerCase().includes("raw")) {
      correctType = "simpleRaw";
    }

    // 3. Find if this specific product with this specific type already exists in cart
    const existingItem = user.cart.find(item => item.product && item.product.toString() === productId.toString() && item.type === correctType);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQtyInCart + Number(quantity);

    // 3. CRITICAL CHECK: Does the NEW total exceed stock?
    if (newTotalQuantity > prod.stock) {
      throw new CustomError(`Stock exceeded, You have ${currentQtyInCart} in cart.`, 400);
    }
    if (existingItem) {
      // 4. Update quantity of existing item
      existingItem.quantity += Number(quantity);
    } else {
      // 5. Add new item with the dynamically determined type
      user.cart.push({
        type: correctType,
        product: productId,
        quantity: Number(quantity)
      });
    }

    // 6. Signal Mongoose that the array has changed
    user.markModified("cart");
    await user.save();
  }

  // =========================
  //  CUSTOM CANDLE
  // =========================
  if (customCandleId) {
    const candle = await CustomizedCandle.findById(customCandleId);
    if (!candle) {
      throw new CustomError("Custom candle not found", 404);
    }
    const existingItem = user.cart.find(item => item.type === "custom" && item.customCandle?.toString() === customCandleId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        type: "custom",
        customCandle: customCandleId,
        quantity
      });
    }
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Cart updated",
    cart: user.cart
  });
};
export const updateCart = async (req, res) => {
  const {
    itemId
  } = req.params;
  const {
    quantity
  } = req.body;
  if (!quantity || quantity < 1) {
    throw new CustomError("Quantity must be at least 1", 400);
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  //  Find item in cart
  const cartItem = user.cart.id(itemId);
  if (!cartItem) {
    throw new CustomError("Item not found in cart", 404);
  }

  //  Update quantity
  cartItem.quantity = quantity;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    cart: user.cart
  });
};
export const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product").populate("cart.customCandle");
  res.status(200).json({
    success: true,
    cart: user.cart
  });
};
export const removeFromCart = async (req, res) => {
  const {
    itemId
  } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  user.cart.pull(itemId);
  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed from cart",
    cart: user.cart
  });
};
export const clearCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  res.status(200).json({
    success: true,
    message: "Cart cleared"
  });
};
export const getCartBilling = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product").populate("cart.customCandle");
  let itemsPrice = 0;
  user.cart.forEach(item => {
    //  SIMPLE PRODUCT
    if (item.type === "simpleCandle" || item.type === "simpleRaw") {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      itemsPrice += price * item.quantity;
    }

    //  CUSTOM CANDLE
    if (item.type === "custom") {
      itemsPrice += item.customCandle.totalPrice * item.quantity;
    }
  });
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const totalPrice = Math.round(itemsPrice + shippingPrice);
  res.status(200).json({
    success: true,
    billing: {
      itemsPrice,
      shippingPrice,
      totalPrice
    }
  });
};