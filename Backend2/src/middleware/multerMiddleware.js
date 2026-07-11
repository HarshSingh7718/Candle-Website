import multer from "multer";
import { CustomError } from "./errorHandler.js";

const storage = multer.memoryStorage(); // store in memory

export const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new CustomError("Only images are allowed", 400), false);
        }
    }
});
 