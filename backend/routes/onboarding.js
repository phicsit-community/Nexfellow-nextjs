const router = require("express").Router();
const onboarding = require("../controllers/onboardingController");
const catchAsync = require("../utils/CatchAsync");
const { isClient } = require("../middleware.js");
const rateLimit = require("express-rate-limit");

const usernameCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 checks per minute per IP
  message: { message: "Too many username checks. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const onboardingSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                   // 5 submit attempts per hour per IP
  message: { message: "Too many onboarding submissions. Please try again later." },
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
