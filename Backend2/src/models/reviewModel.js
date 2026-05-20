import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "published"],
        default: "pending"
    },

    name: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true
    }

}, { timestamps: true });
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model("Review", reviewSchema);