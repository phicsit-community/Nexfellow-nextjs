const express = require("express");
const likeController = require("../controllers/likeController");
const catchAsync = require("../utils/CatchAsync");
const { isClient } = require("../middleware");

const router = express.Router();

/**
 * @route   POST /posts/:postId/like
 * @desc    Create a like for a specific post
 * @access  Private (Authenticated Users)
 * @param   { postId: ObjectId, userId: ObjectId} - ID of the post to like, ID of the user
 * @response { message: String, like: Object } - Success message and the created like object
 * @response 401 - Unauthorized if user is not authenticated
 * @response 404 - Not Found if post does not exist
 */
router
  .route("/posts/:postId")
  .post(isClient, catchAsync(likeController.createLike));

/**
 * @route   GET /posts/:postId/likes
 * @desc    Get all likes for a specific post
 * @access  Public (No authentication required)
 * @param   { postId: ObjectId } - ID of the post to retrieve likes for
 * @response { likes: Array } - An array of like objects for the specified post
 * @response 404 - Not Found if post does not exist
 */
router
  .route("/posts/:postId")
  .get(isClient, catchAsync(likeController.getLikesForPost));

/**
 * @route   DELETE /posts/:postId/like
 * @desc    Delete a like for a specific post
 * @access  Private (Authenticated Users)
 * @param   { postId: ObjectId, userId: ObjectId } - ID of the post to remove the like from
 * @response { message: String } - Success message indicating like deletion
 * @response 401 - Unauthorized if user is not authenticated
 * @response 404 - Not Found if like does not exist
 * @response 403 - Forbidden if the user did not create the like
 */
router
  .route("/posts/:postId")
  .delete(isClient, catchAsync(likeController.deleteLike));

/**
 * @route   GET /user/likes
 * @desc    Get all likes by a user
 * @access  Private (Authenticated Users)
 * @response { likes: Array } - An array of like objects created by the user
 * @response 401 - Unauthorized if user is not authenticated
 */
router
  .route("/user/likes")
  .get(isClient, catchAsync(likeController.getUserLikes));

module.exports = router;

/**
 * @route   GET //checkIfPostLiked/:postId
 * @desc    Check whether a post is liked or not
 * @access  Private (Authenticated Users)
 * @response {Message:"",Switch:bool} - An array of like objects created by the user
 * @response 401 - Unauthorized if user is not authenticated
 **/
router
  .route("/checkIfPostLiked/:postId")
  .get(isClient, catchAsync(likeController.getIfLiked));

module.exports = router;
