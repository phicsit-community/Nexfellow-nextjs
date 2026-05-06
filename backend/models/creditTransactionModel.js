const mongoose = require("mongoose");
const { Schema } = mongoose;

const creditTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    eventCode: {
      type: String,
      required: true,
    },
    // Positive = earned, negative = spent/penalised
    delta: {
      type: Number,
      required: true,
    },
    // Running balance snapshot after this row — enables tamper detection
    balanceAfter: {
      type: Number,
      required: true,
    },
    // Unique per logical event occurrence — DB-level guard against double-crediting
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },
    // The entity that triggered the credit (product, review, event, user, …)
    entityRef: {
      model: { type: String },
      id: { type: Schema.Types.ObjectId },
    },
    // system = automated events; admin = manual moderation; payment = future Dodo top-ups
    source: {
      type: String,
      enum: ["system", "admin", "payment"],
      default: "system",
    },
    // Required for admin-sourced entries so every penalty is auditable
    adminNote: {
      type: String,
    },
    // Soft flag for investigation — does NOT reverse the balance
    flagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Append-only ledger — updates are forbidden by convention; versionKey wastes space
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ idempotencyKey: 1 }, { unique: true });
creditTransactionSchema.index({ userId: 1, eventCode: 1 });
creditTransactionSchema.index({ userId: 1, eventCode: 1, "entityRef.id": 1 });

module.exports = mongoose.model("CreditTransaction", creditTransactionSchema);
