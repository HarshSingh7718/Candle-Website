import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, default: "user", trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: {
        type: String, unique: true, required: function () {
            return this.authProvider === "local";
        }, sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String, required: function () {
            return this.authProvider === "local";
        }, sparse: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    googleId: { type: String },
    authProvider: {   //important
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    cart: [
        {
            type: {
                type: String,
                enum: ["simpleCandle", "simpleRaw", "custom"],
                required: true,
                default: "simpleCandle"
            },

            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            customCandle: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CustomizedCandle"
            },

            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    token: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    needsPhone: { type: Boolean, default: false },
    // isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    lastOtpSentAt: Date,
    isPhoneVerified: { type: Boolean, default: false },

    addresses: [
        {
            firstName: String,
            lastName: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
            phone: String,
            isDefault: {
                type: Boolean,
                default: true
            }
        }
    ]



},
    { timestamps: true })


export const User = mongoose.model("User", userSchema)