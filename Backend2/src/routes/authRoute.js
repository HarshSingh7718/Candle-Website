import express from 'express'
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

// PASSWORD RESET
router.post("/forgot-password", validate(sendOtpSchema), forgotPassword);
router.post("/forgot-password/verify-otp", validate(verifyOtpSchema), verifyOTP);
router.post("/forgot-password/resend-otp", validate(sendOtpSchema), resendOtp);
router.post("/forgot-password/reset-password", validate(resetPasswordSchema), resetPassword);



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