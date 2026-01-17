const cloudinary = require('cloudinary').v2;
const fs = require('fs')
require('dotenv').config();
// const path = require('path') 


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})    


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("File path is required");
        }
        
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        if (!result) {
            throw new Error("Upload failed");
        }
        
        console.log('Upload success:', result.secure_url);  // Log Cloudinary URL
        
        fs.unlinkSync(localFilePath);  // Clean up local file
        return result;

    } catch (error) {
        console.error('Cloudinary error:', error);  // Log Cloudinary error
        fs.unlinkSync(localFilePath);  // Clean up local file
        return null;
    }
};




module.exports = uploadOnCloudinary;
