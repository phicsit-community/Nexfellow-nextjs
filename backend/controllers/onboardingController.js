const User = require("../models/userModel");
const OnboardingProfile = require("../models/OnboardingProfile");

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

    // Check if onboarding is already complete
    const existing = await OnboardingProfile.findOne({
      userId,
      isOnboardingComplete: true,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Onboarding has already been completed" });
    }

    const {
      accountType,
      firstName,
      lastName,
      username,
      email,
      location,
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

    // Strip leading @ from username and validate length
    const cleanUsername = username.replace(/^@/, "").trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({ message: "Username may only contain letters, numbers, underscores, dots, and hyphens" });
    }

    // Strip HTML tags from free-text fields to prevent stored XSS
    const stripHtml = (str) => (str ? String(str).replace(/<[^>]*>/g, "").trim() : str);
    const safeFirstName = stripHtml(firstName);
    const safeLastName  = stripHtml(lastName);
    const safeBio       = stripHtml(bio);
    const safeLocation  = stripHtml(location);

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
        bio:       safeBio,
        skills,
        productStage,
        cofounderAvailability,
        cofounderLookingFor,
        reviewInterests,
        socialLinks,
        isOnboardingComplete: true,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update the User document
    await User.findByIdAndUpdate(userId, {
      isOnboarded: true,
      onboardingProfile: onboardingProfile._id,
      name: `${firstName} ${lastName}`,
      username: cleanUsername,
    });

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
  const cleanUsername = username.replace(/^@/, "");

  const existing = await OnboardingProfile.findOne({
    username: cleanUsername,
  });

  // Available if not taken, or if it belongs to the current user
  const available =
    !existing || existing.userId.toString() === req.user._id.toString();

  return res.status(200).json({ available });
};
