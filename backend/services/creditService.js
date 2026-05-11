const mongoose = require("mongoose");
const CreditTransaction = require("../models/creditTransactionModel");
const ReviewStreak = require("../models/reviewStreakModel");
const Profile = require("../models/profileModel");
const { CREDIT_EVENTS } = require("../constants/creditEvents");
const ExpressError = require("../utils/ExpressError");
const NotificationService = require("../utils/notificationService");
const { getIo } = require("../utils/websocket");

// Returns the ISO year-week string for a date, e.g. "2026-W18"
function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function utcMidnight(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

class CreditService {
  // ── Public: earn credits ────────────────────────────────────────────────────

  /**
   * @param {Object} opts
   * @param {string}  opts.userId
   * @param {string}  opts.eventCode
   * @param {string}  opts.idempotencyKey
   * @param {Object} [opts.entityRef]    { model: string, id: ObjectId }
   * @param {string} [opts.source]       'system' | 'admin' | 'payment'
   * @param {string} [opts.adminNote]
   * @returns {Promise<{ transaction, newBalance, duplicate?: boolean }>}
   */
  static async award(opts) {
    const event = CREDIT_EVENTS[opts.eventCode];
    if (!event || event.delta <= 0) {
      throw new ExpressError(`Invalid earn event: ${opts.eventCode}`, 400);
    }
    await CreditService._enforceEarnCap(opts.userId, opts.eventCode, opts.entityRef);
    const result = await CreditService._commit({ ...opts, delta: event.delta });

    // Streak update runs after a successful REVIEW_FEEDBACK commit
    if (opts.eventCode === "REVIEW_FEEDBACK" && !result.duplicate) {
      CreditService._updateReviewStreak(opts.userId).catch((err) =>
        console.error("Streak update failed:", err.message)
      );
    }
    return result;
  }

  // ── Public: spend credits ───────────────────────────────────────────────────

  /**
   * Deducts credits for a spend action. Throws 402 if balance is insufficient.
   */
  static async spend(opts) {
    const event = CREDIT_EVENTS[opts.eventCode];
    if (!event || event.delta >= 0) {
      throw new ExpressError(`Invalid spend event: ${opts.eventCode}`, 400);
    }
    const balance = await CreditService.getBalance(opts.userId);
    const required = event.gate ?? Math.abs(event.delta);
    if (balance < required) {
      throw new ExpressError(
        `Insufficient credits — ${required} required, you have ${balance}`,
        402
      );
    }
    return CreditService._commit({ ...opts, delta: event.delta });
  }

  // ── Public: admin penalty ───────────────────────────────────────────────────

  /**
   * Deducts credits as a moderation penalty. Can go negative. Admin-only.
   */
  static async penalize(opts) {
    const event = CREDIT_EVENTS[opts.eventCode];
    if (!event || event.delta >= 0) {
      throw new ExpressError(`Invalid penalty event: ${opts.eventCode}`, 400);
    }
    return CreditService._commit({
      ...opts,
      delta: event.delta,
      source: "admin",
    });
  }

  // ── Public: query ───────────────────────────────────────────────────────────

  static async getBalance(userId) {
    const profile = await Profile.findOne({ userId }).select("coin").lean();
    return profile?.coin ?? 0;
  }

  static async getHistory(userId, { page = 1, limit = 20, eventCode } = {}) {
    const filter = { userId };
    if (eventCode) filter.eventCode = eventCode;
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      CreditTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments(filter),
    ]);

    // Enrich each row with human-readable metadata so the frontend never needs
    // its own label mapping and stays in sync automatically as events are added.
    const enriched = transactions.map((tx) => {
      const meta = CREDIT_EVENTS[tx.eventCode];
      return {
        ...tx,
        description: meta?.description ?? tx.eventCode,
        eventType: meta
          ? meta.delta > 0
            ? "earn"
            : tx.source === "admin" || tx.eventCode.startsWith("PENALTY_")
            ? "penalty"
            : "spend"
          : "unknown",
      };
    });

    return { transactions: enriched, total, page, limit };
  }

  static async getSummary(userId) {
    const [profile, streak, agg] = await Promise.all([
      Profile.findOne({ userId }).select("coin").lean(),
      ReviewStreak.findOne({ userId }).select("currentStreak longestStreak").lean(),
      CreditTransaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(String(userId)) } },
        {
          $group: {
            _id: { isEarn: { $gt: ["$delta", 0] } },
            total: { $sum: { $abs: "$delta" } },
          },
        },
      ]),
    ]);

    let totalEarned = 0;
    let totalSpent = 0;
    for (const bucket of agg) {
      if (bucket._id.isEarn) totalEarned = bucket.total;
      else totalSpent = bucket.total;
    }

    return {
      balance: profile?.coin ?? 0,
      totalEarned,
      totalSpent,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    };
  }

  // ── Private: atomic DB writer ───────────────────────────────────────────────

  static async _commit({ userId, delta, eventCode, idempotencyKey, entityRef, source, adminNote }) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const profile = await Profile.findOne({ userId }).session(session);
      if (!profile) throw new ExpressError("Profile not found", 404);

      const newBalance = profile.coin + delta;

      const [tx] = await CreditTransaction.create(
        [
          {
            userId,
            profileId: profile._id,
            eventCode,
            delta,
            balanceAfter: newBalance,
            idempotencyKey,
            entityRef,
            source: source || "system",
            adminNote,
          },
        ],
        { session }
      );

      await Profile.findByIdAndUpdate(profile._id, { $inc: { coin: delta } }, { session });

      await session.commitTransaction();

      // Notify user and push real-time event (both fire-and-forget)
      const eventMeta = CREDIT_EVENTS[eventCode];
      const sign = delta > 0 ? "+" : "";
      const notifTitle = delta > 0 ? "Credits earned" : "Credits deducted";
      const notifMsg = `${sign}${delta} cr — ${eventMeta?.description || eventCode}`;

      NotificationService.createAndSendNotification({
        title: notifTitle,
        message: notifMsg,
        senderId: null,
        senderModel: "System",
        recipients: [userId],
        type: "system",
        priority: "low",
        meta: { eventCode, delta, newBalance },
      }).catch((err) => console.error("Credit notification failed:", err.message));

      try {
        getIo()
          .to(userId.toString())
          .emit("creditTransaction", {
            eventCode,
            delta,
            newBalance,
            description: eventMeta?.description || eventCode,
            createdAt: new Date(),
          });
      } catch (_) {}

      return { transaction: tx, newBalance };
    } catch (err) {
      await session.abortTransaction();
      // Duplicate idempotency key — silently return the existing transaction
      if (err.code === 11000) {
        const existing = await CreditTransaction.findOne({ idempotencyKey });
        if (existing) {
          return { transaction: existing, newBalance: existing.balanceAfter, duplicate: true };
        }
      }
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ── Private: cap enforcement ────────────────────────────────────────────────

  static async _enforceEarnCap(userId, eventCode, entityRef) {
    const event = CREDIT_EVENTS[eventCode];
    if (!event?.cap) return;

    if (event.cap.perProduct) {
      if (!entityRef?.id) {
        throw new ExpressError(
          `entityRef.id is required for event ${eventCode} (perProduct cap)`,
          400
        );
      }
      // Count globally (no userId) — only the first N reviewers of a product earn credits
      const count = await CreditTransaction.countDocuments({
        eventCode,
        "entityRef.id": entityRef.id,
      });
      if (count >= event.cap.perProduct) {
        throw new ExpressError(
          `Credit cap reached for this product (max ${event.cap.perProduct} reviewers credited)`,
          403
        );
      }
    }

    if (event.cap.perMonth) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const count = await CreditTransaction.countDocuments({
        userId,
        eventCode,
        createdAt: { $gte: startOfMonth },
      });
      if (count >= event.cap.perMonth) {
        throw new ExpressError(
          `Monthly credit cap reached for this event (max ${event.cap.perMonth}/month)`,
          403
        );
      }
    }

    if (event.cap.perDay) {
      const startOfDay = utcMidnight();
      const count = await CreditTransaction.countDocuments({
        userId,
        eventCode,
        createdAt: { $gte: startOfDay },
      });
      if (count >= event.cap.perDay) {
        throw new ExpressError(
          `Daily credit cap reached for this event (max ${event.cap.perDay}/day)`,
          403
        );
      }
    }
  }

  // ── Private: streak tracking ────────────────────────────────────────────────

  static async _updateReviewStreak(userId) {
    const today = utcMidnight();
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    let streak = await ReviewStreak.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true }
    );

    const lastDate = streak.lastReviewDate ? utcMidnight(streak.lastReviewDate) : null;
    const isConsecutive =
      lastDate &&
      lastDate.getTime() >= yesterday.getTime() &&
      lastDate.getTime() < today.getTime();

    // If already reviewed today, don't update the streak counter again
    if (lastDate && lastDate.getTime() === today.getTime()) return;

    const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
    const newLongest = Math.max(streak.longestStreak, newStreak);

    await ReviewStreak.findByIdAndUpdate(streak._id, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastReviewDate: today,
    });

    // Award the 7-day milestone if the streak is a multiple of 7
    if (newStreak > 0 && newStreak % 7 === 0) {
      const week = isoWeek();
      await CreditService.award({
        userId,
        eventCode: "REVIEW_STREAK_7DAY",
        idempotencyKey: `REVIEW_STREAK_7DAY:${userId}:${week}`,
      }).catch((err) => console.error("Streak milestone credit failed:", err.message));

      await ReviewStreak.findByIdAndUpdate(streak._id, {
        $push: { milestoneGrantedAt: new Date() },
      });
    }
  }
}

module.exports = CreditService;
