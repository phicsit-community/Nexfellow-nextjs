// Reset profile pictures that are provider placeholders, not real photos
// (issue #46). Signup used to copy Clerk's image_url straight into
// User.picture, which for a Google account without a photo is Google's letter
// monogram of the *Google* name (e.g. "I" for a user registered as "a a" /
// @mathew), and for an email signup is Clerk's generic silhouette.
// userProvisioningService now filters these out for new signups; this script
// fixes accounts created before that.
//
// What it changes with --apply: User.picture -> the app's default picture for
// every user whose current picture is a Google monogram or a Clerk default.
// The UI then shows the initial of the user's own name/username. Real Google
// photos and anything the user uploaded are left alone; only Google and Clerk
// URLs are fetched and inspected.
//
// Usage (from backend/, reads DB_URL from ../.env like the server does):
//   node scripts/repairPlaceholderAvatars.js            # dry run, lists affected users
//   node scripts/repairPlaceholderAvatars.js --apply    # write the fixes
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");
const { isPlaceholderAvatar } = require("../utils/placeholderAvatar");

const DEFAULT_PROFILE_PICTURE = "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const BATCH_SIZE = 8;

const apply = process.argv.includes("--apply");

async function main() {
  await mongoose.connect(process.env.DB_URL);

  const candidates = await User.find({
    picture: { $regex: /googleusercontent\.com|img\.clerk\.com/ },
  }).select("_id name username picture");

  const placeholders = [];
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    const flags = await Promise.all(batch.map((u) => isPlaceholderAvatar(u.picture)));
    batch.forEach((u, k) => flags[k] && placeholders.push(u));
  }

  console.log(
    `Checked ${candidates.length} Google/Clerk picture(s); ${placeholders.length} are placeholders:`
  );
  for (const u of placeholders) {
    console.log(`  ${u._id}  @${u.username}  "${u.name}"  ${u.picture}`);
  }

  if (!apply) {
    console.log(placeholders.length ? "\nDry run. Re-run with --apply to write changes." : "\nNothing to do.");
    return;
  }

  const result = await User.updateMany(
    { _id: { $in: placeholders.map((u) => u._id) } },
    { $set: { picture: DEFAULT_PROFILE_PICTURE } }
  );
  console.log(`\nReset ${result.modifiedCount}/${placeholders.length} picture(s) to the default.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
