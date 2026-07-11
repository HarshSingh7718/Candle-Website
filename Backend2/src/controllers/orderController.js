import { CustomError } from "../middleware/errorHandler.js";
import Razorpay from "razorpay";
import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";
import { CandleCustomization } from "../models/optionModel.js";
import { sendSMS } from "../services/otp_services.js";
import { sendOrderConfirmationEmail } from "../utils/sendEmail.js";
import { checkServiceability } from "../services/shipRocketService.js";
import { config } from "../config/index.js";
import { validateAndCalculateDiscount } from "../utils/couponHelper.js";
import { Settings } from "../models/settingsModel.js";
const razorpay = new Razorpay({
  key_id: config.razor.k_id,
  key_secret: config.razor.k_secret
});
export const createOrder = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product").populate("cart.customCandle");
  const {
    firstName,
    lastName,
    address,
    city,
    state,
    pincode,
    phone,
    paymentMethod = "razorpay",
    //  BUY NOW
    productId,
    quantity = 1,
    //  COUPON (only the code string — never trust client-calculated amounts)
    couponCode
  } = req.body;
  let orderItems = [];

  // =========================
  //  BUY NOW (ONLY SIMPLE)
  // =========================
  if (productId) {
    const prod = await Product.findById(productId);
    if (!prod || prod.stock < quantity) {
      throw new CustomError("Product out of stock", 400);
    }
    orderItems.push({
      type: prod.type,
      product: prod._id,
      name: prod.name,
      quantity,
      slug: prod.slug,
      price: prod.discountPrice || prod.price,
      image: prod.images?.[0]?.url || ""
    });
  }

  // =========================
  //  CART FLOW (SIMPLE + CUSTOM)
  // =========================
  else {
    if (!user || user.cart.length === 0) {
      throw new CustomError("Cart is empty", 400);
    }
    for (let item of user.cart) {
      //  SIMPLE PRODUCT
      if (item.type === "simpleCandle" || item.type === "simpleRaw") {
        const prod = item.product;
        if (!prod || prod.stock < item.quantity) {
          throw new CustomError(`${prod?.name || "Item"} out of stock`, 400);
        }
        orderItems.push({
          type: prod.type,
          product: prod._id,
          name: prod.name,
          quantity: item.quantity,
          slug: prod.slug,
          price: prod.discountPrice || prod.price || 0,
          image: prod.images?.[0]?.url || ""
        });
      }

      // 🕯️ CUSTOM CANDLE
      if (item.type === "custom") {
        const candle = item.customCandle;
        if (!candle) {
          throw new CustomError("Custom candle not found", 400);
        }
        orderItems.push({
          type: "custom",
          customCandle: candle._id,
          name: `Custom Candle (${candle.snapshot.vesselName} - ${candle.snapshot.scentName})`,
          quantity: item.quantity,
          price: candle.totalPrice || 0,
          image: "",
          snapshot: {
            vesselName: candle.snapshot.vesselName,
            scentName: candle.snapshot.scentName,
            addOnNames: candle.snapshot.addOnNames || [],
            message: candle.message || ""
          }
        });
      }
    }
  }

  // =========================
  //  PRICING (SERVER-SIDE ONLY)
  // =========================
  let itemsPrice = 0;
  orderItems.forEach(item => {
    itemsPrice += (item.price || 0) * (item.quantity || 1);
  });
  if (isNaN(itemsPrice) || itemsPrice <= 0) {
    throw new CustomError("Failed to calculate total price (invalid or negative amount).", 400);
  }

  const settings = await Settings.findOne({ key: "global" });
  const deliveryCharges = settings?.deliveryCharges ?? 99;
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? 999;

  const shippingPrice = itemsPrice >= freeDeliveryThreshold ? 0 : deliveryCharges;

  // =========================
  //  COUPON VALIDATION
  // =========================
  let discountAmount = 0;
  let couponId = null;

  if (couponCode) {
    try {
      const result = await validateAndCalculateDiscount(
        couponCode,
        itemsPrice,
        user._id.toString(),
        user.couponUsage || []
      );
      discountAmount = result.discountAmount;
      couponId = result.coupon._id;
    } catch (err) {
      throw new CustomError(err.message || "Invalid coupon code", err.status || 400);
    }
  }

  // Final total: items - discount + shipping (never below ₹0)
  const totalAmount = Math.max(0, Math.round(itemsPrice - discountAmount + shippingPrice));

  // =========================
  //  COD SERVICEABILITY CHECK
  // =========================
  if (paymentMethod === "cod") {
    const { codAvailable } = await checkServiceability({ delivery_postcode: pincode, weight: 0.5, cod: 1 });
    if (!codAvailable) {
      throw new CustomError("Cash on Delivery is not available for this pincode. Please select a Prepaid payment method.", 400);
    }
  }

  // =========================
  //  CREATE ORDER
  // =========================
  const order = await Order.create({
    user: user._id,
    orderItems,
    shippingAddress: {
      firstName,
      lastName,
      address,
      city,
      state,
      pincode,
      phone
    },
    itemsPrice,
    shippingPrice,
    discount: discountAmount,
    couponApplied: couponId,
    discountAmount,
    couponProcessed: false,
    totalAmount,
    paymentMethod,
    paymentStatus: "pending",
    orderStatus: "processing",
    paidAt: paymentMethod === "cod" ? null : Date.now(),
    statusHistory: [{
      status: "processing"
    }]
  });

  // =========================
  //  FLOW A: RAZORPAY
  // =========================
  if (paymentMethod === "razorpay") {
    if (totalAmount < 1) {
      throw new CustomError("Total amount must be at least ₹1 to use Razorpay.", 400);
    }
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      // Razorpay works in paise
      currency: "INR",
      receipt: `order_${order.orderId}`
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    return res.status(200).json({
      success: true,
      razorpayOrder,
      orderId: order._id,
      customOrderId: order.orderId,
      amount: totalAmount
    });
  }

  // =========================
  //  FLOW B: CASH ON DELIVERY
  // =========================
  if (paymentMethod === "cod") {
    // Awaiting the promise ensures we catch any SMS failures without crashing the order
    sendSMS(user.phoneNumber, config.msg91.orderConfirmTemplateId, {
      NAME: user.firstName || "Customer",
      ORDER_ID: order.orderId,
      AMOUNT: String(order.totalAmount),
      URL: `${config.url.frontend}/account/orders/${order.orderId}`
    }).catch(err => console.error("Failed to send COD SMS:", err.message));

    // Send order confirmation email
    sendOrderConfirmationEmail(user.email, {
      ...order.toObject(),
      user: { firstName: user.firstName }
    }).catch(err => console.error("Failed to send COD Email:", err.message));

    // =========================
    //  UPDATE STOCK
    // =========================
    const customization = await CandleCustomization.findOne();
    for (let item of order.orderItems) {
      // SIMPLE
      if (item.type === "simpleCandle" || item.type === "simpleRaw") {
        const prod = await Product.findById(item.product);
        if (prod) {
          prod.stock -= item.quantity;
          prod.totalSold = (prod.totalSold || 0) + item.quantity;
          await prod.save();
        }
      }

      // CUSTOM
      if (item.type === "custom") {
        const candle = await CustomizedCandle.findById(item.customCandle);
        if (candle && customization) {
          const reduceStock = (stepType, optionId) => {
            if (!optionId) return;
            const step = customization.steps.find(s => s.type === stepType);
            if (step) {
              const opt = step.options.find(i => i._id.toString() === optionId.toString());
              if (opt && opt.stock >= item.quantity) {
                opt.stock -= item.quantity;
              }
            }
          };
          reduceStock("vessel", candle.vessel);
          reduceStock("scent", candle.scent);
          if (candle.addOns && candle.addOns.length > 0) {
            candle.addOns.forEach(id => reduceStock("addOn", id));
          }
        }
      }
    }
    if (customization) {
      // Signal Mongoose that the nested array changed before saving
      customization.markModified("steps");
      await customization.save();
    }

    // =========================
    //  PER-USER COUPON CONSUMPTION (COD)
    //  Uses couponProcessed guard to prevent double-increment
    // =========================
    if (couponId && !order.couponProcessed) {
      // Upsert into user.couponUsage: increment count if entry exists, push if not
      const userDoc = await User.findById(user._id);
      const existingEntry = userDoc.couponUsage.find(
        (e) => e.couponId.toString() === couponId.toString()
      );
      if (existingEntry) {
        existingEntry.count += 1;
      } else {
        userDoc.couponUsage.push({ couponId, count: 1 });
      }
      await userDoc.save();

      // Mark order as processed
      order.couponProcessed = true;
      await order.save();
    }

    // =========================
    //  CLEAR CART
    // =========================
    user.cart = [];
    await user.save();
  }
  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order
  });
};
