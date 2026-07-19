const express = require("express");
const router = express.Router();
const { Webhook } = require("svix");
const User = require("../models/userModel");
const { provisionUserFromClerk } = require("../services/userProvisioningService");

// Clerk webhook secrets use standard base64 (+/), but @stablelib/base64 inside
// svix/standardwebhooks expects base64url (-_). These are the same bytes — just
// different character aliases — so swapping them is safe and doesn't alter the key.
function toBase64Url(secret) {
  if (!secret || !secret.startsWith("whsec_")) return secret;
  return "whsec_" + secret.slice(6).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Raw body required for svix signature verification.
// Register this BEFORE express.json() in index.js.
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return res.status(500).send("Webhook secret not configured");
    }

    let wh;
    try {
      wh = new Webhook(toBase64Url(WEBHOOK_SECRET));
    } catch (err) {
      console.error("Failed to initialise Webhook verifier:", err.message);
      return res.status(500).send("Webhook secret is invalid");
    }

    let event;
    try {
      event = wh.verify(req.body, {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      });
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({ message: "Webhook verification failed" });
    }

    if (event.type === "user.created") {
      const { id: clerkId, email_addresses } = event.data;
      const email = email_addresses?.[0]?.email_address;

      const existingUser = await User.findOne({ $or: [{ clerkId }, { email }] });
      if (existingUser) {
        if (!existingUser.clerkId) {
          existingUser.clerkId = clerkId;
          await existingUser.save();
        }
        return res.status(200).json({ received: true });
      }

      try {
        const user = await provisionUserFromClerk(event.data);
        console.log(`[clerkWebhook] Created user ${user._id} for Clerk ID ${clerkId}`);
      } catch (err) {
        // requireAuth's on-the-fly fallback may have provisioned this user in the
        // gap between our findOne above and this insert (e.g. user hit the app
        // before the webhook arrived). A duplicate-key error here just means the
        // user already exists — nothing left to do.
        if (err.code === 11000) {
          console.log(`[clerkWebhook] User for Clerk ID ${clerkId} already provisioned, skipping`);
        } else {
          throw err;
        }
      }
    }

    if (event.type === "user.deleted") {
      const { id: clerkId } = event.data;
      await User.findOneAndUpdate({ clerkId }, { $set: { deletedAt: new Date() } });
      console.log(`[clerkWebhook] Soft-deleted user with Clerk ID ${clerkId}`);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
