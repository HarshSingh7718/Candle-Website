import express from 'express';
import { isAuthenticated } from "../middleware/authmiddleware.js"
import { getSingleProduct, getAllCandles } from '../controllers/productController.js';
const router = express.Router();

router.get("/product/:id", getSingleProduct);
router.get("/candles", getAllCandles);

export default router;