const express = require("express");
const router = express.Router();
const previewController = require("../controllers/previewController");

// Route to generate a preview link
router.post("/generate-link", previewController.generatePreviewLink);

// Route to validate a preview token and redirect
router.get("/:token", previewController.validatePreviewToken);

// Route to generate OG images for different content types
router.get("/og/:type/:id", previewController.generateOGImage);

// Fallback route for generic OG image
router.get("/og/default", (req, res) => {
  const defaultSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#14131A"/>
    <rect x="32" y="32" width="1136" height="566" rx="16" fill="#1E1C26"/>
    <text x="96" y="340" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="48" font-weight="bold" fill="white">GeeksClash</text>
    <text x="96" y="400" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="32" fill="#AAAACC">Connect with developers and tech enthusiasts</text>
    <text x="96" y="560" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="24" fill="#FFFFFF">GeeksClash.com</text>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
  res.send(defaultSvg);
});

module.exports = router;
