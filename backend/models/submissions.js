const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Quiz = require("./quizzes");
const User = require("./userModel");
const Question = require("./questions");

const submissionSchema = new schema({
  userId: {
    type: schema.Types.ObjectId,
    ref: "User",
  },

  quizId: {
    type: schema.Types.ObjectId,
    ref: "Quiz",
  },

  answers: [
    {
      response: {
        type: [String],
      },

      questionId: {
        type: schema.Types.ObjectId,
        ref: "Question",
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

module.exports = mongoose.model("Submission", submissionSchema);
