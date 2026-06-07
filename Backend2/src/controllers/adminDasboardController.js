import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { Order } from "../models/orderModel.js";
import Review from "../models/reviewModel.js";
export const getAdminDashboard = async (req, res) => {
  //  Basic Counts
  const [totalUsers, totalProducts, totalOrders] = await Promise.all([User.countDocuments(), Product.countDocuments({
    isActive: true
  }), Order.countDocuments()]);

  //  Total Revenue (only paid)
  const revenueData = await Order.aggregate([{
    $match: {
      paymentStatus: "paid"
    }
  }, {
    $group: {
      _id: null,
      totalRevenue: {
        $sum: "$totalAmount"
      }
    }
  }]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  //  Daily Revenue for the Selected Month (for charts)
  const currentDate = new Date();
  const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();
  const month = req.query.month ? parseInt(req.query.month) - 1 : currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const dailyRevenue = await Order.aggregate([{
    $match: {
      paymentStatus: "paid",
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }
  }, {
    $group: {
      _id: {
        $dayOfMonth: "$createdAt"
      },
      revenue: {
        $sum: "$totalAmount"
      }
    }
  }, {
    $sort: {
      "_id": 1
    }
  }]);

  //  Orders by Status
  const orderStats = await Order.aggregate([{
    $group: {
      _id: "$orderStatus",
      count: {
        $sum: 1
      }
    }
  }, {
    $project: {
      _id: 0,
      status: "$_id",
      count: 1
    }
  }]);

  //  Recent Orders
  const recentOrders = await Order.find().sort({
    createdAt: -1
  }).limit(5).populate("user", "firstName email");

  //  Top Selling Products (based on best seller flag + rating)
  const topProducts = await Product.find({
    isActive: true
  }).sort({
    isBestSeller: -1,
    ratings: -1
  }).limit(5).select("name price images ratings");

  //  Recent Reviews
  const recentReviewsData = await Review.find().sort({
    createdAt: -1
  }).limit(5).populate("product", "name");
  const recentReviews = recentReviewsData.map(r => ({
    productName: r.product?.name || "Unknown Product",
    rating: r.rating,
    comment: r.comment,
    user: r.name
  }));
  res.status(200).json({
    success: true,
    dashboard: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyRevenue: dailyRevenue, // Keep the key as monthlyRevenue for frontend compatibility, but it contains daily data
      orderStats,
      recentOrders,
      topProducts,
      recentReviews
    }
  });
};