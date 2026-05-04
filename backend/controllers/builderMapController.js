const mongoose = require("mongoose");
const OnboardingProfile = require("../models/OnboardingProfile");
const Product = require("../models/productModel");

// Allowed enum values — kept in sync with OnboardingProfile schema
const VALID_SKILLS = [
  "Full-stack dev", "Frontend dev", "Backend dev", "Mobile dev",
  "Product design", "UI/UX", "Product strategy", "Growth hacking",
  "Marketing", "Sales", "AI / ML", "No-code / low-code",
  "Fundraising", "Operations",
];
const VALID_COFOUND_AVAIL = [
  "actively-looking", "open-to-conversations", "building-solo", "advisor-mentor",
];

const NOW_LABEL = {
  launched:  (name) => `Just launched ${name}`,
  in_review: (name) => `Getting feedback on ${name}`,
  draft:     (name) => `Working on ${name}`,
};

// Status priority for nowStatus: active states first
const STATUS_PRIORITY = { launched: 0, in_review: 1, draft: 2 };

/**
 * @route  GET /buildermap/builders
 * @desc   All onboarded builders with location data (map nodes)
 * @query  skill, cofounderAvailability, page, limit
 */
module.exports.getBuilders = async (req, res) => {
  let { skill, cofounderAvailability, page, limit } = req.query;

  // Validate and sanitise pagination
  page  = Math.max(parseInt(page,  10) || 1, 1);
  limit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
  const skip = (page - 1) * limit;

  // Validate enum filter values to prevent MongoDB operator injection
  if (skill && !VALID_SKILLS.includes(skill)) {
    return res.status(400).json({ message: "Invalid skill filter value" });
  }
  if (cofounderAvailability && !VALID_COFOUND_AVAIL.includes(cofounderAvailability)) {
    return res.status(400).json({ message: "Invalid cofounderAvailability filter value" });
  }

  const filter = {
    isOnboardingComplete: true,
    $or: [
      { city:    { $ne: "" } },
      { state:   { $ne: "" } },
      { country: { $ne: "" } },
    ],
  };
  if (skill)                 filter.skills               = skill;
  if (cofounderAvailability) filter.cofounderAvailability = cofounderAvailability;

  // Run count and fetch in parallel
  const [total, profiles] = await Promise.all([
    OnboardingProfile.countDocuments(filter),
    OnboardingProfile.find(filter)
      .populate("userId", "name username picture")
      .select("userId firstName lastName skills cofounderAvailability cofounderLookingFor city state country location bio")
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const builders = profiles
    .filter((p) => p.userId)
    .map((p) => ({
      userId:                p.userId._id,
      name:                  p.userId.name,
      username:              p.userId.username,
      picture:               p.userId.picture,
      firstName:             p.firstName,
      lastName:              p.lastName,
      city:                  p.city,
      state:                 p.state,
      country:               p.country,
      location:              p.location,
      bio:                   p.bio,
      skills:                p.skills,
      cofounderAvailability: p.cofounderAvailability,
      cofounderLookingFor:   p.cofounderLookingFor,
    }));

  return res.status(200).json({ builders, total, page, limit });
};

/**
 * @route  GET /buildermap/builders/:userId
 * @desc   Full builder profile + products for detail popup
 */
module.exports.getBuilderDetail = async (req, res) => {
  const { userId } = req.params;

  // Validate ObjectId before hitting the DB to avoid CastError 500s
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const profile = await OnboardingProfile.findOne({ userId })
    .populate("userId", "name username picture banner")
    .lean();

  if (!profile || !profile.userId) {
    return res.status(404).json({ message: "Builder not found" });
  }

  // Only expose publicly visible products (not drafts — those are private)
  const products = await Product.find({
    owner: userId,
    status: { $in: ["in_review", "launched"] },
  })
    .sort({ launchedAt: -1, submittedAt: -1 })
    .select("name tagline category buildStage status upvoteCount screenshots productUrl submittedAt launchedAt")
    .lean();

  // Derive "Now" status — check all products (including drafts) prioritising active states
  const allProducts = await Product.find({ owner: userId, status: { $ne: "archived" } })
    .sort({ updatedAt: -1 })
    .select("name status")
    .lean();

  const bestProduct = allProducts.sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 3) - (STATUS_PRIORITY[b.status] ?? 3)
  )[0];

  const nowStatus = bestProduct
    ? (NOW_LABEL[bestProduct.status]?.(bestProduct.name) ?? `Building ${bestProduct.name}`)
    : null;

  return res.status(200).json({
    profile: {
      userId:                profile.userId._id,
      name:                  profile.userId.name,
      username:              profile.userId.username,
      picture:               profile.userId.picture,
      banner:                profile.userId.banner,
      firstName:             profile.firstName,
      lastName:              profile.lastName,
      bio:                   profile.bio,
      city:                  profile.city,
      state:                 profile.state,
      country:               profile.country,
      location:              profile.location,
      skills:                profile.skills,
      cofounderAvailability: profile.cofounderAvailability,
      cofounderLookingFor:   profile.cofounderLookingFor,
      reviewInterests:       profile.reviewInterests,
      socialLinks:           profile.socialLinks,
      accountType:           profile.accountType,
    },
    nowStatus,
    products,
  });
};

/**
 * @route  GET /buildermap/nearby
 * @desc   Builders near the current user, sorted by proximity tier
 *         tier 1 = same city, 2 = same state, 3 = same country, 4 = elsewhere
 */
module.exports.getNearby = async (req, res) => {
  const myProfile = await OnboardingProfile.findOne({ userId: req.user._id }).lean();

  if (!myProfile) {
    return res.status(200).json({ builders: [], myLocation: null });
  }

  const { city, state, country } = myProfile;

  const profiles = await OnboardingProfile.find({
    isOnboardingComplete: true,
    userId: { $ne: req.user._id },
    $or: [
      { city:    { $ne: "" } },
      { state:   { $ne: "" } },
      { country: { $ne: "" } },
    ],
  })
    .populate("userId", "name username picture")
    .select("userId firstName lastName city state country skills cofounderAvailability bio")
    .lean();

  const builders = profiles
    .filter((p) => p.userId)
    .map((p) => {
      const tier =
        city    && p.city    && p.city    === city    ? 1 :
        state   && p.state   && p.state   === state   ? 2 :
        country && p.country && p.country === country ? 3 : 4;
      return {
        userId:                p.userId._id,
        name:                  p.userId.name,
        username:              p.userId.username,
        picture:               p.userId.picture,
        firstName:             p.firstName,
        lastName:              p.lastName,
        city:                  p.city,
        state:                 p.state,
        country:               p.country,
        bio:                   p.bio,
        skills:                p.skills,
        cofounderAvailability: p.cofounderAvailability,
        tier,
      };
    })
    .sort((a, b) => a.tier - b.tier);

  return res.status(200).json({
    myLocation: { city, state, country },
    builders,
  });
};

/**
 * @route  GET /buildermap/activity
 * @desc   Recent builder activity feed (product submissions & launches, last 7 days)
 */
module.exports.getActivity = async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentProducts = await Product.find({
    $or: [
      { status: "in_review", submittedAt: { $gte: sevenDaysAgo } },
      { status: "launched",  launchedAt:  { $gte: sevenDaysAgo } },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(30)
    .populate("owner", "name username picture")
    .select("name tagline category status submittedAt launchedAt upvoteCount owner")
    .lean();

  const activity = recentProducts
    .filter((p) => p.owner)
    .map((p) => ({
      type:            p.status === "launched" ? "launch" : "submitted",
      productName:     p.name,
      productTagline:  p.tagline,
      productCategory: p.category,
      upvoteCount:     p.upvoteCount,
      actor: {
        userId:   p.owner._id,
        name:     p.owner.name,
        username: p.owner.username,
        picture:  p.owner.picture,
      },
      timestamp: p.status === "launched" ? p.launchedAt : p.submittedAt,
    }));

  return res.status(200).json({ activity });
};
