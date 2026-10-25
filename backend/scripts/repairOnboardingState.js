// Repair accounts whose onboarding profile is complete but whose User record
// never got the matching update (isOnboarded flag, chosen name and username,
// onboardingProfile reference). Before the fix in onboardingController these
// two writes were separate and the profile was written first, so a failure on
// the users.username unique index left the account bouncing between /feed and
// /onboarding with the name Clerk copied from Google still on the User.
//
// The running app now repairs such accounts on their next visit to
// /onboarding; this script does the same for everyone at once.
//
// Usage (from backend/):
//   node scripts/repairOnboardingState.js            # dry run, lists affected users
//   node scripts/repairOnboardingState.js --apply    # write the fixes
//
// Point DB_URL at the database to repair (defaults to ../.env); e.g.
//   DB_URL="$(grep ^DB_URL .env.prod | cut -d= -f2-)" node scripts/repairOnboardingState.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");
const OnboardingProfile = require("../models/OnboardingProfile");
const { syncUserToProfile } = require("../controllers/onboardingController");

const apply = process.argv.includes("--apply");

async function main() {
  await mongoose.connect(process.env.DB_URL);

  const profiles = await OnboardingProfile.find({ isOnboardingComplete: true });
  const users = await User.find({ _id: { $in: profiles.map((p) => p.userId) } });
  const byId = new Map(users.map((u) => [String(u._id), u]));

  const affected = [];
  for (const profile of profiles) {
    const user = byId.get(String(profile.userId));
    if (!user) continue;
    const wantName = `${profile.firstName} ${profile.lastName}`.trim();
    const drift = [];
    if (!user.isOnboarded) drift.push("isOnboarded=false");
    if (user.name !== wantName) drift.push(`name "${user.name}" → "${wantName}"`);
    if (user.username !== profile.username) drift.push(`username "${user.username}" → "${profile.username}"`);
    if (String(user.onboardingProfile || "") !== String(profile._id)) drift.push("onboardingProfile ref");
    if (drift.length) affected.push({ user, profile, drift });
  }

  console.log(`${profiles.length} completed onboarding profile(s); ${affected.length} user(s) out of sync.`);
  for (const { user, drift } of affected) {
    console.log(`  ${user._id}  ${drift.join(", ")}`);
  }

  if (!apply) {
    console.log(affected.length ? "Dry run. Re-run with --apply to write changes." : "Nothing to do.");
    return;
  }

  let fixed = 0;
  for (const { user, profile } of affected) {
    const conflict = await syncUserToProfile(user, profile);
    if (conflict) {
      console.warn(
        `  ${user._id}: everything synced except username "${conflict}", which another account holds. ` +
          "The user will be asked to pick a new username on their next visit."
      );
    } else {
      fixed++;
    }
  }
  console.log(`Repaired ${fixed}/${affected.length} user(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
