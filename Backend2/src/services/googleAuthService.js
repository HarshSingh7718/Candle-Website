import { OAuth2Client } from "google-auth-library";
import { User } from "../models/userModel.js";
import { config } from "../config/index.js";
const client = new OAuth2Client(config.google.clientId);

export const verifyGoogleToken = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google.clientId
    });

    return ticket.getPayload();
};

export const findOrCreateGoogleUser = async (payload) => {
    const { email, name, sub } = payload;

    
    const nameParts = name ? name.split(" ") : [];
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";

    let user = await User.findOne({ googleId: sub });

    if (!user) {
        user = await User.create({
            firstName,
            lastName,
            email,
            googleId: sub,
            authProvider: "google",
            isLoggedIn: true,
            needsPhone: true
        });
    } else {
        user.isLoggedIn = true;
        await user.save();
    }

    return user;
};