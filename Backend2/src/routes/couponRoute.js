import express from "express";
import { applyCoupon, getAvailableCoupons } from "../controllers/couponController.js";
import { optionalAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Customer: Fetch available coupons for Mamaearth-style UI
router.get("/available", optionalAuth, getAvailableCoupons);

// Customer: Apply / validate coupon (preview discount)
router.post("/apply", optionalAuth, applyCoupon);

export default router;
