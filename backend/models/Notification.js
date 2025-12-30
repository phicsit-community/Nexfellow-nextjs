const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Admin", "System"], // 'System' allowed for system notifications
    },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    recipients: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
      },
    ],
    type: {
      type: String,
      enum: ["community", "direct", "system", "milestone", "broadcast"],
      default: "community",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    meta: { type: Object, default: {} },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    broadCastType: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
NotificationSchema.index({
  "recipients.user": 1,
  community: 1,
  createdAt: -1,
});

// Static method to mark notification as read for a specific user
NotificationSchema.statics.markAsRead = async function (
  notificationId,
  userId
) {
  return this.findOneAndUpdate(
    {
      _id: notificationId,
      "recipients.user": userId,
    },
    {
      $set: { "recipients.$.read": true, "recipients.$.readAt": new Date() },
    },
    { new: true }
  );
};

// Static method to get unread notifications for a user
NotificationSchema.statics.getUnreadNotifications = async function (
  userId,
  communityIds
) {
  // Fetch all unread notifications
  let notifications = await this.find({
    "recipients.user": userId,
    "recipients.read": false,
    community: { $in: communityIds },
  })
    .populate("community", "name")
    .sort({ createdAt: -1 });

  // Only populate sender for non-system notifications
  const toPopulate = notifications.filter((n) => n.senderModel !== "System");
  await this.populate(toPopulate, { path: "sender", select: "name" });

  return notifications;
};

module.exports = mongoose.model("Notification", NotificationSchema);
