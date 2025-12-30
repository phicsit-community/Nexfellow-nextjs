const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      enum: ["top", "bottom"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    title: {
      type: String,
      required: false,
    },
    targetUrl: {
      type: String,
      required: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("advertisement", advertisementSchema);
