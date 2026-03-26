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
 */
router.route("/").post(
  isClient,
  isCommunityCreator,
  upload.array("files", 4),
  catchAsync(postController.createPost)
);

/**
 * @route   PUT /post/update/:postId
 * @desc    Update a specific post by ID
 * @access  Private (Only Community Creators)
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
 * @desc    Get all posts (Newest)
 * @access  Private
 */
router.route("/").get(isClient, catchAsync(postController.getAllPosts));

/**
 * @route   GET /post/trending/posts
 * @desc    Get trending posts
 * @access  Private
 */
router
  .route("/trending/posts")
  .get(isClient, catchAsync(postController.getTrendingPosts));

/**
 * @route   GET /post/followed-communities/posts
 * @desc    Get posts from followed communities + followed users
 * @access  Private
 */
router
  .route("/followed-communities/posts")
  .get(isClient, catchAsync(postController.getPostsByFollowedCommunities));

/**
 * @route   GET /post/dynamic/feed
 * @desc    Get dynamic feed posts
 * @access  Private
 */
router
  .route("/dynamic/feed")
  .get(isClient, catchAsync(postController.getDynamicFeedPosts));

/**
 * @route   GET /post/community/:communityId
 * @desc    Get all posts in a specific community
 * @access  Public
 */
router
  .route("/community/:communityId")
  .get(catchAsync(postController.getPostsByCommunity));

/**
 * @route   PATCH /post/pin/:postId
 * @desc    Toggle pin status of a post
 * @access  Private (Only Community Creators & Moderators)
 */
router
  .route("/pin/:postId")
  .patch(
    isClient,
    isCommunityCreator,
    catchAsync(postController.togglePinPost)
  );

/**
 * @route   PATCH /post/increment-shares/:postId
 * @desc    Increment share count of a post
 * @access  Private
 */
router
  .route("/increment-shares/:postId")
  .patch(isClient, catchAsync(postController.incrementPostShares));

/**
 * @route   PATCH /post/increment-views/:postId
 * @desc    Increment view count of a post
 * @access  Private
 */
router
  .route("/increment-views/:postId")
  .patch(isClient, catchAsync(postController.incrementPostViews));

/**
 * @route   POST /post/track-link-click/:postId
 * @desc    Track link clicks in a post
 * @access  Private
 */
router
  .route("/track-link-click/:postId")
  .post(isClient, catchAsync(postController.trackLinkClick));

/**
 * @route   GET /post/:postId
 * @desc    Get a specific post by ID
 * @route   DELETE /post/:postId
 * @desc    Delete a specific post by ID
 * @access  Private
 * ⚠️ Keep this LAST — wildcard route
 */
router
  .route("/:postId")
  .get(isClient, catchAsync(postController.getPostById))
  .delete(isClient, isCommunityCreator, catchAsync(postController.deletePost));

module.exports = router;