const mongoose = require("mongoose");

const CommunityQuestionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CommunityQuiz",
    required: true,
    min: 6,
    max: 1024,
  },

  type: {
    type: String,
    required: true,
    enum: ["text", "radio", "checkbox"],
  },
  timeLimit: {
    type: Number,
    required: function () {
      // Only required if parent quiz's timerMode is "rapid"
      // This requires the quiz to be populated with timerMode
      return this.quizId && this.quizId.timerMode === "rapid";
    },
    min: 5,
    max: 3600, // 1 hour in seconds
  },

  text: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },

  options: [
    {
      text: {
        type: String,
      },
    },
  ],

  correctOption: [
    {
      type: String,
      required: true,
    },
  ],
});

const CommunityQuestion = mongoose.model(
  "CommunityQuestion",
  CommunityQuestionSchema
);
module.exports = CommunityQuestion;
