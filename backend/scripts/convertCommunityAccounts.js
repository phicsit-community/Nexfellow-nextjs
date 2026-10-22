// One-time migration: every account becomes a normal account. Community accounts
// are converted, posts made in a community move to the General Feed (same author),
// and communities are marked archived (isArchived/archivedAt — kept, not deleted).
//
// Before writing, the original value of every field it changes is saved to a
// backup file, so the run can be undone exactly with --restore.
//
// Usage (from backend/):
//   node scripts/convertCommunityAccounts.js                  # dry run, only counts
//   node scripts/convertCommunityAccounts.js --apply          # backup + write
//   node scripts/convertCommunityAccounts.js --restore <file> # undo using a backup
//
// Uses the raw collections: isArchived isn't in the Community schema, and
// Mongoose would silently drop it from a model update.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { EJSON } = mongoose.mongo.BSON;
const User = require("../models/userModel");
const Community = require("../models/communityModel");
const Post = require("../models/postModel");
const OnboardingProfile = require("../models/OnboardingProfile");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const restoreFile = args.includes("--restore") ? args[args.indexOf("--restore") + 1] : null;

const users = User.collection;
const communities = Community.collection;
const posts = Post.collection;
const onboardingProfiles = OnboardingProfile.collection;

const userFilter = {
  $or: [
    { isCommunityAccount: true },
    { createdCommunity: { $exists: true, $ne: null } },
  ],
};
const postFilter = { community: { $ne: null } };
// Communities can only be created by community accounts, so with those gone
// every community is archived (including already soft-deleted ones).
const communityFilter = { isArchived: { $ne: true } };
const onboardingFilter = { accountType: "community" };

async function migrate() {
  const [userCount, postCount, communityCount, onboardingCount] = await Promise.all([
    users.countDocuments(userFilter),
    posts.countDocuments(postFilter),
    communities.countDocuments(communityFilter),
    onboardingProfiles.countDocuments(onboardingFilter),
  ]);

  console.log(`${userCount} community account(s) to convert to normal accounts.`);
  console.log(`${postCount} community post(s) to move to the General Feed.`);
  console.log(`${communityCount} community(ies) to archive.`);
  console.log(`${onboardingCount} onboarding profile(s) with accountType "community".`);

  if (!apply) {
    console.log("Dry run. Re-run with --apply to write changes.");
    return;
  }

  // Snapshot the original values of every field this run changes
  const backup = {
    createdAt: new Date(),
    users: await users
      .find(userFilter, { projection: { isCommunityAccount: 1, createdCommunity: 1, communityBadge: 1 } })
      .toArray(),
    posts: await posts
      .find(postFilter, { projection: { community: 1, isGeneralFeed: 1, pinned: 1 } })
      .toArray(),
    communities: await communities
      .find(communityFilter, { projection: { isArchived: 1, archivedAt: 1 } })
      .toArray(),
    onboardingProfiles: await onboardingProfiles
      .find(onboardingFilter, { projection: { accountType: 1 } })
      .toArray(),
  };
  const backupDir = path.join(__dirname, "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(
    backupDir,
    `convertCommunityAccounts-${backup.createdAt.toISOString().replace(/[:.]/g, "-")}.json`
  );
  fs.writeFileSync(backupFile, EJSON.stringify(backup, null, 2));
  console.log(`Backup of original values written to ${backupFile}`);

  // Posts first — if anything below fails, re-running picks up where it stopped
  const postRes = await posts.updateMany(postFilter, {
    $set: { community: null, isGeneralFeed: true, pinned: false },
  });
  console.log(`Moved ${postRes.modifiedCount} post(s) to the General Feed.`);

  const communityRes = await communities.updateMany(communityFilter, {
    $set: { isArchived: true, archivedAt: new Date() },
  });
  console.log(`Archived ${communityRes.modifiedCount} community(ies).`);

  // Community.owner still points at the user, so the link isn't lost.
  // $unset (not null) matches normal accounts and the unique index on createdCommunity.
  const userRes = await users.updateMany(userFilter, {
    $set: { isCommunityAccount: false, communityBadge: false },
    $unset: { createdCommunity: "" },
  });
  console.log(`Converted ${userRes.modifiedCount} account(s) to normal accounts.`);

  const onboardingRes = await onboardingProfiles.updateMany(onboardingFilter, {
    $set: { accountType: "individual" },
  });
  console.log(`Updated ${onboardingRes.modifiedCount} onboarding profile(s).`);
}

// Put every saved field back exactly; fields that didn't exist before are removed
function restoreOps(docs, fields) {
  return docs.map(({ _id, ...saved }) => {
    const $set = {};
    const $unset = {};
    for (const field of fields) {
      if (field in saved) $set[field] = saved[field];
      else $unset[field] = "";
    }
    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;
    return { updateOne: { filter: { _id }, update } };
  });
}

async function restore(file) {
  const backup = EJSON.parse(fs.readFileSync(file, "utf8"));
  const plan = [
    [users, backup.users, ["isCommunityAccount", "createdCommunity", "communityBadge"], "user(s)"],
    [posts, backup.posts, ["community", "isGeneralFeed", "pinned"], "post(s)"],
    [communities, backup.communities, ["isArchived", "archivedAt"], "community(ies)"],
    [onboardingProfiles, backup.onboardingProfiles, ["accountType"], "onboarding profile(s)"],
  ];

  for (const [collection, docs, fields, label] of plan) {
    console.log(`${docs.length} ${label} in backup.`);
  }
  if (!apply) {
    console.log("Dry run. Re-run with --restore <file> --apply to write changes.");
    return;
  }

  for (const [collection, docs, fields, label] of plan) {
    if (!docs.length) continue;
    const res = await collection.bulkWrite(restoreOps(docs, fields));
    console.log(`Restored ${res.modifiedCount} ${label}.`);
  }
}

(async () => {
  await mongoose.connect(process.env.DB_URL);
  try {
    if (restoreFile) await restore(restoreFile);
    else await migrate();
  } finally {
    await mongoose.disconnect();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
