const NotificationService = require("../utils/notificationService");
const Notification = require("../models/Notification");
const User = require("../models/userModel");

class SystemNotificationController {
  // Send system notification (Admin only)
  // Send system notification (Admin only)
  static async sendSystemNotification(req, res) {
    try {
      const { title, message, recipients, priority, broadcast } = req.body;
      const senderId = req.adminId;

      console.log("Received system notification request body:", req.body);
      console.log("Extracted senderId from req.adminId:", senderId);

      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }

      let finalRecipients = [];

      if (broadcast) {
        console.log("Broadcast mode enabled. Fetching all users...");

        const allUsers = await User.find({}, "_id");
        finalRecipients = allUsers.map(u => u._id);

        console.log(`Broadcasting to ${finalRecipients.length} users`);

      } else {
        if (!Array.isArray(recipients) || recipients.length === 0) {
          return res.status(400).json({ message: "Recipients array is required unless broadcast is true" });
        }
        finalRecipients = recipients;
      }

      // --- Batching Logic ---
      const BATCH_SIZE = 500; // adjust if needed
      const batches = [];
      for (let i = 0; i < finalRecipients.length; i += BATCH_SIZE) {
        batches.push(finalRecipients.slice(i, i + BATCH_SIZE));
      }

      console.log(`Total batches: ${batches.length}`);

      const results = [];
      for (const batch of batches) {
        const notification = await NotificationService.createAndSendNotification({
          title,
          message,
          senderId,
          senderModel: "Admin",
          recipients: batch,
          type: "system",
          priority: priority || "high",
        });
        results.push(notification);
      }

      res.status(200).json({
        message: broadcast
          ? `System notification broadcasted to ${finalRecipients.length} users in ${batches.length} batches`
          : "System notification sent successfully",
        notifications: results,
      });

    } catch (error) {
      console.error("Error sending system notification:", error);
      res.status(500).json({
        message: "Error sending system notification",
        error: error.message,
      });
    }
  }

  // Get system notifications for a user (paginated)
  static async getSystemNotifications(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const query = {
        "recipients.user": userId,
        type: "system",
      };

      const notifications = await Notification.find(query)
        .populate("sender")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      res.status(200).json({
        message: "System notifications retrieved successfully",
        notifications,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching system notifications",
        error: error.message,
      });
    }
  }

  // Get unread system notifications for a user
  static async getUnreadSystemNotifications(req, res) {
    try {
      const userId = req.userId;
      const unreadNotifications = await Notification.find({
        "recipients.user": userId,
        "recipients.read": false,
        type: "system",
      })
        .populate("sender")
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "Unread system notifications retrieved successfully",
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

  // Mark system notification as read for a specific user
  static async markSystemNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.userId;

      const updatedNotification =
        await NotificationService.markNotificationAsRead(
          notificationId,
          userId
        );

      if (!updatedNotification) {
        return res
          .status(404)
          .json({ message: "Notification not found or already read" });
      }

      res.status(200).json({
        message: "System notification marked as read",
        notification: updatedNotification,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        message: "Error marking notification as read",
        error: error.message,
      });
    }
  }

  // Delete system notification (Admin only)
  static async deleteSystemNotification(req, res) {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      await Notification.deleteOne({ _id: notificationId });

      res.status(200).json({
        message: "System notification deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        message: "Error deleting notification",
        error: error.message,
      });
    }
  }

  // Get system notification by ID
  static async getSystemNotificationById(req, res) {
    try {
      const notification = await Notification.findById(
        req.params.notificationId
      ).populate("sender");

      if (!notification) {
        return res
          .status(404)
          .json({ message: "System notification not found" });
      }

      res.status(200).json({ notification });
    } catch (error) {
      console.error("Error fetching system notification by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Mark all notifications as read for a user (Bulk Read)
  static async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.userId;

      const result = await Notification.updateMany(
        { "recipients.user": userId, "recipients.read": false },
        { $set: { "recipients.$[elem].read": true } },
        { arrayFilters: [{ "elem.user": userId }], multi: true }
      );

      res.status(200).json({
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        message: "Error marking notifications as read",
        error: error.message,
      });
    }
  }

  // Delete all notifications for a user (Bulk Delete)
  static async deleteAllNotifications(req, res) {
    try {
      const userId = req.userId;

      // Remove user from recipients in all notifications
      const pullResult = await Notification.updateMany(
        { "recipients.user": userId },
        { $pull: { recipients: { user: userId } } },
        { multi: true }
      );

      // Delete notifications with no remaining recipients
      const deleteResult = await Notification.deleteMany({
        recipients: { $size: 0 },
      });

      res.status(200).json({
        message: "All notifications deleted for user",
        userRemovedFrom: pullResult.modifiedCount,
        notificationsDeleted: deleteResult.deletedCount,
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      res.status(500).json({
        message: "Error deleting notifications",
        error: error.message,
      });
    }
  }

  // Delete a single notification for a user (Single Delete)
  static async deleteNotification(req, res) {
    try {
      const userId = req.userId;
      const { notificationId } = req.params;

      // Remove the user from the recipients array of the notification
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { $pull: { recipients: { user: userId } } },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // If there are no recipients left, delete the notification document itself
      if (notification.recipients.length === 0) {
        await Notification.deleteOne({ _id: notificationId });
        return res
          .status(200)
          .json({ message: "Notification deleted completely" });
      }

      return res.status(200).json({ message: "Notification deleted for user" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        message: "Error deleting notification",
        error: error.message,
      });
    }
  }
}

module.exports = SystemNotificationController;
