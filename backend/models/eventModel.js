const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  startTime: String,
  endDate: Date,
  endTime: String,
  description: String,
  url: String,
  location: String,
  imageUrl: String,
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isCancelled: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
    unique: true,
  },
  maxParticipants: {
    type: Number,
    default: 0, // 0 means no limit
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
