import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../models/categoryModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.development
dotenv.config({ path: path.join(__dirname, "../../.env.development") });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

const migrateCategoryBanners = async () => {
    try {
        await connectDB();
        
        console.log("Starting Category bannerImage migration...");
        
        // Find all categories
        const categories = await Category.find();
        
        console.log(`Found ${categories.length} categories to check.`);
        
        let count = 0;
        for (const category of categories) {
            // Update even if it exists but is undefined or missing url
            if (!category.bannerImage || !category.bannerImage.url) {
                category.bannerImage = { url: "", public_id: "" };
                await category.save();
                count++;
            }
        }
        
        console.log(`Migration complete. Updated ${count} categories.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrateCategoryBanners();
