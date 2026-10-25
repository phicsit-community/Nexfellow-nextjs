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
// What it changes with --apply:
//   1. Users NOT marked onboarded whose profile is complete: full repair
//      (flag, name, username, profile reference) from the profile.
//   2. Onboarded users missing the onboardingProfile reference: set it.
//   3. Onboarded users whose name differs from the profile only by whitespace
//      (the old controller stored untrimmed names): collapse the whitespace
//      in the User's own name. Nothing is copied from the profile.
//
// What it only REPORTS: onboarded users whose name or username genuinely
// differs from the profile. Those come from later edit-profile changes, which
// update the User but not the profile's firstName/lastName, so the User record
// is the live one and must not be overwritten.
//
// Usage (from backend/, reads DB_URL from ../.env like the server does):
//   node scripts/repairOnboardingState.js            # dry run, lists affected users
//   node scripts/repairOnboardingState.js --apply    # write the fixes
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");
const OnboardingProfile = require("../models/OnboardingProfile");
const { syncUserToProfile, ensureProfileRef } = require("../controllers/onboardingController");

const apply = process.argv.includes("--apply");

const collapse = (s) => String(s || "").replace(/\s+/g, " ").trim();

async function main() {
  await mongoose.connect(process.env.DB_URL);

  const profiles = await OnboardingProfile.find({ isOnboardingComplete: true });
  const users = await User.find({ _id: { $in: profiles.map((p) => p.userId) } });
  const byId = new Map(users.map((u) => [String(u._id), u]));

  const split = [];      // not onboarded: the bug
  const missingRef = []; // onboarded, no/incorrect profile reference
  const whitespace = []; // onboarded, name differs only by spacing
  const reportOnly = []; // onboarded, real name/username difference

  for (const profile of profiles) {
    const user = byId.get(String(profile.userId));
    if (!user) continue;
    const profileName = collapse(`${profile.firstName} ${profile.lastName}`);

    if (!user.isOnboarded) {
      split.push({ user, profile, profileName });
      continue;
    }

    if (String(user.onboardingProfile || "") !== String(profile._id)) {
      missingRef.push({ user, profile });
    }

    const nameDiffers = user.name !== profileName;
    const usernameDiffers = user.username !== profile.username;
    if (nameDiffers && collapse(user.name) === profileName && !usernameDiffers) {
      whitespace.push({ user, from: user.name, to: collapse(user.name) });
    } else if (nameDiffers || usernameDiffers) {
      const notes = [];
      if (nameDiffers) notes.push(`name User "${user.name}" / profile "${profileName}"`);
      if (usernameDiffers) notes.push(`username User "${user.username}" / profile "${profile.username}"`);
      reportOnly.push({ user, notes });
    }
  }

  console.log(`${profiles.length} completed onboarding profile(s).\n`);

  console.log(`${split.length} user(s) stuck: profile complete but User not onboarded (will repair)`);
  for (const { user, profile, profileName } of split) {
    console.log(
      `  ${user._id}  name "${user.name}" → "${profileName}", username "${user.username}" → "${profile.username}"`
    );
  }

  console.log(`\n${missingRef.length} onboarded user(s) missing the onboardingProfile reference (will set)`);
  for (const { user } of missingRef) console.log(`  ${user._id}`);

  console.log(`\n${whitespace.length} onboarded user(s) with stray spaces in their name (will tidy)`);
  for (const { user, from, to } of whitespace) console.log(`  ${user._id}  "${from}" → "${to}"`);

  console.log(`\n${reportOnly.length} onboarded user(s) whose User and profile differ (report only, User is live)`);
  for (const { user, notes } of reportOnly) console.log(`  ${user._id}  ${notes.join("; ")}`);

  const total = split.length + missingRef.length + whitespace.length;
  if (!apply) {
    console.log(total ? "\nDry run. Re-run with --apply to write changes." : "\nNothing to do.");
    return;
  }

  let fixed = 0;
  for (const { user, profile } of split) {
    const conflict = await syncUserToProfile(user, profile);
    if (conflict) {
      console.warn(
        `  ${user._id}: flag/name/ref synced, but username "${conflict}" is held by another account. ` +
          "The user will be asked to pick a new username on their next visit."
      );
    } else {
      fixed++;
    }
  }
  for (const { user, profile } of missingRef) {
    await ensureProfileRef(user, profile);
    fixed++;
  }
  for (const { user, to } of whitespace) {
    await User.findByIdAndUpdate(user._id, { $set: { name: to } });
    fixed++;
  }
  console.log(`\nApplied ${fixed}/${total} change(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
