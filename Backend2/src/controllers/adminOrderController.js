import {Order} from "../models/orderModel.js";

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

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.orderStatus = status;
        await sendSMS(
            user.phoneNumber,
            `Your order ${order._id} is now ${order.orderStatus}`
        );
        //  Auto update dates
        if (status === "shipped") {
            order.shippedAt = Date.now();
        }

        if (status === "delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save();

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