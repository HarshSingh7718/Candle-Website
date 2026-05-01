import express from 'express';
import { isAuthenticated } from "../middleware/authmiddleware.js"
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/whishlistController.js';



const router = express.Router();




// Add to wishlist
router.post("/wishlist", isAuthenticated, addToWishlist);

// Remove from wishlist
router.delete("/wishlist", isAuthenticated, removeFromWishlist);

// Get wishlist
router.get("/wishlist", isAuthenticated, getWishlist);


export default router;