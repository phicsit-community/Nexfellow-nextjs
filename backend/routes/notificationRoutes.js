const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");
const { isClient, isCommunityCreator } = require("../middleware");

// Register device token
router.post(
  "/devices/register",
  isClient,
  NotificationController.registerDeviceToken
);

// Send community notification (moderators/owners only)
router.post(
  "/community/:communityId/send",
  isClient,
  isCommunityCreator,
  NotificationController.sendCommunityNotification
);

// Get broadcast notifications activity
router.get(
  "/community/:communityId/broadcast/activity",
  isClient,
  isCommunityCreator,
  NotificationController.getBroadcastNotificationsActivity
);

// Get user notifications
router.get("/", isClient, NotificationController.getUserNotifications);

// Mark single notification as read
router.patch(
  "/:notificationId/read",
  isClient,
  NotificationController.markNotificationAsRead
);

// Delete notification
router.delete(
  "/:notificationId",
  isClient,
  isCommunityCreator,
  NotificationController.deleteNotification
);

// Get notifications by community
router.get(
  "/community/:communityId/notifications",
  isClient,
  NotificationController.getNotificationsByCommunity
);

// Get unread notifications for a user
router.get("/unread", isClient, NotificationController.getUnreadNotifications);

router.get(
  "/:notificationId",
  isClient,
  NotificationController.getNotificationById
);

module.exports = router;
