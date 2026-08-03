const User = require("../models/userModel");
const { PLANS } = require("../constants/plans");
const { grantSubscriptionCredits } = require("../services/subscriptionCreditGrant");

// Adds `months` to `date`, clamping the day-of-month so e.g. Jan 31 + 1 month
// lands on Feb 28/29 instead of overflowing into March.
function addMonthsClamped(date, months) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const daysInTargetMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, daysInTargetMonth));
  return d;
}

// Annual Dodo subscriptions only fire a subscription.renewed webhook once a
// year, but every plan promises credits every month. This runs daily at
// 04:00 UTC and grants the missed in-between months to active annual
// subscribers, catching up one month at a time (idempotent per due date) if
// it ever falls behind — same safety-net pattern as subscriptionExpiryCron.
module.exports = async function annualCreditGrantCron() {
  try {
    const now = new Date();

    const users = await User.find({
      subscriptionInterval: "annual",
      subscriptionTier: { $in: ["builder_pro", "founder"] },
      subscriptionExpiresAt: { $gt: now },
      lastSubscriptionCreditGrantAt: { $ne: null },
    });

    for (const user of users) {
      const plan = PLANS[user.subscriptionTier];
      if (!plan || plan.credits <= 0) continue;

      let nextDue = addMonthsClamped(user.lastSubscriptionCreditGrantAt, 1);
      let granted = false;

      // Stop before expiresAt — the renewal webhook grants that month's
      // credits itself and resets lastSubscriptionCreditGrantAt, so granting
      // here too would double up right at the boundary.
      while (nextDue <= now && nextDue < user.subscriptionExpiresAt) {
        await grantSubscriptionCredits({
          userId: user._id,
          planId: user.subscriptionTier,
          idempotencyKey: `SUBSCRIPTION_CREDIT_GRANT:${user._id}:${nextDue.toISOString().slice(0, 10)}`,
        });
        user.lastSubscriptionCreditGrantAt = nextDue;
        granted = true;
        nextDue = addMonthsClamped(nextDue, 1);
      }

      if (granted) await user.save();
    }
  } catch (err) {
    console.error("[annualCreditGrantCron] Error:", err);
  }
};
