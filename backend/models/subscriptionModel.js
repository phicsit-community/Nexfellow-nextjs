const mongoose = require("mongoose");
const schema = mongoose.Schema;

const subscriptionSchema = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "builder_pro", "founder"],
      required: true,
    },
    interval: {
      type: String,
      enum: ["monthly", "annual"],
    },
    dodoSubscriptionId: {
      type: String,
      index: true,
    },
    // unique + sparse: prevents replay attacks while allowing null for non-payment events
    dodoPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // The Standard Webhooks "webhook-id" header for the delivery that created this
    // record. subscription.* events carry no payment_id, so this is the only stable
    // per-event identifier Dodo gives us for idempotency.
    dodoEventId: {
      type: String,
      unique: true,
      sparse: true,
    },
    dodoCustomerId: {
      type: String,
    },
    amountPaid: {
      type: Number,
    },
    currency: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "active", "on_hold", "expired", "cancelled"],
      default: "pending",
    },
    startsAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    eventType: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
