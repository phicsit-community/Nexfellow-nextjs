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

  // Updated on authenticated activity — used by the inactivity penalty cron
  lastActivityAt: {
    type: Date,
    default: Date.now,
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

// Credit balance changes (CreditService uses findOneAndUpdate with $inc coin)
// refresh the user's row on the live admin Users page. Required lazily
// because adminUserFeed loads the User model, which loads this one.
profileSchema.post("findOneAndUpdate", function (doc) {
  const update = this.getUpdate() || {};
  const touchesCoin = "coin" in update || Object.values(update).some((op) => op && typeof op === "object" && "coin" in op);
  if (touchesCoin && doc?.userId) require("../services/adminUserFeed").pushAdminUser(doc.userId);
});

module.exports = mongoose.model("Profile", profileSchema);
