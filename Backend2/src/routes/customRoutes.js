import express from "express";
import { createCustomCandle } from "../controllers/customCandleController.js";
import { getOptionsByStep } from "../controllers/optionController.js";
import { isAuthenticated } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/customization-options/:step", getOptionsByStep);
router.post("/custom-candle", isAuthenticated, createCustomCandle);



export default router;