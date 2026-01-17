const express = require('express');
const fileUpload = require('express-fileupload');
const uploadOnCloudinary = require('../utils/cloudinary'); 
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Middleware for file uploads
const app = express();
app.use(fileUpload());

// Ensure uploads directory exists or create it
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create uploads directory if it doesn't exist
}

// Image upload endpoint
router.post('/upload-image', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const uploadPath = path.join(uploadDir, file.name);

    // Save the uploaded file locally first
    file.mv(uploadPath, async (err) => {
      if (err) {
        console.error('Failed to save file locally:', err);
        return res.status(500).json({ error: 'Failed to save file locally' });
      }

      try {
        // Upload the local file to Cloudinary
        const result = await uploadOnCloudinary(uploadPath);
        
        if (result) {
          return res.json({ url: result.secure_url });
        } else {
          console.error('Cloudinary upload failed');
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Upload process failed' });
      }
    });
  } catch (serverError) {
    console.error('Server error:', serverError);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
