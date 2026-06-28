const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");

// Helper to get production-safe site URL for failure redirects
const getSiteUrl = () => {
  if (process.env.SITE_URL && process.env.SITE_URL !== "http://localhost:3000") {
    return process.env.SITE_URL;
  }
  if (process.env.RENDER || process.env.NODE_ENV === "production") {
    return "https://nexfellow-nextjs-1.onrender.com";
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
  (req, res, next) => {
    // If the state matches a connect code, bypass passport and handle as account-linking
    if (authController.isConnectState(req.query.state)) {
      return catchAsync(authController.githubConnectCallback)(req, res, next);
    }
    passport.authenticate("github", {
      failureRedirect: `${SITE_URL}/login`,
      session: false,
    })(req, res, next);
  },
  catchAsync(authController.githubCallback)
);

router.get("/linkedin", authController.linkedinAuth);

router.get(
  "/linkedin/callback",
  (req, res, next) => {
    // If the state matches a connect code, bypass passport and handle as account-linking
    if (authController.isConnectState(req.query.state)) {
      return catchAsync(authController.linkedinConnectCallback)(req, res, next);
    }
    passport.authenticate("linkedin", {
      failureRedirect: `${SITE_URL}/login`,
      session: false,
    })(req, res, next);
  },
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

router.get("/getDetails", requireAuth, catchAsync(authController.getUserDetails));

router.post("/refresh-token", catchAsync(authController.refreshToken));

// Exchange OAuth code for cookies (for cross-domain auth)
router.post("/exchange-code", catchAsync(authController.exchangeOAuthCode));

// Account connect routes (link additional OAuth platforms to an existing account)
// GitHub and LinkedIn reuse their login callbacks (detected via state param); Twitter has its own callback
router.post("/connect/init", requireAuth, catchAsync(authController.initiateConnect));
router.get("/connect/twitter/callback", catchAsync(authController.twitterConnectCallback));

router.get("/logout", authController.logout);

module.exports = router;
