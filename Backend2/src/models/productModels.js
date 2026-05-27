import mongoose from "mongoose";
import slugify from "slugify"; // 👉 Import slugify

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // 👉 ADD SLUG FIELD
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true // Speeds up queries when searching by slug
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],
    type: {
        type: String,
        enum: ["simpleCandle", "simpleRaw"],
        required: true
    },
    scent: {
        type: String,
    },
    vessel: {
        type: String
    },
    size: {
        type: String,
        enum: ["small", "medium", "large"]
    },
    burnTime: {
        type: Number,
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    images: [
        {
            url: String,
            public_id: String
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isDiscounted: {
        type: Boolean,
        default: false
    },
    isLatest: {
        type: Boolean,
        default: false
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    weight: Number,
    material: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

// 👉 AUTO-GENERATE SLUG BEFORE SAVING
productSchema.pre("save", function () {
    if (this.isNew && this.name) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ type: 1, isActive: 1 });
productSchema.index({ isBestSeller: -1, ratings: -1 });
productSchema.index({ createdAt: -1 });

// Note: Ensure `export default` or `export const` matches your current import style
export const Product = mongoose.model("Product", productSchema);