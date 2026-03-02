import crypto from 'crypto';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Utility to generate Cloudinary signature for secure uploads.
 */
function generateSignature(params) {
    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');
    return crypto
        .createHash('sha1')
        .update(`${sortedParams}${CLOUDINARY_API_SECRET}`)
        .digest('hex');
}

/**
 * Upload a file (image or audio) to Cloudinary.
 * @param {Buffer} fileBuffer - File content in buffer.
 * @param {string} resourceType - 'image' or 'video' (audio uses video type).
 * @param {string} folder - Destination folder on Cloudinary.
 */
export async function uploadToCloudinary(fileBuffer, resourceType = 'auto', folder = 'rider-of-fsd') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
        folder,
        timestamp,
    };

    const signature = generateSignature(params);
    const formData = new FormData();

    formData.append('file', `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('folder', folder);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${result.error?.message || 'Unknown error'}`);
    }

    return {
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration, // relevant for audio
    };
}
