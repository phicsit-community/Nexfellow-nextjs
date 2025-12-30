const express = require("express");
const router = express.Router();
const PostPopularityService = require("../utils/postPopularityService");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const { isClient } = require("../middleware");

// Manual trigger for post popularity check (admin only)
router.post("/check", async (req, res) => {
  try {
    console.log("🔧 Manual post popularity check triggered");
    const result = await PostPopularityService.processPostPopularity();
    res.status(200).json({
      success: true,
      message: "Post popularity check completed",
      result,
    });
  } catch (error) {
    console.error("Error in manual popularity check:", error);
    res.status(500).json({
      success: false,
      message: "Error processing post popularity",
      error: error.message,
    });
  }
});

router.get("/check-all", async (req, res) => {
  try {
    const result = await PostPopularityService.processPostPopularity();
    console.log(result);
    res.status(200).json({
      success: true,
      message: "Post popularity check completed",
      result,
    });
  } catch (error) {
    console.error("Error in manual popularity check:", error);
    res.status(500).json({
      success: false,
      message: "Error processing post popularity",
      error: error.message,
    });
  }
});

// Get popularity stats for a specific post
router.get("/stats/:postId", isClient, async (req, res) => {
  try {
    const { postId } = req.params;
    const stats = await PostPopularityService.getPostPopularityStats(postId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting post popularity stats:", error);
    res.status(500).json({
      success: false,
      message: "Error getting popularity stats",
      error: error.message,
    });
  }
});

// Get all popular posts (for admin dashboard)
router.get("/popular", async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const popularPosts = await Post.find({
      "milestones.popularityLevels": { $exists: true, $ne: [] },
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    })
      .populate("author", "username name picture")
      .populate("community", "name")
      .sort({ "milestones.popularityLevels": -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      "milestones.popularityLevels": { $exists: true, $ne: [] },
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    });

    res.status(200).json({
      success: true,
      posts: popularPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: skip + popularPosts.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting popular posts:", error);
    res.status(500).json({
      success: false,
      message: "Error getting popular posts",
      error: error.message,
    });
  }
});

// Comprehensive route to see all popularity and milestone data
router.get("/comprehensive", async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Get all posts with any milestone data
    const postsWithMilestones = await Post.find({
      $or: [
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.popularityLevels": { $exists: true, $ne: [] } },
      ],
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    })
      .populate("author", "username name picture")
      .populate("community", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get users with milestone achievements
    const usersWithMilestones = await User.find({
      $or: [
        { "milestones.followers": { $exists: true, $ne: [] } },
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.posts": { $exists: true, $ne: [] } },
      ],
    })
      .select("username name picture milestones followers following")
      .sort({ "milestones.followers": -1 })
      .limit(20);

    // Get popularity statistics
    const popularityStats = await Post.aggregate([
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
          totalPopularPosts: { $sum: 1 },
          trendingPosts: {
            $sum: {
              $cond: [
                { $in: ["trending", "$milestones.popularityLevels"] },
                1,
                0,
              ],
            },
          },
          viralPosts: {
            $sum: {
              $cond: [{ $in: ["viral", "$milestones.popularityLevels"] }, 1, 0],
            },
          },
          explosivePosts: {
            $sum: {
              $cond: [
                { $in: ["explosive", "$milestones.popularityLevels"] },
                1,
                0,
              ],
            },
          },
          legendaryPosts: {
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

    // Get milestone statistics
    const milestoneStats = await User.aggregate([
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
          totalUsersWithMilestones: { $sum: 1 },
          usersWithFollowerMilestones: {
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
          usersWithLikeMilestones: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ["$milestones.likes", []] } }, 0] },
                1,
                0,
              ],
            },
          },
          usersWithPostMilestones: {
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

    // Get recent milestone achievements (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMilestones = await Post.find({
      $or: [
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.popularityLevels": { $exists: true, $ne: [] } },
      ],
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    })
      .populate("author", "username name picture")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        postsWithMilestones: {
          posts: postsWithMilestones,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(postsWithMilestones.length / limit),
            hasNext:
              skip + postsWithMilestones.length < postsWithMilestones.length,
            hasPrev: page > 1,
          },
        },
        usersWithMilestones,
        popularityStats: popularityStats[0] || {
          totalPopularPosts: 0,
          trendingPosts: 0,
          viralPosts: 0,
          explosivePosts: 0,
          legendaryPosts: 0,
        },
        milestoneStats: milestoneStats[0] || {
          totalUsersWithMilestones: 0,
          usersWithFollowerMilestones: 0,
          usersWithLikeMilestones: 0,
          usersWithPostMilestones: 0,
        },
        recentMilestones,
      },
    });
  } catch (error) {
    console.error("Error getting comprehensive milestone data:", error);
    res.status(500).json({
      success: false,
      message: "Error getting comprehensive data",
      error: error.message,
    });
  }
});

// Summary route for analytics - numbers only
router.get("/summary", async (req, res) => {
  try {
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

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMilestonePosts = await Post.countDocuments({
      $or: [
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.popularityLevels": { $exists: true, $ne: [] } },
      ],
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: { $ne: true },
      deletedAt: { $exists: false },
    });

    const recentMilestoneUsers = await User.countDocuments({
      $or: [
        { "milestones.followers": { $exists: true, $ne: [] } },
        { "milestones.likes": { $exists: true, $ne: [] } },
        { "milestones.posts": { $exists: true, $ne: [] } },
      ],
      updatedAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      summary: {
        totals: {
          posts: totalPosts,
          users: totalUsers,
          postsWithMilestones,
          usersWithMilestones,
        },
        popularity: popularityBreakdown[0] || {
          trending: 0,
          viral: 0,
          explosive: 0,
          legendary: 0,
        },
        milestones: milestoneBreakdown[0] || {
          followerMilestones: 0,
          likeMilestones: 0,
          postMilestones: 0,
        },
        recentActivity: {
          last7Days: {
            milestonePosts: recentMilestonePosts,
            milestoneUsers: recentMilestoneUsers,
          },
        },
        percentages: {
          postsWithMilestones:
            totalPosts > 0
              ? ((postsWithMilestones / totalPosts) * 100).toFixed(2)
              : 0,
          usersWithMilestones:
            totalUsers > 0
              ? ((usersWithMilestones / totalUsers) * 100).toFixed(2)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting summary data:", error);
    res.status(500).json({
      success: false,
      message: "Error getting summary data",
      error: error.message,
    });
  }
});

module.exports = router;
