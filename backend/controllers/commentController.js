const NotificationService = require("../utils/notificationService");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const Community = require("../models/communityModel");
const { getIo } = require("../utils/websocket");
const mongoose = require("mongoose");

// Helper to check content-admin moderator or owner of community
async function userIsContentAdminOrOwner(communityId, userId) {
  if (
    !mongoose.Types.ObjectId.isValid(communityId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  )
    return false;

  const community = await Community.findById(communityId).populate(
    "owner moderators.user"
  );
  if (!community) return false;

  if (community.owner.equals(userId)) return true;

  return community.moderators.some(
    (mod) =>
      mod.user && mod.user._id.equals(userId) && mod.role === "content-admin"
  );
}

// Create a new comment or reply with mentions support
exports.createComment = async (req, res) => {
  const { content, parentCommentId, mentions } = req.body; // mentions array added
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate("author");
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Prepare content with @username prefix if replying to a comment
    let replyContent = content;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId).populate("author", "username");
      if (parentComment && parentComment.author && parentComment.author.username) {
        replyContent = `replying to ${parentComment.author.username}: ${content}`;
      }
    }

    const comment = new Comment({
      author: req.user._id,
      content: replyContent,
      post: postId,
      parentComment: parentCommentId || null,
      mentions: mentions || [], // set mentions array
    });

    await comment.save();

    // Update parent comment's reply array if applicable
    if (parentCommentId) {
      const parentComment = await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { reply: comment._id } },
        { new: true }
      );
      if (!parentComment)
        return res.status(404).json({ message: "Parent comment not found" });

      // Notify parent comment author if different user (reply notification)
      if (!parentComment.author.equals(req.user._id)) {
        const postLink = `${process.env.SITE_URL}/post/${postId}`;
        await NotificationService.createAndSendNotification({
          title: "Comment reply",
          message: `${req.user.username} replied to your comment: "${content}" <a href="${postLink}" target="_blank" style="color: #007bff; text-decoration: underline;">View Post</a>`,
          senderId: req.user._id,
          senderModel: "User",
          recipients: [parentComment.author],
          postId,
          type: "system",
          priority: "normal",
        });
      }
    } else {
      // Notify post author if different user (new comment notification)
      if (!post.author._id.equals(req.user._id)) {
        const postLink = `${process.env.SITE_URL}/post/${postId}`;
        await NotificationService.createAndSendNotification({
          title: "New comment",
          message: `${req.user.username} commented on your post <a href="${postLink}" target="_blank" style="color: #007bff; text-decoration: underline;">View Post</a>`,
          senderId: req.user._id,
          senderModel: "User",
          recipients: [post.author._id],
          postId,
          type: "system",
          priority: "normal",
        });
      }
    }

    // Notify mentioned users (excluding the author)
    if (mentions && mentions.length > 0) {
      const uniqueMentions = [...new Set(mentions.map(String))].filter(
        (id) => id !== String(req.user._id)
      );
      if (uniqueMentions.length > 0) {
        const postLink = `${process.env.SITE_URL}/post/${postId}`;
        await NotificationService.createAndSendNotification({
          title: "Mentioned in a comment",
          message: `${req.user.username} mentioned you in a comment: "${content.substring(0, 50)}". <a href="${postLink}" target="_blank" style="color: #007bff; text-decoration: underline;">View Comment</a>`,
          senderId: req.user._id,
          senderModel: "User",
          recipients: uniqueMentions,
          postId,
          type: "system",
          priority: "normal",
        });
      }
    }

    // Update post with new comment
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    const io = getIo();
    io.emit("commentAdded", comment);

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating comment", error });
  }
};

// Fetch comments with nested replies (up to depth 5)
exports.getCommentsWithReplies = async (req, res) => {
  const { postId } = req.params;

  try {
    const populateReplies = (function createPattern(depth = 5) {
      if (depth <= 0)
        return {
          path: "author",
          select: "name username picture isCommunityAccount createdCommunity"
        };
      return {
        path: "reply",
        populate: [
          { path: "author", select: "name username picture isCommunityAccount createdCommunity" },
          { path: "mentions", select: "name username picture isCommunityAccount createdCommunity" },
          createPattern(depth - 1),
        ],
        options: { sort: { createdAt: -1 } },
      };
    })();

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate(populateReplies)
      .populate("author", "name username picture isCommunityAccount createdCommunity")
      .populate("mentions", "name username picture isCommunityAccount createdCommunity")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this comment" });
    }

    comment.content = content;
    await comment.save();

    const io = getIo();
    io.emit("commentUpdated", comment);

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating comment", error });
  }
};

// Recursive delete helper function (keep this as is)
async function deleteCommentAndReplies(commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) return;

  for (const replyId of comment.reply) {
    await deleteCommentAndReplies(replyId);
  }

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { reply: comment._id },
    });
  }

  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id },
  });
  await Comment.findByIdAndDelete(commentId);
}

// Delete a comment
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Fetch post and community with owner/moderators to check permissions
    const post = await Post.findById(comment.post).populate({
      path: "community",
      populate: { path: "owner moderators.user" },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.community)
      return res.status(404).json({ message: "Community not found" });

    const isCommentAuthor = comment.author.equals(req.user._id);
    const isPostAuthor = post.author.equals(req.user._id);
    const isCommunityOwner = post.community.owner.equals(req.user._id);
    const isContentAdmin = post.community.moderators.some(
      (mod) =>
        mod.user &&
        mod.user._id.equals(req.user._id) &&
        mod.role === "content-admin"
    );

    if (
      !isCommentAuthor &&
      !isPostAuthor &&
      !isCommunityOwner &&
      !isContentAdmin
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }

    await deleteCommentAndReplies(commentId);

    const io = getIo();
    io.emit("commentDeleted", { commentId });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

// Like or Unlike a comment
exports.likeComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId).populate("post");
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };
    const updatedComment = await Comment.findByIdAndUpdate(commentId, update, {
      new: true,
    });

    if (!alreadyLiked && !comment.author.equals(userId)) {
      const postLink = `${process.env.SITE_URL}/post/${comment.post._id}`;
      await NotificationService.createAndSendNotification({
        title: "Comment liked",
        message: `${req.user.username} liked your comment: "${comment.content}" <a href="${postLink}" target="_blank" style="color: #007bff; text-decoration: underline;">View Post</a>`,
        senderId: userId,
        senderModel: "User",
        recipients: [comment.author],
        commentId,
        type: "system",
        priority: "normal",
      });
    }

    const io = getIo();
    io.emit("commentLiked", { commentId, liked: !alreadyLiked });

    res.status(200).json({
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      likes: updatedComment.likes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error liking comment", error });
  }
};

// Report a comment
exports.reportComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { reported: true, status: "under_review" },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const io = getIo();
    io.emit("commentReported", comment);

    res.status(200).json({ message: "Comment reported for moderation" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reporting comment", error });
  }
};

// Toggle pin/unpin comment
exports.togglePinComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId).populate("post");
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await Post.findById(comment.post._id).populate({
      path: "community",
      populate: "owner moderators.user",
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isPostAuthor = post.author.equals(userId);
    const isCommunityContentAdmin =
      post.community &&
      (await userIsContentAdminOrOwner(post.community._id, userId));

    if (!isPostAuthor && !isCommunityContentAdmin) {
      return res.status(403).json({ message: "Unauthorized to pin comments" });
    }

    if (!comment.isPinned) {
      await Comment.updateMany(
        { post: post._id, isPinned: true },
        { $set: { isPinned: false } }
      );
    }

    comment.isPinned = !comment.isPinned;
    await comment.save();

    const io = getIo();
    io.emit("commentPinned", { commentId, isPinned: comment.isPinned });

    res.status(200).json({
      message: comment.isPinned
        ? "Comment pinned successfully"
        : "Comment unpinned",
      comment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error toggling comment pin", error });
  }
};

exports.userRoleInCommunity = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }

    const post = await Post.findById(postId).select("community");
    if (!post || !post.community) {
      return res
        .status(404)
        .json({ message: "Post or its community not found" });
    }

    const community = await Community.findById(post.community)
      .populate("owner moderators.user")
      .select("owner moderators");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.owner.equals(userId)) {
      return res.status(200).json({ role: "creator" });
    }

    const mod = community.moderators.find(
      (m) => m.user && m.user._id.equals(userId) && m.role === "content-admin"
    );
    if (mod) {
      return res.status(200).json({ role: "content-admin" });
    }

    // Default fallback
    return res.status(200).json({ role: null });
  } catch (err) {
    console.error("Error determining user role:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users by query for mentions in comments autocomplete
exports.searchUsersForMention = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query || query.trim() === "") {
      return res.json([]);
    }

    // Case-insensitive partial match on username or name
    const regex = new RegExp(query, "i");
    const users = await require("../models/userModel").find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select("username name picture") // minimal fields needed for mention UI
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searching users for mention:", error);
    res.status(500).json({ message: "Server error" });
  }
};
