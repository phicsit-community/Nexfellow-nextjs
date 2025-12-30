// cleanupOrphanedUserData.js
const mongoose = require("mongoose");
require("dotenv").config();

async function cleanupOrphanedUserData() {
  await mongoose.connect(process.env.DB_URL);

  const db = mongoose.connection.db;

  // Get all existing user IDs
  const userIds = await db.collection("users").distinct("_id");

  // Helper to delete orphaned docs
  async function deleteOrphaned(collection, field) {
    const result = await db
      .collection(collection)
      .deleteMany({ [field]: { $nin: userIds } });
    console.log(
      `Deleted ${result.deletedCount} orphaned docs from ${collection}.${field}`
    );
  }

  // Helper to delete orphaned docs with multiple user fields
  async function deleteOrphanedMulti(collection, fields) {
    const or = fields.map((f) => ({ [f]: { $nin: userIds } }));
    const result = await db.collection(collection).deleteMany({ $or: or });
    console.log(
      `Deleted ${
        result.deletedCount
      } orphaned docs from ${collection} (${fields.join(",")})`
    );
  }

  // Delete orphaned documents
  await deleteOrphaned("posts", "author");
  await deleteOrphaned("comments", "author");
  await deleteOrphaned("attachments", "user");
  await deleteOrphaned("likes", "user");
  await deleteOrphaned("messages", "author");
  await deleteOrphaned("submissions", "userId");
  await deleteOrphaned("completedtasks", "userId");
  await deleteOrphaned("challengesubmissions", "user");
  await deleteOrphaned("communitysubmissions", "userId");
  await deleteOrphaned("challengeactivities", "user");
  await deleteOrphaned("challengerewards", "user");
  await deleteOrphanedMulti("reports", ["reporterId", "authorId"]);
  await deleteOrphaned("rewards", "userId");
  await deleteOrphaned("userdevicetokens", "user");
  await deleteOrphaned("bookmarks", "user");
  await deleteOrphaned("requests", "userId");
  await deleteOrphaned("conversations", "participants");
  await deleteOrphaned("directmessages", "sender");
  await deleteOrphaned("events", "createdBy");
  await deleteOrphaned("profiles", "userId");

  // Fields to clean (array or non-array) in each collection
  const arrayFields = [
    {
      collection: "users",
      fields: [
        "followers",
        "following",
        "mutedUsers",
        "blockedUsers",
        "hiddenPosts",
      ],
    },
    {
      collection: "communities",
      fields: [
        "members",
        "followers",
        "moderators",
        "topMembers",
        "appraisals",
      ],
    },
    {
      collection: "quizzes",
      fields: ["registeredUsers", "User_profile_Image"],
    },
  ];

  // For each field, set non-array values to [] and pull orphaned userIds
  for (const { collection, fields } of arrayFields) {
    for (const field of fields) {
      // 1. Set non-array fields to empty array
      const res1 = await db
        .collection(collection)
        .updateMany(
          { [field]: { $exists: true, $not: { $type: "array" } } },
          { $set: { [field]: [] } }
        );
      if (res1.modifiedCount)
        console.log(
          `[${collection}] Set non-array "${field}" to [] in ${res1.modifiedCount} docs`
        );

      // 2. Remove orphaned user IDs from arrays
      const res2 = await db
        .collection(collection)
        .updateMany(
          { [field]: { $type: "array" } },
          { $pull: { [field]: { $nin: userIds } } }
        );
      if (res2.modifiedCount)
        console.log(
          `[${collection}] Cleaned orphaned userIds from "${field}" in ${res2.modifiedCount} docs`
        );
    }
  }

  // Clean up ranks.userId in leaderboard and communityleaderboard

  // Remove orphaned userIds from leaderboard.ranks
  const leaderboardRes = await db
    .collection("leaderboards")
    .updateMany({}, { $pull: { ranks: { userId: { $nin: userIds } } } });
  console.log(
    `[leaderboards] Removed orphaned userIds from ranks in ${leaderboardRes.modifiedCount} docs`
  );

  // Remove orphaned userIds from communityleaderboards.ranks
  const communityLeaderboardRes = await db
    .collection("communityleaderboards")
    .updateMany({}, { $pull: { ranks: { userId: { $nin: userIds } } } });
  console.log(
    `[communityleaderboards] Removed orphaned userIds from ranks in ${communityLeaderboardRes.modifiedCount} docs`
  );

  // Nullify user references in shortenedurls
  await db
    .collection("shortenedurls")
    .updateMany({ creator: { $nin: userIds } }, { $set: { creator: null } });

  console.log("Cleanup complete.");
  await mongoose.disconnect();
}

cleanupOrphanedUserData().catch((err) => {
  console.error("Error during cleanup:", err);
  process.exit(1);
});
