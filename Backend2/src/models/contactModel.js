import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,

    status: {
        type: String,
        enum: ["pending", "resolved"],
        default: "pending"
    }

}, { timestamps: true });

export const Contact = mongoose.model("Contact", contactSchema);