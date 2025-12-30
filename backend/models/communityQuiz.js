const mongoose = require("mongoose");

const CommunityQuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: {
      type: Number,
      required: false,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    rules: [{ type: String, required: true }],
    category: { type: String, required: true },
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CommunityQuestion" },
    ],
    misc: [
      {
        fieldName: String,
        fieldValue: [String],
      },
    ],
    // Add total registered users
    totalRegistered: {
      type: Number,
      default: 0,
    },
    // Add user profile images if needed
    User_profile_Image: [
      {
        type: String,
      },
    ],
    // Add rewards
    // rewards: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     // unique: true,
    //     ref: "Reward",
    //   }
    // ],
    // Set default value for rewards array
    // (default must be at the same level as type, not inside the array)
    // If you want to set default, use the following structure:
    rewards: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Reward", unique: false },
      ],
      default: [],
    },
    // add timer mode - full or rapid
    timerMode: {
      type: String,
      enum: ["full", "rapid"],
      default: "full",
    },

    // visibility of the quiz
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    bookmarkCounter: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const CommunityQuiz = mongoose.model(
  "CommunityQuiz",
  CommunityQuizSchema,
  "CommunityQuiz"
);
mongoose.model("CommunityContest", CommunityQuizSchema, "CommunityQuiz");
module.exports = CommunityQuiz;
