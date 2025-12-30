const mongoose = require("mongoose");
const schema = mongoose.Schema;

// Define a schema for daily tasks within a challenge
const dailyTaskSchema = new schema({
  day: {
    type: Number,
    required: true,
    min: 1,
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1024,
  },
  submissionType: {
    type: String,
    enum: ["text", "image"],
    required: true,
    default: "text",
  },
  submissionPrompt: {
    type: String,
    required: true,
    maxlength: 500,
  },
});

// Define a schema for checkpoint rewards
const checkpointRewardSchema = new schema({
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
});

// Define a schema for challenge participants
const participantSchema = new schema({
  user: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  currentDay: {
    type: Number,
    default: 1,
  },
  completedDays: [
    {
      type: Number,
    },
  ],
  missedDays: [
    {
      type: Number,
    },
  ],
  progress: {
    type: Number, // Percentage of completion (0-100)
    default: 0,
  },
  earnedRewards: [
    {
      checkpointDay: Number,
      rewardType: String,
      earnedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

const challengeSchema = new schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1024,
    },
    coverImage: {
      type: String,
      default: null, // Bunny CDN URL
    },
    duration: {
      type: Number,
      required: true,
      enum: [7, 30, 100], // in days
    },
    customDuration: {
      type: Number,
      min: 1,
      max: 365,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["unpublished", "upcoming", "ongoing", "completed"],
      default: "unpublished",
    },
    creator: {
      type: schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    dailyTasks: [dailyTaskSchema],
    checkpointRewards: [checkpointRewardSchema],
    participants: [participantSchema],
    settings: {
      allowLateSubmissions: {
        type: Boolean,
        default: false,
      },
      autoApproveSubmissions: {
        type: Boolean,
        default: false,
      },
      requireApprovalForRewards: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      totalEnrolled: {
        type: Number,
        default: 0,
      },
      totalCompleted: {
        type: Number,
        default: 0,
      },
      avgCompletionRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to get the actual duration used (custom or predefined)
challengeSchema.virtual("actualDuration").get(function () {
  return this.customDuration || this.duration;
});

// Method to check if challenge is currently active
challengeSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "ongoing" && now >= this.startDate && now <= this.endDate
  );
};

// Method to calculate progress for a participant
challengeSchema.methods.calculateProgress = function (participantId) {
  const participant = this.participants.id(participantId);
  if (!participant) return 0;

  const actualDuration = this.actualDuration;
  return Math.round((participant.completedDays.length / actualDuration) * 100);
};

// Indexes for better query performance
challengeSchema.index({ status: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ creator: 1 });
challengeSchema.index({ community: 1 });
challengeSchema.index({ "participants.user": 1 });

module.exports = mongoose.model("Challenge", challengeSchema);
