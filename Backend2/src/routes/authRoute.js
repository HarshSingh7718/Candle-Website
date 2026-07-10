import express from 'express'
import rateLimit from 'express-rate-limit';
import { login, sendOtpController, verifyOtpController, completeProfile, logout, forgotPassword, verifyOTP, resendOtp, resetPassword, googleAuth, saveGooglePhone } from '../controllers/authController.js'
import { isAuthenticated, sendOtpMiddleware } from "../middleware/authmiddleware.js"
import { validate } from "../middleware/validate.js"
import {
  sendOtpSchema,
  verifyOtpSchema,
  completeProfileSchema,
  loginSchema,
  resetPasswordSchema
} from "../validators/authValidator.js"



const router = express.Router()





// AUTH ROUTES

router.post("/login", validate(loginSchema), login);
router.post("/logout", isAuthenticated, logout);

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: 'Too many password reset attempts from this IP, please try again after an hour'
});

// PASSWORD RESET
router.post("/forgot-password", passwordResetLimiter, validate(sendOtpSchema), forgotPassword);
router.post("/forgot-password/verify-otp", passwordResetLimiter, validate(verifyOtpSchema), verifyOTP);
router.post("/forgot-password/resend-otp", passwordResetLimiter, validate(sendOtpSchema), resendOtp);
router.post("/forgot-password/reset-password", passwordResetLimiter, validate(resetPasswordSchema), resetPassword);



// GOOGLE AUTH
router.post("/google-auth", googleAuth); 

// PHONE NUMBER (Google users)
router.post("/send-phone-otp", isAuthenticated, sendOtpMiddleware);
router.patch("/verify-phone", isAuthenticated, saveGooglePhone);

// router.patch("/admin/revoke/:userId", isAuthenticated, isAdmin, revokeUserAccess);


//  Step 1: Send OTP
router.post("/send-otp", validate(sendOtpSchema), sendOtpController);

//  Step 2: Verify OTP
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);

//  Step 3: Complete registration
router.post("/complete-profile", validate(completeProfileSchema), completeProfile);




export default router