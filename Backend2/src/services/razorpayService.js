import Razorpay from "razorpay";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import {Order} from "../models/orderModel.js";
import { CustomizedCandle } from "../models/customModel.js";
import { CandleCustomization } from "../models/optionModel.js";
import { config } from "../config/index.js";
import { createShipment } from "./shipRocketService.js";
import { sendSMS } from "./otp_services.js";

const razorpay = new Razorpay({
    key_id: config.razor.k_id,
    key_secret: config.razor.k_secret
});

// =========================
//  CREATE RAZORPAY ORDER
// =========================
export const createRazorpayOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("cart.product")
            .populate("cart.customCandle");

        if (!user || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let orderItems = [];
        let itemsPrice = 0;

        // =========================
        //  BUILD ORDER ITEMS
        // =========================
        for (let item of user.cart) {

            // SIMPLE
            if (item.type === "simpleCandle" || item.type === "simpleRaw") {
                const prod = item.product;

                const price = prod.discountPrice || prod.price;

                itemsPrice += price * item.quantity;

                orderItems.push({
                    type: prod.type,
                    product: prod._id,
                    name: prod.name,
                    quantity: item.quantity,
                    price,
                    image: prod.images?.[0]?.url || ""
                });
            }

            // CUSTOM
            if (item.type === "custom") {
                const candle = item.customCandle;

                itemsPrice += candle.totalPrice * item.quantity;

                orderItems.push({
                    type: "custom",
                    customCandle: candle._id,
                    name: `Custom Candle`,
                    quantity: item.quantity,
                    price: candle.totalPrice
                });
            }
        }

        const shippingPrice = itemsPrice > 999 ? 0 : 99;
        const taxPrice = itemsPrice * 0.05;

        const totalAmount = Math.round(
            itemsPrice + shippingPrice + taxPrice
        );

        // =========================
        //  CREATE ORDER (PENDING)
        // =========================
        const order = await Order.create({
            user: user._id,
            orderItems,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalAmount,
            paymentMethod: "razorpay",
            paymentStatus: "pending",
            orderStatus: "pending"
        });

        // =========================
        //  CREATE RAZORPAY ORDER
        // =========================
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `order_${order._id}`
        });

        // Save Razorpay Order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.status(200).json({
            success: true,
            razorpayOrder,
            orderId: order._id,
            amount: totalAmount
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
//  VERIFY PAYMENT
// =========================
export const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Prevent duplicate execution
        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Already processed",
                order
            });
        }

        // =========================
        //  VERIFY SIGNATURE
        // =========================
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // =========================
        //  GET USER + CONFIG
        // =========================
        const user = await User.findById(order.user);
        const customization = await CandleCustomization.findOne();

        // =========================
        //  UPDATE STOCK
        // =========================
        for (let item of order.orderItems) {

            // SIMPLE
            if (item.type === "simpleCandle" || item.type === "simpleRaw") {
                const prod = await Product.findById(item.product);
                if (prod) {
                    prod.stock -= item.quantity;
                    await prod.save();
                }
            }

            // CUSTOM
            if (item.type === "custom") {
                const candle = await CustomizedCandle.findById(item.customCandle);

                if (candle && customization) {
                    const reduce = (arr, id) => {
                        const opt = arr.find(i => i._id.toString() === id.toString());
                        if (opt) opt.stock -= item.quantity;
                    };

                    reduce(customization.scents, candle.scent);

                    candle.addOns.forEach(id => {
                        reduce(customization.addOns, id);
                    });
                }
            }
        }

        if (customization) {
            await customization.save();
        }

        // =========================
        //  UPDATE ORDER
        // =========================
        order.paymentStatus = "paid";
        order.paymentId = razorpay_payment_id;
        order.razorpayOrderId = razorpay_order_id;
        order.razorpaySignature = razorpay_signature;
        order.paidAt = Date.now();

        order.orderStatus = "confirmed";
        order.statusHistory.push({ status: "confirmed" });

        await order.save();

        // =========================
        //  SEND SMS
        // =========================
        if (user?.phoneNumber) {
            await sendSMS(
                user.phoneNumber,
                `Your order ${order._id} is confirmed. Payment received ₹${order.totalAmount}`
            );
        }

        // =========================
        //  CLEAR CART
        // =========================
        user.cart = [];
        await user.save();

        // =========================
        //  CREATE SHIPMENT
        // =========================
        const shipment = await createShipment(order);

        if (shipment?.shipment_id) {
            order.trackingId = shipment.shipment_id;
            order.awbCode = shipment.awb_code;
            order.courierName = shipment.courier_name;
            order.trackingUrl = shipment.tracking_url;
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: "Payment verified & order confirmed",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};