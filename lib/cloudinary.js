import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Upload a file (image or voice note audio) to Cloudinary.
 * @param {string} filePath - Path to the file to upload.
 * @param {string} folder - Destination folder on Cloudinary.
 * @param {string} resourceType - 'auto', 'image', 'video', 'raw'.
 * @returns {Promise<string>} Secure URL of uploaded file.
 */
export async function uploadToCloudinary(filePath, folder = 'rider-of-fsd', resourceType = 'auto') {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: resourceType,
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`);
    }
}
