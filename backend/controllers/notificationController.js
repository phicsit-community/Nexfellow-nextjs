const NotificationService = require("../utils/notificationService");
const UserDeviceToken = require("../models/UserDeviceToken");
const Community = require("../models/communityModel");
const Notification = require("../models/Notification");

function isOwnerOrEventAdmin(community, userId) {
  const isOwner = community.owner?.toString() === userId.toString();
  const modEntry = (community.moderators || []).find(
    (mod) => mod.user?.toString() === userId.toString()
  );
  const isEventAdmin = modEntry && modEntry.role === "event-admin";
  return isOwner || isEventAdmin;
}
class NotificationController {
  // Register device token
  static async registerDeviceToken(req, res) {
    try {
      const { token, platform } = req.body;
      const userId = req.userId;

      const deviceToken = await UserDeviceToken.registerToken(
        userId,
        token,
        platform
      );

      res.status(200).json({
        message: "Device token registered successfully",
        token: deviceToken,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error registering device token",
        error: error.message,
      });
    }
  }

  // Send community notification
  static async sendCommunityNotification(req, res) {
    try {
      const { communityId } = req.params;
      const { title, message, priority, recipients, type, broadCastType } =
        req.body;
      const senderId = req.userId;
      console.log(req.body);
      // Validate community and sender permissions
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      if (!isOwnerOrEventAdmin(community, senderId)) {
        return res.status(403).json({
          message: "Not authorized to send notifications",
        });
      }

      // Create and send notification
      const notification = await NotificationService.createAndSendNotification({
        title,
        message,
        senderId,
        senderModel: "User",
        communityId,
        recipients,
        type: type ? type : "community",
        priority,
        broadCastType: broadCastType ? broadCastType : null,
      });

      res.status(200).json({
        message: "Notification sent successfully",
        notification,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error sending notification",
        error: error.message,
      });
    }
  }

  static async getUserNotifications(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 20; // Default 20 notifications per page

      // Get user's communities
      const communities = await Community.find({ members: userId }).select(
        "_id"
      );
      const communityIds = communities.map((comm) => comm._id);

      const query = {
        $and: [
          {
            $or: [
              { recipients: { $elemMatch: { user: userId } } },
              { community: { $in: communityIds }, "recipients.user": userId },
            ],
          },
          { type: { $ne: "system" } },
        ],
      };

      // Fetch paginated notifications
      let notifications = await Notification.find(query)
        .populate("community")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Only populate sender for non-system notifications
      const toPopulate = notifications.filter(
        (n) => n.senderModel !== "System"
      );
      await Notification.populate(toPopulate, {
        path: "sender",
        select: "name picture",
      });

      // Total count for pagination info
      const total = await Notification.countDocuments(query);

      res.status(200).json({
        message: "User notifications retrieved successfully",
        notifications,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching notifications",
        error: error.message,
      });
    }
  }

  static async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.userId;

      const updatedNotification =
        await NotificationService.markNotificationAsRead(
          notificationId,
          userId
        );

      if (!updatedNotification) {
        return res.status(404).json({
          message: "Notification not found or already read",
        });
      }

      res.status(200).json({
        message: "Notification marked as read",
        notification: updatedNotification,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error marking notification as read",
        error: error.message,
      });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      const notification = await NotificationService.getNotificationById(
        notificationId
      );

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      const result = await NotificationService.deleteNotification(
        notificationId
      );

      if (result) {
        return res.status(200).json({
          message: "Notification deleted successfully",
        });
      }

      return res.status(500).json({
        message: "Error deleting notification",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting notification",
        error: error.message,
      });
    }
  }

  static async getNotificationsByCommunity(req, res) {
    try {
      const { communityId } = req.params;
      const userId = req.userId;

      // Validate community existence
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      if (!isOwnerOrEventAdmin(community, userId)) {
        return res.status(403).json({
          message: "Not authorized to view community notifications",
        });
      }

      // Fetch all notifications sent in this community
      let notifications = await Notification.find({ community: communityId })
        .sort({ createdAt: -1 })
        .lean();

      // Only populate sender for non-system notifications
      const toPopulate = notifications.filter(
        (n) => n.senderModel !== "System"
      );
      await Notification.populate(toPopulate, {
        path: "sender",
        select: "name picture",
      });

      res.status(200).json({
        message: "Community notifications retrieved successfully",
        notifications,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching community notifications",
        error: error.message,
      });
    }
  }

  static async getBroadcastNotificationsActivity(req, res) {
    // it will show how many total recipents, and between them how many total users read the notification for that existing community, (only for community creators)
    try {
      const userId = req.userId;
      const communityId = req.params.communityId;
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const notifications = await Notification.find({
        community: communityId,
      });
      // Calculate total number of recipients across all notifications
      let totalRecipients = 0;
      let totalRead = 0;
      notifications.forEach((notification) => {
        if (Array.isArray(notification.recipients)) {
          totalRecipients += notification.recipients.length;
          totalRead += notification.recipients.filter(
            (recipient) => recipient.read
          ).length;
        }
      });
      const totalUnread = totalRecipients - totalRead;
      res.status(200).json({
        message: "Broadcast notifications activity retrieved successfully",
        totalRecipients,
        totalRead,
        totalUnread,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching broadcast notifications activity",
        error: error.message,
      });
    }
  }

  // Get unread notifications for a user
  static async getUnreadNotifications(req, res) {
    try {
      const userId = req.userId;

      const unreadNotifications =
        await NotificationService.getUnreadNotifications(userId);

      res.status(200).json({
        message: "Unread notifications retrieved successfully",
        count: unreadNotifications.length,
        notifications: unreadNotifications,
      });
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({
        message: "Error fetching unread notifications",
        error: error.message,
      });
    }
  }

  static async getNotificationById(req, res) {
    try {
      const notification = await Notification.findById(
        req.params.notificationId
      ).populate("community");

      let populatedNotification = notification;
      if (notification && notification.senderModel !== "System") {
        populatedNotification = await Notification.populate(notification, {
          path: "sender",
          select: "name picture",
        });
      }

      if (!populatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.status(200).json({ notification: populatedNotification });
    } catch (error) {
      console.error("Error fetching notification by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = NotificationController;
