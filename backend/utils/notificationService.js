const Notification = require("../models/Notification");
const { getIo } = require("../utils/websocket");

class NotificationService {
  static async createAndSendNotification(data) {
    try {
      const recipients = data.recipients.map((userId) => ({
        user: userId,
        read: false,
        readAt: null,
      }));

      const notification = new Notification({
        title: data.title,
        message: data.message,
        sender: data.senderId,
        senderModel: data.senderModel,
        community: data.communityId || null,
        recipients,
        type: data.type || "community",
        priority: data.priority || "normal",
        meta: data.meta || {},
        broadCastType: data.broadCastType || null,
      });

      const savedNotification = await notification.save();
      let populatedNotification;
      if (savedNotification.senderModel !== "System") {
        populatedNotification = await Notification.findById(
          savedNotification._id
        ).populate("sender", "name picture");
      } else {
        populatedNotification = await Notification.findById(
          savedNotification._id
        );
      }

      const io = getIo();

      if (populatedNotification?.community) {
        io.to(populatedNotification.community.toString()).emit(
          "newNotification",
          populatedNotification
        );
      } else if (Array.isArray(populatedNotification.recipients)) {
        populatedNotification.recipients.forEach(({ user }) => {
          io.to(user?.toString?.()).emit(
            "newNotification",
            populatedNotification
          );
        });
      }

      // console.log("Notification payload:", populatedNotification);
      return populatedNotification;
    } catch (error) {
      console.error("Notification Creation Error:", error);
      throw error;
    }
  }

  static async getUnreadNotifications(userId) {
    try {
      // Fetch all unread notifications for the user
      let unreadNotifications = await Notification.find({
        recipients: {
          $elemMatch: { user: userId, read: false },
        },
      })
        .populate("community")
        .sort({ createdAt: -1 });

      // Separate notifications by senderModel
      const toPopulate = unreadNotifications.filter(
        (n) => n.senderModel !== "System"
      );
      const toLeave = unreadNotifications.filter(
        (n) => n.senderModel === "System"
      );

      // Populate sender only for non-system notifications
      await Notification.populate(toPopulate, {
        path: "sender",
        select: "name picture",
      });

      // Merge the arrays back in the original order
      const merged = [];
      for (const n of unreadNotifications) {
        if (n.senderModel === "System") {
          merged.push(toLeave.shift());
        } else {
          merged.push(toPopulate.shift());
        }
      }

      return merged;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId, userId) {
    try {
      const updatedNotification = await Notification.updateOne(
        {
          _id: notificationId,
          "recipients.user": userId,
        },
        {
          $set: {
            "recipients.$.read": true,
            "recipients.$.readAt": new Date(),
          },
        },
        { new: true }
      );

      if (!updatedNotification) {
        throw new Error("Notification not found or already read");
      }

      // After marking read, calculate updated unread count
      const unreadCount = await Notification.countDocuments({
        recipients: { $elemMatch: { user: userId, read: false } },
      });

      // Emit updated unread count via socket to the user
      const io = getIo();
      io.to(userId.toString()).emit("notification:read", unreadCount);

      console.log("Notification marked as read:", updatedNotification, "Unread count:", unreadCount);
      return updatedNotification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
