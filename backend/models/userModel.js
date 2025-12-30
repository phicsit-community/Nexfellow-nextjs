const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Quiz = require("./quizzes");
const CommunityQuiz = require("./communityQuiz");
const Profile = require("./profileModel");

const userSchema = new schema(
  {
    name: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      min: 6,
    },

    googleId: {
      type: String,
      select: false,

    },

    // Google OAuth tokens
    googleAccessToken: {
      type: String,
      select: false,
    },

    googleRefreshToken: {
      type: String,
      select: false,
    },

    linkedinId: {
      type: String, select: false,
    },

    linkedinAccessToken: {
      type: String,
      select: false,
    },

    linkedinRefreshToken: {
      type: String,
      select: false,
    },

    facebookId: {
      type: String,
      select: false,
    },

    facebookAccessToken: {
      type: String,
      select: false,
    },

    facebookRefreshToken: {
      type: String,
      select: false,
    },

    // JWT refresh token
    refreshToken: {
      type: String,
      select: false,
    },

    refreshTokenExpiry: {
      type: Date,
      select: false,

    },

    picture: {
      type: String,
      default: null,
    },

    banner: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      min: 6,
      max: 255,
      select: false,

    },

    password: {
      type: String,
      min: 6,
      max: 1024,
      select: false,
    },

    subscriptionTier: {
      type: String,
      default: "free",
      enum: ["free", "bronze"],
    },

    registeredQuizzes: [
      {
        type: schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],

    registeredCommunityQuizzes: [
      {
        type: schema.Types.ObjectId,
        ref: "CommunityQuiz",
      },
    ],

    country: {
      type: String,
      default: "India",
    },

    profile: {
      type: schema.Types.ObjectId,
      ref: "Profile",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verificationBadge: {
      type: Boolean,
      default: false,
    },

    communityBadge: {
      type: Boolean,
      default: false,
    },

    premiumBadge: {
      type: Boolean,
      default: false,
    },

    joinedChallenges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
      },
    ],

    followedCommunities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],

    createdCommunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      unique: true,
    },

    isCommunityAccount: {
      type: Boolean,
      default: false,
    },

    communityRoles: [
      {
        communityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Community",
        },
        role: {
          type: String,
          enum: [
            "member",
            "moderator",
            "content-admin",
            "event-admin",
            "analyst",
            "creator",
          ],
          default: "member",
        },
      },
    ],

    followers: [
      {
        type: schema.Types.ObjectId,
        ref: "User",
      },
    ],
    milestones: {
      followers: [Number],
      likes: [Number],
      posts: [Number],
    },
    following: [
      {
        type: schema.Types.ObjectId,
        ref: "User",
      },
    ],

    mutedUsers: [
      {
        type: schema.Types.ObjectId,
        ref: "User",
      },
    ],

    blockedUsers: [
      {
        type: schema.Types.ObjectId,
        ref: "User",
      },
    ],

    hiddenPosts: [
      {
        type: schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    otpHash: {
      type: String,
      select: false,
    },
    otpSalt: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,

    },
    isOtpVerified: {
      type: Boolean,
      default: false,
      select: false,

    },
    resetPasswordOtpVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    privacySettings: {
      type: Object,
      default: {
        showEmail: true,
        showFollowers: true,
        showFollowing: true,
        showRegisteredQuizzes: true,
        showJoinedChallenges: true,
        allowDirectMessages: true,
        allowMentions: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
