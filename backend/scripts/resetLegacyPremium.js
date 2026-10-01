// One-time migration: reset every user without a real paid subscription to the
// free tier and strip the legacy premium/plan/verification badges.
//
// Usage (from backend/):
//   node scripts/resetLegacyPremium.js          # dry run, only counts
//   node scripts/resetLegacyPremium.js --apply  # actually writes
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");

const apply = process.argv.includes("--apply");

(async () => {
  await mongoose.connect(process.env.DB_URL);

  // Users who really paid through Dodo are left alone.
  const filter = {
    $or: [{ dodoSubscriptionId: null }, { dodoSubscriptionId: { $exists: false } }],
    $and: [
      {
        $or: [
          { subscriptionTier: { $ne: "free" } },
          { premiumBadge: true },
          { verificationBadge: true },
          { communityBadge: true },
          { planBadge: { $ne: null } },
        ],
      },
    ],
  };

  const count = await User.countDocuments(filter);
  console.log(`${count} user(s) match.`);

  if (apply && count > 0) {
    const res = await User.updateMany(filter, {
      $set: {
        subscriptionTier: "free",
        subscriptionExpiresAt: null,
        subscriptionInterval: null,
        premiumBadge: false,
        verificationBadge: false,
        communityBadge: false,
        planBadge: null,
      },
    });
    console.log(`Updated ${res.modifiedCount} user(s).`);
  } else if (!apply) {
    console.log("Dry run. Re-run with --apply to write changes.");
  }

  await mongoose.disconnect();
})();
