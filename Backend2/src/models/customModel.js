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
    message: String, // Step 4 is now just this string!
    basePrice: Number,
    customizationPrice: Number,
    totalPrice: Number,
    snapshot: { // Added the snapshot definition here for completeness
        vesselName: String,
        scentName: String,
        addOnNames: [String]
    }
}, { timestamps: true });

export const CustomizedCandle = mongoose.model(
    "CustomizedCandle",
    customizedCandleSchema
);