const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Quiz = require("./quizzes");

const questionSchema = new schema({
  quizId: {
    type: schema.Types.ObjectId,
    ref: "Quiz",
  },

  type: {
    type: String,
    required: true,
    enum: ["text", "radio", "checkbox"],
  },

  text: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },

  // options: {   // for MCQ
  //     type: [String],
  // },

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

module.exports = mongoose.model("Question", questionSchema);
