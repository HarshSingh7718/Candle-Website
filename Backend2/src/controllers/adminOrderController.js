import { CustomError } from "../middleware/errorHandler.js";
import { Order } from "../models/orderModel.js";
import { config } from "../config/index.js";
import { createShiprocketOrder } from "../services/shipRocketService.js";
import mongoose from "mongoose";

export const getSingleOrderAdmin = async (req, res) => {
  const searchValue = req.params.id;
  const order = await Order.findOne(
    mongoose.Types.ObjectId.isValid(searchValue)
      ? { $or: [{ orderId: searchValue }, { _id: searchValue }] }
      : { orderId: searchValue }
  ).populate("user", "firstName lastName phoneNumber");

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
  const searchValue = req.params.id;
  const order = await Order.findOne(
    mongoose.Types.ObjectId.isValid(searchValue)
      ? { $or: [{ orderId: searchValue }, { _id: searchValue }] }
      : { orderId: searchValue }
  ).populate("user", "firstName lastName email phoneNumber");
  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  // 1. Always save packaging and weight if provided
  if (packaging) order.packaging = packaging.toLowerCase();
  if (weight !== undefined) order.weight = Number(weight);

  // 2. Update the main status
  if (status) {
    if ((status === "cancelled" || status === "returned") && 
        order.orderStatus !== "cancelled" && order.orderStatus !== "returned") {
      const { Product } = await import("../models/productModels.js");
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
    }
    
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



  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order,
    shiprocket: shiprocketData
  });
};



export const getAvailableCouriersForOrder = async (req, res) => {

  const searchValue = req.params.id;

  const order = await Order.findOne(

    mongoose.Types.ObjectId.isValid(searchValue)

      ? { $or: [{ orderId: searchValue }, { _id: searchValue }] }

      : { orderId: searchValue }

  );



  if (!order) {

    throw new CustomError("Order not found", 404);

  }



  if (order.orderStatus !== "packaged") {

    throw new CustomError("Couriers can only be fetched for packaged orders", 400);

  }



  if (!order.shiprocketOrderId) {

    throw new CustomError("Shiprocket order not found. Please mark the order as packaged again.", 400);

  }



  // Import locally to avoid circular dependencies if any

  const { getAvailableCouriers } = await import("../services/shipRocketService.js");

  

  const couriers = await getAvailableCouriers(order.shiprocketOrderId);



  res.status(200).json({

    success: true,

    couriers

  });

};



export const shipOrder = async (req, res) => {

  const searchValue = req.params.id;

  const { courierId, pickupDate } = req.body;



  if (!courierId) {

    throw new CustomError("Courier ID is required", 400);

  }



  const order = await Order.findOne(

    mongoose.Types.ObjectId.isValid(searchValue)

      ? { $or: [{ orderId: searchValue }, { _id: searchValue }] }

      : { orderId: searchValue }

  );



  if (!order) {

    throw new CustomError("Order not found", 404);

  }



  if (order.orderStatus !== "packaged") {

    throw new CustomError("Only packaged orders can be shipped", 400);

  }



  if (!order.shiprocketShipmentId) {

    throw new CustomError("Shipment ID not found. Order may not be fully packaged.", 400);

  }



  const { assignAWB, schedulePickup, generateLabel, generateInvoice, generateManifest } = await import("../services/shipRocketService.js");



  // 1. Assign AWB

  const awbRes = await assignAWB(order.shiprocketShipmentId, courierId);

  

  // Update order with AWB info

  if (awbRes && awbRes.response && awbRes.response.data) {

    const awbData = awbRes.response.data;

    order.awbCode = awbData.awb_code;

    order.courierName = awbData.courier_name;

  }



  // 2. Schedule Pickup

  await schedulePickup(order.shiprocketShipmentId, pickupDate);



  // 3. Generate Label

  const labelUrl = await generateLabel(order.shiprocketShipmentId);

  if (labelUrl) order.labelUrl = labelUrl;



  // 4. Generate Invoice

  const invoiceUrl = await generateInvoice(order.shiprocketOrderId);

  if (invoiceUrl) order.invoiceUrl = invoiceUrl;



  // 5. Generate Manifest

  const manifestUrl = await generateManifest(order.shiprocketShipmentId);

  if (manifestUrl) order.manifestUrl = manifestUrl;



  // We do NOT update orderStatus here. The webhook will handle it.

  

  await order.save();



  res.status(200).json({

    success: true,

    message: "Shipping initiated successfully",

    order

  });

};

