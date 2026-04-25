const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const catchAsync = require("../utils/CatchAsync");
const ExpressError = require("../utils/ExpressError");
const { isAuthenticated } = require("../middleware");
const {
  createProduct,
  getDashboardStats,
  getMyProducts,
  getProductById,
  updateProduct,
  submitProduct,
  launchProduct,
  deleteProduct,
  uploadScreenshots,
  createReview,
  getReviews,
  replyToReview,
  markHelpful,
  resolveReview,
} = require("../controllers/productController");

const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/temp"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "screenshot-" + uniqueSuffix + ext);
  },
});

const screenshotUpload = multer({
  storage: screenshotStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ExpressError("Only image files are allowed", 400), false);
    }
  },
});

// -- Named routes MUST come before /:id --

router.post("/", isAuthenticated, catchAsync(createProduct));
router.get("/stats", isAuthenticated, catchAsync(getDashboardStats));
router.get("/my", isAuthenticated, catchAsync(getMyProducts));

// -- Param routes --

router.get("/:id", isAuthenticated, catchAsync(getProductById));
router.put("/:id", isAuthenticated, catchAsync(updateProduct));
router.delete("/:id", isAuthenticated, catchAsync(deleteProduct));
router.post("/:id/submit", isAuthenticated, catchAsync(submitProduct));
router.post("/:id/launch", isAuthenticated, catchAsync(launchProduct));
router.post(
  "/:id/screenshots",
  isAuthenticated,
  screenshotUpload.array("screenshots", 5),
  catchAsync(uploadScreenshots)
);

// -- Review routes --

router.post("/:id/reviews", isAuthenticated, catchAsync(createReview));
router.get("/:id/reviews", isAuthenticated, catchAsync(getReviews));
router.post(
  "/:id/reviews/:reviewId/reply",
  isAuthenticated,
  catchAsync(replyToReview)
);
router.post(
  "/:id/reviews/:reviewId/helpful",
  isAuthenticated,
  catchAsync(markHelpful)
);
router.put(
  "/:id/reviews/:reviewId/resolve",
  isAuthenticated,
  catchAsync(resolveReview)
);

module.exports = router;
