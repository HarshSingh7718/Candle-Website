import { CustomError } from "../middleware/errorHandler.js";
import { Order } from "../models/orderModel.js";
import { sendSMS } from "../services/otp_services.js";
import { config } from "../config/index.js";
import { createShiprocketOrder } from "../services/shipRocketService.js";

export const getSingleOrderAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "firstName lastName phoneNumber");

  if (!order) {
    throw new CustomError("Order not found", 404);
  }
  res.status(200).json({
    success: true,
    order
  });
};

export const getAllOrdersAdmin = async (req, res) => {
  let {
    page = 1,
    limit = 10,
    status
  } = req.query;
  page = Number(page);
  limit = Number(limit);
  const query = {};

  //  Apply filter only if valid
  if (status && status.trim() !== "") {
    query.orderStatus = status;
  }
  const orders = await Order.find(query).populate("user", "firstName lastName phoneNumber").sort({
    createdAt: -1
  }).skip((page - 1) * limit).limit(limit);
  const totalOrders = await Order.countDocuments(query);
  res.status(200).json({
    success: true,
    filterApplied: !!query.orderStatus,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    orders
  });
};

export const updateOrderStatus = async (req, res) => {
  const {
    status,
    packaging,
    weight
  } = req.body;
  const order = await Order.findById(req.params.id).populate("user");
  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  // 1. Always save packaging and weight if provided
  if (packaging) order.packaging = packaging.toLowerCase();
  if (weight !== undefined) order.weight = Number(weight);

  // 2. Update the main status
  if (status) {
    order.orderStatus = status;

    // Push to statusHistory
    order.statusHistory.push({ status, date: new Date() });

    // Auto update dates
    if (status === "shipped") {
      order.shippedAt = Date.now();
    }
    if (status === "out_for_delivery") {
      order.outForDeliveryAt = Date.now();
    }
    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }
    if (status === "cancelled") {
      order.cancelledAt = Date.now();
    }
  }

  await order.save();

  // =========================
  //  SHIPROCKET: Auto-create order when status → "packaged"
  // =========================
  let shiprocketData = null;
  if (status === "packaged") {
    if (!order.packaging || !order.weight) {
      throw new CustomError("Packaging size and weight are required to pack an order", 400);
    }

    shiprocketData = await createShiprocketOrder(order);

    if (shiprocketData) {
      order.shiprocketOrderId = shiprocketData.order_id;
      order.shiprocketShipmentId = shiprocketData.shipment_id;
      if (shiprocketData.awb_code) order.awbCode = shiprocketData.awb_code;
      if (shiprocketData.courier_name) order.courierName = shiprocketData.courier_name;
      await order.save();
    }
  }

  // =========================
  //  SEND SMS NOTIFICATION
  // =========================
  if (status && order.user && order.user.phoneNumber) {
    const shortOrderId = order._id.toString().slice(-6).toUpperCase();
    await sendSMS(order.user.phoneNumber, config.msg91.orderStatusTemplateId, {
      NAME: order.user.firstName || "Customer",
      ORDER_ID: shortOrderId,
      STATUS: status.toUpperCase()
    }).catch(err => console.error("SMS send failed:", err.message));
  }

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order,
    shiprocket: shiprocketData
  });
};