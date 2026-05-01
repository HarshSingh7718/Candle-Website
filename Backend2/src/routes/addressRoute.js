import express from "express";
import { addShippingAddress, getUserAddresses, deleteAddress } from "../controllers/addressController.js";

import { isAuthenticated } from "../middleware/authmiddleware.js";

const router = express.Router();

//  Add new address
router.post("/add", isAuthenticated, addShippingAddress);

//  Get all addresses
router.get("/", isAuthenticated, getUserAddresses);

//  Delete address
router.delete("/:addressId", isAuthenticated, deleteAddress);

export default router;