import { v2 as cloudinary } from 'cloudinary';
import { apiError } from './apiError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteFromCloudinary = async (publicId, resourceType = "raw") => {
    try {
        if (!publicId) return null;

        // Delete the asset from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        
        return result;
    } catch (error) {
        console.error("Cloudinary delete failed:", error.message);
        return null;
    }
};

export { deleteFromCloudinary };