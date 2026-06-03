import { Coupon } from "../models/couponModel.js";

/**
 * validateAndCalculateDiscount
 *
 * Shared coupon validation logic used by:
 *   1. POST /api/coupons/apply   (preview for the customer)
 *   2. POST /api/order            (server-side re-validation at order time)
 *
 * @param {string}   code            – The coupon code to validate
 * @param {number}   cartTotal       – The server-calculated items subtotal
 * @param {string}   userId          – The current user's _id
 * @param {Array}    couponUsage     – The user's couponUsage array [{ couponId, count }]
 *
 * @returns {{ coupon, discountAmount, finalTotal }}
 * @throws  {Object} { status, message } on validation failure
 */
export const validateAndCalculateDiscount = async (code, cartTotal, userId, couponUsage = []) => {
    // 1. Find the coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
        throw { status: 400, message: "Invalid coupon code" };
    }

    // 2. Active check
    if (!coupon.isActive) {
        throw { status: 400, message: "This coupon is no longer active" };
    }

    // 3. Date range check
    const now = new Date();
    if (now < new Date(coupon.startDate)) {
        throw { status: 400, message: "This coupon is not yet active" };
    }
    if (now > new Date(coupon.endDate)) {
        throw { status: 400, message: "This coupon has expired" };
    }

    // 4. Per-user usage limit check
    const userEntry = couponUsage.find(
        (entry) => entry.couponId.toString() === coupon._id.toString()
    );
    const currentCount = userEntry ? userEntry.count : 0;
    if (currentCount >= coupon.usageLimitPerUser) {
        throw { status: 400, message: "You have already used this coupon the maximum number of times" };
    }

    // 5. Minimum order value check
    if (cartTotal < coupon.minOrderValue) {
        const diff = coupon.minOrderValue - cartTotal;
        throw {
            status: 400,
            message: `Add ₹${Math.ceil(diff)} more to use this coupon`,
        };
    }

    // 6. Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
        discountAmount = (coupon.discountValue / 100) * cartTotal;
        // Enforce the maxDiscountAmount ceiling
        if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    } else {
        // Fixed discount
        discountAmount = coupon.discountValue;
    }

    // 7. Ensure discount never exceeds subtotal (total must never drop below ₹0)
    discountAmount = Math.min(discountAmount, cartTotal);
    discountAmount = Math.round(discountAmount);

    const finalTotal = Math.max(0, cartTotal - discountAmount);

    return { coupon, discountAmount, finalTotal };
};
