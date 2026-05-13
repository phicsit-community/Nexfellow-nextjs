const PLANS = Object.freeze({
  free: {
    postCharLimit: 500,
    imagesPerPost: 1,
    screenshotsPerProduct: 1,
    credits: 30,
    broadcastsPerMonth: 0,
    badge: null,
    builderMapAccess: "view_only",
    dodoProductIds: { monthly: null, annual: null },
  },
  builder_pro: {
    postCharLimit: 2000,
    imagesPerPost: 2,
    screenshotsPerProduct: 2,
    credits: 200,
    broadcastsPerMonth: 3,
    badge: "blue",
    builderMapAccess: "full",
    dodoProductIds: {
      monthly: process.env.DODO_PROD_BUILDER_PRO_MONTHLY,
      annual: process.env.DODO_PROD_BUILDER_PRO_ANNUAL,
    },
  },
  founder: {
    postCharLimit: 5000,
    imagesPerPost: 4,
    screenshotsPerProduct: 4,
    credits: 600,
    broadcastsPerMonth: Infinity,
    badge: "orange",
    builderMapAccess: "full",
    dodoProductIds: {
      monthly: process.env.DODO_PROD_FOUNDER_MONTHLY,
      annual: process.env.DODO_PROD_FOUNDER_ANNUAL,
    },
  },
});

const VALID_PLAN_IDS = Object.keys(PLANS).filter((p) => p !== "free");
const VALID_INTERVALS = ["monthly", "annual"];

module.exports = { PLANS, VALID_PLAN_IDS, VALID_INTERVALS };
