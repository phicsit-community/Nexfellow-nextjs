// controllers/inboxController.js
const Conversation = require("../models/conversationModel");
const DirectMessage = require("../models/directMessageModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");
const mongoose = require("mongoose");
const { getIo } = require("../utils/websocket");
const NotificationService = require("../utils/notificationService");

// Helpers
const str = (v) => (v != null ? String(v) : v);
const isParticipant = (participants, userId) => participants.map(str).includes(str(userId));
const buildSocketConversation = (conv) => ({
  _id: str(conv._id),
  participants: conv.participants.map(str),
  status: conv.status,
  lastUpdatedAt: conv.lastUpdatedAt,
  createdAt: conv.createdAt,
});

// Build compact user + community shape
const compactUserWithCommunity = (u) => {
  const o = u?.toObject ? u.toObject() : u;
  const community = o?.createdCommunity;
  let communityCompact = null;

  if (o?.isCommunityAccount && community && typeof community === "object") {
    communityCompact = {
      _id: community._id,
      link: community.link || null,
      description: community.description || null,
      category: Array.isArray(community.category) ? community.category : [],
      accountType: community.accountType || "Individual",
      isPrivate: !!community.isPrivate,
      isApproved: !!community.isApproved,
      dateCreated: community.dateCreated || community.createdAt || null,
      bookmarkCounter: typeof community.bookmarkCounter === "number" ? community.bookmarkCounter : 0,
      stats: {
        members: Array.isArray(community.members) ? community.members.length : 0,
        posts: Array.isArray(community.posts) ? community.posts.length : 0,
        events: Array.isArray(community.events) ? community.events.length : 0,
        challenges: Array.isArray(community.challenges) ? community.challenges.length : 0,
        quiz: Array.isArray(community.quiz) ? community.quiz.length : 0,
        moderators: Array.isArray(community.moderators) ? community.moderators.length : 0,
        topMembers: Array.isArray(community.topMembers) ? community.topMembers.length : 0,
        appraisals: Array.isArray(community.appraisals) ? community.appraisals.length : 0,
        pageViews: Array.isArray(community.pageViews) ? community.pageViews.length : 0,
      },
    };
  }

  return {
    _id: o._id,
    name: o.name,
    username: o.username,
    picture: o.picture,
    banner: o.banner,
    verified: !!o.verified || o.verificationBadge === true,
    verificationBadge: !!o.verificationBadge,
    communityBadge: !!o.communityBadge,
    premiumBadge: !!o.premiumBadge,
    isCommunityAccount: !!o.isCommunityAccount,
    country: o.country,
    themePreference: o.themePreference,
    followersCount: Array.isArray(o.followers) ? o.followers.length : 0,
    followingCount: Array.isArray(o.following) ? o.following.length : 0,
    joinedAt: o.createdAt,
    hasCommunity: !!community,
    community: communityCompact,
  };
};

// Get all conversations for a user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId,
      $or: [{ status: { $ne: "pending" } }, { requestSentBy: userId }],
    })
      .populate({
        path: "participants",
        select:
          "name username picture banner verified verificationBadge premiumBadge communityBadge " +
          "isCommunityAccount createdCommunity country themePreference privacySettings followers following createdAt",
        populate: [
          {
            path: "createdCommunity",
            model: "Community",
            select:
              "link description category accountType isPrivate isApproved dateCreated bookmarkCounter " +
              "members posts events challenges quiz moderators topMembers appraisals pageViews",
          },
        ],
      })
      .populate({
        path: "lastMessage",
        select: "content sender isRead createdAt",
      })
      .sort({ lastUpdatedAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      const otherDoc = conv.participants.find((p) => str(p._id) !== str(userId));
      const otherUser = compactUserWithCommunity(otherDoc);
      const isReadByUser = conv.isRead.get(str(userId)) !== false;

      return {
        _id: conv._id,
        otherUser,
        lastMessage: conv.lastMessage,
        status: conv.status,
        blockedBy: conv.blockedBy || null,
        requestSentBy: conv.requestSentBy ? str(conv.requestSentBy) : null,
        isRead: isReadByUser,
        lastUpdatedAt: conv.lastUpdatedAt,
        createdAt: conv.createdAt,
      };
    });

    res.status(200).json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res
      .status(500)
      .json({ message: "Error fetching conversations", error: error.message });
  }
};

// Get pending message requests for a user
exports.getMessageRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await Conversation.find({
      participants: userId,
      status: "pending",
      requestSentBy: { $ne: userId },
    })
      .populate({
        path: "participants",
        select:
          "name username picture banner verified verificationBadge communityBadge " +
          "isCommunityAccount createdCommunity country themePreference privacySettings followers following createdAt",
        populate: [
          {
            path: "createdCommunity",
            model: "Community",
            select:
              "link description category accountType isPrivate isApproved dateCreated bookmarkCounter " +
              "members posts events challenges quiz moderators topMembers appraisals pageViews",
          },
        ],
      })
      .populate({
        path: "lastMessage",
        select: "content sender isRead createdAt",
      })
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map((doc) => {
      const requesterDoc = doc.participants.find((p) => str(p._id) !== str(req.userId));
      const requester = compactUserWithCommunity(requesterDoc);

      return {
        _id: doc._id,
        requester,
        lastMessage: doc.lastMessage,
        createdAt: doc.createdAt,
      };
    });

    res.status(200).json({ requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching message requests:", error);
    res.status(500).json({
      message: "Error fetching message requests",
      error: error.message,
    });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isParticipant(conversation.participants, userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this conversation" });
    }

    const messages = await DirectMessage.find({
      conversation: conversationId,
      deletedFor: { $ne: userId },
    })
      .populate({
        path: "sender",
        select:
          "name username picture banner verified verificationBadge communityBadge " +
          "isCommunityAccount createdCommunity country themePreference",
        populate: [
          {
            path: "createdCommunity",
            model: "Community",
            select:
              "link description category accountType isPrivate isApproved dateCreated bookmarkCounter " +
              "members posts events challenges quiz moderators topMembers appraisals pageViews",
          },
        ],
      })
      .sort({ createdAt: 1 });

    conversation.isRead.set(str(userId), true);
    await conversation.save();

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// Send a message (or create a conversation if it doesn't exist)
exports.sendMessage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientId, content } = req.body;
    const senderId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }
    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.privacySettings?.allowDirectMessages === false) {
      return res
        .status(403)
        .json({ message: "This user does not accept direct messages" });
    }

    // blocked checks (durable)
    if (recipient.blockedUsers && recipient.blockedUsers.map(str).includes(str(senderId))) {
      return res
        .status(403)
        .json({ message: "Cannot send message to this user" });
    }
    const sender = await User.findById(senderId);
    if (sender.blockedUsers && sender.blockedUsers.map(str).includes(str(recipientId))) {
      return res.status(403).json({ message: "You have blocked this user" });
    }

    // existing conversation?
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 },
    }).session(session);

    const isNewConversation = !conversation;

    if (isNewConversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        requestSentBy: senderId,
        status: "pending",
        isRead: new Map([
          [str(recipientId), false],
          [str(senderId), true],
        ]),
      });
    } else {
      // Allow resending if previous request was rejected AND the current sender is the original requester.
      // If conversation was rejected but sender is the person who originally sent the request, treat this as a resend.
      if (conversation.status === "rejected") {
        if (str(conversation.requestSentBy) === str(senderId)) {
          // reset to pending so recipient receives a new message request
          conversation.status = "pending";
          // mark recipient as unread, sender as read
          conversation.isRead.set(str(recipientId), false);
          conversation.isRead.set(str(senderId), true);
          conversation.requestSentBy = senderId;
        } else {
          // other participant (the rejecter) cannot send when status is 'rejected'
          return res
            .status(403)
            .json({ message: "This user has rejected your message request" });
        }
      } else if (conversation.status === "blocked") {
        return res
          .status(403)
          .json({ message: "This conversation has been blocked" });
      } else if (conversation.status === "pending") {
        // leave as-is (message will be added to pending request)
      }
    }

    const message = new DirectMessage({
      sender: senderId,
      conversation: conversation._id,
      content,
      isRead: false,
    });

    await message.save({ session });

    conversation.lastMessage = message._id;
    conversation.lastUpdatedAt = new Date();
    conversation.isRead.set(str(recipientId), false);
    conversation.isRead.set(str(senderId), true);
    await conversation.save({ session });

    await session.commitTransaction();

    // Populate sender for response
    const populatedMessage = await DirectMessage.findById(message._id).populate({
      path: "sender",
      select:
        "name username picture banner verified verificationBadge communityBadge " +
        "isCommunityAccount createdCommunity country themePreference",
      populate: [
        {
          path: "createdCommunity",
          model: "Community",
          select:
            "link description category accountType isPrivate isApproved dateCreated bookmarkCounter " +
            "members posts events challenges quiz moderators topMembers appraisals pageViews",
        },
      ],
    });

    const leanConversation = await Conversation.findById(conversation._id)
      .select("_id participants status lastUpdatedAt createdAt")
      .lean();

    const socketConversation = {
      ...buildSocketConversation(leanConversation),
      isNewConversation,
    };

    const io = getIo();
    const eventData = {
      message: populatedMessage,
      conversation: socketConversation,
    };

    [recipientId, senderId].forEach((uid) => {
      io.to(str(uid)).emit("dm:newMessage", eventData);
    });

    if (isNewConversation) {
      io.to(str(recipientId)).emit("newMessageRequest", {
        _id: conversation._id,
        participants: conversation.participants,
        status: conversation.status,
        requestSentBy: conversation.requestSentBy ? str(conversation.requestSentBy) : null,
        lastUpdatedAt: conversation.lastUpdatedAt,
        createdAt: conversation.createdAt,
      });

      await NotificationService.createAndSendNotification({
        title: "New Message Request",
        message: `${sender.name} wants to start a conversation with you.`,
        senderId: senderId,
        senderModel: "User",
        recipients: [recipientId],
        type: "system",
        priority: "normal",
      });
    } else if (conversation.status === "accepted") {
      await NotificationService.createAndSendNotification({
        title: "New Message",
        message: `${sender.name} sent you a message: "${content.length > 30 ? content.substring(0, 30) + "..." : content}"`,
        senderId: senderId,
        senderModel: "User",
        recipients: [recipientId],
        type: "system",
        priority: "normal",
      });
    }

    res.status(201).json({
      message: populatedMessage,
      conversation: {
        _id: conversation._id,
        status: conversation.status,
        isNewConversation,
        requestSentBy: conversation.requestSentBy ? str(conversation.requestSentBy) : null,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  } finally {
    session.endSession();
  }
};

// Handle message request (accept or reject or block)
exports.handleMessageRequest = async (req, res) => {
  try {
    const { conversationId, action } = req.body;
    const userId = req.userId;

    if (!["accept", "reject", "block"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Invalid action. Must be accept, reject, or block" });
    }

    const conversation = await Conversation.findById(conversationId).populate({
      path: "participants",
      select: "name username picture verified",
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => str(p._id) === str(userId))) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this conversation" });
    }

    if (
      conversation.status === "pending" &&
      str(conversation.requestSentBy) === str(userId)
    ) {
      return res
        .status(400)
        .json({ message: "Cannot handle your own message request" });
    }

    const requester = conversation.participants.find((p) => str(p._id) !== str(userId));

    let status;
    if (action === "accept") status = "accepted";
    else if (action === "reject") status = "rejected";
    else if (action === "block") status = "blocked";

    // If blocking from this endpoint, remember previous state and who blocked
    if (action === "block") {
      if (conversation.status !== "blocked") {
        conversation.previousStatus = conversation.status;
      }
      conversation.status = "blocked";
      conversation.blockedBy = userId;
    } else {
      conversation.status = status;
      // If moving away from blocked in this flow (rare), clear blockers
      if (conversation.status !== "blocked") {
        conversation.blockedBy = null;
        conversation.previousStatus = null;
      }
    }

    await conversation.save();

    const leanConv = await Conversation.findById(conversationId)
      .select("_id participants status requestSentBy lastMessage lastUpdatedAt createdAt blockedBy previousStatus")
      .populate({ path: "lastMessage", select: "content sender isRead createdAt" })
      .lean();

    const io = getIo();
    const eventData = {
      conversationId,
      status: leanConv.status,
      updatedBy: userId,
      conversation: {
        _id: str(leanConv._id),
        participants: leanConv.participants.map(str),
        status: leanConv.status,
        requestSentBy: leanConv.requestSentBy ? str(leanConv.requestSentBy) : null,
        blockedBy: leanConv.blockedBy ? str(leanConv.blockedBy) : null,
        lastUpdatedAt: leanConv.lastUpdatedAt,
        createdAt: leanConv.createdAt,
        lastMessage: leanConv.lastMessage || null,
      },
    };

    for (const participant of conversation.participants) {
      io.to(str(participant._id)).emit("messageRequestUpdated", eventData);
    }

    if (action === "accept") {
      await NotificationService.createAndSendNotification({
        title: "Message Request Accepted",
        message: `${conversation.participants.find((p) => str(p._id) === str(userId)).name} accepted your message request. You can now chat with each other.`,
        senderId: userId,
        senderModel: "User",
        recipients: [requester._id],
        type: "system",
        priority: "normal",
      });
    }

    res.status(200).json({
      message: `Message request ${action}ed successfully`,
      conversation: { _id: conversation._id, status: conversation.status },
    });
  } catch (error) {
    console.error(`Error handling message request:`, error);
    res.status(500).json({
      message: "Error handling message request",
      error: error.message,
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isParticipant(conversation.participants, userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this conversation" });
    }

    const otherParticipant = conversation.participants.find((p) => str(p) !== str(userId));
    const otherParticipantId = new mongoose.Types.ObjectId(otherParticipant);

    await DirectMessage.updateMany(
      { conversation: conversationId, sender: otherParticipantId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    conversation.isRead.set(str(userId), true);
    await conversation.save();

    const io = getIo();
    const eventData = { conversationId, readBy: userId };
    for (const participant of conversation.participants) {
      io.to(str(participant)).emit("dm:messagesRead", eventData);
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};

// Delete a message (soft delete for the current user only)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await DirectMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isParticipant(conversation.participants, userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }

    if (!message.deletedFor.map(str).includes(str(userId))) {
      message.deletedFor.push(userId);
      await message.save();
    }

    if (str(conversation.lastMessage) === str(messageId)) {
      const previousMessage = await DirectMessage.findOne({
        conversation: conversation._id,
        deletedFor: { $ne: userId },
        _id: { $ne: messageId },
      }).sort({ createdAt: -1 });

      if (previousMessage) {
        conversation.lastMessage = previousMessage._id;
        await conversation.save();
      }
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
};

// Search users to start a new conversation
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

    const currentUser = await User.findById(userId).select("blockedUsers");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const blockedIds = currentUser.blockedUsers || [];
    const usersWhoBlockedMe = await User.find({ blockedUsers: userId }).select("_id");
    const blockedByIds = usersWhoBlockedMe.map((u) => u._id);
    const allBlockedIds = [...blockedIds, ...blockedByIds, userId];

    const users = await User.find({
      $and: [
        { _id: { $nin: allBlockedIds } },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select(
        "name username picture verified verificationBadge communityBadge " +
        "isCommunityAccount privacySettings createdCommunity"
      )
      .populate({
        path: "createdCommunity",
        model: "Community",
        select: "_id",
      })
      .limit(20);

    const filteredUsers = users.filter(
      (u) => !u.privacySettings || u.privacySettings.allowDirectMessages !== false
    );

    const usersWithConversationStatus = await Promise.all(
      filteredUsers.map(async (u) => {
        const existingConversation = await Conversation.findOne({
          participants: { $all: [userId, u._id], $size: 2 },
        }).select("_id status");

        return {
          _id: u._id,
          name: u.name,
          username: u.username,
          picture: u.picture,
          verified: !!u.verified || u.verificationBadge === true,
          isCommunityAccount: !!u.isCommunityAccount,
          verificationBadge: !!u.verificationBadge,
          communityBadge: !!u.communityBadge,
          hasCommunity: !!u.createdCommunity,
          conversationStatus: existingConversation ? existingConversation.status : null,
          conversationId: existingConversation ? existingConversation._id : null,
        };
      })
    );

    res.status(200).json({ users: usersWithConversationStatus });
  } catch (error) {
    console.error("Error searching users:", error);
    res
      .status(500)
      .json({ message: "Error searching users", error: error.message });
  }
};

// Delete a conversation (soft delete for current user)
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isParticipant(conversation.participants, userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this conversation" });
    }

    await DirectMessage.updateMany(
      { conversation: conversationId },
      { $addToSet: { deletedFor: userId } }
    );

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res
      .status(500)
      .json({ message: "Error deleting conversation", error: error.message });
  }
};

// POST /inbox/block
exports.blockUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetId } = req.body;

    console.log("[blockUser] request by:", userId, "target:", targetId);

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid target ID" });
    }

    // Always use `new` when constructing ObjectId instances
    const userObjId = new mongoose.Types.ObjectId(userId);
    const targetObjId = new mongoose.Types.ObjectId(targetId);

    // Idempotent, durable block list (store ObjectId)
    await User.updateOne(
      { _id: userObjId },
      { $addToSet: { blockedUsers: targetObjId } }
    );

    // Mark any existing 1:1 conversations as blocked and remember prior status
    const convs = await Conversation.find({
      participants: { $all: [userObjId, targetObjId], $size: 2 },
    });

    console.log(`[blockUser] found ${convs.length} conv(s) to update`);

    for (const conv of convs) {
      if (conv.status !== "blocked") {
        conv.previousStatus = conv.status || null;
      }
      conv.status = "blocked";
      conv.blockedBy = userObjId;
      conv.lastUpdatedAt = new Date();
      await conv.save();
    }

    // Socket notify both sides for inbox UI refresh
    const io = getIo();
    [userObjId.toString(), targetObjId.toString()].forEach((uid) =>
      io.to(uid).emit("dm:userBlocked", {
        by: userObjId.toString(),
        target: targetObjId.toString(),
      })
    );

    return res.status(200).json({ message: "User blocked" });
  } catch (err) {
    console.error("Error blocking user:", err);
    return res.status(500).json({ message: "Error blocking user", error: err.message });
  }
};

// POST /inbox/unblock
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetId } = req.body;

    console.log("[unblockUser] request by:", userId, "target:", targetId);

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid target ID" });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    const targetObjId = new mongoose.Types.ObjectId(targetId);

    // Remove from durable block list
    await User.updateOne(
      { _id: userObjId },
      { $pull: { blockedUsers: targetObjId } }
    );

    // Restore conversation state only if this user was the one who blocked it
    const convs = await Conversation.find({
      participants: { $all: [userObjId, targetObjId], $size: 2 },
      status: "blocked",
      blockedBy: userObjId,
    });

    console.log(`[unblockUser] found ${convs.length} conv(s) to restore`);

    for (const conv of convs) {
      // Restore prior non-blocked state or default to 'pending'
      const restored = conv.previousStatus || "pending";
      conv.status = restored;
      conv.blockedBy = null;
      conv.previousStatus = null;
      conv.lastUpdatedAt = new Date();
      await conv.save();
    }

    const io = getIo();
    [userObjId.toString(), targetObjId.toString()].forEach((uid) =>
      io.to(uid).emit("dm:userUnblocked", {
        by: userObjId.toString(),
        target: targetObjId.toString(),
      })
    );

    return res.status(200).json({ message: "User unblocked" });
  } catch (err) {
    console.error("Error unblocking user:", err);
    return res.status(500).json({ message: "Error unblocking user", error: err.message });
  }
};
