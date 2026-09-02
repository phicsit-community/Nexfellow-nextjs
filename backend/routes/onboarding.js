const router = require("express").Router();
const onboarding = require("../controllers/onboardingController");
const catchAsync = require("../utils/CatchAsync");
const { isClient } = require("../middleware.js");
const rateLimit = require("express-rate-limit");

// These routes sit behind isClient, so req.user is always set by the time a
// limiter runs. Key on the user id rather than the IP — keying on IP means
// everyone behind one NAT (office/campus wifi, mobile CGNAT, VPN) shares a
// single bucket, so the 6th person to sign up from that network was blocked
// before they ever submitted once.
const ipFallback = (req) => {
  const ip = req.ip || "unknown";
  // Collapse IPv6 to its /64 prefix; a single client can hold many addresses
  // in its subnet and would otherwise get an unlimited supply of keys.
  return ip.includes(":") ? ip.split(":").slice(0, 4).join(":") + "::/64" : ip;
};

const byUser = (req) => (req.user?._id ? `u:${req.user._id}` : `ip:${ipFallback(req)}`);

const limitHandler = (message) => (req, res) => {
  const retryAfterSec = Math.max(
    1,
    Math.ceil(((req.rateLimit?.resetTime?.getTime() ?? Date.now()) - Date.now()) / 1000)
  );
  res.status(429).json({ message, retryAfter: retryAfterSec });
};

const usernameCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 checks per minute per user
  keyGenerator: byUser,
  handler: limitHandler("Too many username checks. Please slow down."),
  standardHeaders: true,
  legacyHeaders: false,
});

const onboardingSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 submit attempts per hour per user
  keyGenerator: byUser,
  // A completed onboarding shouldn't eat into the budget: the controller is
  // idempotent on resubmit, and the client may retry after a stale redirect.
  // Only failed attempts (validation errors, taken usernames) count, so a user
  // fumbling the form can still recover instead of being locked out of signup.
  skipSuccessfulRequests: true,
  handler: limitHandler("Too many onboarding submissions. Please try again later."),
  standardHeaders: true,
  legacyHeaders: false,
});

// All onboarding routes require authentication
router.use(isClient);

router
  .route("/")
  .post(onboardingSubmitLimiter, catchAsync(onboarding.submitOnboarding))
  .get(catchAsync(onboarding.getOnboardingStatus));

router
  .route("/check-username/:username")
  .get(usernameCheckLimiter, catchAsync(onboarding.checkUsername));

module.exports = router;
