import { Category } from "../models/categoryModel.js";
import cloudinary from "../services/cloudinaryService.js";

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        let imageData = {};

        //  Better upload using buffer stream
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "categories" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            imageData = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        const category = await Category.create({
            name,
            description,
            image: imageData
        });

        res.status(201).json({
            success: true,
            category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        //  Update text fields
        if (name) category.name = name;
        if (description) category.description = description;

        //  Replace image
        if (req.file) {

            // delete old image
            if (category.image?.public_id) {
                await cloudinary.uploader.destroy(category.image.public_id);
            }

            // upload new image
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "categories" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            category.image = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated",
            category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        //  Delete image from cloudinary
        if (category.image?.public_id) {
            await cloudinary.uploader.destroy(category.image.public_id);
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: "Category deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSingleCategoryAdmin = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};