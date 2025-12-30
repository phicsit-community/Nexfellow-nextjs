// Test script for comprehensive milestone and popularity routes
require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./models/postModel");
const User = require("./models/userModel");

async function testComprehensiveRoutes() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to database");

    // Test summary data
    console.log("📊 Testing summary data...");

    // Get total counts
    const totalPosts = await Post.countDocuments({
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    });

    const totalUsers = await User.countDocuments();

    // Get posts with any milestones
    const postsWithMilestones = await Post.countDocuments({
      $or: [
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.popularityLevels": { $exists: true, $ne: [] } },
      ],
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    });

    // Get users with any milestones
    const usersWithMilestones = await User.countDocuments({
      $or: [
        { "milestones.followers": { $exists: true, $ne: [] } },
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.posts": { $exists: true, $ne: [] } },
      ],
    });

    // Get popularity breakdown
    const popularityBreakdown = await Post.aggregate([
      {
        $match: {
          "milestones.popularityLevels": { $exists: true, $ne: [] },
          isDeleted: { $ne: true },
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: null,
          trending: {
            $sum: {
              $cond: [
                { $in: ["trending", "$milestones.popularityLevels"] },
                1,
                0,
              ],
            },
          },
          viral: {
            $sum: {
              $cond: [{ $in: ["viral", "$milestones.popularityLevels"] }, 1, 0],
            },
          },
          explosive: {
            $sum: {
              $cond: [
                { $in: ["explosive", "$milestones.popularityLevels"] },
                1,
                0,
              ],
            },
          },
          legendary: {
            $sum: {
              $cond: [
                { $in: ["legendary", "$milestones.popularityLevels"] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get milestone breakdown
    const milestoneBreakdown = await User.aggregate([
      {
        $match: {
          $or: [
            { "milestones.followers": { $exists: true, $ne: [] } },
            { "milestones.likes": { $exists: true, $ne: [] } },
            { "milestones.posts": { $exists: true, $ne: [] } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          followerMilestones: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    { $size: { $ifNull: ["$milestones.followers", []] } },
                    0,
                  ],
                },
                1,
                0,
              ],
            },
          },
          likeMilestones: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ["$milestones.likes", []] } }, 0] },
                1,
                0,
              ],
            },
          },
          postMilestones: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ["$milestones.posts", []] } }, 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    console.log("📈 Summary Results:");
    console.log("===================");
    console.log(`Total Posts: ${totalPosts}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Posts with Milestones: ${postsWithMilestones}`);
    console.log(`Users with Milestones: ${usersWithMilestones}`);
    console.log(
      `Posts with Milestones %: ${
        totalPosts > 0
          ? ((postsWithMilestones / totalPosts) * 100).toFixed(2)
          : 0
      }%`
    );
    console.log(
      `Users with Milestones %: ${
        totalUsers > 0
          ? ((usersWithMilestones / totalUsers) * 100).toFixed(2)
          : 0
      }%`
    );

    console.log("\n🎯 Popularity Breakdown:");
    console.log("=======================");
    const popularity = popularityBreakdown[0] || {
      trending: 0,
      viral: 0,
      explosive: 0,
      legendary: 0,
    };
    console.log(`Trending Posts: ${popularity.trending}`);
    console.log(`Viral Posts: ${popularity.viral}`);
    console.log(`Explosive Posts: ${popularity.explosive}`);
    console.log(`Legendary Posts: ${popularity.legendary}`);

    console.log("\n🏆 Milestone Breakdown:");
    console.log("======================");
    const milestones = milestoneBreakdown[0] || {
      followerMilestones: 0,
      likeMilestones: 0,
      postMilestones: 0,
    };
    console.log(
      `Users with Follower Milestones: ${milestones.followerMilestones}`
    );
    console.log(`Users with Like Milestones: ${milestones.likeMilestones}`);
    console.log(`Users with Post Milestones: ${milestones.postMilestones}`);

    // Test comprehensive data
    console.log("\n🔍 Testing comprehensive data...");

    // Get sample posts with milestones
    const samplePosts = await Post.find({
      $or: [
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.popularityLevels": { $exists: true, $ne: [] } },
      ],
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    })
      .populate("author", "username name picture")
      .limit(5);

    console.log(`\n📝 Sample Posts with Milestones: ${samplePosts.length}`);
    samplePosts.forEach((post, index) => {
      console.log(
        `${index + 1}. Post by ${post.author?.username || "Unknown"}`
      );
      console.log(
        `   - Like Milestones: ${post.milestones?.likes?.join(", ") || "None"}`
      );
      console.log(
        `   - Popularity Levels: ${
          post.milestones?.popularityLevels?.join(", ") || "None"
        }`
      );
    });

    // Get sample users with milestones
    const sampleUsers = await User.find({
      $or: [
        { "milestones.followers": { $exists: true, $ne: [] } },
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.posts": { $exists: true, $ne: [] } },
      ],
    })
      .select("username name milestones followers")
      .limit(5);

    console.log(`\n👥 Sample Users with Milestones: ${sampleUsers.length}`);
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.name})`);
      console.log(`   - Followers: ${user.followers?.length || 0}`);
      console.log(
        `   - Follower Milestones: ${
          user.milestones?.followers?.join(", ") || "None"
        }`
      );
      console.log(
        `   - Like Milestones: ${user.milestones?.likes?.join(", ") || "None"}`
      );
      console.log(
        `   - Post Milestones: ${user.milestones?.posts?.join(", ") || "None"}`
      );
    });

    console.log("\n✅ Comprehensive route test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testComprehensiveRoutes();
}

module.exports = testComprehensiveRoutes;
