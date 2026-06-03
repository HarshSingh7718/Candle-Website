import { Coupon } from "../models/couponModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";
import { CustomError } from "../middleware/errorHandler.js";
import { validateAndCalculateDiscount } from "../utils/couponHelper.js";

// ============================================================
//  CUSTOMER: Apply coupon (preview discount before checkout)
//  POST /api/coupons/apply
// ============================================================
export const applyCoupon = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        throw new CustomError("Please provide a coupon code", 400);
    }

    // 1. Fetch user + populated cart to calculate subtotal server-side
    const user = await User.findById(req.user._id)
        .populate("cart.product")
        .populate("cart.customCandle");

    if (!user || user.cart.length === 0) {
        throw new CustomError("Your cart is empty", 400);
    }

    // 2. Server-side cart subtotal — never trust client math
    let cartTotal = 0;
    for (const item of user.cart) {
        if (item.type === "simpleCandle" || item.type === "simpleRaw") {
            const prod = item.product;
            if (prod) {
                cartTotal += (prod.discountPrice || prod.price || 0) * (item.quantity || 1);
            }
        }
        if (item.type === "custom") {
            const candle = item.customCandle;
            if (candle) {
                cartTotal += (candle.totalPrice || 0) * (item.quantity || 1);
            }
        }
    }

    // 3. Validate & calculate using shared helper
    try {
        const { coupon, discountAmount, finalTotal } = await validateAndCalculateDiscount(
            code,
            cartTotal,
            user._id.toString(),
            user.usedCoupons || []
        );

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully!",
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            cartTotal,
            discountAmount,
            finalTotal,
        });
    } catch (err) {
        throw new CustomError(err.message || "Invalid coupon", err.status || 400);
    }
};

// ============================================================
//  ADMIN: Create a new coupon
//  POST /api/admin/coupons
// ============================================================
export const createCoupon = async (req, res) => {
    const {
        code,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        startDate,
        endDate,
        usageLimit,
        isActive,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !startDate || !endDate) {
        throw new CustomError("Please fill all required fields", 400);
    }

    if (new Date(endDate) <= new Date(startDate)) {
        throw new CustomError("End date must be after start date", 400);
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
        throw new CustomError("A coupon with this code already exists", 400);
    }

    const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        maxDiscountAmount: discountType === "percentage" ? maxDiscountAmount : null,
        minOrderValue: minOrderValue || 0,
        startDate,
        endDate,
        usageLimit: usageLimit || null,
        isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon,
    });
};

// ============================================================
//  ADMIN: Get all coupons
//  GET /api/admin/coupons
// ============================================================
export const getAllCoupons = async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
};

// ============================================================
//  ADMIN: Get single coupon
//  GET /api/admin/coupons/:id
// ============================================================
export const getSingleCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new CustomError("Coupon not found", 404);
    }
    res.status(200).json({ success: true, coupon });
};

// ============================================================
//  ADMIN: Update coupon
//  PUT /api/admin/coupons/:id
// ============================================================
export const updateCoupon = async (req, res) => {
    const {
        code,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        startDate,
        endDate,
        usageLimit,
        isActive,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new CustomError("Coupon not found", 404);
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        throw new CustomError("End date must be after start date", 400);
    }

    // Check uniqueness if code is being changed
    if (code && code.toUpperCase().trim() !== coupon.code) {
        const duplicate = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (duplicate) {
            throw new CustomError("A coupon with this code already exists", 400);
        }
    }

    if (code !== undefined) coupon.code = code;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = (discountType || coupon.discountType) === "percentage" ? maxDiscountAmount : null;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
    if (startDate !== undefined) coupon.startDate = startDate;
    if (endDate !== undefined) coupon.endDate = endDate;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        coupon,
    });
};

// ============================================================
//  ADMIN: Toggle coupon active status
//  PATCH /api/admin/coupons/:id/toggle
// ============================================================
export const toggleCouponStatus = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new CustomError("Coupon not found", 404);
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
        success: true,
        message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`,
        coupon,
    });
};

// ============================================================
//  ADMIN: Delete coupon
//  DELETE /api/admin/coupons/:id
// ============================================================
export const deleteCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new CustomError("Coupon not found", 404);
    }

    await coupon.deleteOne();

    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
    });
};
