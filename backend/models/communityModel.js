const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communitySchema = new Schema({
  // name: {
  //   type: String,
  //   required: true
  // },
  // shortDescription: {
  //   type: String,
  //   required: true,
  //   maxlength: 60,
  // },
  description: {
    type: String,
    maxlength: 150,
  },
  // profilePic: {
  //   type: String,
  // },
  link: {
    type: String,
  },
  pinnedPost: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  appraisals: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: [
    {
      type: String,
    },
  ],
  discussions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  moderators: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ["moderator", "content-admin", "event-admin", "analyst"],
        default: "moderator",
      },
    },
  ],
  topMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  challenges: [
    {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
    },
  ],
  quiz: [
    {
      type: Schema.Types.ObjectId,
      ref: "CommunityQuiz",
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  pageViews: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  accountType: {
    type: String,
    enum: ["Individual", "Organization"],
    required: true,
    default: "Individual",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  bookmarkCounter: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Community", communitySchema);
