import express from "express";
import { getAllCategories, getProductsByCategory, getCategoryBySlug } from "../controllers/categoryController.js";

import { isAuthenticated, isAdmin } from "../middleware/authmiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// ==========================
//  USER ROUTES
// ==========================

// Get all active categories (no auth needed usually)
router.get("/categories", getAllCategories);

// Get products by category
router.get("/products/category/:slug", getProductsByCategory);

// Get single category by slug
router.get("/category/:slug", getCategoryBySlug);





export default router;