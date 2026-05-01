import mongoose from "mongoose";

const customizedCandleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    scent: {
        type: mongoose.Schema.Types.ObjectId
    },
    vessel: {
        type: mongoose.Schema.Types.ObjectId
    },
    label: {
        type: mongoose.Schema.Types.ObjectId
    },
    addOns: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    selections: [
        {
            stepNumber: Number,
            optionId: mongoose.Schema.Types.ObjectId
        }
    ],
    type: {
        type: String,
        default: "custom"
    },
    message: String,
    basePrice: Number,
    customizationPrice: Number,
    totalPrice: Number
}, { timestamps: true });

export const CustomizedCandle = mongoose.model(
    "CustomizedCandle",
    customizedCandleSchema
);


