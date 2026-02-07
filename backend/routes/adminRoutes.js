const router = require("express").Router();
const catchAsync = require("../utils/CatchAsync");
const admin = require("../controllers/adminController.js");
const featuredCommunitiesController = require("../controllers/featuredCommunitiesController");
const { isClient, isAdmin, upload } = require("../middleware.js");

router.route("/login").post(catchAsync(admin.adminlogin));
router.route("/logout").get(admin.adminlogout);
router.route("/register").post(catchAsync(admin.adminregister));

// Quiz routes
router
  .route("/createquiz")
  .post(isAdmin, upload.any(), catchAsync(admin.createQuiz));
router
  .route("/updatequiz/:quizid")
  .put(isAdmin, upload.any(), catchAsync(admin.updateQuiz));
router
  .route("/deletequiz/:quizid")
  .delete(isAdmin, catchAsync(admin.deleteQuiz));

// Question routes
router
  .route("/createquestion/:quizid")
  .post(isAdmin, catchAsync(admin.createQuestion));
router
  .route("/updatequestion/:questionid")
  .post(isAdmin, catchAsync(admin.updateQuestion));
router
  .route("/deletequestion/:questionid")
  .delete(isAdmin, catchAsync(admin.deleteQuestion));

// Quiz data routes
router.route("/getquizzes/:adminid").get(isAdmin, catchAsync(admin.getQuizzes));
router.route("/getquiz/:quizid").get(isAdmin, catchAsync(admin.getQuiz));
router
  .route("/getquestions/:quizid")
  .get(isAdmin, catchAsync(admin.getQuestions));
router
  .route("/getquestion/:questionId")
  .get(isAdmin, catchAsync(admin.getQuestionByQuestionId));
router
  .route("/compileResults/:quizid")
  .get(isAdmin, catchAsync(admin.compileResults));

// User management routes
router
  .route("/referral-details")
  .get(isAdmin, catchAsync(admin.referralDetails));
router.route("/givebadge/:id").put(isAdmin, catchAsync(admin.giveVerifyBadge));
router
  .route("/communitybadge/:id")
  .put(isAdmin, catchAsync(admin.giveCommunityBadge));
router
  .route("/premiumbadge/:id")
  .put(isAdmin, catchAsync(admin.givePremiumBadge));
router
  .route("/:adminId/registered-users")
  .get(isAdmin, catchAsync(admin.getRegisteredUsersByAdmin));
router
  .route("/toggleCommunityCreator")
  .post(isAdmin, catchAsync(admin.toggleCommunityCreatorAccount));
router
  .route("/deleteuser/:userId")
  .delete(isAdmin, catchAsync(admin.deleteUser));

// Community routes
router
  .route("/communities")
  .get(isAdmin, catchAsync(admin.getAllCommunities));

router
  .route("/featured-communities")
  .get(isAdmin, catchAsync(featuredCommunitiesController.getFeaturedCommunities));

// --------------------------
// NEW POST CONTROL ROUTES
// --------------------------
router.route("/posts").get(isAdmin, catchAsync(admin.adminGetAllPosts));

router
  .route("/posts/community/:communityId")
  .get(isAdmin, catchAsync(admin.adminGetPostsByCommunity));

router
  .route("/posts/:postId")
  .delete(isAdmin, catchAsync(admin.adminDeletePost));

router
  .route("/posts/:postId/takedown")
  .patch(isAdmin, catchAsync(admin.adminTakedownPost));

router
  .route("/posts/:postId/restore")
  .patch(isAdmin, catchAsync(admin.adminRestorePost));

router
  .route("/posts/:postId/reject-appeal")
  .post(isAdmin, catchAsync(admin.adminRejectPostAppeal));

// Note: This route doesn't require admin privileges - regular users can request reviews
router
  .route("/posts/:postId/request-review")
  .post(isClient, catchAsync(admin.requestPostReview));

router.get(
  "/recent-notifications",
  isAdmin,
  catchAsync(admin.getRecentNotifications)
);

router.get(
  "/active-users/count",
  isAdmin,
  catchAsync(admin.getActiveUserCount)
);

module.exports = router;
