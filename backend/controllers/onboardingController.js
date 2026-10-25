const User = require("../models/userModel");
const OnboardingProfile = require("../models/OnboardingProfile");
const CreditService = require("../services/creditService");

const isProduction = () =>
  process.env.NODE_ENV === "production" || !!process.env.RENDER;

const setOnboardedCookie = (res) => {
  res.cookie("isOnboarded", "true", {
    httpOnly: false,
    secure: isProduction(),
    sameSite: isProduction() ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

const fullName = (firstName, lastName) =>
  [firstName, lastName].map((s) => String(s || "").trim()).filter(Boolean).join(" ");

// A username is only usable if neither collection holds it for someone else.
// The users collection matters most: it has its own unique index and holds the
// auto-generated signup usernames of everyone who hasn't onboarded yet, which
// never appear in OnboardingProfile.
async function usernameTakenByOther(username, userId) {
  const [userHit, profileHit] = await Promise.all([
    User.exists({ username, _id: { $ne: userId } }),
    OnboardingProfile.exists({ username, userId: { $ne: userId } }),
  ]);
  return !!(userHit || profileHit);
}

// Repair a User that never received its completed onboarding profile. The two
// are written separately, so an earlier failure (or a crash between the writes)
// can leave the profile complete while the User still says not onboarded and
// still carries the name Clerk copied from Google. Reads of onboarding state
// go through here so that gap closes itself instead of leaving the user
// bouncing between /feed and /onboarding.
//
// ONLY for users whose isOnboarded flag is still false. Once a user is
// onboarded the User record is the live one — edit-profile changes user.name
// and user.username without touching the profile's firstName/lastName — so
// copying the profile over an onboarded User would undo their later edits.
// For onboarded users use ensureProfileRef instead.
//
// Returns the username that could not be applied (held by another User), or
// null when the User now fully matches the profile.
async function syncUserToProfile(user, profile) {
  const update = {};
  const name = fullName(profile.firstName, profile.lastName);
  if (name && user.name !== name) update.name = name;
  if (!user.isOnboarded) update.isOnboarded = true;
  if (String(user.onboardingProfile || "") !== String(profile._id)) {
    update.onboardingProfile = profile._id;
  }

  let usernameConflict = null;
  if (profile.username && user.username !== profile.username) {
    const held = await User.exists({ username: profile.username, _id: { $ne: user._id } });
    if (held) usernameConflict = profile.username;
    else update.username = profile.username;
  }

  if (Object.keys(update).length) {
    try {
      await User.findByIdAndUpdate(user._id, { $set: update });
    } catch (err) {
      // Lost a race for the username — keep everything else in sync.
      if (err.code !== 11000 || !update.username) throw err;
      usernameConflict = update.username;
      delete update.username;
      if (Object.keys(update).length) {
        await User.findByIdAndUpdate(user._id, { $set: update });
      }
    }
  }

  return usernameConflict;
}

// For an onboarded user the only thing worth fixing is a missing or wrong
// onboardingProfile reference; name and username are left alone (see above).
async function ensureProfileRef(user, profile) {
  if (String(user.onboardingProfile || "") === String(profile._id)) return;
  await User.findByIdAndUpdate(user._id, { $set: { onboardingProfile: profile._id } });
}

/**
 * @route   POST /api/onboarding
 * @desc    Submit the full onboarding profile and mark user as onboarded
 * @access  Private
 * @body    { accountType, firstName, lastName, username, email, location, bio,
 *            skills, productStage, cofounderAvailability, cofounderLookingFor,
 *            reviewInterests, socialLinks }
 */
module.exports.submitOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;

    // Already done: treat resubmission as idempotent rather than erroring —
    // the client may retry after a stale redirect. Only short-circuit when the
    // User record agrees; if the profile is complete but the User isn't marked
    // onboarded, fall through and let this submission repair it.
    const existing = await OnboardingProfile.findOne({
      userId,
      isOnboardingComplete: true,
    });
    if (existing && req.user.isOnboarded) {
      await ensureProfileRef(req.user, existing);
      setOnboardedCookie(res);
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

    const REQUIRED_FIELDS = { accountType, firstName, lastName, username, email };
    const missing = Object.keys(REQUIRED_FIELDS).filter(
      (key) => !String(REQUIRED_FIELDS[key] ?? "").trim()
    );
    if (missing.length) {
      return res.status(400).json({
        message: `Missing required onboarding fields: ${missing.join(", ")}`,
        missingFields: missing,
      });
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
    const cleanUsername = String(username).replace(/^@/, "").trim();
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

    if (!safeFirstName || !safeLastName) {
      return res.status(400).json({
        message: "Missing required onboarding fields: firstName, lastName",
        missingFields: ["firstName", "lastName"].filter((f) => (f === "firstName" ? !safeFirstName : !safeLastName)),
      });
    }

    const safeSocialLinks = socialLinks && typeof socialLinks === "object" ? {
      twitter:   stripHtml(socialLinks.twitter),
      github:    stripHtml(socialLinks.github),
      linkedin:  stripHtml(socialLinks.linkedin),
      portfolio: stripHtml(socialLinks.portfolio),
    } : { twitter: "", github: "", linkedin: "", portfolio: "" };

    if (await usernameTakenByOther(cleanUsername, userId)) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    // Write order matters. The User's name/username go first: that write is
    // the one that can fail on the users.username unique index, and failing
    // here leaves the account exactly as it was (still not onboarded). Only
    // once it succeeds is the profile marked complete and the User flagged
    // onboarded, so there is never a window where the profile says "done"
    // but the User says otherwise.
    const displayName = fullName(safeFirstName, safeLastName);
    await User.findByIdAndUpdate(userId, {
      $set: { name: displayName, username: cleanUsername },
    });

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

    await User.findByIdAndUpdate(userId, {
      $set: { isOnboarded: true, onboardingProfile: onboardingProfile._id },
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
    setOnboardedCookie(res);

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
 * @route   GET /api/onboarding
 * @desc    Get onboarding status and saved profile data
 * @access  Private
 *
 * `isOnboardingComplete` is only true once the User record is marked
 * onboarded too, so this endpoint and /auth/getDetails can never disagree.
 * A complete profile with an un-flagged User is repaired here; if that fails
 * because the profile's username has since been taken by another account,
 * the user is sent back through onboarding with `usernameConflict` set so the
 * client can ask for a new one.
 */
module.exports.getOnboardingStatus = async (req, res) => {
  const user = req.user;

  const onboardingProfile = await OnboardingProfile.findOne({ userId: user._id });

  let isOnboardingComplete = false;
  let usernameConflict = null;

  if (onboardingProfile?.isOnboardingComplete) {
    if (user.isOnboarded) {
      isOnboardingComplete = true;
      // Cheap self-heal for a missing profile reference — never blocks the user.
      ensureProfileRef(user, onboardingProfile).catch((err) =>
        console.error("[onboarding] status ref sync failed:", err.message)
      );
    } else {
      usernameConflict = await syncUserToProfile(user, onboardingProfile);
      isOnboardingComplete = !usernameConflict;
      if (usernameConflict) {
        // Undo the completion marker so the next submit goes through the
        // full path and the user picks a free username.
        await User.findByIdAndUpdate(user._id, { $set: { isOnboarded: false } });
        onboardingProfile.isOnboardingComplete = false;
        await onboardingProfile.save();
        console.warn(
          `[onboarding] user ${user._id}: profile username "${usernameConflict}" is held by another account; re-opening onboarding`
        );
      } else {
        console.log(`[onboarding] repaired User ${user._id} from completed profile`);
      }
    }
  }

  if (isOnboardingComplete) setOnboardedCookie(res);

  return res.status(200).json({
    isOnboardingComplete,
    usernameConflict,
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

  // Available only if no other account holds it in either collection; the
  // user's own current username (auto-generated or previously chosen) is fine.
  const available = !(await usernameTakenByOther(cleanUsername, req.user._id));

  return res.status(200).json({ available });
};

module.exports.syncUserToProfile = syncUserToProfile;
module.exports.ensureProfileRef = ensureProfileRef;
