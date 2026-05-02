import {Order} from "../models/orderModel.js";
import { sendSMS } from "../services/otp_services.js";
import { config } from "../config/index.js";

export const getAllOrdersAdmin = async (req, res) => {
    try {
        let { page = 1, limit = 10, status } = req.query;

        page = Number(page);
        limit = Number(limit);

        const query = {};

        //  Apply filter only if valid
        if (status && status.trim() !== "") {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalOrders = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            filterApplied: !!query.orderStatus, // optional
            totalOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // 👉 FIX: Added .populate("user") so we can get their phone number and name!
        const order = await Order.findById(req.params.id).populate("user");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.orderStatus = status;

        // Auto update dates
        if (status === "shipped") {
            order.shippedAt = Date.now();
        }

        if (status === "delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save();

        // =========================
        //  SEND MSG91 SMS NOTIFICATION
        // =========================
        if (order.user && order.user.phoneNumber) {
            // We use a short, clean version of the Order ID for the text message
            const shortOrderId = order._id.toString().slice(-6).toUpperCase();

            // Calling our new MSG91 Flow API function
            await sendSMS(
                order.user.phoneNumber,
                config.msg91.orderStatusTemplateId, // Make sure to add this to your config!
                {
                    NAME: order.user.firstName || "Customer",
                    ORDER_ID: shortOrderId,
                    STATUS: status.toUpperCase() // e.g., "SHIPPED", "DELIVERED"
                }
            );
        }

        res.status(200).json({
            success: true,
            message: "Order status updated",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};