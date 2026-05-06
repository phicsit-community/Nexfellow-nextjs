const CREDIT_EVENTS = {
  // ── Earn: wired ─────────────────────────────────────────────────────────────
  REVIEW_FEEDBACK: {
    code: "REVIEW_FEEDBACK",
    delta: 8,
    description: "Give feedback on a product",
    cap: { perProduct: 5 },
  },
  REVIEW_HELPFUL_VOTE: {
    code: "REVIEW_HELPFUL_VOTE",
    delta: 2,
    description: "Helpful vote on your review",
  },
  REVIEW_10_HELPFUL: {
    code: "REVIEW_10_HELPFUL",
    delta: 30,
    description: "Receive 10+ helpful votes (one-time milestone per review)",
  },
  REVIEW_STREAK_7DAY: {
    code: "REVIEW_STREAK_7DAY",
    delta: 15,
    description: "7-day review streak (once per ISO week)",
  },
  REFERRAL_JOIN: {
    code: "REFERRAL_JOIN",
    delta: 25,
    description: "Refer a builder who joins",
  },
  EVENT_HOST: {
    code: "EVENT_HOST",
    delta: 40,
    description: "Host a community event",
  },
  SOCIAL_LINK: {
    code: "SOCIAL_LINK",
    delta: 5,
    description: "Link a social account (once per platform)",
  },
  PROFILE_COMPLETE: {
    code: "PROFILE_COMPLETE",
    delta: 20,
    description: "Complete your profile (one-time)",
  },
  RESOURCE_UPLOAD: {
    code: "RESOURCE_UPLOAD",
    delta: 10,
    description: "Upload resource to library (approved by mods)",
    cap: { perMonth: 2 },
  },

  // ── Earn: constants only — systems not yet built ─────────────────────────────
  REFERRAL_PRO_UPGRADE: {
    code: "REFERRAL_PRO_UPGRADE",
    delta: 50,
    description: "Referral upgrades to Pro",
  },
  CO_LAUNCH_COMPLETE: {
    code: "CO_LAUNCH_COMPLETE",
    delta: 20,
    description: "Co-launch campaign completes",
  },
  ANNIVERSARY_REWARD: {
    code: "ANNIVERSARY_REWARD",
    delta: 100,
    description: "1 year on the platform",
  },
  RESOURCE_20_SAVES: {
    code: "RESOURCE_20_SAVES",
    delta: 15,
    description: "Resource gets 20+ saves",
  },
  EVENT_ATTEND: {
    code: "EVENT_ATTEND",
    delta: 5,
    description: "Attend a community event (verified, once per event)",
  },
  REPLY_THREAD: {
    code: "REPLY_THREAD",
    delta: 3,
    description: "Reply to a comment thread (max 10/day)",
    cap: { perDay: 10 },
  },
  FEEDBACK_MOST_HELPFUL: {
    code: "FEEDBACK_MOST_HELPFUL",
    delta: 12,
    description: "Your feedback marked most helpful by product owner",
  },
  PRODUCT_50_UPVOTES: {
    code: "PRODUCT_50_UPVOTES",
    delta: 20,
    description: "Product reaches 50 upvotes",
  },
  PRODUCT_FIRST_10_SIGNUPS: {
    code: "PRODUCT_FIRST_10_SIGNUPS",
    delta: 35,
    description: "First 10 users sign up via your product page",
  },
  PRODUCT_5_REVIEWS: {
    code: "PRODUCT_5_REVIEWS",
    delta: 10,
    description: "Product receives 5+ reviews after launch",
  },
  PRODUCT_FEATURED_DIGEST: {
    code: "PRODUCT_FEATURED_DIGEST",
    delta: 50,
    description: "Product featured in weekly digest",
  },
  BUILDERMAP_CONNECT_ACCEPTED: {
    code: "BUILDERMAP_CONNECT_ACCEPTED",
    delta: 5,
    description: "BuilderMap connect request accepted (both users credited)",
  },
  BUILDERMAP_50_VISITS: {
    code: "BUILDERMAP_50_VISITS",
    delta: 10,
    description: "BuilderMap profile visited 50+ times (monthly milestone)",
  },

  // ── Spend ────────────────────────────────────────────────────────────────────
  SUBMIT_FOR_FEEDBACK: {
    code: "SUBMIT_FOR_FEEDBACK",
    delta: -20,
    gate: 20,
    description: "Submit product for feedback",
  },
  BUILDERMAP_CONNECT_REQUEST: {
    code: "BUILDERMAP_CONNECT_REQUEST",
    delta: -5,
    gate: 5,
    description: "Send a BuilderMap connect request (free users only)",
  },
  BOOST_PRODUCT: {
    code: "BOOST_PRODUCT",
    delta: -30,
    gate: 30,
    description: "Boost product on early adopter board for 24hr",
  },
  REQUEST_WARM_INTRO: {
    code: "REQUEST_WARM_INTRO",
    delta: -15,
    gate: 15,
    description: "Request warm intro",
  },
  UNLOCK_RESOURCE: {
    code: "UNLOCK_RESOURCE",
    delta: -10,
    gate: 10,
    description: "Unlock a premium resource",
  },
  ACCESS_GTM_REPORT: {
    code: "ACCESS_GTM_REPORT",
    delta: -25,
    gate: 25,
    description: "Access GTM strategy report",
  },

  // ── Penalty: admin-triggered only ───────────────────────────────────────────
  PENALTY_SPAM_REVIEW: {
    code: "PENALTY_SPAM_REVIEW",
    delta: -8,
    description: "Review flagged as spam or low quality",
  },
  PENALTY_ACCOUNT_WARN: {
    code: "PENALTY_ACCOUNT_WARN",
    delta: -20,
    description: "Account warned by moderation",
  },
  PENALTY_FAKE_REFERRAL: {
    code: "PENALTY_FAKE_REFERRAL",
    delta: -50,
    description: "Fake or incentivized referral detected",
  },
  PENALTY_LISTING_REMOVE: {
    code: "PENALTY_LISTING_REMOVE",
    delta: -30,
    description: "Product listing reported and removed",
  },
  PENALTY_INACTIVITY: {
    code: "PENALTY_INACTIVITY",
    delta: -10,
    description: "30-day inactivity soft decay",
  },
};

const PENALTY_CODES = new Set([
  "PENALTY_SPAM_REVIEW",
  "PENALTY_ACCOUNT_WARN",
  "PENALTY_FAKE_REFERRAL",
  "PENALTY_LISTING_REMOVE",
]);

module.exports = { CREDIT_EVENTS, PENALTY_CODES };
