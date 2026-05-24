import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";
import { compressImage } from '../utils/imageCompressor.js';

cloudinary.config({
    cloud_name: config.cloud.cloud_n,
    api_key: config.cloud.cloud_key,
    api_secret: config.cloud.cloud_secret
});

/**
 * Generic image upload and compression service
 * @param {Buffer} fileBuffer - The raw file buffer from Multer
 * @param {String} folder - Cloudinary folder name
 * @param {Number} maxWidth - Max width for compression (1200 for products, 1920 for banners)
 */
export const uploadImage = async (fileBuffer, folder = "naisha-creations/misc", maxWidth = 1200) => {
    try {
        // 1. Compress the image dynamically based on maxWidth
        const compressedBuffer = await compressImage(fileBuffer, 80, maxWidth);

        // 2. Upload to Cloudinary using a stream
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    format: "webp" 
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            );

            // Feed the compressed buffer into the stream
            uploadStream.end(compressedBuffer);
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }
};

// Keep exporting the default cloudinary object so controllers can still use cloudinary.uploader.destroy()
export default cloudinary;