const mongoose = require("mongoose");
const { Schema } = mongoose;

const REVIEW_TAGS = [
  "UX",
  "PRICING",
  "MOBILE",
  "POSITIVE",
  "PERFORMANCE",
  "FEATURE REQ",
];

const replySchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, "Reply cannot exceed 1000 characters"],
  },
  createdAt: { type: Date, default: Date.now },
});

const productReviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [3000, "Review cannot exceed 3000 characters"],
    },
    tags: {
      type: [String],
      enum: { values: REVIEW_TAGS, message: "{VALUE} is not a valid tag" },
    },
    round: {
      type: Number,
      default: 1,
      min: 1,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, createdAt: -1 });
productReviewSchema.index({ product: 1, tags: 1 });
productReviewSchema.index({ reviewer: 1, product: 1 }, { unique: true });
productReviewSchema.index({ product: 1, round: 1 });

module.exports = mongoose.model("ProductReview", productReviewSchema);
module.exports.REVIEW_TAGS = REVIEW_TAGS;
