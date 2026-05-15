const { PLANS } = require("../constants/plans");

function getEffectiveTier(user) {
  if (!user || user.subscriptionTier === "free") return "free";
  if (
    user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt < new Date()
  ) {
    return "free";
  }
  return user.subscriptionTier;
}

function getUserPlan(user) {
  return PLANS[getEffectiveTier(user)];
}

module.exports = { getUserPlan, getEffectiveTier };
