import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    image: {
        url: String,
        public_id: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const stepSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true   // e.g. "Select Vessel"
    },
    type: {
        type: String,
        required: true,  // e.g. "vessel", "scent"
        unique: true
    },
    stepNumber: {
        type: Number,
        required: true   // 1,2,3,4
    },
    options: [optionSchema]
});

const candleCustomizationSchema = new mongoose.Schema({
    basePrice: {
        type: Number,
        required: true
    },
    steps: [stepSchema]
}, { timestamps: true });

export const CandleCustomization = mongoose.model(
    "CandleCustomization",
    candleCustomizationSchema
);