import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // 👉 ADD SLUG FIELD
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    image: {
        url: String,
        public_id: String
    },
    bannerImage: {
        url: String,
        public_id: String
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

// 👉 AUTO-GENERATE SLUG BEFORE SAVING
categorySchema.pre("save", function () {
    if (this.isNew && this.name) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
});

export const Category = mongoose.model("Category", categorySchema);