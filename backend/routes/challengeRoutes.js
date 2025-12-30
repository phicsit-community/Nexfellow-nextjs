const router = require("express").Router();
const challenge = require("../controllers/challengeController.js");
const {
  isClient,
  isAuthenticated,
  isCommunityCreator,
  isOwnerOrModeratorWithRole,
} = require("../middleware.js");
const catchAsync = require("../utils/CatchAsync");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Public routes (no authentication required)
router.route("/public").get(catchAsync(challenge.getAllChallenges));
router.route("/create").get((req, res) => {
  res.json({ title: "Create Challenge" });
});
router
  .route("/public/:challengeId")
  .get(catchAsync(challenge.getChallengeDetails));

// Authenticated user routes
router
  .route("/enroll/:challengeId")
  .post(isClient, catchAsync(challenge.enrollInChallenge));

router
  .route("/:challengeId/submit/:day")
  .post(
    isClient,
    upload.single("attachment"),
    catchAsync(challenge.submitForDay)
  );

router
  .route("/:challengeId/progress")
  .get(isClient, catchAsync(challenge.getUserProgress));

router
  .route("/my/enrolled")
  .get(isClient, catchAsync(challenge.getMyEnrolledChallenges));

// User activity routes
router
  .route("/:challengeId/user/:userId/activity")
  .get(isAuthenticated, catchAsync(challenge.getChallengeActivityByUser));

// Community creator routes
router
  .route("/create")
  .post(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    upload.single("coverImage"),
    catchAsync(challenge.createChallenge)
  );

router.route("/:challengeId/leaderboard").get(
  isAuthenticated,
  // isCommunityCreator,
  catchAsync(challenge.getChallengeLeaderboard)
);

router
  .route("/community/:communityId/created")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getMyCreatedChallenges)
  );

router
  .route("/:challengeId")
  .put(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    upload.single("coverImage"),
    catchAsync(challenge.updateChallenge)
  )
  .delete(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.deleteChallenge)
  );

router
  .route("/:challengeId/status")
  .put(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.updateChallengeStatus)
  );

// Creator dashboard routes
router
  .route("/:challengeId/analytics")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getChallengeAnalytics)
  );

router
  .route("/:challengeId/submissions")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getSubmissionsForReview)
  );

router
  .route("/:challengeId/submissions/:submissionId/review")
  .put(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.reviewSubmission)
  );

router
  .route("/:challengeId/activity")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getChallengeActivity)
  );

// Reward assignment route
router
  .route("/:challengeId/rewards")
  .post(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.assignRewards)
  );

// Admin dashboard routes
router
  .route("/:challengeId/admin/dashboard")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getAdminDashboard)
  );

router
  .route("/:challengeId/admin/bulk-approve")
  .post(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.bulkApproveSubmissions)
  );

router
  .route("/:challengeId/admin/bulk-reject")
  .post(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.bulkRejectSubmissions)
  );

// Participants route
router
  .route("/:challengeId/participants")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getParticipants)
  );

// Backward compatibility routes
router.route("/getAllChallenges").get(catchAsync(challenge.getAllChallenges));
router
  .route("/:communityId/active-challenges")
  .get(catchAsync(challenge.getChallengesByCommunity));

router
  .route("/getChallenge/:challengeId")
  .get(catchAsync(challenge.getChallengeDetails));

// Admin challenge details route
router
  .route("/:challengeId/admin")
  .get(
    isAuthenticated,
    isCommunityCreator,
    isOwnerOrModeratorWithRole(["event-admin"]),
    catchAsync(challenge.getChallengeDetailsAdmin)
  );

module.exports = router;
