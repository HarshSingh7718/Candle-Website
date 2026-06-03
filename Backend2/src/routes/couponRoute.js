import express from "express";
import { applyCoupon, getAvailableCoupons } from "../controllers/couponController.js";
import { isAuthenticated } from "../middleware/authmiddleware.js";

const router = express.Router();

// Customer: Fetch available coupons for Mamaearth-style UI
router.get("/available", isAuthenticated, getAvailableCoupons);

// Customer: Apply / validate coupon (preview discount)
router.post("/apply", isAuthenticated, applyCoupon);

export default router;
