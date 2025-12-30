const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      // required: true,
      // minlength: 1,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    milestones: {
      likes: [Number],
      popularityNotified: { type: Boolean, default: false },
      popularityLevels: [String], // Track which popularity levels have been achieved
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],
    private: {
      type: Boolean,
      default: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    sharedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    takedownReason: { type: String },
    underReview: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    bookmarkCounter: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        required: false,
      },
    ],
    misc: [
      {
        fieldName: String,
        fieldValue: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
