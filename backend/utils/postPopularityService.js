const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const NotificationService = require("./notificationService");
const {
  POST_POPULARITY_THRESHOLDS,
  MILESTONE_MESSAGES,
} = require("./milestone");

class PostPopularityService {
  /**
   * Check if a post meets popularity criteria
   * @param {Object} post - The post object
   * @param {number} commentCount - Number of comments on the post
   * @param {number} withinMinutes - Time window in minutes
   * @returns {Object|null} - Popularity level or null if not popular
   */
  static async checkPostPopularity(post, commentCount, threshold) {
    const postAge = Date.now() - new Date(post.createdAt).getTime();
    const ageInMinutes = postAge / (1000 * 60);

    // Check if post is within the time window
    if (ageInMinutes > threshold.withinMinutes) {
      return null;
    }

    // Check if post meets the popularity criteria
    if (
      post.likeCount >= threshold.likes &&
      commentCount >= threshold.comments
    ) {
      return {
        level: threshold.level,
        likes: post.likeCount,
        comments: commentCount,
        ageInMinutes: Math.round(ageInMinutes),
      };
    }

    return null;
  }

  /**
   * Process all posts for popularity tracking
   */
  static async processPostPopularity() {
    try {
      console.log("🔄 Starting post popularity check...");

      // Get all posts that haven't been marked as popular yet
      const posts = await Post.find({
        "milestones.popularityNotified": { $ne: true },
        isDeleted: { $ne: true },
        deletedAt: { $exists: false },
      }).populate("author");

      let processedCount = 0;
      let popularPostsFound = 0;

      for (const post of posts) {
        try {
          // Get comment count for the post
          const commentCount = await Comment.countDocuments({ post: post._id });

          // Check each popularity threshold
          for (const threshold of POST_POPULARITY_THRESHOLDS) {
            const popularity = await this.checkPostPopularity(
              post,
              commentCount,
              threshold
            );

            if (
              popularity &&
              !post.milestones.popularityLevels?.includes(threshold.level)
            ) {
              // Update post milestones
              post.milestones = post.milestones || {};
              post.milestones.popularityLevels =
                post.milestones.popularityLevels || [];
              post.milestones.popularityLevels.push(threshold.level);

              // Mark as notified if it's the highest level achieved
              const achievedLevels = post.milestones.popularityLevels;
              const highestLevel =
                this.getHighestPopularityLevel(achievedLevels);
              if (threshold.level === highestLevel) {
                post.milestones.popularityNotified = true;
              }

              await post.save();

              // Send personalized notification
              const milestoneData =
                MILESTONE_MESSAGES.popularity[threshold.level];
              const notificationData = {
                title: milestoneData.title,
                message: `${milestoneData.message} ${milestoneData.emoji} Your post has ${popularity.likes} likes and ${popularity.comments} comments in just ${popularity.ageInMinutes} minutes! <a href="${process.env.SITE_URL}/post/${post._id}" target="_blank" style="color: #007bff; text-decoration: underline;">View Post</a>`,
                senderId: null,
                senderModel: "System",
                recipients: [post.author._id],
                postId: post._id,
                type: "milestone",
                priority: "high",
              };

              await NotificationService.createAndSendNotification(
                notificationData
              );

              popularPostsFound++;
              console.log(
                `🎉 Post ${post._id} achieved ${threshold.level} status!`
              );

              // Break after finding the highest level to avoid multiple notifications
              break;
            }
          }

          processedCount++;
        } catch (error) {
          console.error(`❌ Error processing post ${post._id}:`, error.message);
        }
      }

      console.log(
        `✅ Post popularity check completed. Processed: ${processedCount}, Popular posts found: ${popularPostsFound}`
      );
      return { processedCount, popularPostsFound };
    } catch (error) {
      console.error("❌ Error in post popularity service:", error);
      throw error;
    }
  }

  /**
   * Get the highest popularity level from an array of levels
   * @param {Array} levels - Array of popularity levels
   * @returns {string} - Highest level
   */
  static getHighestPopularityLevel(levels) {
    const levelOrder = [
      "first-engagement",
      "getting-noticed",
      "small-buzz",
      "trending",
      "viral",
      "explosive",
      "legendary",
    ];
    let highestLevel = "first-engagement";

    for (const level of levels) {
      const currentIndex = levelOrder.indexOf(level);
      const highestIndex = levelOrder.indexOf(highestLevel);

      if (currentIndex > highestIndex) {
        highestLevel = level;
      }
    }

    return highestLevel;
  }

  /**
   * Get popularity statistics for a post
   * @param {string} postId - Post ID
   * @returns {Object} - Popularity statistics
   */
  static async getPostPopularityStats(postId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return null;
      }

      const commentCount = await Comment.countDocuments({ post: postId });
      const stats = {
        likes: post.likeCount,
        comments: commentCount,
        ageInMinutes: Math.round(
          (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60)
        ),
        popularityLevels: post.milestones?.popularityLevels || [],
        isPopular: false,
        currentLevel: null,
      };

      // Check current popularity level
      for (const threshold of POST_POPULARITY_THRESHOLDS) {
        const popularity = await this.checkPostPopularity(
          post,
          commentCount,
          threshold
        );

        if (popularity) {
          stats.isPopular = true;
          stats.currentLevel = threshold.level;
          break;
        }
      }

      return stats;
    } catch (error) {
      console.error("Error getting post popularity stats:", error);
      return null;
    }
  }
}

module.exports = PostPopularityService;
