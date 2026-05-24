import { CustomError } from "../middleware/errorHandler.js";
import { Banner } from "../models/bannerModel.js";
import cloudinary, { uploadImage } from "../services/cloudinaryService.js";

export const createBanner = async (req, res) => {
  const { title, subtitle } = req.body;
  if (!req.file) {
    throw new CustomError("Image is required", 400);
  }

  const result = await uploadImage(req.file.buffer, "banners", 1920);

  const banner = await Banner.create({
    title,
    subtitle,
    image: {
      url: result.url,
      public_id: result.public_id
    }
  });

  res.status(201).json({
    success: true,
    banner
  });
};

export const deleteBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new CustomError("Banner not found", 404);
  }

  // Delete image from cloudinary
  if (banner.image?.public_id) {
    await cloudinary.uploader.destroy(banner.image.public_id);
  }
  await banner.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Banner deleted"
  });
};

export const getSingleBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new CustomError("Banner not found", 404);
  }
  res.status(200).json({
    success: true,
    banner
  });
};

export const getAllBanners = async (req, res) => {
  const banners = await Banner.find().sort({
    createdAt: -1
  });
  res.status(200).json({
    success: true,
    count: banners.length,
    banners
  });
};

export const updateBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new CustomError("Banner not found", 404);
  }
  const { title, subtitle } = req.body;

  // If new image uploaded
  if (req.file) {
    // delete old image
    if (banner.image?.public_id) {
      await cloudinary.uploader.destroy(banner.image.public_id);
    }
    
    const result = await uploadImage(req.file.buffer, "banners", 1920);
    
    banner.image = {
      url: result.url,
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
};