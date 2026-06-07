import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
};

export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: "1d" }
    );
};

// User cookie
export const setTokenCookie = (res, token) => {
    res.cookie("userToken", token, cookieOptions);
};

export const clearTokenCookie = (res) => {
    res.clearCookie("userToken", cookieOptions);
};

// Admin cookie
export const setAdminTokenCookie = (res, token) => {
    res.cookie("adminToken", token, cookieOptions);
};

export const clearAdminTokenCookie = (res) => {
    res.clearCookie("adminToken", cookieOptions);
};