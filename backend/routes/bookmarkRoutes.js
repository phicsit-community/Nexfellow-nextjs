const express = require("express");
const bookmarkController = require("../controllers/bookmarkController");
const catchAsync = require("../utils/CatchAsync");
const { isClient } = require("../middleware");

const router = express.Router();

/**
 * @route   POST /bookmarks/:itemType/:itemId
 * @desc    Create a bookmark for any item type (Post, Community, GeneralContest, DashboardContest)
 * @access  Private (Authenticated Users)
 * @param   itemType: String (Post, Community, GeneralContest, DashboardContest)
 * @param   itemId: ObjectId
 * @response { message: String }
 */
router
  .route("/:itemType/:itemId")
  .post(isClient, catchAsync(bookmarkController.createBookmark));

/**
 * @route   DELETE /bookmarks/:itemType/:itemId
 * @desc    Remove a bookmark for any item type
 * @access  Private (Authenticated Users)
 * @param   itemType: String
 * @param   itemId: ObjectId
 * @response { message: String }
 */
router
  .route("/:itemType/:itemId")
  .delete(isClient, catchAsync(bookmarkController.deleteBookmark));

/**
 * @route   GET /bookmarks/:itemType/:itemId
 * @desc    Get all bookmarks for a specific item
 * @access  Public
 * @param   itemType: String
 * @param   itemId: ObjectId
 * @response { bookmarks: Array }
 */
router
  .route("/:itemType/:itemId")
  .get(catchAsync(bookmarkController.getBookmarksForItem));

/**
 * @route   GET /bookmarks/user
 * @desc    Get all bookmarks by the authenticated user (optionally filter by itemType via query param)
 * @access  Private (Authenticated Users)
 * @query   itemType: String (optional)
 * @response { bookmarks: Array }
 */
router
  .route("/user")
  .get(isClient, catchAsync(bookmarkController.getUserBookmarks));

/**
 * @route   GET /bookmarks/check/:itemType/:itemId
 * @desc    Check if the authenticated user has bookmarked the item
 * @access  Private
 */
router
  .route('/check/:itemType/:itemId')
  .get(isClient, catchAsync(bookmarkController.checkBookmarkExists));

module.exports = router;
