import express from "express";
import { createContact } from "../controllers/contactController.js";

import { isAuthenticated, isAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

//  User sends message (public)
router.post("/contact", createContact);



export default router;