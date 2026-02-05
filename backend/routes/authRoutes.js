const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { isClient } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "select_account consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: `${process.env.SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.googleCallback)
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.githubCallback)
);

router.get("/linkedin", authController.linkedinAuth);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${process.env.SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.linkedinCallback)
);

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.facebookCallback)
);

router.get("/getDetails", isClient, catchAsync(authController.getUserDetails));

router.post("/refresh-token", catchAsync(authController.refreshToken));

router.get("/logout", authController.logout);

module.exports = router;
