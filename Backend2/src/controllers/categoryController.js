import { Category } from "../models/categoryModel.js";
import { Product } from "../models/productModels.js";
import mongoose from "mongoose";
import cloudinary from "../services/cloudinaryService.js";


export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });

        res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getProductsByCategory = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        const { id } = req.params;

        //  Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        page = Number(page);
        limit = Number(limit);

        const products = await Product.find({
            category: id,
            isActive: true
        })
            .populate("category", "name")
            .select("name price images ratings stock")
            .skip((page - 1) * limit)
            .limit(limit);

        const totalProducts = await Product.countDocuments({
            category: id,
            isActive: true
        });

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
