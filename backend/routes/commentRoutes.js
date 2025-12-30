const express = require("express");
const commentController = require("../controllers/commentController");
const { isClient } = require("../middleware");

const router = express.Router();

/**
 * @route   /posts/:postId/comments
 */
router
  .route("/posts/:postId/comments")
  /**
   * @desc    Create a new comment for a specific post
   * @access  Private (Authenticated Users)
   * @body    { content: String, parentCommentId: String (optional) }
   * @response { message: String, comment: Object }
   */
  .post(isClient, commentController.createComment)

  /**
   * @desc    Get all comments with nested replies for a specific post
   * @access  Public (No authentication required)
   * @response { comments: Array }
   */
  .get(commentController.getCommentsWithReplies);

/**
 * @route   /comments/:commentId
 */
router
  .route("/comments/:commentId")
  /**
   * @desc    Update a specific comment
   * @access  Private (Authenticated Users)
   * @body    { content: String }
   * @response { message: String, comment: Object }
   */
  .put(isClient, commentController.updateComment)

  /**
   * @desc    Delete a specific comment and its replies
   * @access  Private (Authenticated Users)
   * @response { message: String }
   */
  .delete(isClient, commentController.deleteComment);

/**
 * @route   /comments/:commentId/like
 * @desc    Like or Unlike a comment
 * @access  Private (Authenticated Users)
 * @response { message: String, likes: Number }
 */
router.put(
  "/comments/:commentId/like",
  isClient,
  commentController.likeComment
);

/**
 * @route   /comments/:commentId/report
 * @desc    Report a comment for moderation
 * @access  Private (Authenticated Users)
 * @response { message: String }
 */
router.put(
  "/comments/:commentId/report",
  isClient,
  commentController.reportComment
);

/**
 * @route   /comments/:commentId/pin
 * @desc    Pin or Unpin a comment (Only for Admin, Moderator, or Post Owner)
 * @access  Private (Admin, Moderator, or Post Author)
 * @response { message: String, comment: Object }
 */
router.put(
  "/comments/:commentId/pin",
  isClient,
  commentController.togglePinComment
);

/**
 * @route   /community/:postId/myRole
 * @desc    Get the current user's role in the post's community (creator, content-admin, or null)
 * @access  Private (Authenticated Users)
 * @response { role: String | null }
 */
router.get("/:postId/myRole", isClient, commentController.userRoleInCommunity);

/**
 * @route   /comments/users/search
 * @desc    Search users for mention autocomplete in comments
 * @access  Private (Authenticated Users)
 * @query   { query: string }
 */
router.get(
  "/comments/users/search",
  isClient,
  commentController.searchUsersForMention
);

module.exports = router;
