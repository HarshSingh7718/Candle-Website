import {Order} from "../models/orderModel.js";
import { sendSMS } from "../services/otp_services.js";
import { config } from "../config/index.js";

export const getSingleOrderAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "firstName lastName phoneNumber"); // Populate user details

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

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
            .populate("user", "firstName lastName phoneNumber")
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
        const { status, packaging, weight } = req.body;

        const order = await Order.findById(req.params.id).populate("user");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // 1. Update the main status
        if (status) {
            order.orderStatus = status;
        }

        // 👉 2. FLEXIBLE LOGIC: Always save packaging and weight if the admin provides them!
        if (packaging) order.packaging = packaging.toLowerCase();
        if (weight !== undefined) order.weight = Number(weight);

        // 3. Auto update dates
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
        // Only send SMS if the status actually changed
        if (status && order.user && order.user.phoneNumber) {
            const shortOrderId = order._id.toString().slice(-6).toUpperCase();

            await sendSMS(
                order.user.phoneNumber,
                config.msg91.orderStatusTemplateId,
                {
                    NAME: order.user.firstName || "Customer",
                    ORDER_ID: shortOrderId,
                    STATUS: status.toUpperCase()
                }
            );
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};