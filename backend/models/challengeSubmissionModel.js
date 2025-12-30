const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const challengeSubmissionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    day: {
      type: Number,
      required: true,
      min: 1,
    },
    submissionType: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.submissionType === "text";
      },
      maxlength: 2000,
    },
    imageUrl: {
      type: String, // Bunny CDN URL
      required: function () {
        return this.submissionType === "image";
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "needs_revision"],
      default: "pending",
    },
    feedback: {
      comment: {
        type: String,
        maxlength: 500,
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User", // The challenge creator
      },
      reviewedAt: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLateSubmission: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one submission per user per day per challenge
challengeSubmissionSchema.index(
  { user: 1, challenge: 1, day: 1 },
  { unique: true }
);
challengeSubmissionSchema.index({ challenge: 1, day: 1 });
challengeSubmissionSchema.index({ status: 1 });
challengeSubmissionSchema.index({ submittedAt: 1 });

module.exports = mongoose.model(
  "ChallengeSubmission",
  challengeSubmissionSchema
);
