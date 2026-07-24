import { CustomError } from "../middleware/errorHandler.js";
import { Banner } from "../models/bannerModel.js";
import cloudinary, { uploadImage } from "../services/cloudinaryService.js";

export const createBanner = async (req, res) => {
  const { title, subtitle, linkedCollection } = req.body;
  if (!req.files || !req.files.desktopImage || !req.files.mobileImage) {
    throw new CustomError("Both desktop and mobile images are required", 400);
  }

  const desktopResult = await uploadImage(req.files.desktopImage[0].buffer, "banners", 1920);
  const mobileResult = await uploadImage(req.files.mobileImage[0].buffer, "banners", 1080); // You can adjust width

  const banner = await Banner.create({
    title,
    subtitle,
    linkedCollection: linkedCollection || null,
    desktopImage: {
      url: desktopResult.url,
      public_id: desktopResult.public_id
    },
    mobileImage: {
      url: mobileResult.url,
      public_id: mobileResult.public_id
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

  // Delete images from cloudinary
  if (banner.desktopImage?.public_id) {
    await cloudinary.uploader.destroy(banner.desktopImage.public_id);
  }
  if (banner.mobileImage?.public_id) {
    await cloudinary.uploader.destroy(banner.mobileImage.public_id);
  }
  await banner.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Banner deleted"
  });
};

export const getSingleBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id).populate("linkedCollection", "name slug");
  if (!banner) {
    throw new CustomError("Banner not found", 404);
  }
  res.status(200).json({
    success: true,
    banner
  });
};

export const getAllBanners = async (req, res) => {
  const banners = await Banner.find().populate("linkedCollection", "name slug").sort({
    isActive: -1,
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
  const { title, subtitle, linkedCollection } = req.body;

  // If new desktop image uploaded
  if (req.files && req.files.desktopImage) {
    if (banner.desktopImage?.public_id) {
      await cloudinary.uploader.destroy(banner.desktopImage.public_id);
    }
    const desktopResult = await uploadImage(req.files.desktopImage[0].buffer, "banners", 1920);
    banner.desktopImage = {
      url: desktopResult.url,
      public_id: desktopResult.public_id
    };
  }

  // If new mobile image uploaded
  if (req.files && req.files.mobileImage) {
    if (banner.mobileImage?.public_id) {
      await cloudinary.uploader.destroy(banner.mobileImage.public_id);
    }
    const mobileResult = await uploadImage(req.files.mobileImage[0].buffer, "banners", 1080);
    banner.mobileImage = {
      url: mobileResult.url,
      public_id: mobileResult.public_id
    };
  }

  // update fields
  banner.title = title || banner.title;
  banner.subtitle = subtitle || banner.subtitle;
  banner.linkedCollection = linkedCollection || null;
  await banner.save();
  
  res.status(200).json({
    success: true,
    banner
  });
};