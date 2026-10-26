// One-off cleanup: remove "user follows themselves" rows created before self-follow was blocked.
//   node scripts/removeSelfFollows.js          (dry run)
//   node scripts/removeSelfFollows.js --apply
// Community.members keeps the owner on purpose (owner is a built-in member).
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/userModel");

async function main() {
  const apply = process.argv.includes("--apply");
  await mongoose.connect(process.env.DB_URL);

  const users = await User.find({
    $expr: {
      $or: [
        { $in: ["$_id", { $ifNull: ["$following", []] }] },
        { $in: ["$_id", { $ifNull: ["$followers", []] }] },
        { $in: ["$createdCommunity", { $ifNull: ["$followedCommunities", []] }] },
      ],
    },
  }).select("username");

  console.log(`${users.length} user(s) with self-follow data`);
  for (const u of users) {
    console.log(` - ${u.username} (${u._id})`);
    if (!apply) continue;
    await User.updateOne({ _id: u._id }, [
      {
        $set: {
          following: { $filter: { input: { $ifNull: ["$following", []] }, cond: { $ne: ["$$this", "$_id"] } } },
          followers: { $filter: { input: { $ifNull: ["$followers", []] }, cond: { $ne: ["$$this", "$_id"] } } },
          followedCommunities: {
            $filter: {
              input: { $ifNull: ["$followedCommunities", []] },
              cond: { $ne: ["$$this", "$createdCommunity"] },
            },
          },
        },
      },
    ]);
  }
  console.log(apply ? "Cleaned." : "Dry run only; re-run with --apply.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
