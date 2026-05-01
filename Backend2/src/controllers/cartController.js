import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";

//  ADD TO CART (COMMON API)
export const addToCart = async (req, res) => {
  try {
    const { productId, customCandleId, quantity = 1 } = req.body;

    const user = await User.findById(req.user._id);

    // =========================
    //  SIMPLE PRODUCT
    // =========================
    if (productId) {
      // 1. Fetch product and populate category to determine the type
      const prod = await Product.findById(productId).populate("category");

      if (!prod || !prod.isActive || prod.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Product unavailable or out of stock",
        });
      }

      // 2. Determine the "Cart Type" dynamically
      // You can base this on the category name or a field on the product model
      let correctType = "simpleCandle"; // Default fallback

      if (prod.category?.name?.toLowerCase().includes("raw")) {
        correctType = "simpleRaw";
      }

      // 3. Find if this specific product with this specific type already exists in cart
      const existingItem = user.cart.find(
        (item) =>
          item.product &&
          item.product.toString() === productId.toString() &&
          item.type === correctType
      );

      if (existingItem) {
        // 4. Update quantity of existing item
        existingItem.quantity += Number(quantity);
      } else {
        // 5. Add new item with the dynamically determined type
        user.cart.push({
          type: correctType,
          product: productId,
          quantity: Number(quantity),
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
        return res.status(404).json({
          success: false,
          message: "Custom candle not found",
        });
      }

      const existingItem = user.cart.find(
        (item) =>
          item.type === "custom" &&
          item.customCandle?.toString() === customCandleId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        user.cart.push({
          type: "custom",
          customCandle: customCandleId,
          quantity,
        });
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  Find item in cart
    const cartItem = user.cart.id(itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    //  Update quantity
    cartItem.quantity = quantity;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product")
      .populate("cart.customCandle");

    res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.cart.pull(itemId);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCartBilling = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product")
      .populate("cart.customCandle");

    let itemsPrice = 0;

    user.cart.forEach((item) => {
      //  SIMPLE PRODUCT
      if (item.type === "simpleCandle" || item.type === "simpleRaw") {
        const price =
          item.product.discountPrice > 0
            ? item.product.discountPrice
            : item.product.price;

        itemsPrice += price * item.quantity;
      }

      //  CUSTOM CANDLE
      if (item.type === "custom") {
        itemsPrice += item.customCandle.totalPrice * item.quantity;
      }
    });

    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = itemsPrice * 0.05;
    const totalPrice = Math.round(itemsPrice + shippingPrice + taxPrice);

    res.status(200).json({
      success: true,
      billing: {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
