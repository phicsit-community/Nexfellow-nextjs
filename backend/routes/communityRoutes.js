const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const communityController = require("../controllers/communityController");
const catchAsync = require("../utils/CatchAsync");
const { isClient, isCommunityCreator, isAdmin } = require("../middleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "header-images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/**
 * @route   POST /create
 * @desc    Create a new community
 * @access  Private (Only logged-in users - Community Creator)
 * @body    { name: String, profile: String }
 */
router
  .route("/create")
  .post(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.createCommunity)
  );

/**
 * @route   GET /
 * @desc    Retrieve all communities
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/")
  .get(isClient, catchAsync(communityController.getAllCommunities));

/**
 * @route   GET /:communityId
 * @desc    Get community details by ID
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/id/:communityId")
  .get(isClient, catchAsync(communityController.getCommunityById));

/**
 * @route   GET /:username
 * @desc    Get community details by ID
 * @access  Public (Anyone)
 * @param   {String} username - The username of the community to retrieve
 */
router
  .route("/username/:username")
  .get(catchAsync(communityController.getCommunityByUsername))

  /**
   * @route   PUT /:communityId
   * @desc    Update community information by ID
   * @access  Private (Only logged-in users - Community Creator)
   */
  .put(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.updateCommunity)
  )

  /**
   * @route   DELETE /:communityId
   * @desc    Soft delete a community by marking it as deleted
   * @access  Private (Only Community Creators)
   */
  .delete(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.deleteCommunity)
  );

/**
 * @route   POST /:communityId/membership
 * @desc    Follow or unfollow a community (toggle membership)
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/:communityId/membership")
  .post(isClient, catchAsync(communityController.toggleCommunityMembership));

/**
 * @route   POST /:communityId/approve
 * @desc    Approve a community (set isApproved to true)
 * @access  Private (Only Community Creators)
 */
router
  .route("/:communityId/approve")
  .post(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.approveCommunity)
  );

/**
 * @route   GET /search
 * @desc    Search for communities by name
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/search")
  .get(isClient, catchAsync(communityController.searchCommunities));

/**
 * @route   GET /user/:userId
 * @desc    Get all communities associated with a specific user
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/user/:userId")
  .get(isClient, catchAsync(communityController.getUserCommunities));

/**
 * @route   PATCH /:id/appraisals
 * @desc    Toggle the requesting user in the community appraisals list
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/:id/appraisals")
  .patch(isClient, catchAsync(communityController.toggleAppraisals));

/**
 * @route   PATCH /:id/top-members
 * @desc    Update the top members list for a community
 * @access  Private (Only admins or community owners)
 */
router
  .route("/:id/top-members")
  .patch(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.editTopMembers)
  )
  /**
   * @route   GET /:id/top-members
   * @desc    Retrieve the top members list for a community
   * @access  Public
   */
  .get(catchAsync(communityController.getTopMembers));

/**
 * @route   GET /:communityId/moderators
 * @desc    Get moderators/admins/owners of a specific community
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/:communityId/moderators")
  .get(isClient, catchAsync(communityController.getModerators));

/**
 * @route   POST /:communityId/get-users-roles
 * @desc    Get users' roles in the community (for frontend)
 * @access  Private (Only logged-in users - Client)
 * @body    { userIds: [String] }
 */
router
  .route("/:communityId/get-users-roles")
  .post(isClient, catchAsync(communityController.getUsersWithRoles));

/**
 * @route   PATCH /:communityId/role
 * @desc    Change a user's role (member/moderator/admin)
 * @access  Private (Only logged-in users - Community Creator)
 * @body    { userId: String, role: String }
 */
router
  .route("/:communityId/role")
  .patch(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.editRole)
  );

/**
 * @route   POST /:communityId/transfer-ownership
 * @desc    Transfer community ownership to another user
 * @access  Private (Only current owner)
 * @body    { fromUserId: String, toUserId: String }
 */
router
  .route("/:communityId/transfer-ownership")
  .post(
    isClient,
    isCommunityCreator,
    catchAsync(communityController.transferOwnership)
  );

/**
 * @route   GET /moderator/communities
 * @desc    Get all communities where the user is a moderator, admin, or owner
 * @access  Private (Only logged-in users)
 */
router
  .route("/moderator/communities")
  .get(isClient, catchAsync(communityController.getMyModeratedCommunities));

router
  .route("/followers/:communityId")
  .get(isClient, catchAsync(communityController.getCommunityFollowers));

router.put(
  "/:communityId/link",
  isClient,
  isCommunityCreator,
  communityController.addOrUpdateLink
);
router.delete(
  "/:communityId/link",
  isClient,
  isCommunityCreator,
  communityController.deleteLink
);

/**
 * @route   GET /:communityId/follow-status
 * @desc    Check if a user is following a specific community
 * @access  Private (Only logged-in users - Client)
 */
router
  .route("/:communityId/follow-status")
  .get(isClient, catchAsync(communityController.checkFollowStatus));

router
  .route("/:communityId/featured-members")
  .get(isClient, catchAsync(communityController.getFeaturedMembers));

/**
 * @route   POST /:communityId/pin-post/:postId
 * @desc    Pin a post to the community profile
 * @access  Private (Only community owners and moderators)
 */
router
  .route("/:communityId/pin-post/:postId")
  .post(isClient, catchAsync(communityController.pinPost));

/**
 * @route   DELETE /:communityId/pin-post
 * @desc    Unpin the current pinned post from community profile
 * @access  Private (Only community owners and moderators)
 */
router
  .route("/:communityId/pin-post")
  .delete(isClient, catchAsync(communityController.unpinPost));

module.exports = router;
