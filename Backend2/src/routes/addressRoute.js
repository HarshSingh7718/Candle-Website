import express from "express";
import { addShippingAddress, getUserAddresses, deleteAddress, updateAddress } from "../controllers/addressController.js";

import { isAuthenticated } from "../middleware/authmiddleware.js";

const router = express.Router();

// /api/address

//  Add new address
router.post("/add", isAuthenticated, addShippingAddress);

//  Get all addresses
router.get("/", isAuthenticated, getUserAddresses);

//  Delete address
router.delete("/:addressId", isAuthenticated, deleteAddress);

//  Update address
router.put("/:addressId", isAuthenticated, updateAddress);

export default router;