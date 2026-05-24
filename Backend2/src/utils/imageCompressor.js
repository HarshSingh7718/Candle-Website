import sharp from 'sharp';

/**
 * Compresses and resizes an image buffer for optimal web performance.
 * Converts to WebP format to drastically reduce file size.
 * * @param {Buffer} fileBuffer - The original image buffer from Multer
 * @param {number} quality - Compression quality (0-100), default 80
 * @param {number} maxWidth - Maximum width (default 1200px for products)
 * @returns {Promise<Buffer>} - The compressed image buffer
 */
export const compressImage = async (fileBuffer, quality = 80, maxWidth = 1200) => {
    try {
        const compressedBuffer = await sharp(fileBuffer)
            // Resize: Only shrink if it's larger than maxWidth, don't upscale small images
            .resize({
                width: maxWidth,
                withoutEnlargement: true,
                fit: 'inside' // Maintains aspect ratio
            })
            // Convert to WebP for massive size savings without losing visual quality
            .webp({ quality }) 
            .toBuffer();

        return compressedBuffer;
    } catch (error) {
        console.error("Image compression failed:", error);
        throw new Error("Failed to compress image");
    }
};