const mongoose = require("mongoose");
const schema = mongoose.Schema;

const profileSchema = new schema({
  userId: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  bio: {
    type: String,
    max: 1024,
  },

  occupation: {
    type: String,
    max: 255,
  },

  phoneNumber: {
    type: String,
    max: 15,
  },

  dateOfBirth: {
    type: Date,
  },

  profilePhoto: {
    type: String,
  },

  rating: {
    type: Number,
    default: 0,
  },

  quizRatings: [
    {
      quizId: {
        type: schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
    },
  ],

  referralCodeString: {
    type: String,
    unique: true,
  },

  totalUsersReferred: {
    type: Number,
    default: 0,
  },

  coin: {
    type: Number,
    default: 0,
  },

  platformLinks: [],

  professions: [],

  bookmarks: [
    {
      type: schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
});

module.exports = mongoose.model("Profile", profileSchema);
