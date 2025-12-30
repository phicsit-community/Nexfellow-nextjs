const mongoose = require("mongoose");
const schema = mongoose.Schema;
const CommunityQuiz = require("../models/communityQuiz");
const User = require("../models/userModel");
const CommunityQuestion = require("../models/communityQuestion");

const communitySubmissionSchema = new schema({
  userId: {
    type: schema.Types.ObjectId,
    ref: "User",
  },

  quizId: {
    type: schema.Types.ObjectId,
    ref: "CommunityQuiz", // Reference to CommunityQuiz model
  },

  answers: [
    {
      response: {
        type: [String],
      },

      questionId: {
        type: schema.Types.ObjectId,
        ref: "CommunityQuestion",
      },

      correct: {
        type: Boolean,
        default: false,
      },

      score: {
        type: Number,
        default: -1,
      },
    },
  ],

  correctAnswers: {
    type: Number,
    default: 0,
  },

  totalQuestions: {
    type: Number,
    default: 0,
  },

  score: {
    type: Number,
    default: -1, // -1 to show the score is not yet calculated
  },

  maxScore: {
    type: Number,
    default: -1,
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
  timeTaken: {
    type: Number,
    default: 0, // Time taken in seconds
  },
});

module.exports = mongoose.model(
  "CommunitySubmission",
  communitySubmissionSchema
);
