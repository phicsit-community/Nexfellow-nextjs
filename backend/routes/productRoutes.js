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
  uploadLogo,
  createReview,
  getReviews,
  replyToReview,
  markHelpful,
  resolveReview,
  deleteReview,
  deleteReply,
} = require("../controllers/productController");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/temp"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const ALLOWED_IMAGE_MIMETYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_MIMETYPES.has(file.mimetype) && ALLOWED_IMAGE_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new ExpressError("Only JPEG, PNG, WebP, or GIF images are allowed", 400), false);
  }
};

const screenshotUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const logoUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
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

router.post(
  "/:id/logo",
  isAuthenticated,
  logoUpload.single("logo"),
  catchAsync(uploadLogo)
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
router.delete(
  "/:id/reviews/:reviewId",
  isAuthenticated,
  catchAsync(deleteReview)
);
router.delete(
  "/:id/reviews/:reviewId/replies/:replyId",
  isAuthenticated,
  catchAsync(deleteReply)
);

module.exports = router;
