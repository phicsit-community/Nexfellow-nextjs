const express = require("express");
const router = express.Router();
const { Webhook } = require("svix");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const randomStringGenerator = require("randomstring");
const CreditService = require("../services/creditService");
const { PLANS } = require("../constants/plans");

const FREE_CREDIT_GRANT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

const defaultProfilePicture = "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const defaultBanner = "https://nexfellow.b-cdn.net/defaults/default-banner.png";

// Clerk webhook secrets use standard base64 (+/), but @stablelib/base64 inside
// svix/standardwebhooks expects base64url (-_). These are the same bytes — just
// different character aliases — so swapping them is safe and doesn't alter the key.
function toBase64Url(secret) {
  if (!secret || !secret.startsWith("whsec_")) return secret;
  return "whsec_" + secret.slice(6).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateUsername(fullName) {
  let firstWord = (String(fullName || "").trim().split(/\s+/)[0] || "user");
  let base = firstWord.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  if (!base) base = "user";

  for (let i = 0; i < 20; i++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}${suffix}`;
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }
  return `${base}${Date.now().toString().slice(-6)}`;
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
      const { id: clerkId, email_addresses, image_url, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address;

      const existingUser = await User.findOne({ $or: [{ clerkId }, { email }] });
      if (existingUser) {
        if (!existingUser.clerkId) {
          existingUser.clerkId = clerkId;
          await existingUser.save();
        }
        return res.status(200).json({ received: true });
      }

      const name = [first_name, last_name].filter(Boolean).join(" ") || email.split("@")[0];
      const username = await generateUsername(name);

      const user = await User.create({
        clerkId,
        email,
        name,
        username,
        picture: image_url || defaultProfilePicture,
        banner: defaultBanner,
        verified: true,
      });

      const referralCode = randomStringGenerator.generate(7).toUpperCase();
      const profile = await Profile.create({
        userId: user._id,
        referralCodeString: referralCode,
        coin: 0,
      });

      user.profile = profile._id;
      user.nextFreeCreditGrantAt = new Date(Date.now() + FREE_CREDIT_GRANT_INTERVAL_MS);
      await user.save();

      // Initial free-plan credit grant. idempotencyKey is per-user so this
      // never double-grants even if the webhook is retried.
      await CreditService.award({
        userId: user._id,
        eventCode: "FREE_PLAN_CREDIT_GRANT",
        idempotencyKey: `FREE_PLAN_CREDIT_GRANT:${user._id}:signup`,
        deltaOverride: PLANS.free.credits,
        source: "system",
      }).catch((err) => console.error("[clerkWebhook] Initial credit grant failed:", err.message));

      console.log(`[clerkWebhook] Created user ${user._id} for Clerk ID ${clerkId}`);
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
