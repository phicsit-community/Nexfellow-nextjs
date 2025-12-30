// models/messageModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reactionSchema = new Schema(
  {
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: { type: [reactionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
