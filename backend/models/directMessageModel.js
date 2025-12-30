const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const directMessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: { type: String, required: true },
    attachments: [
      {
        type: String,
        url: String,
        fileType: String,
      },
    ],
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
directMessageSchema.index({ conversation: 1, createdAt: -1 });
directMessageSchema.index({ sender: 1 });

module.exports = mongoose.model("DirectMessage", directMessageSchema);
