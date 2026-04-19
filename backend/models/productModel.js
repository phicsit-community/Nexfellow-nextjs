const mongoose = require("mongoose");
const { Schema } = mongoose;

const CATEGORIES = [
  "SaaS/Productivity",
  "AI/ML tools",
  "Dev tools",
  "Mobile app",
  "Health/Wellness",
  "Finance",
  "Education",
  "E-commerce",
  "Other",
];

const BUILD_STAGES = ["Idea", "Prototype", "MVP", "Beta", "Launched"];

const FEEDBACK_FOCUS_OPTIONS = [
  "Onboarding & first impression",
  "Pricing & willingness to pay",
  "UX & design clarity",
  "Value proposition & messaging",
  "Feature completeness",
  "Market fit & competition",
];

const PRODUCT_STATUSES = ["draft", "in_review", "launched", "archived"];

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [40, "Product name cannot exceed 40 characters"],
    },
    tagline: {
      type: String,
      required: [true, "Tagline is required"],
      trim: true,
      maxlength: [80, "Tagline cannot exceed 80 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: "{VALUE} is not a valid category" },
    },
    buildStage: {
      type: String,
      enum: {
        values: BUILD_STAGES,
        message: "{VALUE} is not a valid build stage",
      },
    },
    feedbackFocus: {
      type: [String],
      validate: {
        validator: function (arr) {
          if (arr.length > 3) return false;
          return arr.every((item) => FEEDBACK_FOCUS_OPTIONS.includes(item));
        },
        message: "feedbackFocus must have at most 3 valid focus areas",
      },
    },
    specificQuestion: {
      type: String,
      trim: true,
      maxlength: [500, "Specific question cannot exceed 500 characters"],
    },
    productUrl: {
      type: String,
      required: [true, "Product URL is required"],
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },
    demoVideo: {
      type: String,
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },
    screenshots: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "Maximum 5 screenshots allowed",
      },
    },
    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: "draft",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewRound: {
      type: Number,
      default: 0,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.index({ owner: 1, status: 1 });
productSchema.index({ owner: 1, createdAt: -1 });

productSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "in_review") {
    if (!this.submittedAt) this.submittedAt = new Date();
    this.reviewRound = (this.reviewRound || 0) + 1;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.BUILD_STAGES = BUILD_STAGES;
module.exports.FEEDBACK_FOCUS_OPTIONS = FEEDBACK_FOCUS_OPTIONS;
