const NotificationService = require("../utils/notificationService");
const Like = require("../models/likeModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const { getIo } = require("../utils/websocket");
const { LIKE_MILESTONES, MILESTONE_MESSAGES } = require("../utils/milestone");

module.exports = {
  // Create a like for a specific post
  createLike: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      const post = await Post.findById(postId).populate("author");
      if (!post) return res.status(404).json({ message: "Post not found." });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found." });

      const communityId = user.createdCommunity || null;

      const existingLike = await Like.findOne({ user: userId, post: postId });
      if (existingLike) {
        return res
          .status(400)
          .json({ message: "You already liked this post." });
      }

      const like = new Like({ user: userId, post: postId, communityId });
      await like.save();

      // Recalculate total likes
      const totalLikes = await Like.countDocuments({ post: postId });
      post.likeCount = totalLikes;

      for (const milestone of LIKE_MILESTONES) {
        if (
          post.likeCount >= milestone &&
          (!post.milestones || !post.milestones.likes?.includes(milestone))
        ) {
          // Update milestones array
          post.milestones = post.milestones || {};
          post.milestones.likes = post.milestones.likes || [];
          post.milestones.likes.push(milestone);
          await post.save();

          // Get personalized milestone message
          const milestoneData = MILESTONE_MESSAGES.likes[milestone];

          // Send milestone notification
          const milestoneNotification = {
            title: milestoneData.title,
            message: `${milestoneData.message} ${milestoneData.emoji} <a href="${process.env.SITE_URL}/post/${post._id}" target="_blank" style="color: #007bff; text-decoration: underline;">View Post</a>`,
            senderId: null,
            senderModel: "System",
            recipients: [post.author._id],
            postId: post._id,
            type: "milestone",
            priority: "high",
          };

          await NotificationService.createAndSendNotification(
            milestoneNotification
          );

          break; // prevent triggering multiple milestones at once
        }
      }
      await post.save();

      // Send notification if not the same user
      if (post.author._id.toString() !== userId) {
        const notificationData = {
          title: "Post liked",
          message: `${user.username} liked your post. <a href="${process.env.SITE_URL}/post/${post._id}" target="_blank" style="color: #007bff; text-decoration: underline;">View Post</a>`,
          senderId: userId,
          senderModel: "User",
          recipients: [post.author._id],
          postId: post._id,
          type: "system",
          priority: "normal",
        };
        await NotificationService.createAndSendNotification(notificationData);
      }

      const io = getIo();
      io.to(postId).emit("newLike", {
        postId: post._id,
        like: {
          _id: like._id,
          user: like.user,
          communityId: like.communityId,
          dateTime: like.dateTime,
        },
        likeCount: totalLikes,
      });

      res.status(201).json({
        message: "Post liked successfully.",
        like: {
          _id: like._id,
          post: like.post,
          user: like.user,
          communityId: like.communityId,
          dateTime: like.dateTime,
        },
        likeCount: totalLikes,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Delete a like for a specific post
  deleteLike: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      const like = await Like.findOne({ user: userId, post: postId });
      if (!like) return res.status(404).json({ message: "Like not found." });

      await Like.deleteOne({ _id: like._id });

      // Recalculate total likes
      const totalLikes = await Like.countDocuments({ post: postId });
      await Post.findByIdAndUpdate(postId, { likeCount: totalLikes });

      const io = getIo();
      io.to(postId).emit("likeRemoved", {
        postId,
        likeCount: totalLikes,
      });

      res
        .status(200)
        .json({ message: "Like removed successfully.", likeCount: totalLikes });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get all likes for a specific post
  getLikesForPost: async (req, res) => {
    try {
      const { postId } = req.params;
      const likes = await Like.find({ post: postId }).populate("user");
      res.status(200).json({ likes });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get all likes by a user
  getUserLikes: async (req, res) => {
    try {
      const userId = req.userId;
      const likes = await Like.find({ user: userId }).populate("post");
      res.status(200).json({ likes });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Check if a post is liked by the user
  getIfLiked: async (req, res) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;

      const result = await Like.findOne({ user: userId, post: postId });
      res.status(200).json({
        Message: result ? "Already Liked" : "Not Liked",
        Switch: !!result,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};
