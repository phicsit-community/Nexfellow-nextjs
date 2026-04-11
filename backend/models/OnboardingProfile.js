const mongoose = require("mongoose");
const schema = mongoose.Schema;

const onboardingProfileSchema = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountType: {
      type: String,
      enum: ["individual", "community"],
      required: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    skills: [
      {
        type: String,
        enum: [
          "Full-stack dev",
          "Frontend dev",
          "Backend dev",
          "Mobile dev",
          "Product design",
          "UI/UX",
          "Product strategy",
          "Growth hacking",
          "Marketing",
          "Sales",
          "AI / ML",
          "No-code / low-code",
          "Fundraising",
          "Operations",
        ],
      },
    ],

    productStage: {
      type: String,
      enum: ["Idea stage", "MVP built", "Launched", "Pivoting"],
    },

    cofounderAvailability: {
      type: String,
      enum: [
        "actively-looking",
        "open-to-conversations",
        "building-solo",
        "advisor-mentor",
      ],
    },

    cofounderLookingFor: [
      {
        type: String,
        enum: [
          "Technical co-founder",
          "Design co-founder",
          "Growth / marketing",
          "Sales co-founder",
          "Business co-founder",
          "AI / ML expertise",
        ],
      },
    ],

    reviewInterests: [
      {
        type: String,
        enum: [
          "SaaS / web apps",
          "Mobile apps",
          "AI tools",
          "Dev tools",
          "E-commerce",
          "Fintech",
          "Edtech",
          "Health / wellness",
          "No-code tools",
          "Hardware / IoT",
        ],
      },
    ],

    socialLinks: {
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },

    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingProfile", onboardingProfileSchema);
