const User = require("../models/userModel");
const CreditService = require("../services/creditService");
const { PLANS } = require("../constants/plans");

const GRANT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

// Runs daily. Grants the free-plan monthly credit allotment to users on the
// free tier whose grant is due — including users who predate this feature
// (nextFreeCreditGrantAt is null), so they get backfilled on the next run
// instead of being stuck at 0.
module.exports = async function freeCreditGrantCron() {
  try {
    const now = new Date();

    const dueUsers = await User.find({
      subscriptionTier: "free",
      $or: [{ nextFreeCreditGrantAt: null }, { nextFreeCreditGrantAt: { $lte: now } }],
    }).select("_id nextFreeCreditGrantAt");

    if (dueUsers.length === 0) return;

    console.log(`[freeCreditGrantCron] Granting free credits to ${dueUsers.length} user(s)`);

    for (const user of dueUsers) {
      const cycleKey = (user.nextFreeCreditGrantAt ?? now).toISOString().slice(0, 10);

      await CreditService.award({
        userId: user._id,
        eventCode: "FREE_PLAN_CREDIT_GRANT",
        idempotencyKey: `FREE_PLAN_CREDIT_GRANT:${user._id}:${cycleKey}`,
        deltaOverride: PLANS.free.credits,
        source: "system",
      }).catch((err) => console.error(`[freeCreditGrantCron] Grant failed for ${user._id}:`, err.message));

      await User.findByIdAndUpdate(user._id, {
        nextFreeCreditGrantAt: new Date(now.getTime() + GRANT_INTERVAL_MS),
      });
    }

    console.log("[freeCreditGrantCron] Done.");
  } catch (err) {
    console.error("[freeCreditGrantCron] Error:", err);
  }
};
