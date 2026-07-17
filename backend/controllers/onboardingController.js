const User = require("../models/userModel");
const OnboardingProfile = require("../models/OnboardingProfile");
const CreditService = require("../services/creditService");

/**
 * @route   POST /api/onboarding/submit
 * @desc    Submit the full onboarding profile and mark user as onboarded
 * @access  Private
 * @body    { accountType, firstName, lastName, username, email, location, bio,
 *            skills, productStage, cofounderAvailability, cofounderLookingFor,
 *            reviewInterests, socialLinks }
 */
module.exports.submitOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;

    // If onboarding is already complete, treat resubmission as idempotent
    // rather than erroring — the client may retry after a stale redirect.
    const existing = await OnboardingProfile.findOne({
      userId,
      isOnboardingComplete: true,
    });
    if (existing) {
      res.cookie("isOnboarded", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production" || !!process.env.RENDER,
        sameSite:
          process.env.NODE_ENV === "production" || !!process.env.RENDER
            ? "none"
            : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        message: "Onboarding completed successfully",
        onboardingProfile: existing,
      });
    }

    const {
      accountType,
      firstName,
      lastName,
      username,
      email,
      location,
      city,
      state,
      country,
      bio,
      skills,
      productStage,
      cofounderAvailability,
      cofounderLookingFor,
      reviewInterests,
      socialLinks,
    } = req.body;

    if (!accountType || !firstName || !lastName || !username || !email) {
      return res
        .status(400)
        .json({ message: "Missing required onboarding fields" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate accountType
    if (!["individual", "community"].includes(accountType)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Validate cofounderAvailability if provided
    const VALID_COFOUND_AVAIL = ["actively-looking", "open-to-conversations", "building-solo", "advisor-mentor"];
    if (cofounderAvailability && !VALID_COFOUND_AVAIL.includes(cofounderAvailability)) {
      return res.status(400).json({ message: "Invalid cofounderAvailability value" });
    }

    // Validate array fields are actually arrays and within bounds
    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }
    if (skills && skills.length > 14) {
      return res.status(400).json({ message: "Maximum 14 skills allowed" });
    }
    if (cofounderLookingFor !== undefined && !Array.isArray(cofounderLookingFor)) {
      return res.status(400).json({ message: "cofounderLookingFor must be an array" });
    }
    if (reviewInterests !== undefined && !Array.isArray(reviewInterests)) {
      return res.status(400).json({ message: "reviewInterests must be an array" });
    }

    // Strip leading @ from username and validate length
    const cleanUsername = username.replace(/^@/, "").trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({ message: "Username may only contain letters, numbers, underscores, dots, and hyphens" });
    }

    // Strip HTML tags from free-text and social link fields to prevent stored XSS
    const stripHtml = (str) => (str ? String(str).replace(/<[^>]*>/g, "").trim() : "");
    const safeFirstName = stripHtml(firstName);
    const safeLastName  = stripHtml(lastName);
    const safeBio       = stripHtml(bio);
    const safeLocation  = stripHtml(location);
    const safeCity      = stripHtml(city);
    const safeState     = stripHtml(state);
    const safeCountry   = stripHtml(country);

    const safeSocialLinks = socialLinks && typeof socialLinks === "object" ? {
      twitter:   stripHtml(socialLinks.twitter),
      github:    stripHtml(socialLinks.github),
      linkedin:  stripHtml(socialLinks.linkedin),
      portfolio: stripHtml(socialLinks.portfolio),
    } : { twitter: "", github: "", linkedin: "", portfolio: "" };

    // Check username uniqueness against OnboardingProfile (same collection as the unique index)
    const usernameTaken = await OnboardingProfile.findOne({
      username: cleanUsername,
      userId: { $ne: userId },
    });
    if (usernameTaken) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    // Upsert the onboarding profile
    const onboardingProfile = await OnboardingProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        accountType,
        firstName: safeFirstName,
        lastName:  safeLastName,
        username:  cleanUsername,
        email,
        location:  safeLocation,
        city:      safeCity    || '',
        state:     safeState   || '',
        country:   safeCountry || '',
        bio:       safeBio,
        skills,
        productStage,
        cofounderAvailability,
        cofounderLookingFor,
        reviewInterests,
        socialLinks: safeSocialLinks,
        isOnboardingComplete: true,
        completedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true, context: "query" }
    );

    // Update the User document
    await User.findByIdAndUpdate(userId, {
      isOnboarded: true,
      onboardingProfile: onboardingProfile._id,
      name: `${firstName} ${lastName}`,
      username: cleanUsername,
    });

    // One-time profile completion bonus (idempotency key prevents re-award on retry)
    CreditService.award({
      userId: userId.toString(),
      eventCode: "PROFILE_COMPLETE",
      idempotencyKey: `PROFILE_COMPLETE:${userId}`,
    }).catch((err) => console.error("Credit (profile complete):", err.message));

    // Per-platform social link bonus — once per platform, safe to retry
    for (const platform of ["twitter", "github", "linkedin"]) {
      if (safeSocialLinks?.[platform]) {
        CreditService.award({
          userId: userId.toString(),
          eventCode: "SOCIAL_LINK",
          idempotencyKey: `SOCIAL_LINK:${userId}:${platform}`,
        }).catch((err) => console.error(`Credit (social link ${platform}):`, err.message));
      }
    }

    // Set isOnboarded cookie so the frontend can check without an API call
    const isProduction =
      process.env.NODE_ENV === "production" || !!process.env.RENDER;

    res.cookie("isOnboarded", "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(201).json({
      message: "Onboarding completed successfully",
      onboardingProfile,
    });
  } catch (err) {
    // Handle duplicate key errors for username conflicts
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username is already taken" });
    }
    throw err;
  }
};

/**
 * @route   GET /api/onboarding/status
 * @desc    Get onboarding status and saved profile data
 * @access  Private
 */
module.exports.getOnboardingStatus = async (req, res) => {
  const userId = req.user._id;

  const onboardingProfile = await OnboardingProfile.findOne({ userId });

  return res.status(200).json({
    isOnboardingComplete: onboardingProfile?.isOnboardingComplete || false,
    onboardingProfile: onboardingProfile || null,
  });
};

/**
 * @route   GET /api/onboarding/check-username/:username
 * @desc    Check if a username is available
 * @access  Private
 */
module.exports.checkUsername = async (req, res) => {
  const { username } = req.params;

  // Strip leading @
  const cleanUsername = String(username).replace(/^@/, "").trim();

  // Validate format before hitting the DB
  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    return res.status(400).json({ available: false, message: "Username must be between 3 and 30 characters" });
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    return res.status(400).json({ available: false, message: "Username contains invalid characters" });
  }

  const existing = await OnboardingProfile.findOne({
    username: cleanUsername,
  });

  // Available if not taken, or if it belongs to the current user
  const available =
    !existing || existing.userId.toString() === req.user._id.toString();

  return res.status(200).json({ available });
};
