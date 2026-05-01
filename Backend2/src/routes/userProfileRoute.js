import express from 'express';
import { isAuthenticated } from "../middleware/authmiddleware.js"
import { getUserProfile, updateUserProfile } from '../controllers/userProfileController.js';



const router = express.Router();

router.get( "/user/profile", isAuthenticated, getUserProfile);

router.put( "/user/profile", isAuthenticated, updateUserProfile);


export default router;