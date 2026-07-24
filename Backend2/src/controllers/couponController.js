import { Coupon } from "../models/couponModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";
import { CustomError } from "../middleware/errorHandler.js";
import { validateAndCalculateDiscount } from "../utils/couponHelper.js";

// ============================================================
//  CUSTOMER: Get available coupons for current user
// ============================================================
//  CUSTOMER: Get available coupons for current user / guest
//  GET /api/coupons/available
// ============================================================
export const getAvailableCoupons = async (req, res) => {
    const now = new Date();
    const querySubtotal = Number(req.query.subtotal) || 0;

    // 1. Fetch all active coupons within valid date range
    const allCoupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    }).populate("applicableCollections", "name slug").sort({ createdAt: -1 });

    // 2. Fetch user's couponUsage array and cart items if logged in
    let couponUsage = [];
    let userCartItems = [];
    let cartTotal = querySubtotal;

    if (req.user) {
        const user = await User.findById(req.user._id)
            .select("couponUsage cart")
            .populate("cart.product")
            .populate("cart.customCandle");
        couponUsage = user?.couponUsage || [];
        userCartItems = user?.cart || [];

        if (userCartItems.length > 0 && querySubtotal === 0) {
            cartTotal = 0;
            for (const item of userCartItems) {
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
        }
    }

    // 3. Evaluate discount & eligibility server-side for each coupon
    const evaluated = allCoupons.map((c) => {
        const entry = couponUsage.find(
            (u) => u.couponId.toString() === c._id.toString()
        );
        const currentCount = entry ? entry.count : 0;
        const usageExhausted = currentCount >= c.usageLimitPerUser;

        const scopedCollectionIds = (c.applicableCollections || []).map((col) => (col._id || col).toString());
        const isScoped = scopedCollectionIds.length > 0;

        let eligibleSubtotal = 0;
        if (isScoped && userCartItems.length > 0) {
            for (const item of userCartItems) {
                if (item.type !== "custom" && item.product) {
                    const prodCats = Array.isArray(item.product.category)
                        ? item.product.category.map((cat) => (cat._id || cat).toString())
                        : [(item.product.category?._id || item.product.category || "").toString()];
                    if (prodCats.some((catId) => scopedCollectionIds.includes(catId))) {
                        eligibleSubtotal += (item.product.discountPrice || item.product.price || 0) * (item.quantity || 1);
                    }
                }
            }
        } else {
            eligibleSubtotal = cartTotal;
        }

        let discountAmount = 0;
        let isEligible = !usageExhausted;
        let reason = "";

        if (usageExhausted) {
            isEligible = false;
            reason = "Usage limit reached";
        } else if (isScoped && eligibleSubtotal === 0) {
            isEligible = false;
            reason = "Only valid for selected collections";
        } else if (eligibleSubtotal < c.minOrderValue) {
            isEligible = false;
            const diff = Math.ceil(c.minOrderValue - eligibleSubtotal);
            reason = `Add ₹${diff} more from eligible items to unlock`;
        } else {
            if (c.discountType === "percentage") {
                discountAmount = (c.discountValue / 100) * eligibleSubtotal;
                if (c.maxDiscountAmount && discountAmount > c.maxDiscountAmount) {
                    discountAmount = c.maxDiscountAmount;
                }
            } else {
                discountAmount = Math.min(c.discountValue, eligibleSubtotal);
            }
            discountAmount = Math.min(discountAmount, eligibleSubtotal);
            discountAmount = Math.round(discountAmount);
        }

        return {
            _id: c._id,
            code: c.code,
            title: c.title,
            description: c.description,
            discountType: c.discountType,
            discountValue: c.discountValue,
            maxDiscountAmount: c.maxDiscountAmount,
            minOrderValue: c.minOrderValue,
            applicableCollections: c.applicableCollections,
            eligibleSubtotal,
            discountAmount,
            isEligible,
            reason,
        };
    });

    // 4. Sort: Eligible coupons first (highest discount first), then ineligible
    evaluated.sort((a, b) => {
        if (a.isEligible && !b.isEligible) return -1;
        if (!a.isEligible && b.isEligible) return 1;
        if (a.isEligible && b.isEligible) return b.discountAmount - a.discountAmount;
        return 0;
    });

    // 5. Mark the single best coupon (highest discount amount among eligible)
    let foundBest = false;
    evaluated.forEach((c) => {
        if (c.isEligible && !foundBest && c.discountAmount > 0) {
            c.isBest = true;
            foundBest = true;
        } else {
            c.isBest = false;
        }
    });

    res.status(200).json({
        success: true,
        coupons: evaluated,
    });
};

// ============================================================
//  CUSTOMER: Apply coupon (preview discount before checkout)
//  POST /api/coupons/apply
// ============================================================
export const applyCoupon = async (req, res) => {
    const { code, subtotal, items } = req.body;
    if (!code) {
        throw new CustomError("Please provide a coupon code", 400);
    }

    let cartItems = Array.isArray(items) ? items : [];
    let couponUsage = [];

    if (req.user) {
        const user = await User.findById(req.user._id)
            .populate("cart.product")
            .populate("cart.customCandle");

        if (user && user.cart.length > 0) {
            cartItems = user.cart;
        }
        couponUsage = user?.couponUsage || [];
    }

    // For guest sessions, populate category references if item.productId is present
    if (!req.user && Array.isArray(cartItems) && cartItems.length > 0) {
        const prodIds = cartItems
            .map((i) => (i.product?._id || i.productId || i._id))
            .filter(Boolean);
        if (prodIds.length > 0) {
            const products = await Product.find({ _id: { $in: prodIds } }).select("price discountPrice category");
            const prodMap = new Map(products.map((p) => [p._id.toString(), p]));
            cartItems = cartItems.map((i) => {
                const targetId = (i.product?._id || i.productId || i._id || "").toString();
                const p = prodMap.get(targetId);
                return p ? { ...i, product: p } : i;
            });
        }
    }

    try {
        const userId = req.user ? req.user._id.toString() : "guest";
        const { coupon, eligibleSubtotal, discountAmount, finalTotal, fullCartSubtotal } = await validateAndCalculateDiscount(
            code,
            cartItems.length > 0 ? cartItems : (Number(subtotal) || 0),
            userId,
            couponUsage
        );

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully!",
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                title: coupon.title,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscountAmount: coupon.maxDiscountAmount,
                applicableCollections: coupon.applicableCollections,
            },
            eligibleSubtotal,
            cartTotal: fullCartSubtotal,
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
        title,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        applicableCollections,
        startDate,
        endDate,
        usageLimitPerUser,
        isActive,
    } = req.body;

    if (!code || !title || !discountType || discountValue === undefined || !startDate || !endDate) {
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
        title,
        description: description || "",
        discountType,
        discountValue,
        maxDiscountAmount: discountType === "percentage" ? maxDiscountAmount : null,
        minOrderValue: minOrderValue || 0,
        applicableCollections: Array.isArray(applicableCollections) ? applicableCollections : [],
        startDate,
        endDate,
        usageLimitPerUser: usageLimitPerUser || 1,
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
    const coupons = await Coupon.find().populate("applicableCollections", "name slug").sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
};

// ============================================================
//  ADMIN: Get single coupon
//  GET /api/admin/coupons/:id
// ============================================================
export const getSingleCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id).populate("applicableCollections", "name slug");
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
        title,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        applicableCollections,
        startDate,
        endDate,
        usageLimitPerUser,
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
    if (title !== undefined) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = (discountType || coupon.discountType) === "percentage" ? maxDiscountAmount : null;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
    if (applicableCollections !== undefined) coupon.applicableCollections = Array.isArray(applicableCollections) ? applicableCollections : [];
    if (startDate !== undefined) coupon.startDate = startDate;
    if (endDate !== undefined) coupon.endDate = endDate;
    if (usageLimitPerUser !== undefined) coupon.usageLimitPerUser = usageLimitPerUser;
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
