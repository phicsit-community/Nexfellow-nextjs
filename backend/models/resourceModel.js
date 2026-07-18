const mongoose = require("mongoose");
const { Schema } = mongoose;

const RESOURCE_CATEGORIES = ["Template", "Guide", "Tool", "Dataset", "Other"];
const RESOURCE_STATUSES = ["pending", "approved", "rejected"];

const resourceSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },
    category: {
      type: String,
      enum: { values: RESOURCE_CATEGORIES, message: "{VALUE} is not a valid category" },
      default: "Other",
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: RESOURCE_STATUSES,
      default: "pending",
    },
    rejectionNote: {
      type: String,
      default: null,
      maxlength: 500,
    },
    // Users who spent UNLOCK_RESOURCE credits to view the url. The uploader
    // always has free access to their own submission.
    unlockedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

resourceSchema.index({ status: 1, createdAt: -1 });
resourceSchema.index({ uploader: 1, createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);
module.exports.RESOURCE_CATEGORIES = RESOURCE_CATEGORIES;
module.exports.RESOURCE_STATUSES = RESOURCE_STATUSES;
