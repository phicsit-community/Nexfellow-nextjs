const Message = require("../models/messageModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const Community = require("../models/communityModel");
const { getIo } = require("../utils/websocket");
const NotificationService = require("../utils/notificationService");

// helper: convert [{emoji, users:[]}] -> { emoji: count, ... }
const toCountMap = (reactionsArray = []) => {
  const map = {};
  reactionsArray.forEach((r) => {
    if (!r || !r.emoji) return;
    map[r.emoji] = (r.users?.length || 0);
  });
  return map;
};

// --- Send a message; fully populate replyTo for socket and REST ---
const sendMessage = async (req, res) => {
  try {
    const { communityId, content, replyTo, mentions } = req.body;
    const author = req.userId;

    const community = await Community.findById(communityId).populate("owner", "username");
    if (!community) return res.status(404).json({ message: "Community not found" });

    const message = new Message({
      author,
      content,
      community: communityId,
      replyTo: replyTo || null,
      mentions: mentions || [],
      reactions: [], // start empty
    });
    await message.save();

    let populatedMessage = await Message.findById(message._id)
      .populate({
        path: "author",
        select: "name picture username _id profile",
        populate: { path: "profile", select: "profilePhoto" },
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "author",
          select: "name username picture profile",
          populate: { path: "profile", select: "profilePhoto" },
        },
      })
      .populate("mentions", "name username picture isCommunityAccount")
      .lean();

    // normalize reactions to count map for client
    populatedMessage.reactions = toCountMap(populatedMessage.reactions);

    const io = getIo();
    io.to(communityId).emit("community:newMessage", populatedMessage);

    const communityOwnerUsername = community.owner?.username || "unknown";
    const messageLink = `${process.env.SITE_URL}/community/${communityOwnerUsername}?messageId=${message._id}`;

    if (replyTo) {
      const repliedMessage = await Message.findById(replyTo).populate("author");
      if (repliedMessage && repliedMessage.author && !repliedMessage.author._id.equals(author)) {
        await NotificationService.createAndSendNotification({
          title: "Message reply",
          message: `${populatedMessage.author.username} replied to your message: "${content.substring(0, 50)}". <a href="${messageLink}" target="_blank" style="color: #007bff; text-decoration: underline;">View Reply</a>`,
          senderId: author,
          senderModel: "User",
          recipients: [repliedMessage.author._id],
          communityId,
          type: "system",
          priority: "normal",
        });
      }
    }

    if (mentions && mentions.length > 0) {
      const uniqueMentions = [...new Set(mentions.map(String))].filter((id) => id !== String(author));
      if (uniqueMentions.length > 0) {
        await NotificationService.createAndSendNotification({
          title: "Mentioned in a message",
          message: `${populatedMessage.author.username} mentioned you: "${content.substring(0, 50)}". <a href="${messageLink}" target="_blank" style="color: #007bff; text-decoration: underline;">View Mention</a>`,
          senderId: author,
          senderModel: "User",
          recipients: uniqueMentions,
          communityId,
          type: "system",
          priority: "normal",
        });
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET all messages, reactions normalized as count map ---
const getMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const raw = await Message.find({ community: communityId })
      .populate({
        path: "author",
        select: "name picture username _id profile",
        populate: {
          path: "profile",
          select: "profilePhoto",
        },
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "author",
          select: "name username picture profile",
          populate: { path: "profile", select: "profilePhoto" },
        },
      })
      .populate("mentions", "name username picture isCommunityAccount")
      .sort({ createdAt: 1 })
      .lean();

    const messages = raw.map((m) => ({
      ...m,
      reactions: toCountMap(m.reactions),
    }));

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Update message content (keep reactions untouched), normalize reactions in response ---
const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.content = content;
    await message.save();

    let populatedMessage = await Message.findById(message._id)
      .populate({
        path: "author",
        select: "name picture username _id profile",
        populate: { path: "profile", select: "profilePhoto" },
      })
      .populate({
        path: "replyTo",
        populate: {
          path: "author",
          select: "name username picture profile",
          populate: { path: "profile", select: "profilePhoto" },
        },
      })
      .populate("mentions", "name username picture isCommunityAccount")
      .lean();

    populatedMessage.reactions = toCountMap(populatedMessage.reactions);

    const io = getIo();
    io.to(message.community.toString()).emit("community:updatedMessage", populatedMessage);

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Toggle reaction on message and broadcast counts ---
const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ message: "Invalid emoji" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // find reaction bucket
    const idx = (message.reactions || []).findIndex((r) => r.emoji === emoji);
    if (idx === -1) {
      message.reactions.push({ emoji, users: [userId] });
    } else {
      const users = message.reactions[idx].users.map(String);
      const has = users.includes(String(userId));
      if (has) {
        // remove user
        message.reactions[idx].users = message.reactions[idx].users.filter(
          (u) => String(u) !== String(userId)
        );
        // cleanup empty
        if (message.reactions[idx].users.length === 0) {
          message.reactions.splice(idx, 1);
        }
      } else {
        message.reactions[idx].users.push(userId);
      }
    }

    await message.save();

    const countMap = {};
    (message.reactions || []).forEach((r) => {
      countMap[r.emoji] = r.users.length;
    });

    const io = getIo();
    io
      .to(message.community.toString())
      .emit("community:reactedMessage", { messageId: message._id.toString(), emoji, countMap });

    res.json({ messageId: message._id.toString(), emoji, countMap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Delete message remains unchanged ---
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const community = await Community.findById(message.community);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const allowedRoles = ["moderator", "creator"];
    const isModerator = (community.moderators || []).some(
      (mod) =>
        (mod.user?.toString?.() ?? mod.user) === userId &&
        allowedRoles.includes(mod.role)
    );
    const isOwner = community.owner.toString() === userId;
    const isAuthor = message.author.toString() === userId;

    if (!(isAuthor || isModerator || isOwner)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();

    const io = getIo();
    io.to(message.community.toString()).emit("community:deletedMessage", messageId);

    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Message heatmap unchanged ---
const getMessageHeatmapData = async (req, res) => {
  try {
    const { communityId } = req.params;
    const messages = await Message.aggregate([
      { $match: { community: new mongoose.Types.ObjectId(communityId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Full year range
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date(new Date().getFullYear(), 11, 31);
    const allDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      allDates.push(dateString);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Merge
    const heatmapData = allDates.map((date) => {
      const message = messages.find((msg) => msg._id === date);
      return {
        date,
        count: message ? message.count : 0,
      };
    });

    res.status(200).json(heatmapData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query || query.trim() === "") {
      return res.json([]);
    }

    // Case-insensitive partial match on username or name
    const regex = new RegExp(query, "i");

    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select("username name picture")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  updateMessage,
  getMessageHeatmapData,
  searchUsers,
  reactToMessage,
};
