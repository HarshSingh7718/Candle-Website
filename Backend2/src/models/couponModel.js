import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        // Coupon code — always stored uppercase, trimmed, unique
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },

        // 'percentage' → applies discountValue as a % on item total
        // 'fixed'      → applies discountValue as flat ₹ off
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: [true, "Discount type is required"],
        },

        // The raw discount value (e.g. 20 for 20% or ₹200)
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
            min: [0, "Discount value cannot be negative"],
        },

        // Cap for percentage discounts (e.g. max ₹500 off even if 20% = ₹800)
        // Only relevant when discountType is 'percentage'
        maxDiscountAmount: {
            type: Number,
            default: null,
        },

        // Minimum cart subtotal required to use this coupon
        minOrderValue: {
            type: Number,
            default: 0,
        },

        // Validity window
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
        },

        // Total number of times this coupon can be used (null = unlimited)
        usageLimit: {
            type: Number,
            default: null,
        },

        // How many times it has already been consumed (atomic $inc only)
        usedCount: {
            type: Number,
            default: 0,
        },

        // Master kill-switch for the admin
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
