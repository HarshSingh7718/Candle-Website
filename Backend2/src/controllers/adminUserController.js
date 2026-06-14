import { User } from "../models/userModel.js";
import { Order } from "../models/orderModel.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { search, status } = req.query;

        let query = {};

        // Status filter
        if (status === "active") {
            query.isActive = true;
        } else if (status === "blocked") {
            query.isActive = false;
        }

        // Search filter (firstName, lastName, email)
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .select("_id firstName lastName email phoneNumber role isActive isLoggedIn createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // N+1 Query Fix: Get order counts for all fetched users in one go
        const userIds = users.map(u => u._id);
        const orderCounts = await Order.aggregate([
            { $match: { user: { $in: userIds } } },
            { $group: { _id: "$user", count: { $sum: 1 } } }
        ]);

        // Merge order counts
        const usersWithOrders = users.map(user => {
            const countObj = orderCounts.find(oc => oc._id.toString() === user._id.toString());
            return {
                ...user,
                ordersCount: countObj ? countObj.count : 0
            };
        });

        res.status(200).json({
            success: true,
            users: usersWithOrders,
            total: totalUsers,
            page,
            pages: Math.ceil(totalUsers / limit)
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server Error fetching users" });
    }
};

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password -token").lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get 5 recent orders
        const recentOrders = await Order.find({ user: id })
            .select("orderId totalAmount orderStatus paymentStatus createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            success: true,
            user,
            recentOrders
        });

    } catch (error) {
        console.error("Error fetching user detail:", error);
        res.status(500).json({ success: false, message: "Server Error fetching user detail" });
    }
};

// PUT /api/admin/users/:id/block
export const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: "Cannot block an admin account." });
        }

        user.isActive = false;
        user.isLoggedIn = false;
        
        // If your auth system checks the 'token' field, we can clear it to force logout
        user.token = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User blocked successfully",
            user: {
                _id: user._id,
                isActive: user.isActive,
                isLoggedIn: user.isLoggedIn
            }
        });

    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ success: false, message: "Server Error blocking user" });
    }
};
