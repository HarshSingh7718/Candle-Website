import express from 'express'
import { login, sendOtpController, verifyOtpController, completeProfile, logout, forgotPassword, verifyOTP, resendOtp, resetPassword, googleAuth, saveGooglePhone } from '../controllers/authController.js'
import { isAuthenticated, sendOtpMiddleware } from "../middleware/authmiddleware.js"



const router = express.Router()





// AUTH ROUTES

router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

// PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyOTP);
router.post("/forgot-password/resend-otp", resendOtp);
router.post("/forgot-password/reset-password", resetPassword);



// GOOGLE AUTH
router.post("/google-auth", googleAuth);

// PHONE NUMBER (Google users)
router.post("/send-phone-otp", isAuthenticated, sendOtpMiddleware);
router.patch("/verify-phone", isAuthenticated, saveGooglePhone);

// router.patch("/admin/revoke/:userId", isAuthenticated, isAdmin, revokeUserAccess);


//  Step 1: Send OTP
router.post("/send-otp", sendOtpController);

//  Step 2: Verify OTP
router.post("/verify-otp", verifyOtpController);

//  Step 3: Complete registration
router.post("/complete-profile", completeProfile);




export default router