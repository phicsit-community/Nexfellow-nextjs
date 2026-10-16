// Builds the rows shown on the admin Users page and pushes changes to connected
// admins over the /admin socket namespace, so the page never needs a refresh.
const { createClerkClient } = require("@clerk/backend");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Product = require("../models/productModel");
const ProductReview = require("../models/productReviewModel");
const Subscription = require("../models/subscriptionModel");
const CreditTransaction = require("../models/creditTransactionModel");
const OnboardingProfile = require("../models/OnboardingProfile");
const CreditService = require("./creditService");
const { getEffectiveTier } = require("../utils/planUtils");
const { getAdminNamespace, getOnlineUserIds, isUserOnline } = require("../utils/websocket");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const findAdminUsers = (filter = {}) =>
  User.find(filter)
    .sort({ createdAt: -1 })
    .select(
      "_id clerkId username name email verificationBadge premiumBadge communityBadge planBadge subscriptionTier subscriptionExpiresAt subscriptionInterval lastSeenAt picture profile createdCommunity createdAt onboardingProfile "
    )
    .populate({
      path: "profile",
      select: "occupation phoneNumber rating coin lastActivityAt",
    })
    .populate({
      path: "onboardingProfile",
      select: "country location",
    })
    .populate({
      path: "createdCommunity",
      select: "communityBadge accountType", // Get community badge and account type
    })
    .lean();

// clerkId -> last sign-in Date. Clerk is the source of truth for sign-ins, so we
// read it rather than mirroring it. Pass clerkIds to look up specific users,
// or omit to fetch everyone. Failures degrade to "unknown" instead of throwing.
const getClerkLastSignIns = async (clerkIds) => {
  const lastSignIns = new Map();
  const collect = (data) =>
    data.forEach((u) => {
      if (u.lastSignInAt) lastSignIns.set(u.id, new Date(u.lastSignInAt));
    });

  try {
    if (clerkIds) {
      for (let i = 0; i < clerkIds.length; i += 100) {
        const userId = clerkIds.slice(i, i + 100);
        const { data } = await clerkClient.users.getUserList({ userId, limit: userId.length });
        collect(data);
      }
    } else {
      const limit = 500;
      for (let offset = 0; ; offset += limit) {
        const { data } = await clerkClient.users.getUserList({ limit, offset });
        collect(data);
        if (data.length < limit) break;
      }
    }
  } catch (err) {
    console.error("Failed to fetch last sign-ins from Clerk:", err.message);
  }
  return lastSignIns;
};

const latestDate = (...dates) => {
  const times = dates.filter(Boolean).map((d) => new Date(d).getTime());
  return times.length ? new Date(Math.max(...times)) : null;
};

const serializeAdminUser = (user, lastSignIns) => {
  const plan = getEffectiveTier(user);
  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    verificationBadge: user.verificationBadge,
    premiumBadge: user.premiumBadge,
    communityBadge: user.communityBadge,
    planBadge: user.planBadge,
    subscriptionTier: user.subscriptionTier,
    // Effective plan: a paid tier whose expiry has passed counts as free
    plan,
    subscriptionInterval: plan === "free" ? null : user.subscriptionInterval,
    subscriptionExpiresAt: plan === "free" ? null : user.subscriptionExpiresAt,
    picture: user.picture,
    occupation: user.profile?.occupation,
    phoneNumber: user.profile?.phoneNumber,
    rating: user.profile?.rating,
    coins: user.profile?.coin,
    createdCommunity: user.createdCommunity || null,
    createdAt: user.createdAt,
    // From the onboarding form, falling back to its free-form location (User.country defaults to "India")
    country: user.onboardingProfile?.country || user.onboardingProfile?.location || null,
    isOnline: isUserOnline(user._id.toString()),
    lastLoginAt: (user.clerkId && lastSignIns.get(user.clerkId)) || null,
    // Socket disconnect or last authenticated API call, whichever is newer
    lastSeenAt: latestDate(user.lastSeenAt, user.profile?.lastActivityAt),
  };
};

const getAdminUserRows = async () => {
  const [users, lastSignIns] = await Promise.all([findAdminUsers(), getClerkLastSignIns()]);
  return users.map((user) => serializeAdminUser(user, lastSignIns));
};

// Pre-Clerk accounts recorded their OAuth provider directly on the user
const LEGACY_SIGN_IN_PROVIDERS = [
  ["googleId", "Google"],
  ["githubId", "GitHub"],
  ["linkedinId", "LinkedIn"],
  ["twitterId", "X / Twitter"],
  ["facebookId", "Facebook"],
];

const CLERK_PROVIDER_LABELS = {
  google: "Google",
  github: "GitHub",
  linkedin: "LinkedIn",
  linkedin_oidc: "LinkedIn",
  x: "X",
  twitter: "X / Twitter",
  facebook: "Facebook",
  apple: "Apple",
  microsoft: "Microsoft",
};

// Empty means unknown (e.g. Clerk lookup failed) — the UI shows "—" rather than guessing
const getSignInMethods = (user, extra, clerkInfo) => {
  const legacy = LEGACY_SIGN_IN_PROVIDERS.filter(([field]) => extra[field]).map(([, label]) => label);
  if (!user.clerkId && !legacy.length) return ["Email & password"];
  return [...new Set([...clerkInfo.methods, ...legacy])];
};

// One Clerk call gives both the last sign-in and how the user signs in
const getClerkSignInInfo = async (clerkId) => {
  if (!clerkId) return { lastSignIns: new Map(), methods: [] };
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const methods = clerkUser.externalAccounts.map((account) => {
      const provider = account.provider.replace(/^oauth_/, "");
      return CLERK_PROVIDER_LABELS[provider] || provider;
    });
    if (clerkUser.passwordEnabled) methods.push("Email & password");
    if (!methods.length) methods.push("Email code");
    const lastSignIns = new Map();
    if (clerkUser.lastSignInAt) lastSignIns.set(clerkId, new Date(clerkUser.lastSignInAt));
    return { lastSignIns, methods };
  } catch (err) {
    console.error(`Failed to fetch Clerk user ${clerkId}:`, err.message);
    return { lastSignIns: new Map(), methods: [] };
  }
};

// Everything the admin user drawer shows. Returns null for an unknown user.
const getAdminUserDetails = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) return null;

  const [user] = await findAdminUsers({ _id: userId });
  if (!user) return null;

  const [extra, onboarding, clerkInfo, credits, counts, products, recentCredits, subscriptions] =
    await Promise.all([
      User.findById(userId)
        .select(
          "googleId githubId linkedinId twitterId facebookId followers following followedCommunities isOnboarded isCommunityAccount verified"
        )
        .populate({ path: "profile", select: "referralCodeString totalUsersReferred" })
        .lean(),
      OnboardingProfile.findOne({ userId })
        .select(
          "accountType location city state country bio skills productStage cofounderAvailability cofounderLookingFor reviewInterests socialLinks completedAt"
        )
        .lean(),
      getClerkSignInInfo(user.clerkId),
      CreditService.getSummary(userId),
      Promise.all([
        Product.countDocuments({ owner: userId }),
        ProductReview.countDocuments({ reviewer: userId }),
        Post.countDocuments({ author: userId }),
      ]),
      Product.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name status logo createdAt")
        .lean(),
      CreditTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("eventCode delta balanceAfter source adminNote createdAt")
        .lean(),
      Subscription.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("plan interval amountPaid currency status startsAt expiresAt eventType")
        .lean(),
    ]);

  const [productCount, reviewCount, postCount] = counts;

  return {
    user: serializeAdminUser(user, clerkInfo.lastSignIns),
    stats: {
      credits: credits.balance,
      products: productCount,
      reviewsGiven: reviewCount,
      posts: postCount,
      followers: extra.followers?.length || 0,
      following: extra.following?.length || 0,
    },
    account: {
      signInMethods: getSignInMethods(user, extra, clerkInfo),
      isOnboarded: !!extra.isOnboarded,
      isCommunityAccount: !!extra.isCommunityAccount,
      verified: !!extra.verified,
      accountType: onboarding?.accountType || null,
    },
    profile: onboarding
      ? {
          bio: onboarding.bio || "",
          location:
            onboarding.location ||
            [onboarding.city, onboarding.state, onboarding.country].filter(Boolean).join(", "),
          skills: onboarding.skills || [],
          productStage: onboarding.productStage || null,
          cofounderAvailability: onboarding.cofounderAvailability || null,
          cofounderLookingFor: onboarding.cofounderLookingFor || [],
          reviewInterests: onboarding.reviewInterests || [],
          socialLinks: onboarding.socialLinks || {},
          completedAt: onboarding.completedAt || null,
        }
      : null,
    activity: {
      referralCode: extra.profile?.referralCodeString || null,
      referralsMade: extra.profile?.totalUsersReferred || 0,
      currentStreak: credits.currentStreak,
      longestStreak: credits.longestStreak,
      creditsEarned: credits.totalEarned,
      creditsSpent: credits.totalSpent,
      communitiesFollowed: extra.followedCommunities?.length || 0,
    },
    products,
    recentCredits,
    subscriptions,
  };
};

const hasAdminWatchers = () => (getAdminNamespace()?.sockets.size || 0) > 0;

// Updates are batched for a moment so a burst (e.g. every user reconnecting
// after a deploy) costs one DB query and one Clerk call, not one per user.
const FLUSH_DELAY_MS = 1000;
const pendingUserIds = new Set();
let flushTimer = null;

const flushPendingUsers = async () => {
  flushTimer = null;
  const ids = Array.from(pendingUserIds);
  pendingUserIds.clear();
  if (!ids.length || !hasAdminWatchers()) return;

  try {
    const users = await findAdminUsers({ _id: { $in: ids } });
    const lastSignIns = await getClerkLastSignIns(users.map((u) => u.clerkId).filter(Boolean));
    const adminNs = getAdminNamespace();
    users.forEach((user) => adminNs.emit("admin:user:upsert", serializeAdminUser(user, lastSignIns)));
  } catch (err) {
    console.error("Failed to push admin user updates:", err.message);
  }
};

// Call after any write that changes what the admin Users page shows for a user.
const pushAdminUser = (userId) => {
  if (!userId || !hasAdminWatchers()) return;
  pendingUserIds.add(userId.toString());
  if (!flushTimer) flushTimer = setTimeout(flushPendingUsers, FLUSH_DELAY_MS);
};

const pushAdminUserRemoved = (userId) => {
  getAdminNamespace()?.emit("admin:user:removed", { userId: userId.toString() });
};

const pushAdminPresence = (userId, isOnline, lastSeenAt = null) => {
  getAdminNamespace()?.emit("admin:presence", { userId, isOnline, lastSeenAt });
};

const sendPresenceSnapshot = (socket) => {
  socket.emit("admin:presence:sync", { userIds: getOnlineUserIds() });
};

module.exports = {
  getAdminUserRows,
  getAdminUserDetails,
  pushAdminUser,
  pushAdminUserRemoved,
  pushAdminPresence,
  sendPresenceSnapshot,
};
