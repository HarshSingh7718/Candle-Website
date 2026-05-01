import {User} from "../models/userModel.js";
import {Product} from "../models/productModels.js";
import {Order} from "../models/orderModel.js";

export const getAdminDashboard = async (req, res) => {
    try {
        //  Basic Counts
        const [totalUsers, totalProducts, totalOrders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments()
        ]);

        //  Total Revenue (only paid)
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        //  Monthly Revenue (for charts)
        const monthlyRevenue = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        //  Orders by Status
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1
                }
            }
        ]);

        //  Recent Orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "firstName email");

        //  Top Selling Products (based on best seller flag + rating)
        const topProducts = await Product.find({ isActive: true })
            .sort({ isBestSeller: -1, ratings: -1 })
            .limit(5)
            .select("name price images ratings");

        //  Recent Reviews
        const recentReviews = await Product.aggregate([
            { $unwind: "$reviews" },
            { $sort: { "reviews.createdAt": -1 } },
            { $limit: 5 },
            {
                $project: {
                    productName: "$name",
                    rating: "$reviews.rating",
                    comment: "$reviews.comment",
                    user: "$reviews.name"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                monthlyRevenue,
                orderStats,
                recentOrders,
                topProducts,
                recentReviews
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};