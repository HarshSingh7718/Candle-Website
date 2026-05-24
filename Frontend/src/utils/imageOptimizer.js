/**
 * Injects Cloudinary transformations to force WebP/AVIF compression (f_auto, q_auto)
 * and dynamically resize the image before downloading.
 * 
 * @param {string} url - The raw image URL
 * @param {number|string} width - Optional width parameter (e.g. 500)
 * @returns {string} Optimized URL
 */
export const optimizeCloudinaryUrl = (url, width = 'auto') => {
    if (!url) return url;
    
    // Check if it's a valid Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
        // Find the insertion point after '/upload/'
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex !== -1) {
            const prefix = url.substring(0, uploadIndex + 8); // includes '/upload/'
            const suffix = url.substring(uploadIndex + 8);
            
            // Add transformations: auto format, auto quality
            const transformations = `f_auto,q_auto${width !== 'auto' ? `,w_${width}` : ''}/`;
            
            return `${prefix}${transformations}${suffix}`;
        }
    }
    
    return url;
};
