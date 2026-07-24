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
export const validateAndCalculateDiscount = async (
    code,
    cartItemsOrSubtotal,
    userId,
    couponUsage = []
) => {
    // 1. Find the coupon (populating applicableCollections)
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() }).populate("applicableCollections", "name slug");
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

    // 5. Calculate full cart subtotal & collection-scoped eligibleSubtotal
    let fullCartSubtotal = 0;
    let eligibleSubtotal = 0;

    const scopedCollectionIds = (coupon.applicableCollections || []).map((c) =>
        (c._id || c).toString()
    );
    const isScoped = scopedCollectionIds.length > 0;

    if (Array.isArray(cartItemsOrSubtotal)) {
        for (const item of cartItemsOrSubtotal) {
            const isCustom = item.type === "custom";
            const prod = isCustom ? item.customCandle : (item.product || item);
            const price = isCustom
                ? (prod?.totalPrice || item.price || 0)
                : (prod?.discountPrice || prod?.price || item.price || 0);
            const qty = item.quantity || 1;
            const itemTotal = price * qty;

            fullCartSubtotal += itemTotal;

            if (isScoped) {
                if (!isCustom && prod) {
                    const prodCategories = Array.isArray(prod.category)
                        ? prod.category.map((cat) => (cat._id || cat).toString())
                        : [(prod.category?._id || prod.category || "").toString()];

                    const matchesScope = prodCategories.some((catId) =>
                        scopedCollectionIds.includes(catId)
                    );

                    if (matchesScope) {
                        eligibleSubtotal += itemTotal;
                    }
                }
            } else {
                eligibleSubtotal += itemTotal;
            }
        }
    } else {
        fullCartSubtotal = Number(cartItemsOrSubtotal) || 0;
        eligibleSubtotal = fullCartSubtotal;
    }

    // 6. Minimum order value check (compared against eligibleSubtotal, NOT full cart subtotal)
    if (isScoped && eligibleSubtotal === 0) {
        throw {
            status: 400,
            message: "This coupon is only valid for selected collections",
        };
    }

    if (eligibleSubtotal < coupon.minOrderValue) {
        const diff = coupon.minOrderValue - eligibleSubtotal;
        throw {
            status: 400,
            message: `Add ₹${Math.ceil(diff)} more from eligible items to use this coupon`,
        };
    }

    // 7. Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
        discountAmount = (coupon.discountValue / 100) * eligibleSubtotal;
        if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    } else {
        // Fixed discount: capped at eligibleSubtotal so flat discount never exceeds eligible items value
        discountAmount = Math.min(coupon.discountValue, eligibleSubtotal);
    }

    discountAmount = Math.min(discountAmount, eligibleSubtotal);
    discountAmount = Math.round(discountAmount);

    const finalTotal = Math.max(0, fullCartSubtotal - discountAmount);

    return { coupon, eligibleSubtotal, discountAmount, finalTotal, fullCartSubtotal };
};
