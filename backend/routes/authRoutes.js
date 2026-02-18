const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { isClient } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");

// Helper to get production-safe site URL for failure redirects
const getSiteUrl = () => {
  if (process.env.SITE_URL && process.env.SITE_URL !== "http://localhost:3000") {
    return process.env.SITE_URL;
  }
  if (process.env.RENDER || process.env.NODE_ENV === "production") {
    return "https://nexfellow-nextjs.vercel.app";
  }
  return process.env.SITE_URL || "http://localhost:3000";
};

const SITE_URL = getSiteUrl();

router.get("/google", (req, res, next) => {
  const state = req.query.state || "user";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "select_account consent",
    state: state,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: `${SITE_URL}/login`,
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
    failureRedirect: `${SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.githubCallback)
);

router.get("/linkedin", authController.linkedinAuth);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.linkedinCallback)
);

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${SITE_URL}/login`,
    session: false,
  }),
  catchAsync(authController.facebookCallback)
);

router.get("/getDetails", isClient, catchAsync(authController.getUserDetails));

router.post("/refresh-token", catchAsync(authController.refreshToken));

// Exchange OAuth code for cookies (for cross-domain auth)
router.post("/exchange-code", catchAsync(authController.exchangeOAuthCode));

router.get("/logout", authController.logout);

module.exports = router;
