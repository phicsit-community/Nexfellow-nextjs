const mongoose = require("mongoose");
const User = require("../models/userModel");
const Community = require("../models/communityModel");
const Post = require("../models/postModel");

const cache = new Map();

const getUserSuggestions = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Return from cache if available
    if (cache.has(userId)) {
      return res.json(cache.get(userId));
    }

    // Fetch current user with relevant fields
    const currentUser = await User.findById(userId)
      .select(
        "following blockedUsers mutedUsers followedCommunities registeredCommunityQuizzes"
      )
      .lean();

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare exclusion list: self, followed, blocked, muted
    const excludeIds = new Set(
      [
        userId,
        ...(currentUser.following || []),
        ...(currentUser.blockedUsers || []),
        ...(currentUser.mutedUsers || []),
      ].map((id) => id.toString())
    );

    // Prepare interest set from followed communities
    const followedCategories = new Set();
    if (currentUser.followedCommunities?.length) {
      const followedCommunities = await Community.find({
        _id: { $in: currentUser.followedCommunities },
      })
        .select("category")
        .lean();
      followedCommunities.forEach((comm) => {
        (comm.category || []).forEach((cat) => followedCategories.add(cat));
      });
    }

    // Fetch candidate users (community accounts, not excluded)
    const users = await User.find({
      _id: { $nin: Array.from(excludeIds) },
      isCommunityAccount: true,
      createdCommunity: { $ne: null },
    })
      .populate(
        "createdCommunity",
        "members posts category description dateCreated"
      )
      .lean();

    // Helper: get recent activity for a community
    const getRecentActivity = async (communityId) => {
      const recentPosts = await Post.find({
        community: communityId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
        .select("likes comments")
        .lean();
      const totalLikes = recentPosts.reduce(
        (sum, post) => sum + (post.likes?.length || 0),
        0
      );
      const totalEngagements = recentPosts.reduce(
        (sum, post) => sum + (post.comments?.length || 0),
        0
      );
      return { totalLikes, totalEngagements };
    };

    // Score each user
    const scoredUsers = await Promise.all(
      users.map(async (user) => {
        let score = 0;
        const community = user.createdCommunity;

        // Profile completeness and badges
        if (user.verificationBadge) score += 20;
        if (user.premiumBadge) score += 15;
        if (user.picture) score += 5;
        if (user.banner) score += 2;
        if (user.name && user.username) score += 2;

        // Community size
        const communitySize = community?.members?.length || 0;
        score += communitySize / 10;

        // Recent activity
        let totalLikes = 0,
          totalEngagements = 0;
        if (community?._id) {
          const activity = await getRecentActivity(community._id);
          totalLikes = activity.totalLikes;
          totalEngagements = activity.totalEngagements;
        }
        score += totalLikes / 5;
        score += totalEngagements / 3;

        // Shared interests (categories)
        let sharedCategoryBonus = 0;
        if (community?.category) {
          for (const cat of community.category) {
            if (followedCategories.has(cat)) sharedCategoryBonus += 5;
          }
        }
        score += sharedCategoryBonus;

        // Recency of community creation
        if (community?.dateCreated) {
          const daysSinceCreated =
            (Date.now() - new Date(community.dateCreated).getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysSinceCreated < 30) score += 5;
        }

        return { user, score };
      })
    );

    // Sort by score, add diversity by including a couple of random users
    scoredUsers.sort((a, b) => b.score - a.score);
    let suggestions = scoredUsers.slice(0, 6).map((entry) => entry.user);

    // Add 2 random users for diversity (if available)
    const remainingUsers = scoredUsers.slice(6).map((entry) => entry.user);
    if (remainingUsers.length > 0) {
      const randomIndexes = [];
      while (
        randomIndexes.length < 2 &&
        randomIndexes.length < remainingUsers.length
      ) {
        const idx = Math.floor(Math.random() * remainingUsers.length);
        if (!randomIndexes.includes(idx)) randomIndexes.push(idx);
      }
      randomIndexes.forEach((idx) => suggestions.push(remainingUsers[idx]));
    }

    // Cache and return
    cache.set(userId, suggestions);
    setTimeout(() => cache.delete(userId), 300000);

    return res.json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getUserSuggestions };
