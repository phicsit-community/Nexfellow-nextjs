const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewStreakSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    // UTC midnight of the most recent day a credited review was submitted
    lastReviewDate: { type: Date },
    // Dates on which the 7-day streak bonus was already granted (prevents re-award)
    milestoneGrantedAt: [{ type: Date }],
  },
  { timestamps: true }
);

reviewStreakSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("ReviewStreak", reviewStreakSchema);
