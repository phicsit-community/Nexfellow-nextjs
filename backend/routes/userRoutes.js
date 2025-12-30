const router = require("express").Router();
const user = require("../controllers/userController");
const catchAsync = require("../utils/CatchAsync");
const { isClient, upload } = require("../middleware.js");
const { registerLimiter, resendOtpLimiter } = require("../utils/rateLimiters");

router.route("/sendProfileDetails").get(isClient, catchAsync(user.profile));

router.route("/login").post(catchAsync(user.login));

router
  .route("/me/theme")
  .patch(isClient, catchAsync(user.updateThemePreference));

router.route("/otp/verify").post(catchAsync(user.verifyOtp));

router.route("/otp/resend").post(resendOtpLimiter, catchAsync(user.resendOtp));

router.route("/register").post(registerLimiter, catchAsync(user.register));

router.post("/otp/verify-register", catchAsync(user.verifyRegistrationOtp));

router.post(
  "/otp/resend-register",
  resendOtpLimiter,
  catchAsync(user.resendRegistrationOtp)
);

router
  .route("/sendverificationEmail/:userid")
  .post(catchAsync(user.sendUserVerificationEmail));

router.route("/verifyEmail/:userid/:token").get(catchAsync(user.verifyUser));

router.route("/logout").get(user.logout);

router.route("/forgotpassword").post(catchAsync(user.forgotPassword));

router
  .route("/resetpassword/:id/:token")
  .get((req, res) => {
    const { id, token } = req.params;
    res.render("resetpassword", { id, token });
  })
  .post(catchAsync(user.resetPassword));

router.route("/verifyResetOtp").post(catchAsync(user.verifyResetPasswordOtp));

router
  .route("/requestResetOtp")
  .post(catchAsync(user.requestPasswordResetOtp));

router.route("/contact").post(catchAsync(user.contactUs));

router.route("/profile").get(isClient, catchAsync(user.profile));

router.route("/profile/:id").get(isClient, catchAsync(user.getProfile));

router
  .route("/publicprofile/:id")
  .get(isClient, catchAsync(user.getPublicProfile));

router
  .route("/profile/username/:username")
  .get(isClient, catchAsync(user.getProfileByUsername));

router
  .route("/publicprofile/username/:username")
  .get(catchAsync(user.getPublicProfileByUsername));

router
  .route("/check-username/:username")
  .get(isClient, catchAsync(user.checkUsernameAvailability));

router.route("/updateprofile").post(
  isClient,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  // upload.single("photo"),

  catchAsync(user.updateProfile)
);

router.route("/getusers").get(isClient, catchAsync(user.getUsers));

router.route("/").get(catchAsync(user.getUsersbyFilters));

router
  .route("/community/request")
  .post(isClient, catchAsync(user.requestCommunityCreator));

router
  .route("/header-image")
  .post(isClient, upload.single("file"), catchAsync(user.uploadBannerImage));

router
  .route("/uploadImages")
  .post(
    isClient,
    upload.fields([{ name: "photo" }, { name: "banner" }]),
    catchAsync(user.uploadImages)
  );

router
  .route("/followings/:userId")
  .get(isClient, catchAsync(user.getUserFollowings));

router
  .route("/checkFollowing/:communityId")
  .get(isClient, catchAsync(user.checkFollowing));

router
  .route("/toggleFollow/:userId")
  .post(isClient, catchAsync(user.toggleFollowUser));

router
  .route("/followStatus/:userId")
  .get(isClient, catchAsync(user.checkFollowStatus));

router
  .route("/mutual-connections/:userId/:otherUserId")
  .get(isClient, catchAsync(user.getMutualConnections));

// Mute/Unmute user routes
router.route("/mute/:userId").post(isClient, catchAsync(user.muteUser));

router.route("/unmute/:userId").post(isClient, catchAsync(user.unmuteUser));

router.route("/muted-users").get(isClient, catchAsync(user.getMutedUsers));

// Block/Unblock user routes
router.route("/block/:userId").post(isClient, catchAsync(user.blockUser));
router.route("/unblock/:userId").post(isClient, catchAsync(user.unblockUser));
router.route("/blocked-users").get(isClient, catchAsync(user.getBlockedUsers));

// Hidden posts routes
router.route("/hide-post/:postId").post(isClient, catchAsync(user.hidePost));
router
  .route("/unhide-post/:postId")
  .post(isClient, catchAsync(user.unhidePost));
router.route("/hidden-posts").get(isClient, catchAsync(user.getHiddenPosts));
router
  .route("/is-post-hidden/:postId")
  .get(isClient, catchAsync(user.isPostHidden));

// Privacy settings routes
router
  .route("/privacy-settings")
  .get(isClient, catchAsync(user.getPrivacySettings))
  .patch(isClient, catchAsync(user.updatePrivacySettings));

// Follow/Unfollow community routes
router.route("/follow/:communityId").put(isClient, catchAsync(user.follow));

router.route("/unfollow/:communityId").put(isClient, catchAsync(user.unfollow));

module.exports = router;
