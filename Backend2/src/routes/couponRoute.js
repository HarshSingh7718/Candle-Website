import express from "express";
import { applyCoupon } from "../controllers/couponController.js";
import { isAuthenticated } from "../middleware/authmiddleware.js";

const router = express.Router();

// Customer: Apply / validate coupon (preview discount)
router.post("/apply", isAuthenticated, applyCoupon);

export default router;
