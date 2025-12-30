// models/conversationModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "DirectMessage" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
    requestSentBy: { type: Schema.Types.ObjectId, ref: "User" },
    isRead: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    blockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    previousStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", null],
      default: null,
    },

    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for common access patterns
conversationSchema.index({ participants: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ lastUpdatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
