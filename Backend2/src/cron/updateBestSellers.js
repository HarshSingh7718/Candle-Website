import cron from "node-cron";
import { Product } from "../models/productModels.js";

// Run every night at midnight
export const initBestSellersCron = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            
            // Get the top 6 products by totalSold
            const topProducts = await Product.find({ isActive: true })
                .sort({ totalSold: -1 })
                .limit(6)
                .select("_id");

            const topProductIds = topProducts.map(p => p._id);

            // Auto-promote them to best sellers
            if (topProductIds.length > 0) {
                await Product.updateMany(
                    { _id: { $in: topProductIds } },
                    { $set: { isBestSeller: true } }
                );
            }

            // Note: We deliberately do NOT set isBestSeller to false for other products,
            // so any manually curated best sellers remain as best sellers, as requested.

        } catch (error) {
            console.error("Error in best sellers cron job:", error);
        }
    });
};
