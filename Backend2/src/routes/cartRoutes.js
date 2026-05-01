import express from 'express';
import { isAuthenticated } from "../middleware/authmiddleware.js"
import { addToCart, getCart, updateCart, removeFromCart, clearCart, getCartBilling } from '../controllers/cartController.js';



const router = express.Router();





// ==========================
//  CART ROUTES
// ==========================

//  Add item to cart
router.post("/addtocart", isAuthenticated, addToCart);

//  Get full cart
router.get("/getcart", isAuthenticated, getCart);

//  Clear entire cart
router.delete("/clear", isAuthenticated, clearCart);

//  Get billing summary
router.get("/billing", isAuthenticated, getCartBilling);

//  Update quantity (by itemId)
router.patch("/:itemId", isAuthenticated, updateCart);

//  Remove single item
router.delete("/:itemId", isAuthenticated, removeFromCart);





export default router;