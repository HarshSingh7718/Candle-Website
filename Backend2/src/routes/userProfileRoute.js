import express from 'express';
import { isAuthenticated } from "../middleware/authmiddleware.js"
import { getUserProfile, updateUserProfile, changePassword, requestPhoneOtp, verifyAndUpdatePhone } from '../controllers/userProfileController.js';



const router = express.Router();

router.get( "/user/profile", isAuthenticated, getUserProfile);

router.put( "/user/profile", isAuthenticated, updateUserProfile);

router.put( "/user/password", isAuthenticated, changePassword);

// Phone Number Update via OTP Verification
router.post( "/user/profile/request-phone-otp", isAuthenticated, requestPhoneOtp);
router.put( "/user/profile/phone", isAuthenticated, verifyAndUpdatePhone);

export default router;