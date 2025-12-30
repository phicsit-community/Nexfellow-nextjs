const express = require("express");
const router = express.Router();
const shortenedUrlController = require("../controllers/shortenedUrlController");
const { isClient } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");

/**
 * @route   POST /shorten
 * @desc    Create a shortened URL
 * @access  Private (Authenticated Users)
 * @body    { url: String (required), postId: ObjectId (optional), communityId: ObjectId (optional) }
 * @response { originalUrl: String, shortUrl: String, shortCode: String }
 */
router.post(
  "/shorten",
  isClient,
  catchAsync(shortenedUrlController.createShortUrl)
);

/**
 * @route   GET /link/:shortCode
 * @desc    Redirect to the original URL
 * @access  Public
 * @param   { shortCode: String } - The shortened URL code
 * @response Redirects to the original URL
 */
router.get(
  "/link/:shortCode",
  catchAsync(shortenedUrlController.redirectToOriginalUrl)
);

/**
 * @route   GET /link/:shortCode/redirect-info
 * @desc    Get redirect information for a shortened URL without redirecting
 * @access  Public
 * @param   { shortCode: String } - The shortened URL code
 * @response { shortCode: String, originalUrl: String }
 */
router.get(
  "/link/:shortCode/redirect-info",
  catchAsync(shortenedUrlController.getRedirectInfo)
);

/**
 * @route   GET /stats/:shortCode
 * @desc    Get statistics for a shortened URL
 * @access  Public
 * @param   { shortCode: String } - The shortened URL code
 * @response { originalUrl: String, shortUrl: String, shortCode: String, clicks: Number, creator: Object, createdAt: Date, clickDetails: Array }
 */
router.get("/stats/:shortCode", catchAsync(shortenedUrlController.getUrlStats));

/**
 * @route   GET /user/links
 * @desc    Get all shortened URLs created by the current user
 * @access  Private (Authenticated Users)
 * @response Array of shortened URL objects
 */
router.get(
  "/user/links",
  isClient,
  catchAsync(shortenedUrlController.getUserUrls)
);

/**
 * @route   POST /link/:shortCode/track
 * @desc    Track a click with location data from the frontend and return redirect info
 * @access  Public
 * @param   { shortCode: String } - The shortened URL code
 * @body    { ip: String, country: String, city: String, region: String, userAgent: String, referrer: String, timestamp: Date }
 * @response { shortCode: String, originalUrl: String }
 */
router.post(
  "/link/:shortCode/track",
  catchAsync(shortenedUrlController.trackClickWithClientData)
);

/**
 * @route   GET /community/:communityId/links
 * @desc    Get all shortened URLs for a specific community
 * @access  Private (Authenticated Users)
 * @param   { communityId: ObjectId } - ID of the community
 * @response Array of shortened URL objects
 */
router.get(
  "/link/community/:communityId/links",
  isClient,
  catchAsync(shortenedUrlController.getCommunityUrls)
);

/**
 * @route   GET /community/:communityId/link-stats
 * @desc    Get statistics for all links in a community with pagination and filtering
 * @access  Private (Authenticated Users)
 * @param   { communityId: ObjectId } - ID of the community
 * @query   { page: Number, limit: Number, sortBy: String, order: String, timeframe: String }
 * @response { links: Array, pagination: Object, stats: Object }
 */
router.get(
  "/link/community/:communityId/link-stats",
  isClient,
  catchAsync(shortenedUrlController.getCommunityLinkStats)
);

/**
 * @route   GET /community/:communityId/top-links
 * @desc    Get top performing links in a community
 * @access  Private (Authenticated Users)
 * @param   { communityId: ObjectId } - ID of the community
 * @query   { limit: Number, timeframe: String }
 * @response Array of top performing link objects
 */
router.get(
  "/link/community/:communityId/top-links",
  isClient,
  catchAsync(shortenedUrlController.getTopCommunityLinks)
);

module.exports = router;
