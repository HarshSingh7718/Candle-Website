import { CustomError } from "../middleware/errorHandler.js";

const attempts = new Map(); // { phone: { count, firstAttempt, lastAttempt } }

export const checkOtpRateLimit = (phone) => {
    const now = Date.now();
    const entry = attempts.get(phone) || { count: 0, firstAttempt: now, lastAttempt: 0 };

    // 1 per minute
    if (now - entry.lastAttempt < 60 * 1000) {
        throw new CustomError("Please wait 1 minute before requesting another OTP", 429);
    }

    // Reset daily window if 24h passed
    if (now - entry.firstAttempt > 24 * 60 * 60 * 1000) {
        entry.count = 0;
        entry.firstAttempt = now;
    }

    // 10 per day
    if (entry.count >= 10) {
        throw new CustomError("OTP limit reached for today. Try again tomorrow", 429);
    }

    entry.count += 1;
    entry.lastAttempt = now;
    attempts.set(phone, entry);
};
