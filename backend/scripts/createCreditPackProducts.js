// One-off setup script: mints the 3 credit-pack products in Dodo Payments
// (test mode unless DODO_PAYMENTS_MODE=live_mode is set) and prints the
// resulting product IDs. Copy them into .env as DODO_PROD_CREDIT_PACK_*
// so backend/constants/creditPacks.js can pick them up.
//
// Usage: node scripts/createCreditPackProducts.js
require("dotenv").config();
const DodoPayments = require("dodopayments");

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_MODE === "live_mode" ? "live_mode" : "test_mode",
});

const PACKS = [
  { envVar: "DODO_PROD_CREDIT_PACK_STARTER", name: "Starter pack — 50 credits", priceUsd: 5 },
  { envVar: "DODO_PROD_CREDIT_PACK_GROWTH", name: "Growth pack — 150 credits", priceUsd: 15 },
  { envVar: "DODO_PROD_CREDIT_PACK_SCALE", name: "Scale pack — 400 credits", priceUsd: 35 },
];

async function main() {
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    console.error("DODO_PAYMENTS_API_KEY is not set — aborting.");
    process.exit(1);
  }

  console.log(
    `Creating products in ${process.env.DODO_PAYMENTS_MODE === "live_mode" ? "LIVE" : "TEST"} mode.\n`
  );

  for (const pack of PACKS) {
    const product = await dodo.products.create({
      name: pack.name,
      tax_category: "digital_products",
      price: {
        type: "one_time_price",
        currency: "USD",
        price: pack.priceUsd * 100,
        discount: 0,
        purchasing_power_parity: false,
        tax_inclusive: false,
      },
    });
    console.log(`${pack.envVar}=${product.product_id}`);
  }

  console.log("\nAdd the lines above to backend/.env, then restart the server.");
}

main()
  .catch((err) => {
    console.error("Failed to create credit pack products:", err.message);
    process.exit(1);
  })
  .finally(() => process.exit(0));
