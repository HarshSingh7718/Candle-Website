import { CustomError } from "../middleware/errorHandler.js";
import { Order } from "../models/orderModel.js";
import { config } from "../config/index.js";
import { createShiprocketOrder, checkServiceability } from "../services/shipRocketService.js";
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

export const createManualOrder = async (req, res) => {
  const {
    customer,
    items,
    paymentStatus, // "Paid" or "COD"
    shippingPrice = 0,
    discountAmount = 0,
    packaging = "medium",
    weight = 0.5,
    forceCreate = false,
    adminNotes = ""
  } = req.body;

  // 1. Validation
  const hasName = (customer?.firstName && customer.firstName.trim()) || (customer?.name && customer.name.trim());
  if (!customer || !hasName || !customer.phone || !customer.address || !customer.city || !customer.state || !customer.pincode) {
    throw new CustomError("All recipient details (first name, phone, address, city, state, pincode) are required", 400);
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new CustomError("Please select at least one product", 400);
  }
  if (paymentStatus !== "Paid" && paymentStatus !== "COD") {
    throw new CustomError("Payment status must be 'Paid' or 'COD'", 400);
  }

  // 2. Server-side admin derivation (NEVER accept createdByAdmin from body)
  const createdByAdmin = req.user._id;

  let firstName = customer.firstName ? customer.firstName.trim() : "";
  let lastName = customer.lastName ? customer.lastName.trim() : "";

  // Backward compatibility fallback if single full name was sent
  if (!firstName && customer.name) {
    const nameTrimmed = customer.name.trim();
    const nameParts = nameTrimmed.split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ') || "";
  }
  const customerEmail = customer.email ? customer.email.trim() : "";

  // 3. Atomic stock deduction & line item creation
  const { Product } = await import("../models/productModels.js");
  const orderItems = [];
  const deductedItems = [];

  try {
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      if (qty <= 0) continue;

      // STEP 2 item 1: Stock deduction uses an atomic conditional update
      // (findOneAndUpdate with stock >= quantity in the filter)
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: qty } },
        { $inc: { stock: -qty, totalSold: qty } },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback any products already deducted in this transaction
        for (const d of deductedItems) {
          await Product.findByIdAndUpdate(d.productId, {
            $inc: { stock: d.quantity, totalSold: -d.quantity }
          });
        }
        const prodInfo = await Product.findById(item.productId);
        const name = prodInfo?.name || "Product";
        const available = prodInfo?.stock || 0;
        throw new CustomError(`Insufficient stock for "${name}". Required: ${qty}, Available: ${available}`, 400);
      }

      deductedItems.push({ productId: item.productId, quantity: qty });

      const catalogPrice = updatedProduct.discountPrice > 0 ? updatedProduct.discountPrice : updatedProduct.price;
      const overridePrice = (item.overridePrice !== undefined && item.overridePrice !== "" && !isNaN(Number(item.overridePrice)))
        ? Number(item.overridePrice)
        : catalogPrice;
      const linePrice = overridePrice;

      orderItems.push({
        type: updatedProduct.type || "simpleCandle",
        product: updatedProduct._id,
        name: updatedProduct.name,
        quantity: qty,
        catalogPrice,
        overridePrice,
        price: linePrice,
        image: updatedProduct.images?.[0]?.url || "",
        slug: updatedProduct.slug
      });
    }
  } catch (err) {
    // If any error in stock deduction loop
    if (err instanceof CustomError) throw err;
    // Otherwise rollback and rethrow
    for (const d of deductedItems) {
      await Product.findByIdAndUpdate(d.productId, {
        $inc: { stock: d.quantity, totalSold: -d.quantity }
      });
    }
    throw err;
  }

  // 4. Calculate prices
  const itemsPrice = orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const shipPrice = Math.max(0, Number(shippingPrice) || 0);
  const discAmount = Math.max(0, Number(discountAmount) || 0);
  const totalAmount = Math.max(0, Math.round(itemsPrice - discAmount + shipPrice));

  // NOTE: Do NOT apply the storefront's ₹5,000 COD fraud-prevention cap here — this is a deliberate, explicit exception for admin-created orders.

  // 5. Shiprocket Serviceability Check
  if (forceCreate) {
    console.log(`[MANUAL ORDER] Force Create enabled by admin for pincode ${customer.pincode}. Bypassing Shiprocket serviceability check.`);
  } else {
    const isCod = paymentStatus === "COD" ? 1 : 0;
    const serviceability = await checkServiceability({
      delivery_postcode: customer.pincode,
      weight: Number(weight) || 0.5,
      cod: isCod
    });

    if (!serviceability.apiError) {
      if (!serviceability.deliverable) {
        // Rollback stock
        for (const d of deductedItems) {
          await Product.findByIdAndUpdate(d.productId, {
            $inc: { stock: d.quantity, totalSold: -d.quantity }
          });
        }
        throw new CustomError(`We currently cannot ship to pincode ${customer.pincode}. Enable "Force Create" to bypass.`, 400);
      }
      if (paymentStatus === "COD" && !serviceability.codAvailable) {
        // Rollback stock
        for (const d of deductedItems) {
          await Product.findByIdAndUpdate(d.productId, {
            $inc: { stock: d.quantity, totalSold: -d.quantity }
          });
        }
        throw new CustomError(`Cash on Delivery is not available for pincode ${customer.pincode}. Enable "Force Create" to bypass.`, 400);
      }
    } else {
      console.warn(`[MANUAL ORDER FAIL-OPEN] Shiprocket API error/timeout for pincode ${customer.pincode}. Allowing manual order to proceed.`);
    }
  }

  // 6. Collision-proof Order ID generation
  const _id = new mongoose.Types.ObjectId();
  const orderId = `NC${_id.toString().slice(-8).toUpperCase()}`;

  // 7. Create Order document
  const newOrder = await Order.create({
    _id,
    orderId,
    user: null, // No user account (guest shape)
    createdByAdmin,
    isManualOrder: true,
    adminNotes: adminNotes || "",
    orderItems,
    shippingAddress: {
      firstName,
      lastName,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      phone: customer.phone,
      email: customerEmail
    },
    itemsPrice,
    shippingPrice: shipPrice,
    discount: discAmount,
    discountAmount: discAmount,
    totalAmount,
    paymentMethod: paymentStatus === "Paid" ? "other" : "cod",
    paymentStatus: paymentStatus === "Paid" ? "paid" : "pending",
    orderStatus: "processing",
    paidAt: paymentStatus === "Paid" ? new Date() : null,
    packaging: (packaging || "medium").toLowerCase(),
    weight: Number(weight) || 0.5,
    statusHistory: [{ status: "processing", date: new Date() }]
  });

  // 8. Send confirmation email if email provided
  if (customerEmail) {
    const { sendOrderConfirmationEmail } = await import("../utils/sendEmail.js");
    try {
      await sendOrderConfirmationEmail(customerEmail, newOrder);
    } catch (emailErr) {
      console.error("Manual order email delivery error (gracefully skipped):", emailErr.message);
    }
  }

  res.status(201).json({
    success: true,
    message: "Manual order created successfully",
    order: newOrder
  });
};
