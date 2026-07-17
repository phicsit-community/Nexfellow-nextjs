// One-time credit top-up packs, sold via Dodo one-time-price products
// (created by scripts/createCreditPackProducts.js). Mirrors the pack copy
// in nexfellow-next/src/Pages/Premium/Premium.jsx (CREDIT_PACKS) — credits
// here is the full amount granted (bonus already included).
const CREDIT_PACKS = Object.freeze({
  starter: {
    name: "Starter pack",
    credits: 50,
    priceUsd: 5,
    dodoProductId: process.env.DODO_PROD_CREDIT_PACK_STARTER,
  },
  growth: {
    name: "Growth pack",
    credits: 150,
    priceUsd: 15,
    dodoProductId: process.env.DODO_PROD_CREDIT_PACK_GROWTH,
  },
  scale: {
    name: "Scale pack",
    credits: 400,
    priceUsd: 35,
    dodoProductId: process.env.DODO_PROD_CREDIT_PACK_SCALE,
  },
});

const VALID_PACK_IDS = Object.keys(CREDIT_PACKS);

module.exports = { CREDIT_PACKS, VALID_PACK_IDS };
