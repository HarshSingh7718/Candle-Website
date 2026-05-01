import express from "express";
import { getMyOrders, getSingleOrder, addReviewAfterDelivery } from "../controllers/userOrderController.js";
import { createOrder } from "../controllers/orderController.js";
import { isAuthenticated, isAdmin } from "../middleware/authmiddleware.js";


const router = express.Router();


// Create order
router.post("/order", isAuthenticated, createOrder);

// Get logged-in user orders
router.get("/orders/my", isAuthenticated, getMyOrders);

// Get single order
router.get("/order/:id", isAuthenticated, getSingleOrder);

// Track order
// router.get("/track-order/:orderId", isAuthenticated, trackOrder);

// Add review after delivery
router.post("/review", isAuthenticated, addReviewAfterDelivery);

// (Optional) Cancel order
// router.put("/order/:id/cancel", isAuthenticated, cancelOrder);
export default router;