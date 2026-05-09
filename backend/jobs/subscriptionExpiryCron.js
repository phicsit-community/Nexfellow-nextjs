const User = require("../models/userModel");
const Subscription = require("../models/subscriptionModel");

// Safety-net cron that runs daily at 03:00 UTC.
// It catches users whose subscriptions have expired but whose webhook was missed
// (network failure, Dodo outage, etc.). Existing content is preserved (soft downgrade).
module.exports = async function subscriptionExpiryCron() {
  try {
    const now = new Date();

    const expiredUsers = await User.find({
      subscriptionTier: { $ne: "free" },
      subscriptionExpiresAt: { $lte: now },
    }).select("+dodoSubscriptionId");

    if (expiredUsers.length === 0) return;

    console.log(`[subscriptionExpiryCron] Downgrading ${expiredUsers.length} expired subscription(s)`);

    for (const user of expiredUsers) {
      user.subscriptionTier = "free";
      user.subscriptionExpiresAt = null;
      user.subscriptionInterval = null;
      user.dodoSubscriptionId = null;
      user.verificationBadge = false;

      await user.save();

      await Subscription.findOneAndUpdate(
        { userId: user._id, status: { $in: ["active", "on_hold"] } },
        { status: "expired" }
      );
    }

    console.log("[subscriptionExpiryCron] Done.");
  } catch (err) {
    console.error("[subscriptionExpiryCron] Error:", err);
  }
};
