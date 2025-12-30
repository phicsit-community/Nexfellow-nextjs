const express = require("express");
const postController = require("../controllers/postController");
const catchAsync = require("../utils/CatchAsync");
const { isClient, isCommunityCreator } = require("../middleware");
const multer = require("multer");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../postsAttachments"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});
const router = express.Router();

/**
 * @route   POST /post
 * @desc    Create a new post with attachments
 * @access  Private (Only Community Creators)
 * @body    {
 *            title: String (required, minLength: 1, maxLength: 100),
 *            content: String (required, minLength: 1),
 *            community: ObjectId (required),
 *            private: Boolean (optional)
 *          }
 * @files   Array of files (under the key 'files') - Attachments for the post
 * @response { message: String, post: Object }
 * @response 401 - Unauthorized if user is not a community creator
 */
router.route("/").post(
  isClient,
  isCommunityCreator,
  upload.array("files", 4), // Limit to 4 files
  catchAsync(postController.createPost)
);

/**
 * @route   PUT /post/:postId
 * @desc    Update a specific post by ID
 * @access  Private (Only Community Creators)
 * @param   { postId: ObjectId } - ID of the post
 * @body    {
 *            title: String (optional),
 *            content: String (optional),
 *            private: Boolean (optional)
 *          }
 * @files   Array of files (optional) - New attachments
 * @response { message: String, post: Object }
 * @response 404 - Not Found if post does not exist
 * @response 403 - Forbidden if user is not a community creator
 */
router
  .route("/update/:postId")
  .put(
    isClient,
    isCommunityCreator,
    upload.array("files", 10),
    catchAsync(postController.updatePost)
  );

/**
 * @route   GET /post
 * @desc    Get all posts
 * @access  Public (No authentication required)
 * @response { posts: Array } - Array of post objects
 */
router.route("/").get(isClient, catchAsync(postController.getAllPosts));

/**
 * @route   GET /post/:postId
 * @desc    Get a specific post by ID
 * @access  Public
 * @param   { postId: ObjectId } - ID of the post
 * @response { post: Object }
 * @response 404 - Not Found if post does not exist
 */
router
  .route("/:postId")
  .get(isClient, catchAsync(postController.getPostById))

  /**
   * @route   DELETE /post/:postId
   * @desc    Delete a specific post by ID
   * @access  Private (Only Community Creators)
   * @param   { postId: ObjectId } - ID of the post
   * @response { message: String }
   * @response 404 - Not Found if post does not exist
   * @response 403 - Forbidden if user is not a community creator
   */
  .delete(isClient, isCommunityCreator, catchAsync(postController.deletePost));

/**
 * @route   GET /post/community/:communityId
 * @desc    Get all posts in a specific community
 * @access  Public
 * @param   { communityId: ObjectId } - ID of the community
 * @response { posts: Array } - Array of post objects
 */
router
  .route("/community/:communityId")
  .get(catchAsync(postController.getPostsByCommunity));

/**
 * @route   GET /post/followed-communities/posts
 * @desc    Get posts from communities followed by the user
 * @access  Private (Authenticated Users)
 * @response { posts: Array } - Array of post objects
 * @response 401 - Unauthorized if user is not authenticated
 */
router
  .route("/followed-communities/posts")
  .get(isClient, catchAsync(postController.getPostsByFollowedCommunities));

/**
 * @route   PATCH /post/:postId/pin
 * @desc    Toggle pin status of a post
 * @access  Private (Only Community Creators & Moderators)
 * @param   { postId: ObjectId } - ID of the post
 * @response { message: String, post: Object }
 * @response 403 - Forbidden if user is not a community creator or moderator
 */
router
  .route("/pin/:postId")
  .patch(
    isClient,
    isCommunityCreator,
    catchAsync(postController.togglePinPost)
  );

router
  .route("/increment-shares/:postId")
  .patch(isClient, catchAsync(postController.incrementPostShares));

router
  .route("/increment-views/:postId")
  .patch(isClient, catchAsync(postController.incrementPostViews));

/**
 * @route   POST /post/track-link-click/:postId
 * @desc    Track when a link within a post is clicked
 * @access  Private (Authenticated Users)
 * @param   { postId: ObjectId } - ID of the post
 * @body    { url: String } - The URL that was clicked
 * @response { message: String, clickCount: Number }
 */
router
  .route("/track-link-click/:postId")
  .post(isClient, catchAsync(postController.trackLinkClick));

router
  .route("/dynamic/feed")
  .get(isClient, catchAsync(postController.getDynamicFeedPosts));

module.exports = router;
