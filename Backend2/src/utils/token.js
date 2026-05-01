import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const isProduction = process.env.NODE_ENV === "production";

// Generate JWT
export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: "1d" }
    );
};
export const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        path: "/", // Ensure it's available for the whole site
        httpOnly: true,
        secure: isProduction,  // MUST be false for http://localhost
        sameSite: isProduction ? "none" : "lax", // Use 'lax' for local dev. 'none' requires 'secure: true'
        maxAge: 24 * 60 * 60 * 1000,
    });
};
export const clearTokenCookie = (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,  // MUST be false for http://localhost
        sameSite: isProduction ? "none" : "lax", // Use 'lax' for local dev. 'none' requires 'secure: true'
    });
};

