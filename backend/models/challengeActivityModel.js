const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const challengeActivitySchema = new Schema(
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
    activityType: {
      type: String,
      enum: [
        "enrolled",
        "submitted",
        "day_completed",
        "challenge_completed",
        "reward_earned",
      ],
      required: true,
    },
    day: {
      type: Number,
      min: 1,
    },
    submission: {
      type: Schema.Types.ObjectId,
      ref: "ChallengeSubmission",
    },
    reward: {
      type: Schema.Types.ObjectId,
      ref: "ChallengeReward",
    },
    details: {
      progress: Number, // Current progress percentage
      message: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
challengeActivitySchema.index({ challenge: 1, timestamp: -1 });
challengeActivitySchema.index({ user: 1, activityType: 1 });
challengeActivitySchema.index({ challenge: 1, activityType: 1 });

module.exports = mongoose.model("ChallengeActivity", challengeActivitySchema);
