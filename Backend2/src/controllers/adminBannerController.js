import {Banner} from "../models/bannerModel.js";
import cloudinary from "../services/cloudinaryService.js";

export const createBanner = async (req, res) => {
    try {
        const { title, subtitle } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        //  Upload to cloudinary
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            { folder: "banners" }
        );

        const banner = await Banner.create({
            title,
            subtitle,
            
            image: {
                url: result.secure_url,
                public_id: result.public_id
            }
        });

        res.status(201).json({
            success: true,
            banner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        //  Delete image from cloudinary
        if (banner.image?.public_id) {
            await cloudinary.uploader.destroy(banner.image.public_id);
        }

        await banner.deleteOne();

        res.status(200).json({
            success: true,
            message: "Banner deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            banners
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        const { title, subtitle } = req.body;

        //  If new image uploaded
        if (req.file) {

            // delete old image
            if (banner.image?.public_id) {
                await cloudinary.uploader.destroy(banner.image.public_id);
            }

            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                { folder: "banners" }
            );

            banner.image = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        // update fields
        banner.title = title || banner.title;
        banner.subtitle = subtitle || banner.subtitle;
        

        await banner.save();

        res.status(200).json({
            success: true,
            banner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};