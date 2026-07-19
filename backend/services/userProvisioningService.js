const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const randomStringGenerator = require("randomstring");
const CreditService = require("./creditService");
const { PLANS } = require("../constants/plans");

const FREE_CREDIT_GRANT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

const defaultProfilePicture = "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const defaultBanner = "https://nexfellow.b-cdn.net/defaults/default-banner.png";

async function generateUsername(fullName) {
  let firstWord = String(fullName || "").trim().split(/\s+/)[0] || "user";
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

// Creates the Mongo User (+ Profile, referral code, initial credit grant) for a
// Clerk identity that doesn't have one yet. Shared by the user.created webhook
// and requireAuth's on-the-fly fallback, so a brand-new signup works even when
// the webhook hasn't delivered yet — accepts both the webhook payload shape
// (snake_case) and the Clerk Backend SDK user object shape (camelCase).
async function provisionUserFromClerk(clerkUser) {
  const clerkId = clerkUser.id;
  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    clerkUser.email_addresses?.[0]?.email_address;

  if (!clerkId || !email) {
    throw new Error("Clerk user is missing id or email address");
  }

  const firstName = clerkUser.firstName ?? clerkUser.first_name;
  const lastName = clerkUser.lastName ?? clerkUser.last_name;
  const imageUrl = clerkUser.imageUrl ?? clerkUser.image_url;

  const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];
  const username = await generateUsername(name);

  const user = await User.create({
    clerkId,
    email,
    name,
    username,
    picture: imageUrl || defaultProfilePicture,
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
  // never double-grants even if called more than once (e.g. webhook retry).
  await CreditService.award({
    userId: user._id,
    eventCode: "FREE_PLAN_CREDIT_GRANT",
    idempotencyKey: `FREE_PLAN_CREDIT_GRANT:${user._id}:signup`,
    deltaOverride: PLANS.free.credits,
    source: "system",
  }).catch((err) =>
    console.error("[userProvisioningService] Initial credit grant failed:", err.message)
  );

  return user;
}

module.exports = { provisionUserFromClerk, generateUsername };
