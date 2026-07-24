import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    desktopImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    mobileImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },

    title: String,
    subtitle: String,
    
    linkedCollection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

export const Banner = mongoose.model("Banner", bannerSchema);