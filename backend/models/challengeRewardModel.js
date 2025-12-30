const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const challengeRewardSchema = new Schema(
  {
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkpointDay: {
      type: Number,
      required: true,
      min: 1,
    },
    rewardType: {
      type: String,
      enum: ["badge", "points", "certificate", "custom"],
      required: true,
    },
    rewardValue: {
      type: String,
      required: true,
    },
    rewardDescription: {
      type: String,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["pending", "awarded", "claimed"],
      default: "pending",
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    claimedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
challengeRewardSchema.index(
  { challenge: 1, user: 1, checkpointDay: 1 },
  { unique: true }
);
challengeRewardSchema.index({ user: 1 });
challengeRewardSchema.index({ status: 1 });

module.exports = mongoose.model("ChallengeReward", challengeRewardSchema);
