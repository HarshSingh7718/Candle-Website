import { CustomError } from "../middleware/errorHandler.js";
import axios from "axios";
import mongoose from "mongoose";
import { Order } from "../models/orderModel.js";
import { getShiprocketToken } from "../services/shipRocketService.js";
import { Product } from "../models/productModels.js";
import Review from "../models/reviewModel.js";
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({
    user: req.user._id
  }).sort({
    createdAt: -1
  });
  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
};

//we can track also by using order

export const getSingleOrder = async (req, res) => {
  // 👉 1. Backward-compatible lookup: orderId first, then _id
  const searchValue = req.params.id;
  const order = await Order.findOne(
    mongoose.Types.ObjectId.isValid(searchValue)
      ? { $or: [{ orderId: searchValue }, { _id: searchValue }] }
      : { orderId: searchValue }
  ).populate("orderItems.product", "name slug images").populate("user", "name email").lean();

  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  // =========================
  //  SECURITY CHECK
  // =========================
  const isOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user && req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new CustomError("Unauthorized access", 403);
  }

  // =========================
  //  INJECT USER REVIEWS
  // =========================
  // Extract IDs only for standard products (skip custom candles)
  const productIds = order.orderItems.filter(item => item.product).map(item => item.product._id);
  if (productIds.length > 0) {
    // Fetch reviews made by this user for these specific products
    const existingReviews = await Review.find({
      user: order.user._id,
      product: {
        $in: productIds
      }
    }).lean();

    // Attach the review data directly to the order items
    order.orderItems.forEach(item => {
      if (item.product) {
        const review = existingReviews.find(r => r.product.toString() === item.product._id.toString());
        item.userReview = review || null;
      }
    });
  }

  // =========================
  //  DEFAULT TRACKING (ADMIN)
  // =========================
  let tracking = {
    source: "admin",
    status: order.orderStatus,
    timeline: order.statusHistory || []
  };

  // =========================
  //  SHIPROCKET TRACKING
  // =========================
  if (order.awbCode) {
    const token = await getShiprocketToken();
    const trackingRes = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.awbCode}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = trackingRes.data?.tracking_data;
    tracking = {
      source: "shiprocket",
      status: data?.shipment_track?.[0]?.current_status,
      location: data?.shipment_track?.[0]?.current_location,
      timeline: data?.shipment_track_activities || []
    };
  }
  res.status(200).json({
    success: true,
    order,
    tracking
  });
};
export const cancelOrder = async (req, res) => {
    const reason = req.body?.reason;
    const searchValue = req.params.id;
    const order = await Order.findOne({ orderId: searchValue });

    if (!order) {
        throw new CustomError("Order not found", 404);
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new CustomError("Unauthorized", 403);
    }

    if (!["processing"].includes(order.orderStatus)) {
        throw new CustomError(
            "Order cannot be cancelled after it has been confirmed", 
            400
        );
    }

    order.orderStatus = "cancelled";
    order.cancelReason = reason || "Cancelled by user";
    order.cancelledAt = Date.now();
    order.statusHistory.push({ status: "cancelled", date: new Date() });

    await Promise.all(
        order.orderItems.map(item => {
            if (item.type === "simpleCandle" || item.type === "simpleRaw") {
                return Product.findByIdAndUpdate(item.product, {
                    $inc: { totalSold: -item.quantity, stock: item.quantity }
                });
            }
            return Promise.resolve();
        })
    );

    await order.save();

    res.status(200).json({
        success: true,
        message: "Order cancelled successfully"
    });
};

export const addReviewAfterDelivery = async (req, res) => {
  const {
    orderId,
    productId,
    rating,
    comment
  } = req.body;

  // 1. Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  // 2. Check order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    throw new CustomError("Not authorized", 403);
  }

  // 3. Check delivered
  if (order.orderStatus !== "delivered") {
    throw new CustomError("You can review only after delivery", 400);
  }

  // 4. Check product exists in order
  const isProductInOrder = order.orderItems.find(item => item.product.toString() === productId);
  if (!isProductInOrder) {
    throw new CustomError("Product not in this order", 400);
  }

  // 5. Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  // 6. Prevent duplicate review (NEW WAY)
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id
  });
  if (alreadyReviewed) {
    throw new CustomError("Already reviewed", 400);
  }

  // 7. Create review (NEW)
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.firstName,
    rating,
    comment,
    status: "pending" // optional moderation
  });
  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    review
  });
};

// export const trackOrder = async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             });
//         }

//         //   check
//         if (order.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         const currentStatus =
//             order.statusHistory[order.statusHistory.length - 1];

//         // =========================
//         //  COURIER TRACKING LOGIC
//         // =========================
//         let courierTracking = null;

//         if (order.trackingId && order.courierName) {

//             courierTracking = {
//                 trackingId: order.trackingId,
//                 courier: order.courierName,

//                 //  If you integrate real API (Shiprocket/Delhivery)
//                 // replace below with real data
//                 status: currentStatus.status,
//                 estimatedDelivery: new Date(
//                     new Date(order.createdAt).setDate(
//                         new Date(order.createdAt).getDate() + 5
//                     )
//                 ),

//                 trackingUrl: `https://track.example.com/${order.trackingId}`
//             };
//         }

//         res.status(200).json({
//             success: true,

//             //  BASIC ORDER INFO
//             orderId: order._id,
//             paymentStatus: order.paymentStatus,

//             //  CURRENT STATUS
//             currentStatus,

//             //  FULL TIMELINE
//             timeline: order.statusHistory,

//             //  COURIER DETAILS (only if shipped)
//             courierTracking
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };