const multer = require('multer');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add timestamp to file name for uniqueness
  }
});

module.exports.upload = multer({ storage: storage });
