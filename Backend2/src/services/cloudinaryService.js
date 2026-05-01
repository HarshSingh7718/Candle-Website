import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";

cloudinary.config({
    cloud_name: config.cloud.cloud_n,
    api_key: config.cloud.cloud_key,
    api_secret: config.cloud.cloud_secret
});

export default cloudinary;