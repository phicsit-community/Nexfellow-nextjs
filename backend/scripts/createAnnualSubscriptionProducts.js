// One-off remediation script: the existing DODO_PROD_BUILDER_PRO_ANNUAL and
// DODO_PROD_FOUNDER_ANNUAL products were created in Dodo with a monthly
// payment_frequency_interval, so "annual" subscribers were actually being
// billed every month. Dodo does not allow editing a price's recurrence after
// creation, so this mints replacement products with the correct Year cadence
// and prints the new IDs to swap into .env.
//
// Usage: node scripts/createAnnualSubscriptionProducts.js
require("dotenv").config();
const DodoPayments = require("dodopayments");

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_MODE === "live_mode" ? "live_mode" : "test_mode",
});

const ANNUAL_PLANS = [
  { envVar: "DODO_PROD_BUILDER_PRO_ANNUAL", name: "Builder Pro (Annual)", priceUsd: 160 },
  { envVar: "DODO_PROD_FOUNDER_ANNUAL", name: "Founder (Annual)", priceUsd: 490 },
];

async function main() {
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    console.error("DODO_PAYMENTS_API_KEY is not set — aborting.");
    process.exit(1);
  }

  console.log(
    `Creating annual subscription products in ${process.env.DODO_PAYMENTS_MODE === "live_mode" ? "LIVE" : "TEST"} mode.\n`
  );

  for (const plan of ANNUAL_PLANS) {
    const product = await dodo.products.create({
      name: plan.name,
      tax_category: "digital_products",
      price: {
        type: "recurring_price",
        currency: "USD",
        price: plan.priceUsd * 100,
        discount: 0,
        purchasing_power_parity: false,
        tax_inclusive: false,
        payment_frequency_count: 1,
        payment_frequency_interval: "Year",
        subscription_period_count: 1,
        subscription_period_interval: "Year",
      },
    });
    console.log(`${plan.envVar}=${product.product_id}`);
  }

  console.log(
    "\nReplace the corresponding lines in backend/.env (and backend/.env.prod for live mode) with the IDs above, then restart the server."
  );
  console.log(
    "The old *_ANNUAL product IDs were created with a monthly payment_frequency_interval — leave them retired in the Dodo dashboard, do not reuse them."
  );
}

main()
  .catch((err) => {
    console.error("Failed to create annual subscription products:", err.message);
    process.exit(1);
  })
  .finally(() => process.exit(0));
