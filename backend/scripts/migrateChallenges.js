const mongoose = require("mongoose");
const Challenge = require("../models/challengeModel");
const ChallengeSubmission = require("../models/challengeSubmissionModel");
const ChallengeReward = require("../models/challengeRewardModel");
const ChallengeActivity = require("../models/challengeActivityModel");

/**
 * Migration script to clean up old challenge data and prepare for new system
 * Run this script after deploying the new challenge system
 */

const migrateChallenges = async () => {
  try {
    console.log("Starting challenge migration...");

    // 1. Remove challenges with old schema that can't be migrated
    const result = await Challenge.deleteMany({
      $or: [
        { challengeTitle: { $exists: true } }, // Old schema
        { tasks: { $exists: true, $ne: [] } }, // Has old task references
        { isStepbyStep: { $exists: true } }, // Old field
        { isAlwaysOn: { $exists: true } }, // Old field
      ],
    });

    console.log(`Removed ${result.deletedCount} challenges with old schema`);

    // 2. Clean up orphaned submissions from old system
    const submissions = await ChallengeSubmission.deleteMany({
      checkpoint: { $exists: true }, // Old field
    });

    console.log(`Removed ${submissions.deletedCount} old submissions`);

    // 3. Clean up old reward records
    const rewards = await ChallengeReward.deleteMany({
      $or: [
        { rewardType: { $in: ["cash", "prize"] } }, // Old reward types
        { amount: { $exists: true } }, // Old field
        { prizeDetails: { $exists: true } }, // Old field
      ],
    });

    console.log(`Removed ${rewards.deletedCount} old reward records`);

    // 4. Clean up old activity records
    const activities = await ChallengeActivity.deleteMany({
      activityType: {
        $in: [
          "join",
          "submit",
          "checkpoint_complete",
          "complete_challenge",
          "withdraw",
          "reward_claimed",
          "feedback",
        ],
      },
    });

    console.log(`Removed ${activities.deletedCount} old activity records`);

    // 5. Update remaining challenges to ensure they have the new schema
    const challenges = await Challenge.find({});
    let updatedCount = 0;

    for (const challenge of challenges) {
      let needsUpdate = false;
      const updates = {};

      // Ensure all challenges have the new required fields
      if (!challenge.creator) {
        if (challenge.createdBy) {
          updates.creator = challenge.createdBy;
          needsUpdate = true;
        }
      }

      // Ensure proper status
      if (
        !["unpublished", "upcoming", "ongoing", "completed"].includes(
          challenge.status
        )
      ) {
        updates.status = "unpublished";
        needsUpdate = true;
      }

      // Initialize empty arrays if missing
      if (!challenge.dailyTasks) {
        updates.dailyTasks = [];
        needsUpdate = true;
      }

      if (!challenge.checkpointRewards) {
        updates.checkpointRewards = [];
        needsUpdate = true;
      }

      if (!challenge.participants) {
        updates.participants = [];
        needsUpdate = true;
      }

      // Initialize stats if missing
      if (!challenge.stats) {
        updates.stats = {
          totalEnrolled: challenge.participants
            ? challenge.participants.length
            : 0,
          totalCompleted: challenge.participants
            ? challenge.participants.filter((p) => p.isCompleted).length
            : 0,
          avgCompletionRate: 0,
        };
        needsUpdate = true;
      }

      // Initialize settings if missing
      if (!challenge.settings) {
        updates.settings = {
          allowLateSubmissions: false,
          autoApproveSubmissions: false,
          requireApprovalForRewards: true,
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Challenge.findByIdAndUpdate(challenge._id, { $set: updates });
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} challenges with new schema`);

    console.log("Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Verify all challenges have proper creator assignments");
    console.log("2. Set up daily tasks for existing challenges");
    console.log("3. Configure checkpoint rewards as needed");
    console.log("4. Update challenge statuses based on dates");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  const DB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/geeksclash";

  mongoose
    .connect(DB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      return migrateChallenges();
    })
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration error:", error);
      process.exit(1);
    });
}

module.exports = { migrateChallenges };
