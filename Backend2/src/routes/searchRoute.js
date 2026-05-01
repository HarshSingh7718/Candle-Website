import express from "express";
import { searchProducts } from "../controllers/searchController.js";

const router = express.Router();

//  Search products
router.get("/search", searchProducts);

export default router;