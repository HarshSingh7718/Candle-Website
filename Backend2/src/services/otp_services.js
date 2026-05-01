import twilio from "twilio";
import "dotenv/config";
import { config } from "../config/index.js";
export const client = twilio(
    config.twilio.sid,
    config.twilio.secret
);

export const sendOtp = async (phone) => {
    try {
        const formattedPhone = phone.startsWith("+")
            ? phone
            : `+91${phone}`;
        
        const verification = await client.verify.v2
            .services(config.twilio.ssid)
            .verifications
            .create({
                to: formattedPhone,
                channel: "sms"
            });

        return verification;

    } catch (error) {
        
        throw new Error(error.message);
    }
};
export const verifyOtpService = async (phone, otp) => {
    const formattedPhone = phone.startsWith("+")
        ? phone
        : `+91${phone}`;

    return await client.verify.v2
        .services(config.twilio.ssid)
        .verificationChecks
        .create({
            to: formattedPhone,
            code: otp
        });
};

export const sendSMS = async (to, message) => {
    try {
        //  Validation
        if (!to || !message) {
            throw new Error("Phone number and message are required");
        }

        //  Format phone number (India)
        let formattedNumber = to.startsWith("+") ? to : `+91${to}`;

        const res = await client.messages.create({
            body: message,
            from: config.twilio.phone,
            to: formattedNumber
        });

        return {
            success: true,
            sid: res.sid
        };

    } catch (error) {
        console.error("SMS Error:", error.message);

        return {
            success: false,
            error: error.message
        };
    }
};