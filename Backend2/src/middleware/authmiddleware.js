import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import 'dotenv/config'
import { config } from "../config/index.js";
import { sendOtp } from "../services/otp_services.js";
import { clearTokenCookie, clearAdminTokenCookie } from "../utils/token.js";
import { checkOtpRateLimit } from "../utils/otpRateLimiter.js";

// Used on all frontend/user routes — reads userToken or adminToken
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.userToken || req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login to access this resource"
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        if (user.isActive === false) {
            clearTokenCookie(res);
            return res.status(403).json({ success: false, message: "Access revoked by admin" });
        }
        
        if (!user.isLoggedIn) {
            clearTokenCookie(res);
            return res.status(401).json({ success: false, message: "Session expired or logged out" });
        }

        req.id = user._id;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// Used on all /api/admin/* routes — only reads adminToken
export const isAdminAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login as admin to access this resource"
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        if (user.isActive === false) {
            clearAdminTokenCookie(res);
            return res.status(403).json({ success: false, message: "Access revoked by admin" });
        }
        
        if (!user.isLoggedIn) {
            clearAdminTokenCookie(res);
            return res.status(401).json({ success: false, message: "Session expired or logged out" });
        }

        req.id = user._id;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
    }
};
 

export const sendOtpMiddleware = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        const userId = req.user;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit phone number"
            });
        }

        checkOtpRateLimit(phoneNumber);

        await sendOtp(phoneNumber);

        
        req.phoneNumber = phoneNumber;
        req.id = userId
        
        res.status(200).json({
            success: true,
            message: "OTP sent"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again."
        });
    }
};
export const isAdmin = async(req, res, next)=>{
    if(req.user && req.user.role === "admin"){
        next()
    }
    else{
        return res.status(403).json({
            success: false,
            message: "Access denied: Admin only"
        })
    }
}