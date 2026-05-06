const Profile = require("../models/profileModel");
const CreditTransaction = require("../models/creditTransactionModel");
const CreditService = require("../services/creditService");

async function applyInactivityPenalties() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  console.log("[InactivityCron] Running at", new Date().toISOString());

  const inactiveProfiles = await Profile.find({
    lastActivityAt: { $lt: thirtyDaysAgo },
    coin: { $gt: 0 },
  })
    .select("userId _id")
    .lean();

  console.log(`[InactivityCron] Found ${inactiveProfiles.length} inactive profiles`);

  let applied = 0;
  for (const p of inactiveProfiles) {
    try {
      const recentPenalty = await CreditTransaction.findOne({
        userId: p.userId,
        eventCode: "PENALTY_INACTIVITY",
        createdAt: { $gte: thirtyDaysAgo },
      }).lean();

      if (recentPenalty) continue;

      const fresh = await Profile.findOne({ _id: p._id, lastActivityAt: { $lt: thirtyDaysAgo } }).lean();
      if (!fresh) continue;

      const iKey = `PENALTY_INACTIVITY:${p.userId}:${today}`;
      await CreditService.penalize({
        userId: p.userId.toString(),
        eventCode: "PENALTY_INACTIVITY",
        idempotencyKey: iKey,
        source: "system",
        adminNote: "Automated 30-day inactivity penalty",
      });
      applied++;
    } catch (err) {
      console.error(`[InactivityCron] Failed for user ${p.userId}:`, err.message);
    }
  }

  console.log(`[InactivityCron] Applied ${applied} penalties`);
}

module.exports = applyInactivityPenalties;
