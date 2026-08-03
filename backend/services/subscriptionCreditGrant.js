const CreditService = require("./creditService");
const { PLANS } = require("../constants/plans");

// Trims any balance above the plan's rollover cap, then grants this cycle's
// credit allotment. Shared by the Dodo webhook path (Payments.js, monthly and
// annual activation/renewal) and the annual-plan monthly credit cron, so the
// rollover cap is enforced identically no matter which path triggers the grant.
async function grantSubscriptionCredits({ userId, planId, idempotencyKey }) {
  const plan = PLANS[planId];
  if (!plan || plan.credits <= 0) return;

  if (plan.rolloverCap != null) {
    await CreditService.trimRolloverIfNeeded({
      userId,
      cap: plan.rolloverCap,
      idempotencyKey: `CREDIT_ROLLOVER_TRIM:${idempotencyKey}`,
    });
  }

  await CreditService.award({
    userId,
    eventCode: "SUBSCRIPTION_CREDIT_GRANT",
    idempotencyKey,
    deltaOverride: plan.credits,
    source: "payment",
  });
}

module.exports = { grantSubscriptionCredits };
