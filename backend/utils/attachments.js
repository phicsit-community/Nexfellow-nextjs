const fs = require("fs");
const path = require("path");
const bunny = require("./bunny");

// Upload a file and auto-remove local file
const uploadOnBunny = async (localFilePath, targetPath = null) => {
  try {
    if (!localFilePath) throw new Error("File path is required");
    const result = await bunny.upload(localFilePath, targetPath);
    return result;
  } catch (error) {
    console.error("Upload Error:", error.message);
    return null;
  } finally {
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (deleteError) {
      console.error("File delete error:", deleteError.message);
    }
  }
};

// Remove a file from Bunny Storage, but skip defaults
const removeFromBunny = async (remotePath) => {
  try {
    if (!remotePath) throw new Error("Remote path is required");
    if (remotePath.startsWith("defaults/")) {
      console.log("Skipping deletion of default image:", remotePath);
      return true;
    }
    await bunny.remove(remotePath);
    return true;
  } catch (error) {
    console.error("Remove Error:", error.message);
    return false;
  }
};

module.exports = {
  uploadOnBunny,
  removeFromBunny,
};



// const cloudinary = require("cloudinary").v2;
// const fs = require("fs");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME_2,
//   api_key: process.env.CLOUDINARY_API_KEY_2,
//   api_secret: process.env.CLOUDINARY_API_SECRET_2,
// });

// const uploadAttachments = async (localFilePath) => {
//   try {
//     if (!localFilePath) {
//       throw new Error("File path is required");
//     }

//     const result = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     if (!result) {
//       throw new Error("Upload failed");
//     }

//     return result;
//   } catch (error) {
//     return null;
//   } finally {
//     // Ensure file deletion
//     try {
//       if (fs.existsSync(localFilePath)) {
//         fs.unlinkSync(localFilePath);
//       }
//     } catch (deleteError) {
//     }
//   }
// };

// const removeAttachment = async (fileUrl) => {
//   try {
//     if (!fileUrl) {
//       throw new Error("File URL is required");
//     }

//     if (fileUrl.startsWith("http")) {
//       // Extract Cloudinary public ID
//       const publicId = fileUrl.split("/").slice(-2).join("/").split(".")[0];
//       console.log("🚀 Deleting from Cloudinary:", publicId);

//       const result = await cloudinary.uploader.destroy(publicId);
//       console.log("✅ Cloudinary Delete Result:", result);
//     } else {
//       // Delete local file
//       if (fs.existsSync(fileUrl)) {
//         fs.unlinkSync(fileUrl);
//         console.log("✅ Local File Deleted:", fileUrl);
//       } else {
//         console.warn("⚠ File Not Found on Disk:", fileUrl);
//       }
//     }
//     return true;
//   } catch (error) {
//     console.error("❌ Error Removing Attachment:", error.message);
//     return false;
//   }
// };

// module.exports = { uploadAttachments, removeAttachment };
