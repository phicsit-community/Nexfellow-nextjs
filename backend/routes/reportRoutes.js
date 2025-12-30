const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { isAuthenticated } = require("../middleware");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 3, // max 3 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Create a new report
router.post(
  "/create",
  isAuthenticated,
  upload.array("images", 3),
  reportController.createReport
);

// Get all reports (admin only)
router.get("/all", isAuthenticated, reportController.getAllReports);

// Get a single report by ID (admin only)
router.get("/:id", isAuthenticated, reportController.getReportById);

// Update report status (admin only)
router.patch(
  "/:id/status",
  isAuthenticated,
  reportController.updateReportStatus
);

// Get reports by current user
router.get(
  "/user/my-reports",
  isAuthenticated,
  reportController.getReportsByUser
);

// Report a user route
router.post(
  "/user/:userId",
  isAuthenticated,
  upload.array("images", 3),
  reportController.reportUser
);

module.exports = router;
